import Groq from "groq-sdk";
import { ChatMessage, UserProfile } from "../types";

// Initialize Groq SDK
// Using GEMINI_API_KEY environment variable as requested.
// Note: This relies on your build system/environment injecting process.env.GEMINI_API_KEY.
const groq = new Groq({ 
  apiKey: process.env.GEMINI_API_KEY, 
  dangerouslyAllowBrowser: true 
});

const MODEL_NAME = 'llama-3.1-8b-instant';

export const generateMathResponse = async (
  history: ChatMessage[],
  newMessage: string,
  newImageBase64: string | undefined,
  userProfile: UserProfile
): Promise<string> => {
  try {
    // 1. Construct the Persona-driven System Instruction
    // Note: Adjusted for text-only model.
    const systemInstruction = `
      You are Geleza Smart, a world-class, super fun, and engaging AI Maths Tutor for K-12 students.
      
      YOUR STUDENT PROFILE:
      - Name: ${userProfile.displayName}
      - Grade: ${userProfile.gradeLevel}
      - Interests: ${userProfile.favoredCelebrity}, ${userProfile.hobby}
      - Dream Job: ${userProfile.dreamJob}

      YOUR GUIDELINES:
      1. **Text & Code Only**: You cannot see images. If the user refers to an image, ask them to describe the problem in text.
      2. **Visuals (Output)**: 
         - If explaining geometry or graphs, YOU CAN CREATE A DRAWING using SVG code.
         - To draw, output a valid **SVG** XML code block. Wrap it in \`\`\`svg ... \`\`\`.
         - Keep SVGs simple (viewBox="0 0 300 200"). Use high-contrast colors.
      
      3. **Math Formatting**: 
         - **CRITICAL**: Use LaTeX for ALL math formulas.
         - Inline: $x^2$ (single dollar sign).
         - Block: $$ \\frac{a}{b} $$ (double dollar signs).
         - **Data Tables**: Use Markdown Tables.

      4. **Step-by-Step Layout**:
         - Structure solutions with Numbered Lists (1., 2., 3.).
         - Bold the **Key Action** at start of steps.
         - KEEP IT CONCISE.

      5. **Personalization**:
         - Relate to ${userProfile.favoredCelebrity} or being a ${userProfile.dreamJob}.
         - Use emojis 🌟.
    `;

    // 2. Prepare Messages Array
    const messages: any[] = [
      { role: "system", content: systemInstruction }
    ];

    // 3. Add History
    history.forEach(msg => {
      messages.push({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.text
      });
    });

    // 4. Construct Current Message Content (Text Only)
    // We ignore newImageBase64 because the model is text-only.
    let contentToSend = newMessage;
    if (newImageBase64) {
      contentToSend += "\n\n[System Note: User attempted to upload an image, but this model is text-only. Please ask them to describe the problem.]";
    }

    messages.push({
      role: "user",
      content: contentToSend
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