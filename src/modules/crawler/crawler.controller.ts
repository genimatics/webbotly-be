import { Request, Response } from "express";
import * as crawlerService from "./crawler.service";

export const crawlWebsite = async (req: Request, res: Response) => {
    try {
        const url = req.query.url as string;

        if (!url) {
            return res.status(400).json({ message: "URL is required" });
        }

        // SSE headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        await crawlerService.crawlWebsite(url, (page) => {
            res.write(`data: ${JSON.stringify({ url: page })}\n\n`);
        });

        res.write(`event: done\ndata: finished\n\n`);
        res.end();

    } catch (error: any) {
        res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
        res.end();
    }
};