"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatbotById = exports.getAllChatbots = exports.editChatbot = exports.createChatbot = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userPlan_model_1 = __importStar(require("../userPlan/userPlan.model"));
const user_model_1 = __importDefault(require("../user/user.model"));
const chatbot_model_1 = __importDefault(require("./chatbot.model"));
const ChatbotService = __importStar(require("./chatbot.service"));
const chatbotPersonality_model_1 = __importDefault(require("../chatbotPersonality/chatbotPersonality.model"));
const constants_1 = require("../../constants");
const ingest_queues_1 = require("../../queues/ingest.queues");
// POST: Create a chatbot
const createChatbot = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Authentication required" });
        const { name = "chatbot", personalityId, content, initialMessage, } = req.body;
        const chatbot = await ChatbotService.CreateChatbot(new mongoose_1.default.Types.ObjectId(req.user.id), req.body);
        if (!name || !personalityId || !content || !initialMessage) {
            return res.status(400).json({
                error: "Name, content, initialMessage and personalityId, are required",
            });
        }
        await ingest_queues_1.ingestQueue.add("ingest-job", {
            chatbotId: chatbot._id
        });
        res
            .status(201)
            .json({ message: "Chatbot created successfully", chatbot });
    }
    catch (error) {
        console.error("Error creating chatbot:", error);
        res
            .status(500)
            .json({ error: "An error occurred while creating the chatbot" });
    }
};
exports.createChatbot = createChatbot;
// // PUT: Edit chatbot
const editChatbot = async (req, res) => {
    try {
        const { chatbotId } = req.params;
        const updates = req.body;
        if (!chatbotId) {
            return res.status(404).json({ error: "Chatbot Id is required" });
        }
        const chatbot = await chatbot_model_1.default.findOneAndUpdate({ _id: chatbotId, isDeleted: false, active: true }, updates, { new: true });
        if (!chatbot) {
            return res.status(404).json({ error: "Chatbot not found or inactive" });
        }
        res.json({ message: "Chatbot updated successfully", chatbot });
    }
    catch (error) {
        console.error("Error updating chatbot:", error);
        res
            .status(500)
            .json({ error: "An error occurred while updating the chatbot" });
    }
};
exports.editChatbot = editChatbot;
// // GET: All chatbots by user_id
const getAllChatbots = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: "Authentication required" });
        const chatbots = await chatbot_model_1.default.find({
            userId: req.user.id,
            isDeleted: { $ne: true },
            active: { $ne: false },
        });
        res.json({ chatbots });
    }
    catch (error) {
        console.error("Error fetching chatbots:", error);
        res
            .status(500)
            .json({ error: "An error occurred while fetching chatbots" });
    }
};
exports.getAllChatbots = getAllChatbots;
// // GET: Single chatbot by chatbotId
const getChatbotById = async (req, res) => {
    try {
        const { chatbotId } = req.params;
        if (!chatbotId) {
            return res.status(404).json({ error: "Chatbot Id is required" });
        }
        const chatbot = await chatbot_model_1.default.findOne({
            _id: chatbotId,
            isDeleted: false,
            active: true,
        });
        if (!chatbot) {
            return res.status(404).json({ error: "Chatbot not found or inactive" });
        }
        let personality = null;
        if (chatbot.personalityId) {
            personality = await chatbotPersonality_model_1.default.findOne({
                _id: chatbot.personalityId,
            });
        }
        const userId = chatbot.userId;
        const payment = await userPlan_model_1.default.findOne({ userId });
        const user = await user_model_1.default.findOne({ _id: userId });
        if (!user)
            return;
        const isTrialExpired = (0, constants_1.is30DaysOld)((user.createdAt).toString());
        const isFreePlan = !payment || payment?.planName === userPlan_model_1.PlanName.FREE;
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
    }
    catch (error) {
        console.error("Error fetching chatbot:", error);
        res
            .status(500)
            .json({ error: "An error occurred while fetching the chatbot" });
    }
};
exports.getChatbotById = getChatbotById;
//# sourceMappingURL=chatbot.controller.js.map