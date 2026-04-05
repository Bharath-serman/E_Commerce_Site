'use client';

import BrandedSpinner from './BrandedSpinner';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed? This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto outline-none focus:outline-none backdrop-blur-sm bg-black/60 transition-opacity duration-300">
      <div className="relative w-full max-w-md mx-auto my-6 bg-white rounded-sm shadow-2xl border border-zinc-200">
        {/* Modal Header */}
        <div className="p-10 text-center">
          <h3 className="text-2xl font-playfair font-medium text-black tracking-tight mb-4">{title}</h3>
          <p className="text-zinc-500 text-sm font-light leading-relaxed mb-8">{message}</p>
        </div>

        {/* Modal Actions */}
        <div className="flex border-t border-zinc-100 divide-x divide-zinc-100">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-black hover:bg-zinc-50 transition-all disabled:text-zinc-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-5 text-xs font-bold uppercase tracking-[0.2em] text-red-600 hover:text-red-700 hover:bg-red-50 transition-all disabled:bg-red-50/50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <BrandedSpinner size="sm" color="black" />
                <span>Processing</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
