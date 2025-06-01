'use server';
/**
 * @fileOverview A Genkit flow for generating a simulated short URL string.
 *
 * - generateShortUrl - A function that takes a long URL and returns a simulated short URL string and a disclaimer.
 * - GenerateShortUrlInput - The input type for the generateShortUrl function.
 * - GenerateShortUrlOutput - The return type for the generateShortUrl function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateShortUrlInputSchema = z.object({
  longUrl: z.string().url({ message: "Please enter a valid URL." }).describe('The long URL to be "shortened".'),
});
export type GenerateShortUrlInput = z.infer<typeof GenerateShortUrlInputSchema>;

const GenerateShortUrlOutputSchema = z.object({
  shortUrlString: z.string().describe('The generated short URL string (simulated).'),
  disclaimer: z.string().describe('A disclaimer about the functionality of the short URL.'),
});
export type GenerateShortUrlOutput = z.infer<typeof GenerateShortUrlOutputSchema>;

export async function generateShortUrl(input: GenerateShortUrlInput): Promise<GenerateShortUrlOutput> {
  return generateShortUrlFlow(input);
}

// This flow does not use an LLM, it's a simple string manipulation for demonstration.
const generateShortUrlFlow = ai.defineFlow(
  {
    name: 'generateShortUrlFlow',
    inputSchema: GenerateShortUrlInputSchema,
    outputSchema: GenerateShortUrlOutputSchema,
  },
  async (input) => {
    // Generate a random 6-character alphanumeric string
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomPath = '';
    for (let i = 0; i < 6; i++) {
      randomPath += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const shortUrlString = `https://pop.gpt/${randomPath}`; // Using a placeholder domain
    const disclaimer = "This is a simulated short URL for demonstration purposes only. It is NOT a live, working link and will not redirect on the internet. Real URL shorteners require backend infrastructure to manage links and redirections.";

    return { shortUrlString, disclaimer };
  }
);
