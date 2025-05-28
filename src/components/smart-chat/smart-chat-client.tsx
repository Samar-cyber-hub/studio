
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

  // This state is mainly to correctly pass initialMessages to ChatInterface
  const [currentInitialMessages, setCurrentInitialMessages] = useState<Message[]>([initialBotMessage]);

  const getFormattedHistoryForAI = (currentMessages: Message[]): string => {
    // Filter out any initial system messages if they are not meant to be part of "history" for the AI
    // or ensure the AI prompt handles a history that might start with an AI greeting.
    // The current smartChatFlow prompt is designed to handle history that might start with an AI greeting.
    return currentMessages
      .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
      .join("\\n");
  };
  
  const handleSendMessage = async (userInput: string, currentMessagesFromChatInterface?: Message[]) => {
    // currentMessagesFromChatInterface includes all messages, with the new user input typically last.
    // We need the history *before* the current userInput for the AI.
    const historyForAIInput = currentMessagesFromChatInterface 
        ? currentMessagesFromChatInterface.slice(0, -1) // All messages except the last one (current user input)
        : []; 

    // If historyForAIInput is empty (e.g. first message after a clear), 
    // and initialBotMessage was the start, pass empty string.
    // Otherwise, format the existing history.
    const currentHistoryString = (historyForAIInput.length === 1 && historyForAIInput[0].id === initialBotMessage.id) || historyForAIInput.length === 0
      ? "" 
      : getFormattedHistoryForAI(historyForAIInput);


    try {
      const input: SmartChatInput = { 
        userInput, 
        chatHistory: currentHistoryString 
      };
      const output = await smartChat(input);

      // Construct the full history that ChatInterface should display.
      // This includes the messages before the current user input, the user input itself, and the new bot response.
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
        ...historyForAIInput, // History before user's current message
        userMessageForHistory, // User's current message
        botMessageForHistory  // AI's response to current message
      ];

      return { 
        response: output.chatbotResponse, // This is just the bot's latest reply text
        history: newFullHistoryArray     // This is the complete history ChatInterface should adopt
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
    // The ChatInterface will reset its internal messages to its `initialMessages`.
    // No further state change needed in SmartChatClient as `handleSendMessage` derives history
    // from `currentMessagesFromChatInterface` passed by ChatInterface.
    // console.log("Chat cleared in SmartChatClient");
  };


  return (
    <ChatInterface
      sendMessage={handleSendMessage}
      initialMessages={currentInitialMessages} 
      placeholder="Ask me anything, yaar!"
      chatHistoryEnabled={true} 
      onClearChat={handleChatClear}
    />
  );
}
