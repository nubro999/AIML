import { Injectable } from "@nestjs/common";
import fs from 'fs/promises';
import { AccountUpdate, MerkleMap, Mina, PrivateKey, PublicKey } from 'o1js';
import { BiddingContract, BiddingProgram } from "../contracts/Bidding.js";
import { ItemRepository } from "./item.repository.js";
import { CreateItemDto } from "./dto/create-item.dto.js";
import { MoreThan } from "typeorm";
import { Item } from "./item.entity.js";

@Injectable()
export class ItemService {
  private config: any;
  private Network: any;
  private feepayerKey: PrivateKey;
  private zkAppKey: PrivateKey;
  private fee: number;
  private feepayerAddress: PublicKey;
  private zkAppAddress: PublicKey;
  private zkApp: BiddingContract;

  constructor(private readonly itemRepository: ItemRepository) {}

  async onModuleInit() {
    await this.initializeConfig();
  }

  private async initializeConfig() {
    const configJson = JSON.parse(await fs.readFile('config.json', 'utf8'));
    this.config = configJson.deployAliases['biddingcontract'];
    
    const feepayerKeysBase58 = JSON.parse(await fs.readFile(this.config.feepayerKeyPath, 'utf8'));
    const zkAppKeysBase58 = JSON.parse(await fs.readFile("keys/biddingcontract.json", 'utf8'));

    this.feepayerKey = PrivateKey.fromBase58(feepayerKeysBase58.privateKey);
    this.zkAppKey = PrivateKey.fromBase58(zkAppKeysBase58.privateKey);

    this.Network = Mina.Network({
      networkId: this.config.networkId ?? 'testnet',
      mina: "https://api.minascan.io/node/devnet/v1/graphql",
      archive: 'https://api.minascan.io/archive/devnet/v1/graphql',
    });

    this.fee = Number(this.config.fee) * 1e9;
    Mina.setActiveInstance(this.Network);

    this.feepayerAddress = this.feepayerKey.toPublicKey();
    this.zkAppAddress = this.zkAppKey.toPublicKey();
    this.zkApp = new BiddingContract(this.zkAppAddress);

    await BiddingProgram.compile();
    await BiddingContract.compile();
  }

  async DeployMinaContract() {
    try {
      console.log("Deploying Item contract");
      let tx = await Mina.transaction(
        { sender: this.feepayerAddress, fee: this.fee },
        async () => {
          AccountUpdate.fundNewAccount(this.feepayerAddress, 1);
          await this.zkApp.deploy();
        }
      );
      await tx.prove();
      let sentTx = await tx.sign([this.feepayerKey, this.zkAppKey]).send();
      if (sentTx.status === 'pending') {
        console.log("Transaction hash:", sentTx.hash);
        return { success: true, hash: sentTx.hash };
      } else {
        return { success: false, error: "Transaction failed" };
      }
    } catch (err: unknown) {
      console.error("Deployment error:", err);
      if (err instanceof Error) {
        return { success: false, error: err.message };
      } else {
        return { success: false, error: "An unknown error occurred" };
      }
    }
  }

  async AddItem(createItemDto: CreateItemDto) {
    try {
      const map = new MerkleMap();
      console.log("adding item..");
  
      const newItem = await this.itemRepository.save({
        name: createItemDto.name,
        description: createItemDto.description,
        minimumPrice: createItemDto.minimumPrice,
        endTime: createItemDto.endTime,
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
  

  
  

  // Add other methods to interact with the Item contract as needed
}
