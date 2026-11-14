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

  // All products - show all products regardless of sales
  const regularProducts = products;

  // Memoize sale props to prevent unnecessary re-renders
  const memoizedSales = activeSales.map((sale) => ({
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
  }));

  return (
    <main className="flex-grow w-full">
      {/* Sale Banners */}
      {activeSales.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="space-y-8">
            {activeSales.map((sale, index) => (
              <SaleBanner 
                key={sale.id} 
                sale={memoizedSales[index]} 
              />
            ))}
          </div>
        </section>
      )}

      {/* Enhanced 4K Video Hero Section */}
      <section className="relative w-full h-[90vh] min-h-[640px] max-h-[920px] overflow-hidden">
        <VideoBackground 
          videoSrc="/videos/Bethy_Website_Hero.mp4"
          className="w-full h-full"
          overlayClassName="bg-gradient-to-t from-black/90 via-black/20 to-black/10"
          contentClassName="flex items-end justify-center pb-12 sm:pb-16 lg:pb-20"
        >
          <div className="flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl text-white font-playfair font-normal tracking-wide mb-3 leading-tight drop-shadow-md">
              Bethy Store
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-zinc-200/90 font-light mb-8 max-w-xl mx-auto leading-relaxed drop-shadow-sm">
              Discover a curated collection of premium essentials designed for the modern lifestyle.
            </p>
            <div className="flex flex-wrap gap-4 items-center justify-center">
              {saleProducts.length > 0 && (
                <Link 
                  href="#sale-items" 
                  className="border border-white/80 bg-white/10 backdrop-blur-sm text-white px-7 py-3 text-xs tracking-[0.2em] uppercase font-medium hover:bg-white hover:text-black transition-all duration-300 rounded-sm"
                >
                  Shop Sale Items
                </Link>
              )}
              {discountProducts.length > 0 && (
                <Link 
                  href="#discount-items" 
                  className="border border-white/80 bg-white/10 backdrop-blur-sm text-white px-7 py-3 text-xs tracking-[0.2em] uppercase font-medium hover:bg-white hover:text-black transition-all duration-300 rounded-sm"
                >
                  Shop Discount Items
                </Link>
              )}
              <Link 
                href="/search" 
                className="border border-white/80 bg-white/10 backdrop-blur-sm text-white px-7 py-3 text-xs tracking-[0.2em] uppercase font-medium hover:bg-white hover:text-black transition-all duration-300 rounded-sm"
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
