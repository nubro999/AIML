import React from 'react';
import Link from 'next/link';
import styles from '../styles/AuctionList.module.css';

interface Auction {
  id: number;
  title: string;
  currentBid: number;
  endTime: string;
}

interface AuctionListProps {
  auctions: Auction[];
}

const AuctionList: React.FC<AuctionListProps> = ({ auctions }) => {
  return (
    <div className={styles.auctionList}>
      {auctions.map((auction) => (
        <div key={auction.id} className={styles.auctionItem}>
          <h3>{auction.title}</h3>
          <p>Current Bid: ${auction.currentBid}</p>
          <p>Ends at: {new Date(auction.endTime).toLocaleString()}</p>
          <Link href={`/bid/${auction.id}`} className={styles.bidButton}>
            Place Bid
          </Link>
        </div>
      ))}
    </div>
  );
};

export default AuctionList;