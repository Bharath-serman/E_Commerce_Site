'use client';

interface BrandedSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'black' | 'white' | 'zinc-500';
}

export default function BrandedSpinner({ size = 'md', color = 'black' }: BrandedSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-[12px]',
    xl: 'text-[16px]'
  };

  const colorClasses = {
    black: 'text-black border-black',
    white: 'text-white border-white',
    'zinc-500': 'text-zinc-500 border-zinc-300'
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
      {/* Outer Rotating Ring */}
      <div className={`absolute inset-0 border-t-2 rounded-full animate-spin ${colorClasses[color]}`}></div>
      
      {/* Inner Branded Text */}
      <span className={`font-playfair font-bold uppercase tracking-[0.3em] ${textSizes[size]} ${colorClasses[color]}`}>
        A
      </span>
      
      {/* Optional: Full Name as a secondary element if large enough */}
      {size === 'xl' && (
        <span className="absolute -bottom-10 font-playfair font-medium uppercase tracking-[0.4em] text-zinc-400 text-xs text-nowrap">
          Aesthetic
        </span>
      )}
    </div>
  );
}
