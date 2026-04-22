'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DiscountService } from '@/lib/discountService';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedSize?: string;
};

export type DiscountedCartItem = {
  id: string;
  name: string;
  originalPrice: number;
  discountedPrice: number;
  quantity: number;
  discount: any;
};

type CartContextType = {
  items: CartItem[];
  discountedItems: DiscountedCartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  totalDiscount: number;
  discountedTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountedItems, setDiscountedItems] = useState<DiscountedCartItem[]>([]);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Calculate discounts when items change
  useEffect(() => {
    const calculateDiscounts = async () => {
      if (items.length === 0) {
        setDiscountedItems([]);
        setTotalDiscount(0);
        return;
      }

      try {
        // Get both sales discounts and regular discounts
        const [salesRes, discounts] = await Promise.all([
          fetch('/api/sale-discounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
          }),
          DiscountService.getActiveDiscounts()
        ]);

        let allDiscountedItems: DiscountedCartItem[] = [];
        let totalCartDiscount = 0;

        // Process sales discounts
        if (salesRes.ok) {
          const salesData = await salesRes.json();
          if (salesData.success) {
            allDiscountedItems = salesData.data.discountedItems;
            totalCartDiscount = salesData.data.totalDiscount;
          }
        }

        // Process regular discounts and find better deals
        if (discounts.length > 0) {
          for (const item of items) {
            const applicableDiscount = discounts.find(discount => 
              DiscountService.getApplicableDiscount(discount, item.id, item.price * item.quantity)
            );
            
            if (applicableDiscount) {
              const discountedPrice = DiscountService.calculateDiscountedPrice(item.price, applicableDiscount);
              const existingItem = allDiscountedItems.find(d => d.id === item.id);
              
              if (!existingItem || discountedPrice < existingItem.discountedPrice) {
                // Update or add the item with better discount
                allDiscountedItems = allDiscountedItems.filter(d => d.id !== item.id);
                allDiscountedItems.push({
                  id: item.id,
                  name: item.name,
                  originalPrice: item.price,
                  discountedPrice,
                  quantity: item.quantity,
                  discount: applicableDiscount
                });
              }
            }
          }
          
          // Recalculate total discount
          totalCartDiscount = allDiscountedItems.reduce((total, item) => {
            return total + ((item.originalPrice - item.discountedPrice) * item.quantity);
          }, 0);
        }

        setDiscountedItems(allDiscountedItems);
        setTotalDiscount(totalCartDiscount);
      } catch (error) {
        console.error('Error calculating discounts:', error);
        setDiscountedItems([]);
        setTotalDiscount(0);
      }
    };

    calculateDiscounts();
  }, [items]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('aesthetic_cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {}
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('aesthetic_cart', JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addToCart = useCallback((newItem: CartItem) => {
    setItems(prev => {
      // Find existing item with same id AND same size (if size is specified)
      const existing = prev.find(i => 
        i.id === newItem.id && 
        (i.selectedSize === newItem.selectedSize || (!i.selectedSize && !newItem.selectedSize))
      );
      if (existing) {
        return prev.map(i => 
          i.id === newItem.id && i.selectedSize === newItem.selectedSize 
            ? { ...i, quantity: i.quantity + newItem.quantity } 
            : i
        );
      }
      return [...prev, newItem];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscountedItems([]);
    setTotalDiscount(0);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountedTotal = totalPrice - totalDiscount;

  return (
    <CartContext.Provider value={{ 
      items, 
      discountedItems, 
      totalDiscount, 
      discountedTotal,
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      totalItems, 
      totalPrice 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
