'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import CartCard from '../../components/CartCard';

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

export default function UserDashboard() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    async function fetchCart() {
      try {
        const res = await fetch('/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch cart');
        const data = await res.json();
        setCartItems(data.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCart();
  }, [router]);

  const handleRemove = async (itemId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`/api/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to remove item');
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-pink-700 mb-6">Your Cart</h1>

        {loading ? (
          <p className="text-pink-500">Loading your cart...</p>
        ) : cartItems.length === 0 ? (
          <p className="text-pink-500">Your cart is empty.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cartItems.map(item => (
              <CartCard
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onQuantityChange={(itemId, newQuantity) => {
                  setCartItems(prev =>
                    prev.map(ci => (ci.id === itemId ? { ...ci, quantity: newQuantity } : ci))
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
