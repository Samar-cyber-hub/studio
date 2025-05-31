import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] p-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground">Loading Password Generator...</p>
      <p className="text-sm text-muted-foreground">Preparing the security tools, please wait.</p>
    </div>
  );
}
