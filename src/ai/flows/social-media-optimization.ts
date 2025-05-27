// Use server directive is required for all Genkit flows.
'use server';

/**
 * @fileOverview Social media optimization AI agent.
 *
 * - suggestSocialMediaContent - A function that suggests social media content.
 * - SocialMediaInput - The input type for the suggestSocialMediaContent function.
 * - SocialMediaOutput - The return type for the suggestSocialMediaContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SocialMediaInputSchema = z.object({
  platform: z
    .string()
    .describe('The social media platform (e.g., Instagram, TikTok, X, Facebook).'),
  topic: z.string().describe('The topic of the content.'),
  keywords: z.string().describe('Keywords related to the content, comma separated.'),
});
export type SocialMediaInput = z.infer<typeof SocialMediaInputSchema>;

const SocialMediaOutputSchema = z.object({
  trendingTopics: z.array(z.string()).describe('Trending topics related to the input.'),
  tags: z.array(z.string()).describe('Relevant tags for the content.'),
  hashtags: z.array(z.string()).describe('Popular hashtags to increase visibility.'),
  videoTitles: z.array(z.string()).describe('Engaging video titles.'),
  seoDescription: z.string().describe('SEO-optimized description for the content.'),
  thumbnailPrompt: z.string().describe('A prompt for generating a thumbnail image.'),
});
export type SocialMediaOutput = z.infer<typeof SocialMediaOutputSchema>;

export async function suggestSocialMediaContent(
  input: SocialMediaInput
): Promise<SocialMediaOutput> {
  return suggestSocialMediaContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'socialMediaOptimizationPrompt',
  input: {schema: SocialMediaInputSchema},
  output: {schema: SocialMediaOutputSchema},
  prompt: `You are a social media expert. Your goal is to provide optimized content suggestions.

  Platform: {{{platform}}}
  Topic: {{{topic}}}
  Keywords: {{{keywords}}}

  Suggest trending topics, tags, hashtags, video titles, and an SEO description to maximize visibility and engagement for the given topic on the specified platform. Also, generate a prompt for a thumbnail image that includes popular memes and GIFs.

  Format your response as a JSON object.
  `,
});

const suggestSocialMediaContentFlow = ai.defineFlow(
  {
    name: 'suggestSocialMediaContentFlow',
    inputSchema: SocialMediaInputSchema,
    outputSchema: SocialMediaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
