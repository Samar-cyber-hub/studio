'use server';

/**
 * @fileOverview Implements a persistent memory chatbot flow.
 *
 * - persistentMemoryChat - A function that handles the chatbot conversation with persistent memory.
 * - PersistentMemoryChatInput - The input type for the persistentMemoryChat function.
 * - PersistentMemoryChatOutput - The return type for the persistentMemoryChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersistentMemoryChatInputSchema = z.object({
  userInput: z.string().describe('The user input message.'),
  chatHistory: z.string().describe('The chat history.'),
});
export type PersistentMemoryChatInput = z.infer<typeof PersistentMemoryChatInputSchema>;

const PersistentMemoryChatOutputSchema = z.object({
  chatbotResponse: z.string().describe('The chatbot response message.'),
  updatedChatHistory: z.string().describe('The updated chat history including the latest interaction.'),
});
export type PersistentMemoryChatOutput = z.infer<typeof PersistentMemoryChatOutputSchema>;

export async function persistentMemoryChat(input: PersistentMemoryChatInput): Promise<PersistentMemoryChatOutput> {
  return persistentMemoryChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'persistentMemoryChatPrompt',
  input: {schema: PersistentMemoryChatInputSchema},
  output: {schema: PersistentMemoryChatOutputSchema},
  prompt: `You are a humorous, friendly, and knowledgeable AI chatbot using Indian colloquial language.
  Your goal is to provide helpful and contextually relevant responses based on the chat history.

  Chat History:
  {{chatHistory}}

  User Input:
  {{userInput}}

  Generate a response that continues the conversation in a humorous and engaging way.
  Also, create an updated chat history including the latest user input and your response.

  Format your response as follows:
  {
    "chatbotResponse": "Your humorous and helpful response here",
    "updatedChatHistory": "The complete chat history including user input and your response"
  }`,
});

const persistentMemoryChatFlow = ai.defineFlow(
  {
    name: 'persistentMemoryChatFlow',
    inputSchema: PersistentMemoryChatInputSchema,
    outputSchema: PersistentMemoryChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    // Ensure the output is not null or undefined before accessing its properties
    if (!output) {
      throw new Error('Prompt returned null or undefined output.');
    }

    return output!;
  }
);
