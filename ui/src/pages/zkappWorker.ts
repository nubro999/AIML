import { Field, JsonProof, MerkleMap, MerkleMapWitness, Mina, PublicKey, SmartContract, State, Struct, ZkProgram, fetchAccount, method, state } from 'o1js';

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------



class MerkleMapUpdate extends Struct({
  key: Field,
  value: Field,
  witness: MerkleMapWitness,
}) {}


export const MerkleMapProgram = ZkProgram({
  name: 'MerkleMapProgram',
  publicInput: Field,
  publicOutput: Field,

  methods: {
    update: {
      privateInputs: [MerkleMapUpdate],

      async method(oldRoot: Field, update: MerkleMapUpdate) {
        const { key, value, witness } = update;

        // 증인이 올드 루트와 일치하는지 확인
        const [rootBefore, key0] = witness.computeRootAndKey(Field(0));
        rootBefore.assertEquals(oldRoot);
        key0.assertEquals(key);

        // 새 값으로 새 루트 계산
        const newRoot = witness.computeRootAndKey(value)[0];

        return newRoot;
      },
    },
  },
});


export let merkleProof_ = ZkProgram.Proof(MerkleMapProgram);
export class MerkleProof extends merkleProof_ {}

let merkleMap = new MerkleMap();

export class Item extends SmartContract {
  @state(Field) merkleMapRoot = State<Field>();
  @state(Field) endTime = State<Field>();
  @state(PublicKey) ItemOwner = State<PublicKey>();

  init() {
    super.init();
    this.merkleMapRoot.set(merkleMap.getRoot());
  }

  @method async checkNumber(number: Field){
    number.assertEquals(Field(10))
  }

  @method async setRoot(root: Field){
    this.merkleMapRoot.set(root)
  }

  @method async updateRoot(proof: MerkleProof) {
    // ZkProgram의 증명 검증
    proof.verify();

    // 현재 루트가 증명의 공개 입력과 일치하는지 확인
    const currentRoot = this.merkleMapRoot.get();
    this.merkleMapRoot.requireEquals(currentRoot);
    proof.publicInput.assertEquals(currentRoot);

    // 새 루트로 상태 업데이트
    this.merkleMapRoot.set(proof.publicOutput);
  }
}

const states = {
  Item: null as null | typeof Item,
  MerkleMapProgram: MerkleMapProgram,
  zkapp: null as null | Item,
  transaction: null as null | Transaction,
};



// ---------------------------------------------------------------------------------------

const functions = {
  setActiveInstanceToDevnet: async (args: {}) => {
    const Network = Mina.Network(
      'https://api.minascan.io/node/devnet/v1/graphql'
    );
    console.log('Devnet network instance configured.');
    Mina.setActiveInstance(Network);
  },
  loadContract: async (args: {}) => {
    states.Item = Item;
  },
  compileContract: async (args: {}) => {
    console.log('compiling...');
    await MerkleMapProgram.compile();
  
    if (states.Item) {

      await states.Item.compile();
      console.log('Item contract compiled successfully.');
    } else {
      console.error('Item contract is not loaded.');
    }
  },
  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },
  initZkappInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    states.zkapp = new states.Item!(publicKey);
  },
  getMerkleMapRoot: async (args: {}) => {
    const currentNum = await states.zkapp!.merkleMapRoot.get();
    const currentab = await states.zkapp!.endTime.get();
    const number10 = await states.zkapp!.checkNumber(Field(10));

    console.log("endtime" + currentab)

    console.log("number10" + number10)
    return JSON.stringify(currentNum.toJSON());
  },
  createUpdateRootTransaction: async (args: { proof: JsonProof }) => {

      console.log('Creating MerkleMap and initial state...');
      const map = new MerkleMap();

      // Set initial value
      const initialKey = Field(1);
      const initialValue = Field(0);
      map.set(initialKey, initialValue);

      const initialRoot = map.getRoot();
      console.log('Initial root:', initialRoot.toString());

      console.log('Generating witness for update...');
      const newValue = Field(20);
      const witness = map.getWitness(initialKey);

      console.log('Current value at key:', map.get(initialKey).toString());
      console.log('New value to set:', newValue.toString());

      console.log('Creating proof of update...');
      const _proof = await MerkleMapProgram.update(initialRoot, {
        key: initialKey,
        value: newValue,
        witness: witness
      });

      console.log('Proof Generated');

      console.log('transaction shot')
      const transaction = await Mina.transaction(async () => {
        states.zkapp!.updateRoot(_proof);
      });
      states.transaction = transaction;
      console.log('transaction complete: ' + transaction)

      await transaction.prove()

      const transactionJSON = await transaction.toJSON();
      
      return transactionJSON;

  },

  setRoot: async () => {
    const setRoot = await states.zkapp!.setRoot(Field(22731122946631793544306773678309960639073656601863129978322145324846701682624));
    
    const currentNum = await states.zkapp!.merkleMapRoot.get();
    return JSON.stringify(currentNum.toJSON());
  },

  proveUpdateRootTransaction: async (args: {}) => {
    await states.transaction!.prove();
  },
  getTransactionJSON: async (args: {}) => {
    return states.transaction!.toJSON();
  },
};

// ---------------------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type ZkappWorkerRequest = {
  id: number;
  fn: WorkerFunctions;
  args: any;
};

export type ZkappWorkerReponse = {
  id: number;
  data: any;
};

if (typeof window !== 'undefined') {
  addEventListener(
    'message',
    async (event: MessageEvent<ZkappWorkerRequest>) => {
      const returnData = await functions[event.data.fn](event.data.args);

      const message: ZkappWorkerReponse = {
        id: event.data.id,
        data: returnData,
      };
      postMessage(message);
    }
  );
}
