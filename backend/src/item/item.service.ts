import { Injectable } from "@nestjs/common";
import fs from 'fs/promises';
import { AccountUpdate, MerkleMap, Mina, PrivateKey, PublicKey } from 'o1js';
import { BiddingContract, BiddingProgram } from "../contracts/Bidding.js";
import { ItemRepository } from "./item.repository.js";
import { CreateItemDto } from "./dto/create-item.dto.js";
import { LessThan, MoreThan } from "typeorm";
import { Item } from "./item.entity.js";
import path from "path";

@Injectable()
export class ItemService {

  constructor(private readonly itemRepository: ItemRepository) {
    this.loadVerificationKey();
  }

  private async loadVerificationKey() {
    try {
      // Load BiddingContract verification key
      const contractKeyPath = path.join(process.cwd(), 'contracts-cache', 'bidding_contract_verification_key.json');
      const contractKey = JSON.parse(
        await fs.readFile(contractKeyPath, 'utf8')
      );
      BiddingContract._verificationKey = contractKey;

      console.log('Verification keys loaded successfully');
    } catch (error) {
      console.error('Failed to load verification keys:', error);
      throw new Error('Contract verification keys not found. Run npm run compile:contracts first.');
    }
  }

  async DeployMinaContract(): Promise<{ success: boolean; hash?: string; zkappAddress?: PublicKey; error?: string }> {
    try {
      console.log("Deploy Mina Contract ");
      const Network = Mina.Network({
        mina: "https://api.minascan.io/node/devnet/v1/graphql",
        archive: 'https://api.minascan.io/archive/devnet/v1/graphql',
      });
      Mina.setActiveInstance(Network);
      
      const feepayerKey = PrivateKey.fromBase58('EKEvxehxoKztsx3wZeKuEjWgcsarwobkHb7NYSEZ8eq2xVy94k7h');
      const feepayerAddress = feepayerKey.toPublicKey();
      
      const zkAppPrivateKey = PrivateKey.random();
      const zkAppAddress = zkAppPrivateKey.toPublicKey();
      
      const zkApp = new BiddingContract(zkAppAddress);
      
      console.time('deploy');
      let tx = await Mina.transaction(
        { sender: feepayerAddress, fee:  1e9 },
        async () => {
          AccountUpdate.fundNewAccount(feepayerAddress, 1);
          await zkApp.deploy();
        }
      );

      await tx.prove();
      const txResult = await tx.sign([feepayerKey, zkAppPrivateKey]).send();
      console.timeEnd('deploy');

      if (txResult.hash) {
        return { success: true, hash: txResult.hash, zkappAddress: zkAppAddress };
      } else {
        return { success: false, error: "Transaction failed - no hash returned" };
      }

    } catch (error) {
      console.error("Deployment error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred"
      };
    }
  }
  async AddItem(createItemDto: CreateItemDto, txhash:string| undefined, zkappAddress: PublicKey|undefined ) {
    try {
      const map = new MerkleMap();
      console.log("adding item..");
  
      const newItem = await this.itemRepository.save({
        name: createItemDto.name,
        description: createItemDto.description,
        minimumPrice: createItemDto.minimumPrice,
        endTime: createItemDto.endTime,
        type: createItemDto.type,
        deploymentHash: txhash,
        zkappAddress: zkappAddress?.toBase58(),
        merkleMap: "none",
        merkleMapRoot: map.getRoot().toString(),
      });
  
      console.log("Item added successfully:", newItem);
      return newItem;
  
    } catch (error: unknown) {
      console.error("Error adding item:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to add item: ${error.message}`);
      } else {
        throw new Error('Failed to add item: An unknown error occurred');
      }
    }
  }
  async getAuctionDetails(id: number): Promise<Item | null> {
    try {
        return await this.itemRepository.findById(id);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to fetch auction details: ${error.message}`);
        } else {
            throw new Error('Failed to fetch auction details: Unknown error');
        }
    }
  }

  async getRunningAuctions() {
    const currentTime = new Date();
    return this.itemRepository.find({
      where: {
        endTime: MoreThan(currentTime)
      },
      order: {
        endTime: 'ASC'
      }
    });
  }
  async getFinishedAuctions() {
    const currentDate = new Date();
    return await this.itemRepository.find({
      where: {
        endTime: LessThan(currentDate)
      },
      relations: ['auctionWinner'], // Include the winner relation
      order: {
        endTime: 'DESC'
      }
    });
  }
  

  
  

  // Add other methods to interact with the Item contract as needed
}
