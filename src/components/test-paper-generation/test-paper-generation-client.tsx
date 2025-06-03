
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription as UiCardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/common/code-block";

import { generateTestPaper, type GenerateTestPaperInput, type GenerateTestPaperOutput, type Difficulty } from "@/ai/flows/test-paper-generation-flow";
import { toast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, ClipboardList, Download, ClipboardCopy, Share2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const difficultyLevels: { label: string; value: Difficulty | "AI_Decides" }[] = [
  { label: "Let AI Decide", value: "AI_Decides" },
  { label: "Easy", value: "Easy" },
  { label: "Medium", value: "Medium" },
  { label: "Hard", value: "Hard" },
];

const formSchema = z.object({
  chapterName: z.string().min(3, { message: "Chapter name must be at least 3 characters." })
    .max(100, { message: "Chapter name must be at most 100 characters." }),
  className: z.string().min(1, { message: "Class/Grade level must be provided." })
    .max(50, { message: "Class/Grade level must be at most 50 characters." }),
  numberOfQuestions: z.coerce.number().int().positive().max(50, "Max 50 questions").optional(),
  questionTypes: z.string().max(200, "Question types string too long").optional().describe("Comma-separated preferred question types (e.g., MCQ, Short Answer)"),
  difficulty: z.enum(["Easy", "Medium", "Hard", "AI_Decides"]).optional(),
  includePYQs: z.boolean().default(false).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function TestPaperGenerationClient() {
  const [testOutput, setTestOutput] = useState<GenerateTestPaperOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chapterName: "",
      className: "",
      numberOfQuestions: undefined,
      questionTypes: "",
      difficulty: "AI_Decides",
      includePYQs: false,
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setTestOutput(null);
    try {
      const input: GenerateTestPaperInput = { 
        ...data,
        questionTypes: data.questionTypes ? data.questionTypes.split(',').map(qt => qt.trim()).filter(qt => qt) : undefined,
        difficulty: data.difficulty === "AI_Decides" ? undefined : data.difficulty, // Pass undefined if AI_Decides
      };
      const output = await generateTestPaper(input);
      setTestOutput(output);
      toast({
        title: "Test Paper Generated!",
        description: `"${output.testPaperTitle}" created successfully.`,
      });
    } catch (error: any) {
      console.error("Test paper generation error:", error);
      const errorMessage = error.message || "Something went wrong. Please try again.";
      setTestOutput(null); // Clear any partial output
      toast({
        title: "Error Generating Test Paper",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (content: string, type: string) => {
    navigator.clipboard.writeText(content)
      .then(() => toast({ title: "Copied!", description: `${type} copied to clipboard.` }))
      .catch(err => toast({ title: "Copy Failed", description: `Could not copy ${type}.`, variant: "destructive" }));
  };

  const handleDownloadAsText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: `${filename} downloaded successfully.` });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="mr-2 h-6 w-6 text-primary" />
            Test Paper Details
          </CardTitle>
          <UiCardDescription>
            Provide the chapter name, class/grade, and optionally specify the number of questions and types.
          </UiCardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="chapterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chapter Name / Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'Photosynthesis', 'Indian History: 1857 Revolt'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="className"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class / Grade Level</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'Grade 7 Science', 'Class 12 History', 'Undergraduate Chemistry'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numberOfQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 15 (AI default: 10-20)" 
                        {...field} 
                        onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="questionTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Question Types (Optional, Comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., MCQ, True/False, Short Answer" {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>If blank, AI will use a variety of types.</FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {difficultyLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="includePYQs"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 md:col-span-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Include Previous Year Question Styles?
                      </FormLabel>
                      <FormDescription>
                        AI will try to generate questions in the style of PYQs.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                Generate Test Paper
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isLoading && (
        <Card className="flex flex-col items-center justify-center p-10 min-h-[300px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">AI is crafting your test paper...</p>
          <p className="text-sm text-muted-foreground">This might take a few moments.</p>
        </Card>
      )}

      {testOutput && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>{testOutput.testPaperTitle}</CardTitle>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">Difficulty: {testOutput.suggestedDifficulty}</Badge>
                <Badge variant="outline">Est. Time: {testOutput.estimatedTimeMinutes} mins</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="test-paper" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="test-paper">Test Paper</TabsTrigger>
                <TabsTrigger value="solution-key">Solution Key</TabsTrigger>
              </TabsList>
              <TabsContent value="test-paper">
                <Card className="mt-2">
                  <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                    <CardTitle className="text-lg">Questions</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(testOutput.testPaperMarkdown, "Test Paper")}>
                            <ClipboardCopy className="mr-2 h-4 w-4" /> Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadAsText(testOutput.testPaperMarkdown, `${testOutput.testPaperTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_test.txt`)}>
                            <Download className="mr-2 h-4 w-4" /> Download .txt
                        </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ScrollArea className="h-[500px] pr-4">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code: ({node, inline, className, children, ...props}) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} {...props} />
                            ) : (
                              <code className={cn("bg-muted px-1 py-0.5 rounded text-sm", className ?? '')} {...props}>{children}</code>
                            );
                          },
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-3 mb-1" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-2 mb-1" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="pl-4 border-l-4 border-muted-foreground/50 italic my-2" {...props} />,
                        }}
                      >
                        {testOutput.testPaperMarkdown}
                      </ReactMarkdown>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="solution-key">
                <Card className="mt-2">
                  <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                    <CardTitle className="text-lg">Answers</CardTitle>
                     <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(testOutput.solutionKeyMarkdown, "Solution Key")}>
                            <ClipboardCopy className="mr-2 h-4 w-4" /> Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadAsText(testOutput.solutionKeyMarkdown, `${testOutput.testPaperTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_solution.txt`)}>
                            <Download className="mr-2 h-4 w-4" /> Download .txt
                        </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ScrollArea className="h-[500px] pr-4">
                       <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                         components={{
                          code: ({node, inline, className, children, ...props}) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} {...props} />
                            ) : (
                              <code className={cn("bg-muted px-1 py-0.5 rounded text-sm", className ?? '')} {...props}>{children}</code>
                            );
                          },
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-3 mb-1" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-2 mb-1" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="pl-4 border-l-4 border-muted-foreground/50 italic my-2" {...props} />,
                        }}
                      >
                        {testOutput.solutionKeyMarkdown}
                      </ReactMarkdown>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
