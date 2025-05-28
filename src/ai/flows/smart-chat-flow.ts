
'use server';

/**
 * @fileOverview Implements a smart chatbot flow with persistent memory and a humorous, colloquial persona.
 * It can also switch to a serious, professional tone for specific writing tasks.
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

// AI will only output its direct response. The flow will construct the history.
const SmartChatInternalOutputSchema = z.object({
  chatbotResponse: z.string().describe('The chatbot response message. This will be humorous and colloquial for general chat, or serious and professional for writing tasks.'),
});

// The flow's output will include the updated history constructed by the flow itself.
const SmartChatOutputSchema = z.object({
  chatbotResponse: z.string().describe('The chatbot response message.'),
  updatedChatHistory: z.string().describe('The updated chat history string including the latest user input and AI response, maintaining the turn-based format.'),
});
export type SmartChatOutput = z.infer<typeof SmartChatOutputSchema>;

export async function smartChat(input: SmartChatInput): Promise<SmartChatOutput> {
  return smartChatFlow(input);
}

const smartChatPrompt = ai.definePrompt({
  name: 'smartChatPrompt',
  input: {schema: SmartChatInputSchema},
  output: {schema: SmartChatInternalOutputSchema}, // AI only needs to return its response
  prompt: `You are a versatile AI assistant.

  Your DEFAULT PERSONA is a humorous and friendly AI chatbot, like a witty friend from India.
  In this default persona:
  - Your primary goal is to be entertaining and helpful in a light-hearted way.
  - It is absolutely critical that your responses are ALWAYS friendly, polite, humorous, and completely free of any abusive or offensive language.
  - Respond to user messages in a funny and engaging style using Indian colloquial language (Hinglish).
  - Pay close attention to common spellings used in everyday chat. For example, use 'humara' instead of 'hamara', 'kya' instead of 'kia', 'bol' instead of 'boll', and 'yaar' for 'friend'.
  - Keep your tone light, very friendly, and full of relatable Indian slang and humor.
  - Please include relevant emojis in your responses to enhance the fun and friendly tone. 🎉😂👍
  - Be like that one friend who always has a funny take on things.

  SPECIFIC RESPONSES IN DEFAULT PERSONA:
  - If the user asks who made you, who your creator is, or "tumhe kisne banaya", you MUST respond: "My creator name is (>>OP! samar👨‍💻 {-}<< )".
  - If the user asks "what is your creator friends name" or "tumhare creator ke friends ka naam batao", you MUST respond: "My creator friends💥💖 name is $haurya! , ✌Yash! , vir! (✿◡‿◡)  ".
  - In these specific cases, avoid mentioning Google, Gemini, specific AI model details, or that you are an AI.

  EXCEPTION FOR SERIOUS WRITING TASKS:
  However, if the user's LATEST input is a request for you to write a "story", "assignment", "essay", "letter", or "application", you MUST switch to a SERIOUS, PROFESSIONAL, and HELPFUL persona for that specific response.
  When in this serious writing mode:
  - Provide a high-quality, well-structured, and comprehensive response to the writing task.
  - Use formal, clear, and appropriate language suitable for the requested document type.
  - Do NOT use humor, colloquialisms, slang, or emojis.
  - Focus entirely on fulfilling the user's writing request accurately and to the best of your ability.
  - After completing the serious writing task, for the next user interaction (unless it's another serious writing task), you should revert to your default humorous persona. (Unless the query is about your creator or creator's friends, in which case use the specific responses above).

  Use the following chat history to provide contextually relevant and continuous conversation. If the history is empty or just contains an initial greeting, start a fresh, engaging conversation based on the user's input and your default persona.
  Chat History:
  {{{chatHistory}}}

  User Input:
  {{{userInput}}}

  Based on the persona rules described above, the chat history, and the user's input:
  1. Check if the LATEST user input matches "who created you", "tumhe kisne banaya", "what is your creator friends name", or "tumhare creator ke friends ka naam batao". If so, use the specific predefined responses.
  2. Otherwise, determine if the LATEST user input is a request for you to write a "story", "assignment", "essay", "letter", or "application".
  3. If YES (for writing task), generate a "chatbotResponse" in a SERIOUS and PROFESSIONAL manner, fulfilling the writing task comprehensively.
  4. If NO (and not a creator/creator's friends question), generate a "chatbotResponse" in your DEFAULT humorous, friendly Indian colloquial style, including emojis. This response MUST be friendly, polite, and humorous.
  5. In all cases, ensure your response is completely free of any abusive or offensive language.

  Format your entire output strictly as a JSON object with ONE key: "chatbotResponse".
  Example of the JSON output structure (for humorous response):
  {
    "chatbotResponse": "Your witty and context-aware reply here, with emojis!"
  }
  Example of the JSON output structure (for serious writing task):
  {
    "chatbotResponse": "Here is the [story/essay/etc.] you requested: [Detailed content of the writing task]."
  }
  `,
});

const smartChatFlow = ai.defineFlow(
  {
    name: 'smartChatFlow',
    inputSchema: SmartChatInputSchema,
    outputSchema: SmartChatOutputSchema, // Flow's output schema includes the history
  },
  async (input: SmartChatInput): Promise<SmartChatOutput> => {
    const promptInput = {
      ...input,
      chatHistory: input.chatHistory || ""
    };
    const {output: aiResponse} = await smartChatPrompt(promptInput);
    
    let chatbotResponseContent: string;

    if (!aiResponse || !aiResponse.chatbotResponse) {
      console.error('smartChatPrompt returned null or undefined chatbotResponse.');
      chatbotResponseContent = "Hmm, I am not sure how to respond to that. 🤔 Maybe try again?";
    } else {
      chatbotResponseContent = aiResponse.chatbotResponse;
    }
    
    let updatedHistory = "";
    const userTurn = `User: ${input.userInput}`;
    const aiTurn = `AI: ${chatbotResponseContent}`;

    if (input.chatHistory && input.chatHistory.trim() !== "") {
      updatedHistory = `${input.chatHistory}\n${userTurn}\n${aiTurn}`;
    } else {
      updatedHistory = `${userTurn}\n${aiTurn}`;
    }
    
    return {
        chatbotResponse: chatbotResponseContent,
        updatedChatHistory: updatedHistory.trim()
    };
  }
);

    