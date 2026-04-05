import BrandedSpinner from '@/components/BrandedSpinner';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center p-20 min-h-[60vh] w-full bg-zinc-50 border border-zinc-100 rounded-sm">
      <BrandedSpinner size="lg" color="black" />
      <p className="mt-8 text-[10px] uppercase tracking-[0.3em] font-medium text-zinc-400 animate-pulse">
        Admin Console
      </p>
    </div>
  );
}
