'use client';

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import CheckoutButton from '@/components/CheckoutButton';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 lg:px-8 w-full min-h-[calc(100vh-16rem)] flex flex-col">
      <h1 className="text-4xl font-playfair font-medium text-zinc-900 tracking-tight mb-12">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="flex-grow flex flex-col items-center pt-20">
          <p className="text-zinc-500 mb-8 font-light text-lg">Your Cart is currently empty.</p>
          <Link href="/" className="bg-zinc-900 text-white px-8 py-4 rounded-sm hover:bg-black transition-colors duration-300 text-xs tracking-[0.2em] uppercase font-bold">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="divide-y divide-zinc-200 border-t border-zinc-200">
              {items.map((item) => (
                <div key={item.id} className="py-8 flex gap-6">
                  <div className="aspect-[4/5] w-24 sm:w-32 flex-shrink-0 bg-zinc-100 rounded-sm overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-between flex-grow">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-base text-zinc-900 font-medium">{item.name}</h3>
                        <p className="mt-1 text-sm text-zinc-500">${item.price}</p>
                      </div>
                      <p className="text-base font-medium text-zinc-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex items-center border border-zinc-300 rounded-sm">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 text-zinc-500 hover:bg-zinc-100 transition-colors">-</button>
                        <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 text-zinc-500 hover:bg-zinc-100 transition-colors">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-xs uppercase tracking-widest text-red-600 hover:text-red-500 font-semibold transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-zinc-50 rounded-sm p-8 border border-zinc-200 sticky top-28">
              <h2 className="text-lg font-medium text-zinc-900 mb-6">Order Summary</h2>
              <div className="space-y-4 text-sm text-zinc-600 mb-6 font-light">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-zinc-900">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-zinc-900">Calculated at checkout</span>
                </div>
              </div>
              <div className="border-t border-zinc-200 pt-6 mb-8 flex justify-between items-center">
                <span className="text-base font-medium text-zinc-900">Total</span>
                <span className="text-xl font-medium text-zinc-900">${totalPrice.toFixed(2)}</span>
              </div>

              <CheckoutButton isCart />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
