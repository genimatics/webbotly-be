import { Response } from "express";
import Crawler from "./crawler.model";
import { AuthRequest } from "../../middleware";
import * as crawlerService from "./crawler.service"

export const crawlWebsite = async (req: AuthRequest, res: Response) => {
    try {
        const url = req.query.url as string;

        const userId = req?.user?.id;

        if (!url) {
            return res.status(400).json({ message: "URL is required" });
        }

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // SSE headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const allPages = new Set<string>(); // ✅ dedupe automatically

        await crawlerService.crawlWebsite(url, (batch) => {
            try {
                const normalizedBatch = batch.map((p) => {
                    try {
                        return new URL(p).toString();
                    } catch {
                        return null;
                    }
                }).filter(Boolean) as string[];

                // ✅ accumulate
                normalizedBatch.forEach((p) => allPages.add(p));

                // ✅ stream batch to client
                res.write(
                    `data: ${JSON.stringify({ urls: normalizedBatch })}\n\n`
                );

            } catch (err) {
                console.error("Batch error:", err);
            }
        });

        // ✅ AFTER crawl → store everything once
        const pagesArray = Array.from(allPages);

        await Crawler.updateOne(
            { userId },
            {

                $set: {
                    lastUpdated: new Date(),
                    pages: pagesArray.map(page => ({ url: page, isActive: true }))
                },
            },
            { upsert: true }
        );

        res.write(`event: done\ndata: finished\n\n`);
        res.end();

    } catch (error: any) {
        res.write(
            `event: error\ndata: ${JSON.stringify({
                message: error.message,
            })}\n\n`
        );
        res.end();
    }
};
export const getCrawledWebsitePages = async (req: AuthRequest, res: Response) => {
    const userId = req?.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const crawledWebsitePages = await Crawler.findOne({ userId: userId });
    if (!crawledWebsitePages) {
        return res.status(401).json({ message: "Not found!" });
    }
    return res.status(200).json({ pages: crawledWebsitePages.pages, data: crawledWebsitePages })

}