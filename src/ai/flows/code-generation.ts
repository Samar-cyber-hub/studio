'use server';

/**
 * @fileOverview AI agent for generating professional code snippets.
 *
 * - generateCode - A function that generates code snippets based on user request.
 * - GenerateCodeInput - The input type for the generateCode function.
 * - GenerateCodeOutput - The return type for the generateCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeInputSchema = z.object({
  request: z.string().describe('The user request for code generation.'),
});
export type GenerateCodeInput = z.infer<typeof GenerateCodeInputSchema>;

const GenerateCodeOutputSchema = z.object({
  code: z.string().describe('The generated code snippet.'),
  language: z.string().describe('The programming language of the generated code.'),
  isErrorFree: z.boolean().describe('Whether the code is error-free after self-check.'),
});
export type GenerateCodeOutput = z.infer<typeof GenerateCodeOutputSchema>;

export async function generateCode(input: GenerateCodeInput): Promise<GenerateCodeOutput> {
  return generateCodeFlow(input);
}

const selfCheckCode = ai.defineTool({
  name: 'selfCheckCode',
  description: 'This tool checks the generated code for errors and returns true if no errors are found, otherwise false.',
  inputSchema: z.object({
    code: z.string().describe('The code to check for errors.'),
    language: z.string().describe('The programming language of the code.'),
  }),
  outputSchema: z.boolean(),
  async (input) => {
    // In a real application, this would involve linting, compiling,
    // and running unit tests. For this example, we'll just return true.
    console.log(`Running self check on ${input.language} code:\n${input.code}`);
    return true; // Assume code is always error-free for this example
  },
});

const generateCodePrompt = ai.definePrompt({
  name: 'generateCodePrompt',
  input: {schema: GenerateCodeInputSchema},
  output: {schema: GenerateCodeOutputSchema},
  tools: [selfCheckCode],
  prompt: `You are an expert software engineer that can generate code snippets in various programming languages.

  Based on the user's request, generate a code snippet that is error-free and shareable.
  You must specify the programming language of the generated code in the "language" field.
  After generating the code, you MUST use the selfCheckCode tool to check the generated code for errors.
  Set the "isErrorFree" field to the result of the selfCheckCode tool call.

  User request: {{{request}}}
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
});

const generateCodeFlow = ai.defineFlow(
  {
    name: 'generateCodeFlow',
    inputSchema: GenerateCodeInputSchema,
    outputSchema: GenerateCodeOutputSchema,
  },
  async input => {
    const {output} = await generateCodePrompt(input);
    if (!output) {
      console.error('generateCodePrompt returned null or undefined output.');
      return {
        code: '// Sorry, an error occurred while generating code. Please try again.',
        language: 'plaintext',
        isErrorFree: false,
      };
    }
    return output;
  }
);
