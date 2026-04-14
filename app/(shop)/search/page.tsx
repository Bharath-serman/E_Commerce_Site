import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

// Supabase search fetch
const searchProducts = async (query: string) => {
  try {
    // Use Supabase ProductService
    const { ProductService } = await import('@/lib/supabaseModels');
    const allProducts = await ProductService.getAll();
    
    // Filter products client-side (since Supabase doesn't have text search in this setup)
    const filteredProducts = query 
      ? allProducts.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
      : allProducts;
    
    return filteredProducts.map((p) => ({
      _id: p.id,
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      category: p.category,
      sale_id: p.sale_id
    }));
  } catch (error) {
    console.error("Supabase search failed:", error);
    return [];
  }
};

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';
  const results = await searchProducts(query);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 lg:px-8 min-h-[calc(100vh-16rem)] w-full flex-grow">
      <div className="mb-12 border-b border-zinc-200 pb-8">
        <h1 className="text-3xl font-playfair font-medium text-black tracking-tight">
          {query ? `Search results for "${query}"` : "All Products"}
        </h1>
        <p className="mt-2 text-zinc-500 font-medium">{results.length} {results.length === 1 ? 'result' : 'results'} found</p>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {results.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-lg font-medium mb-6">We couldn't find any products matching your search.</p>
          <Link href="/" className="text-xs uppercase tracking-widest font-bold border-b-2 border-black pb-1 text-black hover:text-zinc-600 hover:border-zinc-600 transition-all">
            Return to Homepage
          </Link>
        </div>
      )}
    </div>
  );
}
