"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CodeBlock } from "@/components/common/code-block";
import { generateCode, type GenerateCodeInput, type GenerateCodeOutput } from "@/ai/flows/code-generation";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  request: z.string().min(10, { message: "Please describe your code request in at least 10 characters." }),
});

type FormData = z.infer<typeof formSchema>;

export function CodeGenerationClient() {
  const [generatedCode, setGeneratedCode] = useState<GenerateCodeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      request: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setGeneratedCode(null);
    try {
      const input: GenerateCodeInput = { request: data.request };
      const output = await generateCode(input);
      setGeneratedCode(output);
      toast({
        title: "Code Generated!",
        description: `Generated ${output.language} code. Self-check: ${output.isErrorFree ? 'Passed' : 'Issues found'}.`,
      });
    } catch (error) {
      console.error("Code generation error:", error);
      toast({
        title: "Error Generating Code",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Request Code Snippet</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="request"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Describe what code you need</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'A Python function to sort a list of dictionaries by a specific key', or 'React component for a countdown timer'"
                        rows={5}
                        {...field}
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Code
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {generatedCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Generated Code
              {generatedCode.isErrorFree ? (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  <CheckCircle2 className="mr-1 h-4 w-4" /> Self-Check Passed
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="mr-1 h-4 w-4" /> Self-Check Issues
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock language={generatedCode.language} code={generatedCode.code} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
