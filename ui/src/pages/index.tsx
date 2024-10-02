import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import ZkappWorkerClient from './zkappWorkerClient';
import { PublicKey, Field } from 'o1js';


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
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2024 AuctionHub. All rights reserved.</p>
      </footer>
    </div>
  );
}
