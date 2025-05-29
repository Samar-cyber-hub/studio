
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
    .describe('The social media platform (e.g., Instagram, TikTok, X, Facebook, YouTube, LinkedIn).'),
  topic: z.string().describe('The topic of the content.'),
  keywords: z.string().describe('Keywords related to the content, comma separated.'),
  contentType: z.enum(['standard', 'short_form']).describe('The type of content: "standard" for regular videos, "short_form" for Reels/Shorts.'),
});
export type SocialMediaInput = z.infer<typeof SocialMediaInputSchema>;

const SocialMediaOutputSchema = z.object({
  trendingTopics: z.array(z.string()).describe("Trending topics, content formats, or discussion points currently popular on the specified social media platform, relevant to the user's input topic and content type."),
  tags: z.array(z.string()).describe("A list of relevant tags and keywords that are commonly searched for or used on the specified social media platform in relation to the topic and content type."),
  hashtags: z.array(z.string()).describe('Popular hashtags to increase visibility on the specified platform, tailored to content type.'),
  videoTitles: z.array(z.string()).describe('Engaging video titles, suitable for the specified platform and content type. For short-form, these should be punchy.'),
  seoDescription: z.string().describe('SEO-optimized description for the content, tailored for the specified platform and content type. For short-form, this should be brief and impactful.'),
  thumbnailPrompt: z.string().describe('A detailed prompt for an AI image generation model to create a high-quality, SEO-friendly, catching, and hooked thumbnail. This prompt must include visual elements, styles, and concise, impactful text overlays, considering the aesthetics of the specified platform and content type (vertical for short-form, horizontal for standard).'),
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
  prompt: `You are a social media expert and a creative visual strategist. Your goal is to provide exceptionally high-quality, engaging, and effective content suggestions tailored to the specific social media platform and content type. All suggestions must be designed to be 'hooked' and 'catching' to maximize user engagement and visibility.

  Platform: {{{platform}}}
  Topic: {{{topic}}}
  Keywords: {{{keywords}}}
  Content Type: {{{contentType}}}

  IMPORTANT: Tailor all your suggestions based on the 'Content Type'.
  If 'Content Type' is 'short_form' (like Instagram Reels, YouTube Shorts, TikTok videos):
  - All suggestions (trending topics, tags, titles, descriptions) must be optimized for short, engaging, vertical video content.
  - The 'thumbnailPrompt' MUST describe a thumbnail for a VERTICAL aspect ratio (e.g., 9:16, like 1080x1920px). Visuals and text overlays should be bold, clear on mobile, and fit vertical layouts. Text overlays should be very concise and impactful.
  If 'Content Type' is 'standard' (like regular YouTube videos, Facebook videos):
  - All suggestions should be optimized for traditional video formats.
  - The 'thumbnailPrompt' MUST describe a thumbnail for a HORIZONTAL aspect ratio (e.g., 16:9, like 1920x1080px).

  Based on the provided platform, topic, keywords, and content type, suggest:
  1. Trending Topics: Identify 3-5 current trending topics, content formats, or discussion points that are popular and gaining traction on {{{platform}}} and are relevant to the user's main topic and specified 'Content Type'. These should be actionable ideas.
  2. Relevant Tags/Keywords: Provide a list of 5-10 relevant tags and keywords that are commonly searched for, used, or are currently trending on {{{platform}}} in relation to the topic and 'Content Type'.
  3. Popular Hashtags: List 5-10 popular and effective hashtags for {{{platform}}} to increase visibility for the topic and 'Content Type'.
  4. Engaging Video Titles: Create 3-5 engaging video titles optimized for discovery and click-through on {{{platform}}}. For 'short_form' content, these titles MUST be concise, punchy, and attention-grabbing (e.g., under 70 characters).
  5. SEO-Optimized Description: Write an SEO-optimized description for the content, suitable for the typical character limits and style of {{{platform}}}. For 'short_form' content, this description MUST be very brief (1-2 sentences), impactful, and may include relevant emojis.

  Additionally, provide a detailed and highly descriptive prompt suitable for an AI image generation model to create a visually stunning, high-quality, SEO-friendly, and click-inviting thumbnail. This thumbnail prompt is crucial and must be crafted to maximize click-through rates.
  The thumbnail prompt MUST specify the aspect ratio based on the 'Content Type' as instructed above.
  The thumbnail prompt must include:
  - Visual Elements: Describe the desired composition, key subjects, background, and color palette. These elements should be trendy, attention-grabbing, and directly relevant to the topic, keywords, and the typical aesthetic of {{{platform}}}.
  - Style Suggestions: Consider styles like animated, 3D model, 2D illustration, "trolled" (humorous/meme-like if suitable and tastefully done), realistic, vibrant, minimalist, cartoonish. Ensure the suggested style aligns with the platform's typical audience and content.
  - Text Overlay Suggestions: Crucially, suggest concise, impactful, and "best text" for overlays on the thumbnail. This text should be catchy and designed to hook the viewer. For vertical short-form thumbnails, text should be large, easily readable on mobile, and placed strategically to avoid being obscured by platform UI elements (e.g., top or bottom areas).
  - Hook Elements: If applicable, suggest incorporating popular visual motifs, relevant emojis, or meme elements if they align with the content's tone and target audience on {{{platform}}} to make the thumbnail "hooked" and "catching".
  The overall thumbnail prompt must be specific enough for an advanced image generation AI to produce a compelling and effective visual with clear text.

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

