import { Field, MerkleMap } from "o1js";
import { Experimental } from "o1js";
import {
  bigintToBase64,
  bigintFromBase64,
} from "zkcloudworker";


// Create and populate the original map
const originalMap = new MerkleMap();

originalMap.set(Field(1234), Field(1000));



let root = originalMap.getRoot()
console.log(root)

let witness = originalMap.getWitness(Field(0))

const [rootBefore, key0] = witness.computeRootAndKeyV2(Field(0));

console.log("root: " + rootBefore)

console.log(key0)

originalMap.set(Field(8), Field(30));
const root2 = originalMap.getRoot()
console.log(root2)

const witness2 = originalMap.getWitness(Field(0))


const [rootBefore2, key1] = witness2.computeRootAndKeyV2(Field(0));

console.log("root: " + rootBefore2)

console.log(key1)

console.log(originalMap.get(Field(71213142315231)))