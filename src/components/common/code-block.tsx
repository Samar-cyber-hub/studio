"use client";

import ReactSyntaxHighlighter from "react-syntax-highlighter";
// Using a style that might work well with both light/dark themes, or pick one like atomOneDark
// For a more theme-adaptive style, one might need to create a custom style or find one that uses CSS vars.
import { hybrid } from "react-syntax-highlighter/dist/esm/styles/hljs"; 
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clipboard } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  language: string;
  code: string;
  className?: string;
}

export function CodeBlock({ language, code, className }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  // Ensure component is client-side only for navigator
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);


  const handleCopy = () => {
    if (!isClient) return;
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <Card className={cn("my-4 overflow-hidden relative group", className)}>
      <div className="bg-muted px-4 py-2 text-xs text-muted-foreground flex justify-between items-center">
        <span>{language}</span>
        {isClient && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-50 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
            aria-label="Copy code"
          >
            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
          </Button>
        )}
      </div>
      <div className="text-sm">
        <ReactSyntaxHighlighter
          language={language}
          style={hybrid} // This style has a somewhat neutral background
          showLineNumbers
          wrapLongLines={false} // Set to true if you prefer wrapping
          customStyle={{ margin: 0, padding: "1rem", background: "transparent" }}
          lineNumberStyle={{ opacity: 0.5, userSelect: "none" }}
        >
          {code}
        </ReactSyntaxHighlighter>
      </div>
    </Card>
  );
}
