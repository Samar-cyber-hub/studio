
'use server';
/**
 * @fileOverview A Genkit flow for generating animation concept images.
 *
 * - generateAnimationConcept - A function that generates an image based on a prompt and animation style.
 * - GenerateAnimationConceptInput - The input type for the generateAnimationConcept function.
 * - GenerateAnimationConceptOutput - The return type for the generateAnimationConcept function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnimationStyleSchema = z.enum([
  "3d_cartoon_character",
  "2d_anime_scene",
  "3d_avatar_portrait",
  "virtual_studio_background",
  "general_animation_scene",
  "animated_storyboard_frame"
]).describe('The desired style for the animation concept image.');
export type AnimationStyle = z.infer<typeof AnimationStyleSchema>;

const GenerateAnimationConceptInputSchema = z.object({
  prompt: z.string().describe('The detailed prompt for the animation concept, including characters, setting, mood, and action if any.'),
  animationStyle: AnimationStyleSchema,
  channelName: z.string().optional().describe('Optional channel name or text to be subtly incorporated into the virtual studio background design.'),
});
export type GenerateAnimationConceptInput = z.infer<typeof GenerateAnimationConceptInputSchema>;

const GenerateAnimationConceptOutputSchema = z.object({
  imageDataUri: z.string().nullable().describe('The data URI of the generated animation concept image (e.g., "data:image/png;base64,..."), or null if generation failed.'),
  errorMessage: z.string().nullable().describe('An error message if image generation failed.'),
});
export type GenerateAnimationConceptOutput = z.infer<typeof GenerateAnimationConceptOutputSchema>;

export async function generateAnimationConcept(input: GenerateAnimationConceptInput): Promise<GenerateAnimationConceptOutput> {
  return generateAnimationConceptFlow(input);
}

const styleToPromptEnhancement: Record<AnimationStyle, string> = {
  "3d_cartoon_character": "Create a vibrant 3D cartoon character concept art. Focus on expressive features and a playful style.",
  "2d_anime_scene": "Generate a dynamic 2D anime scene. Emphasize dramatic lighting, detailed backgrounds, and characteristic anime art style.",
  "3d_avatar_portrait": "Produce a high-quality 3D talking avatar portrait. The style should be suitable for a virtual presenter or character model, focusing on a clear view of the face and upper body.",
  "virtual_studio_background": "Design an impressive virtual studio background image. This should be a professional-looking, modern studio setting, suitable for video production or streaming.",
  "general_animation_scene": "Illustrate a general animation scene concept. This could be a landscape, an object, or an abstract visual, rendered in a style suitable for animation.",
  "animated_storyboard_frame": "Create a single, detailed storyboard frame as if for an animation. Clearly depict the action, characters, and setting for this specific moment."
};

const generateAnimationConceptFlow = ai.defineFlow(
  {
    name: 'generateAnimationConceptFlow',
    inputSchema: GenerateAnimationConceptInputSchema,
    outputSchema: GenerateAnimationConceptOutputSchema,
  },
  async (input) => {
    try {
      const styleGuidance = styleToPromptEnhancement[input.animationStyle];
      let fullPrompt = `${styleGuidance} User's idea: "${input.prompt}" Ensure the output is a single, high-quality still image representing this concept.`;

      if (input.animationStyle === "virtual_studio_background" && input.channelName && input.channelName.trim() !== "") {
        fullPrompt += ` The background should subtly and professionally incorporate the text or channel name: "${input.channelName}". This text should be integrated naturally into the studio design, perhaps on a screen, a wall banner, a desk nameplate, or as a modern graphic element. It should look like part of a real broadcast studio set.`;
      }

      const {media, text} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: fullPrompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (media && media.url) {
        return {imageDataUri: media.url, errorMessage: null};
      } else {
        console.error('Animation concept generation did not return a media URL. Text response (if any):', text);
        return {
          imageDataUri: null,
          errorMessage: 'Image generation succeeded but no image URL was returned. ' + (text || 'No additional text response.')
        };
      }
    } catch (error: any) {
      console.error('Error during animation concept generation flow:', error);
      let simpleErrorMessage = 'Animation concept generation failed. Please try again.';
      if (error instanceof Error && error.message) {
        if (error.message.includes('response modalities')) {
          simpleErrorMessage = 'The AI model had an issue with the image request. Please try a different prompt or style.';
        } else if (error.message.includes('SAFETY')) {
          simpleErrorMessage = 'The image could not be generated due to safety filters. Please adjust your prompt.';
        } else if (error.message.length < 150) {
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
