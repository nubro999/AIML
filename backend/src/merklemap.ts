import { Field, MerkleMap } from "o1js";


const map = new MerkleMap();
map.set(Field(1234), Field(1000))
map.set(Field(5678), Field(1500))  
map.set(Field(9101), Field(2000))  
map.set(Field(12345), Field(11234))  
map.set(Field(123456), Field(1123456)) // current 


console.log(map.get(Field(1234)))