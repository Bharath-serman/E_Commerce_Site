import mongoose, { Schema, Document } from 'mongoose';

export interface ISale extends Document {
  title: string;
  description: string;
  bannerText: string;
  discountType: 'site-wide' | 'category' | 'product-specific';
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  bannerImage?: string;
  backgroundColor?: string;
  textColor?: string;
  showCountdown: boolean;
  priority: number; // For ordering multiple sales
  // Fields for specific discount types
  applicableCategories?: string[]; // For category discounts
  applicableProducts?: string[]; // For product-specific discounts
  createdAt: Date;
}

const SaleSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  bannerText: { type: String, required: true },
  discountType: { type: String, enum: ['site-wide', 'category', 'product-specific'], required: true },
  discountValue: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  bannerImage: { type: String },
  backgroundColor: { type: String, default: '#000000' },
  textColor: { type: String, default: '#ffffff' },
  showCountdown: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
  // Fields for specific discount types
  applicableCategories: [{ type: String }], // For category discounts
  applicableProducts: [{ type: String }], // For product-specific discounts
}, {
  timestamps: true
});

export default mongoose.models.Sale || mongoose.model<ISale>('Sale', SaleSchema);
