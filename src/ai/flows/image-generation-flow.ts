
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
      const {media, text} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // Specific model for image generation
        prompt: input.prompt,
        config: {
          // IMPORTANT: Gemini image generation often requires both TEXT and IMAGE modalities.
          responseModalities: ['TEXT', 'IMAGE'], 
        },
      });

      if (media && media.url) {
        return {imageDataUri: media.url, errorMessage: null};
      } else {
        console.error('Image generation did not return a media URL. Text response (if any):', text);
        return {
          imageDataUri: null, 
          errorMessage: 'Image generation succeeded but no image URL was returned. ' + (text || 'No additional text response.')
        };
      }
    } catch (error: any) {
      console.error('Error during image generation flow:', error);
      let simpleErrorMessage = 'Image generation failed. Please try again.';
      if (error instanceof Error && error.message) {
        if (error.message.includes('response modalities')) {
          simpleErrorMessage = 'The AI model had an issue with the image request. Please try a different prompt or style.';
        } else if (error.message.includes('SAFETY')) {
          simpleErrorMessage = 'The image could not be generated due to safety filters. Please adjust your prompt.';
        } else if (error.message.length < 150) { // Keep it reasonably short and avoid overly technical details
          simpleErrorMessage = error.message;
        }
      }
      return {
        imageDataUri: null,
        errorMessage: simpleErrorMessage,
      };
    }
  }
);

