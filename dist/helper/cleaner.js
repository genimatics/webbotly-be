"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanseContent = cleanseContent;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
const prompt_1 = require("../constants/prompt");
const constants_1 = require("../constants");
dotenv_1.default.config();
const client = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
async function cleanseContent(content) {
    if (!content) {
        throw new Error("Content is required");
    }
    try {
        const response = await client.chat.completions.create({
            response_format: { type: "json_object" },
            messages: [
                { role: "assistant", content: prompt_1.CLEANSE_PROMPT },
                { role: "user", content },
            ],
            model: constants_1.DEFAULT_MODEL,
        });
        const completion_tokens = response?.usage?.completion_tokens || 0;
        const prompt_tokens = response?.usage?.prompt_tokens || 0;
        const cleansedContent = response.choices?.[0]?.message?.content;
        if (!cleansedContent) {
            throw new Error("Failed to generate cleansed content");
        }
        return { cleansedContent: JSON.parse(cleansedContent), completion_tokens, prompt_tokens };
    }
    catch (error) {
        console.error("Error calling OpenAI API:", error);
        throw new Error("An error occurred while processing your request");
    }
}
//# sourceMappingURL=cleaner.js.map