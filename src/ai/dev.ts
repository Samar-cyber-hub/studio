
import { config } from 'dotenv';
config();

import '@/ai/flows/code-generation.ts';
import '@/ai/flows/smart-chat-flow.ts'; // Updated from persistent-memory-chat and removed humorous-chat
import '@/ai/flows/social-media-optimization.ts';
// import '@/ai/flows/ai-media-generation.ts'; // Removed as feature is deleted
import '@/ai/flows/image-generation-flow.ts'; // Added new image generation flow
import '@/ai/flows/logo-generation-flow.ts'; // Added new logo generation flow
import '@/ai/flows/password-generation-flow.ts'; // Added new password generation flow
import '@/ai/flows/animation-generation-flow.ts'; // Added new animation concept generation flow
import '@/ai/flows/url-shortener-flow.ts'; // Added new URL shortener flow
import '@/ai/flows/test-paper-generation-flow.ts'; // Added new Test Paper Generation flow


    