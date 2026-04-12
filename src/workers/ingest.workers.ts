import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import { connectDB } from "../config/db";
import ChatbotModel from "../modules/chatbot/chatbot.model";
import ChatbotContentModel from "../modules/chatbot/content.model";
import OpenAI from "openai";


import axios from "axios";
import * as cheerio from "cheerio";
import { CLEANSE_PROMPT } from "../constants/prompt";
import { DEFAULT_MODEL } from "../constants";
import { uuid } from "zod";


function getPageFromUrl(fullUrl: string) {
    try {
        const url = new URL(fullUrl);
        return url.pathname.replace("/", "") + url.search + url.hash;
    } catch (err) {
        console.error("Invalid URL:", fullUrl);
        return '';
    }
}

export async function scrapePageContent(pageUrl: string) {
    try {
        const { data } = await axios.get(pageUrl, {
            timeout: 10000,
            maxRedirects: 0, // ❌ prevent redirect crawling
        });

        const $ = cheerio.load(data);

        // Remove unwanted elements
        $("script, style, nav, footer, header, noscript").remove();

        // Extract structured content
        const title = $("title").text().trim();

        const headings: string[] = [];
        $("h1, h2, h3, h4, h5, h6").each((_, el) => {
            const text = $(el).text().trim();
            if (text) headings.push(text);
        });

        const paragraphs: string[] = [];
        $("p").each((_, el) => {
            const text = $(el).text().trim();
            if (text) paragraphs.push(text);
        });

        const links: string[] = [];
        $("a[href]").each((_, el) => {
            const href = $(el).attr("href");
            if (href) links.push(href);
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
    } catch (error: any) {
        console.error("Scrape failed:", error.message);

        return {
            url: pageUrl,
            error: true,
            message: error.message,
        };
    }
}


const worker = new Worker(
    "ingest-queue",
    async (job) => {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        try {
            await connectDB();

            const { chatbotId } = job.data;
            const chatbot = await ChatbotModel.findById(chatbotId)

            if (!chatbot || !chatbot?.content) return;


            const selectedPageUrls = chatbot?.content.selectedPageUrls;

            const results: Record<string, any> = {};
            for (const url of selectedPageUrls) {
                const data = await scrapePageContent(url);
                const response = await client.chat.completions.create({
                    response_format: { type: "json_object" },
                    messages: [
                        { role: "assistant", content: CLEANSE_PROMPT },
                        { role: "user", content: JSON.stringify(data) },
                    ],
                    model: DEFAULT_MODEL,
                });


                const key = getPageFromUrl(url).toString() || "home_page";


                const parsed = JSON.parse(response.choices[0]?.message.content || "{}");

                results[key] = parsed; // ✅ correct syntax
            }

            const response = await ChatbotContentModel.create({
                chatbotId,
                userId: chatbot.userId,
                content: results
            })
        }
        catch (err) {
            console.log({ err });

        }

    },
    {
        connection: {
            host: "127.0.0.1",
            port: 6379,
        },
    }
);