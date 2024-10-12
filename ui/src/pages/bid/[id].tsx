import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/Home.module.css';
import bidStyles from '../../styles/Bid.module.css';
import ZkappWorkerClient from '../zkappWorkerClient';
import { Field, PublicKey } from 'o1js';
import Header from '@/components/Header';


const ZKAPP_ADDRESS = 'B62qpm9RdksBbjAWFxgzbJNhuh82KF56SfHtUc8CC56MK2MLcmUqXg7';

interface Auction {
  id: number;
  minimumPrice: number;
  title: string;
  endTime: string;
}

export default function Bid() {
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const { id } = router.query;
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState<number | null>(null);
  const [bidKey, setBidKey] = useState<number | null>(null);
  const [displayText, setDisplayText] = useState('');
  const [transactionJSON, setTransactionJSON] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      fetchAuctionDetails();
    }
  }, [id]);

  const fetchAuctionDetails = async () => {

    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/items/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch auction details');
      }
      const data = await response.json();
      setAuction(data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching auction details. Please try again later.');
      setLoading(false);
    }
  };


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

      const mina = (window as any).mina;
       if (mina == null) {
        setState({ ...state, hasWallet: false });
        return;
       }
      const publicKeyBase58 = await mina.requestAccounts();
      const publicKey = PublicKey.fromBase58(publicKeyBase58[0]);


      const transactionJSON1 = await zkappWorkerClient.createUpdateRootTransaction(bidKey, bidAmount);

      const { hash } = await (window as any).mina.sendTransaction({
        transaction: transactionJSON1,
        feePayer: {
          fee: 0.1,
          memo: '',
        },
      });
  
      console.log("publickey" + publicKey.toBase58())
      const transactionLink = `https://minascan.io/devnet/tx/${hash}`;
      console.log(`View transaction at ${transactionLink}`);
      setState({ ...state, creatingTransaction: false });

      const response = await fetch(`${backendUrl}/auction-log/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: id,
          key: bidKey,
          bidUser: publicKey.toBase58(),
          bidAmount: bidAmount,
          transactionHash: hash,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save auction log');
      }
  
      const result = await response.text();
      console.log(result);
      setDisplayText('Bid placed successfully!');
      setState({ ...state, creatingTransaction: false });


    } catch (error) {
      console.error(error);
      setDisplayText('Error creating transaction');
      setState({ ...state, creatingTransaction: false });
      
      
    }

  }, [state, bidAmount, id, ]);

  
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
    await setState({
      ...state,
      zkappWorkerClient,
      hasWallet: true,
      hasBeenSetup: true,
      publicKey : publicKey,
      zkappPublicKey,
      accountExists,
      currentNum,
    });
  };


  if (!auction) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <Header/>

      <main className={styles.main}>
        <h2 className={styles.title}>{auction.title}</h2>
        <div className={bidStyles.auctionDetails}>
          <p>Minimum Price: {auction.minimumPrice} Mina</p>
          <p>Ends at: {new Date(auction.endTime).toLocaleString()}</p>
        </div>
        <form onSubmit={handleBid} className={bidStyles.bidForm}>

        <input
            type="number"
            value={bidKey === null ? '' : bidKey}
            onChange={(e) => {
              const value = e.target.value;
              setBidKey(value === '' ? null : Number(value));
            }}
            placeholder="Enter your bid key"
            required
          />

        <input
            type="number"
            value={bidAmount === null ? '' : bidAmount}
            onChange={(e) => {
              const value = e.target.value;
              setBidAmount(value === '' ? null : Number(value));
            }}
            placeholder="Enter bid amount"
            required
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