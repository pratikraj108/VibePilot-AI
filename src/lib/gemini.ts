import { GoogleGenAI } from "@google/genai";

// Ensure the API key is present
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set in the environment variables.");
}

// Initialize the client.
// The SDK will automatically use process.env.GEMINI_API_KEY if not explicitly provided,
// but we pass it explicitly here for clarity and strictness.
export const gemini = new GoogleGenAI(apiKey ? { apiKey } : {});
