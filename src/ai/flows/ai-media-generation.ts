
'use server';
/**
 * @fileOverview AI media generation flow.
 *
 * - generateMedia - A function that generates media based on a prompt and type.
 * - GenerateMediaInput - The input type for the generateMedia function.
 * - GenerateMediaOutput - The return type for the generateMedia function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// These schemas are NOT exported due to 'use server' constraints.
// They are defined here for type safety within this file.
const GenerateMediaInputSchemaInternal = z.object({
  prompt: z.string().describe('The prompt for media generation.'),
  mediaType: z.string().describe('The type of media to generate (e.g., "image", "video", "3d_model"). Only "image" is currently supported.'),
});
export type GenerateMediaInput = z.infer<typeof GenerateMediaInputSchemaInternal>;

const GenerateMediaOutputSchemaInternal = z.object({
  mediaUrl: z.string().nullable().describe('The URL or data URI of the generated media, or an error/unsupported message.'),
  status: z.string().describe('Status of the generation (e.g., "success", "error", "unsupported_type", "error_no_url", "error_exception").'),
});
export type GenerateMediaOutput = z.infer<typeof GenerateMediaOutputSchemaInternal>;

export async function generateMedia(input: GenerateMediaInput): Promise<GenerateMediaOutput> {
  if (input.mediaType.toLowerCase() !== 'image') {
    return {
      mediaUrl: `Unsupported media type: ${input.mediaType}. Only "image" is currently supported.`,
      status: 'unsupported_type',
    };
  }

  if (!input.prompt || input.prompt.trim() === "") {
    return {
      mediaUrl: 'Error: Prompt cannot be empty for image generation.',
      status: 'error_empty_prompt',
    };
  }

  try {
    const {media, text} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // Specific model for image generation
      prompt: input.prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Gemini image generation often requires both
      },
    });

    if (media && media.url) {
      return {mediaUrl: media.url, status: 'success'};
    } else {
      console.error('Image generation (generateMedia) did not return a media URL. Text response (if any):', text);
      return {
        mediaUrl: 'Error: Image generation succeeded but no image URL was returned. ' + (text || 'No additional text response.'),
        status: 'error_no_url',
      };
    }
  } catch (error: any) {
    console.error('Error during media generation (generateMedia):', error);
    let detailedErrorMessage = error.message || 'An unexpected error occurred during media generation.';
    if (error.cause && typeof error.cause === 'string') {
      detailedErrorMessage += ` Cause: ${error.cause}`;
    } else if (error.cause && typeof error.cause === 'object' && error.cause.message) {
      detailedErrorMessage += ` Cause: ${error.cause.message}`;
    }
    if (error.message && error.message.includes('Model does not support the requested response modalities')) {
        detailedErrorMessage = 'The AI model had an issue with the image request modalities. This might be a temporary issue or a configuration problem with the model.';
    }
    return {
      mediaUrl: `Error: ${detailedErrorMessage}`,
      status: 'error_exception',
    };
  }
}
