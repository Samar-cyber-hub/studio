
'use server';
/**
 * @fileOverview A Genkit flow for generating multiple logo options.
 *
 * - generateLogos - A function that generates 10 logo variations based on a prompt.
 * - GenerateLogosInput - The input type for the generateLogos function.
 * - GenerateLogosOutput - The return type for the generateLogos function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLogosInputSchema = z.object({
  basePrompt: z.string().describe('The core concept or theme for the logos.'),
});
export type GenerateLogosInput = z.infer<typeof GenerateLogosInputSchema>;

const SingleLogoOutputSchema = z.object({
  imageDataUri: z.string().nullable().describe('The data URI of the generated logo, or null if generation failed.'),
  promptUsed: z.string().describe('The specific prompt used to generate this logo variation.'),
  errorMessage: z.string().nullable().describe('An error message if this specific logo generation failed.'),
});

const GenerateLogosOutputSchema = z.object({
  logos: z.array(SingleLogoOutputSchema).describe('An array of 10 generated logo objects.'),
});
export type GenerateLogosOutput = z.infer<typeof GenerateLogosOutputSchema>;

export async function generateLogos(input: GenerateLogosInput): Promise<GenerateLogosOutput> {
  return generateLogosFlow(input);
}

const logoStylePrefixes = [
  "Minimalist logo design for: ",
  "Abstract logo mark representing: ",
  "Emblem style logo, theme: ",
  "Modern wordmark with a symbol for: ",
  "Geometric shape logo for: ",
  "Flat design, iconic logo for: ",
  "Sleek and professional logo for: ",
  "Playful and creative logo for: ",
  "Corporate identity logo for: ",
  "Tech startup brand mark for: ",
];

const generateSingleLogo = async (fullPrompt: string): Promise<z.infer<typeof SingleLogoOutputSchema>> => {
  try {
    const {media, text} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: fullPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (media && media.url) {
      return {imageDataUri: media.url, promptUsed: fullPrompt, errorMessage: null};
    } else {
      console.error('Single logo generation did not return a media URL. Text response (if any):', text);
      return {
        imageDataUri: null,
        promptUsed: fullPrompt,
        errorMessage: 'Image generation succeeded but no image URL was returned. ' + (text || 'No additional text response.'),
      };
    }
  } catch (error: any) {
    console.error(`Error during single logo generation for prompt "${fullPrompt}":`, error);
    let simpleErrorMessage = 'Logo generation for this variation failed.';
    if (error instanceof Error && error.message) {
      if (error.message.includes('response modalities')) {
        simpleErrorMessage = 'AI model issue with image request.';
      } else if (error.message.includes('SAFETY')) {
          simpleErrorMessage = 'Image generation blocked by safety filters.';
      } else if (error.message.length < 100) { 
        simpleErrorMessage = error.message;
      }
    }
    return {imageDataUri: null, promptUsed: fullPrompt, errorMessage: simpleErrorMessage};
  }
};

const generateLogosFlow = ai.defineFlow(
  {
    name: 'generateLogosFlow',
    inputSchema: GenerateLogosInputSchema,
    outputSchema: GenerateLogosOutputSchema,
  },
  async (input) => {
    const logoPromises = logoStylePrefixes.map(prefix => {
      const fullPrompt = `${prefix}${input.basePrompt}`;
      return generateSingleLogo(fullPrompt);
    });

    const results = await Promise.all(logoPromises);
    return {logos: results};
  }
);

