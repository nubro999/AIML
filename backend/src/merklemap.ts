import { MerkleMap, MerkleTree, Field } from "o1js";
import {
  fieldToBase64,
  fieldFromBase64,
  bigintFromBase64,
  bigintToBase64,
} from "zkcloudworker";
 


let merklemap = new MerkleMap();

merklemap.set(Field(216120), Field(160))
merklemap.set(Field(2147483647), Field(120))

console.log(merklemap.getRoot())

