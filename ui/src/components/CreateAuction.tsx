import React, { useState } from 'react';
import styles from '../styles/CreateAuction.module.css';

interface NewAuction {
  title: string;
  currentBid: number;
  endTime: string;
}

interface CreateAuctionProps {
  onCreateAuction: (newAuction: NewAuction) => void;
}

const CreateAuction: React.FC<CreateAuctionProps> = ({ onCreateAuction }) => {
  const [title, setTitle] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [duration, setDuration] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAuction: NewAuction = {
      title,
      currentBid: Number(startingBid),
      endTime: new Date(Date.now() + Number(duration) * 3600000).toISOString(),
    };
    onCreateAuction(newAuction);
  };

  return (
    <div className={styles.createAuction}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Item Title"
          required
        />
        <input
          type="number"
          value={startingBid}
          onChange={(e) => setStartingBid(e.target.value)}
          placeholder="Starting Bid"
          required
        />
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Duration (hours)"
          required
        />
        <button type="submit">Create Auction</button>
      </form>
    </div>
  );
};

export default CreateAuction;