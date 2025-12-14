'use client';

import { post } from '@/utils/http';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Sweet {
  id: number;
  name: string;
  price: number;
  category: string;
  quantity: number;
  imageUrl?: string;
}

interface SweetCardProps {
  sweet: Sweet;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function SweetCard({
  sweet,
  isAdmin = false,
  onEdit,
  onDelete,
}: SweetCardProps) {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    if (userRaw) {
      const user = JSON.parse(userRaw);
      setRole(user.role);
    }
  }, []);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const data = await post<{ success: boolean; error?: string }>(
        '/api/cart/add',
        { sweetId: sweet.id, quantity: 1 },
        token
      );

      if (data.success) alert('Added to cart!');
      else alert(data.error || 'Failed to add to cart');
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow flex flex-col">
      <div className="relative w-full h-40 mb-2">
        {sweet.imageUrl ? (
          <img
            src={sweet.imageUrl}
            alt={sweet.name}
            className="object-cover w-full h-full rounded-lg"
          />
        ) : (
          <div className="bg-gray-200 w-full h-full rounded-lg flex items-center justify-center">
            No Image
          </div>
        )}
      </div>

      <h3 className="font-bold text-lg">{sweet.name}</h3>
      <p className="text-pink-500 font-semibold mb-2">₹{sweet.price}</p>
      <span className="text-gray-500 text-sm">{sweet.category}</span>
      <span className="text-gray-500 text-sm">Qty: {sweet.quantity}</span>

      {isAdmin && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={onEdit}
            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      )}

      {!isAdmin && role === 'USER' && sweet.quantity > 0 && (
        <button
          onClick={handleAddToCart}
          className="mt-3 bg-pink-600 text-white px-4 py-1 rounded hover:opacity-90"
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}
