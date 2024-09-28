import { Field, SmartContract, state, State, method, CircuitString, UInt64, PublicKey, MerkleMap } from 'o1js';

export class Item extends SmartContract {
    @state(Field) merkleRoot = State<Field>();
    @state(UInt64) auctionEndTime = State<UInt64>();
    @state(Field) name = State<Field>();
    @state(PublicKey) auctionOwner = State<PublicKey>();
    
    init() {
      super.init();
      this.name.set(Field(1));
    }
  
    @method async update(name: Field) {
      const currentState = this.name.getAndRequireEquals();
      // Add any logic you need based on currentState
      const newState = name;
      this.name.set(newState);
    }

    @method async inlist(
        auctionOwner: PublicKey,
        itemDescription: CircuitString,
        auctionDuration: UInt64
      ) {
        // Add precondition for network timestamp
        this.network.timestamp.requireBetween(UInt64.from(0), UInt64.from(Number.MAX_SAFE_INTEGER));

        // Initialize the MerkleMap
        const merkleMap = new MerkleMap();
        this.merkleRoot.set(merkleMap.getRoot());
    
        // Set the auction end time
        const currentTime = this.network.timestamp.get();
        const endTime = currentTime.add(auctionDuration);
        this.auctionEndTime.set(endTime);
    
        // Set the auctioneer
        this.auctionOwner.set(auctionOwner);

        // If you want to store itemDescription, you might need to hash it or store off-chain
        // For example: this.itemDescriptionHash.set(Poseidon.hash(itemDescription.toFields()));
    }
}
