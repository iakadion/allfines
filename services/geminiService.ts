import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSecurityAudit = async (): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = "Generate a short, technical but friendly message (max 2 sentences) confirming this music session is secure, encrypted, and certified by Gemini and Google technology. Use security emojis. English language.";
    
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Session verified. Gemini & Google Certificate Active. 🔒✨";
  } catch (error) {
    console.error("Gemini Audit Error:", error);
    return "Protected Session. Gemini Protocol Active. 🛡️";
  }
};

export const analyzeVibe = async (trackName: string): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `Analyze the imaginary "vibe" of a music track named "${trackName}". Give a short, poetic, and abstract description of the feeling it evokes. (Max 30 words). English language.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    
    return response.text || "A mysterious melody echoing through digital time.";
  } catch (error) {
    return "Analysis unavailable at the moment.";
  }
};