// import { Mina, PublicKey, fetchAccount, Field, Signature, JsonProof 
//   ,ZkProgram ,CircuitString ,UInt64 ,Bool, verify as Verify, SmartContract, state as State1, method,
// State as State2 } from 'o1js';

// type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// // ---------------------------------------------------------------------------------------

// import type { Item } from '../../../backend/src/contracts/item';

// export const ConnectedProof = ZkProgram({
//   name: "ConnectedProof", // 이름 바꿧다 조심해 
//   publicInput: CircuitString,
//   methods: {
//       verify: {
//           privateInputs: [Bool],
//           async method(target: CircuitString, status: Bool) {
//               status.assertEquals(Bool(true));
//           }
//       }
//   }
// }) // General한 Proof

// export class ConnectedProof_ extends ZkProgram.Proof(ConnectedProof) {}

// export const InstagramProof = ZkProgram({ // 인스타는 좀 다르니 조심 
//   name: "InstagramProof",
//   publicInput: CircuitString,
//   methods: {
//       verify_: {
//           privateInputs: [CircuitString, CircuitString],
//           async method(target: CircuitString, user_name: CircuitString, user_sub_name: CircuitString,) {
//               target.equals(user_sub_name).assertEquals(Bool(true));
//               }
//       }
//   }
// })

// export class InstagramProof_ extends ZkProgram.Proof(InstagramProof) {}




// export class MainProof extends SmartContract {

//   @State1(Bool) result = State2<Bool>(Bool.fromValue(false));

//   @method
//   async connected_verify( proof: ConnectedProof_ ) {
//       await proof.verify();

//       await this.result.set(Bool.fromValue(true));
//   }

//   @method
//   async instagram_verify( proof: InstagramProof_ ) {
//       await proof.verify();

//       await this.result.set(Bool.fromValue(true));
//   }

// }





// const state = {
//   VerifySignature: null as null | typeof VerifySignature,
//   MainProof: MainProof,
//   ConnectedProof: ConnectedProof,
//   InstagramProof: InstagramProof,
//   zkapp: null as null | VerifySignature,
//   zkapp2: null as null | MainProof,
//   transaction: null as null | Transaction,
// };

// // ---------------------------------------------------------------------------------------

// const functions = {
//   setActiveInstanceToDevnet: async (args: {}) => {
//     const Network = Mina.Network(
//       'https://api.minascan.io/node/devnet/v1/graphql'
//     );
//     console.log('Devnet network instance configured.');
//     Mina.setActiveInstance(Network);
//   },
//   loadContract: async (args: {}) => {
//     const { VerifySignature } = await import('../../../contracts/build/src/');
//     state.VerifySignature = VerifySignature;
//   },
//   compileContract: async (args: {}) => {
//     await state.VerifySignature!.compile();
//   },
//   compileContract2: async (args: {}) => { 
//     await state.ConnectedProof.compile();
//     await state.InstagramProof.compile();
//     await state.MainProof!.compile();// 주의!! 
//   },
//   fetchAccount: async (args: { publicKey58: string }) => {
//     const publicKey = PublicKey.fromBase58(args.publicKey58);
//     return await fetchAccount({ publicKey });
//   },
//   initZkappInstance: async (args: { publicKey58: string }) => {
//     const publicKey = PublicKey.fromBase58(args.publicKey58);
//     state.zkapp = new state.VerifySignature!(publicKey);
//   },
//   initZkappInstance2: async (args: { publicKey58: string }) => {
//     const publicKey = PublicKey.fromBase58(args.publicKey58);
//     state.zkapp2 = new state.MainProof!(publicKey);
//   },
//   createVerifySignatureTransaction: async (args: { 
//     publicKey: string, 
//     signature:  string, 
//     messageField: number 
//   }) => {
//     const transaction = await Mina.transaction(async () => {
//         await state.zkapp!.verifySignature(
//           PublicKey.fromBase58(args.publicKey), 
//           Signature.fromBase58(args.signature), 
//           Field(args.messageField)
//         );      
//     });
//     state.transaction = transaction;
//   },
//   proveTransaction: async (args: {}) => {
//     await state.transaction!.prove();
//   },
//   getTransactionJSON: async (args: {}) => {
//     return state.transaction!.toJSON();
//   },
//   VerificationProof: async (args: {
//     proof: JsonProof
//   }) => {

//     let _proof = await ConnectedProof_.fromJSON(args.proof);
//     const tx = await Mina.transaction(async () => {
//       await state.zkapp2!.connected_verify(_proof);
//     });
//     state.transaction = tx;

//   },
//   VerificationInstagramProof: async (args: {
//     proof: JsonProof
//   })=>{
//     let _proof = await InstagramProof_.fromJSON(args.proof);
//     const tx = await Mina.transaction(async () => {
//       await state.zkapp2!.instagram_verify(_proof);
//     });
//     state.transaction = tx;
//   }
  
// };

// // ---------------------------------------------------------------------------------------

// export type WorkerFunctions = keyof typeof functions;

// export type ZkappWorkerRequest = {
//   id: number;
//   fn: WorkerFunctions;
//   args: any;
// };

// export type ZkappWorkerReponse = {
//   id: number;
//   data: any;
// };

// if (typeof window !== 'undefined') {
//   addEventListener(
//     'message',
//     async (event: MessageEvent<ZkappWorkerRequest>) => {
//       const returnData = await functions[event.data.fn](event.data.args);

//       const message: ZkappWorkerReponse = {
//         id: event.data.id,
//         data: returnData,
//       };
//       postMessage(message);
//     }
//   );
// }

// console.log('Web Worker Successfully Initialized.');
