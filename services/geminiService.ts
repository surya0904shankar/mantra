
import { GoogleGenAI } from "@google/genai";
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
      Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Keep chanting to unlock more insights.";
  } catch (error) {
    console.error("Error analyzing habits:", error);
    return "Unable to connect to your spiritual guide right now.";
  }
};
