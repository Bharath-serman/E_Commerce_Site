import { connectMongo } from './mongodb';
import Sale from '@/models/Sale';
import Product from '@/models/Product';

export interface SaleDiscount {
  _id: string;
  title: string;
  discountType: 'site-wide' | 'category' | 'product-specific';
  discountValue: number;
  applicableCategories?: string[];
  applicableProducts?: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface DiscountedProduct {
  id: string;
  name: string;
  originalPrice: number;
  discountedPrice: number;
  discount: SaleDiscount | null;
  category?: string;
}

export class SaleDiscountService {
  static async getActiveSales(): Promise<SaleDiscount[]> {
    try {
      await connectMongo();
      
      const sales = await Sale.find({ 
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      }).sort({ priority: -1, createdAt: -1 });
      
      return sales.map(sale => ({
        _id: sale._id.toString(),
        title: sale.title,
        discountType: sale.discountType,
        discountValue: sale.discountValue,
        applicableCategories: sale.applicableCategories || [],
        applicableProducts: sale.applicableProducts || [],
        startDate: sale.startDate,
        endDate: sale.endDate,
        isActive: sale.isActive
      }));
    } catch (error) {
      console.error('Error fetching active sales:', error);
      return [];
    }
  }

  static async getProductsWithDiscounts(): Promise<DiscountedProduct[]> {
    try {
      await connectMongo();
      
      const [products, activeSales] = await Promise.all([
        Product.find({}),
        this.getActiveSales()
      ]);

      return products.map(product => {
        const applicableSale = this.findBestSaleForProduct(product, activeSales);
        const discountedPrice = applicableSale 
          ? this.calculateDiscountedPrice(product.price, applicableSale)
          : product.price;

        return {
          id: product._id.toString(),
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

  static findBestSaleForProduct(product: any, activeSales: SaleDiscount[]): SaleDiscount | null {
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

  static isSaleApplicableToProduct(sale: SaleDiscount, product: any): boolean {
    switch (sale.discountType) {
      case 'site-wide':
        return true;
      
      case 'category':
        return sale.applicableCategories && 
               sale.applicableCategories.includes(product.category);
      
      case 'product-specific':
        console.log('Product-specific sale check:', {
          saleTitle: sale.title,
          productId: product._id.toString(),
          applicableProducts: sale.applicableProducts,
          result: sale.applicableProducts && sale.applicableProducts.includes(product._id.toString())
        });
        return sale.applicableProducts && 
               sale.applicableProducts.includes(product._id.toString());
      
      default:
        return false;
    }
  }

  static calculateDiscountedPrice(originalPrice: number, sale: SaleDiscount): number {
    const discountAmount = originalPrice * (sale.discountValue / 100);
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
        Product.find({}),
        this.getActiveSales()
      ]);

      let totalDiscount = 0;
      const discountedItems = [];

      for (const cartItem of cartItems) {
        const product = products.find(p => p._id.toString() === cartItem.id);
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
          ? this.calculateDiscountedPrice(cartItem.price, applicableSale)
          : cartItem.price;

        if (applicableSale) {
          const itemDiscount = (cartItem.price - discountedPrice) * cartItem.quantity;
          totalDiscount += itemDiscount;
        }

        discountedItems.push({
          id: cartItem.id,
          name: cartItem.name,
          originalPrice: cartItem.price,
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
      await connectMongo();
      
      const categories = await Product.distinct('category');
      return categories.filter(cat => cat && cat !== 'uncategorized');
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  static async getProductsForCategory(category: string): Promise<any[]> {
    try {
      await connectMongo();
      
      const products = await Product.find({ category }).select('_id name');
      return products.map(product => ({
        id: product._id.toString(),
        name: product.name
      }));
    } catch (error) {
      console.error('Error fetching products for category:', error);
      return [];
    }
  }

  static async getAllProducts(): Promise<any[]> {
    try {
      await connectMongo();
      
      const products = await Product.find({}).select('_id name category');
      return products.map(product => ({
        id: product._id.toString(),
        name: product.name,
        category: product.category
      }));
    } catch (error) {
      console.error('Error fetching all products:', error);
      return [];
    }
  }
}
