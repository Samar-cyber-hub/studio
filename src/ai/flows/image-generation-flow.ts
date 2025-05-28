
'use server';
/**
 * @fileOverview A Genkit flow for generating images.
 *
 * - generateImage - A function that generates an image based on a prompt.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The detailed prompt for image generation, including any style requests like realistic, animation, 3D model.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageDataUri: z.string().nullable().describe('The data URI of the generated image (e.g., "data:image/png;base64,..."), or null if generation failed.'),
  errorMessage: z.string().nullable().describe('An error message if image generation failed.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input) => {
    try {
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // Specific model for image generation
        prompt: input.prompt,
        config: {
          responseModalities: ['IMAGE'], // Request only IMAGE
          // It seems 'TEXT' modality might also be needed for some configurations,
                          // if issues arise, try ['TEXT', 'IMAGE']
                          // For now, let's try with IMAGE only as per the simplest examples
                          // Update: Documentation suggests TEXT is often required with IMAGE for Gemini.
                          // Let's use ['TEXT', 'IMAGE'] to be safe and handle potential text output if any.
                          // responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (media && media.url) {
        return {imageDataUri: media.url, errorMessage: null};
      } else {
        // Attempt with TEXT and IMAGE if the first one fails or returns no URL
        // This is a common pattern for some Gemini image generation setups.
        const {media: mediaWithText, text} = await ai.generate({
            model: 'googleai/gemini-2.0-flash-exp',
            prompt: input.prompt,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });
        if (mediaWithText && mediaWithText.url) {
            return {imageDataUri: mediaWithText.url, errorMessage: null};
        }
        console.error('Image generation did not return a media URL. Text response:', text);
        return {imageDataUri: null, errorMessage: 'Image generation succeeded but no image URL was returned. ' + (text || '')};
      }
    } catch (error: any) {
      console.error('Error during image generation flow:', error);
      return {
        imageDataUri: null,
        errorMessage: error.message || 'An unexpected error occurred during image generation.',
      };
    }
  }
);
