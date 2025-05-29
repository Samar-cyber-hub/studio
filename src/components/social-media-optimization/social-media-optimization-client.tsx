
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Removed Textarea as it's not used in this component
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { suggestSocialMediaContent, type SocialMediaInput, type SocialMediaOutput } from "@/ai/flows/social-media-optimization";
import { toast } from "@/hooks/use-toast";
import { Loader2, ThumbsUp, Tags, Hash, Film, Search, Image as ImageIcon, RefreshCw, Download } from "lucide-react";
import Image from "next/image";
import { generateMedia } from "@/ai/flows/ai-media-generation";
import { ScrollArea } from "@/components/ui/scroll-area";

const socialMediaPlatforms = ["Instagram", "TikTok", "X (Twitter)", "Facebook", "YouTube", "LinkedIn"];
const contentTypes = [
  { label: "Long video", value: "standard" },
  { label: "Shorts/Reels", value: "short_form" },
];

const formSchema = z.object({
  contentType: z.string().min(1, { message: "Please select a content type." }),
  platform: z.string().min(1, { message: "Please select a platform." }),
  topic: z.string().min(5, { message: "Topic must be at least 5 characters." }),
  keywords: z.string().min(3, { message: "Please provide some keywords." }),
});

type FormData = z.infer<typeof formSchema>;

export function SocialMediaOptimizationClient() {
  const [suggestions, setSuggestions] = useState<SocialMediaOutput | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contentType: "",
      platform: "",
      topic: "",
      keywords: "",
    },
  });

  const generateAndSetThumbnail = async (prompt: string) => {
    if (!prompt) return;
    setIsGeneratingThumbnail(true);
    setThumbnailUrl(null); // Clear previous thumbnail
    try {
      const thumbnailOutput = await generateMedia({ prompt: prompt, mediaType: "image" });
      if (thumbnailOutput.mediaUrl && thumbnailOutput.status === 'success') {
        setThumbnailUrl(thumbnailOutput.mediaUrl);
      } else {
        setThumbnailUrl(null); // Ensure null if error or unsupported
        toast({
            title: "Thumbnail Generation Issue",
            description: thumbnailOutput.mediaUrl || "Could not generate thumbnail for this prompt.",
            variant: "destructive",
          });
      }
    } catch (thumbError) {
      console.error("Thumbnail generation error:", thumbError);
      setThumbnailUrl(null);
      toast({
        title: "Thumbnail Error",
        description: "An unexpected error occurred while generating the thumbnail.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsGeneratingSuggestions(true);
    setSuggestions(null);
    setThumbnailUrl(null);
    try {
      const input: SocialMediaInput = data;
      const output = await suggestSocialMediaContent(input);
      setSuggestions(output);
      toast({
        title: "Suggestions Ready!",
        description: "Social media content ideas generated.",
      });

      if (output.thumbnailPrompt) {
        await generateAndSetThumbnail(output.thumbnailPrompt);
      }

    } catch (error) {
      console.error("Social media optimization error:", error);
      toast({
        title: "Error Generating Suggestions",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleRegenerateThumbnail = async () => {
    if (suggestions?.thumbnailPrompt) {
      await generateAndSetThumbnail(suggestions.thumbnailPrompt);
    } else {
      toast({
        title: "Cannot Regenerate",
        description: "No thumbnail prompt available to regenerate.",
        variant: "destructive",
      });
    }
  };

  const renderList = (title: string, items: string[] | undefined, icon: React.ElementType) => {
    if (!items || items.length === 0) return null;
    const IconComponent = icon;
    return (
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 flex items-center"><IconComponent className="mr-2 h-5 w-5 text-primary" /> {title}</h3>
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <Badge key={index} variant="secondary">{item}</Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Optimize Your Social Media</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="contentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Social Media Platform</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {socialMediaPlatforms.map((platform) => (
                          <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'Sustainable Fashion Tips'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keywords (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'eco-friendly, thrift, upcycle'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isGeneratingSuggestions || isGeneratingThumbnail}>
                {(isGeneratingSuggestions || isGeneratingThumbnail) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Suggestions
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {(isGeneratingSuggestions && !suggestions) && (
        <Card className="lg:col-span-1 flex flex-col items-center justify-center p-10 min-h-[300px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Brewing up some awesome social media ideas...</p>
        </Card>
      )}

      {suggestions && (
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Content Suggestions</CardTitle>
            <CardDescription>Here are some ideas to boost your social media presence.</CardDescription>
          </CardHeader>
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <CardContent className="space-y-3">
              {renderList("Trending Topics", suggestions.trendingTopics, ThumbsUp)}
              {renderList("Relevant Tags", suggestions.tags, Tags)}
              {renderList("Popular Hashtags", suggestions.hashtags, Hash)}
              {renderList("Engaging Video Titles", suggestions.videoTitles, Film)}
              
              {suggestions.seoDescription && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center"><Search className="mr-2 h-5 w-5 text-primary" /> SEO Description</h3>
                  <p className="text-sm bg-muted p-3 rounded-md">{suggestions.seoDescription}</p>
                </div>
              )}

              {suggestions.thumbnailPrompt && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary" /> Thumbnail Idea</h3>
                  <p className="text-sm italic text-muted-foreground mb-2">Prompt: "{suggestions.thumbnailPrompt}"</p>
                  
                  {isGeneratingThumbnail && (
                     <div className="flex items-center text-sm text-muted-foreground my-2">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating thumbnail...
                     </div>
                  )}
                  {thumbnailUrl && !isGeneratingThumbnail && (
                    <div className="mt-2 relative w-full max-w-xs aspect-video rounded-md overflow-hidden border shadow-md bg-muted">
                      <Image src={thumbnailUrl} alt="Generated Thumbnail" layout="fill" objectFit="contain" data-ai-hint="social media thumbnail"/>
                    </div>
                  )}
                  {!isGeneratingThumbnail && !thumbnailUrl && (
                    <p className="text-sm text-red-500 my-2">Could not generate thumbnail for this prompt, or generation failed.</p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <Button 
                        onClick={handleRegenerateThumbnail} 
                        variant="outline" 
                        size="sm" 
                        disabled={isGeneratingThumbnail || !suggestions.thumbnailPrompt}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
                      </Button>
                      {thumbnailUrl && !isGeneratingThumbnail && (
                        <Button asChild variant="outline" size="sm">
                          <a href={thumbnailUrl} download={`thumbnail-${Date.now()}.png`} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" /> Download
                          </a>
                        </Button>
                      )}
                  </div>
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}

