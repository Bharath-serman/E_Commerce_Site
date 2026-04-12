import CheckoutButton from '@/components/CheckoutButton';
import AddToCartButton from '@/components/AddToCartButton';
import { connectMongo } from '@/lib/mongodb';
import Product from '@/models/Product';
import { notFound } from 'next/navigation';
import DiscountBadge from '@/components/DiscountBadge';

// Hybrid DB / Mock fetch
const getProduct = async (id: string) => {
  try {
    // Attempt MongoDB fetch first
    await connectMongo();
    // Use mongoose.isValidObjectId to check if it's a real DB ID, otherwise it might be a mock string like '1'
    if (id.length === 24) { 
      const dbProduct = await Product.findById(id).lean();
      if (dbProduct) {
        return JSON.parse(JSON.stringify({
          _id: dbProduct._id.toString(),
          name: dbProduct.name,
          price: dbProduct.price,
          description: dbProduct.description,
          image: dbProduct.image,
          details: dbProduct.details || ['Premium Quality', 'Authentic Design'],
          category: dbProduct.category || 'uncategorized'
        }));
      }
    }
  } catch (error) {
    console.warn("MongoDB fetch failed, trying mock fallback...");
  }

  // Fallback to Mock Data if ID is '1', '2', '3', '4' or DB fails
  const mockProducts: Record<string, any> = {
    '1': { 
      _id: '1', name: 'Essential Cotton T-Shirt', price: 35, 
      description: 'Elevate your comfort with our heavyweight premium structured fit...', 
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      details: ['100% Organic Material', 'Heavyweight Structure'],
      category: 'clothing'
    },
    '2': { 
      _id: '2', name: 'Minimalist Hoodie', price: 65, 
      description: 'Relaxed drape, precision tailoring, and subtle tonal branding.', 
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      details: ['Premium blend', 'Made in Portugal'],
      category: 'clothing'
    },
    '3': { 
      _id: '3', name: 'Classic Denim Jacket', price: 120, 
      description: 'Vintage wash with modern tailoring.', 
      image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      details: ['100% Cotton Denim', 'Reinforced stitching'],
      category: 'clothing'
    },
    '4': { 
      _id: '4', name: 'Wool Blend Coat', price: 195, 
      description: 'Perfect for year-round layered aesthetics.', 
      image: 'https://images.unsplash.com/photo-1539533018408-ea9a9ba39151?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      details: ['80% Wool', '20% Polyamide'],
      category: 'clothing'
    }
  };

  return mockProducts[id] || null;
};

export default async function ProductPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  if (!product) {
    return notFound();
  }

  // Fetch active sales to calculate discounted price
  let discountedPrice = null;
  let applicableSale = null;
  
  try {
    console.log('ProductPage fetching discount for:', { productId: product._id, productName: product.name, category: product.category });
    const { SaleDiscountService } = await import('@/lib/saleDiscountService');
    const activeSales = await SaleDiscountService.getActiveSales();
    console.log('ProductPage active sales:', activeSales);
    applicableSale = SaleDiscountService.findBestSaleForProduct(product, activeSales);
    console.log('ProductPage found applicable sale:', applicableSale);
    
    if (applicableSale) {
      discountedPrice = SaleDiscountService.calculateDiscountedPrice(product.price, applicableSale);
      console.log('ProductPage calculated discounted price:', { original: product.price, discounted: discountedPrice });
    }
  } catch (error) {
    console.error('Error fetching discount for product:', error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 lg:px-8 lg:grid lg:grid-cols-2 lg:gap-x-16 min-h-[calc(100vh-16rem)] flex-grow w-full">
      {/* Image Gallery Area */}
      <div className="aspect-[4/5] rounded-sm overflow-hidden bg-zinc-100 relative w-full lg:sticky lg:top-24">
        <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
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
        
        <div className="mt-12 flex flex-col space-y-4">
          <AddToCartButton product={{ id: product._id, name: product.name, price: discountedPrice || product.price, image: product.image }} />
          <CheckoutButton product={{ id: product._id, name: product.name, price: discountedPrice || product.price, image: product.image }} />
        </div>
      </div>
    </div>
  );
}
