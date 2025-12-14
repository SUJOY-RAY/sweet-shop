'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import SweetCard from '@/app/components/SweetCard';
import { get, post, put, del } from '@/utils/http';

interface Sweet {
  id: number;
  name: string;
  price: number;
  category: string;
  quantity: number;
  imageUrl?: string;
}

export default function AdminDashboard() {
  const router = useRouter();

  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [token, setToken] = useState<string | null>(null);

  /* -------------------- AUTH CHECK -------------------- */
  useEffect(() => {
    const t = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');

    if (!t || !userRaw) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userRaw);
    if (user.role !== 'ADMIN') {
      router.push('/dashboard/user');
      return;
    }

    setToken(t);
  }, [router]);

  /* -------------------- FETCH SWEETS -------------------- */
  useEffect(() => {
    if (!token) return;
    fetchSweets();
  }, [token]);

  const fetchSweets = async () => {
    setLoading(true);
    try {
      const data = await get<Sweet[]>('/api/sweets', token!);
      setSweets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- DELETE -------------------- */
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this sweet?')) return;
    try {
      await del(`/api/sweets/${id}`, token!);
      setSweets(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  /* -------------------- EDIT -------------------- */
  const handleEdit = (sweet: Sweet) => {
    setEditingSweet(sweet);
    setName(sweet.name);
    setPrice(String(sweet.price));
    setCategory(sweet.category);
    setQuantity(String(sweet.quantity));
    setImageUrl(sweet.imageUrl || '');
    setShowForm(true);
  };

  /* -------------------- SUBMIT FORM -------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      price: parseFloat(price),
      category,
      quantity: parseInt(quantity),
      imageUrl,
    };

    try {
      if (editingSweet) {
        const updated = await put<Sweet>(
          `/api/sweets/${editingSweet.id}`,
          payload,
          token!
        );
        setSweets(prev =>
          prev.map(s => (s.id === updated.id ? updated : s))
        );
      } else {
        const created = await post<Sweet>(
          '/api/sweets',
          payload,
          token!
        );
        setSweets(prev => [created, ...prev]);
      }

      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingSweet(null);
    setName('');
    setPrice('');
    setCategory('');
    setQuantity('');
    setImageUrl('');
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-pink-700">
            Admin – Manage Sweets
          </h1>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
          >
            Add Sweet
          </button>
        </div>

        {/* ---------- FORM MODAL ---------- */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg"
            >
              <h2 className="text-xl font-bold mb-4">
                {editingSweet ? 'Edit Sweet' : 'Add Sweet'}
              </h2>

              <input
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
                placeholder="Category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-2 mb-3 border rounded"
                required
              />

              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full p-2 mb-3 border rounded"
                required
              />

              <input
                placeholder="Image URL"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="w-full p-2 mb-4 border rounded"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 text-white rounded"
                >
                  {editingSweet ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ---------- SWEETS GRID ---------- */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {sweets.map(s => (
              <SweetCard
                key={s.id}
                sweet={s}
                isAdmin
                onEdit={() => handleEdit(s)}
                onDelete={() => handleDelete(s.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
