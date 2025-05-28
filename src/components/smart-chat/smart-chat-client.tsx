
"use client";

import { ChatInterface } from "@/components/common/chat-interface";
import { smartChat, type SmartChatInput } from "@/ai/flows/smart-chat-flow";
import { toast } from "@/hooks/use-toast";
import type { Message } from "@/components/common/chat-message";
import { useState, useEffect } from "react";

export function SmartChatClient() {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);

  const getFormattedHistoryForAI = (currentMessages: Message[]): string => {
    return currentMessages
      .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
      .join("\\n");
  };
  
  useEffect(() => {
    // Set initial message for the smart chat
    setChatHistory([{
      id: "initial-bot-smart",
      role: "assistant",
      content: "Namaste! yaar? Kya haal chaal hai 👋 aur! sab badhiya hai ghar mein aur aaj ka din kaisa hai 😊",
      createdAt: new Date()
    }]);
  }, []);

  const handleSendMessage = async (userInput: string, currentMessagesFromChatInterface?: Message[]) => {
    const messagesToProcess = currentMessagesFromChatInterface || chatHistory;
    const currentHistoryString = getFormattedHistoryForAI(messagesToProcess);

    const userMessageForUI: Message = {
      id: Date.now().toString() + "-user",
      role: "user",
      content: userInput,
      createdAt: new Date(),
    };

    try {
      const input: SmartChatInput = { 
        userInput, 
        chatHistory: currentHistoryString 
      };
      const output = await smartChat(input);

      const botMessageForUI: Message = {
        id: Date.now().toString() + "-bot",
        role: "assistant",
        content: output.chatbotResponse,
        createdAt: new Date(),
      };
      
      const newFullHistoryArray: Message[] = [
        ...messagesToProcess,
        userMessageForUI, // User message gets added by ChatInterface, but for our state:
        botMessageForUI
      ];
      // We are passing history back to ChatInterface, so we don't need to setChatHistory here manually
      // setChatHistory(newFullHistoryArray); 
      // ChatInterface will manage its internal state based on the returned history.

      return { 
        response: output.chatbotResponse,
        history: newFullHistoryArray // Provide the full updated history to ChatInterface
      };

    } catch (error) {
      console.error("Smart chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      // Return the original user input and an error message to ChatInterface
       const errorBotMessage: Message = {
        id: Date.now().toString() + "-bot-error",
        role: "assistant",
        content: "Sorry, something went wrong. Please try again later.",
        createdAt: new Date(),
      };
       const historyOnError: Message[] = [
        ...messagesToProcess,
        userMessageForUI,
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
      initialMessages={chatHistory} 
      placeholder="Ask me anything, yaar!"
      chatHistoryEnabled={true} 
    />
  );
}
