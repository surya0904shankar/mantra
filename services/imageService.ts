
import { GoogleGenAI } from "@google/genai";

export const generateAppIcon = async (): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key missing for image generation");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: 'A professional, minimalist app icon for a spiritual mantra tracker called "OmCounter". The design features a golden "Om" symbol (ॐ) centered within a stylized, elegant lotus flower. Color palette: Saffron gold, deep sunset orange, and a hint of mystical violet. High-quality 3D render style with soft shadows, centered composition, clean white or soft cream background, 1024x1024, sacred geometry aesthetic.',
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating app icon:", error);
    return null;
  }
};
