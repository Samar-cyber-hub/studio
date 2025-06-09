
'use server';
/**
 * @fileOverview Solves questions from images, suggests similar ones, and explains humorously.
 *
 * - solveQuestionFromImage - The main function.
 * - SolveQuestionFromImageInput - Input type.
 * - SolveQuestionFromImageOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Internal Zod schema, not exported directly
const SolveQuestionFromImageInputSchemaInternal = z.object({
  imageDataUri: z.string().describe(
    "A data URI of the image containing the question. Format: 'data:image/jpeg;base64,...' or 'data:image/png;base64,...'."
  ),
  userInstructions: z.string().optional().describe(
    "Optional user instructions for the tone or style of the explanation (e.g., 'explain it like I'm 5', 'make it super sarcastic'). Defaults to generally simple and humorous."
  ),
});
// Exported TypeScript type
export type SolveQuestionFromImageInput = z.infer<typeof SolveQuestionFromImageInputSchemaInternal>;

// Internal Zod schema, not exported directly
const SolveQuestionFromImageOutputSchemaInternal = z.object({
  identifiedQuestion: z.string().describe("The question identified by the AI from the image. If no question is found, this will indicate that."),
  solvedSolution: z.string().describe("The step-by-step solution to the identified question. If no question is solvable, this will explain why."),
  similarQuestions: z.array(z.string()).optional().describe("An array of 2-3 similar questions to help practice the concept. May be empty if not applicable."),
  humorousExplanation: z.string().describe("A simple and humorous explanation of the original question and its solution. If no question is solvable, this might humorously address the input."),
});
// Exported TypeScript type
export type SolveQuestionFromImageOutput = z.infer<typeof SolveQuestionFromImageOutputSchemaInternal>;

export async function solveQuestionFromImage(input: SolveQuestionFromImageInput): Promise<SolveQuestionFromImageOutput> {
  return solveQuestionFromImageFlow(input);
}

const solveQuestionFromImageFlow = ai.defineFlow(
  {
    name: 'solveQuestionFromImageFlow',
    inputSchema: SolveQuestionFromImageInputSchemaInternal, // Use internal schema
    outputSchema: SolveQuestionFromImageOutputSchemaInternal, // Use internal schema
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: [
        { media: { url: input.imageDataUri } },
        { text: `You are an AI assistant that's expert at understanding and solving questions from images, and then explaining them in a fun, simple, and humorous way.

        Analyze the image provided. Your primary goal is to identify a question within it, solve it, and then provide helpful and entertaining surrounding content.

        Your tasks are:
        1.  **Identify the Question:** Carefully examine the image. What is the main question being asked? Transcribe it accurately. If the image is unclear, contains no discernible question, or is inappropriate, clearly state this in the 'identifiedQuestion' field (e.g., "No clear question found in the image.").
        2.  **Solve the Question:** If a solvable question is identified, provide a clear, accurate, step-by-step solution. If the question is unanswerable (e.g., too vague, requires external non-general knowledge, or no question was found), explain why in the 'solvedSolution' field.
        3.  **Suggest Similar Questions:** If a question was solved, generate 2 or 3 new practice questions that are similar in concept or type to the original one. If no question was solved or it's not applicable, this array can be empty or contain a note like "No similar questions applicable."
        4.  **Explain Humorously:** Explain the original question and its solution (if solved) in very simple terms. ${input.userInstructions ? `Follow these specific user instructions for the tone: "${input.userInstructions}".` : "Make the explanation light-hearted, engaging, and humorous. Use simple language, relatable analogies, and maybe a gentle, appropriate joke. The goal is to make learning fun and easy to understand."} If no question was solved, you can humorously comment on the image or situation, while remaining helpful.

        Format your entire response as a single JSON object matching the output schema precisely.
        Example for a math problem "2+2=?":
        {
          "identifiedQuestion": "What is 2+2?",
          "solvedSolution": "Step 1: Start with the number 2.\nStep 2: Add another 2 to it.\nStep 3: The sum is 4.",
          "similarQuestions": ["What is 3+3?", "If you have 2 apples and get 2 more, how many apples do you have?"],
          "humorousExplanation": "Alright, so the image is asking for '2+2'. Imagine you have two super cool cookies, and then BAM! Someone gives you two MORE super cool cookies. How many cookies do you have now? Four! That's all there is to it. You're basically a cookie millionaire. Go you!"
        }
        Example if no question found:
        {
            "identifiedQuestion": "No clear question found in the image. It appears to be a picture of a cat.",
            "solvedSolution": "Cannot solve as no question was identified.",
            "similarQuestions": [],
            "humorousExplanation": "Well, this is awkward! I was all geared up to solve a brain-buster, but it looks like you've sent me a picture of a very fluffy cat. While I can't solve 'cat' for 'x', I can tell you it's probably plotting world domination... or just wants a nap. Mostly naps."
        }`
        },
      ],
      output: { schema: SolveQuestionFromImageOutputSchemaInternal }, // Use internal schema
      config: {
        temperature: 0.5, // Keep it somewhat deterministic for solutions, but allow humor.
         safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      },
    });
    if (!output) {
      throw new Error("The AI failed to generate a response for the photo question. The output was empty.");
    }
    return output;
  }
);

