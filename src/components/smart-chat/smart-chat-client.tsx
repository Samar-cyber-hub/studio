
"use client";

import { ChatInterface } from "@/components/common/chat-interface";
import { smartChat, type SmartChatInput } from "@/ai/flows/smart-chat-flow";
import { toast } from "@/hooks/use-toast";
import type { Message } from "@/components/common/chat-message";
import { useState, useEffect } from "react";

export function SmartChatClient() {
  // chatHistory state is managed by ChatInterface when chatHistoryEnabled is true
  // We only need to provide the initial messages.

  const initialBotMessage: Message = {
    id: "initial-bot-smart",
    role: "assistant",
    content: "Namaste! yaar? Kya haal chaal hai 👋 aur! sab badhiya hai ghar mein aur aaj ka din kaisa hai 😊",
    createdAt: new Date()
  };

  const getFormattedHistoryForAI = (currentMessages: Message[]): string => {
    // Remove the initial bot message if it's the only one, as the AI prompt doesn't need it as "history" for the first user turn.
    // Or, more simply, let the smartChatFlow handle an empty history string if currentMessages only contains the initial greeting.
    // For now, we'll pass the history as is, and the smartChatFlow prompt is designed to handle empty or greeting-only history.
    return currentMessages
      .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
      .join("\\n");
  };
  
  const handleSendMessage = async (userInput: string, currentMessagesFromChatInterface?: Message[]) => {
    // currentMessagesFromChatInterface will contain all messages currently in ChatInterface, including user's new input.
    // We need the history *before* the current userInput for the AI.
    const historyForAI = currentMessagesFromChatInterface 
        ? currentMessagesFromChatInterface.slice(0, -1) // All messages except the last one (current user input)
        : []; 

    const currentHistoryString = getFormattedHistoryForAI(historyForAI);

    try {
      const input: SmartChatInput = { 
        userInput, 
        chatHistory: currentHistoryString 
      };
      const output = await smartChat(input);

      // The ChatInterface component will add the user's message and this bot response to its internal state.
      // We need to return the bot's response content and the *complete* new history array
      // that ChatInterface should adopt if chatHistoryEnabled is true.

      const userMessageForHistory: Message = currentMessagesFromChatInterface 
        ? currentMessagesFromChatInterface[currentMessagesFromChatInterface.length - 1] 
        : { id: Date.now().toString() + "-user-fallback", role: "user", content: userInput, createdAt: new Date()};
      
      const botMessageForHistory: Message = {
        id: Date.now().toString() + "-bot",
        role: "assistant",
        content: output.chatbotResponse,
        createdAt: new Date(),
      };
      
      const newFullHistoryArray: Message[] = [
        ...historyForAI,
        userMessageForHistory, 
        botMessageForHistory
      ];

      return { 
        response: output.chatbotResponse,
        history: newFullHistoryArray 
      };

    } catch (error) {
      console.error("Smart chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      
      const userMessageForHistoryOnError: Message = currentMessagesFromChatInterface 
        ? currentMessagesFromChatInterface[currentMessagesFromChatInterface.length - 1]
        : { id: Date.now().toString() + "-user-fallback-err", role: "user", content: userInput, createdAt: new Date()};

       const errorBotMessage: Message = {
        id: Date.now().toString() + "-bot-error",
        role: "assistant",
        content: "Sorry, something went wrong. Please try again later.",
        createdAt: new Date(),
      };
       const historyOnError: Message[] = [
        ...historyForAI,
        userMessageForHistoryOnError,
        errorBotMessage,
      ];
      return { 
          response: errorBotMessage.content, 
          history: historyOnError
      };
    }
  };

  return (
    <ChatInterface
      sendMessage={handleSendMessage}
      initialMessages={[initialBotMessage]} 
      placeholder="Ask me anything, yaar!"
      chatHistoryEnabled={true} 
    />
  );
}
