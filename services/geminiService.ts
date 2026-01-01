
import { GoogleGenAI, Type } from "@google/genai";
import { Mantra, UserStats } from "../types";

// Initialize Gemini Client using process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMantraSuggestions = async (intention: string): Promise<Partial<Mantra>[]> => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key missing");
    return [];
  }
  try {
    const prompt = `
      Suggest 3 distinct, powerful mantras (Sanskrit or English) focusing on the intention: "${intention}".
      Return the result strictly as a JSON array of objects.
      Each object should have keys: "text" (the mantra itself), "meaning" (a short English translation/explanation), and "targetCount" (suggested daily repetition, e.g., 108).
    `;

    // Updated model to 'gemini-3-flash-preview' and implemented responseSchema for robust JSON extraction
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: 'The mantra text itself.',
              },
              meaning: {
                type: Type.STRING,
                description: 'A short English translation or explanation.',
              },
              targetCount: {
                type: Type.NUMBER,
                description: 'Suggested daily repetition count.',
              },
            },
            required: ['text', 'meaning', 'targetCount'],
          },
        },
      }
    });

    const text = response.text;
    if (!text) return [];

    return JSON.parse(text) as Partial<Mantra>[];
  } catch (error) {
    console.error("Error fetching mantra suggestions:", error);
    return [];
  }
};

export const getGroupDescriptionSuggestion = async (intention: string, mantra: string): Promise<string> => {
  if (!process.env.API_KEY) return "";
  
  try {
    const prompt = `
      Write a short, inspiring description (1-2 sentences) for a spiritual chanting group.
      Intention: "${intention}".
      Mantra: "${mantra}".
      Tone: Welcoming, sacred, communal.
    `;

    // Updated model to 'gemini-3-flash-preview' for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Error generating group description:", error);
    return "";
  }
};

export const getMantraInsight = async (mantraText: string): Promise<string> => {
  if (!process.env.API_KEY) return "AI insights require an API Key.";
  
  try {
    const prompt = `
      Provide a brief, inspiring spiritual insight and the historical significance of this mantra: "${mantraText}".
      Keep it under 100 words. Tone: Calming, educational.
    `;

    // Updated model to 'gemini-3-flash-preview' for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Insight currently unavailable.";
  } catch (error) {
    console.error("Error fetching mantra insight:", error);
    return "Could not retrieve insight at this moment. Please try again later.";
  }
};

export const analyzeChantingHabits = async (stats: UserStats): Promise<string> => {
  if (!process.env.API_KEY) return "Connect API Key for personalized guidance.";

  try {
    const breakdownStr = stats.mantraBreakdown
      .map(m => `${m.mantraText}: ${m.totalCount}`)
      .join(', ');
    
    const prompt = `
      Analyze the following chanting stats for a spiritual practitioner:
      Total Chants: ${stats.totalChants}
      Current Streak: ${stats.streakDays} days
      Mantra Breakdown: ${breakdownStr || "None yet"}

      If the streak is low or 0, suggest a mantra for consistency or removing obstacles (like Ganesha mantras).
      If the count is high, offer encouragement and a deeper meditation focus.
      Provide a personalized, short (max 2 sentences) spiritual recommendation.
    `;

    // Updated model to 'gemini-3-flash-preview' for analysis tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Keep chanting to unlock more insights.";
  } catch (error) {
    console.error("Error analyzing habits:", error);
    return "Unable to connect to your spiritual guide right now.";
  }
};
