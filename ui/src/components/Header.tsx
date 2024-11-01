import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
  description?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "SilentAuction", 
  description = "Bid on exciting items!" 
}) => {
  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Live Auctions', path: '/auctions' },
    { name: 'Create New Auction', path: '/create' },
    { name: 'Finished Auctions', path: '/finished-auctions' }
  ];

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <header className="bg-pink-400 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-white hover:text-pink-100 transition-colors">
            Silent-Auction
          </Link>

          <nav className="flex space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className="px-4 py-2 text-white hover:bg-pink-500 rounded-lg
                          transition-colors duration-200 ease-in-out
                          relative group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-full h-0.5 
                               bg-white scale-x-0 group-hover:scale-x-100
                               transition-transform duration-200 ease-in-out" />
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;