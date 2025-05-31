import { PageHeader } from "@/components/common/page-header";
import { PasswordGenerationClient } from "@/components/password-generation/password-generation-client";
import { KeyRound } from "lucide-react";

export const metadata = {
  title: "Password Generator | PopGPT :AI",
};

export default function PasswordGenerationPage() {
  return (
    <>
      <PageHeader
        title="Password Generator 🖥🔑🔒"
        description="Create very strong and secure passwords based on your requirements."
        icon={KeyRound}
      />
      <PasswordGenerationClient />
    </>
  );
}
