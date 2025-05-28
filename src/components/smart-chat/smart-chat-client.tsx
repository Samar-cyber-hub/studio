
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

  useEffect(() => {
    // This ensures ChatInterface is re-initialized with the correct initial messages
    // if they are reset (e.g. after a clear chat operation).
    // No action needed here if initialBotMessage is static, but if it could change,
    // this effect would re-set currentInitialMessages.
  }, [initialBotMessage]); // Dependency array ensures this runs if initialBotMessage definition changes.


  const getFormattedHistoryForAI = (currentMessages: Message[]): string => {
    const relevantMessages = currentMessages.filter(msg => msg.id !== initialBotMessage.id || currentMessages.length > 1);
    return relevantMessages
      .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
      .join("\\n");
  };
  
  const handleSendMessage = async (userInput: string, currentMessagesFromChatInterface?: Message[]) => {
    const historyForAIInput = currentMessagesFromChatInterface 
        ? currentMessagesFromChatInterface.slice(0, -1) 
        : []; 

    const currentHistoryString = getFormattedHistoryForAI(historyForAIInput);

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
    setCurrentInitialMessages([initialBotMessage]); 
  };

  const handleSaveChatMessage = (messageContent: string) => {
    console.log("Chat to save:", messageContent);
    toast({
      title: "Chat Snippet Saved!",
      description: "The chat message has been copied to the console (simulation).", 
    });
  };

  const handleViewSavedChats = () => {
    toast({
      title: "Coming Soon!",
      description: "The feature to view your saved chats is under development.",
    });
  };
  
  return (
    <ChatInterface
      sendMessage={handleSendMessage}
      initialMessages={currentInitialMessages} 
      placeholder="Ask me anything, yaar!"
      chatHistoryEnabled={true} 
      onClearChat={handleChatClear}
      onSaveChatMessage={handleSaveChatMessage}
      onViewSavedChats={handleViewSavedChats} // Pass the new handler
    />
  );
}
