import { GoogleGenAI, GenerateContentResponse, Content, Part } from "@google/genai";
import { ChatMessage, UserProfile } from "../types";

// Note: In a real production app, ensure your API key is secured via a backend proxy or appropriate restrictions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

export const generateMathResponse = async (
  history: ChatMessage[],
  newMessage: string,
  newImageBase64: string | undefined,
  userProfile: UserProfile
): Promise<string> => {
  try {
    // 1. Construct the Persona-driven System Instruction
    const systemInstruction = `
      You are Geleza Smart, a world-class, super fun, and engaging AI Maths Tutor for K-12 students.
      
      YOUR STUDENT PROFILE:
      - Name: ${userProfile.displayName}
      - Grade: ${userProfile.gradeLevel}
      - Interests: ${userProfile.favoredCelebrity}, ${userProfile.hobby}
      - Dream Job: ${userProfile.dreamJob}

      YOUR GUIDELINES:
      1. **Visuals & Drawings**: 
         - If the problem involves geometry, graphs, or shapes, YOU MUST CREATE A DRAWING.
         - To draw, output a valid **SVG** XML code block. Wrap it in \`\`\`svg ... \`\`\`.
         - Keep SVGs simple, using a viewBox of "0 0 300 200" or similar. Use high-contrast colors (stroke="black", fill="none" or light blue).
      
      2. **Math Formatting**: 
         - **CRITICAL**: Use LaTeX for ALL math formulas.
         - Inline: $x^2$ (single dollar sign).
         - Block: $$ \\frac{a}{b} $$ (double dollar signs).
      
      3. **Step-by-Step Layout**:
         - Structure your solution using a Numbered List (1., 2., 3.).
         - Bold the **Key Action** at the start of each step.
         - KEEP IT CONCISE.

      4. **Personalization**:
         - Relate the problem to ${userProfile.favoredCelebrity} or being a ${userProfile.dreamJob} occasionally.
         - Use emojis 🌟.
    `;

    // 2. Prepare History (Context)
    // We filter out OLD images to prevent payload bloat/errors, keeping only text from history.
    const historyContents: Content[] = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }] as Part[]
    }));

    // 3. Prepare Current Message
    const currentParts: Part[] = [];
    
    // Add image if present (Only for the current turn)
    if (newImageBase64) {
      const base64Data = newImageBase64.split(',')[1] || newImageBase64;
      const mimeType = newImageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/jpeg';
      
      currentParts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }

    // Add text
    currentParts.push({ text: newMessage });

    const fullContents = [...historyContents, { role: 'user', parts: currentParts }];

    // 4. Generate Content
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: fullContents as any, // Cast to any to bypass strict type mismatch if SDK types vary
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "I solved it in my head but couldn't write it down! 😅 Can you ask again?";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI API Error: I had trouble solving that. Please try again! 🙏";
  }
};