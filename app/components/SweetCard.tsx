'use client';

interface Sweet {
  id: number;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
}

interface SweetCardProps {
  sweet: Sweet;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function SweetCard({ sweet, isAdmin = false, onEdit, onDelete }: SweetCardProps) {
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

      {isAdmin ? (
        <div className="flex gap-2 mt-3">
          <button
            onClick={onEdit}
            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      ) : (
        <button className="mt-3 bg-pink-600 text-white px-4 py-1 rounded hover:opacity-90 transition">
          Add to Cart
        </button>
      )}
    </div>
  );
}
