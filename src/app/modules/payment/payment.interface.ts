import { Document, Schema } from 'mongoose';

// Define the possible payment types
export type PaymentType = 'booking' | 'subscription';

// Define the structure of a payment document
export interface IPayment extends Document {
  user_id: Schema.Types.ObjectId | null; 
  amount: number;
  paymentStatus: 'pending' | 'completed' | 'paid' ;
  transactionId: string;
  paymentMethod: "Paypal" | "Stripe" | "Card" | "Bank";
  subscription: Schema.Types.ObjectId | null; // Only set for subscription payments
}

