
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateAnimationConcept, type GenerateAnimationConceptInput, type GenerateAnimationConceptOutput, type AnimationStyle } from "@/ai/flows/animation-generation-flow";
import { toast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, Film, Download, Tv } from "lucide-react";
import NextImage from "next/image";

const animationStyleValues = [
  "3d_cartoon_character",
  "2d_anime_scene",
  "3d_avatar_portrait",
  "virtual_studio_background",
  "general_animation_scene",
  "animated_storyboard_frame"
] as const;

const AnimationStyleSchemaClient = z.enum(animationStyleValues).describe('The desired style for the animation concept image.');

const animationStyleOptions: { label: string; value: AnimationStyle }[] = [
  { label: "3D Cartoon Character", value: "3d_cartoon_character" },
  { label: "2D Anime Scene", value: "2d_anime_scene" },
  { label: "3D Avatar Portrait (Concept)", value: "3d_avatar_portrait" },
  { label: "Virtual Studio Background", value: "virtual_studio_background" },
  { label: "General Animation Scene", value: "general_animation_scene" },
  { label: "Animated Storyboard Frame", value: "animated_storyboard_frame" },
];

const formSchema = z.object({
  prompt: z.string().min(10, { message: "Prompt must be at least 10 characters." })
    .max(1000, { message: "Prompt must be at most 1000 characters." }),
  animationStyle: AnimationStyleSchemaClient,
  channelName: z.string().max(50, { message: "Channel name must be at most 50 characters." }).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function AnimationGenerationClient() {
  const [generatedConcept, setGeneratedConcept] = useState<GenerateAnimationConceptOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      animationStyle: "general_animation_scene",
      channelName: "",
    },
  });

  const watchedAnimationStyle = form.watch("animationStyle");

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setGeneratedConcept(null);
    try {
      const input: GenerateAnimationConceptInput = { 
        prompt: data.prompt, 
        animationStyle: data.animationStyle,
        channelName: data.animationStyle === "virtual_studio_background" ? data.channelName : undefined,
      };
      const output = await generateAnimationConcept(input);
      setGeneratedConcept(output);
      if (output.imageDataUri) {
        toast({
          title: "Animation Concept Generated!",
          description: "Your visual concept has been created successfully.",
        });
      } else {
        toast({
          title: "Concept Generation Failed",
          description: output.errorMessage || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Animation concept generation error:", error);
      const errorMessage = error.message || "Something went wrong. Please try again.";
      setGeneratedConcept({ imageDataUri: null, errorMessage });
      toast({
        title: "Error Generating Concept",
        description: errorMessage,
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
          <CardTitle className="flex items-center">
            <Film className="mr-2 h-6 w-6 text-primary" />
            Describe Your Animation Idea
          </CardTitle>
          <CardDescription>
            Enter a detailed prompt for the animation concept you want to visualize. Choose a style to guide the generation.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="animationStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Animation Style</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an animation style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {animationStyleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {watchedAnimationStyle === "virtual_studio_background" && (
                <FormField
                  control={form.control}
                  name="channelName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Tv className="mr-2 h-4 w-4 text-muted-foreground" />
                        Channel Name for Studio Background (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 'My Awesome Channel' or 'Tech Talks Live'"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Prompt for the Scene/Concept</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'A brave knight facing a fire-breathing dragon in a dark cave, dramatic lighting' or 'A cheerful robot waving hello in a futuristic city street'"
                        rows={5}
                        {...field}
                        className="min-h-[120px] resize-y"
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
                Generate Concept
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isLoading && (
        <Card className="flex flex-col items-center justify-center p-10 min-h-[300px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Generating your animation concept...</p>
          <p className="text-sm text-muted-foreground">This might take a few moments.</p>
        </Card>
      )}

      {generatedConcept && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Animation Concept</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {generatedConcept.imageDataUri && (
              <div className="w-full max-w-xl mb-4">
                <div className="relative aspect-video rounded-lg overflow-hidden border shadow-lg bg-muted">
                  <NextImage
                    src={generatedConcept.imageDataUri}
                    alt="Generated AI Animation Concept"
                    layout="fill"
                    objectFit="contain"
                    data-ai-hint="animation concept art"
                  />
                </div>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <a
                    href={generatedConcept.imageDataUri}
                    download={`animation-concept-${Date.now()}.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" /> Download Concept Image
                  </a>
                </Button>
              </div>
            )}
            {generatedConcept.errorMessage && (
              <Alert variant="destructive" className="w-full">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Generation Failed</AlertTitle>
                <AlertDescription>{generatedConcept.errorMessage}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
