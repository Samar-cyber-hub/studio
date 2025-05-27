"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Paperclip, Send, Mic, Loader2 } from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { ChatMessage, type Message } from "./chat-message";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  sendMessage: (message: string, history?: Message[]) => Promise<string | { response: string; history?: Message[] }>;
  initialMessages?: Message[];
  placeholder?: string;
  chatHistoryEnabled?: boolean;
}

export function ChatInterface({
  sendMessage,
  initialMessages = [],
  placeholder = "Type your message...",
  chatHistoryEnabled = false,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { speak, cancel, isSpeaking, isSupported, currentUtterance } = useSpeechSynthesis();
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSpeak = (text: string, messageId: string) => {
    setSpeakingMessageId(messageId);
    speak(text);
  };

  const handleStopSpeak = () => {
    cancel();
    setSpeakingMessageId(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await sendMessage(
        newUserMessage.content,
        chatHistoryEnabled ? messages : undefined
      );
      
      let botResponseContent: string;
      let updatedHistory: Message[] | undefined;

      if (typeof result === 'string') {
        botResponseContent = result;
      } else {
        botResponseContent = result.response;
        updatedHistory = result.history;
      }
      
      const newBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: botResponseContent,
        createdAt: new Date(),
      };

      if (chatHistoryEnabled && updatedHistory) {
        setMessages(updatedHistory); // Assumes history includes the new bot message
      } else {
        setMessages((prev) => [...prev, newBotMessage]);
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] bg-card rounded-lg shadow-lg overflow-hidden">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onSpeak={isSupported ? (text) => handleSpeak(text, msg.id) : undefined}
              onStopSpeak={isSupported ? handleStopSpeak : undefined}
              isSpeaking={isSpeaking}
              isCurrentSpeakingMessage={speakingMessageId === msg.id}
            />
          ))}
          {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
            <div className="flex items-start gap-3 py-4 justify-start">
              <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0 mt-1.5 ml-1.5" />
              <div className="bg-muted p-3 rounded-xl shadow-md text-sm md:text-base text-muted-foreground">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t p-4 bg-background">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
            disabled={isLoading}
            autoComplete="off"
          />
          <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <Mic className="h-5 w-5" />
          </Button>
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
