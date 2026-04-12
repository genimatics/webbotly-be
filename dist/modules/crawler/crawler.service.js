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
exports.crawlWebsite = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const CONCURRENCY = 10;
const IGNORE_EXT = /\.(jpg|jpeg|png|gif|webp|svg|css|js|pdf|zip|mp4)$/i;
function normalizeUrl(url) {
    const u = new URL(url);
    u.hash = "";
    u.search = "";
    return u.href.replace(/\/$/, "");
}
const crawlWebsite = async (startUrl, onBatch) => {
    const visited = new Set();
    const queued = new Set();
    const queue = [normalizeUrl(startUrl)];
    const baseDomain = new URL(startUrl).hostname;
    const BATCH_SIZE = 5;
    let buffer = [];
    async function worker() {
        while (queue.length > 0) {
            const currentUrl = queue.shift();
            if (!currentUrl)
                return;
            if (visited.has(currentUrl))
                continue;
            visited.add(currentUrl);
            // add to buffer
            buffer.push(currentUrl);
            if (buffer.length >= BATCH_SIZE) {
                onBatch([...buffer]);
                buffer = [];
            }
            try {
                const { data } = await axios_1.default.get(currentUrl, {
                    timeout: 5000,
                    maxRedirects: 2
                });
                const $ = cheerio.load(data);
                $("a[href]").each((_, el) => {
                    let href = $(el).attr("href");
                    if (!href)
                        return;
                    if (IGNORE_EXT.test(href) ||
                        href.startsWith("#") ||
                        href.startsWith("javascript:") ||
                        href.startsWith("mailto:") ||
                        href.startsWith("tel:"))
                        return;
                    try {
                        const absolute = new URL(href, currentUrl).href;
                        const parsed = new URL(absolute);
                        if (parsed.hostname !== baseDomain)
                            return;
                        const normalized = normalizeUrl(parsed.href);
                        if (!visited.has(normalized) && !queued.has(normalized)) {
                            queued.add(normalized);
                            queue.push(normalized);
                        }
                    }
                    catch { }
                });
            }
            catch {
                console.log("Failed:", currentUrl);
            }
        }
    }
    const workers = [];
    for (let i = 0; i < CONCURRENCY; i++) {
        workers.push(worker());
    }
    await Promise.all(workers);
    // flush remaining URLs
    if (buffer.length > 0) {
        onBatch(buffer);
    }
};
exports.crawlWebsite = crawlWebsite;
//# sourceMappingURL=crawler.service.js.map