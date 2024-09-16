import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/Home.module.css';
import bidStyles from '../../styles/Bid.module.css';

interface Auction {
  id: number;
  title: string;
  currentBid: number;
  endTime: string;
}

export default function Bid() {
  const router = useRouter();
  const { id } = router.query;
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState('');

  useEffect(() => {
    if (id) {
      // Fetch auction details from an API
      // This is a mock implementation
      setAuction({
        id: Number(id),
        title: `Auction Item ${id}`,
        currentBid: 100,
        endTime: new Date(Date.now() + 86400000).toISOString(),
      });
    }
  }, [id]);

  const handleBid = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would send the bid to your backend
    console.log(`Placed bid of $${bidAmount} on auction ${id}`);
    // Update the current bid or show a success message
  };

  if (!auction) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <Head>
        <title>{auction.title} - AuctionHub</title>
        <meta name="description" content={`Bid on ${auction.title}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <h1>AuctionHub</h1>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/auctions">Auctions</Link>
          <Link href="/create">Create Auction</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <h2 className={styles.title}>{auction.title}</h2>
        <div className={bidStyles.auctionDetails}>
          <p>Current Bid: ${auction.currentBid}</p>
          <p>Ends at: {new Date(auction.endTime).toLocaleString()}</p>
        </div>
        <form onSubmit={handleBid} className={bidStyles.bidForm}>
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="Enter bid amount"
            required
            min={auction.currentBid + 1}
          />
          <button type="submit">Place Bid</button>
        </form>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2023 AuctionHub. All rights reserved.</p>
      </footer>
    </div>
  );
}