import SearchPageClient from '@/components/SearchPageClient';

const getAllProducts = async () => {
  try {
    const { ProductService } = await import('@/lib/supabaseModels');
    const allProducts = await ProductService.getAll();
    
    return allProducts.map((p) => ({
      _id: p.id,
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.description,
      image: p.image,
      category: p.category,
      sale_id: p.sale_id,
    }));
  } catch (error) {
    console.error('Supabase product fetch failed:', error);
    return [];
  }
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams?.q || '';
  const products = await getAllProducts();

  return <SearchPageClient initialProducts={products} initialQuery={query} />;
}
