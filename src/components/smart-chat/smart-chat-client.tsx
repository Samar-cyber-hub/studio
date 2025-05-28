
"use client";

import { ChatInterface } from "@/components/common/chat-interface";
import { smartChat, type SmartChatInput } from "@/ai/flows/smart-chat-flow";
import { toast } from "@/hooks/use-toast";
import type { Message } from "@/components/common/chat-message";
import { useState, useEffect } from "react";

export function SmartChatClient() {
  const initialBotMessage: Message = {
    id: "initial-bot-smart",
    role: "assistant",
    content: "Namaste! yaar? Kya haal chaal hai 👋 aur! sab badhiya hai ghar mein aur aaj ka din kaisa hai 😊",
    createdAt: new Date()
  };

  const [currentInitialMessages, setCurrentInitialMessages] = useState<Message[]>([initialBotMessage]);

  const getFormattedHistoryForAI = (currentMessages: Message[]): string => {
    return currentMessages
      .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
      .join("\\n");
  };
  
  const handleSendMessage = async (userInput: string, currentMessagesFromChatInterface?: Message[]) => {
    const historyForAIInput = currentMessagesFromChatInterface 
        ? currentMessagesFromChatInterface.slice(0, -1)
        : []; 

    const currentHistoryString = (historyForAIInput.length === 1 && historyForAIInput[0].id === initialBotMessage.id) || historyForAIInput.length === 0
      ? "" 
      : getFormattedHistoryForAI(historyForAIInput);

    try {
      const input: SmartChatInput = { 
        userInput, 
        chatHistory: currentHistoryString 
      };
      const output = await smartChat(input);

      const userMessageForHistory: Message = currentMessagesFromChatInterface && currentMessagesFromChatInterface.length > 0
        ? currentMessagesFromChatInterface[currentMessagesFromChatInterface.length - 1] 
        : { id: Date.now().toString() + "-user-fallback", role: "user", content: userInput, createdAt: new Date()};
      
      const botMessageForHistory: Message = {
        id: Date.now().toString() + "-bot",
        role: "assistant",
        content: output.chatbotResponse,
        createdAt: new Date(),
      };
      
      const newFullHistoryArray: Message[] = [
        ...historyForAIInput,
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
      
      const userMessageForHistoryOnError: Message = currentMessagesFromChatInterface && currentMessagesFromChatInterface.length > 0
        ? currentMessagesFromChatInterface[currentMessagesFromChatInterface.length - 1]
        : { id: Date.now().toString() + "-user-fallback-err", role: "user", content: userInput, createdAt: new Date()};

       const errorBotMessage: Message = {
        id: Date.now().toString() + "-bot-error",
        role: "assistant",
        content: "Sorry, something went wrong. Please try again later.",
        createdAt: new Date(),
      };
       const historyOnError: Message[] = [
        ...historyForAIInput,
        userMessageForHistoryOnError,
        errorBotMessage,
      ];
      return { 
          response: errorBotMessage.content, 
          history: historyOnError
      };
    }
  };

  const handleChatClear = () => {
    // setCurrentInitialMessages ensures ChatInterface gets the correct initial messages when it re-renders after clear
    setCurrentInitialMessages([initialBotMessage]); 
  };

  const handleSaveChatMessage = (messageContent: string) => {
    // For now, just show a toast. Actual save logic can be implemented here.
    console.log("Chat to save:", messageContent);
    toast({
      title: "Chat Snippet Saved!",
      description: "The chat message has been copied to the console (simulation).", 
    });
    // Example: navigator.clipboard.writeText(messageContent);
  };

  return (
    <ChatInterface
      sendMessage={handleSendMessage}
      initialMessages={currentInitialMessages} 
      placeholder="Ask me anything, yaar!"
      chatHistoryEnabled={true} 
      onClearChat={handleChatClear}
      onSaveChatMessage={handleSaveChatMessage} // Pass the new handler
    />
  );
}
