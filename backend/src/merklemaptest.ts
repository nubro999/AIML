import { Field, SmartContract, state, State, method, CircuitString, UInt64, PublicKey, MerkleMap, MerkleMapWitness, Struct, Proof, SelfProof, ZkProgram, verify } from 'o1js';

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




async function main() {
    try {
      console.log('Compiling ZkProgram...');
      const { verificationKey } = await MerkleMapProgram.compile();
  
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
      try {
        const proof = await MerkleMapProgram.update(initialRoot, {
          key: initialKey,
          value: newValue,
          witness: witness
        });
  
        console.log('Proof created successfully');
        console.log('New root (from proof):', proof.publicOutput.toString());
  
        // Update the map and check the new root
        map.set(initialKey, newValue);
        const newMapRoot = map.getRoot();
        console.log('New root (from map):', newMapRoot.toString());
  
        if (proof.publicOutput.equals(newMapRoot).toBoolean()) {
          console.log('Proof output matches new map root');
        } else {
          console.log('Error: Proof output does not match new map root');
        }
  
        console.log('Verifying proof...');
        const verified = await verify(proof, verificationKey);
        console.log('Proof verified:', verified);
  
      } catch (proofError) {
        console.error('Error creating or verifying proof:', 
          proofError instanceof Error ? proofError.message : String(proofError));
      }
  
    } catch (error) {
      console.error('An error occurred:', 
        error instanceof Error ? error.message : String(error));
    }
}
  

  main();