import { Injectable } from '@nestjs/common';
import { Field, SelfProof, ZkProgram, verify } from 'o1js';
import { setupAndDeploy } from './deploy';
import { spawn } from 'child_process';
import path from 'path';
import { promises as fs } from 'fs';




import { fileURLToPath } from 'url';

const Add = ZkProgram({
  name: 'add-example',
  publicInput: Field,

  methods: {
    init: {
      privateInputs: [],
      async method(state: Field) {
        state.assertEquals(Field(0));
      },
    },

    addNumber: {
      privateInputs: [SelfProof, Field],
      async method(
        newState: Field,
        earlierProof: SelfProof<Field, void>,
        numberToAdd: Field
      ) {
        earlierProof.verify();
        newState.assertEquals(earlierProof.publicInput.add(numberToAdd));
      },
    },

    add: {
      privateInputs: [SelfProof, SelfProof],
      async method(
        newState: Field,
        earlierProof1: SelfProof<Field, void>,
        earlierProof2: SelfProof<Field, void>
      ) {
        earlierProof1.verify();
        earlierProof2.verify();
        newState.assertEquals(
          earlierProof1.publicInput.add(earlierProof2.publicInput)
        );
      },
    },
  },
});

interface DeployAlias {
  networkId: string;
  url: string;
  keyPath: string;
  feepayerKeyPath: string;
  feepayerAlias: string;
  fee: string;
}

interface Config {
  version: number;
  deployAliases: {
    [key: string]: DeployAlias;
  };
}


@Injectable()
export class AppService {
  getHello(): string {
    console.log("h1");
    return 'Hello World!';
  }

  async prove() {

      console.log('Compiling...');
      const { verificationKey } = await Add.compile();

      console.log('Making proof 0');
      const proof0 = await Add.init(Field(0));

      console.log('Making proof 1');
      const proof1 = await Add.addNumber(Field(4), proof0, Field(4));

      console.log('Making proof 2');
      const proof2 = await Add.add(Field(4), proof1, proof0);

      console.log('Verifying proof 2');
      console.log('Proof 2 data', proof2.publicInput.toString());

      const ok = await verify(proof2.toJSON(), verificationKey);
      console.log('Verification result:', ok);

      return { success: true, verificationResult: ok };
  }

  async deploy(alias: string){
    setupAndDeploy(alias);
  }


  async config(deployAlias: string) {
    return new Promise<void>((resolve, reject) => {
      const isWindows = process.platform === 'win32';
      const command = isWindows ? 'zk.cmd' : 'zk';

      const zkProcess = spawn(command, ['config'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      zkProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('ZK output:', output);

        if (output.includes('Enter values to create a deploy alias:')) {
          zkProcess.stdin.write(`${deployAlias}\n`);
        } else if (output.includes('Choose the target network:')) {
          zkProcess.stdin.write('https://api.minascan.io/node/devnet/v1/graphql\n');
        } else if (output.includes('Set the GraphQL API URL')) {
          zkProcess.stdin.write('https://api.minascan.io/node/devnet/v1/graphql\n');
        } else if (output.includes('Set transaction fee to use when deploying (in MINA):')) {
          zkProcess.stdin.write('0.1\n');
        } else if (output.includes('Choose an account to pay transaction fees:')) {
          console.log("Selecting default fee payer account");
          // Move up one line and select the first option
          zkProcess.stdin.write('\u001B[A\n');
        } else if (output.includes('Choose another saved fee payer:')) {
          console.log("Choose another saved fee payer:");
          // Move up one line and select the first option
          zkProcess.stdin.write('\u001B[B\n');
        } 
      });

      zkProcess.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
      });

      zkProcess.on('close', (code) => {
        if (code === 0) {
          console.log('ZK config completed successfully');
          resolve();
        } else {
          console.error(`ZK config process exited with code ${code}`);
          reject(new Error(`Process exited with code ${code}`));
        }
      });
    });
  }

  
  async updateNetworkId(deployAlias: string) {
  try {
    // Read the config file
    const configPath = path.resolve(process.cwd(), 'config.json');
    const configData = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configData);

    // Check if the deployAlias exists
    if (!config.deployAliases[deployAlias]) {
      console.log(`Deploy alias "${deployAlias}" not found in config.json`);
      return;
    }

    // Update the networkId if it's mainnet
    if (config.deployAliases[deployAlias].networkId === "mainnet") {
      config.deployAliases[deployAlias].networkId = "testnet";
      console.log(`Updated networkId for "${deployAlias}" from mainnet to testnet`);
    } else {
      console.log(`NetworkId for "${deployAlias}" is already set to ${config.deployAliases[deployAlias].networkId}`);
    }

    // Write the updated config back to the file
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    console.log(`Successfully updated config.json`);
  } catch (error) {
    console.error('Error updating config.json:', error);
  }
  }
}