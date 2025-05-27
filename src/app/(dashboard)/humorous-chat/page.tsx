import { PageHeader } from "@/components/common/page-header";
import { HumorousChatClient } from "@/components/humorous-chat/humorous-chat-client";
import { MessageSquareHeart } from "lucide-react";

export const metadata = {
  title: "Humorous Chat | PopGPT :AI",
};

export default function HumorousChatPage() {
  return (
    <>
      <PageHeader
        title="Humorous Chat"
        description="Chat with an AI that responds in a humorous, friendly style, using Indian colloquial language."
        icon={MessageSquareHeart}
      />
      <HumorousChatClient />
    </>
  );
}
