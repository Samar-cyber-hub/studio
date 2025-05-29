
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateLogos, type GenerateLogosInput, type GenerateLogosOutput } from "@/ai/flows/logo-generation-flow";
import { toast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, Sparkles, Download, ImageOff, RefreshCw, Bookmark } from "lucide-react";
import NextImage from "next/image";

const formSchema = z.object({
  basePrompt: z.string().min(5, { message: "Prompt must be at least 5 characters." })
    .max(500, { message: "Prompt must be at most 500 characters." }),
});

type FormData = z.infer<typeof formSchema>;

export function LogoGenerationClient() {
  const [generatedLogos, setGeneratedLogos] = useState<GenerateLogosOutput['logos'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      basePrompt: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setGeneratedLogos(null);
    try {
      const input: GenerateLogosInput = { basePrompt: data.basePrompt };
      const output = await generateLogos(input);
      setGeneratedLogos(output.logos);
      const successfulLogos = output.logos.filter(logo => logo.imageDataUri).length;
      toast({
        title: "Logos Generated!",
        description: `${successfulLogos} out of 10 logos created. Some may have failed if errors are shown.`,
      });
    } catch (error: any) {
      console.error("Logo generation flow error:", error);
      const errorMessage = error.message || "Something went wrong. Please try again.";
      const errorResults = Array(10).fill(null).map((_, i) => ({
        imageDataUri: null,
        promptUsed: `Attempt ${i + 1} for prompt: ${data.basePrompt}`,
        errorMessage: i === 0 ? errorMessage : "Flow failed before this attempt.",
      }));
      setGeneratedLogos(errorResults);
      toast({
        title: "Error Generating Logos",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (form.getValues("basePrompt").trim() !== "") {
      form.handleSubmit(onSubmit)();
    } else {
      toast({
        title: "Prompt is empty",
        description: "Please enter a prompt to regenerate logos.",
        variant: "destructive",
      });
    }
  };

  const handleSaveLogo = (logoIndex: number) => {
    toast({
      title: "Logo Save (Simulated)",
      description: `Logo ${logoIndex + 1} would be saved. This feature is coming soon!`,
    });
    // In a real implementation, you would save logo.imageDataUri or related info
    console.log("Simulating save for logo:", generatedLogos?.[logoIndex]);
  };

  const handleViewSavedLogos = () => {
    toast({
      title: "View Saved Logos",
      description: "This feature is under development and will be available soon!",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="mr-2 h-6 w-6 text-primary" />
            Describe Your Logo Concept
          </CardTitle>
          <CardDescription>
            Enter a central idea for your logo (e.g., "a coffee shop called 'The Daily Grind'", "eco-friendly tech company"). We'll generate 10 variations.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="basePrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo Idea</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'A wise owl reading a book for an education platform'"
                        rows={3}
                        {...field}
                        className="min-h-[80px] resize-y"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 justify-start items-center">
              <Button type="submit" disabled={isLoading || !form.watch("basePrompt")} size="lg">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate 10 Logos
              </Button>
              <Button 
                type="button" 
                onClick={handleRegenerate} 
                disabled={isLoading || !form.watch("basePrompt")} 
                variant="outline"
                size="lg"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate ♻
              </Button>
              <Button 
                type="button" 
                onClick={handleViewSavedLogos} 
                disabled={isLoading}
                variant="outline"
                size="lg"
              >
                <Bookmark className="mr-2 h-4 w-4" />
                Saved Logos 👇💼
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isLoading && (
        <Card className="flex flex-col items-center justify-center p-10 min-h-[300px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Generating your logos...</p>
          <p className="text-sm text-muted-foreground">This might take up to a minute.</p>
        </Card>
      )}

      {generatedLogos && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Logo Concepts (10 Variations)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {generatedLogos.map((logo, index) => (
                <div key={index} className="flex flex-col items-center gap-2 p-2 border rounded-lg shadow-sm">
                  {logo.imageDataUri ? (
                    <>
                      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-muted">
                        <NextImage
                          src={logo.imageDataUri}
                          alt={`Generated Logo ${index + 1} - ${logo.promptUsed.substring(0, 50)}`}
                          layout="fill"
                          objectFit="contain"
                          data-ai-hint="logo design"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-1 w-full mt-1">
                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <a
                            href={logo.imageDataUri}
                            download={`logo-${index + 1}-${Date.now()}.png`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="mr-1 h-3 w-3 sm:mr-2" /> Download
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleSaveLogo(index)} className="flex-1">
                          <Bookmark className="mr-1 h-3 w-3 sm:mr-2" /> Save
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full aspect-square rounded-md bg-destructive/10 flex flex-col items-center justify-center text-center p-2">
                      <ImageOff className="h-8 w-8 text-destructive mb-2" />
                      <p className="text-xs text-destructive">Logo {index + 1} Failed</p>
                      {logo.errorMessage && <p className="text-xs text-destructive/70 truncate" title={logo.errorMessage}>{logo.errorMessage.substring(0, 30)}...</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {generatedLogos.some(logo => logo.errorMessage && !logo.imageDataUri) && (
                 <Alert variant="destructive" className="mt-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Some Logos Failed</AlertTitle>
                    <AlertDescription>
                        One or more logo variations could not be generated. Please check the individual error messages above. You can try again or adjust your prompt.
                    </AlertDescription>
                </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    