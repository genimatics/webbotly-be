import express from "express";
const auth = require("../middleware/auth");
import * as chatbotController from "./chatbot.controller"

const router = express.Router();

// @ts-ignore
router.post("/create", auth, chatbotController.createChatbot);

// @ts-ignore
router.put("/edit/:chatbotId", auth, chatbotController.editChatbot);

// @ts-ignore
router.get("/all", auth, chatbotController.getAllChatbots);

// @ts-ignore
router.get("/:chatbotId", chatbotController.getChatbotById);

export default router;
