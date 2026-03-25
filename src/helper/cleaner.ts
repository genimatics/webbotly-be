import OpenAI from "openai";
import dotenv from "dotenv";
import { CLEANSE_PROMPT } from "../constants/prompt";
import { DEFAULT_MODEL } from "../constants";

dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function cleanseContent(content: string): Promise<{
  cleansedContent: string;
  completion_tokens: number;
  prompt_tokens: number;
}> {
  if (!content) {
    throw new Error("Content is required");
  }

  try {
    const response = await client.chat.completions.create({
      response_format:{type:"json_object"},
      messages: [
        { role: "assistant", content: CLEANSE_PROMPT },
        { role: "user", content },
      ],
      model: DEFAULT_MODEL,
    });

    const completion_tokens = response?.usage?.completion_tokens || 0;
    const prompt_tokens = response?.usage?.prompt_tokens || 0;

    const cleansedContent = response.choices?.[0]?.message?.content;

    if (!cleansedContent) {
      throw new Error("Failed to generate cleansed content");
    }

    return { cleansedContent: JSON.parse(cleansedContent), completion_tokens, prompt_tokens };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error("An error occurred while processing your request");
  }
}
