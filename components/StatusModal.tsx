'use client';

import BrandedSpinner from './BrandedSpinner';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title: string;
  message: string;
  buttonText?: string;
}

export default function StatusModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  buttonText = "Continue"
}: StatusModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto outline-none focus:outline-none backdrop-blur-sm bg-black/40 transition-opacity duration-300">
      <div className="relative w-full max-w-sm mx-auto my-6 bg-white rounded-sm shadow-2xl border border-zinc-100 p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-6 ${type === 'success' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
          {type === 'success' ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        
        <h3 className="text-xl font-playfair font-medium text-black tracking-tight mb-2">{title}</h3>
        <p className="text-zinc-500 text-xs font-light leading-relaxed mb-8">{message}</p>

        <button
          onClick={onClose}
          className={`w-full py-4 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm transition-all shadow-sm ${type === 'success' ? 'bg-black text-white hover:bg-zinc-800' : 'bg-red-600 text-white hover:bg-red-700'}`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
