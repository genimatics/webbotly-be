"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateChatbot = void 0;
const chatbot_model_1 = __importDefault(require("./chatbot.model"));
const CreateChatbot = async (userId, data) => {
    const { name = "chatbot", personalityId, theme, content, initialMessage, } = data;
    const newChatbot = new chatbot_model_1.default({
        name,
        userId,
        personalityId,
        theme,
        initialMessage,
        content,
    });
    return await newChatbot.save();
};
exports.CreateChatbot = CreateChatbot;
//# sourceMappingURL=chatbot.service.js.map