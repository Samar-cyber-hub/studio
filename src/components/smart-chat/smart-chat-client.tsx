
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
    // This effect ensures that if `initialBotMessage` were dynamic and changed,
    // `currentInitialMessages` would update. For a static `initialBotMessage`,
    // it primarily runs on mount.
  }, [initialBotMessage]);


  const getFormattedHistoryForAI = (currentMessages: Message[]): string => {
    // Filter out the very first initial bot message if it's the only one,
    // or if it's present along with other messages (to avoid sending it as history if it was just cleared)
    const relevantMessages = currentMessages.filter(msg => msg.id !== initialBotMessage.id || currentMessages.length > 1);
    return relevantMessages
      .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
      .join("\\n"); // Use a literal newline character for the AI flow
  };
  
  // userInput is the string content of the user's current message.
  // historyBeforeCurrentUser is an array of Message objects representing the chat history *before* the current userInput.
  const handleSendMessage = async (userInput: string, historyBeforeCurrentUser?: Message[]) => {
    const actualHistoryForAI = historyBeforeCurrentUser || [];
    const currentHistoryString = getFormattedHistoryForAI(actualHistoryForAI);

    try {
      const inputForAI: SmartChatInput = { 
        userInput: userInput, // The current user's direct input string
        chatHistory: currentHistoryString 
      };
      const output = await smartChat(inputForAI);
      
      // Construct the Message object for the current user's input for display
      const currentUserMessageForDisplay: Message = {
        // This ID is created client-side in ChatInterface for optimistic update.
        // To maintain consistency, we re-create it here for the history array.
        // A more robust solution might involve passing the optimistic message's ID.
        // For now, generating a new one is fine as React handles key changes.
        id: Date.now().toString() + "-user", 
        role: "user",
        content: userInput, // Use the original userInput string
        createdAt: new Date()
      };
      
      const botMessageForDisplay: Message = {
        id: Date.now().toString() + "-bot",
        role: "assistant",
        content: output.chatbotResponse,
        createdAt: new Date(),
      };
      
      // This is the full history array that ChatInterface will use to re-render.
      const newFullHistoryArray: Message[] = [
        ...actualHistoryForAI,        // History before current user's message
        currentUserMessageForDisplay, // Current user's message
        botMessageForDisplay          // Bot's response
      ];

      return { 
        response: output.chatbotResponse, // This is for ChatInterface if it doesn't use history
        history: newFullHistoryArray     // This is the complete history for ChatInterface to set
      };

    } catch (error) {
      console.error("Smart chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      
      const currentUserMessageForDisplayOnError: Message = {
        id: Date.now().toString() + "-user-err",
        role: "user",
        content: userInput, // Original user input
        createdAt: new Date(),
      };
       const errorBotMessage: Message = {
        id: Date.now().toString() + "-bot-error",
        role: "assistant",
        content: "Sorry, something went wrong. Please try again later.",
        createdAt: new Date(),
      };
       const historyOnError: Message[] = [
        ...actualHistoryForAI,
        currentUserMessageForDisplayOnError,
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
      onViewSavedChats={handleViewSavedChats} 
    />
  );
}
