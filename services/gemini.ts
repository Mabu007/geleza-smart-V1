import Groq from "groq-sdk";
import { ChatMessage, UserProfile } from "../types";

// Initialize Groq SDK
// Note: dangerouslyAllowBrowser is required for client-side usage.
// Ensure your API key is correctly set in your environment.
const groq = new Groq({ 
  apiKey: process.env.Groq_API_KEY, 
  dangerouslyAllowBrowser: true 
});

const MODEL_NAME = 'llama-3.2-90b-vision-preview';

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
         - **Data Tables**: Use Markdown Tables to organize data, comparisons, steps, or values cleanly.

      3. **Step-by-Step Layout**:
         - Structure your solution using a Numbered List (1., 2., 3.).
         - Bold the **Key Action** at the start of each step.
         - KEEP IT CONCISE.

      4. **Personalization**:
         - Relate the problem to ${userProfile.favoredCelebrity} or being a ${userProfile.dreamJob} occasionally.
         - Use emojis 🌟.
    `;

    // 2. Prepare Messages Array
    const messages: any[] = [
      { role: "system", content: systemInstruction }
    ];

    // 3. Add History (Text only to save tokens/complexity, avoiding base64 bloat in history)
    history.forEach(msg => {
      messages.push({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.text
      });
    });

    // 4. Construct Current Message Content
    let currentContent: any;

    if (newImageBase64) {
      // Multimodal input for Groq (Llama Vision)
      currentContent = [
        {
          type: "text",
          text: newMessage || "Please help me with this image."
        },
        {
          type: "image_url",
          image_url: {
            url: newImageBase64 // Expects data:image/jpeg;base64,... string
          }
        }
      ];
    } else {
      // Text-only input
      currentContent = newMessage;
    }

    messages.push({
      role: "user",
      content: currentContent
    });

    // 5. Call Groq API
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: MODEL_NAME,
      temperature: 0.6,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
      stop: null
    });

    return completion.choices[0]?.message?.content || "I solved it in my head but couldn't write it down! 😅 Can you ask again?";

  } catch (error) {
    console.error("Groq API Error:", error);
    return "My brain circuits are overheating! 🤯 I couldn't process that right now. Please try again in a moment or try a simpler question.";
  }
};