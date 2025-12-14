'use client';
import { put } from '@/utils/http';
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
  const token = localStorage.getItem('token');
  const [quantity, setQuantity] = useState(item.quantity);

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return;

    setQuantity(newQuantity);
    onQuantityChange?.(item.id, newQuantity);

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
          className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 transition"
        >
          -
        </button>
        <input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          className="w-10 text-center border rounded appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          min={1}
        />
        <button
          onClick={handleIncrement}
          className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 transition"
        >
          +
        </button>
      </div>

      <button
        onClick={() => onRemove(item.id)}
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition mt-auto"
      >
        Remove
      </button>
    </div>
  );
}
