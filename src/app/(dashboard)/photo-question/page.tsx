
import { PageHeader } from "@/components/common/page-header";
import { PhotoQuestionClient } from "@/components/photo-question/photo-question-client";
import { Camera } from "lucide-react";

export const metadata = {
  title: "Photo Question Solver | PopGPT :AI",
};

export default function PhotoQuestionPage() {
  return (
    <>
      <PageHeader
        title="Photo Question Solver 📷❓"
        description="Scan a question with your camera, and get a solution, similar questions, and a humorous explanation!"
        icon={Camera}
      />
      <PhotoQuestionClient />
    </>
  );
}
