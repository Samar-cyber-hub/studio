
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

  // SmartChatClient will manage the source of truth for initialMessages for ChatInterface
  const [currentInitialMessages, setCurrentInitialMessages] = useState<Message[]>([initialBotMessage]);

  // This effect ensures ChatInterface is re-initialized with the correct initial messages
  // if they are reset (e.g. after a clear chat operation).
  useEffect(() => {
    setCurrentInitialMessages([initialBotMessage]);
  }, []);


  const getFormattedHistoryForAI = (currentMessages: Message[]): string => {
    // Filter out the initial bot message if it's the only "history" before user input
    const relevantMessages = currentMessages.filter(msg => msg.id !== initialBotMessage.id || currentMessages.length > 1);
    return relevantMessages
      .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
      .join("\\n");
  };
  
  const handleSendMessage = async (userInput: string, currentMessagesFromChatInterface?: Message[]) => {
    // `currentMessagesFromChatInterface` from ChatInterface already includes the latest user message.
    // We need the history *before* this latest user message for the AI.
    const historyForAIInput = currentMessagesFromChatInterface 
        ? currentMessagesFromChatInterface.slice(0, -1) // Exclude the last message (current user input)
        : []; 

    const currentHistoryString = getFormattedHistoryForAI(historyForAIInput);

    try {
      const input: SmartChatInput = { 
        userInput, 
        chatHistory: currentHistoryString 
      };
      const output = await smartChat(input);

      // Construct the full history array as expected by ChatInterface for an update
      // This will include: previous history, the user's message, and the bot's new response.
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
        response: output.chatbotResponse, // Only the new bot response content
        history: newFullHistoryArray      // The complete, updated history array
      };

    } catch (error) {
      console.error("Smart chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      
      // Construct history for error case
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
    // When chat is cleared, ChatInterface needs to be re-rendered with the *new* initial messages.
    // Updating currentInitialMessages will trigger a re-render of ChatInterface with the fresh initial state.
    setCurrentInitialMessages([initialBotMessage]); 
  };

  const handleSaveChatMessage = (messageContent: string) => {
    console.log("Chat to save:", messageContent);
    toast({
      title: "Chat Snippet Saved!",
      description: "The chat message has been copied to the console (simulation).", 
    });
    // To actually copy to clipboard:
    // navigator.clipboard.writeText(messageContent).then(() => {
    //   toast({ title: "Copied to clipboard!" });
    // }).catch(err => {
    //   toast({ title: "Failed to copy", variant: "destructive" });
    // });
  };
  
  // The ChatInterface will handle its own state for deleting single messages.
  // SmartChatClient doesn't need a specific handler passed to ChatInterface for this,
  // as ChatInterface will update its internal `messages` state which is then used for `sendMessage`.

  return (
    <ChatInterface
      sendMessage={handleSendMessage}
      initialMessages={currentInitialMessages} 
      placeholder="Ask me anything, yaar!"
      chatHistoryEnabled={true} 
      onClearChat={handleChatClear}
      onSaveChatMessage={handleSaveChatMessage}
      // onDeleteSingleMessage can be omitted here if ChatInterface handles its own state
      // or passed if SmartChatClient needs to be aware of single message deletions for other reasons.
      // For now, ChatInterface manages its own list.
    />
  );
}
