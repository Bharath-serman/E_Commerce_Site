import BrandedSpinner from '@/components/BrandedSpinner';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full bg-white transition-opacity duration-1000 ease-in-out opacity-100">
      <BrandedSpinner size="lg" color="black" />
      <p className="mt-8 text-[10px] uppercase tracking-[0.3em] font-medium text-zinc-400 animate-pulse">
        Aesthetic
      </p>
    </div>
  );
}
