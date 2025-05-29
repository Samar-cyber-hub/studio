
'use server';
/**
 * @fileOverview AI media generation flow, primarily for thumbnails.
 *
 * - generateMedia - A function that generates media based on a prompt and type.
 * - GenerateMediaInput - The input type for the generateMedia function.
 * - GenerateMediaOutput - The return type for the generateMedia function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schemas are internal to this file due to 'use server' constraints on exports.
const GenerateMediaInputSchemaInternal = z.object({
  prompt: z.string().describe('The prompt for media generation.'),
  mediaType: z.string().describe('The type of media to generate (e.g., "image"). Only "image" is currently supported.'),
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
      model: 'googleai/gemini-2.0-flash-exp', 
      prompt: input.prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], 
      },
    });

    if (media && media.url) {
      return {mediaUrl: media.url, status: 'success'};
    } else {
      console.error('Image generation (generateMedia) did not return a media URL. Text response (if any):', text);
      return {
        mediaUrl: 'Error: Image generation succeeded but no image URL was returned. ' + (text || 'No additional text response provided by model.'),
        status: 'error_no_url',
      };
    }
  } catch (error: any) {
    console.error('Error during media generation (generateMedia):', error);
    let simpleErrorMessage = 'Thumbnail generation failed. Please try again.';
    if (error instanceof Error && error.message) {
        if (error.message.includes('response modalities')) {
          simpleErrorMessage = 'The AI model had an issue with the image request. Please try a different prompt or style for the thumbnail.';
        } else if (error.message.includes('SAFETY')) {
          simpleErrorMessage = 'The thumbnail could not be generated due to safety filters. Please adjust your prompt.';
        } else if (error.message.length < 150) { 
          simpleErrorMessage = error.message;
        }
    }
    return {
      mediaUrl: `Error: ${simpleErrorMessage}`,
      status: 'error_exception',
    };
  }
}

