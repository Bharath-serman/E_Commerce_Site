import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AdminSidebar />

      <main className="flex-grow flex flex-col min-h-screen">
        <header className="h-20 bg-white border-b border-zinc-200 flex items-center px-8 justify-end">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Status: Operational</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </header>
        
        <div className="flex-grow flex flex-col items-center">
          {children}
        </div>
      </main>
    </div>
  );
}
