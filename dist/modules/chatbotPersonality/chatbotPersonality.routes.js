"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const chatbotPersonality_model_1 = __importDefault(require("../chatbotPersonality/chatbotPersonality.model")); // Import User model
const router = express.Router();
router.post("/", async (req, res) => {
    const { personality, avatar, name, description, prompt, suitedFor } = req.body;
    try {
        const newPersonality = new chatbotPersonality_model_1.default({
            personality,
            avatar,
            name,
            description,
            prompt,
            suitedFor,
        });
        await newPersonality.save();
        res
            .status(201)
            .json({ message: "New Chatbot Personality Created", newPersonality });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
// Update an existing chatbot personality
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const updatedPersonality = await chatbotPersonality_model_1.default.findByIdAndUpdate(id, { $set: data }, { new: true });
        if (!updatedPersonality) {
            return res.status(404).json({ message: "Chatbot Personality not found" });
        }
        res.json({ message: "Chatbot Personality Updated", updatedPersonality });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
router.get("/", async (req, res) => {
    try {
        // @ts-ignore
        const personalities = await chatbotPersonality_model_1.default.find({ active: true });
        res.json(personalities);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
router.post("/all", async (req, res) => {
    try {
        const { data } = req.body;
        if (!Array.isArray(data)) {
            return res.status(400).json({
                success: false,
                message: "Invalid input format, expected an array",
            });
        }
        const insertedPersonalities = [];
        for (const item of data) {
            const newPersonality = new chatbotPersonality_model_1.default(item);
            await newPersonality.save();
            insertedPersonalities.push(newPersonality);
        }
        res.status(201).json({ success: true, data: insertedPersonalities });
    }
    catch (error) {
        // @ts-ignore
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=chatbotPersonality.routes.js.map