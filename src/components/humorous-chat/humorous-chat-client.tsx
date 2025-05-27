
"use client";

import { ChatInterface } from "@/components/common/chat-interface";
import { humorousChat, type HumorousChatInput } from "@/ai/flows/humorous-chat";
import { toast } from "@/hooks/use-toast";

export function HumorousChatClient() {
  const handleSendMessage = async (message: string) => {
    try {
      const input: HumorousChatInput = { message };
      const output = await humorousChat(input);
      return output.response;
    } catch (error) {
      console.error("Humorous chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      return "Sorry, something went wrong. Please try again later.";
    }
  };

  return (
    <ChatInterface
      sendMessage={handleSendMessage}
      placeholder="Ask me something funny or interesting!"
      initialMessages={[
        {
          id: "initial-bot",
          role: "assistant",
          content: "Namaste! yaar? Kya haal chaal hai aur! sab badhiya hai ghar mein aur aaj ka din kaisa hai ",
          createdAt: new Date()
        }
      ]}
    />
  );
}

