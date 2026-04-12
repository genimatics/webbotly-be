"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const express_1 = require("express");
const html_to_text_1 = require("html-to-text");
const webContent_model_1 = __importDefault(require("./webContent.model"));
const middleware_1 = require("../../middleware");
const cleaner_1 = require("../../helper/cleaner");
const router = (0, express_1.Router)();
const PHP_FILE_REGEX = /\b[^\s]*\.php\b/g;
const LINE_BREAK = "\n";
// New route to extract content from a website
router.post("/", middleware_1.authenticate, async (req, res) => {
    const { url } = req.body;
    // @ts-ignore
    if (!req?.user)
        res.status(401).json({ error: "Authentication required" });
    if (!url) {
        res.status(400).json({ error: "URL is required" });
        return;
    }
    try {
        // Step 1: Scrape the content from the provided URL
        const response = await axios_1.default.get(url);
        const html = response.data;
        if (!html) {
            res.status(500).json({ error: "Failed to retrieve valid HTML content" });
            return;
        }
        const text = (0, html_to_text_1.convert)(html, { wordwrap: 150 })
            .replace(PHP_FILE_REGEX, "")
            .split(LINE_BREAK)
            .filter((line) => line.trim() !== "")
            .join(LINE_BREAK);
        // Step 2: Use the scraped content to call the /ai route
        const { cleansedContent } = await (0, cleaner_1.cleanseContent)(text);
        if (!cleansedContent) {
            res.status(500).json({ error: "Failed to process content with AI" });
            return;
        }
        const content = new webContent_model_1.default({
            // @ts-ignore
            user_id: req?.user?.id,
            content: JSON.parse(cleansedContent),
            isActive: true,
            isDeleted: false,
        });
        await content.save();
        res.status(200).json({ content: JSON.parse(cleansedContent) });
    }
    catch (error) {
        console.error("Error processing request:", error);
        res
            .status(500)
            .json({ error: "An error occurred while processing your request" });
    }
});
router.get("/", middleware_1.authenticate, async (req, res) => {
    // @ts-ignore
    if (!req?.user)
        res.status(401).json({ error: "Authentication required" });
    // @ts-ignore
    const content = await webContent_model_1.default.findOne({ user_id: req?.user?.id });
    res.status(200).json({ content: content?.content });
    return;
});
exports.default = router;
//# sourceMappingURL=webContent.routes.js.map