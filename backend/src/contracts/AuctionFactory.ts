import {
    SmartContract,
    Permissions,
    method,
    PublicKey,
    Bool,
    AccountUpdate,
    VerificationKey,
  } from 'o1js';
import { BiddingContract } from './Bidding';

let globalVerificationKey: VerificationKey;

// Function to initialize the verification key
export async function initializeVerificationKey() {
  const { verificationKey } = await BiddingContract.compile();
  globalVerificationKey = verificationKey;
}


  export class Factory extends SmartContract {
    init() {
      super.init();
    }
  
    @method async deployBiddingContract(address: PublicKey) {
      const update = AccountUpdate.createSigned(address);
      update.body.update.verificationKey = {
        isSome: Bool(true),
        value: { data: globalVerificationKey.data, hash: globalVerificationKey.hash },
      };
      update.body.update.permissions = {
        isSome: Bool(true),
        value: {
          ...Permissions.default(),
        },
      };
    }
  }
  