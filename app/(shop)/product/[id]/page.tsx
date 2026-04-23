'use client';

import { useState, useEffect, use } from 'react';
import CheckoutButton from '@/components/CheckoutButton';
import AddToCartButton from '@/components/AddToCartButton';
import DiscountBadge from '@/components/DiscountBadge';

interface Product {
  _id: string;
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  details: string[];
  category: string;
  sale_id?: string;
  product_type?: 'clothing' | 'electronics' | 'general';
  in_stock?: boolean;
}

interface ProductVariant {
  id: string;
  product_id: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
  stock: number;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { ProductService } = await import('@/lib/supabaseModels');
        const productData = await ProductService.getById(id);
        
        if (productData) {
          const formattedProduct: Product = {
            _id: productData.id,
            id: productData.id,
            name: productData.name,
            price: productData.price,
            description: productData.description,
            image: productData.image,
            details: productData.details || ['Premium Quality', 'Authentic Design'],
            category: productData.category || 'uncategorized',
            sale_id: productData.sale_id,
            product_type: productData.product_type || 'general',
            in_stock: productData.in_stock !== undefined ? productData.in_stock : true
          };
          setProduct(formattedProduct);

          // Fetch variants if it's a clothing item
          if (formattedProduct.product_type === 'clothing') {
            const variantRes = await fetch(`/api/variants/${productData.id}`);
            const variantData = await variantRes.json();
            if (variantData.success) {
              setVariants(variantData.data);
              // Auto-select first available size from variants
              const firstAvailable = variantData.data.find((v: any) => v.in_stock);
              if (firstAvailable) {
                setSelectedSize(firstAvailable.size);
              } else {
                // If no variants or none in stock, select 'M' as default
                setSelectedSize('M');
              }
            }
          }

          // Fetch discounts
          try {
            const { SupabaseSaleDiscountService } = await import('@/lib/supabaseSaleDiscountService');
            const activeSales = await SupabaseSaleDiscountService.getActiveSales();
            const productForService = {
              id: productData.id,
              name: productData.name,
              price: productData.price,
              description: productData.description,
              image: productData.image,
              details: productData.details,
              category: productData.category,
              sale_id: productData.sale_id,
              product_type: productData.product_type || 'general',
              in_stock: productData.in_stock !== undefined ? productData.in_stock : true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            const applicableSale = SupabaseSaleDiscountService.findBestSaleForProduct(productForService, activeSales);
            if (applicableSale) {
              const salePrice = SupabaseSaleDiscountService.calculateDiscountedPrice(productData.price, applicableSale);
              setDiscountedPrice(salePrice);
            }
          } catch (discountError) {
            console.error('Error fetching discounts:', discountError);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading || !product) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">Loading...</div>;
  }

  const isClothing = product.product_type === 'clothing';
  const selectedVariant = variants.find(v => v.size === selectedSize);
  
  // Default sizes for clothing products without variants
  const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const availableSizes = variants.length > 0 ? variants : defaultSizes.map(size => ({ 
    id: `${product.id}-${size}`,
    product_id: product.id,
    size: size as 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL',
    stock: 10,
    in_stock: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  
  const isOutOfStock = isClothing 
    ? (selectedVariant ? !selectedVariant.in_stock : !availableSizes.some(v => v.in_stock))
    : !product.in_stock;
  
  const isProductOutOfStock = !product.in_stock;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 lg:px-8 lg:grid lg:grid-cols-2 lg:gap-x-16 min-h-[calc(100vh-16rem)] flex-grow w-full">
      {/* Image Gallery Area */}
      <div className="aspect-[4/5] rounded-sm overflow-hidden bg-zinc-100 relative w-full lg:sticky lg:top-24">
        <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
        {isProductOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-3xl font-bold uppercase tracking-widest">Out of Stock</span>
          </div>
        )}
      </div>
      
      {/* Product Information */}
      <div className="mt-10 lg:mt-0 flex flex-col justify-center">
        <div className="relative">
          <h1 className="text-4xl lg:text-5xl font-playfair font-medium text-zinc-900 tracking-tight">{product.name}</h1>
          
          <DiscountBadge 
            productId={product._id} 
            productName={product.name} 
            price={product.price} 
            category={product.category}
            sale_id={product.sale_id}
          />
        </div>
        
        <div className="mt-4">
          <div className="flex items-center gap-4">
            {discountedPrice !== null ? (
              <>
                <p className="text-2xl font-light text-zinc-400 line-through">${product.price.toFixed(2)}</p>
                <p className="text-2xl font-light text-green-600">${discountedPrice.toFixed(2)}</p>
              </>
            ) : (
              <p className="text-2xl font-light text-zinc-900">${product.price.toFixed(2)}</p>
            )}
            {isOutOfStock && (
              <span className="text-sm font-medium text-red-600 uppercase tracking-widest">Out of Stock</span>
            )}
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-widest mb-4">Description</h3>
          <p className="text-base text-zinc-600 leading-relaxed font-light">{product.description}</p>
        </div>

        <div className="mt-8 border-t border-zinc-200 pt-8">
          <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-widest mb-4">Details</h3>
          <ul className="space-y-2">
            {product.details?.map((detail: string, idx: number) => (
              <li key={idx} className="text-sm text-zinc-600 font-light flex items-center">
                <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full mr-3"></span>
                {detail}
              </li>
            ))}
          </ul>
        </div>

        {/* Size Selection for Clothing */}
        {isClothing && (
          <div className="mt-8 border-t border-zinc-200 pt-8">
            <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-widest mb-2">Size</h3>
            {selectedSize && (
              <p className="text-sm text-zinc-600 mb-4">Size: {selectedSize}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((item) => {
                const size = typeof item === 'string' ? item : item.size;
                const inStock = typeof item === 'string' ? true : item.in_stock;
                return (
                  <button
                    key={size}
                    onClick={() => inStock && setSelectedSize(size)}
                    disabled={!inStock}
                    className={`w-12 h-12 border rounded-md text-sm font-medium transition-all ${
                      selectedSize === size
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : inStock
                        ? 'border-zinc-300 bg-white text-zinc-900 hover:border-blue-500 hover:bg-blue-50'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="mt-12 flex flex-col space-y-4">
          <AddToCartButton
            product={{
              id: product._id,
              name: product.name,
              price: discountedPrice || product.price,
              image: product.image,
              selectedSize: isClothing ? (selectedSize || undefined) : undefined
            }} 
            disabled={isOutOfStock || isProductOutOfStock || (isClothing && !selectedSize)}
          />
          <CheckoutButton
            product={{
              id: product._id,
              name: product.name,
              price: discountedPrice || product.price,
              image: product.image,
              selectedSize: isClothing ? (selectedSize || undefined) : undefined
            }} 
            disabled={isOutOfStock || isProductOutOfStock || (isClothing && !selectedSize)}
          />
        </div>
      </div>
    </div>
  );
}
