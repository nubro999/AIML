import { Field, SmartContract, state, State, method, CircuitString, UInt64, PublicKey, MerkleMap, MerkleMapWitness, Struct, Proof, SelfProof, ZkProgram } from 'o1js';




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
        const [computedRoot, computedKey] = witness.computeRootAndKey(Field(0));
        computedRoot.assertEquals(oldRoot);

        // Compute the new root
        const [newRoot] = witness.computeRootAndKey(value);

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
