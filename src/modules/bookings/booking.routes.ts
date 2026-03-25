import { Request, Response, Router } from "express";
import MeetCredentials from "../meetCredentials/meetCredentials.model"
import { google } from 'googleapis'
import Booking from "./bookings.model"

import { authenticate } from "../../middleware"
const router = Router();

export const fetchBookings = async (userId: string, noDev?: boolean) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // e.g., June 1, 2025
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1); // e.g., July 1, 2025

    const querySearch = noDev ? { dev: { $ne: true } } : {};

    const bookings = await Booking.find({
        userId,
        createdAt: { $gte: startOfMonth, $lt: endOfMonth },
        ...querySearch,
    });
    return bookings;
};

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

router.get("/google", (req: Request, res: Response) => {
    const { userId } = req.query;
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/userinfo.email",
        ],
        state: JSON.stringify({ userId }), // serialize the state
    });

    res.redirect(url);
});
router.get("/google-creds", authenticate, async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id;

    const hasCreds = await MeetCredentials.findOne({ userId });

    res.send({ hasCreds: !!hasCreds, details: hasCreds?.googleEmail });
});

router.get("/google/callback", async (req: Request, res: Response) => {
    try {
        const { code, state } = req.query;
        const { userId } = JSON.parse(state as string);

        const { tokens } = await oauth2Client.getToken(code as string);

        if (!tokens.access_token) {
            res.json({ error: "No access token received from Google." });
            return;
        }
        oauth2Client.setCredentials({
            access_token: tokens.access_token as string,
            refresh_token: tokens.refresh_token as string,
        });

        // Optional: Fetch user's Google profile (get email, etc.)
        const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
        const profile = await oauth2.userinfo.get();
        const googleEmail = profile.data.email;

        // Upsert credentials in DB (update if exists)
        await MeetCredentials.findOneAndUpdate(
            { userId },
            {
                $set: {
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    scope: tokens.scope,
                    token_type: tokens.token_type,
                    expiry_date: tokens.expiry_date,
                    googleEmail,
                },
            },
            { upsert: true, new: true }
        );

        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    } catch (err) {
        console.error("Error during OAuth callback:", err);
        res.status(500).send("Failed to exchange authorization code.");
    }
});
router.delete("/google-creds", authenticate, async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id;

    const creds = await MeetCredentials.findOneAndDelete({ userId });

    res.send({ deleted: !!creds });
});

router.get("/meetings", authenticate, async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id;
    const bookings = await fetchBookings(userId);
    res.send({ bookings });
});

export default router;
