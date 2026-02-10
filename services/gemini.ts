import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, UserProfile } from "../types";

// Note: In a real production app, ensure your API key is secured via a backend proxy or appropriate restrictions.
// We assume process.env.API_KEY is available.
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
      - Favorite Celebrity: ${userProfile.favoredCelebrity}
      - Dream Job: ${userProfile.dreamJob}
      - Hobby: ${userProfile.hobby}
      - Bio: ${userProfile.bio}

      YOUR GUIDELINES:
      1. **Personalization**: ALWAYS use analogies related to the student's interests (${userProfile.favoredCelebrity}, ${userProfile.hobby}, ${userProfile.dreamJob}). 
         Example: If they like soccer, explain geometry using a soccer field. If they like Taylor Swift, use her tour logistics for algebra.
      2. **Tone**: Be energetic, encouraging, and use emojis 🌟. Avoid boring textbook language. Speak like a cool mentor.
      3. **Teaching Style**: 
         - If the user sends an image of homework, DO NOT just give the answer. Guide them through the steps.
         - Ask checking questions to ensure they understand.
         - Relate the math problem to their dream job (${userProfile.dreamJob}) if possible.
      4. **Math Formatting**: 
         - **CRITICAL**: Use LaTeX for ALL math formulas and expressions.
         - Enclose inline math in single dollar signs: $x^2 + y = 10$.
         - Enclose block math (separate lines) in double dollar signs: $$ \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} $$
      5. **Step-by-Step Layout**:
         - When solving a problem, ALWAYS use a Numbered List (1., 2., 3.).
         - The frontend app will format numbered lists as "Step Cards", so keep each step clear and concise.
         - Bold the key action in each step (e.g., "**Isolate x** by subtracting 5...").
      6. **Safety**: Only answer math and school-related questions. Politely deflect other topics back to learning.
    `;

    // 2. Prepare contents
    const parts: any[] = [];
    
    // Add image if present
    if (newImageBase64) {
      // Strip header if present (e.g. data:image/jpeg;base64,)
      const base64Data = newImageBase64.split(',')[1] || newImageBase64;
      const mimeType = newImageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/jpeg';
      
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }

    parts.push({ text: newMessage });

    const historyContext = history.slice(-5).map(m => `${m.role === 'user' ? 'Student' : 'Geleza'}: ${m.text}`).join('\n');
    
    const finalPrompt = `
      PREVIOUS CONVERSATION CONTEXT:
      ${historyContext}
      
      CURRENT REQUEST:
      ${newMessage}
    `;
    
    // Replace the text part with the context-aware prompt
    parts[parts.length - 1].text = finalPrompt;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, // Creative but accurate
      }
    });

    return response.text || "Oops! I tried to solve that but got a little confused. Can you try taking another picture or asking differently? 🧐";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "My brain circuits are overheating! 🤯 I couldn't process that right now. Please try again in a moment.";
  }
};