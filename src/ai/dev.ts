import { config } from 'dotenv';
config();

import '@/ai/flows/code-generation.ts';
import '@/ai/flows/smart-chat-flow.ts'; // Updated from persistent-memory-chat and removed humorous-chat
import '@/ai/flows/social-media-optimization.ts';
// import '@/ai/flows/ai-media-generation.ts'; // Removed as feature is deleted
