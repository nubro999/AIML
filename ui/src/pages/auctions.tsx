import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import auctionStyles from '../styles/Auctions.module.css';
import { useRouter } from 'next/router';

interface Auction {
  id: number;
  title: string;
  currentBid: number;
  endTime: string;
}

export default function Auctions() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Dummy data for active auctions
    const dummyAuctions: Auction[] = [
      { id: 4, title: "Modern Art Painting", currentBid: 750, endTime: "2023-04-10" },
      { id: 5, title: "Luxury Handbag", currentBid: 400, endTime: "2023-04-11" },
      { id: 6, title: "Signed Sports Jersey", currentBid: 300, endTime: "2023-04-12" },
    ];
    setAuctions(dummyAuctions);
  }, []);

  const handleAuctionClick = (auctionId: number) => {
    router.push(`/bid/${auctionId}`);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Auctions - AuctionHub</title>
        <meta name="description" content="View and bid on current auctions" />
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
          <Link href="/finished-auctions">
            <button className={styles.button}>Finished Auctions</button>
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <h2 className={styles.title}>Current Auctions</h2>
        {auctions.length > 0 ? (
          <div className={auctionStyles.auctionScrollContainer}>
            <div className={auctionStyles.auctionRow}>
              {auctions.map((auction) => (
                <button
                  key={auction.id}
                  className={auctionStyles.auctionItem}
                  onClick={() => handleAuctionClick(auction.id)}
                >
                  <h3>{auction.title}</h3>
                  <p>Current Bid: ${auction.currentBid}</p>
                  <p>End Time: {auction.endTime}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p>No auctions available at the moment.</p>
        )}
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2023 AuctionHub. All rights reserved.</p>
      </footer>
    </div>
  );
}