
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground">Loading Social Media Tools...</p>
      <p className="text-sm text-muted-foreground">Gathering the latest trends, please wait.</p>
    </div>
  );
}
