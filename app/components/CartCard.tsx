'use client';
import { put, post, del } from '@/utils/http';
import { useState } from 'react';

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

interface CartCardProps {
  item: CartItem;
  onRemove: (itemId: number) => void;
  onQuantityChange?: (itemId: number, quantity: number) => void;
}

export default function CartCard({ item, onRemove, onQuantityChange }: CartCardProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [loading, setLoading] = useState(false);

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity === quantity) return;

    setQuantity(newQuantity);
    onQuantityChange?.(item.id, newQuantity);

    const token = getToken();
    if (!token) return;

    try {
      const res = await put<{ success: boolean; error?: string }>(
        '/api/cart/update',
        { cartItemId: item.id, quantity: newQuantity },
        token
      );

      if (!res.success) {
        console.error(res.error || 'Failed to update quantity');
        setQuantity(item.quantity);
        onQuantityChange?.(item.id, item.quantity);
      }
    } catch (err) {
      console.error(err);
      setQuantity(item.quantity);
      onQuantityChange?.(item.id, item.quantity);
    }
  };

  const handleIncrement = () => updateQuantity(quantity + 1);
  const handleDecrement = () => updateQuantity(quantity - 1);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) updateQuantity(val);
  };

  const handleRemove = async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const res = await del<{ success: boolean; error?: string }>(
        `/api/cart/remove/${item.id}`,
        token
      );

      if (res.success) {
        onRemove(item.id);
      } else {
        alert(res.error || 'Failed to remove item');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    const token = getToken();
    if (!token) {
      alert('Please login first');
      return;
    }

    setLoading(true);
    try {
      const res = await post<{ success: boolean; error?: string }>(
        '/api/order',
        { sweetId: item.sweet.id, quantity },
        token
      );

      if (res.success) {
        alert('Purchase successful!');
        onRemove(item.id);
      } else {
        alert(res.error || 'Failed to buy');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow flex flex-col">
      <img
        src={item.sweet.imageUrl || ''}
        alt={item.sweet.name}
        className="object-cover w-full h-40 rounded-lg mb-2"
      />
      <h3 className="font-bold text-lg">{item.sweet.name}</h3>
      <p className="text-pink-500 font-semibold">₹{item.sweet.price * quantity}</p>

      <div className="flex items-center gap-2 mt-2 mb-2">
        <button
          onClick={handleDecrement}
          disabled={loading}
          className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 transition disabled:opacity-50"
        >
          -
        </button>
        <input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          min={1}
          disabled={loading}
          className="w-10 text-center border rounded appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          onClick={handleIncrement}
          disabled={loading}
          className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 transition disabled:opacity-50"
        >
          +
        </button>
      </div>

      <div className="flex gap-2 mt-auto">
        <button
          onClick={handleRemove}
          disabled={loading}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition flex-1 disabled:opacity-50"
        >
          Remove
        </button>
        <button
          onClick={handleBuyNow}
          disabled={loading}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition flex-1 disabled:opacity-50"
        >
          {loading ? 'Buying...' : 'Buy Now'}
        </button>
      </div>
    </div>
  );
}
