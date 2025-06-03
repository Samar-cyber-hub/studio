
import { Loader2, Camera } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] p-4">
      <Camera className="h-10 w-10 text-primary mb-3" />
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground">Loading Photo Question Solver...</p>
      <p className="text-sm text-muted-foreground">Warming up the camera and AI vision!</p>
    </div>
  );
}
