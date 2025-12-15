'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Navbar from './components/Navbar';
import SweetCard from './components/SweetCard';

interface Sweet {
  id: number;
  name: string;
  price: number;
  category: string;
  quantity: number;
  imageUrl?: string;
}

export default function Home() {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchSweets() {
      const res = await fetch('/api/sweets');
      const data = await res.json();
      setSweets(data);
      setLoading(false);
    }
    fetchSweets();
  }, []);

  const filteredSweets = sweets.filter(sweet =>
    sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sweet.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar />

      {/* Hero */}
      <header className="relative h-[420px] w-full bg-gradient-to-r from-pink-400 to-pink-600 flex items-center justify-center text-white">
        <div className="z-10 text-center px-6">
          <h1 className="text-5xl font-bold mb-4">Sweet Treats</h1>
          <p className="text-xl">
            Handmade Indian & Western sweets delivered fresh.
          </p>
        </div>

        <Image
          src="https://media.istockphoto.com/id/1054228718/photo/indian-sweets-in-a-plate-includes-gulab-jamun-rasgulla-kaju-katli-morichoor-bundi-laddu.jpg?s=612x612&w=0&k=20&c=hYWCXLaldKvhxdBa83M0RnUij7BCmhf-ywWdvyIXR40="
          alt="hero sweets"
          fill
          className="object-cover opacity-30"
        />
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-6 text-center text-pink-700">
          Our Sweets
        </h2>

        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search sweets..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-pink-300
                       focus:outline-none focus:ring-2 focus:ring-pink-400
                       text-pink-700 placeholder-pink-400"
          />
        </div>

        {loading ? (
          <p className="text-center text-pink-500">Loading sweets...</p>
        ) : filteredSweets.length === 0 ? (
          <p className="text-center text-pink-500">
            No sweets match your search.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredSweets.map(sweet => (
              <SweetCard key={sweet.id} sweet={sweet} />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-pink-700 text-white text-center py-6 mt-12">
        <p>
          &copy; {new Date().getFullYear()} Sweet Treats. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
