import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/contexts/CartContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Aesthetic Premium Store",
  description: "High-performance e-commerce platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased bg-white`} style={{ colorScheme: "light" }}>
      <body className="min-h-full flex flex-col font-sans bg-white text-black">
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
      </body>
    </html>
  );
}
