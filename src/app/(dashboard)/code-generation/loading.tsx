
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-xl">
            <Loader2 className="mr-3 h-6 w-6 animate-spin text-primary" />
            Loading Code Generation...
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>Please wait while we prepare the coding tools.</p>
        </CardContent>
      </Card>
    </div>
  );
}
