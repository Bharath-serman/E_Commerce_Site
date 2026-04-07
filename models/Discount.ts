import mongoose, { Schema, Document } from 'mongoose';

export interface IDiscount extends Document {
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  applicableProducts: string[]; // Product IDs
  minOrderValue?: number;
  maxDiscountAmount?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  createdAt: Date;
}

const DiscountSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  applicableProducts: [{ type: String }], // Array of product names
  minOrderValue: { type: Number },
  maxDiscountAmount: { type: Number },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  usageLimit: { type: Number },
  usedCount: { type: Number, default: 0 },
}, {
  timestamps: true
});

export default mongoose.models.Discount || mongoose.model<IDiscount>('Discount', DiscountSchema);
