
"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Paperclip, Send, Mic, Loader2, Trash2, Bookmark } from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { ChatMessage, type Message } from "./chat-message";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  sendMessage: (message: string, history?: Message[]) => Promise<string | { response: string; history?: Message[] }>;
  initialMessages?: Message[];
  placeholder?: string;
  chatHistoryEnabled?: boolean;
  onClearChat?: () => void;
  onSaveChatMessage?: (messageContent: string) => void;
  onDeleteSingleMessage?: (messageId: string) => void;
  onViewSavedChats?: () => void; 
}

export function ChatInterface({
  sendMessage,
  initialMessages = [],
  placeholder = "Type your message...",
  chatHistoryEnabled = false,
  onClearChat,
  onSaveChatMessage,
  onDeleteSingleMessage,
  onViewSavedChats, 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { speak, cancel, isSpeaking, isSupported, currentUtterance } = useSpeechSynthesis();
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (scrollAreaViewportRef.current) {
      const { scrollHeight, clientHeight } = scrollAreaViewportRef.current;
      scrollAreaViewportRef.current.scrollTo({ top: scrollHeight - clientHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);


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

    // Capture messages state *before* adding the new user message for history passing
    const historyForSendMessage = chatHistoryEnabled ? [...messages] : undefined;
    
    const newUserMessage: Message = {
      id: Date.now().toString(), // This ID is for optimistic UI update
      role: "user",
      content: input, // Use the raw input from the text field
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]); // Optimistically update UI
    setInput("");
    setIsLoading(true);

    try {
      const result = await sendMessage(
        newUserMessage.content, // Pass the actual current user input string
        historyForSendMessage // Pass the history *before* this new user message
      );
      
      let botResponseContent: string;
      let updatedHistoryFromAI: Message[] | undefined;

      if (typeof result === 'string') {
        botResponseContent = result;
      } else {
        botResponseContent = result.response;
        updatedHistoryFromAI = result.history;
      }
      
      if (chatHistoryEnabled && updatedHistoryFromAI) {
        // If AI provides full history, use it. This replaces the optimistic UI update
        // with the confirmed history including the new user message and bot response.
        setMessages(updatedHistoryFromAI);
      } else {
         // Otherwise, just append the new bot message to the current (optimistically updated) state.
        const newBotMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: botResponseContent,
          createdAt: new Date(),
        };
        // This path might be taken if sendMessage doesn't return a history array
        // or if chatHistoryEnabled is false.
        setMessages((prev) => [...prev, newBotMessage]);
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      // If an error occurs, we might still want to keep the user's message in the UI.
      // The current setMessages(updatedHistoryFromAI) or setMessages((prev) => [...prev, newBotMessage])
      // approach means if result.history is not returned on error, the bot error message would append.
      // It might be better to construct an error message and append it.
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]); // Append error to optimistically updated messages
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleClearChat = () => {
    setMessages(initialMessages.length > 0 ? initialMessages : []);
    setInput("");
    if (onClearChat) {
      onClearChat();
    }
    inputRef.current?.focus();
  };

  const handleDeleteSingleMessageInternal = (messageId: string) => {
    setMessages((prevMessages) => prevMessages.filter(msg => msg.id !== messageId));
    if (onDeleteSingleMessage) {
      onDeleteSingleMessage(messageId); 
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] bg-card rounded-lg shadow-lg overflow-hidden">
      <ScrollArea className="flex-1 p-4" viewportRef={scrollAreaViewportRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onSpeak={isSupported ? (text) => handleSpeak(text, msg.id) : undefined}
              onStopSpeak={isSupported ? handleStopSpeak : undefined}
              isSpeaking={isSpeaking}
              isCurrentSpeakingMessage={speakingMessageId === msg.id}
              onSaveChat={onSaveChatMessage}
              onDeleteMessage={msg.role === 'assistant' ? handleDeleteSingleMessageInternal : undefined}
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
          {onClearChat && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClearChat}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Clear chat"
              disabled={isLoading}
            >
              <Trash2 className="h-5 w-5" />
              <span className="sr-only">Clear Chat</span>
            </Button>
          )}
          {onViewSavedChats && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onViewSavedChats}
              className="text-muted-foreground hover:text-primary"
              aria-label="View saved chats"
              disabled={isLoading}
            >
              <Bookmark className="h-5 w-5" />
              <span className="sr-only">View Saved Chats</span>
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
