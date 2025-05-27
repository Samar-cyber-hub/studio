"use client";

import { ChatInterface } from "@/components/common/chat-interface";
import { persistentMemoryChat, type PersistentMemoryChatInput } from "@/ai/flows/persistent-memory-chat";
import { toast } from "@/hooks/use-toast";
import type { Message } from "@/components/common/chat-message";
import { useState, useEffect } from "react";

export function PersistentMemoryChatClient() {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);

  // Effect to format chat history string for the AI
  const getFormattedHistory = (currentMessages: Message[]): string => {
    return currentMessages
      .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
      .join("\n");
  };
  
  useEffect(() => {
    // Load chat history from localStorage if available (optional persistence)
    // const savedHistory = localStorage.getItem('persistentChatHistory');
    // if (savedHistory) {
    //   setChatHistory(JSON.parse(savedHistory));
    // } else {
    //   // Set initial message if no history
          setChatHistory([{
            id: "initial-bot-pm",
            role: "assistant",
            content: "Hello again! What shall we talk about today? I remember our previous chats!",
            createdAt: new Date()
          }]);
    // }
  }, []);

  // Effect to save chat history to localStorage (optional persistence)
  // useEffect(() => {
  //   if (chatHistory.length > 1 || (chatHistory.length === 1 && chatHistory[0].id !== "initial-bot-pm")) {
  //      localStorage.setItem('persistentChatHistory', JSON.stringify(chatHistory));
  //   }
  // }, [chatHistory]);


  const handleSendMessage = async (userInput: string, currentMessages?: Message[]) => {
    const currentHistoryString = getFormattedHistory(currentMessages || chatHistory);

    try {
      const input: PersistentMemoryChatInput = { 
        userInput, 
        chatHistory: currentHistoryString 
      };
      const output = await persistentMemoryChat(input);

      // The AI flow itself should return the updated history string.
      // We need to parse this string back into Message objects or adapt ChatInterface.
      // For now, let's assume the AI returns the full updated history as new messages.
      // This requires the AI flow's `updatedChatHistory` to be structured.
      // The current flow returns a string, which isn't ideal for direct state update.
      // Let's simplify: the AI flow returns its response, and we append to history.

      const newMessages: Message[] = [
        ...(currentMessages || chatHistory),
        { id: Date.now().toString() + "-user", role: "user", content: userInput, createdAt: new Date() },
        { id: Date.now().toString() + "-bot", role: "assistant", content: output.chatbotResponse, createdAt: new Date() }
      ];
      setChatHistory(newMessages); // Update local full history

      return { 
        response: output.chatbotResponse,
        // This part is tricky. ChatInterface expects to manage its own messages.
        // We'll let ChatInterface add the user message and this bot response.
        // The `chatHistoryEnabled` prop in ChatInterface could be used more effectively.
        // For now, this will just return the response, and ChatInterface appends.
        // The true "persistent memory" aspect comes from sending `currentHistoryString`.
      };

    } catch (error) {
      console.error("Persistent memory chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      return { response: "Sorry, something went wrong. Please try again later."};
    }
  };

  return (
    <ChatInterface
      sendMessage={handleSendMessage}
      initialMessages={chatHistory} // Pass the full history
      placeholder="Continue our conversation..."
      chatHistoryEnabled={true} // Indicate that history is managed/needed
    />
  );
}
