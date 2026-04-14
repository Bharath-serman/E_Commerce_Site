'use client';

import { useEffect, useState } from 'react';
import ProductSelector from '@/components/ProductSelector';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

export default function DiscountManagement() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    applicableProducts: [] as string[],
    minOrderValue: '',
    maxDiscountAmount: '',
    startDate: '',
    endDate: '',
    isActive: true,
    usageLimit: ''
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    discountId: string;
    discountName: string;
  }>({ isOpen: false, discountId: '', discountName: '' });

  const fetchDiscounts = async () => {
    try {
      const res = await fetch('/api/discounts');
      const data = await res.json();
      if (data.success) {
        setDiscounts(data.data);
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value),
        applicableProducts: formData.applicableProducts,
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : undefined,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        ...(editingDiscount && { id: editingDiscount.id })
      };

      const url = '/api/discounts';
      const method = editingDiscount ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchDiscounts();
        setShowForm(false);
        setEditingDiscount(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving discount:', error);
    }
  };

  const handleEdit = (discount: any) => {
    setEditingDiscount(discount);
    setFormData({
      name: discount.name,
      type: discount.type,
      value: discount.value.toString(),
      applicableProducts: discount.applicable_products || [],
      minOrderValue: discount.min_order_value?.toString() || '',
      maxDiscountAmount: discount.max_discount_amount?.toString() || '',
      startDate: new Date(discount.start_date).toISOString().split('T')[0],
      endDate: new Date(discount.end_date).toISOString().split('T')[0],
      isActive: discount.is_active,
      usageLimit: discount.usage_limit?.toString() || ''
    });
    setShowForm(true);
  };

  const handleDelete = (discount: any) => {
    setDeleteModal({
      isOpen: true,
      discountId: discount.id,
      discountName: discount.name
    });
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/discounts?id=${deleteModal.discountId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchDiscounts();
        setDeleteModal({ isOpen: false, discountId: '', discountName: '' });
      }
    } catch (error) {
      console.error('Error deleting discount:', error);
      setDeleteModal({ isOpen: false, discountId: '', discountName: '' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'percentage',
      value: '',
      applicableProducts: [],
      minOrderValue: '',
      maxDiscountAmount: '',
      startDate: '',
      endDate: '',
      isActive: true,
      usageLimit: ''
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-zinc-400 animate-pulse">
        Loading discounts...
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-playfair font-medium text-zinc-900">Discount Management</h2>
          <p className="text-zinc-500 text-sm mt-1">Create and manage product discounts</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingDiscount(null);
            resetForm();
          }}
          className="bg-black text-white px-6 py-2 text-xs uppercase font-bold tracking-widest hover:bg-zinc-800 transition-colors rounded-sm"
        >
          Add Discount
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-zinc-200 rounded-sm p-6 mb-8">
          <h3 className="text-lg font-medium mb-4">
            {editingDiscount ? 'Edit Discount' : 'Create New Discount'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Discount Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-zinc-200 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Discount Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
                className="w-full border border-zinc-200 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-black"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                {formData.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
              </label>
              <input
                type="number"
                required
                min="0"
                max={formData.type === 'percentage' ? '100' : ''}
                step={formData.type === 'percentage' ? '1' : '0.01'}
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full border border-zinc-200 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <ProductSelector
                selectedProducts={formData.applicableProducts}
                onSelectionChange={(products) => setFormData({ ...formData, applicableProducts: products })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Minimum Order Value (optional)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.minOrderValue}
                onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                className="w-full border border-zinc-200 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Maximum Discount Amount (optional)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.maxDiscountAmount}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                className="w-full border border-zinc-200 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Start Date
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full border border-zinc-200 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                End Date
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full border border-zinc-200 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Usage Limit (optional)
              </label>
              <input
                type="number"
                min="1"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                className="w-full border border-zinc-200 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm text-zinc-700">
                Active
              </label>
            </div>

            <div className="col-span-2 flex gap-4 mt-4">
              <button
                type="submit"
                className="bg-black text-white px-6 py-2 text-xs uppercase font-bold tracking-widest hover:bg-zinc-800 transition-colors rounded-sm"
              >
                {editingDiscount ? 'Update Discount' : 'Create Discount'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingDiscount(null);
                  resetForm();
                }}
                className="border border-zinc-200 px-6 py-2 text-xs uppercase font-bold tracking-widest hover:bg-zinc-50 transition-colors rounded-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-sm overflow-hidden">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest">Type</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest">Value</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-zinc-200">
            {discounts.map((discount) => (
              <tr key={discount.id} className="hover:bg-zinc-50">
                <td className="px-6 py-4 text-sm font-medium text-zinc-900">{discount.name}</td>
                <td className="px-6 py-4 text-sm text-zinc-500 capitalize">{discount.type}</td>
                <td className="px-6 py-4 text-sm text-zinc-500">
                  {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                </td>
                <td className="px-6 py-4 text-sm text-zinc-500">
                  {new Date(discount.start_date).toLocaleDateString()} - {new Date(discount.end_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    discount.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {discount.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => handleEdit(discount)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(discount)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, discountId: '', discountName: '' })}
        onConfirm={confirmDelete}
        title="Delete Discount"
        message="Are you sure you want to delete this discount? This action cannot be undone."
        itemName={deleteModal.discountName}
      />
    </div>
  );
}
