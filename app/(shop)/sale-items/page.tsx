import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

// Fetch products with sales
async function getSaleProducts() {
  try {
    const { ProductService } = await import('@/lib/supabaseModels');
    const { SupabaseSaleDiscountService } = await import('@/lib/supabaseSaleDiscountService');
    
    const [products, activeSales] = await Promise.all([
      ProductService.getAll(),
      SupabaseSaleDiscountService.getActiveSales()
    ]);
    
    // Filter products with discounts
    const saleProducts = products.filter((product) => {
      return activeSales.some((sale) => {
        if (sale.discount_type === 'site-wide') return true;
        if (sale.discount_type === 'category' && product.category) {
          return sale.applicable_categories?.includes(product.category);
        }
        if (sale.discount_type === 'product-specific') {
          return product.sale_id === sale.id;
        }
        return false;
      });
    });
    
    return saleProducts.map((p) => ({
      _id: p.id,
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      category: p.category || 'uncategorized',
      sale_id: p.sale_id
    }));
  } catch (error) {
    console.error("Error fetching sale products:", error);
    return [];
  }
}

export default async function SaleItemsPage() {
  const saleProducts = await getSaleProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 lg:px-8 min-h-[calc(100vh-16rem)] w-full flex-grow">
      <div className="mb-12 border-b border-zinc-200 pb-8">
        <h1 className="text-3xl font-playfair font-medium text-black tracking-tight">
          Sale Items
        </h1>
        <p className="mt-2 text-zinc-500 font-medium">{saleProducts.length} {saleProducts.length === 1 ? 'item' : 'items'} on sale</p>
      </div>

      {saleProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {saleProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-lg font-medium mb-6">No items are currently on sale.</p>
          <Link href="/" className="text-xs uppercase tracking-widest font-bold border-b-2 border-black pb-1 text-black hover:text-zinc-600 hover:border-zinc-600 transition-all">
            Return to Homepage
          </Link>
        </div>
      )}
    </div>
  );
}
