import { useEffect, useState } from 'react';
import ZkappWorkerClient from '../lib/zkappWorkerClient';

export default function Home() {
  const [num, setNum] = useState<string | null>(null);
  const [client, setClient] = useState<ZkappWorkerClient | null>(null);

  useEffect(() => {
    (async () => {
      const zkappWorkerClient = new ZkappWorkerClient();
      setClient(zkappWorkerClient);

      await zkappWorkerClient.loadContract();
      const currentNum = await zkappWorkerClient.getNum();
      setNum(currentNum.toString());
    })();
  }, []);

  const onUpdate = async () => {
    if (!client) return;
    const transaction = await client.createUpdateTransaction();
    // Here you would typically send the transaction to the network
    console.log('Transaction created:', transaction);
    // After the transaction is processed, you'd update the UI
    const newNum = await client.getNum();
    setNum(newNum.toString());
  };

  return (
    <div>
      <h1>Mina zkApp: Add</h1>
      <p>Current number: {num}</p>
      <button onClick={onUpdate}>Update</button>
    </div>
  );
}