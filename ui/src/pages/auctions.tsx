import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import auctionStyles from '../styles/Auctions.module.css';
import { useRouter } from 'next/router';
import Header from '@/components/Header';

interface Auction {
  id: number;
  name: string;
  description: string;
  minimumPrice: number;
  endTime: string;
}

export default function Auctions() {
  
  const [auctions, setAuctions] = useState<Auction[]>([]);
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
      const response = await fetch(`${backendUrl}/items/running`); // Adjust this URL to match your backend API endpoint\
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

  const handleAuctionClick = (auctionId: number) => {
    router.push(`/bid/${auctionId}`);
  };

  return (
    <div className={styles.container}>
      <Header/>


      <main className={styles.main}>
        <h2 className={styles.title}>Current Auctions</h2>
        {loading ? (
          <p>Loading auctions...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : auctions.length > 0 ? (
          <div className={auctionStyles.auctionScrollContainer}>
            <div className={auctionStyles.auctionRow}>
              {auctions.map((auction) => (
                <button
                  key={auction.id}
                  className={auctionStyles.auctionItem}
                  onClick={() => handleAuctionClick(auction.id)}
                >
                  <h3>{auction.name}</h3>
                  <p>{auction.description}</p>
                  <p>Minimum Price: ${auction.minimumPrice}</p>
                  <p>End Time: {new Date(auction.endTime).toLocaleString()}</p>
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
