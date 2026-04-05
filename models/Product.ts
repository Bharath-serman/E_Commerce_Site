import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  description: string;
  image: string;
  details: string[];
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  details: { type: [String], default: [] },
}, {
  timestamps: true 
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
