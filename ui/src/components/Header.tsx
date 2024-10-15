// components/Header.tsx
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

interface HeaderProps {
  title?: string;
  description?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "AuctionHub", 
  description = "Bid on exciting items!" 
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className={styles.header}>
        <Link href="/">
          <h1>AuctionHub</h1>
        </Link>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/auctions">Live Auctions</Link>
          <Link href="/create">Create New Auction</Link>
          <Link href="/finished-auctions">Finished Auctions</Link>

        </nav>
      </header>
    </>
  );
};

export default Header;
