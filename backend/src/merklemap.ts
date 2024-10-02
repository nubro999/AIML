import { Field, MerkleMap } from "o1js";

const map = new MerkleMap();
map.set(Field(3), Field(6));
map.set(Field(3), Field(7));

const map2 = new MerkleMap();
map2.set(Field(3), Field(7));
map2.set(Field(3), Field(6));
map2.set(Field(4), Field(6));


console.log(map2.get(Field(3)))

console.log(map.getRoot().toString())
console.log(map2.getRoot().toString())