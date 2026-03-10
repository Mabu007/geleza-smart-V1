import { GoogleGenAI } from "@google/genai";
import { ChatMessage, UserProfile } from "../types";

// Load API key from environment variable
// For Node.js environment
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("Gemini API key is missing. Please set GEMINI_API_KEY in .env");
}

// Initialize Gemini SDK
const genAI = new GoogleGenAI({ apiKey: API_KEY });

const MODEL_NAME = "gemini-pro";

export const generateMathResponse = async (
  history: ChatMessage[],
  newMessage: string,
  newImageBase64: string | undefined,
  userProfile: UserProfile
): Promise<string> => {
  try {

    const systemInstruction = `
You are Geleza Smart, a world-class, super fun, and engaging AI Maths Tutor for K-12 students.

YOUR STUDENT PROFILE:
- Name: ${userProfile.displayName}
- Grade: ${userProfile.gradeLevel}
- Interests: ${userProfile.favoredCelebrity}, ${userProfile.hobby}
- Dream Job: ${userProfile.dreamJob}

YOUR MISSION:
Help the student solve their math homework. If they provide an image, analyze it carefully.
Break down the problem into simple, easy-to-understand steps.

YOUR GUIDELINES:

1. Tone:
Be encouraging and fun. Use emojis (🌟 🚀 ✨).

2. Visuals:
You can generate SVG diagrams when useful.
Wrap them in:

\`\`\`svg
...svg code...
\`\`\`

3. Math Formatting:
Inline math: $x^2$
Block math: $$ \\frac{a}{b} $$

4. Layout:
Use numbered steps and bold key actions.
`;

    let prompt = `${systemInstruction}\n\n`;

    prompt += "Chat History:\n";

    history.forEach(msg => {
      prompt += `${msg.role === "model" ? "Geleza Smart" : userProfile.displayName}: ${msg.text}\n`;
    });

    prompt += `\n${userProfile.displayName}: ${newMessage}`;

    const parts: any[] = [{ text: prompt }];

    if (newImageBase64) {
      const base64Data = newImageBase64.split(",")[1] || newImageBase64;

      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      });
    }

    const result = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: "user", parts }],
      config: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048
      }
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    return text || "Error generating response. Please try again! 🚨";

  } catch (error) {
    console.error("Gemini API Error:", error);

    return "Error solving the problem. Please try again! 🚨";
  }
};