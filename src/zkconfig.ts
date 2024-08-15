// import { createServer, IncomingMessage, ServerResponse } from 'http';


// import { Field, SelfProof, ZkProgram, verify } from 'o1js';
// import { spawn } from 'child_process';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export async function runZkConfig() {
//     return new Promise<void>((resolve, reject) => {
//       const isWindows = process.platform === 'win32';
//       const command = isWindows ? 'zk.cmd' : 'zk';
  
//       const zkProcess = spawn(command, ['config'], {
//         stdio: ['pipe', 'pipe', 'pipe'],
//         shell: true
//       });
  
//       zkProcess.stdout.on('data', (data) => {
//         const output = data.toString();
//         console.log('ZK output:', output);
  
//         if (output.includes('Enter values to create a deploy alias:')) {
//           zkProcess.stdin.write('abcde\n');
//         } else if (output.includes('Choose the target network:')) {
//           zkProcess.stdin.write('https://api.minascan.io/node/devnet/v1/graphql\n');
//         } else if (output.includes('Set the GraphQL API URL')) {
//           zkProcess.stdin.write('https://api.minascan.io/node/devnet/v1/graphql\n');
//         } else if (output.includes('Set transaction fee to use when deploying (in MINA):')) {
//           zkProcess.stdin.write('0.1\n');
//         } else if (output.includes('Choose an account to pay transaction fees:')) {
//           console.log("Selecting default fee payer account");
//           // Move up one line and select the first option
//           zkProcess.stdin.write('\u001B[A\n');
//         } else if (output.includes('Choose another saved fee payer:')) {
//           console.log("Choose another saved fee payer:");
//           // Move up one line and select the first option
//           zkProcess.stdin.write('\u001B[B\n');
//         } 
//       });
  
//       zkProcess.stderr.on('data', (data) => {
//         console.error(`Error: ${data}`);
//       });
  
//       zkProcess.on('close', (code) => {
//         if (code === 0) {
//           console.log('ZK config completed successfully');
//           resolve();
//         } else {
//           console.error(`ZK config process exited with code ${code}`);
//           reject(new Error(`Process exited with code ${code}`));
//         }
//       });
//     });
//   }

// runZkConfig().then(() => {
//     console.log('ZK config automation completed');
//   }).catch((error) => {
//     console.error('ZK config automation failed:', error);
//   });

// const Add = ZkProgram({
//     name: 'add-example',
//     publicInput: Field,
  
//     methods: {
//       init: {
//         privateInputs: [],
  
//         async method(state: Field) {
//           state.assertEquals(Field(0));
//         },
//       },
  
//       addNumber: {
//         privateInputs: [SelfProof, Field],
  
//         async method(
//           newState: Field,
//           earlierProof: SelfProof<Field, void>,
//           numberToAdd: Field
//         ) {
//           earlierProof.verify();
//           newState.assertEquals(earlierProof.publicInput.add(numberToAdd));
//         },
//       },
  
//       add: {
//         privateInputs: [SelfProof, SelfProof],
  
//         async method(
//           newState: Field,
//           earlierProof1: SelfProof<Field, void>,
//           earlierProof2: SelfProof<Field, void>
//         ) {
//           earlierProof1.verify();
//           earlierProof2.verify();
//           newState.assertEquals(
//             earlierProof1.publicInput.add(earlierProof2.publicInput)
//           );
//         },
//       },
//     },
//   });
  
//   async function main() {
//     console.log('compiling...');
  
//     const { verificationKey } = await Add.compile();
  
//     console.log('making proof 0');
  
//     const proof0 = await Add.init(Field(0));
  
//     console.log('making proof 1');
  
//     const proof1 = await Add.addNumber(Field(4), proof0, Field(4));
  
//     console.log('making proof 2');
  
//     const proof2 = await Add.add(Field(4), proof1, proof0);
  
//     console.log('verifying proof 2');
//     console.log('proof 2 data', proof2.publicInput.toString());
  
//     const ok = await verify(proof2.toJSON(), verificationKey);
//     console.log('ok', ok);
//   }
  

// const port = 3000;

// const requestHandler = (req: IncomingMessage, res: ServerResponse) => {
//     // Check the method and URL of the incoming request
//     if (req.url === '/deploy' && req.method === 'GET') {
//         handleDeploy(req, res);
        
//     } else {
//         res.writeHead(404, { 'Content-Type': 'text/plain' });
//         res.end('Not Found\n');
//     }
// };

// // Controller function for /deploy
// // Controller function for /deploy
// const handleDeploy = async (req: IncomingMessage, res: ServerResponse) => {

    
//     // Simulate deployment process or logic here
//     const message = 'Deploy endpoint reached. Performing deployment...';

//     res.writeHead(200, { 'Content-Type': 'text/plain' });
//     res.write(message + '\n');

//     // Wait for the main function to complete
//     // Send the final message after main() completes
//     res.end('Proving done\n');
// };
// const server = createServer(requestHandler);

// server.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });
