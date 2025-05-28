
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
  trendingTopics: z.array(z.string()).describe("Trending topics, content formats, or discussion points currently popular on the specified social media platform, relevant to the user's input topic."),
  tags: z.array(z.string()).describe("A list of relevant tags and keywords that are commonly searched for or used on the specified social media platform in relation to the topic."),
  hashtags: z.array(z.string()).describe('Popular hashtags to increase visibility on the specified platform.'),
  videoTitles: z.array(z.string()).describe('Engaging video titles, suitable for the specified platform.'),
  seoDescription: z.string().describe('SEO-optimized description for the content, tailored for the specified platform.'),
  thumbnailPrompt: z.string().describe('A detailed prompt for an AI image generation model to create a high-quality, SEO-friendly, catching, and hooked thumbnail, considering the aesthetics of the specified platform.'),
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
  prompt: `You are a social media expert and a creative visual strategist. Your goal is to provide exceptionally high-quality, engaging, and effective content suggestions tailored to the specific social media platform. All suggestions must be designed to be 'hooked' and 'catching' to maximize user engagement and visibility.

  Platform: {{{platform}}}
  Topic: {{{topic}}}
  Keywords: {{{keywords}}}

  Based on the provided topic and keywords, suggest:
  1. Trending Topics: Identify 3-5 current trending topics, content formats, or discussion points that are popular and gaining traction on {{{platform}}} and are relevant to the user's main topic. These should be actionable ideas.
  2. Relevant Tags/Keywords: Provide a list of relevant tags and keywords that are commonly searched for, used, or are currently trending on {{{platform}}} in relation to the topic.
  3. Popular Hashtags: List popular and effective hashtags for {{{platform}}} to increase visibility for the topic.
  4. Engaging Video Titles: Create a few engaging video titles optimized for discovery and click-through on {{{platform}}}.
  5. SEO-Optimized Description: Write an SEO-optimized description for the content, suitable for the typical character limits and style of {{{platform}}}.

  Additionally, provide a detailed and highly descriptive prompt suitable for an AI image generation model to create a visually stunning, high-quality, SEO-friendly, and click-inviting thumbnail. This thumbnail prompt should be crafted to maximize click-through rates. It should consider visual elements that are trendy, attention-grabbing, and directly relevant to the topic, keywords, and the typical aesthetic of {{{platform}}}. The prompt should clearly articulate the desired style (e.g., vibrant, minimalist, realistic, cartoonish), composition, key subjects, background, color palette, and any text overlays (keep text concise and impactful, if appropriate for a thumbnail). If applicable, suggest incorporating popular visual motifs, relevant emojis, or meme elements if they align with the content's tone and target audience on {{{platform}}} to make the thumbnail "hooked" and "catching". The prompt should be specific enough for an advanced image generation AI to produce a compelling and effective visual.

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
     if (!output) {
      console.error('socialMediaOptimizationPrompt returned null or undefined output.');
      return {
        trendingTopics: [],
        tags: [],
        hashtags: [],
        videoTitles: [],
        seoDescription: 'Sorry, could not generate suggestions at this time. Please try again.',
        thumbnailPrompt: 'Error: could not generate thumbnail prompt.',
      };
    }
    return output;
  }
);

