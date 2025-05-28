
import { PageHeader } from "@/components/common/page-header";
import { ImageGenerationClient } from "@/components/image-generation/image-generation-client";
import { ImageIcon } from "lucide-react";

export const metadata = {
  title: "Image Generation | PopGPT :AI",
};

export default function ImageGenerationPage() {
  return (
    <>
      <PageHeader
        title="AI Image Generation"
        description="Create stunning images from your text prompts. Describe what you want to see!"
        icon={ImageIcon}
      />
      <ImageGenerationClient />
    </>
  );
}
