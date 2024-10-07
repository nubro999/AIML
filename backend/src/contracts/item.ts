import { Field, SmartContract, state, State, method, CircuitString, UInt64, PublicKey, MerkleMap, MerkleMapWitness, Struct, Proof, SelfProof, ZkProgram } from 'o1js';

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

export class ItemContract extends SmartContract {
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
