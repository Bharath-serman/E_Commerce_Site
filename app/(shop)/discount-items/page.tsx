import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

// Supabase product fetch
const getProducts = async () => {
  try {
    // Use Supabase ProductService
    const { ProductService } = await import('@/lib/supabaseModels');
    const products = await ProductService.getAll();
    return products.map((product: any) => ({
      _id: product.id,
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category || 'uncategorized',
      sale_id: product.sale_id
    }));
  } catch (error) {
    console.error("Supabase fetch failed:", error);
    return [];
  }
};

// Get active discounts
const getActiveDiscounts = async () => {
  try {
    const { DiscountService } = await import('@/lib/discountService');
    return await DiscountService.getActiveDiscounts();
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return [];
  }
};

export default async function DiscountItemsPage() {
  const products = await getProducts();
  const activeDiscounts = await getActiveDiscounts();

  // Filter products with discounts
  const discountProducts = products.filter((product) => {
    return activeDiscounts.some((discount) => {
      if (discount.type === 'percentage' || discount.type === 'fixed') {
        return discount.applicable_products?.includes(product.id);
      }
      return false;
    });
  });

  if (discountProducts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="text-center">
          <h1 className="text-4xl text-zinc-900 font-playfair font-medium tracking-tight mb-8">
            Discount Items
          </h1>
          <p className="text-lg text-zinc-600 mb-8">
            No discounted items available at the moment.
          </p>
          <a 
            href="/search" 
            className="inline-block border-2 border-black text-black px-8 py-3 text-sm tracking-[0.3em] uppercase font-bold hover:bg-black hover:text-white transition-all duration-300 rounded-sm"
          >
            View All Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
      <div className="mb-16">
        <h1 className="text-4xl text-zinc-900 font-playfair font-medium tracking-tight mb-4">
          Discount Items
        </h1>
        <p className="text-lg text-zinc-600">
          Discover amazing deals on your favorite products.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
        {discountProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      <div className="mt-24 text-center">
        <a 
          href="/search" 
          className="inline-block border-2 border-black text-black px-8 py-3 text-sm tracking-[0.3em] uppercase font-bold hover:bg-black hover:text-white transition-all duration-300 rounded-sm"
        >
          View All Products
        </a>
      </div>
    </div>
  );
}
