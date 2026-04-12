import Link from 'next/link';
import { connectMongo } from '@/lib/mongodb';
import Product from '@/models/Product';
import VideoBackground from '@/components/VideoBackground';
import SaleBanner from '@/components/SaleBanner';
import ProductCard from '@/components/ProductCard';

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
        image: p.image,
        category: p.category || 'uncategorized'
      }));
    }
  } catch (error) {
    console.warn("MongoDB not connected or empty, falling back to mock data.");
  }
  
  // Fallback if DB is empty or fails to connect
  return [
    { _id: '1', name: 'Essential Cotton T-Shirt', price: 35, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', category: 'clothing' },
    { _id: '2', name: 'Minimalist Hoodie', price: 65, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', category: 'clothing' },
    { _id: '3', name: 'Classic Denim Jacket', price: 120, image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', category: 'clothing' },
    { _id: '4', name: 'Wool Blend Coat', price: 195, image: 'https://images.unsplash.com/photo-1539533018408-ea9a9ba39151?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', category: 'clothing' }
  ];
}

async function getActiveSales() {
  try {
    const { connectMongo } = await import('@/lib/mongodb');
    const { default: Sale } = await import('@/models/Sale');
    
    await connectMongo();
    const sales = await Sale.find({ isActive: true }).sort({ priority: -1, createdAt: -1 }).lean();
    
    return sales.filter((sale: any) => 
      new Date() >= new Date(sale.startDate) && 
      new Date() <= new Date(sale.endDate)
    );
  } catch (error) {
    console.error("Error fetching sales:", error);
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();
  const activeSales = await getActiveSales();

  return (
    <main className="w-full flex-grow flex flex-col">
      {/* Sale Banner - Show if there are active sales */}
      {activeSales.length > 0 && (
        <section>
          {activeSales.map((sale) => (
            <SaleBanner key={sale._id} sale={sale} />
          ))}
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
                href="#collection" 
                className="bg-white text-black px-12 py-5 text-sm tracking-[0.3em] uppercase font-bold hover:bg-zinc-100 transition-all duration-300 rounded-sm shadow-2xl hover:shadow-3xl hover:scale-105 transform"
              >
                Explore Collection
              </Link>
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

      {/* Featured Products Grid */}
      <section id="collection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-4xl text-zinc-900 font-playfair font-medium tracking-tight">
            {activeSales.length > 0 ? 'Sale Items' : 'Trending Now'}
          </h2>
          <Link href="/search" className="text-sm font-semibold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors border-b border-transparent hover:border-black pb-1">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
