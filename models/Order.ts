import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  stripeSessionId: string;
  customerName: string;
  customerEmail: string;
  items: any[];
  totalAmount: number;
  status: string;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema({
  stripeSessionId: { type: String, required: true, unique: true },
  transactionId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  items: { type: Array, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Paid' },
}, {
  timestamps: true
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
