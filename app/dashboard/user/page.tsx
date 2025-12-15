'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import CartCard from '../../components/CartCard';
import { get, del } from '@/utils/http';

interface Sweet {
  id: number;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
}

interface CartItem {
  id: number;
  sweet: Sweet;
  quantity: number;
}

interface CartResponse {
  items: CartItem[];
}

export default function UserDashboard() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const getToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchCart = async () => {
      try {
        const data = await get<CartResponse>('/api/cart', token);
        setCartItems(data.items ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [router]);

  const filteredItems = cartItems.filter(item =>
    item.sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sweet.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemove = async (itemId: number) => {
    const token = getToken();
    if (!token) return;

    setCartItems(prev => prev.filter(item => item.id !== itemId));

    try {
      await del<{ success: boolean }>(`/api/cart/remove/${itemId}`, token);
    } catch (err) {
      console.error(err);

      try {
        const data = await get<CartResponse>('/api/cart', token);
        setCartItems(data.items ?? []);
      } catch { }
    }
  };

  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-pink-700 mb-6">
          Your Cart
        </h1>

        {/* Search Bar */}
        <div className="mb-6 max-w-md">
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
          <p className="text-pink-500">Loading your cart...</p>
        ) : cartItems.length === 0 ? (
          <p className="text-pink-500">Your cart is empty.</p>
        ) : filteredItems.length === 0 ? (
          <p className="text-pink-500">No sweets match your search.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <CartCard
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onQuantityChange={(itemId, newQuantity) => {
                  setCartItems(prev =>
                    prev.map(ci =>
                      ci.id === itemId
                        ? { ...ci, quantity: newQuantity }
                        : ci
                    )
                  );
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
