// pages/auction/[auctionId].tsx
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from '@/styles/AuctionInfo.module.css';
import Header from '@/components/Header';
import { useWallet } from '@/hooks/useWallet';
import { Mina, PublicKey } from 'o1js';

interface AuctionWinner {
  winningKey: string;
  winningBid: string | number; // depending on your data type
  winnerAddress: string;
}

interface PersonalBidInfo {
  bidAmount: string | number;
  bidtxid: string;
  merkleroot: string;
  timestamp: string;
  isWinner: boolean;
}

interface AuctionInfo {
  id: number;
  name: string;
  description: string;
  minimumPrice: number;
  endTime: string;
  zkappAddress: string;
  deploymentHash: string;
  type: string;
  createdAt: string;
  auctionWinner: {
    id: number;
    winningBid: string;
    winningKey: string;
    winTime: string;
    winnerAddress: string;
  } | null;
}

const AuctionInfo = () => {
  const router = useRouter();
  const { id } = router.query;
  const [auctionInfo, setAuctionInfo] = useState<AuctionInfo | null>(null);
  const [bidKey, setBidKey] = useState('');
  const [error, setError] = useState('');
  const [isloading, setLoading] = useState(false);
  const [personalBidInfo, setPersonalBidInfo] = useState<PersonalBidInfo | null>(null);
  const { address, connected, connectWallet, sendTransaction } = useWallet();
  const [isBuying, setIsBuying] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const RECIPIENT_ADDRESS = 'B62qkUQoebsMDhaC6vn1PiherKgNeMW4p1hxWKhFw7xkNZwjy4zhDRJ';

  useEffect(() => {
    fetchAuctionDetails();

  }, [id]);

  const fetchAuctionDetails = async () => {
    if (id) {
      try {
        const response = await fetch(`${backendUrl}/items/${id}`);
        console.log(response)
        if (!response.ok) {
          throw new Error('Failed to fetch auction details');
        }
        const data = await response.json();
        setAuctionInfo(data);
        console.log(auctionInfo)
      } catch (error) {
        console.error('Error fetching auction details:', error);
        setError('Failed to load auction details');
      }
    }
  };


  const handleVerifyBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const itemId = router.query.id;
      if (!itemId || !bidKey) {
        setError('Missing item ID or bid key');
        return;
      }

      // Make API call to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auction-log/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: Number(itemId),
          key: Number(bidKey)
        }),
      });

      console.log(response)

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify bid');
      }

      const bidData = await response.json();

      if (bidData) {
        setPersonalBidInfo({
          bidAmount: bidData.bidAmount,
          timestamp: bidData.bidTime,
          bidtxid: bidData.transactionHash,
          merkleroot: bidData.merkleRoot || '',
          isWinner: bidData.bidAmount == auctionInfo?.auctionWinner?.winningBid

        });
      } else {
        setError('No bid found with the provided key.');
      }
    } catch (err) {
      console.error('Bid verification error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while verifying your bid.');
    } finally {
      setLoading(false);
    }
  };


  // Add this new function
  const handleBuyItem = async () => {
    if (!auctionInfo?.auctionWinner) return;
    
    setIsBuying(true);
    setError('');
    
    try {
      if (!connected) {
        await connectWallet();
      }

      const winningBidAmount = auctionInfo.auctionWinner.winningBid;
      
      // Send transaction
      const hash = await sendTransaction(RECIPIENT_ADDRESS, winningBidAmount);
      setTxHash(hash);


      // Refresh auction details
      await fetchAuctionDetails();
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setIsBuying(false);
    }
  };


  const truncateString = (str: string, startLength: number = 6, endLength: number = 4) => {
    if (str.length <= startLength + endLength) return str;
    return `${str.slice(0, startLength)}...${str.slice(-endLength)}`;
  };
  
  const isWinner = auctionInfo?.auctionWinner?.winnerAddress === address;


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
              <p>Item: {auctionInfo.name}</p>
              <p>End Time: {new Date(auctionInfo.endTime).toLocaleString()}</p>
              <p>Winning Key: {auctionInfo.auctionWinner?.winningKey} </p>
              <p>Winning Bid: {auctionInfo.auctionWinner?.winningBid} MINA</p>
              
              <div className={styles.winnerInfo}>
                <h4>Winner Information</h4>
                <p>Winner Address: {auctionInfo.auctionWinner?.winnerAddress}</p>
              </div>
            </div>
  
            {/* NFT Details Section */}
            <div className={styles.nftDetailsSection}>
              <h3>NFT Details</h3>
              <div className={styles.nftContent}>
                <div className={styles.nftImageContainer}>
                  <Image 
                    src="/assets/skull.png"
                    alt={auctionInfo.name}
                    width={0}
                    height={0}
                    sizes="100%"
                    className={styles.nftImage}
                    priority
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxWidth: '400px'
                    }}
                  />


                </div>
                <div className={styles.nftInfo}>
                  <div className={styles.infoRow}>
                    <strong>Contract Address:</strong>
                    <span>{auctionInfo.zkappAddress}</span>
                    <button 
                      className={styles.copyButton}
                      onClick={() => navigator.clipboard.writeText(auctionInfo.zkappAddress)}
                    >
                      Copy
                    </button>
                  </div>
                  <div className={styles.infoRow}>
                    <strong>Auction ID:</strong>
                    <span>{auctionInfo.id}</span>
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
                  disabled={isloading}
                />
                <button 
                  type="submit" 
                  className={styles.verifyButton}
                  disabled={isloading || !bidKey}
                >
                  {isloading ? 'Verifying...' : 'Verify'}
                </button>
              </form>
  
              {error && <div className={styles.error}>{error}</div>}
  
              {personalBidInfo && (
                <div className={styles.personalBidInfo}>
                  <h4>Your Bid Information</h4>
                  <div className={styles.bidInfoGrid}>
                    <div className={styles.bidInfoItem}>
                      <label>Bid Amount:</label>
                      <span>{personalBidInfo.bidAmount} MINA</span>
                    </div>
                    
                    <div className={styles.bidInfoItem}>
                      <label>Transaction:</label>
                      <a 
                        href={`https://devnet.minaexplorer.com/transaction/${personalBidInfo.bidtxid}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.transactionLink}
                      >
                        View on Explorer →
                      </a>
                    </div>
  
                    <div className={styles.bidInfoItem}>
                      <label>Merkle Root:</label>
                      <div className={styles.merkleContainer}>
                        <span>{truncateString(personalBidInfo.merkleroot, 6, 4)}</span>
                        <button 
                          className={styles.copyButton}
                          onClick={() => navigator.clipboard.writeText(personalBidInfo.merkleroot)}
                          title="Copy full merkle root"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
  
                    <div className={styles.bidInfoItem}>
                      <label>Timestamp:</label>
                      <span>{new Date(personalBidInfo.timestamp).toLocaleString()}</span>
                    </div>
  
                    <div className={styles.bidInfoItem}>
                      <label>Status:</label>
                      <span className={personalBidInfo.isWinner ? styles.winner : styles.notWinner}>
                        {personalBidInfo.isWinner ? 'Winner!' : 'Not the winning bid'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
  
            {/* Payment Section */}
            {isWinner && (
              <div className={styles.paymentSection}>
                <h3>Complete Your Purchase</h3>
                <p>As the auction winner, you can now complete your purchase.</p>
                
                <div className={styles.buyButtonContainer}>
                  {!connected ? (
                    <button
                      className={styles.connectButton}
                      onClick={connectWallet}
                    >
                      Connect Wallet to Pay
                    </button>
                  ) : (
                    <>
                      <div className={styles.paymentDetails}>
                        <div className={styles.paymentRow}>
                          <span>Winning Bid:</span>
                          <span className={styles.bidAmount}>
                            {auctionInfo.auctionWinner?.winningBid} MINA
                          </span>
                        </div>
                        <div className={styles.paymentRow}>
                          <span>Recipient:</span>
                          <span className={styles.addressText}>
                            {truncateString(RECIPIENT_ADDRESS)}
                            <button 
                              className={styles.copyButton}
                              onClick={() => navigator.clipboard.writeText(RECIPIENT_ADDRESS)}
                            >
                              Copy
                            </button>
                          </span>
                        </div>
                        <div className={styles.paymentRow}>
                          <span>Status:</span>
                          <span className={styles.paymentStatus}>
                            {txHash ? 'Transaction Submitted' : 'Pending Payment'}
                          </span>
                        </div>
                      </div>
  
                      <button
                        className={styles.buyButton}
                        onClick={handleBuyItem}
                        disabled={isBuying || txHash !== null}
                      >
                        {isBuying ? (
                          <span className={styles.loadingSpinner}>Processing Payment...</span>
                        ) : txHash ? (
                          'Payment Completed'
                        ) : (
                          `Pay ${auctionInfo.auctionWinner?.winningBid} MINA`
                        )}
                      </button>
                      
                      {txHash && (
                        <div className={styles.transactionInfo}>
                          <p>Transaction submitted successfully!</p>
                          <p>The Item will be Transfered to Your Wallet</p>

                          <a
                            href={`https://berkeley.minaexplorer.com/transaction/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.transactionLink}
                          >
                            View on Explorer →
                          </a>
                        </div>
                      )}
  
                      {error && (
                        <div className={styles.error}>
                          <p>{error}</p>
                          <button 
                            className={styles.retryButton}
                            onClick={() => {
                              setError('');
                              setTxHash(null);
                            }}
                          >
                            Retry Payment
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className={styles.footer}>
        <p>&copy; 2024 Silent-Auction. All rights reserved.</p>
      </footer>
    </div>
  );
  
};

export default AuctionInfo;
