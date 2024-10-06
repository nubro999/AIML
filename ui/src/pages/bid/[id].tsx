import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/Home.module.css';
import bidStyles from '../../styles/Bid.module.css';
import ZkappWorkerClient from '../zkappWorkerClient';
import { Field, PublicKey } from 'o1js';


const ZKAPP_ADDRESS = 'B62qjLwEAouZxtiGdQdgKv7vgCVay4fcCAB3Ai9JrPCZiy11Q5ZQgPZ';

interface Auction {
  id: number;
  title: string;
  currentBid: number;
  endTime: string;
}

export default function Bid() {
  const router = useRouter();
  const { id } = router.query;
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [transactionJSON, setTransactionJSON] = useState('');
  const [state, setState] = useState({
    zkappWorkerClient: null as null | ZkappWorkerClient,
    hasWallet: null as null | boolean,
    hasBeenSetup: false,
    accountExists: false,
    currentNum: null as null | Field,
    publicKey: null as null | PublicKey,
    zkappPublicKey: null as null | PublicKey,
    creatingTransaction: false,
  });
  const zkappWorkerClient = new ZkappWorkerClient();

  useEffect(() => {
    if (id) {
      // Fetch auction details from an API
      // This is a mock implementation
      setAuction({
        id: Number(id),
        title: `Auction Item ${id}`,
        currentBid: 100,
        endTime: new Date(Date.now() + 86400000).toISOString(),
      });
    }
  }, [id]);

  const handleBid = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.hasBeenSetup) {
      setDisplayText('Setting up ZkApp...');
      await setupZkApp();
    }
    setDisplayText('Creating transaction...');
    setState({ ...state, creatingTransaction: true });
    console.log(`Placing bid of $${bidAmount} on auction ${id}`);
    
    try {
      console.log("GetCurrent MerkleRoot")

      const currentMerkleMapRoot = await zkappWorkerClient.getMerkleMapRoot();
      console.log("currentMerkleMapRoot" + currentMerkleMapRoot)


      const transactionJSON1 = await zkappWorkerClient.createUpdateRootTransaction();

      const { hash } = await (window as any).mina.sendTransaction({
        transaction: transactionJSON1,
        feePayer: {
          fee: 0.1,
          memo: '',
        },
      });
  
      const transactionLink = `https://minascan.io/devnet/tx/${hash}`;
      console.log(`View transaction at ${transactionLink}`);
      setDisplayText('Proving transaction...');
      await zkappWorkerClient.proveUpdateTransaction();
      setDisplayText('Getting transaction JSON...');
      const transactionJSON = await zkappWorkerClient.getTransactionJSON() as string;
      setTransactionJSON(transactionJSON);
      setDisplayText('Transaction created! Send this transaction JSON to the backend.');
      setState({ ...state, creatingTransaction: false });
    } catch (error) {
      console.error(error);
      setDisplayText('Error creating transaction');
      setState({ ...state, creatingTransaction: false });

      
    }

  }, [state, bidAmount, id]);

  
  const setupZkApp = async () => {

    await zkappWorkerClient.setActiveInstanceToDevnet();

    const mina = (window as any).mina;
    if (mina == null) {
      setState({ ...state, hasWallet: false });
      return;
    }
    const publicKeyBase58 = await mina.requestAccounts();
    const publicKey = PublicKey.fromBase58(publicKeyBase58[0]);
    const res = await zkappWorkerClient.fetchAccount({ publicKey: publicKey });
    const accountExists = res.error == null;
    await zkappWorkerClient.loadContract();
    await zkappWorkerClient.compileContract();

    const zkappPublicKey = PublicKey.fromBase58(ZKAPP_ADDRESS);
    await zkappWorkerClient.initZkappInstance(zkappPublicKey);
    await zkappWorkerClient.fetchAccount({ publicKey: zkappPublicKey });
    const currentNum = await zkappWorkerClient.getMerkleMapRoot();
    setState({
      ...state,
      zkappWorkerClient,
      hasWallet: true,
      hasBeenSetup: true,
      publicKey,
      zkappPublicKey,
      accountExists,
      currentNum,
    });
  };


  if (!auction) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <Head>
        <title>{auction.title} - AuctionHub</title>
        <meta name="description" content={`Bid on ${auction.title}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <h1>AuctionHub</h1>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/auctions">Auctions</Link>
          <Link href="/create">Create Auction</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <h2 className={styles.title}>{auction.title}</h2>
        <div className={bidStyles.auctionDetails}>
          <p>Current Bid: ${auction.currentBid}</p>
          <p>Ends at: {new Date(auction.endTime).toLocaleString()}</p>
        </div>
        <form onSubmit={handleBid} className={bidStyles.bidForm}>
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="Enter bid amount"
            required
            min={auction.currentBid + 1}
          />
          <button type="submit">Place Bid</button>
        </form>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2023 AuctionHub. All rights reserved.</p>
      </footer>
    </div>
  );
}