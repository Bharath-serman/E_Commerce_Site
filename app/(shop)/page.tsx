import Link from 'next/link';
import { connectMongo } from '@/lib/mongodb';
import Product from '@/models/Product';

// Hybrid DB / Mock fetch
async function getProducts() {
  try {
    await connectMongo();
    const dbProducts = await Product.find({}).lean();
    if (dbProducts.length > 0) {
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
  
  // Fallback if DB is empty or fails to connect
  return [
    { _id: '1', name: 'Essential Cotton T-Shirt', price: 35, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { _id: '2', name: 'Minimalist Hoodie', price: 65, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { _id: '3', name: 'Classic Denim Jacket', price: 120, image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { _id: '4', name: 'Wool Blend Coat', price: 195, image: 'https://images.unsplash.com/photo-1539533018408-ea9a9ba39151?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
  ];
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="w-full flex-grow flex flex-col">
      {/* Video Hero Section */}
      <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-black">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-60 z-0">
          <source src="https://videos.pexels.com/video-files/3205917/3205917-uhd_2560_1440_25fps.mp4" type="video/mp4" />
        </video>
        
        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl text-white font-playfair font-medium tracking-tight mb-8">
            Elevate Your Everyday
          </h1>
          <p className="text-lg md:text-xl text-zinc-200 font-light mb-10 max-w-2xl">
            Discover a curated collection of premium essentials designed for the modern lifestyle.
          </p>
          <div className="flex gap-4 flex-col sm:flex-row">
            <Link href="#collection" className="bg-white text-black px-10 py-4 text-xs tracking-[0.2em] uppercase font-bold hover:bg-zinc-200 transition-colors rounded-sm shadow-xl">
              Explore Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section id="collection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-4xl text-zinc-900 font-playfair font-medium tracking-tight">Trending Now</h2>
          <Link href="/search" className="text-sm font-semibold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors border-b border-transparent hover:border-black pb-1">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {products.map((product) => (
            <Link href={`/product/${product._id}`} key={product._id} className="group block">
              <div className="relative w-full aspect-[4/5] bg-zinc-100 rounded-sm overflow-hidden border border-zinc-200 shadow-sm transition-shadow hover:shadow-xl">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]" />
              </div>
              <div className="mt-6 flex justify-between items-center text-zinc-900">
                <h3 className="text-sm uppercase tracking-wider font-semibold">{product.name}</h3>
                <p className="text-sm font-medium">${product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
