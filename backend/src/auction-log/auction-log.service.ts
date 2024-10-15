import { Injectable } from "@nestjs/common";
import { Field, MerkleMap, MerkleTree} from "o1js";
import { AuctionLogRepository } from "./auction-log.repostiory";
import {
  fieldToBase64,
  fieldFromBase64,
  bigintFromBase64,
  bigintToBase64,
} from "zkcloudworker"; 

@Injectable()
export class AuctionLogService {

    constructor(
        private readonly auctionLogRepository: AuctionLogRepository,
    ) {}
  
    private treeToJSON(tree: MerkleTree) {
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

    public async getMerkleMapForItem(itemId: number): Promise<MerkleMap> {
        const merkleMap = new MerkleMap();

        // Fetch all auction logs for the given item ID
        const auctionLogs = await this.auctionLogRepository.find({
            where: { item: { id: itemId } },
            order: { bidTime: 'ASC' } // Order by bid time to ensure consistency
        });     

        if (auctionLogs.length === 0) {
            return merkleMap;
        }

        
        // Reconstruct the MerkleMap
        for (const log of auctionLogs) {
            // Convert key and bidAmount to Field type
            const key = Field(log.key);
            const value = Field(log.bidAmount);

            // Set the key-value pair in the MerkleMap
            merkleMap.set(key, value);
        }

        return merkleMap;
    }

    public async serializeMerkleMap(map: MerkleMap): Promise<string> {
        const serialized = {
          tree: this.treeToJSON(map.tree),
          root: fieldToBase64(map.getRoot())
        };  

        return JSON.stringify(serialized);
      }
      
  
  

  // Add other methods to interact with the Item contract as needed
}
