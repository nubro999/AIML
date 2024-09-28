import { promises as fs } from 'fs';
import * as path from 'path';
import {
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  NetworkId
} from 'o1js';
import { Add3 } from './contracts/add';
import { Item } from './contracts/item';
const DEFAULT_NETWORK_ID = 'testnet';

type Config = {
  deployAliases: {
    [key: string]: {
      feepayerKeyPath: string;
      url?: string;
      fee?: string;
      networkId?: string;
    };
  };
};



async function loadKeys(deployAlias: string) {
  try {
    const configPath = path.resolve(process.cwd(), 'config.json');
    const configJson: Config = JSON.parse(await fs.readFile(configPath, 'utf8'));

    const config = configJson.deployAliases[deployAlias];
    if (!config) {
      throw new Error(`Deploy alias "${deployAlias}" not found in config`);
    }

    const feepayerKeysPath = path.resolve(process.cwd(), config.feepayerKeyPath);
    const feepayerKeysBase58 = JSON.parse(await fs.readFile(feepayerKeysPath, 'utf8'));

    const zkAppKeysPath = path.resolve(process.cwd(), 'keys', `${deployAlias}.json`);
    console.log(`${deployAlias}.json`)
    const zkAppKeysBase58 = JSON.parse(await fs.readFile(zkAppKeysPath, 'utf8'));

    console.log(feepayerKeysBase58.privateKey)
    const feepayerKey = PrivateKey.fromBase58(feepayerKeysBase58.privateKey);
    console.log(zkAppKeysBase58.privateKey)
    const zkAppKey = PrivateKey.fromBase58(zkAppKeysBase58.privateKey)


    return { feepayerKey, zkAppKey, config };
  } catch (error) {
    console.error('Error loading keys:', error);
    throw error;
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getTxnUrl(graphQlUrl: string, txnHash: string | undefined) {
  const hostName = new URL(graphQlUrl).hostname;
  const txnBroadcastServiceName = hostName
    .split('.')
    .filter((item) => item === 'minascan')?.[0];
  const networkName = graphQlUrl
    .split('/')
    .filter((item) => item === 'mainnet' || item === 'devnet')?.[0];
  if (txnBroadcastServiceName && networkName) {
    return `https://minascan.io/${networkName}/tx/${txnHash}?type=zk-tx`;
  }
  return `Transaction hash: ${txnHash}`;
}

export async function setupAndDeploy(deployAlias: string) {
  try {
    const { feepayerKey, zkAppKey, config } = await loadKeys(deployAlias);
    
    const Network = Mina.Network({
      networkId: (config.networkId ?? DEFAULT_NETWORK_ID) as NetworkId,
      mina: config.url ?? "https://api.minascan.io/node/devnet/v1/graphql",
      archive: 'https://api.minascan.io/archive/devnet/v1/graphql',
    });

    console.log("Network URL:", config.url ?? "https://api.minascan.io/node/devnet/v1/graphql");
    console.log("FeePayer key"+ feepayerKey)
    const fee = Number(config.fee ?? '0.1') * 1e9; // in nanomina
    Mina.setActiveInstance(Network);

    const feepayerAddress = feepayerKey.toPublicKey();
    const zkAppAddress = zkAppKey.toPublicKey();
    const zkApp = new Add3(zkAppAddress);

    console.log('Fee:', fee);
    console.log('Feepayer address:', feepayerAddress.toBase58());
    console.log('zkApp address:', zkAppAddress.toBase58());

    console.log("Compiling contract...");
    const a = await Add3.compile();
    console.log("compile" + JSON.stringify(a))
    console.log("Deploying token A...");
    try {
      let tx = await Mina.transaction(
        { sender: feepayerAddress, fee },
        async () => {
          AccountUpdate.fundNewAccount(feepayerAddress, 1);
          await zkApp.deploy();
          console.log("deloyment complete")
        }
      );
      await tx.prove();
      let sentTx = await tx.sign([feepayerKey, zkAppKey]).send();
        if (sentTx.status === 'pending') {
            console.log("hash", sentTx.hash);
        }

      getTxnUrl("https://api.minascan.io/node/devnet/v1/graphql", "a")

    } catch (err) {
      console.error("Error during deployment:", err);
    }

  } catch (error) {
    console.error('Setup and deployment failed:', error);
  }
}


// Usage