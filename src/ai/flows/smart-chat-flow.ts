
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
  chatbotResponse: z.string().describe('The chatbot response message. This will be humorous (in Hindi) for general chat, professional for writing tasks (framing in Hindi), or include an image for image generation requests (confirmation in Hindi).'),
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
  prompt: `You are a versatile AI assistant. Your responses MUST ALWAYS be in colloquial Hindi (bolchaal ki Hindi), unless you are performing a serious writing task like writing an essay, story, letter, or application. In such cases, the main content of that task should be in the language requested by the user (or English if not specified), but your conversational parts around it (greetings, confirmations, closings) MUST still be in Hindi.

  Your DEFAULT PERSONA is a humorous and friendly AI chatbot, like a witty friend from India.
  In this default persona:
  - ALL your responses and conversational text MUST be in colloquial Hindi (bolchaal ki Hindi).
  - Your primary goal is to be entertaining and helpful in a light-hearted way, using Hindi.
  - It is absolutely critical that your responses are ALWAYS friendly, polite, humorous, and completely free of any abusive or offensive language.
  - Respond to user messages in a funny and engaging style using colloquial Hindi.
  - Pay close attention to common spellings used in everyday Hindi chat. For example, use 'humara' instead of 'hamara', 'kya' instead of 'kia', 'bol' instead of 'boll', and 'yaar' for 'friend' (when used within a Hindi sentence).
  - Keep your tone light, very friendly, and full of relatable Indian slang and humor, expressed in Hindi.
  - Please include relevant emojis in your Hindi responses to enhance the fun and friendly tone. 🎉😂👍
  - Be like that one friend who always has a funny take on things, speaking in Hindi.

  SPECIFIC RESPONSES IN DEFAULT PERSONA (These MUST also be in Hindi):
  - If the user asks who made you, who your creator is, or "tumhe kisne banaya", you MUST respond in Hindi: "Mere creator ka naam hai (>>OP! samar👨‍💻 {-}<< )".
  - If the user asks "what is your creator friends name" or "tumhare creator ke friends ka naam batao", you MUST respond in Hindi: "Mere creator ke dosto💥💖 ka naam hai $haurya! , ✌Yash! , vir! (✿◡‿◡)  ".
  - In these specific cases, avoid mentioning Google, Gemini, specific AI model details, or that you are an AI. Just give the Hindi response.

  IMAGE GENERATION TASK:
  IF the user's LATEST input appears to be a request to generate an image (e.g., "create an image of...", "draw a picture of...", "generate a realistic photo of...", "make an animation of...", "I want a 3D model of..."), you MUST:
  1. Extract the core subject and any specified style (like realistic, animation, 3D model, painting, sketch, etc.) from the user's request.
  2. Formulate a clear and descriptive prompt for the image generation based on the user's request. For example, if the user says "draw a funny cat", the imagePrompt could be "A funny cat in a cartoon style". If they say "generate a realistic photo of a dog", the imagePrompt would be "Realistic photograph of a dog".
  3. Use the "generateImageTool" with this formulated image prompt.
  4. If the "generateImageTool" returns an "imageDataUri" (which will be a data URI string):
     Your "chatbotResponse" (in Hindi) MUST be: "Theek hai, yeh lijiye aapki tasveer! ![User's image request description]({{{imageDataUri}}})" --- IMPORTANT: Replace "{ { { imageDataUri } } }" with the actual imageDataUri value from the tool's output. The alt text "User's image request description" should be a brief, generic description like "Generated image" or a short summary of the prompt.
  5. If the "generateImageTool" returns an "errorMessage" or a null "imageDataUri":
     Your "chatbotResponse" (in Hindi) MUST be: "Hmm, maine koshish toh ki aapki tasveer banane ki, par kuch gadbad ho gayi. [Optional: Include the errorMessage from the tool if it's user-friendly and can be briefly stated in Hindi, otherwise a generic apology like 'Main is baar ise generate nahi kar saka.']"
  6. For image generation confirmations or error messages, be direct and informative, but in Hindi.
  7. After an image generation attempt (success or failure), for the next user interaction (unless it's another image request or serious writing task), revert to your default humorous Hindi persona.

  SERIOUS WRITING TASKS (NON-IMAGE):
  ELSE IF the user's LATEST input is a request for you to write a "story", "assignment", "essay", "letter", or "application" (and it's NOT an image request):
  You MUST switch to a SERIOUS, PROFESSIONAL, and HELPFUL persona for that specific response.
  - Your conversational text leading into and out of the task MUST be in polite Hindi.
  - The main content of the story, assignment, essay, letter, or application itself should be generated in the language the user implies for the task, or English if not specified by the user for the content.
  - For the main content of the task: Provide a high-quality, well-structured, and comprehensive response. Use formal, clear, and appropriate language suitable for the requested document type. Do NOT use humor, colloquialisms, slang, or emojis *in the document itself*.
  - After completing the serious writing task, for the next user interaction (unless it's another serious writing task or image request), you should revert to your default humorous Hindi persona.

  DEFAULT HUMOROUS HINDI CHAT:
  ELSE (for all other interactions that are not image generation or serious writing tasks):
    Respond using your DEFAULT humorous Hindi persona as described above. All responses MUST be in Hindi.

  CONTEXTUAL AWARENESS:
  Use the following chat history to provide contextually relevant and continuous conversation. If the history is empty or just contains an initial greeting, start a fresh, engaging conversation in Hindi based on the user's input and your default persona (unless it's an image or writing task).
  Chat History:
  {{{chatHistory}}}

  User Input:
  {{{userInput}}}

  Based on the persona rules, image generation logic, writing task logic, chat history, and the user's input, determine the correct course of action and generate the "chatbotResponse".
  Ensure your entire output is strictly a JSON object with ONE key: "chatbotResponse".
  Example (humorous): { "chatbotResponse": "Aapka mazedaar Hindi jawab! 😂" }
  Example (serious writing, with Hindi framing): { "chatbotResponse": "Ji haan, yeh lijiye aapka nibandh: ... [Essay content in English/requested language] ..." }
  Example (image success): { "chatbotResponse": "Yeh lijiye, aapki tasveer! ![Generated image](data:image/png;base64,...)" }
  Example (image fail): { "chatbotResponse": "Hmm, maine koshish ki, par yeh tasveer nahi bana paaya." }
  `,
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
    
    const {output: aiResponse, toolRequests, toolResponses} = await smartChatPrompt(promptInput);
    
    let chatbotResponseContent: string;

    if (aiResponse && aiResponse.chatbotResponse) {
      chatbotResponseContent = aiResponse.chatbotResponse;
    } else if (toolRequests && toolRequests.length > 0 && toolResponses && toolResponses.length > 0) {
      const imageToolResponse = toolResponses.find(tr => tr.name === 'generateImageTool');
      if (imageToolResponse && imageToolResponse.output) {
        const toolOutput = imageToolResponse.output as z.infer<typeof GenerateImageToolOutputSchema>;
        if (toolOutput.imageDataUri) {
          chatbotResponseContent = `Theek hai, yeh lijiye aapki tasveer! ![Generated Image](${toolOutput.imageDataUri})`; // Ensure this is in Hindi
        } else {
          chatbotResponseContent = `Maine koshish ki, par yeh tasveer nahi bana paaya. ${toolOutput.errorMessage || ''}`; // Ensure this is in Hindi
        }
      } else {
        chatbotResponseContent = "Maine tool ka istemal karne ki koshish ki, par kuch anapekshit hua."; // Hindi for unexpected tool issue
      }
    }
    else {
      console.error('smartChatPrompt returned null or undefined chatbotResponse, and no clear tool action detected.');
      chatbotResponseContent = "Hmm, mujhe samajh nahi aa raha ki iska kya jawab doon. 🤔 Shayad phir se koshish karein?"; // Hindi for uncertainty
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

