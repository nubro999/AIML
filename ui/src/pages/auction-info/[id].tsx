// pages/auction/[auctionId].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/AuctionInfo.module.css';
import Header from '@/components/Header';

interface AuctionInfo {
  winnerAddress: string;
  winningBid: number;
  itemName: string;
  endTime: string;
  nftImage: string;
  contractAddress: string;
  id: string;
  description: string;
  creator: string;
}

const DUMMY_AUCTION_DATA: { [key: string]: AuctionInfo } = {
  "1": {
    winnerAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    winningBid: 50,
    itemName: "Rare Digital Art #1",
    endTime: "2024-10-25T15:30:00Z",
    nftImage: "https://picsum.photos/400/400", // Using a real test image
    contractAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    id: "1234",
    description: "A unique piece of digital art representing the future of creativity in the digital age.",
    creator: "0xArtist123..."
  },
  "2": {
    winnerAddress: "0x123456789...",
    winningBid: 70,
    itemName: "Rare Digital Art #2",
    endTime: "2024-10-26T15:30:00Z",
    nftImage: "https://picsum.photos/400/400", // Using a real test image
    contractAddress: "0x123456789...",
    id: "5678",
    description: "Another amazing piece of digital art.",
    creator: "0xArtist456..."
  }
};

const AuctionInfo = () => {
  const router = useRouter();
  const { id } = router.query;
  const [auctionInfo, setAuctionInfo] = useState<AuctionInfo | null>(null);
  const [bidKey, setBidKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [personalBidInfo, setPersonalBidInfo] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const data = DUMMY_AUCTION_DATA[id as string];
      console.log("Found data:", data); // Debug log
      if (data) {
        setAuctionInfo(data);
      }
    }
  }, [id]);
  

  const handleVerifyBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulate API verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dummy verification logic
      if (bidKey === "12345") {
        setPersonalBidInfo({
          bidAmount: 2.3,
          timestamp: "2024-10-25T14:30:00Z",
          isWinner: false
        });
      } else {
        setError('Invalid bid key. Please check and try again.');
      }
    } catch (err) {
      setError('An error occurred while verifying your bid.');
    } finally {
      setLoading(false);
    }
  };

  if (!auctionInfo) {
    return <div className={styles.loading}>Loading auction information...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Header />
      </header>
      <main className={styles.mainContent}>
        <div className={styles.twoColumnLayout}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            <div className={styles.infoCard}>
              <h3>Auction Information</h3>
              <p>Item: {auctionInfo.itemName}</p>
              <p>End Time: {new Date(auctionInfo.endTime).toLocaleString()}</p>
              <p>Winning Bid: {auctionInfo.winningBid} MINA</p>
              
              <div className={styles.winnerInfo}>
                <h4>Winner Information</h4>
                <p>Winner Address: {auctionInfo.winnerAddress}</p>
              </div>
            </div>

            {/* NFT Details Section */}
            <div className={styles.nftDetailsSection}>
              <h3>NFT Details</h3>
              <div className={styles.nftContent}>
                <div className={styles.nftImageContainer}>
                  <img 
                    src={auctionInfo.nftImage} 
                    alt={auctionInfo.itemName}
                    className={styles.nftImage}
                  />
                </div>
                <div className={styles.nftInfo}>
                  <div className={styles.infoRow}>
                    <strong>Contract Address:</strong>
                    <span>{auctionInfo.contractAddress}</span>
                    <button 
                      className={styles.copyButton}
                      onClick={() => navigator.clipboard.writeText(auctionInfo.contractAddress)}
                    >
                      Copy
                    </button>
                  </div>
                  <div className={styles.infoRow}>
                    <strong>Token ID:</strong>
                    <span>{auctionInfo.id}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <strong>Creator:</strong>
                    <span>{auctionInfo.creator}</span>
                  </div>
                  <div className={styles.descriptionRow}>
                    <strong>Description:</strong>
                    <p>{auctionInfo.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            <div className={styles.bidVerification}>
              <h3>Verify Your Bid</h3>
              <p>Enter your bid key to see your bid information</p>
              
              <form onSubmit={handleVerifyBid} className={styles.bidKeyForm}>
                <input
                  type="text"
                  value={bidKey}
                  onChange={(e) => setBidKey(e.target.value)}
                  placeholder="Enter your bid key"
                  className={styles.bidKeyInput}
                  disabled={loading}
                />
                <button 
                  type="submit" 
                  className={styles.verifyButton}
                  disabled={loading || !bidKey}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </form>

              {error && <div className={styles.error}>{error}</div>}

              {personalBidInfo && (
                <div className={styles.personalBidInfo}>
                  <h4>Your Bid Information</h4>
                  <p>Bid Amount: {personalBidInfo.bidAmount} MINA</p>
                  <p>Timestamp: {new Date(personalBidInfo.timestamp).toLocaleString()}</p>
                  <div className={styles.bidStatus}>
                    Status: 
                    <span className={personalBidInfo.isWinner ? styles.winner : styles.notWinner}>
                      {personalBidInfo.isWinner ? 'Winner!' : 'Not the winning bid'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <footer className={styles.footer}>
        <p>© 2024 NFT Auction Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuctionInfo;
