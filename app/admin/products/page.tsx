'use client';

import { useState, useEffect } from 'react';
import ConfirmModal from '@/components/ConfirmModal';
import StatusModal from '@/components/StatusModal';

export default function ManageProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal & Status State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [status, setStatus] = useState<{ isOpen: boolean, type: 'success' | 'error', title: string, message: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    details: ''
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error("Fetch products failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        details: formData.details.split(',').map(d => d.trim()).filter(d => d !== '')
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const data = await res.json();
      if (data.success) {
        setStatus({
          isOpen: true,
          type: 'success',
          title: 'Registration Successful',
          message: `${formData.name} has been added to your storefront inventory.`
        });
        setFormData({ name: '', price: '', description: '', image: '', details: '' });
        fetchProducts(); // Refresh list
      } else {
        setStatus({
          isOpen: true,
          type: 'error',
          title: 'Submission Failed',
          message: data.error || 'Check your network connection and try again.'
        });
      }
    } catch (err) {
      setStatus({
        isOpen: true,
        type: 'error',
        title: 'Network Error',
        message: 'Could not connect to the product database.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/products/${productToDelete}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter(p => p._id !== productToDelete));
        setIsDeleteModalOpen(false);
        setStatus({
          isOpen: true,
          type: 'success',
          title: 'Product Removed',
          message: 'The item has been successfully deleted from your database.'
        });
      } else {
        setStatus({
          isOpen: true,
          type: 'error',
          title: 'Deletion Failed',
          message: data.error || 'An unexpected error occurred.'
        });
      }
    } catch (err) {
      setStatus({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Could not complete the deletion request.'
      });
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-12 mb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-playfair font-medium text-zinc-900 tracking-tight">Inventory Management</h1>
          <p className="text-zinc-500 mt-2 text-sm font-light uppercase tracking-widest">MANAGE YOUR STOREFRONT ITEMS</p>
        </div>
      </div>

      {/* Add Product Section */}
      <section className="bg-white rounded-sm border border-zinc-200 p-8 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-widest mb-8 border-b border-zinc-100 pb-4">
          Add New Product
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">Product Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-zinc-200 p-3 text-sm focus:border-black outline-none transition-all rounded-sm bg-zinc-50"
                placeholder="e.g. Classic Silk Scarf"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">Price (USD)</label>
              <input
                required
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full border border-zinc-200 p-3 text-sm focus:border-black outline-none transition-all rounded-sm bg-zinc-50"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">Image URL</label>
              <input
                required
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full border border-zinc-200 p-3 text-sm focus:border-black outline-none transition-all rounded-sm bg-zinc-50"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-zinc-200 p-3 text-sm focus:border-black outline-none transition-all rounded-sm bg-zinc-50 h-32 resize-none"
                placeholder="Enter a premium description..."
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">Product Details (Comma Separated)</label>
              <input
                type="text"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className="w-full border border-zinc-200 p-3 text-sm focus:border-black outline-none transition-all rounded-sm bg-zinc-50"
                placeholder="100% Silk, Hand-wash only, Made in Italy"
              />
            </div>
            <button
              disabled={submitting}
              type="submit"
              className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-zinc-800 transition-all shadow-lg disabled:bg-zinc-300"
            >
              {submitting ? "Processing..." : "Register Product"}
            </button>
          </div>
        </form>
      </section>

      {/* Active Inventory List */}
      <section className="space-y-6">
        <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-widest border-b border-zinc-100 pb-4">
          Current Inventory ({products.length})
        </h2>

        <div className="bg-white rounded-sm border border-zinc-200 overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Preview</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Product Information</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Price</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-400 uppercase tracking-widest pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-zinc-300 text-xs tracking-widest uppercase animate-pulse">Syncing Inventory...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-zinc-400 text-xs tracking-widest uppercase">No items in your shop.</td>
                </tr>
              ) : products.map((product) => (
                <tr key={product._id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img src={product.image} alt="" className="w-12 h-16 object-cover rounded-sm border border-zinc-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-900 uppercase tracking-tight">{product.name}</span>
                      <span className="text-[10px] text-zinc-500 font-light truncate max-w-xs">{product.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-zinc-900">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right pr-10">
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors bg-red-50 px-3 py-2 rounded-sm border border-red-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Custom Global Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Remove Product"
        message="Are you sure you want to permanently remove this item from the storefront? This action cannot be undone."
        confirmText="Delete"
        isLoading={isDeleting}
      />

      {/* Custom Status Modal (Success/Error) */}
      <StatusModal
        isOpen={status.isOpen}
        onClose={() => setStatus({ ...status, isOpen: false })}
        type={status.type}
        title={status.title}
        message={status.message}
      />
    </div>
  );
}
