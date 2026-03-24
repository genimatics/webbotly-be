import { Request, Response } from "express";
import mongoose from "mongoose";
import UserPlan, { PlanName } from "../userPlan/userPlan.model";
import User from '../user/user.model'
import Chatbot from './chatbot.model'
import * as ChatbotService from './chatbot.service'
import ChatbotPersonality from '../chatbotPersonality/chatbotPersonality.model'
import { is30DaysOld, LIMITS } from "../../constants";


// Define a custom Request type to include user
interface RequestWithUser extends Request {
    user?: { id: string };
}

// POST: Create a chatbot
export const createChatbot = async (req: RequestWithUser, res: Response) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Authentication required" });

        const {
            name = "chatbot",
            personalityId,
            theme,
            content,
            initialMessage,
        } = req.body;

        const chatbot = await ChatbotService.CreateChatbot(new mongoose.Types.ObjectId(req.user.id), req.body)

        if (!name || !personalityId || !content || !initialMessage) {
            return res.status(400).json({
                error: "Name, content, initialMessage and personalityId, are required",
            });
        }

        res
            .status(201)
            .json({ message: "Chatbot created successfully", chatbot });
    } catch (error) {
        console.error("Error creating chatbot:", error);
        res
            .status(500)
            .json({ error: "An error occurred while creating the chatbot" });
    }
};

// // PUT: Edit chatbot
export const editChatbot = async (req: RequestWithUser, res: Response) => {
    try {
        const { chatbotId } = req.params;
        const updates = req.body;

        if (!chatbotId) {
            return res.status(404).json({ error: "Chatbot Id is required" });
        }

        const chatbot = await Chatbot.findOneAndUpdate(
            { _id: chatbotId, isDeleted: false, active: true },
            updates,
            { new: true }
        );

        if (!chatbot) {
            return res.status(404).json({ error: "Chatbot not found or inactive" });
        }

        res.json({ message: "Chatbot updated successfully", chatbot });
    } catch (error) {
        console.error("Error updating chatbot:", error);
        res
            .status(500)
            .json({ error: "An error occurred while updating the chatbot" });
    }
};

// // GET: All chatbots by user_id
export const getAllChatbots = async (req: RequestWithUser, res: Response) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Authentication required" });

        const chatbots = await Chatbot.find({
            userId: req.user.id,
            isDeleted: { $ne: true },
            active: { $ne: false },
        });

        res.json({ chatbots });
    } catch (error) {
        console.error("Error fetching chatbots:", error);
        res
            .status(500)
            .json({ error: "An error occurred while fetching chatbots" });
    }
};

// // GET: Single chatbot by chatbotId
export const getChatbotById = async (req: Request, res: Response) => {
    try {
        const { chatbotId } = req.params;

        if (!chatbotId) {
            return res.status(404).json({ error: "Chatbot Id is required" });
        }

        const chatbot = await Chatbot.findOne({
            _id: chatbotId,
            isDeleted: false,
            active: true,
        });

        if (!chatbot) {
            return res.status(404).json({ error: "Chatbot not found or inactive" });
        }
        let personality = null
        if (chatbot.personalityId) {
            personality = await ChatbotPersonality.findOne({
                _id: chatbot.personalityId,
            });
        }

        const userId = chatbot.userId;
        const payment = await UserPlan.findOne({ userId });
        const user = await User.findOne({ _id: userId })

        if (!user) return;
        const isTrialExpired = is30DaysOld((user.createdAt).toString());

        const isFreePlan = !payment || payment?.planName === PlanName.FREE;
        // const leads = await fetchLeads(userId, true);
        // const chats = await fetchChats(userId, true);
        // const bookings = await fetchBookings(userId, true);
        let hideChatbot = false;

        // if (isFreePlan) {
        //     if (
        //         leads.length >= LIMITS.free.leads ||
        //         chats.length >= LIMITS.free.chats ||
        //         bookings.length >= LIMITS.free.meetings
        //     ) {
        //         hideChatbot = true;
        //     }
        // }

        // if (payment?.planName === PlanName.FOUNDING_MEMBER) {
        //     if (
        //         leads.length >= LIMITS.founding_member.leads ||
        //         chats.length >= LIMITS.founding_member.chats ||
        //         bookings.length >= LIMITS.founding_member.meetings
        //     ) {
        //         hideChatbot = true;
        //     }
        // }

        // switch (payment?.planName) {
        //     case PlanName.FREE:
        //         if (
        //             isTrialExpired ||
        //             leads.length >= LIMITS.free.leads ||
        //             chats.length >= LIMITS.free.chats ||
        //             bookings.length >= LIMITS.free.meetings
        //         ) {
        //             hideChatbot = true;
        //         }
        //         break;
        //     case PlanName.STARTER_MONTHLY:
        //     case PlanName.STARTER_YEARLY:
        //         if (
        //             isTrialExpired ||
        //             leads.length >= LIMITS.starter.leads ||
        //             chats.length >= LIMITS.starter.chats ||
        //             bookings.length >= LIMITS.starter.meetings
        //         ) {
        //             hideChatbot = true;
        //         }
        //         break;
        //     case PlanName.GROWTH_MONTHLY:
        //     case PlanName.GROWTH_YEARLY:
        //         if (
        //             isTrialExpired ||
        //             leads.length >= LIMITS.growth.leads ||
        //             chats.length >= LIMITS.growth.chats ||
        //             bookings.length >= LIMITS.growth.meetings
        //         ) {
        //             hideChatbot = true;
        //         }
        //         break;
        //     case PlanName.SCALE_MONTHLY:
        //     case PlanName.SCALE_YEARLY:
        //         if (
        //             isTrialExpired ||
        //             leads.length >= LIMITS.scale.leads ||
        //             chats.length >= LIMITS.scale.chats ||
        //             bookings.length >= LIMITS.scale.meetings
        //         ) {
        //             hideChatbot = true;
        //         }
        //         break;
        // }

        res.json({ chatbot, personality: personality, hideChatbot });
    } catch (error) {
        console.error("Error fetching chatbot:", error);
        res
            .status(500)
            .json({ error: "An error occurred while fetching the chatbot" });
    }
};
