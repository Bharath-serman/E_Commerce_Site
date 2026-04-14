import CheckoutButton from '@/components/CheckoutButton';
import AddToCartButton from '@/components/AddToCartButton';
import { notFound } from 'next/navigation';
import DiscountBadge from '@/components/DiscountBadge';

// Supabase product fetch
const getProduct = async (id: string) => {
  try {
    // Use Supabase ProductService
    const { ProductService } = await import('@/lib/supabaseModels');
    const product = await ProductService.getById(id);
    if (product) {
        return {
          _id: product.id,
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description,
          image: product.image,
          details: product.details || ['Premium Quality', 'Authentic Design'],
          category: product.category || 'uncategorized',
          sale_id: product.sale_id
        };
    }
  } catch (error) {
    console.error("Supabase fetch failed:", error);
  }

  return null;
};

export default async function ProductPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  if (!product) {
    return notFound();
  }

  // Fetch active sales and discounts to calculate discounted price
  let discountedPrice = null;
  let applicableSale = null;
  let applicableDiscount = null;
  
  try {
    console.log('ProductPage fetching discounts for:', { productId: product.id, productName: product.name, category: product.category });
    
    // Test discount API directly
    console.log('Testing discount API...');
    const baseUrl = process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:3000';
    const discountResponse = await fetch(`${baseUrl}/api/discounts`);
    const discountData = await discountResponse.json();
    console.log('Discount API response:', discountData);
    
    // Check sales
    const { SupabaseSaleDiscountService } = await import('@/lib/supabaseSaleDiscountService');
    const activeSales = await SupabaseSaleDiscountService.getActiveSales();
    console.log('ProductPage active sales:', activeSales);
    
    // Convert product to format expected by service
    const productForService = {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      details: product.details,
      category: product.category,
      sale_id: product.sale_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    applicableSale = SupabaseSaleDiscountService.findBestSaleForProduct(productForService, activeSales);
    console.log('ProductPage found applicable sale:', applicableSale);
    
    // Check discounts
    const { DiscountService } = await import('@/lib/discountService');
    const activeDiscounts = await DiscountService.getActiveDiscounts();
    console.log('ProductPage active discounts:', activeDiscounts);
    
    applicableDiscount = activeDiscounts.find(discount => 
      DiscountService.getApplicableDiscount(discount, product.id, product.price)
    );
    console.log('ProductPage found applicable discount:', applicableDiscount);
    
    // Calculate best price (sale vs discount)
    let salePrice = product.price;
    let discountPrice = product.price;
    
    if (applicableSale) {
      salePrice = SupabaseSaleDiscountService.calculateDiscountedPrice(product.price, applicableSale);
      console.log('ProductPage calculated sale price:', { original: product.price, sale: salePrice });
    }
    
    if (applicableDiscount) {
      discountPrice = DiscountService.calculateDiscountedPrice(product.price, applicableDiscount);
      console.log('ProductPage calculated discount price:', { original: product.price, discount: discountPrice });
    }
    
    // Use the better price
    const bestPrice = Math.min(salePrice, discountPrice);
    if (bestPrice < product.price) {
      discountedPrice = bestPrice;
      console.log('ProductPage final discounted price:', { original: product.price, final: discountedPrice });
    }
    
  } catch (error) {
    console.error('Error fetching discounts for product:', error);
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
          <AddToCartButton product={{ id: product._id, name: product.name, price: product.price, image: product.image }} />
          <CheckoutButton product={{ id: product._id, name: product.name, price: product.price, image: product.image }} />
        </div>
      </div>
    </div>
  );
}
