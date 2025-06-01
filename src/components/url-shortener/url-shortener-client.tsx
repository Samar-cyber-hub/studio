
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateShortUrl, type GenerateShortUrlInput, type GenerateShortUrlOutput } from "@/ai/flows/url-shortener-flow";
import { toast } from "@/hooks/use-toast";
import { Loader2, ClipboardCopy, Info, Link2 } from "lucide-react"; // Changed AlertTriangle to Info

const formSchema = z.object({
  longUrl: z.string().url({ message: "Please enter a valid URL (e.g., https://example.com)" }),
});

type FormData = z.infer<typeof formSchema>;

export function UrlShortenerClient() {
  const [shortUrlOutput, setShortUrlOutput] = useState<GenerateShortUrlOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      longUrl: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setShortUrlOutput(null);
    try {
      const input: GenerateShortUrlInput = { longUrl: data.longUrl };
      const output = await generateShortUrl(input);
      setShortUrlOutput(output);
      toast({
        title: "Short URL Generated (Simulated)",
        description: "A short URL string has been created.",
      });
    } catch (error: any) {
      console.error("URL shortening error:", error);
      toast({
        title: "Error",
        description: error.message || "Could not generate short URL. Please try again.",
        variant: "destructive",
      });
       setShortUrlOutput({
        shortUrlString: "Error: Could not generate.",
        disclaimer: "An unexpected error occurred. Please ensure you entered a valid URL."
       });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (shortUrlOutput?.shortUrlString && !shortUrlOutput.shortUrlString.startsWith("Error:")) {
      navigator.clipboard.writeText(shortUrlOutput.shortUrlString)
        .then(() => {
          toast({ title: "Copied!", description: "Short URL string copied to clipboard." });
        })
        .catch(err => {
          console.error("Failed to copy URL: ", err);
          toast({ title: "Copy Failed", description: "Could not copy URL to clipboard.", variant: "destructive" });
        });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Link2 className="mr-2 h-6 w-6 text-primary" />
            Enter Your Long URL
          </CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="longUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Long URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., https://www.verylongwebsitenameexample.com/with/a/very/long/path"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Shorten URL (Simulated)
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isLoading && (
        <Card className="flex flex-col items-center justify-center p-10 min-h-[200px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Generating your short URL string...</p>
        </Card>
      )}

      {shortUrlOutput && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Short URL (Simulated)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!shortUrlOutput.shortUrlString.startsWith("Error:") ? (
                <div className="bg-muted p-4 rounded-lg flex items-center justify-between gap-4">
                  <code className="text-lg font-mono break-all flex-1 select-all">
                    {shortUrlOutput.shortUrlString}
                  </code>
                  <Button variant="ghost" size="icon" onClick={handleCopyToClipboard} aria-label="Copy short URL">
                    <ClipboardCopy className="h-5 w-5" />
                  </Button>
                </div>
            ) : (
                 <p className="text-destructive font-medium">{shortUrlOutput.shortUrlString}</p>
            )}
             <Alert variant="default"> {/* Changed variant to default */}
                <Info className="h-4 w-4" /> {/* Changed icon to Info */}
                <AlertTitle>How This Tool Works</AlertTitle> {/* Changed title */}
                <AlertDescription>
                  {shortUrlOutput.disclaimer}
                </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
