import Link from 'next/link';
import { connectMongo } from '@/lib/mongodb';
import Product from '@/models/Product';

// Hybrid DB / Mock fetch specifically for Search
const searchProducts = async (query: string) => {
  try {
    await connectMongo();
    // Directly ask MongoDB to find products mentioning the keyword (case-insensitive)
    const filter = query ? { name: { $regex: query, $options: 'i' } } : {};
    const dbProducts = await Product.find(filter).lean();
    
    if (dbProducts.length > 0 || !query) {
      return dbProducts.map((p: any) => ({
        _id: p._id.toString(),
        name: p.name,
        price: p.price,
        image: p.image
      }));
    }
  } catch (error) {
    console.warn("MongoDB not connected or empty, falling back to mock data.");
  }
  
  // Fallback Mock Data if MongoDB isn't running or finds 0 results but DB has 0 items
  const mockProducts = [
    { _id: '1', name: 'Essential Cotton T-Shirt', price: 35, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { _id: '2', name: 'Minimalist Hoodie', price: 65, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { _id: '3', name: 'Classic Denim Jacket', price: 120, image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { _id: '4', name: 'Wool Blend Coat', price: 195, image: 'https://images.unsplash.com/photo-1539533018408-ea9a9ba39151?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
  ];

  return query 
    ? mockProducts.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : mockProducts;
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
          {results.map((product) => {
            const productLink = product._id ? `/product/${product._id}` : '/product/1';
            return (
              <Link href={productLink} key={product._id || 'fallback'} className="group block">
              <div className="relative w-full aspect-[4/5] bg-zinc-100 rounded-sm overflow-hidden border border-zinc-200 shadow-sm transition-shadow hover:shadow-xl">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                />
              </div>
              <div className="mt-6 flex justify-between items-center text-black">
                <h3 className="text-sm uppercase tracking-wider font-semibold">{product.name}</h3>
                <p className="text-sm font-bold">${product.price}</p>
              </div>
            </Link>
            );
          })}
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
