
import { GoogleGenAI } from "@google/genai";

export const generateAppIcon = async (): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: 'A premium, high-resolution app icon for "OmCounter". Centered golden 3D "Om" symbol (ॐ) on a pristine white background. The symbol is surrounded by elegant, minimalist lotus petals in saffron and burnt orange. Clean, professional, sacred geometry, soft ambient occlusion shadows, 1024x1024.' }],
      },
      config: { imageConfig: { aspectRatio: "1:1" } },
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return part ? `data:image/png;base64,${part.inlineData.data}` : null;
  } catch (error) {
    console.error("Error generating app icon:", error);
    return null;
  }
};

export const generateLinkedInPoster = async (stats: { name: string, total: number, streak: number }): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Studio product photography of a premium smartphone displaying the OmCounter app. 
    The screen shows a large sacred Om symbol, the user name "${stats.name}", and a milestone badge of "${stats.total} total chants" with a "${stats.streak} day streak". 
    The phone is placed on a minimalist dark marble surface next to a single white lotus flower and a pair of wooden mala beads. 
    Cinematic lighting with a warm sun flare, soft bokeh background, 16:9 aspect ratio, 2K resolution, highly detailed, professional marketing aesthetic for LinkedIn.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "2K"
        }
      },
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return part ? `data:image/png;base64,${part.inlineData.data}` : null;
  } catch (error) {
    console.error("Error generating LinkedIn poster:", error);
    if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        throw new Error("KEY_RESET_REQUIRED");
    }
    return null;
  }
};
