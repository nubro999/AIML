import { Field, Struct, MerkleMapWitness, ZkProgram, Poseidon, MerkleMap } from 'o1js';

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


async function main() {
  try {
      console.log('Compiling BiddingProgram...');
      const { verificationKey } = await BiddingProgram.compile();

      console.log('Creating initial MerkleMap...');
      const map = new MerkleMap();
      let currentRoot = map.getRoot();

      console.log('Initial root:', currentRoot.toString());

      // Simulate multiple bids
      const bids = [
          { key: Field(1234), value: Field(1000) },
          { key: Field(5678), value: Field(1500) },
          { key: Field(9101), value: Field(2000) },
      ];

      for (const bid of bids) {
        
          // Get witness before updating the map
          const witness = map.getWitness(bid.key);

          // Create proof
          const proof = await BiddingProgram.placeBid(currentRoot, {
              key: bid.key,
              value: bid.value,
              witness: witness,
          });

          // Verify the proof
          const verificationResult = await BiddingProgram.verify(proof);
          if (!verificationResult) {
              throw new Error('Proof verification failed');
          }

          // Update the map and root
          map.set(bid.key, bid.value);
          currentRoot = proof.publicOutput;

          console.log('Bid placed successfully');
          console.log('New root:', currentRoot.toString());
      }

      console.log('Final Merkle root:', currentRoot.toString());

  } catch (error) {
      console.error('An error occurred:', 
          error instanceof Error ? error.message : String(error));
  }
}

main();