'use client';

import { useState, useEffect, useRef } from 'react';
import ConfirmModal from '@/components/ConfirmModal';
import StatusModal from '@/components/StatusModal';
import { uploadImage } from '@/lib/supabaseStorage';

export default function ManageProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal & Status State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any>(null);

  const [status, setStatus] = useState<{ isOpen: boolean, type: 'success' | 'error', title: string, message: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    details: '',
    category: 'uncategorized',
    product_type: 'general' as 'clothing' | 'electronics' | 'general',
    in_stock: true
  });

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    details: '',
    category: 'uncategorized',
    product_type: 'general' as 'clothing' | 'electronics' | 'general',
    in_stock: true
  });
  const [editVariants, setEditVariants] = useState<Array<{ size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL', stock: number, in_stock: boolean }>>([]);

  // Variant management for clothing
  const [variants, setVariants] = useState<Array<{ size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL', stock: number, in_stock: boolean }>>([
    { size: 'XS', stock: 10, in_stock: true },
    { size: 'S', stock: 10, in_stock: true },
    { size: 'M', stock: 10, in_stock: true },
    { size: 'L', stock: 10, in_stock: true },
    { size: 'XL', stock: 10, in_stock: true },
    { size: 'XXL', stock: 10, in_stock: true },
    { size: 'XXXL', stock: 10, in_stock: true },
  ]);

  // Hardcoded categories
  const CATEGORIES = [
    'uncategorized',
    'clothing',
    'accessories',
    'footwear',
    'electronics',
    'home',
    'beauty',
    'sports',
    'books',
    'toys'
  ];

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      // Clear the manual image URL when a file is selected
      setFormData({ ...formData, image: '' });
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return null;

    setUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadImage(selectedFile);
      
      if (result.error) {
        setStatus({
          isOpen: true,
          type: 'error',
          title: 'Upload Failed',
          message: result.error
        });
        return null;
      }

      setUploadProgress(100);
      setFormData({ ...formData, image: result.url });
      return result.url;
    } catch (error) {
      setStatus({
        isOpen: true,
        type: 'error',
        title: 'Upload Error',
        message: 'Failed to upload image to storage'
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Upload image if a file is selected
      let imageUrl = formData.image;
      if (selectedFile) {
        const uploadedUrl = await handleUploadImage();
        if (!uploadedUrl) {
          setSubmitting(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      // Validate that we have an image URL
      if (!imageUrl) {
        setStatus({
          isOpen: true,
          type: 'error',
          title: 'Image Required',
          message: 'Please either upload an image or provide an image URL.'
        });
        setSubmitting(false);
        return;
      }

      const productData = {
        ...formData,
        image: imageUrl,
        price: parseFloat(formData.price),
        details: formData.details.split(',').map(d => d.trim()).filter(d => d !== ''),
        product_type: formData.product_type,
        in_stock: formData.product_type === 'clothing' ? true : formData.in_stock,
        variants: formData.product_type === 'clothing' ? variants : undefined
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
        setFormData({ name: '', price: '', description: '', image: '', details: '', category: 'uncategorized', product_type: 'general', in_stock: true });
        setVariants([
          { size: 'XS', stock: 10, in_stock: true },
          { size: 'S', stock: 10, in_stock: true },
          { size: 'M', stock: 10, in_stock: true },
          { size: 'L', stock: 10, in_stock: true },
          { size: 'XL', stock: 10, in_stock: true },
          { size: 'XXL', stock: 10, in_stock: true },
          { size: 'XXXL', stock: 10, in_stock: true },
        ]);
        setSelectedFile(null);
        setPreviewUrl('');
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

  const handleEdit = async (product: any) => {
    try {
      // Fetch variants if it's a clothing item
      let variants = [];
      if (product.product_type === 'clothing') {
        const res = await fetch(`/api/variants/${product._id}`);
        const data = await res.json();
        if (data.success) {
          variants = data.data;
        }
      }
      
      const productVariants = variants.length > 0 ? variants : [
        { size: 'XS', stock: 10, in_stock: true },
        { size: 'S', stock: 10, in_stock: true },
        { size: 'M', stock: 10, in_stock: true },
        { size: 'L', stock: 10, in_stock: true },
        { size: 'XL', stock: 10, in_stock: true },
        { size: 'XXL', stock: 10, in_stock: true },
        { size: 'XXXL', stock: 10, in_stock: true },
      ];
      
      setEditFormData({
        name: product.name,
        price: product.price.toString(),
        description: product.description,
        image: product.image,
        details: product.details?.join(', ') || '',
        category: product.category || 'uncategorized',
        product_type: product.product_type || 'general',
        in_stock: product.in_stock !== false
      });
      setEditVariants(productVariants);
      setProductToEdit(product);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error fetching product for edit:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const productData = {
        ...editFormData,
        price: parseFloat(editFormData.price),
        details: editFormData.details.split(',').map(d => d.trim()).filter(d => d !== ''),
        product_type: editFormData.product_type,
        in_stock: editFormData.product_type === 'clothing' ? true : editFormData.in_stock,
        variants: editFormData.product_type === 'clothing' ? editVariants : undefined
      };

      const res = await fetch(`/api/products/${productToEdit._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const data = await res.json();
      if (data.success) {
        setStatus({
          isOpen: true,
          type: 'success',
          title: 'Update Successful',
          message: `${editFormData.name} has been updated.`
        });
        setIsEditModalOpen(false);
        fetchProducts();
      } else {
        setStatus({
          isOpen: true,
          type: 'error',
          title: 'Update Failed',
          message: data.error || 'Check your network connection and try again.'
        });
      }
    } catch (err) {
      setStatus({
        isOpen: true,
        type: 'error',
        title: 'Network Error',
        message: 'Could not update the product.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStock = async (id: string, currentStock: boolean) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ in_stock: !currentStock })
      });
      const data = await res.json();
      if (data.success) {
        const product = products.find(p => p._id === id);
        setProducts(products.map(p => p._id === id ? { ...p, in_stock: !currentStock } : p));
        setStatus({
          isOpen: true,
          type: 'success',
          title: 'Stock Updated',
          message: `${product?.name || 'Product'} is now ${!currentStock ? 'in stock' : 'out of stock'}.`
        });
      } else {
        setStatus({
          isOpen: true,
          type: 'error',
          title: 'Update Failed',
          message: data.error || 'An unexpected error occurred.'
        });
      }
    } catch (err) {
      setStatus({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Could not update stock status.'
      });
    }
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
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">Price (INR)</label>
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
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-zinc-200 p-3 text-sm focus:border-black outline-none transition-all rounded-sm bg-zinc-50"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="capitalize">
                    {cat === 'uncategorized' ? 'Select Category' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">Product Type</label>
              <select
                value={formData.product_type}
                onChange={(e) => setFormData({ ...formData, product_type: e.target.value as 'clothing' | 'electronics' | 'general' })}
                className="w-full border border-zinc-200 p-3 text-sm focus:border-black outline-none transition-all rounded-sm bg-zinc-50"
              >
                <option value="general">General</option>
                <option value="clothing">Clothing (Has Sizes)</option>
                <option value="electronics">Electronics</option>
              </select>
            </div>
            {formData.product_type !== 'clothing' && (
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">In Stock</label>
                <select
                  value={formData.in_stock.toString()}
                  onChange={(e) => setFormData({ ...formData, in_stock: e.target.value === 'true' })}
                  className="w-full border border-zinc-200 p-3 text-sm focus:border-black outline-none transition-all rounded-sm bg-zinc-50"
                >
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">Product Image</label>
              
              {/* File Upload Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="flex-1 border border-zinc-200 p-3 text-sm focus:border-black outline-none transition-all rounded-sm bg-zinc-50 file:mr-4 file:py-1 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-zinc-800"
                  />
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl('');
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors bg-red-50 px-3 py-2 rounded-sm border border-red-100"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Image Preview */}
                {(previewUrl || formData.image) && (
                  <div className="relative">
                    <img
                      src={previewUrl || formData.image}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-sm border border-zinc-200"
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-sm">
                        <div className="text-white text-xs font-bold uppercase tracking-widest">
                          Uploading... {uploadProgress}%
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Manual URL Input (fallback) */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Or paste URL:</span>
                  <input
                    type="text"
                    value={!selectedFile ? formData.image : ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    disabled={!!selectedFile}
                    className="flex-1 border border-zinc-200 p-2 text-sm focus:border-black outline-none transition-all rounded-sm bg-zinc-50 disabled:bg-zinc-100 disabled:text-zinc-400"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {formData.product_type === 'clothing' && (
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-4">Size & Stock Management</label>
                <div className="border border-zinc-200 rounded-sm p-4 space-y-3">
                  {variants.map((variant, index) => (
                    <div key={variant.size} className="flex items-center gap-4">
                      <span className="w-12 text-sm font-medium text-zinc-900">{variant.size}</span>
                      <div className="flex-1">
                        <input
                          type="number"
                          min="0"
                          value={variant.stock}
                          onChange={(e) => {
                            const newVariants = [...variants];
                            newVariants[index] = { 
                              ...variant, 
                              stock: parseInt(e.target.value) || 0,
                              in_stock: (parseInt(e.target.value) || 0) > 0
                            };
                            setVariants(newVariants);
                          }}
                          className="w-full border border-zinc-200 p-2 text-sm focus:border-black outline-none transition-all rounded-sm bg-zinc-50"
                          placeholder="Stock"
                        />
                      </div>
                      <span className="text-xs text-zinc-500">
                        {variant.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Stock</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-400 uppercase tracking-widest pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-zinc-300 text-xs tracking-widest uppercase animate-pulse">Syncing Inventory...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-zinc-400 text-xs tracking-widest uppercase">No items in your shop.</td>
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
                    ₹{product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm ${
                      product.in_stock !== false ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {product.in_stock !== false ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right pr-10 space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-2 rounded-sm border border-blue-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleStock(product._id, product.in_stock !== false)}
                      className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 hover:text-zinc-700 transition-colors bg-zinc-50 px-3 py-2 rounded-sm border border-zinc-200"
                    >
                      {product.in_stock !== false ? 'Out of Stock' : 'In Stock'}
                    </button>
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

      {/* Edit Product Modal */}
      {isEditModalOpen && productToEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-sm max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-widest">Edit Product</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">Product Name</label>
                  <input
                    required
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full border border-zinc-200 p-3 text-sm focus:border-black outline-none transition-all rounded-sm bg-zinc-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">Price (INR)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    className="w-full border border-zinc-200 p-3 text-sm focus:border-black outline-none transition-all rounded-sm bg-zinc-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full border border-zinc-200 p-3 text-sm focus:border-black outline-none transition-all rounded-sm bg-zinc-50"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="capitalize">
                        {cat === 'uncategorized' ? 'Select Category' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">Product Type</label>
                  <select
                    value={editFormData.product_type}
                    onChange={(e) => setEditFormData({ ...editFormData, product_type: e.target.value as 'clothing' | 'electronics' | 'general' })}
                    className="w-full border border-zinc-200 p-3 text-sm focus:border-black outline-none transition-all rounded-sm bg-zinc-50"
                  >
                    <option value="general">General</option>
                    <option value="clothing">Clothing (Has Sizes)</option>
                    <option value="electronics">Electronics</option>
                  </select>
                </div>
                {editFormData.product_type !== 'clothing' && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">In Stock</label>
                    <select
                      value={editFormData.in_stock.toString()}
                      onChange={(e) => setEditFormData({ ...editFormData, in_stock: e.target.value === 'true' })}
                      className="w-full border border-zinc-200 p-3 text-sm focus:border-black outline-none transition-all rounded-sm bg-zinc-50"
                    >
                      <option value="true">In Stock</option>
                      <option value="false">Out of Stock</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">Product Image</label>
                  <input
                    type="text"
                    value={editFormData.image}
                    onChange={(e) => setEditFormData({ ...editFormData, image: e.target.value })}
                    className="w-full border border-zinc-200 p-3 text-sm focus:border-black outline-none transition-all rounded-sm bg-zinc-50"
                  />
                  {editFormData.image && (
                    <img src={editFormData.image} alt="Preview" className="w-full h-48 object-cover rounded-sm border border-zinc-200 mt-2" />
                  )}
                </div>
              </div>
              <div className="space-y-6">
                {editFormData.product_type === 'clothing' && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-4">Size & Stock Management</label>
                    <div className="border border-zinc-200 rounded-sm p-4 space-y-3">
                      {editVariants.map((variant, index) => (
                        <div key={variant.size} className="flex items-center gap-4">
                          <span className="w-12 text-sm font-medium text-zinc-900">{variant.size}</span>
                          <div className="flex-1">
                            <input
                              type="number"
                              min="0"
                              value={variant.stock}
                              onChange={(e) => {
                                const newVariants = [...editVariants];
                                newVariants[index] = { 
                                  ...variant, 
                                  stock: parseInt(e.target.value) || 0,
                                  in_stock: (parseInt(e.target.value) || 0) > 0
                                };
                                setEditVariants(newVariants);
                              }}
                              className="w-full border border-zinc-200 p-2 text-sm focus:border-black outline-none transition-all rounded-sm bg-zinc-50"
                            />
                          </div>
                          <span className="text-xs text-zinc-500">
                            {variant.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">Description</label>
                  <textarea
                    required
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full border border-zinc-200 p-3 text-sm focus:border-black outline-none transition-all rounded-sm bg-zinc-50 h-32 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">Product Details (Comma Separated)</label>
                  <input
                    type="text"
                    value={editFormData.details}
                    onChange={(e) => setEditFormData({ ...editFormData, details: e.target.value })}
                    className="w-full border border-zinc-200 p-3 text-sm focus:border-black outline-none transition-all rounded-sm bg-zinc-50"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 bg-zinc-200 text-zinc-700 py-4 text-xs font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-zinc-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={submitting}
                    type="submit"
                    className="flex-1 bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-zinc-800 transition-all shadow-lg disabled:bg-zinc-300"
                  >
                    {submitting ? "Updating..." : "Update Product"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
