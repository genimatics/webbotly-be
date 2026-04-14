"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../middleware");
const chatMessage_model_1 = __importDefault(require("./chatMessage.model"));
const chatMessage_controller_1 = require("./chatMessage.controller");
const router = (0, express_1.Router)();
router.post("/", chatMessage_controller_1.handleChat);
router.get("/history", middleware_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id; // safest if user is not typed
        if (!userId)
            res.status(401).json({ error: "Unauthorized" });
        const sessionsWithCounts = await (0, chatMessage_controller_1.fetchChats)(userId);
        res.status(200).json(sessionsWithCounts);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/history", async (req, res) => {
    const { sessionId } = req.body || {};
    console.log({ sessionId, });
    const messages = await chatMessage_model_1.default.find({ chatSessionId: sessionId });
    res.status(200).json(messages);
});
exports.default = router;
//# sourceMappingURL=chatMessage.routes.js.map