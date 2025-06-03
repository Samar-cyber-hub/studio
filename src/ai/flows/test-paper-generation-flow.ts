
'use server';
/**
 * @fileOverview A Genkit flow for generating educational test papers and their solutions.
 *
 * - generateTestPaper - A function that generates a test paper and solution key.
 * - GenerateTestPaperInput - The input type for the generateTestPaper function.
 * - GenerateTestPaperOutput - The return type for the generateTestPaper function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTestPaperInputSchema = z.object({
  chapterName: z.string().min(1, "Chapter name cannot be empty.").describe("The name or topic of the chapter for the test."),
  className: z.string().min(1, "Class/Grade level cannot be empty.").describe("The class or grade level of the students (e.g., 'Grade 5', 'Class 10th', 'High School Biology')."),
  numberOfQuestions: z.number().int().positive().optional().describe("Optional: Specific number of questions desired. AI will decide if not provided (typically 10-20)."),
  questionTypes: z.array(z.string()).optional().describe("Optional: Preferred question types (e.g., ['MCQ', 'Short Answer', 'Essay']). AI will vary if not provided."),
});
export type GenerateTestPaperInput = z.infer<typeof GenerateTestPaperInputSchema>;

const GenerateTestPaperOutputSchema = z.object({
  testPaperTitle: z.string().describe("A suitable title for the test paper (e.g., 'Chapter 5: Cell Biology - Unit Test')."),
  testPaperMarkdown: z.string().describe("The full test paper content, formatted in Markdown. Should include clear question numbering and structure."),
  solutionKeyMarkdown: z.string().describe("The detailed solution key for the test paper, formatted in Markdown, corresponding to the question numbers."),
  suggestedDifficulty: z.string().describe("The AI's assessment of the test's difficulty level (e.g., 'Easy', 'Moderate', 'Challenging')."),
  estimatedTimeMinutes: z.number().describe("The AI's estimated time in minutes for students to complete the test."),
});
export type GenerateTestPaperOutput = z.infer<typeof GenerateTestPaperOutputSchema>;

export async function generateTestPaper(input: GenerateTestPaperInput): Promise<GenerateTestPaperOutput> {
  return generateTestPaperFlow(input);
}

const generateTestPaperPrompt = ai.definePrompt({
  name: 'generateTestPaperPrompt',
  input: {schema: GenerateTestPaperInputSchema},
  output: {schema: GenerateTestPaperOutputSchema},
  prompt: `You are an expert educator and curriculum designer. Your task is to generate a high-quality, professional test paper and its corresponding solution key.

User's Request:
Chapter/Topic: {{{chapterName}}}
Class/Grade Level: {{{className}}}
{{#if numberOfQuestions}}
Desired Number of Questions: {{numberOfQuestions}}
{{else}}
Number of Questions: Please generate a suitable number, typically between 10 to 20 questions, depending on the topic complexity and class level.
{{/if}}
{{#if questionTypes}}
Preferred Question Types: {{#each questionTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{else}}
Question Types: Please include a variety of question types appropriate for the subject and grade level (e.g., Multiple Choice Questions (MCQs), True/False, Fill-in-the-blanks, Short Answer Questions, Long Answer Questions, Problem-solving).
{{/if}}

Instructions:
1.  **Test Paper Title:** Create a clear and relevant title for the test paper (e.g., "Chapter 5: Cell Biology - Unit Test for {{{className}}}").
2.  **Test Paper Content:**
    *   Generate a comprehensive test paper covering the key concepts of the specified '{{{chapterName}}}' suitable for '{{{className}}}' students.
    *   If 'numberOfQuestions' is provided by the user, try to adhere to it. Otherwise, create a balanced test with a reasonable number of questions as indicated above.
    *   If 'questionTypes' are specified by the user, include them. Otherwise, include a variety of question types as suggested. For MCQs, provide 4 distinct options (A, B, C, D).
    *   Ensure questions are clear, unambiguous, and well-phrased.
    *   The test paper MUST be formatted in Markdown. Use headings (e.g., ## Questions), lists (e.g., 1., 2., A.), bold text for emphasis, and ensure proper spacing for readability.
3.  **Solution Key:**
    *   Provide a detailed and accurate solution key for ALL questions in the test paper.
    *   For MCQs, clearly state the correct option (e.g., "1. C) The Mitochondria").
    *   For other question types, answers should be comprehensive enough for a student or teacher to understand the correct response and reasoning.
    *   The solution key MUST also be formatted in Markdown, clearly corresponding to the question numbers in the test paper (e.g., ## Solution Key, 1. Answer details...).
4.  **Difficulty and Time:**
    *   Assess the overall difficulty of the generated test paper (e.g., 'Easy', 'Moderate', 'Challenging').
    *   Estimate the time (in minutes) that an average student of the specified class level would need to complete the test.

Output Fields (ensure your entire response is a single JSON object matching this structure):
- testPaperTitle: (string) The title.
- testPaperMarkdown: (string) The Markdown content of the test paper.
- solutionKeyMarkdown: (string) The Markdown content of the solution key.
- suggestedDifficulty: (string) Your assessment of the difficulty.
- estimatedTimeMinutes: (number) Your estimated completion time in minutes.

Ensure the language and complexity are appropriate for the '{{{className}}}'.
The content should be educational and suitable for a school testing environment.
Do not include any preamble or conversational text in your response; only the JSON output is required.
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
       {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      }
    ],
    temperature: 0.6, // Slightly lower temperature for more deterministic educational content
  },
});

const generateTestPaperFlow = ai.defineFlow(
  {
    name: 'generateTestPaperFlow',
    inputSchema: GenerateTestPaperInputSchema,
    outputSchema: GenerateTestPaperOutputSchema,
  },
  async (input) => {
    const {output} = await generateTestPaperPrompt(input);
    if (!output) {
      throw new Error("AI failed to generate test paper content.");
    }
    return output;
  }
);

    