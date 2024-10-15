import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from '../../styles/Home.module.css';
import Header from '@/components/Header';
  

interface BidHistory {
  timestamp: string;
  amount: number;
}

export default function AuctionHistory() {
  const router = useRouter();
  const { id } = router.query;
  const [bidHistory, setBidHistory] = useState<BidHistory[]>([]);

  useEffect(() => {
    if (id) {
      console.log(id)
      // Fetch bid history data here. For now, we'll use dummy data.
      const dummyBidHistory: BidHistory[] = [
        { timestamp: '2023-03-28', amount: 100 },
        { timestamp: '2023-03-29', amount: 150 },
        { timestamp: '2023-03-30', amount: 200 },
        { timestamp: '2023-03-31', amount: 250 },
        { timestamp: '2023-04-01', amount: 500 },
      ];
      setBidHistory(dummyBidHistory);
    }
  }, [id]);

  return (
    <div className={styles.container}>
      <Header/>

      <main className={styles.main}>
        <h2 className={styles.title}>Auction #{id} Bid History</h2>
        <div className={styles.chartContainer}>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2023 AuctionHub. All rights reserved.</p>
      </footer>
    </div>
  );
}