import { PlanName } from "../modules/userPlan/userPlan.model";

export const LIMITS = {
  founding_member: {
    chats: 1500,
    leads: 300,
    meetings: 100,
  },
  free: {
    chats: 100,
    leads: 10,
    meetings: 5,
  },
  starter: {
    leads: 100,
    chats: 500,
    meetings: 10,
  },
  growth: {
    chats: 1500,
    leads: 300,
    meetings: 50,
  },
  scale: {
    chats: 5000,
    leads: 1000,
    meetings: 200,
  },
};


export function addDays(dateStr: string, days: number) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0]; // returns in YYYY-MM-DD format
}

export function is30DaysOld(createdAt: string) {
  const createdDate = new Date(createdAt);
  const now = new Date();

  const diffInMs = now.getTime() - createdDate.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24); // convert ms to days

  return diffInDays >= 30;
}

export const returnPlanSubscriptionKey = (priceId: string) => {
  switch (priceId) {
    case PLANS.STARTER_MONTHLY_PRICE_ID:
      return PlanName.STARTER_MONTHLY;
    case PLANS.STARTER_YEARLY_PRICE_ID:
      return PlanName.STARTER_YEARLY;
    case PLANS.GROWTH_MONTHLY_PRICE_ID:
      return PlanName.GROWTH_MONTHLY;
    case PLANS.GROWTH_YEARLY_PRICE_ID:
      return PlanName.GROWTH_YEARLY;
    case PLANS.SCALE_MONTHLY_PRICE_ID:
      return PlanName.SCALE_MONTHLY;
    case PLANS.SCALE_YEARLY_PRICE_ID:
      return PlanName.SCALE_YEARLY;
    default:
      return PlanName.FREE;
  }
};

export const returnPlanTrialKey = (priceId: string) => {
  switch (priceId) {
    case PLANS.STARTER_MONTHLY_PRICE_ID:
      return PlanName.STARTER_TRIAL;
    case PLANS.STARTER_YEARLY_PRICE_ID:
      return PlanName.STARTER_TRIAL;
    case PLANS.GROWTH_MONTHLY_PRICE_ID:
      return PlanName.GROWTH_TRIAL;
    case PLANS.GROWTH_YEARLY_PRICE_ID:
      return PlanName.GROWTH_TRIAL;
    case PLANS.SCALE_MONTHLY_PRICE_ID:
      return PlanName.SCALE_TRIAL;
    case PLANS.SCALE_YEARLY_PRICE_ID:
      return PlanName.SCALE_TRIAL;
    default:
      return PlanName.FREE;
  }
};

export const PLANS = {
  STARTER_MONTHLY_PRICE_ID: process.env.STARTER_MONTHLY_PRICE_ID,
  STARTER_YEARLY_PRICE_ID: process.env.STARTER_YEARLY_PRICE_ID,
  GROWTH_MONTHLY_PRICE_ID: process.env.GROWTH_MONTHLY_PRICE_ID,
  GROWTH_YEARLY_PRICE_ID: process.env.GROWTH_YEARLY_PRICE_ID,
  SCALE_MONTHLY_PRICE_ID: process.env.SCALE_MONTHLY_PRICE_ID,
  SCALE_YEARLY_PRICE_ID: process.env.SCALE_YEARLY_PRICE_ID,
};

export enum EVENT_TYPE {
  // Occurs because the transaction status changes to completed.
  TRANSACTION_COMPLETED = "transaction.completed",

  // The transaction status changes to paid now that the customer has paid successfully. The transaction is updated with information about the successful payment.
  TRANSACTION_UPDATED = "transaction.updated",

  // Occurs when a payment method is saved. for future payments
  PAYMENT_METHOD_SAVED = "payment_method.saved",

  // Occurs when a subscription enters trial period.
  SUBSCRIPTION_TRIALING = "subscription.trialing",

  // Occurs when a subscription is cancelled.
  SUBSCRIPTION_CANCELLED = "subscription.cancelled",
}