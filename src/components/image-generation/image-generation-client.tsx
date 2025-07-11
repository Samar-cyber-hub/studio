
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
import { generateImage, type GenerateImageInput, type GenerateImageOutput } from "@/ai/flows/image-generation-flow";
import { toast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, Sparkles, Download } from "lucide-react";
import NextImage from "next/image"; // Renamed to avoid conflict with Lucide's Image icon
import { cn } from "@/lib/utils";

const formSchema = z.object({
  prompt: z.string().min(10, { message: "Prompt must be at least 10 characters." })
    .max(1000, { message: "Prompt must be at most 1000 characters." }),
});

type FormData = z.infer<typeof formSchema>;

export function ImageGenerationClient() {
  const [generatedImage, setGeneratedImage] = useState<GenerateImageOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setGeneratedImage(null); // Clear previous image/error
    try {
      const input: GenerateImageInput = { prompt: data.prompt };
      const output = await generateImage(input);
      setGeneratedImage(output);
      if (output.imageDataUri) {
        toast({
          title: "Image Generated!",
          description: "Your image has been created successfully.",
        });
      } else {
        toast({
          title: "Image Generation Failed",
          description: output.errorMessage || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Image generation error:", error);
      const errorMessage = error.message || "Something went wrong. Please try again.";
      setGeneratedImage({ imageDataUri: null, errorMessage });
      toast({
        title: "Error Generating Image",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 text-slate-100 border-slate-700 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-50">
            <Sparkles className="mr-2 h-6 w-6 text-primary" />
            Describe Your Vision
          </CardTitle>
          <CardDescription className="text-slate-300">
            Enter a detailed prompt for the image you want to generate. Be specific about style (e.g., realistic, anime, 3D model), content, colors, and mood.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Image Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'A majestic lion wearing a crown, sitting on a throne in a mystical forest, fantasy art style, vibrant colors'"
                        rows={4}
                        {...field}
                        className="min-h-[100px] resize-y bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:border-primary focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Image
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isLoading && (
        <Card className="bg-slate-800 text-slate-100 border-slate-700 shadow-xl flex flex-col items-center justify-center p-10 min-h-[300px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-slate-300">Generating your image...</p>
          <p className="text-sm text-slate-400">This might take a few moments.</p>
        </Card>
      )}

      {generatedImage && !isLoading && (
        <Card className="bg-slate-800 text-slate-100 border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-slate-50">Generated Result</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {generatedImage.imageDataUri && (
              <div className="w-full max-w-lg mb-4">
                <div className="relative aspect-[1/1] rounded-lg overflow-hidden border border-slate-600 shadow-lg bg-slate-700">
                  <NextImage
                    src={generatedImage.imageDataUri}
                    alt="Generated AI Image"
                    layout="fill"
                    objectFit="contain" 
                    data-ai-hint="generated art"
                  />
                </div>
                <Button asChild variant="outline" className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-500 hover:border-slate-400">
                  <a 
                    href={generatedImage.imageDataUri} 
                    download={`ai-generated-image-${Date.now()}.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" /> Download Image
                  </a>
                </Button>
              </div>
            )}
            {generatedImage.errorMessage && (
              <Alert variant="destructive" className="w-full bg-red-900/30 border-red-700 text-red-100 [&>svg]:text-red-300">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-red-50">Generation Failed</AlertTitle>
                <AlertDescription className="text-red-200">{generatedImage.errorMessage}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
