import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import CreateAuction from '../components/CreateAuction';
import styles from '../styles/Home.module.css';

interface Auction {
  id: number;
  title: string;
  currentBid: number;
  endTime: string;
}

export default function Create() {
  const router = useRouter();

  const handleCreateAuction = (newAuction: Omit<Auction, 'id'>) => {
    const storedAuctions = localStorage.getItem('auctions');
    const auctions = storedAuctions ? JSON.parse(storedAuctions) : [];
    const auctionWithId = { ...newAuction, id: Date.now() };
    const updatedAuctions = [...auctions, auctionWithId];
    localStorage.setItem('auctions', JSON.stringify(updatedAuctions));
    router.push('/auctions');
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Auction - AuctionHub</title>
        <meta name="description" content="Create a new auction" />
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
        <h2 className={styles.title}>Create New Auction</h2>
        <CreateAuction onCreateAuction={handleCreateAuction} />
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2023 AuctionHub. All rights reserved.</p>
      </footer>
    </div>
  );
}