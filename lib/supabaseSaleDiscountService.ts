import { supabase, Database } from './supabase';
import { ProductService, SaleService, Product, Sale } from './supabaseModels';

export interface SaleDiscount {
  id: string;
  title: string;
  discount_type: 'site-wide' | 'category' | 'product-specific';
  discount_value: number;
  applicable_categories?: string[];
  applicable_products?: string[];
  start_date: Date;
  end_date: Date;
  is_active: boolean;
  startDate: Date;
}

export interface DiscountedProduct {
  id: string;
  name: string;
  originalPrice: number;
  discountedPrice: number;
  discount: SaleDiscount | null;
  category?: string;
}

export class SupabaseSaleDiscountService {
  static async getActiveSales(): Promise<SaleDiscount[]> {
    try {
      // Use the same logic as SaleService.getActive()
      const sales = await SaleService.getActive();
      
      return sales.map((sale: any) => ({
        id: sale.id,
        title: sale.title,
        discount_type: sale.discount_type,
        discount_value: sale.discount_value,
        applicable_categories: sale.applicable_categories,
        applicable_products: sale.applicable_products,
        start_date: new Date(sale.start_date),
        end_date: new Date(sale.end_date),
        is_active: sale.is_active,
        startDate: new Date(sale.start_date)
      }));
    } catch (error) {
      console.error('Error fetching active sales:', error);
      return [];
    }
  }

  static async getProductsWithDiscounts(): Promise<DiscountedProduct[]> {
    try {
      const [products, activeSales] = await Promise.all([
        ProductService.getAll(),
        this.getActiveSales()
      ]);

      return products.map(product => {
        const applicableSale = this.findBestSaleForProduct(product, activeSales);
        const discountedPrice = applicableSale 
          ? this.calculateDiscountedPrice(product.price, applicableSale)
          : product.price;

        return {
          id: product.id,
          name: product.name,
          originalPrice: product.price,
          discountedPrice,
          discount: applicableSale,
          category: product.category
        };
      });
    } catch (error) {
      console.error('Error getting products with discounts:', error);
      return [];
    }
  }

  static findBestSaleForProduct(product: Product, activeSales: SaleDiscount[]): SaleDiscount | null {
    let bestSale: SaleDiscount | null = null;
    let bestDiscountedPrice = product.price;

    for (const sale of activeSales) {
      if (this.isSaleApplicableToProduct(sale, product)) {
        const discountedPrice = this.calculateDiscountedPrice(product.price, sale);
        if (discountedPrice < bestDiscountedPrice) {
          bestSale = sale;
          bestDiscountedPrice = discountedPrice;
        }
      }
    }

    return bestSale;
  }

  static isSaleApplicableToProduct(sale: SaleDiscount, product: Product): boolean {
    switch (sale.discount_type) {
      case 'site-wide':
        return true;
      
      case 'category':
        return Boolean(sale.applicable_categories && 
               sale.applicable_categories.includes(product.category || ''));
      
      case 'product-specific':
        console.log('Product-specific sale check:', {
          saleTitle: sale.title,
          productId: product.id,
          productSaleId: product.sale_id,
          saleId: sale.id,
          applicableProducts: sale.applicable_products,
          result: sale.applicable_products?.includes(product.id) || product.sale_id === sale.id
        });
        return sale.applicable_products?.includes(product.id) || product.sale_id === sale.id;
      
      default:
        return false;
    }
  }

  static calculateDiscountedPrice(originalPrice: number, sale: SaleDiscount): number {
    const discountAmount = originalPrice * (sale.discount_value / 100);
    return Math.max(0, originalPrice - discountAmount);
  }

  static async calculateCartDiscount(cartItems: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>): Promise<{
    totalDiscount: number;
    discountedItems: Array<{
      id: string;
      name: string;
      originalPrice: number;
      discountedPrice: number;
      quantity: number;
      discount: SaleDiscount | null;
    }>;
  }> {
    try {
      const [products, activeSales] = await Promise.all([
        ProductService.getAll(),
        this.getActiveSales()
      ]);

      let totalDiscount = 0;
      const discountedItems = [];

      for (const cartItem of cartItems) {
        const product = products.find(p => p.id === cartItem.id);
        if (!product) {
          // Fallback if product not found
          discountedItems.push({
            id: cartItem.id,
            name: cartItem.name,
            originalPrice: cartItem.price,
            discountedPrice: cartItem.price,
            quantity: cartItem.quantity,
            discount: null
          });
          continue;
        }

        const applicableSale = this.findBestSaleForProduct(product, activeSales);
        const discountedPrice = applicableSale 
          ? this.calculateDiscountedPrice(product.price, applicableSale)
          : product.price;

        if (applicableSale) {
          const itemDiscount = (product.price - discountedPrice) * cartItem.quantity;
          totalDiscount += itemDiscount;
        }

        discountedItems.push({
          id: cartItem.id,
          name: cartItem.name,
          originalPrice: product.price,
          discountedPrice,
          quantity: cartItem.quantity,
          discount: applicableSale
        });
      }

      return { totalDiscount, discountedItems };
    } catch (error) {
      console.error('Error calculating cart discount:', error);
      return {
        totalDiscount: 0,
        discountedItems: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          originalPrice: item.price,
          discountedPrice: item.price,
          quantity: item.quantity,
          discount: null
        }))
      };
    }
  }

  static async getCategories(): Promise<string[]> {
    try {
      return await ProductService.getCategories();
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  static async getProductsForCategory(category: string): Promise<any[]> {
    try {
      const products = await supabase
        .from('products')
        .select('id, name')
        .eq('category', category);

      if (products.error) throw products.error;
      
      return products.data?.map((product: any) => ({
        id: product.id,
        name: product.name
      })) || [];
    } catch (error) {
      console.error('Error fetching products for category:', error);
      return [];
    }
  }

  static async getAllProducts(): Promise<any[]> {
    try {
      const products = await supabase
        .from('products')
        .select('id, name, category');

      if (products.error) throw products.error;
      
      return products.data?.map((product: any) => ({
        id: product.id,
        name: product.name,
        category: product.category
      })) || [];
    } catch (error) {
      console.error('Error fetching all products:', error);
      return [];
    }
  }
}
