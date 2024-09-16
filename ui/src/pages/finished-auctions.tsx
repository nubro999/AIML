import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';

interface FinishedAuction {
  id: number;
  title: string;
  finalBid: number;
  endTime: string;
  winner: string;
}

export default function FinishedAuctions() {
  const [finishedAuctions, setFinishedAuctions] = useState<FinishedAuction[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Dummy data for finished auctions
    const dummyFinishedAuctions: FinishedAuction[] = [
      { id: 1, title: "Vintage Watch", finalBid: 500, endTime: "2023-04-01", winner: "user123" },
      { id: 2, title: "Antique Vase", finalBid: 300, endTime: "2023-04-02", winner: "collector456" },
      { id: 3, title: "Rare Comic Book", finalBid: 1000, endTime: "2023-04-03", winner: "comicfan789" },
    ];
    setFinishedAuctions(dummyFinishedAuctions);
  }, []);

  const handleAuctionClick = (id: number) => {
    router.push(`/auction-history/${id}`);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Finished Auctions - AuctionHub</title>
        <meta name="description" content="View finished auctions" />
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
        <h2 className={styles.title}>Finished Auctions</h2>
        {finishedAuctions.length > 0 ? (
          <div className={styles.auctionScrollContainer}>
            <div className={styles.auctionGrid}>
              {finishedAuctions.map((auction) => (
                <div 
                  key={auction.id} 
                  className={styles.auctionBox}
                  onClick={() => handleAuctionClick(auction.id)}
                >
                  <h3>{auction.title}</h3>
                  <p>Final Bid: ${auction.finalBid}</p>
                  <p>End Time: {auction.endTime}</p>
                  <p>Winner: {auction.winner}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>No finished auctions available.</p>
        )}
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2023 AuctionHub. All rights reserved.</p>
      </footer>
    </div>
  );
}