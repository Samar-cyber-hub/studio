
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { generateStrongPassword, type GeneratePasswordInput, type GeneratePasswordOutput } from "@/ai/flows/password-generation-flow";
import { toast } from "@/hooks/use-toast";
import { Loader2, ClipboardCopy, History, ShieldCheck, ShieldAlert, Wand2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  description: z.string().min(10, { message: "Please describe your password needs in at least 10 characters." })
    .max(500, { message: "Description must be at most 500 characters." }),
  desiredLength: z.coerce.number()
    .positive({message: "Length must be a positive number."})
    .max(128, {message: "Length cannot exceed 128 characters."})
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

export function PasswordGenerationClient() {
  const [passwordOutput, setPasswordOutput] = useState<GeneratePasswordOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      desiredLength: undefined,
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setPasswordOutput(null);
    try {
      const input: GeneratePasswordInput = { 
        description: data.description,
        desiredLength: data.desiredLength,
      };
      const output = await generateStrongPassword(input);
      setPasswordOutput(output);
      toast({
        title: "Password Generated!",
        description: "A new strong password has been created for you.",
      });
    } catch (error) {
      console.error("Password generation error:", error);
      toast({
        title: "Error Generating Password",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
       setPasswordOutput({
        generatedPassword: "Error!CouldNotGenerate",
        strengthNotes: "An unexpected error occurred during password generation."
       });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (passwordOutput?.generatedPassword) {
      navigator.clipboard.writeText(passwordOutput.generatedPassword)
        .then(() => {
          toast({ title: "Copied!", description: "Password copied to clipboard." });
        })
        .catch(err => {
          console.error("Failed to copy password: ", err);
          toast({ title: "Copy Failed", description: "Could not copy password to clipboard.", variant: "destructive" });
        });
    }
  };

  const handleViewHistory = () => {
    toast({
      title: "Password History (Coming Soon!)",
      description: "This feature will allow you to see previously generated passwords. Stay tuned!",
    });
    // In a real app, this would open a modal or navigate to a history page.
    // For now, generated passwords are not stored.
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wand2 className="mr-2 h-6 w-6 text-primary" />
            Describe Your Password Needs🖥🔒🔑
          </CardTitle>
          <CardDescription>
            Tell the AI what kind of password you need. For example, specify its purpose, desired length, or if it should include uppercase, lowercase, numbers, and symbols.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'A very strong password for my main email, at least 16 characters, include all character types.' or 'Simple Wi-Fi password, 10 characters, letters and numbers only.'"
                        rows={4}
                        {...field}
                        className="min-h-[100px] resize-y"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="desiredLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Optional: Desired Length (max 128)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 16 (leave blank for AI default)" 
                        {...field} 
                        onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)} // Handle empty string to undefined
                        value={field.value ?? ''} // Ensure input is controlled with empty string for undefined
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 justify-start">
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Password
              </Button>
              <Button type="button" variant="outline" onClick={handleViewHistory} disabled={isLoading} size="lg">
                <History className="mr-2 h-4 w-4" />
                View History
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isLoading && (
        <Card className="flex flex-col items-center justify-center p-10 min-h-[200px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Generating your secure password...</p>
        </Card>
      )}

      {passwordOutput && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Your Generated Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg flex items-center justify-between gap-4">
              <code className="text-lg font-mono break-all flex-1 select-all">
                {passwordOutput.generatedPassword}
              </code>
              <Button variant="ghost" size="icon" onClick={handleCopyToClipboard} aria-label="Copy password">
                <ClipboardCopy className="h-5 w-5" />
              </Button>
            </div>
             <Alert variant={passwordOutput.generatedPassword.startsWith("Error!") ? "destructive" : "default"}>
              {passwordOutput.generatedPassword.startsWith("Error!") ? 
                <ShieldAlert className="h-4 w-4" /> : 
                <ShieldCheck className="h-4 w-4" />
              }
              <AlertTitle>{passwordOutput.generatedPassword.startsWith("Error!") ? "Generation Issue" : "Strength & Usage Notes"}</AlertTitle>
              <AlertDescription>
                {passwordOutput.strengthNotes}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
