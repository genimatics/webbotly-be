import mongoose, { Schema, Document } from "mongoose";

export type PaymentPlanType = "basic" | "premium" | "enterprise";

export interface IPaymentPlan extends Document {
  transactionId?: string;
  type: PaymentPlanType;
  amount: number;
  discount?: number;
  active: boolean;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentPlanSchema: Schema<IPaymentPlan> = new Schema(
  {
    transactionId: { type: String, unique: true },
    type: { type: String, enum: ["basic", "premium", "enterprise"], required: true },
    amount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt
);

export default mongoose.model<IPaymentPlan>("PaymentPlan", PaymentPlanSchema);
