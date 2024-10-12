import { Field, JsonProof, MerkleMap, MerkleMapWitness, Mina, PublicKey, SmartContract, State, Struct, ZkProgram, fetchAccount, method, state } from 'o1js';

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

const map = new MerkleMap();
map.set(Field(1234), Field(1000))
map.set(Field(5678), Field(1500))  
map.set(Field(9101), Field(2000))  
map.set(Field(12345), Field(11234))  
map.set(Field(123456), Field(1123456)) // current 
map.set(Field(12), Field(12345)) // current 
map.set(Field(123), Field(15123)) // current 
map.set(Field(13), Field(12531)) // current 



class Bid extends Struct({
  key: Field,
  value: Field,
  witness: MerkleMapWitness,
}) {}

export const BiddingProgram = ZkProgram({
  name: 'BiddingProgram',
  publicInput: Field,
  publicOutput: Field,

  methods: {
    placeBid: {
      privateInputs: [Bid],

      async method(oldRoot: Field, bid: Bid) {
        const { key, value, witness } = bid;

        // Verify the old root
        const [computedRoot, computedKey] = witness.computeRootAndKeyV2(Field(0));
        computedRoot.assertEquals(oldRoot);

        // Compute the new root
        const [newRoot] = witness.computeRootAndKeyV2(value);

        // Optionally, you can add more constraints here
        // For example, ensure the bid value is positive
        value.assertGreaterThan(Field(0));

        return newRoot;
      },
    },
  },
});

export let biddingProof_ = ZkProgram.Proof(BiddingProgram);
export class BiddingProof extends biddingProof_ {}

let merkleMap = new MerkleMap();

export class BiddingContract extends SmartContract {
  @state(Field) merkleMapRoot = State<Field>();
  @state(Field) endTime = State<Field>();
  @state(PublicKey) ItemOwner = State<PublicKey>();

  init() {
    super.init();
    this.merkleMapRoot.set(merkleMap.getRoot());
  }

  @method async updateRoot(proof: BiddingProof) {
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
  BiddingContract: null as null | typeof BiddingContract,
  BiddingProgram: BiddingProgram,
  zkapp: null as null | BiddingContract,
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
    states.BiddingContract = BiddingContract;
  },
  compileContract: async (args: {}) => {

    console.log('compiling...');
    await BiddingProgram.compile();
  
    if (states.BiddingContract) {

      await states.BiddingContract.compile();
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
    states.zkapp = new states.BiddingContract!(publicKey);
  },
  getMerkleMapRoot: async (args: {}) => {
    const currentNum = await states.zkapp!.merkleMapRoot.get();
    const currentab = await states.zkapp!.endTime.get();

    console.log("endtime" + currentab)

    return JSON.stringify(currentNum.toJSON());
  },
  
  createUpdateRootTransaction : async (args: { 
    key:  number, 
    value: number, 
  }) => {
    try {
      
      console.log("args key" + args.key)
      console.log("args value" + args.value)

      // Convert the current root to a Field
      let currentRoot = map.getRoot();

      console.log('Initial root:', currentRoot.toString());
      
      const witness = map.getWitness( Field.from(args.key));

      console.log('Creating proof of update...');

      const proof = await BiddingProgram.placeBid(currentRoot, {
        key: Field.from(args.key),
        value: Field.from(args.value),
        witness: witness,
       });

        // Update the map and root
      currentRoot = proof.publicOutput;

  
      console.log('Creating transaction...');
      const transaction = await Mina.transaction(async () => {
        // Assuming your contract has an updateRoot method that takes a Proof
        states.zkapp!.updateRoot(proof);
      });
  
      console.log('Transaction created');
  
      await transaction.prove();
  
      console.log('Transaction proved');
  
      const transactionJSON = await transaction.toJSON();
      
      return transactionJSON;
  
    } catch (error) {
      console.error('An error occurred:', 
        error instanceof Error ? error.message : String(error));
      throw error;
    }
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
