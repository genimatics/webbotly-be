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
exports.scrapePageContent = scrapePageContent;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bullmq_1 = require("bullmq");
const db_1 = require("../config/db");
const chatbot_model_1 = __importDefault(require("../modules/chatbot/chatbot.model"));
const content_model_1 = __importDefault(require("../modules/chatbot/content.model"));
const openai_1 = __importDefault(require("openai"));
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const prompt_1 = require("../constants/prompt");
const constants_1 = require("../constants");
function getPageFromUrl(fullUrl) {
    try {
        const url = new URL(fullUrl);
        return url.pathname.replace("/", "") + url.search + url.hash;
    }
    catch (err) {
        console.error("Invalid URL:", fullUrl);
        return '';
    }
}
async function scrapePageContent(pageUrl) {
    try {
        const { data } = await axios_1.default.get(pageUrl, {
            timeout: 10000,
            maxRedirects: 0, // ❌ prevent redirect crawling
        });
        const $ = cheerio.load(data);
        // Remove unwanted elements
        $("script, style, nav, footer, header, noscript").remove();
        // Extract structured content
        const title = $("title").text().trim();
        const headings = [];
        $("h1, h2, h3, h4, h5, h6").each((_, el) => {
            const text = $(el).text().trim();
            if (text)
                headings.push(text);
        });
        const paragraphs = [];
        $("p").each((_, el) => {
            const text = $(el).text().trim();
            if (text)
                paragraphs.push(text);
        });
        const links = [];
        $("a[href]").each((_, el) => {
            const href = $(el).attr("href");
            if (href)
                links.push(href);
        });
        // Clean full text
        const fullText = $("body")
            .text()
            .replace(/\s+/g, " ")
            .trim();
        return {
            url: pageUrl,
            title,
            headings,
            paragraphs,
            links,
            fullText,
        };
    }
    catch (error) {
        console.error("Scrape failed:", error.message);
        return {
            url: pageUrl,
            error: true,
            message: error.message,
        };
    }
}
const worker = new bullmq_1.Worker("ingest-queue", async (job) => {
    const client = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
    try {
        await (0, db_1.connectDB)();
        const { chatbotId } = job.data;
        const chatbot = await chatbot_model_1.default.findById(chatbotId);
        if (!chatbot || !chatbot?.content)
            return;
        const selectedPageUrls = chatbot?.content.selectedPageUrls;
        const results = {};
        for (const url of selectedPageUrls) {
            const data = await scrapePageContent(url);
            const response = await client.chat.completions.create({
                response_format: { type: "json_object" },
                messages: [
                    { role: "assistant", content: prompt_1.CLEANSE_PROMPT },
                    { role: "user", content: JSON.stringify(data) },
                ],
                model: constants_1.DEFAULT_MODEL,
            });
            const key = getPageFromUrl(url).toString() || "home_page";
            const parsed = JSON.parse(response.choices[0]?.message.content || "{}");
            results[key] = parsed; // ✅ correct syntax
        }
        const response = await content_model_1.default.create({
            chatbotId,
            userId: chatbot.userId,
            content: results
        });
    }
    catch (err) {
        console.log({ err });
    }
}, {
    connection: {
        host: "127.0.0.1",
        port: 6379,
    },
});
//# sourceMappingURL=ingest.workers.js.map