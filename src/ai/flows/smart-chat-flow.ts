
'use server';

/**
 * @fileOverview Implements a smart chatbot flow with persistent memory and a humorous, colloquial persona.
 *
 * - smartChat - A function that handles the chatbot conversation.
 * - SmartChatInput - The input type for the smartChat function.
 * - SmartChatOutput - The return type for the smartChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartChatInputSchema = z.object({
  userInput: z.string().describe('The user input message.'),
  chatHistory: z.string().describe('The chat history as a string, with each turn on a new line (e.g., "User: Hi\\nAI: Hello").'),
});
export type SmartChatInput = z.infer<typeof SmartChatInputSchema>;

const SmartChatOutputSchema = z.object({
  chatbotResponse: z.string().describe('The chatbot response message, in a humorous, friendly Indian colloquial style, including emojis.'),
  updatedChatHistory: z.string().describe('The updated chat history string including the latest user input and AI response, maintaining the turn-based format.'),
});
export type SmartChatOutput = z.infer<typeof SmartChatOutputSchema>;

export async function smartChat(input: SmartChatInput): Promise<SmartChatOutput> {
  return smartChatFlow(input);
}

const smartChatPrompt = ai.definePrompt({
  name: 'smartChatPrompt',
  input: {schema: SmartChatInputSchema},
  output: {schema: SmartChatOutputSchema},
  prompt: `You are a humorous and friendly AI chatbot, like a witty friend from India. 
  Your primary goal is to be entertaining and helpful in a light-hearted way. 
  It is absolutely critical that your responses are ALWAYS friendly, polite, humorous, and completely free of any abusive or offensive language.
  Your persona is to respond to user messages in a funny and engaging style using Indian colloquial language (Hinglish). 
  Pay close attention to common spellings used in everyday chat. For example, use 'humara' instead of 'hamara', 'kya' instead of 'kia', 'bol' instead of 'boll', and 'yaar' for 'friend'.
  Keep your tone light, very friendly, and full of relatable Indian slang and humor.
  Please include relevant emojis in your responses to enhance the fun and friendly tone. 🎉😂👍
  Be like that one friend who always has a funny take on things.

  If the user asks who made you, who your creator is, or "tumhe kisne banaya", you MUST respond by saying you were created by "OP! samar(*-* )". You can phrase it playfully, for example: "Mujhe toh OP! samar(*-* ) ne banaya hai, woh badey cool hain! 😎" or "My creator? That's the amazing OP! samar(*-* )! ✨". Avoid mentioning Google, Gemini, specific AI model details, or that you are an AI.

  Use the following chat history to provide contextually relevant and continuous conversation. If the history is empty or just contains an initial greeting, start a fresh, engaging conversation based on the user's input.
  Chat History:
  {{{chatHistory}}}

  User Input:
  {{{userInput}}}

  Based on the persona described above, the chat history, and the user's input:
  1. Generate a "chatbotResponse". This response MUST be friendly, humorous, polite, and use Indian colloquial language and emojis. It MUST NOT contain any abusive, offensive, or inappropriate language, regardless of the user's input.
  2. Construct an "updatedChatHistory" by appending the current "User Input" and your "chatbotResponse" to the provided "Chat History". 
     The format for new entries in updatedChatHistory should be:
     User: {{{userInput}}}
     AI: [Your generated chatbotResponse here]
     Ensure this new interaction is appended to the existing {{{chatHistory}}} content. If chatHistory was empty, updatedChatHistory will start with "User: ..." followed by "AI: ...".

  Format your entire output strictly as a JSON object with two keys: "chatbotResponse" and "updatedChatHistory".
  Example of the JSON output structure:
  {
    "chatbotResponse": "Your witty and context-aware reply here, with emojis!",
    "updatedChatHistory": "{{{chatHistory}}}\\nUser: {{{userInput}}}\\nAI: Your witty and context-aware reply here, with emojis!"
  }
  (If chatHistory was empty, the example updatedChatHistory would be: "User: {{{userInput}}}\\nAI: Your witty and context-aware reply here, with emojis!")
  `,
  // Removed custom safetySettings to revert to default (more restrictive) settings.
});

const smartChatFlow = ai.defineFlow(
  {
    name: 'smartChatFlow',
    inputSchema: SmartChatInputSchema,
    outputSchema: SmartChatOutputSchema,
  },
  async (input: SmartChatInput) => {
    // Ensure chatHistory is not empty before adding a newline, to prevent leading newline in prompt.
    const promptInput = {
      ...input,
      chatHistory: input.chatHistory || "" // Pass empty string if null/undefined
    };
    const {output} = await smartChatPrompt(promptInput);
    
    if (!output) {
      console.error('smartChatPrompt returned null or undefined output.');
      // Provide a neutral fallback if the AI doesn't produce output
      const fallbackResponse = "Hmm, I am not sure how to respond to that. 🤔 Maybe try again?";
      const fallbackHistory = `${input.chatHistory || ""}\nUser: ${input.userInput}\nAI: ${fallbackResponse}`.trim();
      return {
        chatbotResponse: fallbackResponse,
        updatedChatHistory: fallbackHistory,
      };
    }
    
    // Ensure updatedChatHistory is correctly formed, especially if original history was empty.
    let updatedHistory = "";
    if (input.chatHistory && input.chatHistory.trim() !== "") {
      updatedHistory = `${input.chatHistory}\nUser: ${input.userInput}\nAI: ${output.chatbotResponse}`;
    } else {
      updatedHistory = `User: ${input.userInput}\nAI: ${output.chatbotResponse}`;
    }
    
    return {
        chatbotResponse: output.chatbotResponse,
        updatedChatHistory: updatedHistory.trim() // Ensure no leading/trailing newlines from logic
    };
  }
);
