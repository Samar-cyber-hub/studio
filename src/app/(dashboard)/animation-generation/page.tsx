
import { PageHeader } from "@/components/common/page-header";
import { AnimationGenerationClient } from "@/components/animation-generation/animation-generation-client";
import { Film } from "lucide-react"; // Or Clapperboard, Video

export const metadata = {
  title: "Animation Concept Generator | PopGPT :AI",
};

export default function AnimationGenerationPage() {
  return (
    <>
      <PageHeader
        title="Animation Concept Generator ✨🚶‍♂️🔥⚡"
        description="Generate visual concepts for 3D cartoons, 2D anime, talking avatars, or virtual studio scenes."
        icon={Film}
      />
      <AnimationGenerationClient />
    </>
  );
}
