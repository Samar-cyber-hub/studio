
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { generateMedia, type AIMediaGenerationInput, type AIMediaGenerationOutput } from "@/ai/flows/ai-media-generation";
import { toast } from "@/hooks/use-toast";
import { Loader2, Download } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  prompt: z.string().min(5, { message: "Prompt must be at least 5 characters long." }),
  mediaType: z.enum(["image", "3dModel", "realisticImage", "fusionArt"], {
    required_error: "You need to select a media type.",
  }),
});

type FormData = z.infer<typeof formSchema>;

export function MediaGenerationClient() {
  const [generatedMedia, setGeneratedMedia] = useState<AIMediaGenerationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      mediaType: "image",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setGeneratedMedia(null);

    if (data.mediaType !== "image") {
      toast({
        title: "Feature Coming Soon",
        description: `${data.mediaType} generation is not yet supported. Please select 'Image'.`,
        variant: "default",
      });
      setIsLoading(false);
      return;
    }

    try {
      const input: AIMediaGenerationInput = { prompt: data.prompt, mediaType: data.mediaType };
      const output = await generateMedia(input);
      setGeneratedMedia(output);
      if (output.mediaUrl && output.mediaUrl.startsWith("data:image/")) {
        toast({
          title: "Media Generated!",
          description: `Your ${data.mediaType} is ready.`,
        });
      } else {
        toast({
          title: "Media Generation Failed",
          description: output.mediaUrl || "Could not generate media. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Media generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      setGeneratedMedia({ mediaUrl: `Error: ${errorMessage}` });
      toast({
        title: "Error Generating Media",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMediaType = form.watch("mediaType");

  const isImageGenerated = generatedMedia?.mediaUrl?.startsWith("data:image/");
  const isUnsupportedType = generatedMedia?.mediaUrl?.startsWith("Unsupported");
  const isErrorResponse = generatedMedia?.mediaUrl?.startsWith("Error:"); // Added semicolon here


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{'Generate AI Media 🎨🖼🖌'}</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Media Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'A futuristic cityscape at sunset, synthwave style', or 'A cute cat wearing a tiny wizard hat'"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mediaType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Media Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a media type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="3dModel" disabled>3D Model (Coming Soon)</SelectItem>
                        <SelectItem value="realisticImage" disabled>Realistic Image (Coming Soon)</SelectItem>
                        <SelectItem value="fusionArt" disabled>Fusion AI Art (Coming Soon)</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedMediaType !== "image" && (
                       <FormDescription className="text-orange-600">
                         This media type is not yet supported. Image generation will be used if you proceed.
                       </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Media
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isLoading && !generatedMedia && (
        <Card className="flex flex-col items-center justify-center p-10 min-h-[300px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Generating your masterpiece...</p>
        </Card>
      )}

      {isImageGenerated && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Media</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden border shadow-lg">
              <Image 
                src={generatedMedia!.mediaUrl!} 
                alt="Generated AI Media" 
                layout="fill" 
                objectFit="contain" 
                data-ai-hint="abstract digital art"
              />
            </div>
          </CardContent>
           <CardFooter className="justify-center">
             <Button asChild variant="outline">
               <a href={generatedMedia!.mediaUrl!} download={`popgpt-media-${Date.now()}.png`} target="_blank" rel="noopener noreferrer">
                 <Download className="mr-2 h-4 w-4" /> Download
               </a>
             </Button>
           </CardFooter>
        </Card>
      )}
      
      {isUnsupportedType && (
         <Card>
          <CardHeader>
            <CardTitle>Media Generation Note</CardTitle>
          </Header>
          <CardContent>
            <p className="text-muted-foreground">{generatedMedia!.mediaUrl!}</p>
            <p className="mt-2">Currently, only image generation is supported. Please select "Image" as the media type.</p>
          </CardContent>
        </Card>
      )}

      {isErrorResponse && (
         <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Media Generation Error</CardTitle>
          </Header>
          <CardContent>
            <p className="text-destructive-foreground bg-destructive/10 p-3 rounded-md border border-destructive/30">{generatedMedia!.mediaUrl!}</p>
            <p className="mt-2 text-muted-foreground">Sorry, an error occurred while generating the media. Please try again.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
