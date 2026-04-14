'use client';

import { useEffect, useState } from 'react';
import ConfirmPopup from './ConfirmPopup';

export default function SaleManagement() {
  const [sales, setSales] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; saleId: string; saleTitle: string }>({ show: false, saleId: '', saleTitle: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    bannerText: '',
    discountType: 'site-wide' as 'site-wide' | 'category' | 'product-specific',
    discountValue: '',
    startDate: '',
    endDate: '',
    isActive: true,
    bannerImage: '',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    showCountdown: true,
    priority: 0,
    applicableCategories: [] as string[],
    applicableProducts: [] as string[]
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const fetchSales = async () => {
    try {
      const res = await fetch('/api/sales');
      const data = await res.json();
      if (data.success) {
        setSales(data.data);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndProducts = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products')
      ]);
      
      const categoriesData = await categoriesRes.json();
      const productsData = await productsRes.json();
      
      if (categoriesData.success) {
        setCategories(categoriesData.data);
      }
      
      if (productsData.success) {
        setProducts(productsData.data);
      }
    } catch (error) {
      console.error('Error fetching categories and products:', error);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchCategoriesAndProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        startDate: formData.startDate,
        endDate: formData.endDate,
        priority: parseInt(formData.priority.toString()),
        ...(editingSale && { id: editingSale.id })
      };

      const url = '/api/sales';
      const method = editingSale ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchSales();
        setShowForm(false);
        setEditingSale(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving sale:', error);
    }
  };

  const handleEdit = (sale: any) => {
    setEditingSale(sale);
    setFormData({
      title: sale.title,
      description: sale.description,
      bannerText: sale.banner_text || '',
      discountType: sale.discount_type,
      discountValue: sale.discount_value.toString(),
      startDate: new Date(sale.start_date).toISOString().split('T')[0],
      endDate: new Date(sale.end_date).toISOString().split('T')[0],
      isActive: sale.is_active,
      bannerImage: sale.banner_image || '',
      backgroundColor: sale.background_color || '#000000',
      textColor: sale.text_color || '#ffffff',
      showCountdown: sale.show_countdown,
      priority: sale.priority,
      applicableCategories: sale.applicable_categories || [],
      applicableProducts: sale.applicable_products || []
    });
    setShowForm(true);
  };

  const handleDelete = (id: string, title: string) => {
    setDeleteConfirm({ show: true, saleId: id, saleTitle: title });
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/sales?id=${deleteConfirm.saleId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchSales();
        setDeleteConfirm({ show: false, saleId: '', saleTitle: '' });
      }
    } catch (error) {
      console.error('Error deleting sale:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, saleId: '', saleTitle: '' });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      bannerText: '',
      discountType: 'site-wide',
      discountValue: '',
      startDate: '',
      endDate: '',
      isActive: true,
      bannerImage: '',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      showCountdown: true,
      priority: 0,
      applicableCategories: [],
      applicableProducts: []
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-zinc-400 animate-pulse">
        Loading sales...
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-playfair font-medium text-zinc-900">Sale Management</h2>
          <p className="text-zinc-500 text-sm mt-1">Create and manage site-wide sales and announcements</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingSale(null);
            resetForm();
          }}
          className="bg-black text-white px-6 py-2 text-xs uppercase font-bold tracking-widest hover:bg-zinc-800 transition-colors rounded-sm"
        >
          Add Sale
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-zinc-200 rounded-sm p-6 mb-8">
          <h3 className="text-lg font-medium mb-4">
            {editingSale ? 'Edit Sale' : 'Create New Sale'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Sale Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-zinc-200 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Banner Text
              </label>
              <input
                type="text"
                required
                value={formData.bannerText}
                onChange={(e) => setFormData({ ...formData, bannerText: e.target.value })}
                placeholder="Mega Sale - Up to 50% Off!"
                className="w-full border border-zinc-200 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-black"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full border border-zinc-200 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Discount Type
              </label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                className="w-full border border-zinc-200 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-black"
              >
                <option value="site-wide">Site-wide</option>
                <option value="category">Category</option>
                <option value="product-specific">Product Specific</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Discount Value
              </label>
              <input
                type="number"
                required
                min="0"
                max="100"
                step="1"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                className="w-full border border-zinc-200 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-black"
              />
            </div>

            {formData.discountType === 'category' && (
              <div className="col-span-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Applicable Categories
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-zinc-200 rounded-sm p-2">
                  {categories.map(category => (
                    <label key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.applicableCategories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              applicableCategories: [...formData.applicableCategories, category]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              applicableCategories: formData.applicableCategories.filter(c => c !== category)
                            });
                          }
                        }}
                        className="rounded-sm border-zinc-300"
                      />
                      <span className="text-sm text-zinc-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {formData.discountType === 'product-specific' && (
              <div className="col-span-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Applicable Products
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-zinc-200 rounded-sm p-2">
                  {products.map(product => (
                    <label key={product._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.applicableProducts.includes(product._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              applicableProducts: [...formData.applicableProducts, product._id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              applicableProducts: formData.applicableProducts.filter(p => p !== product._id)
                            });
                          }
                        }}
                        className="rounded-sm border-zinc-300"
                      />
                      <span className="text-sm text-zinc-700">{product.name} ({product.category})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

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
                Background Color
              </label>
              <input
                type="color"
                value={formData.backgroundColor}
                onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                className="w-full h-10 border border-zinc-200 rounded-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Text Color
              </label>
              <input
                type="color"
                value={formData.textColor}
                onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                className="w-full h-10 border border-zinc-200 rounded-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Banner Image URL (optional)
              </label>
              <input
                type="url"
                value={formData.bannerImage}
                onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                className="w-full border border-zinc-200 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Priority (higher = more prominent)
              </label>
              <input
                type="number"
                min="0"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full border border-zinc-200 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-black"
              />
            </div>

            <div className="col-span-2 flex items-center gap-4">
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showCountdown"
                  checked={formData.showCountdown}
                  onChange={(e) => setFormData({ ...formData, showCountdown: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="showCountdown" className="text-sm text-zinc-700">
                  Show Countdown Timer
                </label>
              </div>
            </div>

            <div className="col-span-2 flex gap-4 mt-4">
              <button
                type="submit"
                className="bg-black text-white px-6 py-2 text-xs uppercase font-bold tracking-widest hover:bg-zinc-800 transition-colors rounded-sm"
              >
                {editingSale ? 'Update Sale' : 'Create Sale'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingSale(null);
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
              <th className="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest">Title</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest">Banner Text</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-zinc-200">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-zinc-50">
                <td className="px-6 py-4 text-sm font-medium text-zinc-900">{sale.title}</td>
                <td className="px-6 py-4 text-sm text-zinc-500">{sale.banner_text || 'No banner text'}</td>
                <td className="px-6 py-4 text-sm text-zinc-500">{sale.discount_value}%</td>
                <td className="px-6 py-4 text-sm text-zinc-500">
                  {new Date(sale.start_date).toLocaleDateString()} - {new Date(sale.end_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    sale.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {sale.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => handleEdit(sale)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(sale.id, sale.title)}
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

      <ConfirmPopup
        show={deleteConfirm.show}
        title="Confirm Delete"
        message={`Are you sure you want to delete the sale "${deleteConfirm.saleTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
