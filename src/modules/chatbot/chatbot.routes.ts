import express from "express";
import { authenticate } from "../../middleware"
import * as chatbotController from "./chatbot.controller"

const router = express.Router();

// @ts-ignore
router.post("/create", authenticate, chatbotController.createChatbot);

// @ts-ignore
router.put("/edit/:chatbotId", authenticate, chatbotController.editChatbot);

// @ts-ignore
router.get("/all", authenticate, chatbotController.getAllChatbots);

// @ts-ignore
router.get("/:chatbotId", chatbotController.getChatbotById);

export default router;
