import Navbar from "@/components/Navbar";
import { CartProvider } from "@/contexts/CartContext";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Navbar />
      {children}
      <footer className="mt-auto border-t border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 text-center">
          <span className="text-xl font-bold tracking-widest uppercase text-black block mb-4 font-playfair">Aesthetic</span>
          <p className="text-sm text-zinc-500 font-light">
            &copy; 2026 Aesthetic Clothing Store. All rights reserved.
          </p>
        </div>
      </footer>
    </CartProvider>
  );
}
