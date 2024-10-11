import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import CreateAuction from '../components/CreateAuction';
import styles from '../styles/Home.module.css';

interface AuctionInput {
  title: string;
  currentBid: number;
  endTime: string;
}

export default function Create() {
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleCreateAuction = async (newAuction: AuctionInput) => {
    try {
      if (!backendUrl) {
        throw new Error('Backend URL is not defined in environment variables');
      }

      const itemData = {
        name: newAuction.title,
        description: "Description of the item",
        minimumPrice: newAuction.currentBid,
        endTime: newAuction.endTime
      };
  
      const response = await fetch(`${backendUrl}/items/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create auction: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
      }
  
      const createdAuction = await response.json();
      console.log('Auction created:', createdAuction);
      
      router.push('/auctions');
    } catch (error) {
      console.error('Error creating auction:', error);
      // TODO: Implement proper error handling, e.g., showing an error message to the user
      alert('Failed to create auction. Please try again.');
    }
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
