import { MerkleMap, MerkleTree, Field } from "o1js";
import {
  fieldToBase64,
  fieldFromBase64,
  bigintFromBase64,
  bigintToBase64,
} from "zkcloudworker";

// Helper functions for tree serialization
function treeToJSON(tree: MerkleTree) {
  const nodes: { [key: string]: string } = {};
  for (const level in tree.nodes) {
    const node: string[] = [];
    for (const index in tree.nodes[level]) {
      node.push(bigintToBase64(BigInt(index)));
      node.push(fieldToBase64(tree.nodes[level][index]));
    }
    nodes[level] = node.join(".");
  }
  return {
    height: tree.height,
    nodes,
  };
}

function treeFromJSON(json: any): MerkleTree {
  const tree = new MerkleTree(json.height);
  function setNode(level: number, index: bigint, value: Field) {
    (tree.nodes[level] ??= {})[index.toString()] = value;
  }
  for (const level in json.nodes) {
    const node = json.nodes[level].split(".");
    for (let i = 0; i < node.length; i += 2) {
      setNode(
        parseInt(level),
        bigintFromBase64(node[i]),
        fieldFromBase64(node[i + 1])
      );
    }
  }
  return tree;
}

// Serialize MerkleMap
function serializeMerkleMap(map: MerkleMap): string {
  const serialized = {
    tree: treeToJSON(map.tree),
    root: fieldToBase64(map.getRoot())
  };
  return JSON.stringify(serialized);
}

// Deserialize MerkleMap
function deserializeMerkleMap(serializedString: string): MerkleMap {
  const { tree, root } = JSON.parse(serializedString);
  const newMap = new MerkleMap();
  newMap.tree = treeFromJSON(tree);

  // Verify the root matches after deserialization
  if (newMap.getRoot().toString() !== fieldFromBase64(root).toString()) {
    throw new Error('Root mismatch after deserialization');
  }

  return newMap;
}

// Create a new MerkleMap and add some key-value pairs
const map = new MerkleMap();
map.set(Field(1), Field(100));
map.set(Field(2), Field(200));
map.set(Field(3), Field(300));

// Serialize the map
const serializedMap = serializeMerkleMap(map);
console.log("Serialized MerkleMap:", serializedMap);

// Deserialize back into a new MerkleMap
const deserializedMap = deserializeMerkleMap(serializedMap);

// Verify the deserialized map
console.log("Original root:", map.getRoot().toString());
console.log("Deserialized root:", deserializedMap.getRoot().toString());

// Check if a key-value pair is preserved
const key = Field(2);
console.log("Original value for key 2:", map.get(key).toString());
console.log("Deserialized value for key 2:", deserializedMap.get(key).toString());