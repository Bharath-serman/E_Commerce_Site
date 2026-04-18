'use client';

import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  const handleSignOut = async () => {
    try {
      await fetch('/api/admin/signout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Sign out error:', error);
      router.push('/admin/login');
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AdminSidebar />

      <main className="flex-grow flex flex-col min-h-screen">
        <header className="h-20 bg-white border-b border-zinc-200 flex items-center px-8 justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Status: Operational</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-xs uppercase font-bold tracking-widest text-zinc-600 hover:text-black hover:bg-zinc-100 transition-colors rounded-sm"
          >
            Sign Out
          </button>
        </header>

        <div className="flex-grow flex flex-col items-center">
          {children}
        </div>
      </main>
    </div>
  );
}
