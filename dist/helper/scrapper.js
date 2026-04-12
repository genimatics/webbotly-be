"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAndProcessContent = fetchAndProcessContent;
const axios_1 = __importDefault(require("axios"));
const html_to_text_1 = require("html-to-text");
const PHP_FILE_REGEX = /\b[^\s]*\.php\b/g;
const LINE_BREAK = "\n";
async function fetchAndProcessContent(url) {
    if (!url) {
        throw new Error('URL is required');
    }
    try {
        // Fetch the content from the provided URL
        const response = await axios_1.default.get(url);
        const html = response.data;
        if (!html) {
            throw new Error('Failed to retrieve valid HTML content');
        }
        // Convert HTML to text and clean up specific unwanted patterns
        const text = (0, html_to_text_1.convert)(html, { wordwrap: 150 })
            .replace(PHP_FILE_REGEX, '') // Remove .php file references
            .split(LINE_BREAK) // Split into lines
            .filter((line) => line.trim() !== '') // Filter out empty lines
            .join(LINE_BREAK); // Join cleaned lines with line breaks
        return text;
    }
    catch (error) {
        console.error("Error fetching content:", error);
        throw new Error('An error occurred while fetching content from the URL');
    }
}
//# sourceMappingURL=scrapper.js.map