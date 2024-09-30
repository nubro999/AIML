import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import ZkappWorkerClient from './zkappWorkerClient';
import { PublicKey, Field } from 'o1js';

let transactionFee = 0.1;
const ZKAPP_ADDRESS = 'B62qo5pT5pooYvwcmZ44BSMwpBNNpDtyqqe9GLXceTvY4T5f9Dj2xRr';

export default function Home() {
  const [state, setState] = useState({
    zkappWorkerClient: null as null | ZkappWorkerClient,
    hasWallet: null as null | boolean,
    hasBeenSetup: false,
    accountExists: false,
    publicKey: null as null | PublicKey,
    zkappPublicKey: null as null | PublicKey,
    creatingTransaction: false,
    currentNum: null as null | Field,
  });

  const [displayText, setDisplayText] = useState('');
  const [transactionLink, setTransactionLink] = useState('');

  useEffect(() => {
    (async () => {
      if (!state.hasBeenSetup) {
        setDisplayText('Loading web worker...');
        const zkappWorkerClient = new ZkappWorkerClient();
        
        setDisplayText('Setting active instance to devnet...');
        await zkappWorkerClient.setActiveInstanceToDevnet();

        const mina = (window as any).mina;
        if (mina == null) {
          setState({ ...state, hasWallet: false });
          return;
        }

        const publicKeyBase58 = (await mina.requestAccounts())[0];
        const publicKey = PublicKey.fromBase58(publicKeyBase58);

        setDisplayText(`Using key:${publicKey.toBase58()}`);
        console.log(`Using key:${publicKey.toBase58()}`)
        setDisplayText('Checking if fee payer account exists...');
        const res = await zkappWorkerClient.fetchAccount({ publicKey: publicKey! });
        const accountExists = res.error == null;

        setDisplayText('Loading contract...');
        await zkappWorkerClient.loadContract();
        
        setDisplayText('Compiling contract...');
        await zkappWorkerClient.compileContract();
        
        setDisplayText('Initializing zkApp instance...');
        const zkappPublicKey = PublicKey.fromBase58(ZKAPP_ADDRESS);
        await zkappWorkerClient.initZkappInstance(zkappPublicKey);
        
        setDisplayText('Getting zkApp state...');
        await zkappWorkerClient.fetchAccount({ publicKey: zkappPublicKey });
        const currentNum = await zkappWorkerClient.getMerkleMapRoot();
        console.log("currentNum" + currentNum)
        setDisplayText('');
        setState({ 
          ...state, 
          zkappWorkerClient, 
          hasWallet: true,
          hasBeenSetup: true, 
          publicKey, 
          zkappPublicKey, 
          accountExists, 
          currentNum 
        });
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (state.hasBeenSetup && !state.accountExists) {
        for (;;) {
          setDisplayText('Checking if fee payer account exists...');
          const res = await state.zkappWorkerClient!.fetchAccount({
            publicKey: state.publicKey!,
          });
          const accountExists = res.error == null;
          if (accountExists) {
            setState({ ...state, accountExists: true });
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    })();
  }, [state.hasBeenSetup]);

  const onUpdateRoot = async () => {
    setState({ ...state, creatingTransaction: true });
    setDisplayText('Creating a transaction...');

    try {
      await state.zkappWorkerClient!.fetchAccount({ publicKey: state.publicKey! });

      setDisplayText('Creating update transaction...');
      await state.zkappWorkerClient!.createUpdateTransaction();
      
      setDisplayText('Creating proof...');
      await state.zkappWorkerClient!.proveUpdateTransaction();
      
      setDisplayText('Getting transaction JSON...');
      const transactionJSON = await state.zkappWorkerClient!.getTransactionJSON();

      setDisplayText('Sending transaction...');
      const { hash } = await (window as any).mina.sendTransaction({
        transaction: transactionJSON,
        feePayer: {
          fee: transactionFee,
          memo: '',
        },
      });

      const transactionLink = `https://minascan.io/devnet/tx/${hash}`;
      console.log(`View transaction at ${transactionLink}`);
      setTransactionLink(transactionLink);

      setDisplayText('Getting updated state...');
      const currentNum = await state.zkappWorkerClient!.getMerkleMapRoot();
      setState({ ...state, creatingTransaction: false, currentNum });
    } catch (error) {
      console.error('Error during update:', error);
      setDisplayText('Error during update. Please try again.');
      setState({ ...state, creatingTransaction: false });
    }
  };

  let setupContent;
  if (state.hasWallet === false) {
    const auroLink = 'https://www.aurowallet.com/';
    setupContent = (
      <div>
        Could not find a wallet. <a href={auroLink} target="_blank" rel="noreferrer">Install Auro wallet here</a>
      </div>
    );
  } else if (state.hasBeenSetup && !state.accountExists) {
    const faucetLink = `https://faucet.minaprotocol.com/?address=${state.publicKey!.toBase58()}`;
    setupContent = (
      <div>
        Account does not exist. <a href={faucetLink} target="_blank" rel="noreferrer">Visit the faucet to fund this account</a>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>AuctionHub</title>
        <meta name="description" content="Bid on exciting items!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <Link href="/">
          <h1>AuctionHub</h1>
        </Link>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/auctions">Auctions</Link>
          <Link href="/create">Create Auction</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h2>Welcome to AuctionHub</h2>
          <p>Discover unique items and place your bids in our exciting online auctions!</p>
        </section>

        <div className={styles.grid}>
          <Link href="/auctions" className={styles.card}>
            <h3>View Auctions &rarr;</h3>
            <p>Browse our current auctions and place your bids.</p>
          </Link>
          <Link href="/create" className={styles.card}>
            <h3>Create Auction &rarr;</h3>
            <p>List your item for auction and start receiving bids.</p>
          </Link>
        </div>

        <div className={styles.zkappSection}>
          <h3>ZKApp Interaction</h3>
          <p>Current Root: {state.currentNum ? state.currentNum.toString() : 'Loading...'}</p>
          <p>Setup Status: {state.hasBeenSetup ? 'Complete' : 'In Progress'}</p>
          {setupContent}
          {displayText && <p>{displayText}</p>}
          {transactionLink && (
            <p>
              <a href={transactionLink} target="_blank" rel="noreferrer">View Transaction</a>
            </p>
          )}
          <button 
            onClick={onUpdateRoot} 
            disabled={!state.hasBeenSetup || state.creatingTransaction || !state.accountExists}
          >
            {state.creatingTransaction ? 'Updating...' : 'Update Root'}
          </button>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2024 AuctionHub. All rights reserved.</p>
      </footer>
    </div>
  );
}
