import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import { Clock, ArrowUpDown, Filter, Loader2 } from 'lucide-react';

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
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
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
    } catch (err) {
      setError('Error fetching auctions. Please try again later.');
    } finally {
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


  const handleLiveAuctionClick = (auctionId: number) => {
    router.push(`/bid/${auctionId}`);
  };

  const sortOptions = [
    { id: 'priceAsc', label: 'Price: Low to High' },
    { id: 'priceDesc', label: 'Price: High to Low' },
    { id: 'endingSoon', label: 'Ending Soon' },
    { id: 'endingLater', label: 'Ending Later' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="py-8 text-center">
          <h1 className="text-4xl font-bold text-pink-500 mb-4 
                       hover:scale-105 transition-transform duration-300">
            Live Auctions
          </h1>
          <div className="w-24 h-1 bg-pink-400 mx-auto rounded-full
                        hover:w-32 transition-all duration-300"/>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sort Options Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24
                          hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-pink-500" />
                <h2 className="text-lg font-semibold text-gray-800">Sort Options</h2>
              </div>
              
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => sortAuctions(option.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg mb-2
                            transition-all duration-200 transform
                            ${sortOption === option.id 
                              ? 'bg-pink-100 text-pink-600 scale-105' 
                              : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600 hover:scale-105'}
                            focus:outline-none focus:ring-2 focus:ring-pink-300
                            active:scale-95`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Auction Items Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                {error}
              </div>
            ) : auctions.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {auctions.map((auction) => (
                  <div 
                    key={auction.id} 
                    className={`bg-white rounded-xl shadow-lg overflow-hidden
                              transition-all duration-300 transform
                              ${hoveredCard === auction.id ? 'scale-105 shadow-xl' : 'hover:shadow-xl'}`}
                    onMouseEnter={() => setHoveredCard(auction.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100 overflow-hidden">
                      <div className="w-full h-48 bg-pink-100 flex items-center justify-center
                                  transition-transform duration-300
                                  hover:scale-110">
                        <span className="text-pink-400">Image Placeholder</span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2
                                   transition-colors duration-200
                                   hover:text-pink-500">
                        {auction.name}
                      </h3>
                      <p className="text-gray-600 mb-4">{auction.description}</p>
                      
                      <div className="flex items-center gap-2 text-gray-500 mb-3
                                    hover:text-pink-500 transition-colors duration-200">
                        <ArrowUpDown className="w-4 h-4" />
                        <span>Minimum Price: {auction.minimumPrice} Mina</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-500 mb-6
                                    hover:text-pink-500 transition-colors duration-200">
                        <Clock className="w-4 h-4" />
                        <span>Ends: {new Date(auction.endTime).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex gap-3">
                          
                        <button
                          onClick={() => handleLiveAuctionClick(auction.id)}
                          className="flex-1 border border-pink-500 text-pink-500 py-2 px-4 rounded-lg
                                   transition-all duration-200 transform
                                   hover:bg-pink-50 hover:scale-105
                                   active:scale-95 active:bg-pink-100
                                   focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                        >
                          Live Auction
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No auctions available at the moment.
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto py-6 px-4 text-center text-gray-600">
          <p>&copy; 2023 Silent-Auction. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}