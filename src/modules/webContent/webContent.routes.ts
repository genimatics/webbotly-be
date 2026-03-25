import axios from "axios";
import { Router, Request, Response } from "express";
import { convert } from "html-to-text";
import Content from "./webContent.model"
import { authenticate } from "../../middleware"
import { cleanseContent } from "../../helper/cleaner";

type AIResponse = {
    content: string;
};

const router = Router();
const PHP_FILE_REGEX = /\b[^\s]*\.php\b/g;
const LINE_BREAK = "\n";

// New route to extract content from a website
router.post("/", authenticate, async (req: Request, res: Response): Promise<void> => {
    const { url } = req.body;

    // @ts-ignore
    if (!req?.user) res.status(401).json({ error: "Authentication required" });

    if (!url) {
        res.status(400).json({ error: "URL is required" });
        return;
    }

    try {
        // Step 1: Scrape the content from the provided URL
        const response = await axios.get(url);
        const html = response.data;

        if (!html) {
            res.status(500).json({ error: "Failed to retrieve valid HTML content" });
            return;
        }

        const text = convert(html, { wordwrap: 150 })
            .replace(PHP_FILE_REGEX, "")
            .split(LINE_BREAK)
            .filter((line: string) => line.trim() !== "")
            .join(LINE_BREAK);

        // Step 2: Use the scraped content to call the /ai route
        const { cleansedContent } = await cleanseContent(text);

        if (!cleansedContent) {
            res.status(500).json({ error: "Failed to process content with AI" });
            return;
        }

        const content = new Content({
            // @ts-ignore
            user_id: req?.user?.id,
            content: JSON.parse(cleansedContent),
            isActive: true,
            isDeleted: false,
        });
        await content.save();

        res.status(200).json({ content: JSON.parse(cleansedContent) });
    } catch (error) {
        console.error("Error processing request:", error);
        res
            .status(500)
            .json({ error: "An error occurred while processing your request" });
    }
});

router.get("/", authenticate, async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    if (!req?.user) res.status(401).json({ error: "Authentication required" });

    // @ts-ignore
    const content = await Content.findOne({ user_id: req?.user?.id });

    res.status(200).json({ content: content?.content });
    return;
});

export default router;
