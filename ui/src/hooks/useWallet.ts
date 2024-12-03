// hooks/useWallet.ts
import { useState, useEffect } from 'react';

interface Window {
  mina?: {
    requestAccounts(): Promise<string[]>;
    getAccounts(): Promise<string[]>;
    sendPayment(params: {
      to: string;
      amount: number;
      fee?: number;
      memo?: string;
    }): Promise<{ hash: string }>;
  };
}

export const useWallet = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).mina) {
        const accounts = await (window as any).mina.requestAccounts();
        if (accounts && accounts[0]) {
          setAddress(accounts[0]);
          setConnected(true);
          return accounts[0];
        }
      } else {
        throw new Error('Please install Auro Wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const sendTransaction = async (to: string, amount: string) => {
    try {
      if (!(window as any).mina) {
        throw new Error('Auro Wallet not installed');
      }
      
      if (!connected) {
        throw new Error('Wallet not connected');
      }

      // According to Mina docs, amount should be in MINA units
      const response = await (window as any).mina.sendPayment({
        to,          // Recipient's address
        amount,      // Amount in MINA
        fee: 0.1,    // Fee in MINA
      });
      
      if (!response || !response.hash) {
        throw new Error('Transaction failed - no hash returned');
      }

      console.log('Transaction successful:', response.hash);
      return response.hash;
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && (window as any).mina) {
        try {
          const accounts = await (window as any).mina.getAccounts();
          if (accounts && accounts[0]) {
            setAddress(accounts[0]);
            setConnected(true);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  return {
    address,
    connected,
    connectWallet,
    sendTransaction,
  };
};
