import { PageHeader } from "@/components/common/page-header";
import { MediaGenerationClient } from "@/components/media-generation/media-generation-client";
import { ImageIcon } from "lucide-react";

export const metadata = {
  title: "AI Media Generation | PopGPT :AI",
};

export default function MediaGenerationPage() {
  return (
    <>
      <PageHeader
        title="AI-Powered Media Generation"
        description="Generate high-quality images. Support for 3D models, realistic images, and fusion art coming soon."
        icon={ImageIcon}
      />
      <MediaGenerationClient />
    </>
  );
}
