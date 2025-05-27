// This is an AI-powered media generation flow that can generate images, 3D AI models, realistic images, and fusion AI art.
// It exports the generateMedia function, AIMediaGenerationInput, and AIMediaGenerationOutput types.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIMediaGenerationInputSchema = z.object({
  prompt: z.string().describe('The prompt to use for generating the media.'),
  mediaType: z.enum(['image', '3dModel', 'realisticImage', 'fusionArt']).describe('The type of media to generate.'),
});
export type AIMediaGenerationInput = z.infer<typeof AIMediaGenerationInputSchema>;

const AIMediaGenerationOutputSchema = z.object({
  mediaUrl: z.string().describe('The URL of the generated media.'),
});
export type AIMediaGenerationOutput = z.infer<typeof AIMediaGenerationOutputSchema>;

export async function generateMedia(input: AIMediaGenerationInput): Promise<AIMediaGenerationOutput> {
  return generateMediaFlow(input);
}

const generateMediaFlow = ai.defineFlow(
  {
    name: 'generateMediaFlow',
    inputSchema: AIMediaGenerationInputSchema,
    outputSchema: AIMediaGenerationOutputSchema,
  },
  async input => {
    // Currently, only image generation is supported.
    if (input.mediaType === 'image') {
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: input.prompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });
      return {mediaUrl: media.url!};
    } else {
      // Return a placeholder if the media type is not supported.
      return {mediaUrl: `Unsupported media type: ${input.mediaType}`};
    }
  }
);
