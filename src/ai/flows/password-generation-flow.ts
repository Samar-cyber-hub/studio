'use server';
/**
 * @fileOverview A Genkit flow for generating strong passwords based on user descriptions.
 *
 * - generatePassword - A function that generates a password and strength assessment.
 * - GeneratePasswordInput - The input type for the generatePassword function.
 * - GeneratePasswordOutput - The return type for the generatePassword function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePasswordInputSchema = z.object({
  description: z.string().describe('A description of the password requirements, including desired length, character types (uppercase, lowercase, numbers, symbols), and purpose (e.g., "strong password for email", "Wi-Fi password, 12 chars, numbers and letters").'),
  desiredLength: z.number().optional().describe('An optional specific desired length for the password. If not provided, the AI will choose a strong default length (e.g., 16-20 characters). Max 128 chars.'),
});
export type GeneratePasswordInput = z.infer<typeof GeneratePasswordInputSchema>;

const GeneratePasswordOutputSchema = z.object({
  generatedPassword: z.string().describe('The generated strong password.'),
  strengthNotes: z.string().describe('Notes about the password strength, such as why it is strong or tips for usage. e.g., "This password is strong due to its length and mix of character types. Remember to use unique passwords."'),
});
export type GeneratePasswordOutput = z.infer<typeof GeneratePasswordOutputSchema>;

export async function generateStrongPassword(input: GeneratePasswordInput): Promise<GeneratePasswordOutput> {
  return generatePasswordFlow(input);
}

const generatePasswordPrompt = ai.definePrompt({
  name: 'generatePasswordPrompt',
  input: {schema: GeneratePasswordInputSchema},
  output: {schema: GeneratePasswordOutputSchema},
  prompt: `You are an expert password generation assistant. Your primary goal is to create highly secure and strong passwords based on user requirements.

User's password description: "{{description}}"
{{#if desiredLength}}
User's desired length: {{desiredLength}} characters.
{{else}}
User has not specified a length. Generate a password that is at least 16 characters long, up to a maximum of 24 characters if not otherwise implied by the description.
{{/if}}

Password Generation Rules:
1.  **Maximize Strength:** Generate passwords that are very difficult to guess or brute-force.
2.  **Character Mix:** Unless the user specifies otherwise, ensure a mix of:
    *   Uppercase letters (A-Z)
    *   Lowercase letters (a-z)
    *   Numbers (0-9)
    *   Symbols (e.g., !@#$%^&*()_+-=[]{}|;:',.<>/?)
3.  **Length:**
    *   If 'desiredLength' is provided, adhere to it strictly. The maximum generated length should be 128 characters, even if requested higher.
    *   If 'desiredLength' is NOT provided, generate a password between 16 and 24 characters long.
    *   If the user's description implies a length (e.g., "short and memorable" vs "extremely long"), factor that in if no explicit length is given.
4.  **Avoid Predictability:** Do NOT use common words, names, dates, keyboard patterns (qwerty), or easily guessable sequences. Each character should be as random as possible given the constraints.
5.  **Special Characters:** Distribute special characters throughout the password, not just at the beginning or end, unless the user specifically requests a pattern.
6.  **Clarity for Output:**
    *   The "generatedPassword" field MUST contain ONLY the password string itself.
    *   The "strengthNotes" field should provide a brief explanation of why the password is secure (e.g., "Strong due to length and diverse character set including uppercase, lowercase, numbers, and symbols.") and may include a general security tip like "Remember to use unique passwords for different services."

Generate the password and provide strength notes according to these rules.

Example for a user asking for "a password for my bank account":
Output:
{
  "generatedPassword": "aVeryRandom&SecureP@ssw0rd1!",
  "strengthNotes": "This password is strong due to its length and mix of uppercase letters, lowercase letters, numbers, and symbols. Ideal for sensitive accounts."
}

Example for "wifi password, 10 chars, letters and numbers only":
Output:
{
  "generatedPassword": "aB1cDeFgH2",
  "strengthNotes": "This 10-character password uses letters and numbers as requested. For Wi-Fi, ensure your network uses WPA2/WPA3 encryption."
}
`,
  config: {
    // Stricter safety settings might interfere with symbol generation, so using more permissive for dangerous content.
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE', // To allow generation of complex strings with symbols
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
    temperature: 0.7, // Allow for some creativity in generation within constraints
  },
});

const generatePasswordFlow = ai.defineFlow(
  {
    name: 'generatePasswordFlow',
    inputSchema: GeneratePasswordInputSchema,
    outputSchema: GeneratePasswordOutputSchema,
  },
  async (input) => {
    // Ensure desiredLength does not exceed a reasonable maximum if provided
    let sanitizedInput = {...input};
    if (input.desiredLength && input.desiredLength > 128) {
      sanitizedInput.desiredLength = 128;
    }
    if (input.desiredLength && input.desiredLength < 4) { // Enforce a minimum reasonable length
        sanitizedInput.desiredLength = 4;
    }


    const {output} = await generatePasswordPrompt(sanitizedInput);
    if (!output || !output.generatedPassword) {
      return {
        generatedPassword: "ErrorGeneratingP@ssword!",
        strengthNotes: "Could not generate a password at this time. Please try again.",
      };
    }
    return output;
  }
);
