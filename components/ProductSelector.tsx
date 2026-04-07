'use client';

import { useEffect, useState } from 'react';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
}

interface ProductSelectorProps {
  selectedProducts: string[];
  onSelectionChange: (products: string[]) => void;
}

export default function ProductSelector({ selectedProducts, onSelectionChange }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductToggle = (productName: string) => {
    if (selectedProducts.includes(productName)) {
      onSelectionChange(selectedProducts.filter(p => p !== productName));
    } else {
      onSelectionChange([...selectedProducts, productName]);
    }
  };

  const handleSelectAll = () => {
    onSelectionChange(products.map(p => p.name));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  if (loading) {
    return (
      <div className="border border-zinc-200 rounded-sm p-4">
        <div className="text-center text-zinc-400 animate-pulse">
          Loading products...
        </div>
      </div>
    );
  }

  return (
    <div className="border border-zinc-200 rounded-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          Select Products
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs px-3 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-sm transition-colors"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs px-3 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-sm transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="max-h-40 overflow-y-auto border border-zinc-100 rounded-sm p-2">
        {products.map((product) => (
          <label
            key={product._id}
            className="flex items-center gap-3 p-2 hover:bg-zinc-50 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedProducts.includes(product.name)}
              onChange={() => handleProductToggle(product.name)}
              className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-zinc-900">{product.name}</div>
              <div className="text-xs text-zinc-500">${product.price}</div>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-3 text-xs text-zinc-400">
        {selectedProducts.length === 0 
          ? 'No products selected (discount applies to all products)'
          : `${selectedProducts.length} product${selectedProducts.length !== 1 ? 's' : ''} selected`
        }
      </div>
    </div>
  );
}
