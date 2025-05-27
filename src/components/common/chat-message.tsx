import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bot, User, Volume2, StopCircle } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from "./code-block";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: Date;
}

interface ChatMessageProps {
  message: Message;
  onSpeak?: (text: string) => void;
  onStopSpeak?: () => void;
  isSpeaking?: boolean;
  isCurrentSpeakingMessage?: boolean;
}

export function ChatMessage({ message, onSpeak, onStopSpeak, isSpeaking, isCurrentSpeakingMessage }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isBot = message.role === "assistant";

  return (
    <div className={cn("flex items-start gap-3 py-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback>
            <Bot className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[75%] rounded-xl p-3 shadow-md text-sm md:text-base",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card text-card-foreground"
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <CodeBlock
                  language={match[1]}
                  code={String(children).replace(/\n$/, '')}
                  {...props}
                />
              ) : (
                <code className={cn(className, "bg-muted px-1 py-0.5 rounded-sm")} {...props}>
                  {children}
                </code>
              );
            },
            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
          }}
        >
          {message.content}
        </ReactMarkdown>
        {isBot && onSpeak && onStopSpeak && (
          <div className="mt-2">
            {isCurrentSpeakingMessage && isSpeaking ? (
               <Button variant="ghost" size="sm" onClick={onStopSpeak} className="h-7 text-xs px-2 py-1">
                 <StopCircle className="mr-1 h-4 w-4" /> Stop
               </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => onSpeak(message.content)} className="h-7 text-xs px-2 py-1">
                <Volume2 className="mr-1 h-4 w-4" /> Speak
              </Button>
            )}
          </div>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback>
            <User className="h-5 w-5 text-accent" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
