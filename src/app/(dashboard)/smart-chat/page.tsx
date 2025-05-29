
import { PageHeader } from "@/components/common/page-header";
import { SmartChatClient } from "@/components/smart-chat/smart-chat-client";
import { BotMessageSquare } from "lucide-react";

export const metadata = {
  title: "Friend : AI 😊😎🤖 | PopGPT :AI",
};

export default function SmartChatPage() {
  return (
    <>
      <PageHeader
        title="Friend : AI 😊😎🤖"
        description="Chat with a humorous AI that remembers your conversations and uses Indian colloquial language."
        icon={BotMessageSquare}
      />
      <SmartChatClient />
    </>
  );
}
