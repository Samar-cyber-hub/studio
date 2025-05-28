
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
      // Try to extract a more specific error message if available
      let detailedErrorMessage = error.message || 'An unexpected error occurred during image generation.';
      if (error.cause && typeof error.cause === 'string') {
        detailedErrorMessage += ` Cause: ${error.cause}`;
      } else if (error.cause && typeof error.cause === 'object' && error.cause.message) {
        detailedErrorMessage += ` Cause: ${error.cause.message}`;
      }

      // Check for the specific modality error in the message
      if (error.message && error.message.includes('Model does not support the requested response modalities')) {
        detailedErrorMessage = 'The AI model had an issue with the image request modalities. This might be a temporary issue or a configuration problem with the model.';
      }
      
      return {
        imageDataUri: null,
        errorMessage: detailedErrorMessage,
      };
    }
  }
);
