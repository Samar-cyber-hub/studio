
import { PageHeader } from "@/components/common/page-header";
import { SocialMediaOptimizationClient } from "@/components/social-media-optimization/social-media-optimization-client";
import { Share2 } from "lucide-react";

export const metadata = {
  title: "Social Media Optimization | PopGPT :AI",
};

export default function SocialMediaOptimizationPage() {
  return (
    <>
      <PageHeader
        title="Social Media Optimization Too🎞️🎥l"
        description="Get suggestions for trending topics, tags, hashtags, video titles, and SEO descriptions."
        icon={Share2}
      />
      <SocialMediaOptimizationClient />
    </>
  );
}
