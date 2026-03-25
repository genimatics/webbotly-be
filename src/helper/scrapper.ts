import axios from 'axios';
import { convert } from 'html-to-text';

const PHP_FILE_REGEX = /\b[^\s]*\.php\b/g;
const LINE_BREAK = "\n";

export async function fetchAndProcessContent(url: string): Promise<string> {
    if (!url) {
        throw new Error('URL is required');
    }

    try {
        // Fetch the content from the provided URL
        const response = await axios.get(url);
        const html = response.data;

        if (!html) {
            throw new Error('Failed to retrieve valid HTML content');
        }

        // Convert HTML to text and clean up specific unwanted patterns
        const text = convert(html, { wordwrap: 150 })
            .replace(PHP_FILE_REGEX, '') // Remove .php file references
            .split(LINE_BREAK) // Split into lines
            .filter((line: string) => line.trim() !== '') // Filter out empty lines
            .join(LINE_BREAK); // Join cleaned lines with line breaks

        return text;
    } catch (error) {
        console.error("Error fetching content:", error);
        throw new Error('An error occurred while fetching content from the URL');
    }
}
