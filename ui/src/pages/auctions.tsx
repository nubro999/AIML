import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
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
  const [sortOption, setSortOption] = useState('default');
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchAuctions();
  }, []);

  useEffect(() => {
    if (auctions.length > 0) {
      sortAuctions(sortOption);
    }
  }, [sortOption]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/items/running`);
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

  const sortAuctions = (option: string) => {
    let sortedAuctions = [...auctions];
    switch (option) {
      case 'priceAsc':
        sortedAuctions.sort((a, b) => a.minimumPrice - b.minimumPrice);
        break;
      case 'priceDesc':
        sortedAuctions.sort((a, b) => b.minimumPrice - a.minimumPrice);
        break;
      case 'endingSoon':
        sortedAuctions.sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());
        break;
      case 'endingLater':
        sortedAuctions.sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());
        break;
      default:
        break;
    }
    setAuctions(sortedAuctions);
    setSortOption(option);
  };


  const handleRegisterClick = (auctionId: number) => {
    router.push(`/register/${auctionId}`);
  };

  const handleLiveAuctionClick = (auctionId: number) => {
    router.push(`/bid/${auctionId}`);
  };

  return (
    <div className={auctionStyles.container}>
      <Header />
      <main className={auctionStyles.mainContent}>
        <h1 className={auctionStyles.title}>Live Auctions</h1>
        
        <div className={auctionStyles.contentWrapper}>
          <div className={auctionStyles.sortSection}>
            <h2>Sort Options</h2>
            <button 
              className={`${auctionStyles.sortButton} ${sortOption === 'priceAsc' ? auctionStyles.active : ''}`}
              onClick={() => sortAuctions('priceAsc')}
            >
              Price: Low to High
            </button>
            <button 
              className={`${auctionStyles.sortButton} ${sortOption === 'priceDesc' ? auctionStyles.active : ''}`}
              onClick={() => sortAuctions('priceDesc')}
            >
              Price: High to Low
            </button>
            <button 
              className={`${auctionStyles.sortButton} ${sortOption === 'endingSoon' ? auctionStyles.active : ''}`}
              onClick={() => sortAuctions('endingSoon')}
            >
              Ending Soon
            </button>
            <button 
              className={`${auctionStyles.sortButton} ${sortOption === 'endingLater' ? auctionStyles.active : ''}`}
              onClick={() => sortAuctions('endingLater')}
            >
              Ending Later
            </button>
          </div>
  
          <div className={auctionStyles.auctionListContainer}>
            <div className={auctionStyles.auctionList}>
              {loading ? (
                <p>Loading auctions...</p>
              ) : error ? (
                <p className={auctionStyles.error}>{error}</p>
              ) : auctions.length > 0 ? (
                auctions.map((auction) => (
                  <div key={auction.id} className={auctionStyles.auctionItem}>
                    <div className={auctionStyles.itemDetails}>
                      <h3>{auction.name}</h3>
                      <p>{auction.description}</p>
                      <p>Minimum Price: {auction.minimumPrice} Mina</p>
                      <p>Ends: {new Date(auction.endTime).toLocaleString()}</p>
                    </div>
                    <div className={auctionStyles.itemActions}>
                      <button 
                        className={auctionStyles.registerButton}
                        onClick={() => handleRegisterClick(auction.id)}
                      >
                        Register to Bid
                      </button>
                      <button 
                        className={auctionStyles.liveAuctionButton}
                        onClick={() => handleLiveAuctionClick(auction.id)}
                      >
                        Live Auction
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No auctions available at the moment.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className={auctionStyles.footer}>
        <p>&copy; 2023 AuctionHub. All rights reserved.</p>
      </footer>
    </div>
  );
}