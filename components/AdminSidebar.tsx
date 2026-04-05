'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    const baseClass = "block px-4 py-3 rounded-md text-sm font-medium transition-colors";
    const activeClass = "bg-zinc-800 text-white";
    const inactiveClass = "text-zinc-400 hover:bg-zinc-800 hover:text-white";
    
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  return (
    <aside className="w-64 bg-zinc-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-8 border-b border-zinc-800">
        <Link href="/admin" className="text-xl font-bold tracking-widest uppercase font-playfair">
          Aesthetic Admin
        </Link>
      </div>
      
      <nav className="flex-grow p-4 space-y-2">
        <Link href="/admin" className={getLinkClass('/admin')}>
          Dashboard
        </Link>
        <Link href="/admin/products" className={getLinkClass('/admin/products')}>
          Manage Inventory
        </Link>
        <Link href="/" className="block px-4 py-3 rounded-md text-zinc-400 text-sm font-medium hover:bg-zinc-800 hover:text-white transition-colors">
          View Store
        </Link>
      </nav>

      <div className="p-8 border-t border-zinc-800">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Priority Support</p>
      </div>
    </aside>
  );
}
