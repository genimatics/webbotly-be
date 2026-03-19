import axios from "axios";
import * as cheerio from "cheerio";

const CONCURRENCY = 10;

const IGNORE_EXT = /\.(jpg|jpeg|png|gif|webp|svg|css|js|pdf|zip|mp4)$/i;

function normalizeUrl(url: string) {
    const u = new URL(url);
    u.hash = "";
    u.search = "";
    return u.href.replace(/\/$/, "");
}

export const crawlWebsite = async (
  startUrl: string,
  onBatch: (urls: string[]) => void
) => {

  const visited = new Set<string>();
  const queued = new Set<string>();

  const queue: string[] = [normalizeUrl(startUrl)];
  const baseDomain = new URL(startUrl).hostname;

  const BATCH_SIZE = 5;
  let buffer: string[] = [];

  async function worker() {

    while (queue.length > 0) {

      const currentUrl = queue.shift();
      if (!currentUrl) return;

      if (visited.has(currentUrl)) continue;

      visited.add(currentUrl);

      // add to buffer
      buffer.push(currentUrl);

      if (buffer.length >= BATCH_SIZE) {
        onBatch([...buffer]);
        buffer = [];
      }

      try {

        const { data } = await axios.get(currentUrl, {
          timeout: 5000,
          maxRedirects: 2
        });

        const $ = cheerio.load(data);

        $("a[href]").each((_, el) => {

          let href = $(el).attr("href");
          if (!href) return;

          if (
            IGNORE_EXT.test(href) ||
            href.startsWith("#") ||
            href.startsWith("javascript:") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:")
          ) return;

          try {

            const absolute = new URL(href, currentUrl).href;
            const parsed = new URL(absolute);

            if (parsed.hostname !== baseDomain) return;

            const normalized = normalizeUrl(parsed.href);

            if (!visited.has(normalized) && !queued.has(normalized)) {
              queued.add(normalized);
              queue.push(normalized);
            }

          } catch {}

        });

      } catch {
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