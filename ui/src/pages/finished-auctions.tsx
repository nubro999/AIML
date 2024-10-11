import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import Header from '@/components/Header';

interface FinishedAuction {
  id: number;
  title: string;
  name: string;
  description: string;
  minimumPrice: number;
  endTime: string;
  winner: string;
}

export default function FinishedAuctions() {
  const [auctions, setAuctions] = useState<FinishedAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/items/finished`);
      if (!response.ok) {
        throw new Error('Failed to fetch auctions');
      }
      const data = await response.json();
      setAuctions(data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching auctions. Please try again later.');
      setLoading(false);
    }
  };

  const handleAuctionClick = (id: number) => {
    router.push(`/auction-history/${id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <h2 className={styles.title}>Finished Auctions</h2>
        {loading ? (
          <p>Loading auctions...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : auctions.length > 0 ? (
          <div className={styles.auctionScrollContainer}>
            <div className={styles.auctionGrid}>
              {auctions.map((auction) => (
                <div 
                  key={auction.id} 
                  className={styles.auctionBox}
                  onClick={() => handleAuctionClick(auction.id)}
                >
                  <h3 className={styles.auctionTitle}>{auction.title}</h3>
                  <p className={styles.auctionInfo}>Name: {auction.name}</p>
                  <p className={styles.auctionInfo}>Description: {auction.description}</p>
                  <p className={styles.auctionInfo}>MinimunPrice: {auction.minimumPrice}</p>
                  <p className={styles.auctionInfo}>End Time: {formatDate(auction.endTime)}</p>
                  <p className={styles.auctionInfo}>Winner: {auction.winner}</p>
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
