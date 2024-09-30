// import { Field, PublicKey, fetchAccount, Signature } from 'o1js';

// import type {
//   WorkerFunctions,
//   ZkappWorkerReponse,
//   ZkappWorkerRequest,
// } from './zkappWorker';

// export default class ZkappWorkerClient {
//   // ---------------------------------------------------------------------------------------

//   setActiveInstanceToDevnet() {
//     return this._call('setActiveInstanceToDevnet', {});
//   }

//   loadContract() {
//     return this._call('loadContract', {});
//   }

//   compileContract() {
//     return this._call('compileContract', {});
//   }

//   compileContract2() {
//     return this._call('compileContract2', {});
//   }

//   fetchAccount({
//     publicKey,
//   }: {
//     publicKey: PublicKey;
//   }): ReturnType<typeof fetchAccount> {
//     const result = this._call('fetchAccount', {
//       publicKey58: publicKey.toBase58(),
//     });
//     return result as ReturnType<typeof fetchAccount>;
//   }

//   initZkappInstance(publicKey: PublicKey) {
//     return this._call('initZkappInstance', {
//       publicKey58: publicKey.toBase58(),
//     });
//   }

//   initZkappInstance2(publicKey: PublicKey) {
//     return this._call('initZkappInstance2', {
//       publicKey58: publicKey.toBase58(),
//     });
//   }

//   createVerifySignatureTransaction(
//     publicKey: string,
//     signature: string,
//     messageField: number
//   ) {
//     return this._call('createVerifySignatureTransaction', {
//       publicKey: publicKey,
//       signature: signature,
//       messageField: messageField,
//     });
//   }

//   proveTransaction() {
//     return this._call('proveTransaction', {});
//   }

//   async getTransactionJSON() {
//     const result = await this._call('getTransactionJSON', {});
//     return result;
//   }

//   Verificationproof(data: string, hash: string, proof: any) {
//     return this._call('VerificationProof', {proof: proof});
//   }

//   VerificationInstagramProof(data: string, hash: string, proof: any) {
//     return this._call('VerificationInstagramProof', {proof: proof});
//   }
  

  

//   // ---------------------------------------------------------------------------------------

//   worker: Worker;

//   promises: {
//     [id: number]: { resolve: (res: any) => void; reject: (err: any) => void };
//   };

//   nextId: number;

//   constructor() {
//     this.worker = new Worker(new URL('./zkappWorker.ts', import.meta.url));
//     this.promises = {};
//     this.nextId = 0;

//     this.worker.onmessage = (event: MessageEvent<ZkappWorkerReponse>) => {
//       this.promises[event.data.id].resolve(event.data.data);
//       delete this.promises[event.data.id];
//     };
//   }

//   _call(fn: WorkerFunctions, args: any) {
//     return new Promise((resolve, reject) => {
//       this.promises[this.nextId] = { resolve, reject };

//       const message: ZkappWorkerRequest = {
//         id: this.nextId,
//         fn,
//         args,
//       };

//       this.worker.postMessage(message);

//       this.nextId++;
//     });
//   }
// }
