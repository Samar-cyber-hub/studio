import { PageHeader } from "@/components/common/page-header";
import { CodeGenerationClient } from "@/components/code-generation/code-generation-client";
import { CodeXml } from "lucide-react";

export const metadata = {
  title: "Code Generation | PopGPT :AI",
};

export default function CodeGenerationPage() {
  return (
    <>
      <PageHeader
        title="Professional Code Generation"
        description="Generate error-free code snippets for software, apps, websites, and games."
        icon={CodeXml}
      />
      <CodeGenerationClient />
    </>
  );
}
