
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { solveQuestionFromImage, type SolveQuestionFromImageInput, type SolveQuestionFromImageOutput } from "@/ai/flows/photo-question-solver-flow";
import { toast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, Camera, CameraOff, Zap, Send, RefreshCcw, BookOpenText, Lightbulb, MessageSquareQuote } from "lucide-react";
import NextImage from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/common/code-block";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  userInstructions: z.string().optional(),
});
type FormData = z.infer<typeof formSchema>;

export function PhotoQuestionClient() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<SolveQuestionFromImageOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userInstructions: "",
    },
  });

  const stopCameraStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    const getCameraPermission = async () => {
      setIsLoading(true);
      setError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera access is not supported by your browser.");
        setHasCameraPermission(false);
        setIsLoading(false);
        toast({ variant: "destructive", title: "Browser Not Supported", description: "Camera access is not supported."});
        return;
      }
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setStream(mediaStream);
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera permission denied or camera not found. Please enable camera permissions in your browser settings.");
        setHasCameraPermission(false);
        toast({ variant: "destructive", title: "Camera Access Denied", description: "Please enable camera permissions."});
      } finally {
        setIsLoading(false);
      }
    };
    getCameraPermission();
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && stream) {
      setError(null);
      setAiResponse(null);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUri);
        stopCameraStream(); 
        toast({ title: "Image Captured!", description: "Review your image and add instructions if needed." });
      } else {
        setError("Could not get canvas context to capture image.");
        toast({ variant: "destructive", title: "Capture Failed", description: "Could not get canvas context."});
      }
    } else {
      setError("Camera stream not available or canvas not ready.");
      toast({ variant: "destructive", title: "Capture Failed", description: "Camera not ready."});
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setAiResponse(null);
    setError(null);
    const getCameraPermission = async () => { // Re-initialize camera
      setIsLoading(true);
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setStream(mediaStream);
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error re-accessing camera:", err);
        setError("Failed to re-initialize camera.");
        setHasCameraPermission(false);
      } finally {
        setIsLoading(false);
      }
    };
    getCameraPermission();
  };

  const onSubmitToAI: SubmitHandler<FormData> = async (data) => {
    if (!capturedImage) {
      setError("Please capture an image of the question first.");
      toast({ variant: "destructive", title: "No Image", description: "Please capture an image first."});
      return;
    }
    setIsProcessingAI(true);
    setAiResponse(null);
    setError(null);
    try {
      const input: SolveQuestionFromImageInput = {
        imageDataUri: capturedImage,
        userInstructions: data.userInstructions,
      };
      const output = await solveQuestionFromImage(input);
      setAiResponse(output);
      toast({ title: "Solution Ready!", description: "AI has processed your question." });
    } catch (err: any) {
      console.error("AI processing error:", err);
      const errorMessage = err.message || "An error occurred while processing the image.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "AI Error", description: errorMessage });
    } finally {
      setIsProcessingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden"></canvas>

      {!capturedImage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Camera className="mr-2 h-6 w-6 text-primary" /> Point Camera at Question</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            {isLoading && hasCameraPermission === null && <Loader2 className="h-10 w-10 animate-spin text-primary" />}
            {hasCameraPermission === false && !isLoading && (
              <Alert variant="destructive" className="w-full">
                <CameraOff className="h-5 w-5" />
                <AlertTitle>Camera Access Problem</AlertTitle>
                <AlertDescription>{error || "Camera permission is required. Please allow access in your browser settings and refresh the page."}</AlertDescription>
              </Alert>
            )}
            {hasCameraPermission && stream && (
              <div className="w-full max-w-md aspect-video bg-muted rounded-md overflow-hidden border">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            {hasCameraPermission && stream && (
              <Button onClick={handleCapture} size="lg" disabled={isLoading}>
                <Zap className="mr-2 h-5 w-5" /> Capture Question
              </Button>
            )}
             {!hasCameraPermission && !isLoading && (
              <Button onClick={() => window.location.reload()} size="lg" variant="outline">
                <RefreshCcw className="mr-2 h-5 w-5" /> Retry Camera Access
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      {capturedImage && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Get Solution</CardTitle>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitToAI)}>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center">
                  <NextImage src={capturedImage} alt="Captured question" width={400} height={300} className="rounded-md border max-h-[300px] object-contain bg-muted" data-ai-hint="question image" />
                  <Button onClick={handleRetake} variant="outline" className="mt-3" disabled={isProcessingAI}>
                    <RefreshCcw className="mr-2 h-4 w-4" /> Retake Photo
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name="userInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Optional: Instructions for Explanation Tone</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'Explain it like I'm a pirate!', 'Make it very formal', 'Use lots of puns'"
                          {...field}
                          className="resize-y min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" size="lg" disabled={isProcessingAI || !capturedImage}>
                  {isProcessingAI ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                  Get Solution & Explanation
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      )}

      {isProcessingAI && !aiResponse && (
        <Card className="p-6 flex flex-col items-center justify-center min-h-[200px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
          <p className="text-muted-foreground">AI is analyzing your question... Hold tight!</p>
        </Card>
      )}
      
      {error && !isProcessingAI && (
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
      )}

      {aiResponse && !isProcessingAI && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><BookOpenText className="mr-2 h-6 w-6 text-primary" /> Identified Question</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground italic bg-muted p-3 rounded-md">{aiResponse.identifiedQuestion || "Could not identify a question."}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Lightbulb className="mr-2 h-6 w-6 text-primary" /> Solved Solution</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[300px] pr-3">
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
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                    }}
                    >
                    {aiResponse.solvedSolution || "No solution provided."}
                </ReactMarkdown>
              </ScrollArea>
            </CardContent>
          </Card>

          {aiResponse.similarQuestions && aiResponse.similarQuestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Zap className="mr-2 h-6 w-6 text-primary" /> Similar Questions to Practice</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  {aiResponse.similarQuestions.map((q, index) => (
                    <li key={index}>{q}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><MessageSquareQuote className="mr-2 h-6 w-6 text-primary" /> Humorous Explanation</CardTitle>
            </CardHeader>
            <CardContent>
               <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />
                    }}
                >
                    {aiResponse.humorousExplanation || "No explanation provided."}
                </ReactMarkdown>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
