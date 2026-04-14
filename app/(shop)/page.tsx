import Link from 'next/link';
import VideoBackground from '@/components/VideoBackground';
import SaleBanner from '@/components/SaleBanner';
import ProductCard from '@/components/ProductCard';

// Hybrid DB / Mock fetch
async function getProducts() {
  try {
    const { ProductService } = await import('@/lib/supabaseModels');
    
    const products = await ProductService.getAll();
    
    return products.map((p) => ({
      _id: p.id,
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      category: p.category || 'uncategorized',
      sale_id: p.sale_id
    }));
  } catch (error) {
    console.error("Error fetching products from Supabase:", error);
    return [];
  }
}

async function getActiveSales() {
  try {
    const { SaleService } = await import('@/lib/supabaseModels');
    
    const sales = await SaleService.getActive();
    
    return sales;
  } catch (error) {
    console.error("Error fetching sales:", error);
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();
  const activeSales = await getActiveSales();
  
  // Get active discounts
  let activeDiscounts: any[] = [];
  try {
    const { DiscountService } = await import('@/lib/discountService');
    activeDiscounts = await DiscountService.getActiveDiscounts();
  } catch (error) {
    console.error('Error fetching discounts:', error);
  }

  // Filter products with sales for Sale Items section
  const saleProducts = products.filter((product) => {
    return activeSales.some((sale) => {
      if (sale.discount_type === 'site-wide') return true;
      if (sale.discount_type === 'category' && product.category) {
        return sale.applicable_categories?.includes(product.category);
      }
      if (sale.discount_type === 'product-specific') {
        return sale.applicable_products?.includes(product.id) || product.sale_id === sale.id;
      }
      return false;
    });
  });

  // Filter products with discounts for Discount Items section
  const discountProducts = products.filter((product) => {
    return activeDiscounts.some((discount) => {
      if (discount.type === 'percentage' || discount.type === 'fixed') {
        return discount.applicable_products?.includes(product.id);
      }
      return false;
    });
  });

  // All products excluding only those with sales (discounts stay in all products)
  const regularProducts = products.filter((product) => {
    const hasSale = saleProducts.some(saleProduct => saleProduct._id === product._id);
    return !hasSale;
  });

  return (
    <main className="flex-grow w-full">
      {/* Sale Banners */}
      {activeSales.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="space-y-8">
            {activeSales.map((sale) => (
              <SaleBanner 
                key={sale.id} 
                sale={{
                  title: sale.title,
                  description: sale.description,
                  bannerText: sale.banner_text,
                  discountType: sale.discount_type,
                  discountValue: sale.discount_value,
                  endDate: sale.end_date,
                  backgroundColor: sale.background_color || '#000000',
                  textColor: sale.text_color || '#ffffff',
                  bannerImage: sale.banner_image || '',
                  showCountdown: sale.show_countdown
                }} 
              />
            ))}
          </div>
        </section>
      )}

      {/* Enhanced 4K Video Hero Section */}
      <section className="relative w-full h-screen min-h-[800px] flex items-center justify-center overflow-hidden">
        <VideoBackground 
          videoSrc="/videos/background.mp4"
          className="w-full h-full"
        >
          <div className="flex flex-col items-center text-center px-4 max-w-5xl mx-auto transform transition-all duration-700 ease-out">
            <h1 className="text-6xl md:text-8xl lg:text-9xl text-white font-playfair font-medium tracking-tight mb-8 leading-tight transform hover:scale-105 transition-transform duration-500">
              Elevate Your Everyday
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-zinc-100 font-light mb-12 max-w-3xl leading-relaxed">
              Discover a curated collection of premium essentials designed for the modern lifestyle.
            </p>
            <div className="flex gap-6 flex-col sm:flex-row items-center">
              <Link 
                href="#sale-items" 
                className="border-2 border-white text-white px-12 py-5 text-sm tracking-[0.3em] uppercase font-bold hover:bg-white hover:text-black transition-all duration-300 rounded-sm hover:scale-105 transform"
              >
                Shop Sale Items
              </Link>
              {discountProducts.length > 0 && (
                <Link 
                  href="#discount-items" 
                  className="border-2 border-white text-white px-12 py-5 text-sm tracking-[0.3em] uppercase font-bold hover:bg-white hover:text-black transition-all duration-300 rounded-sm hover:scale-105 transform"
                >
                  Shop Discount Items
                </Link>
              )}
              <Link 
                href="/search" 
                className="border-2 border-white text-white px-12 py-5 text-sm tracking-[0.3em] uppercase font-bold hover:bg-white hover:text-black transition-all duration-300 rounded-sm hover:scale-105 transform"
              >
                View All Products
              </Link>
            </div>
          </div>
        </VideoBackground>
      </section>

      {/* Sale Items Section */}
      {saleProducts.length > 0 && (
        <section id="sale-items" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-4xl text-zinc-900 font-playfair font-medium tracking-tight">
              Sale Items
            </h2>
            <Link href="/sale-items" className="text-sm font-semibold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors border-b border-transparent hover:border-black pb-1">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {saleProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Discount Items Section */}
      {discountProducts.length > 0 && (
        <section id="discount-items" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-4xl text-zinc-900 font-playfair font-medium tracking-tight">
              Discount Items
            </h2>
            <Link href="/discount-items" className="text-sm font-semibold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors border-b border-transparent hover:border-black pb-1">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {discountProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* All Products Section */}
      <section id="all-products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-4xl text-zinc-900 font-playfair font-medium tracking-tight">
            All Products
          </h2>
          <Link href="/search" className="text-sm font-semibold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors border-b border-transparent hover:border-black pb-1">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {regularProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
