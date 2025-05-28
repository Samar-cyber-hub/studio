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
  response: z.string().describe('The humorous and friendly response in Indian colloquial language, including relevant emojis.'),
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
  Please respond to the following message: {{{message}}}`,
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
      return {
        response: 'Arre yaar, kuch toh gadbad ho gayi! 😟 Thoda fir se try karna. (Oops, something went wrong! Please try again.)',
      };
    }
    return output;
  }
);
