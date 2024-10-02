import { Field, MerkleMap } from "o1js";

const map = new MerkleMap();
map.set(Field(1), Field(0));




console.log(map.getRoot().toString())