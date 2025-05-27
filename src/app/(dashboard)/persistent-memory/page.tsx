import { PageHeader } from "@/components/common/page-header";
import { PersistentMemoryChatClient } from "@/components/persistent-memory/persistent-memory-chat-client";
import { BrainCircuit } from "lucide-react";

export const metadata = {
  title: "Persistent Memory Chat | PopGPT :AI",
};

export default function PersistentMemoryChatPage() {
  return (
    <>
      <PageHeader
        title="Persistent Memory Chat"
        description="A chatbot that recalls past conversations to provide contextually relevant responses."
        icon={BrainCircuit}
      />
      <PersistentMemoryChatClient />
    </>
  );
}
