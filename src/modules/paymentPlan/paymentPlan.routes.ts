import express, { Response, Request } from "express";
// import CheckoutCustomer from "../../models/checkoutCustomer";
import CheckoutCustomer from "../checkoutCustomer/checkoutCustomer.model";
import User from "../user/user.model";
import UserPlan, { PlanName } from "../userPlan/userPlan.model";
import { authenticate } from '../../middleware'

const router = express.Router();

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

const returnPlanSubscriptionKey = (priceId: string) => {
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

const returnPlanTrialKey = (priceId: string) => {
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

const PLANS = {
    STARTER_MONTHLY_PRICE_ID: process.env.STARTER_MONTHLY_PRICE_ID,
    STARTER_YEARLY_PRICE_ID: process.env.STARTER_YEARLY_PRICE_ID,
    GROWTH_MONTHLY_PRICE_ID: process.env.GROWTH_MONTHLY_PRICE_ID,
    GROWTH_YEARLY_PRICE_ID: process.env.GROWTH_YEARLY_PRICE_ID,
    SCALE_MONTHLY_PRICE_ID: process.env.SCALE_MONTHLY_PRICE_ID,
    SCALE_YEARLY_PRICE_ID: process.env.SCALE_YEARLY_PRICE_ID,
};

enum EVENT_TYPE {
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

router.post("/webhook", async (req, res) => {
    try {
        const event = req.body;
        const priceId = event?.data?.items?.[0]?.price?.id;

        const customerId = event?.data?.customer_id;
        let email = "";

        if (customerId) {
            const customer = await fetch(
                `${process.env.PADDLE_API_URL}/customers/${customerId}`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.PADDLE_CLIENT_SECRET}`,
                        "Content-Type": "application/json",
                    },
                }
            ).then((res) => res.json());
            email = customer?.data?.email;
        }

        let planKey = "";
        let status = "";

        switch (event.event_type) {
            case EVENT_TYPE.TRANSACTION_COMPLETED:
                planKey = returnPlanSubscriptionKey(priceId);
                status = "subscribed";
                break;
            case EVENT_TYPE.TRANSACTION_UPDATED:
                planKey = returnPlanSubscriptionKey(priceId);
                status = "subscribed";
                break;
            case EVENT_TYPE.PAYMENT_METHOD_SAVED:
                console.log("Payment method saved");
                break;
            case EVENT_TYPE.SUBSCRIPTION_TRIALING:
                planKey = returnPlanTrialKey(priceId);
                status = "trialing";
                break;

            case EVENT_TYPE.SUBSCRIPTION_CANCELLED:
                planKey = returnPlanTrialKey(priceId);
                status = "cancelled";
                break;
            default:
                break;
        }

        const checkoutCustomer = await CheckoutCustomer.create({
            email,
            checkoutId: event.data?.invoice_id,
            subscriptionId: event.data?.subscription_id,
            paddleCustomerId: customerId,
            event,
            priceId,
        });

        await UserPlan.findOneAndUpdate(
            { user: checkoutCustomer.email }, // Match by user
            {
                user: checkoutCustomer.email,
                planKey,
                planStatus: status,
                subscriptionId: event.data?.subscription_id,
                priceId,
                paddleCustomerId: customerId,
                isActive: true,
                startedAt: new Date(),
                endedAt: undefined,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).send({
            message: "Webhook received",
            email,
            planKey,
            status,
            event,
            priceId,
        });
    } catch (error) {
        console.error("Paddle token error:", error);
        res.status(500).json({ error: "Failed to generate Paddle token" });
    }
});

router.get("/", authenticate, async (request: Request, response: Response) => {
    try {
        // @ts-ignore
        const user = await User.findOne({ _id: request.user?.id });
        if (!user || !user?.email) return response.status(400).json({ error: "User doesnt exists" });

        const userPlan = await UserPlan.findOne({ user: user.email! });

        const isTrialExpired = is30DaysOld((user.createdAt).toString());

        const trialEndDate = addDays((user.createdAt).toString(), 30);
        if (!userPlan) {
            response.status(200).json({
                plan: {
                    planKey: PlanName.FREE,
                    planStatus: isTrialExpired ? "expired" : "active",
                    trialEndDate,
                },
            });
            return;
        }

        response.json({ plan: userPlan });
    } catch (error) {
        console.error("Error cancelling subscription:", error);
        response.status(500).json({ error: "Failed to cancel subscription" });
    }
});

export default router;
