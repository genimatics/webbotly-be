"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ChatbotPersonalitySchema = new mongoose_1.Schema({
    personality: { type: String, required: true },
    avatar: { type: String, required: true },
    name: { type: String, required: true },
    is_premium: { type: Boolean, required: false },
    description: { type: String },
    prompt: { type: String, required: true },
    suitedFor: [
        {
            label: { type: String, required: true },
            isActive: { type: Boolean, default: false },
        },
    ],
    active: { type: Boolean, default: true },
}, { timestamps: true } // Automatically manages createdAt and updatedAt
);
exports.default = (0, mongoose_1.model)("ChatbotPersonality", ChatbotPersonalitySchema);
//# sourceMappingURL=chatbotPersonality.model.js.map