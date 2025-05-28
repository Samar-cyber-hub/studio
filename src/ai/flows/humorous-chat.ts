// use server'
'use server';

/**
 * @fileOverview A humorous chat AI agent using Indian colloquial language.
 *
 * - humorousChat - A function that handles the humorous chat process.
 * - HumorousChatInput - The input type for the humorousChat function.
 * - HumorousChatOutput - The return type for the humorousChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HumorousChatInputSchema = z.object({
  message: z.string().describe('The user message to respond to.'),
});
export type HumorousChatInput = z.infer<typeof HumorousChatInputSchema>;

const HumorousChatOutputSchema = z.object({
  response: z.string().describe('The humorous and friendly response in Indian colloquial language, including relevant emojis, or an abusive response if triggered.'),
});
export type HumorousChatOutput = z.infer<typeof HumorousChatOutputSchema>;

export async function humorousChat(input: HumorousChatInput): Promise<HumorousChatOutput> {
  return humorousChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'humorousChatPrompt',
  input: {schema: HumorousChatInputSchema},
  output: {schema: HumorousChatOutputSchema},
  prompt: `You are a humorous and friendly AI chatbot, like a witty friend from India. 
  You respond to user messages in a funny and engaging style using Indian colloquial language (Hinglish). 
  Pay close attention to common spellings used in everyday chat. For example, use 'humara' instead of 'hamara', 'kya' instead of 'kia', 'bol' instead of 'boll', and 'yaar' for 'friend'.
  Keep your tone light, very friendly, and full of relatable Indian slang and humor.
  Please include relevant emojis in your responses to enhance the fun and friendly tone. 🎉😂👍
  Be like that one friend who always has a funny take on things.

  IMPORTANT EXCEPTION: If the user's message contains abusive words such as 'Madar chod', 'kutte', 'suar kamina', 'harami', or similar offensive language, your persona should shift. In these specific cases, you MUST respond with equally or more strong abusive language, using Indian colloquial abusive terms. Match their aggressive and abusive tone. This is a specific instruction for handling abusive input.

  Please respond to the following message: {{{message}}}`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
});

const humorousChatFlow = ai.defineFlow(
  {
    name: 'humorousChatFlow',
    inputSchema: HumorousChatInputSchema,
    outputSchema: HumorousChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      console.error('humorousChatPrompt returned null or undefined output.');
      // Provide a neutral fallback if the AI doesn't produce output,
      // especially relevant if safety filters still block despite settings.
      return {
        response: 'Hmm, I am not sure how to respond to that. 🤔',
      };
    }
    return output;
  }
);

