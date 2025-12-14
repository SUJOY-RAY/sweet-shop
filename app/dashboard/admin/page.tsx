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

export default function AdminDashboard() {
  const router = useRouter();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userRaw);
    if (user.role !== 'ADMIN') {
      router.push('/dashboard/user'); 
      return;
    }

    fetchSweets();
  }, [router]);

  async function fetchSweets() {
    setLoading(true);
    try {
      const res = await fetch('/api/sweets');
      const data = await res.json();
      setSweets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this sweet?')) return;
    await fetch(`/api/sweets/${id}`, { method: 'DELETE' });
    setSweets(prev => prev.filter(s => s.id !== id));
  };

  const handleEdit = (sweet: Sweet) => {
    setEditingSweet(sweet);
    setName(sweet.name);
    setPrice(sweet.price.toString());
    setCategory(sweet.category);
    setImageUrl(sweet.imageUrl || '');
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, price: parseFloat(price), category, imageUrl };

    try {
      if (editingSweet) {
        const res = await fetch(`/api/sweets/${editingSweet.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const updated = await res.json();
        setSweets(prev => prev.map(s => s.id === updated.id ? updated : s));
      } else {
        const res = await fetch('/api/sweets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const newSweet = await res.json();
        setSweets(prev => [newSweet, ...prev]);
      }

      setEditingSweet(null);
      setShowForm(false);
      setName('');
      setPrice('');
      setCategory('');
      setImageUrl('');

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-pink-700">Admin – Manage Sweets</h1>
          <button 
            className="bg-pink-600 text-white px-4 py-2 rounded"
            onClick={() => { setShowForm(true); setEditingSweet(null); }}
          >
            Add Sweet
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form 
              onSubmit={handleFormSubmit} 
              className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-4">{editingSweet ? 'Edit Sweet' : 'Add Sweet'}</h2>
              
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2 mb-3 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full p-2 mb-3 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-2 mb-3 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Image URL"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="w-full p-2 mb-3 border rounded"
              />
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded border"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded bg-pink-600 text-white"
                >
                  {editingSweet ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {loading ? 'Loading...' : sweets.map(s => (
            <SweetCard 
              key={s.id} 
              sweet={s} 
              isAdmin 
              onEdit={() => handleEdit(s)} 
              onDelete={() => handleDelete(s.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
