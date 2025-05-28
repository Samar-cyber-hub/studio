
import { PageHeader } from "@/components/common/page-header";
import { LogoGenerationClient } from "@/components/logo-generation/logo-generation-client";
import { Palette } from "lucide-react";

export const metadata = {
  title: "AI Logo Generation | PopGPT :AI",
};

export default function LogoGenerationPage() {
  return (
    <>
      <PageHeader
        title="AI Logo Generation 🎨"
        description="Generate 10 unique logo concepts from your ideas. Describe your brand or style!"
        icon={Palette}
      />
      <LogoGenerationClient />
    </>
  );
}
