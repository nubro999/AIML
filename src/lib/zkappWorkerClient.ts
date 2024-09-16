import { fetchAccount, PublicKey, PrivateKey, Field } from 'o1js';
import type { Add } from '../../../contracts/src/Add';

class ZkappWorkerClient {
  private zkapp: Add | null = null;

  async loadContract() {
    const { Add } = await import('../../../contracts/src/Add');
    this.zkapp = new Add(PublicKey.fromBase58('YOUR_ZKAPP_ADDRESS'));
  }

  async getNum(): Promise<Field> {
    if (!this.zkapp) await this.loadContract();
    const currentNum = await this.zkapp!.num.get();
    return currentNum;
  }

  async createUpdateTransaction() {
    if (!this.zkapp) await this.loadContract();
    const transaction = await this.zkapp!.update();
    return transaction;
  }
}

export default ZkappWorkerClient;