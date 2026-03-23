// models/UserPlan.ts

import { Schema, model, Document, Types } from "mongoose";

export enum PlanName {
  FOUNDING_MEMBER = "founding-member",
  FREE = "free",
  TRIAL = "trial",
  STARTER_MONTHLY = "starter-monthly",
  STARTER_YEARLY = "starter-yearly",
  STARTER_TRIAL = "starter-trial",
  GROWTH_MONTHLY = "growth-monthly",
  GROWTH_YEARLY = "growth-yearly",
  GROWTH_TRIAL = "growth-trial",
  SCALE_MONTHLY = "scale-monthly",
  SCALE_YEARLY = "scale-yearly",
  SCALE_TRIAL = "scale-trial",
}

export interface IUserPlan extends Document {
  user: string;
  planName: PlanName;
  priceId: string;
  planKey: string;
  planStatus: string;
  paddleCustomerId?: string;
  subscriptionId?: string;
  isActive: boolean;
  startedAt: Date;
  endedAt?: Date;
}

const UserPlanSchema = new Schema<IUserPlan>({
  user: { type: String, required: true },
  planName: { type: String, required: true },
  planKey: { type: String, required: true },
  planStatus: { type: String, required: true },
  priceId: { type: String, required: true },
  paddleCustomerId: { type: String },
  subscriptionId: { type: String },
  isActive: { type: Boolean, default: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
});

export default model<IUserPlan>("UserPlan", UserPlanSchema);
