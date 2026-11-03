import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

export const GEMINI_MODEL_FLASH = 'gemini-2.5-flash';
