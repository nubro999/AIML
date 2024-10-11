import { Field } from "o1js";
import { Experimental } from "o1js";
import {
  bigintToBase64,
  bigintFromBase64,
} from "zkcloudworker";

const { IndexedMerkleMap } = Experimental;
class MerkleMap extends IndexedMerkleMap(11) {}

// Create and populate the original map
const originalMap = new MerkleMap();
originalMap.set(1n, 2n);
originalMap.set(2n, 3n);
originalMap.set(Field(7), Field(20));


// Serialize the MerkleMap
const serializedMap: string = JSON.stringify(
  {
    root: originalMap.root.toJSON(),
    length: originalMap.length.toJSON(),
    nodes: JSON.stringify(originalMap.data.get().nodes, (_, v) =>
      typeof v === "bigint" ? "n" + bigintToBase64(v) : v
    ),
    sortedLeaves: JSON.stringify(
      originalMap.data
        .get()
        .sortedLeaves.map((v) => [
          bigintToBase64(v.key),
          bigintToBase64(v.nextKey),
          bigintToBase64(v.value),
          bigintToBase64(BigInt(v.index)),
        ])
    ),
  },
  null,
  2
);

console.log("serializedMap:", serializedMap);

// Deserialize and recreate the MerkleMap
function recreateMerkleMap(serializedMap: string): MerkleMap {
  const json = JSON.parse(serializedMap);
  const nodes = JSON.parse(json.nodes, (_, v) => {
    if (typeof v === "string" && v[0] === "n") {
      return bigintFromBase64(v.slice(1));
    }
    return v;
  });
  const sortedLeaves = JSON.parse(json.sortedLeaves).map((row: any) => {
    return {
      key: bigintFromBase64(row[0]),
      nextKey: bigintFromBase64(row[1]),
      value: bigintFromBase64(row[2]),
      index: Number(bigintFromBase64(row[3])),
    };
  });

  const restoredMap = new MerkleMap();
  restoredMap.root = Field.fromJSON(json.root);
  restoredMap.length = Field.fromJSON(json.length);
  restoredMap.data.updateAsProver(() => {
    return {
      nodes: nodes.map((row: any) => [...row]),
      sortedLeaves: [...sortedLeaves],
    };
  });

  return restoredMap;
}

// Recreate the MerkleMap
const recreatedMap = recreateMerkleMap(serializedMap);

// Verify that the root matches
console.log("Original root:", originalMap.root.toJSON());
console.log("Recreated root:", recreatedMap.root.toJSON());

// You can now use the recreatedMap as a normal MerkleMap
console.log("Value at key 1:", recreatedMap.get(1n).toBigInt());
console.log("Value at key 2:", recreatedMap.get(2n).toBigInt());

// Test setting a new value
recreatedMap.set(5n, 6n);
console.log("Value at key 5:", recreatedMap.get(5n).toBigInt());
console.log("Recreated root:", recreatedMap.root.toJSON());