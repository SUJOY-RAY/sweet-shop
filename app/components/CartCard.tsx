'use client';

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
  const handleIncrement = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newQuantity = item.quantity + 1;
    try {
      const res = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cartItemId: item.id, quantity: newQuantity }),
      });
      if (!res.ok) throw new Error('Failed to update quantity');
      onQuantityChange?.(item.id, newQuantity);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecrement = async () => {
    if (item.quantity <= 1) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const newQuantity = item.quantity - 1;
    try {
      const res = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cartItemId: item.id, quantity: newQuantity }),
      });
      if (!res.ok) throw new Error('Failed to update quantity');
      onQuantityChange?.(item.id, newQuantity);
    } catch (err) {
      console.error(err);
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
      <p className="text-pink-500 font-semibold">₹{item.sweet.price * item.quantity}</p>

      <div className="flex items-center gap-2 mt-2 mb-2">
        <button
          onClick={handleDecrement}
          className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 transition"
        >
          -
        </button>
        <span className="font-semibold">{item.quantity}</span>
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
