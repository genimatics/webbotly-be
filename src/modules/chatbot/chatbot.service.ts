import mongoose, { Types } from 'mongoose';
import Chatbot from './chatbot.model'


interface iCreateChatbotPayload {
    name: string
    personalityId: string
    theme: string
    content: string
    initialMessage: string
}

export const CreateChatbot = async (userId: string, data: iCreateChatbotPayload) => {
    const {
        name = "chatbot",
        personalityId,
        theme,
        content,
        initialMessage,
    } = data;


    const newChatbot = new Chatbot({
        name,
        userId,
        personalityId,
        theme,
        initialMessage,
        content,
    });

    return await newChatbot.save();
}