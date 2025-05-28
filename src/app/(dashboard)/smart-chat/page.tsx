import { PageHeader } from "@/components/common/page-header";
import { SmartChatClient } from "@/components/smart-chat/smart-chat-client";
import { BotMessageSquare } from "lucide-react";

export const metadata = {
  title: "Smart Chat | PopGPT :AI",
};

export default function SmartChatPage() {
  return (
    <>
      <PageHeader
        title="Smart Chat"
        description="Chat with a humorous AI that remembers your conversations and uses Indian colloquial language."
        icon={BotMessageSquare}
      />
      <SmartChatClient />
    </>
  );
}
