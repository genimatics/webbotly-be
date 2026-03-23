// models/CheckoutCustomer.ts

import { Schema, model, Document } from "mongoose";

export interface ICheckoutCustomer extends Document {
  email: string;
  name?: string;
  paddleCustomerId?: string;
  checkoutId: string;
  subscriptionId?: string;
  priceId: string;
  event: Object;
  createdAt: Date;
}

const CheckoutCustomerSchema = new Schema<ICheckoutCustomer>({
  email: { type: String, required: true },
  name: { type: String },
  paddleCustomerId: { type: String },
  checkoutId: { type: String, required: true },
  subscriptionId: { type: String },
  priceId: { type: String, required: true },
  event: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

export default model<ICheckoutCustomer>(
  "CheckoutCustomer",
  CheckoutCustomerSchema
);
