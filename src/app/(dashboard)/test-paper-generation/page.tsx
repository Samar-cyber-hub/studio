
import { PageHeader } from "@/components/common/page-header";
import { TestPaperGenerationClient } from "@/components/test-paper-generation/test-paper-generation-client";
import { ClipboardList } from "lucide-react";

export const metadata = {
  title: "Test Time 💥👨‍🏫 | PopGPT :AI",
};

export default function TestPaperGenerationPage() {
  return (
    <>
      <PageHeader
        title="Test Time 💥👨‍🏫"
        description="Generate professional test papers and solutions for students."
        icon={ClipboardList}
      />
      <TestPaperGenerationClient />
    </>
  );
}

    