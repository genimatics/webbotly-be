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
exports.getCrawledWebsitePages = exports.crawlWebsite = void 0;
const crawler_model_1 = __importDefault(require("./crawler.model"));
const crawlerService = __importStar(require("./crawler.service"));
const crawlWebsite = async (req, res) => {
    try {
        const url = req.query.url;
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
        const allPages = new Set(); // ✅ dedupe automatically
        await crawlerService.crawlWebsite(url, (batch) => {
            try {
                const normalizedBatch = batch.map((p) => {
                    try {
                        return new URL(p).toString();
                    }
                    catch {
                        return null;
                    }
                }).filter(Boolean);
                // ✅ accumulate
                normalizedBatch.forEach((p) => allPages.add(p));
                // ✅ stream batch to client
                res.write(`data: ${JSON.stringify({ urls: normalizedBatch })}\n\n`);
            }
            catch (err) {
                console.error("Batch error:", err);
            }
        });
        // ✅ AFTER crawl → store everything once
        const pagesArray = Array.from(allPages);
        await crawler_model_1.default.updateOne({ userId }, {
            $set: {
                lastUpdated: new Date(),
                pages: pagesArray.map(page => ({ url: page, isActive: true }))
            },
        }, { upsert: true });
        res.write(`event: done\ndata: finished\n\n`);
        res.end();
    }
    catch (error) {
        res.write(`event: error\ndata: ${JSON.stringify({
            message: error.message,
        })}\n\n`);
        res.end();
    }
};
exports.crawlWebsite = crawlWebsite;
const getCrawledWebsitePages = async (req, res) => {
    const userId = req?.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const crawledWebsitePages = await crawler_model_1.default.findOne({ userId: userId });
    if (!crawledWebsitePages) {
        return res.status(401).json({ message: "Not found!" });
    }
    return res.status(200).json({ pages: crawledWebsitePages.pages, data: crawledWebsitePages });
};
exports.getCrawledWebsitePages = getCrawledWebsitePages;
//# sourceMappingURL=crawler.controller.js.map