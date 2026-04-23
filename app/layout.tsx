import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import PageTracker from "@/components/PageTracker";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Aesthetic",
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
        <PageTracker />
        {children}
      </body>
    </html>
  );
}
