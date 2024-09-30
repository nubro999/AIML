import { Injectable } from "@nestjs/common";
import fs from 'fs/promises';
import { AccountUpdate, Mina, PrivateKey, PublicKey } from 'o1js';
import { Item } from './index.js'; // Adjust this import path as needed
import { MerkleMapProgram } from "../contracts/item.js";

@Injectable()
export class ItemService {
  private config: any;
  private Network: any;
  private feepayerKey: PrivateKey;
  private zkAppKey: PrivateKey;
  private fee: number;
  private feepayerAddress: PublicKey;
  private zkAppAddress: PublicKey;
  private zkApp: Item;

  constructor() {
    this.initializeConfig();
  }

  private async initializeConfig() {
    const configJson = JSON.parse(await fs.readFile('config.json', 'utf8'));
    this.config = configJson.deployAliases['item'];
    
    const feepayerKeysBase58 = JSON.parse(await fs.readFile(this.config.feepayerKeyPath, 'utf8'));
    const zkAppKeysBase58 = JSON.parse(await fs.readFile("keys/item.json", 'utf8'));

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
    this.zkApp = new Item(this.zkAppAddress);

    await MerkleMapProgram.compile();
    await Item.compile();
  }

  async Deploy() {
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

  
  

  // Add other methods to interact with the Item contract as needed
}
