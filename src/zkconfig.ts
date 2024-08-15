import { createServer, IncomingMessage, ServerResponse } from 'http';


import { Field, SelfProof, ZkProgram, verify } from 'o1js';
import { spawn } from 'child_process';

export async function runZkConfig() {
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
          zkProcess.stdin.write('abcde\n');
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

runZkConfig().then(() => {
    console.log('ZK config automation completed');
  }).catch((error) => {
    console.error('ZK config automation failed:', error);
  });

