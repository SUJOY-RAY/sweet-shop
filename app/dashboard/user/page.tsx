'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import SweetCard from '../../components/SweetCard';

interface Sweet {
  id: number;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [sweets, setSweets] = useState<Sweet[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('/api/sweets')
      .then(res => res.json())
      .then(data => setSweets(data));
  }, [router]);

  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-pink-700 mb-6">
          Welcome to Sweet Shop
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {sweets.map(s => (
            <SweetCard key={s.id} sweet={s} />
          ))}
        </div>
      </main>
    </div>
  );
}
