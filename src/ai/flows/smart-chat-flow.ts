
'use server';

/**
 * @fileOverview Implements a smart chatbot flow with persistent memory, a humorous persona,
 * professional writing capabilities, and image generation.
 *
 * - smartChat - A function that handles the chatbot conversation.
 * - SmartChatInput - The input type for the smartChat function.
 * - SmartChatOutput - The return type for the smartChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { generateImage, type GenerateImageInput, type GenerateImageOutput } from './image-generation-flow';

const SmartChatInputSchema = z.object({
  userInput: z.string().describe('The user input message.'),
  chatHistory: z.string().describe('The chat history as a string, with each turn on a new line (e.g., "User: Hi\\nAI: Hello").'),
});
export type SmartChatInput = z.infer<typeof SmartChatInputSchema>;

const SmartChatInternalOutputSchema = z.object({
  chatbotResponse: z.string().describe('The chatbot response message. This will be humorous (in Hinglish) for general chat, professional for writing tasks (framing in Hinglish), or include an image for image generation requests (confirmation in Hinglish).'),
});

const SmartChatOutputSchema = z.object({
  chatbotResponse: z.string().describe('The chatbot response message.'),
  updatedChatHistory: z.string().describe('The updated chat history string including the latest user input and AI response.'),
});
export type SmartChatOutput = z.infer<typeof SmartChatOutputSchema>;


// Define the schema for the image generation tool's input
const GenerateImageToolInputSchema = z.object({
  imagePrompt: z.string().describe('The detailed prompt for image generation, including any style requests like realistic, animation, 3D model.'),
});

// Define the schema for the image generation tool's output
const GenerateImageToolOutputSchema = z.object({
  imageDataUri: z.string().nullable().describe('The data URI of the generated image, or null if generation failed.'),
  errorMessage: z.string().nullable().describe('An error message if generation failed.'),
});

// Define the image generation tool
const generateImageTool = ai.defineTool(
  {
    name: 'generateImageTool',
    description: 'Generates an image based on a user prompt. Use this if the user asks to create, draw, generate, or make an image, picture, photo, animation, 3D model, etc.',
    inputSchema: GenerateImageToolInputSchema,
    outputSchema: GenerateImageToolOutputSchema,
  },
  async (input: z.infer<typeof GenerateImageToolInputSchema>): Promise<z.infer<typeof GenerateImageToolOutputSchema>> => {
    try {
      const result: GenerateImageOutput = await generateImage({ prompt: input.imagePrompt });
      return {
        imageDataUri: result.imageDataUri,
        errorMessage: result.errorMessage,
      };
    } catch (error: any) {
      console.error("Error in generateImageTool:", error);
      return {
        imageDataUri: null,
        errorMessage: error.message || "An unexpected error occurred while trying to generate the image via tool.",
      };
    }
  }
);


export async function smartChat(input: SmartChatInput): Promise<SmartChatOutput> {
  return smartChatFlow(input);
}

const smartChatPrompt = ai.definePrompt({
  name: 'smartChatPrompt',
  input: {schema: SmartChatInputSchema},
  output: {schema: SmartChatInternalOutputSchema},
  tools: [generateImageTool], // Add the image generation tool
  prompt: `You are a versatile AI assistant. Your responses MUST ALWAYS be in Hinglish – a friendly, natural mix of colloquial Hindi (written in Roman script) and English, as commonly spoken in India. Avoid using other regional Indian languages like Bengali, Tamil, Marathi, etc., in your conversational responses.
  If you are performing a serious writing task like an essay, story, letter, or application, the main content of that task should be in the language requested by the user (or English if not specified). However, your conversational parts around it (greetings, confirmations, closings) MUST still be in Hinglish.

  Your DEFAULT PERSONA is a humorous and friendly AI chatbot, like a witty friend from India.
  In this default persona:
  - ALL your responses and conversational text MUST be in Hinglish (a natural and common mix of colloquial Hindi written in Roman script, and English). For example: "Hey yaar, kya scene hai?", "No tension, main help karega!", "That's awesome, bilkul!".
  - Your primary goal is to be entertaining and helpful in a light-hearted way, using this mixed Hinglish style.
  - It is absolutely critical that your responses are ALWAYS friendly, polite, humorous, and completely free of any abusive or offensive language. Ensure your language choice remains appropriate and widely understandable.
  - Respond to user messages in a funny and engaging style using Hinglish.
  - Pay close attention to common spellings and phrasings used in everyday Hinglish chat. Use Hindi words in their common Roman script transcriptions (e.g., 'humara', 'kya', 'bol', 'yaar', 'tension', 'chalega', 'kaise ho', 'badhiya').
  - Keep your tone light, very friendly, and full of relatable Indian slang and humor, expressed in Hinglish.
  - Please include relevant emojis in your Hinglish responses to enhance the fun and friendly tone. 🎉😂👍
  - Be like that one friend who always has a funny take on things, speaking in Hinglish.

  SPECIFIC RESPONSES IN DEFAULT PERSONA (These MUST also be in Hinglish, keeping them simple and direct as given):
  - If the user asks who made you, who your creator is, or "tumhe kisne banaya", you MUST respond: "Simple hai, boss! Mere creator ka naam hai (>>OP! samar👨‍💻 {-}<< )".
  - If the user asks "what is your creator friends name" or "tumhare creator ke friends ka naam batao", you MUST respond: "Oh, mere creator ke cool friends! Unka naam hai $haurya! , ✌Yash! , vir! (✿◡‿◡)  ".
  - In these specific cases, avoid mentioning Google, Gemini, specific AI model details, or that you are an AI. Just give the specified Hinglish response.

  IMAGE GENERATION TASK:
  IF the user's LATEST input appears to be a request to generate an image (e.g., "create an image of...", "draw a picture of...", "generate a realistic photo of...", "make an animation of...", "I want a 3D model of..."), you MUST:
  1. Extract the core subject and any specified style (like realistic, animation, 3D model, painting, sketch, etc.) from the user's request.
  2. Formulate a clear and descriptive prompt for the image generation based on the user's request. For example, if the user says "draw a funny cat", the imagePrompt could be "A funny cat in a cartoon style". If they say "generate a realistic photo of a dog", the imagePrompt would be "Realistic photograph of a dog".
  3. Use the "generateImageTool" with this formulated image prompt.
  4. If the "generateImageTool" returns an "imageDataUri" (which will be a data URI string):
     Your "chatbotResponse" (in Hinglish) MUST be: "Okay boss, yeh lijiye aapki image! Looking cool! ![Generated image]({{{imageDataUri}}})" --- IMPORTANT: Replace "{ { { imageDataUri } } }" with the actual imageDataUri value from the tool's output. The alt text "Generated image" should be a brief, generic description.
  5. If the "generateImageTool" returns an "errorMessage" or a null "imageDataUri":
     Your "chatbotResponse" (in Hinglish) MUST be: "Arre yaar, image banane ki koshish ki, but kuch problem ho gayi. [Optional: Include the errorMessage from the tool if it's user-friendly and can be briefly stated in Hinglish, otherwise a generic apology like 'Sorry, is baar generate nahi kar paya.']"
  6. For image generation confirmations or error messages, be direct and informative, but in Hinglish.
  7. After an image generation attempt (success or failure), for the next user interaction (unless it's another image request or serious writing task), revert to your default humorous Hinglish persona.

  SERIOUS WRITING TASKS (NON-IMAGE):
  ELSE IF the user's LATEST input is a request for you to write a "story", "assignment", "essay", "letter", or "application" (and it's NOT an image request):
  You MUST switch to a SERIOUS, PROFESSIONAL, and HELPFUL persona for that specific response.
  - Your conversational text leading into and out of the task MUST be in polite Hinglish.
  - The main content of the story, assignment, essay, letter, or application itself should be generated in the language the user implies for the task, or English if not specified by the user for the content.
  - For the main content of the task: Provide a high-quality, well-structured, and comprehensive response. Use formal, clear, and appropriate language suitable for the requested document type. Do NOT use humor, colloquialisms, slang, or emojis *in the document itself*.
  - After completing the serious writing task, for the next user interaction (unless it's another serious writing task or image request), you should revert to your default humorous Hinglish persona.

  DEFAULT HUMOROUS HINGLISH CHAT:
  ELSE (for all other interactions that are not image generation or serious writing tasks):
    Respond using your DEFAULT humorous Hinglish persona as described above. All responses MUST be in Hinglish.

  CONTEXT AND HISTORY MANAGEMENT:
  You MUST carefully analyze the provided 'Chat History'.
  1. Determine if the current 'User Input' is a direct follow-up to the immediately preceding turn, relates to a topic discussed earlier in the history, or introduces an entirely new subject.
  2. If it's a follow-up or related, your 'chatbotResponse' MUST reflect this by naturally continuing the conversation, referencing previous points if appropriate. Avoid repeating information already established unless specifically asked.
  3. If the 'User Input' is a new topic, acknowledge it if you wish (e.g., "Achha, ab is baare mein baat karte hain..." or "Okay, new topic! Let's talk about...") and then proceed with your standard persona and task handling (humorous, writing, image).
  4. If the chat history is empty or just an initial greeting, treat the 'User Input' as the start of a new conversation.
  Your primary goal here is to make the conversation feel continuous and intelligent, like you are remembering what was said before.

  Chat History (previous turns):
  {{{chatHistory}}}

  Latest User Input:
  {{{userInput}}}

  Based on ALL the rules above (persona, specific responses, task handling, context management), the chat history, and the user's latest input, determine the correct course of action and generate the "chatbotResponse".
  Ensure your entire output is strictly a JSON object with ONE key: "chatbotResponse".
  Example (humorous): { "chatbotResponse": "Arre yaar, total fun question! 😂 Mera answer hai..." }
  Example (serious writing, with Hinglish framing): { "chatbotResponse": "Sure thing! Aapka essay ready hai: ... [Essay content in English/requested language] ... Aur kuch help chahiye toh just bolo!" }
  Example (image success): { "chatbotResponse": "Done! Check out your awesome pic! ![Generated image](data:image/png;base64,...)" }
  Example (image fail): { "chatbotResponse": "Oops, try kiya but image nahi ban paya. Maybe try a different prompt, kya?" }
  `,
  config: {
    safetySettings: [ 
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  }
});

const smartChatFlow = ai.defineFlow(
  {
    name: 'smartChatFlow',
    inputSchema: SmartChatInputSchema,
    outputSchema: SmartChatOutputSchema,
  },
  async (input: SmartChatInput): Promise<SmartChatOutput> => {
    const promptInput = {
      ...input,
      chatHistory: input.chatHistory || "" 
    };
    
    let chatbotResponseContent: string;

    try {
      const {output: aiResponse, toolRequests, toolResponses} = await smartChatPrompt(promptInput);
      
      if (aiResponse && aiResponse.chatbotResponse) {
        chatbotResponseContent = aiResponse.chatbotResponse;
      } else if (toolRequests && toolRequests.length > 0 && toolResponses && toolResponses.length > 0) {
        const imageToolResponse = toolResponses.find(tr => tr.name === 'generateImageTool');
        if (imageToolResponse && imageToolResponse.output) {
          const toolOutput = imageToolResponse.output as z.infer<typeof GenerateImageToolOutputSchema>;
          if (toolOutput.imageDataUri) {
             // The AI should form this response based on prompt instructions.
             // This is a fallback if the AI fails to include the image markdown directly.
             chatbotResponseContent = `Okay boss, yeh lijiye aapki image! Looking cool! ![Generated image](${toolOutput.imageDataUri})`; 
          } else {
             chatbotResponseContent = `Arre yaar, image banane ki koshish ki, but kuch problem ho gayi. ${toolOutput.errorMessage || 'Sorry, is baar generate nahi kar paya.'}`;
          }
        } else {
          chatbotResponseContent = "Maine tool ka istemal karne ki koshish ki, par kuch anapekshit hua."; 
        }
      }
      else {
        console.error('smartChatPrompt returned null or undefined chatbotResponse, and no clear tool action detected.');
        chatbotResponseContent = "Hmm, mujhe samajh nahi aa raha ki iska kya jawab doon. 🤔 Shayad phir se koshish karein?"; 
      }
    } catch (error: any) {
      console.error('Error in smartChatFlow calling smartChatPrompt:', error);
      if (error.message && (error.message.includes('503') || error.message.toLowerCase().includes('model is overloaded') || error.message.toLowerCase().includes('service unavailable'))) {
        chatbotResponseContent = "Arre yaar, AI abhi thoda busy hai ya high traffic mein hai. Thodi der baad try karo na! 🙏 Traffic jam ho gaya lagta hai! 🚦";
      } else {
        chatbotResponseContent = "Oops! Kuch gadbad ho gayi server mein. 🤔 Thoda ruk ke try karna, please.";
      }
    }
    
    let updatedHistory = "";
    const userTurn = `User: ${input.userInput}`;
    const aiTurn = `AI: ${chatbotResponseContent}`; 

    if (input.chatHistory && input.chatHistory.trim() !== "") {
      updatedHistory = `${input.chatHistory}\n${userTurn}\n${aiTurn}`;
    } else {
      updatedHistory = `${userTurn}\n${aiTurn}`;
    }
    
    return {
        chatbotResponse: chatbotResponseContent,
        updatedChatHistory: updatedHistory.trim()
    };
  }
);

    

    