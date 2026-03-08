import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  role: "assistant" | "user";
  children: React.ReactNode;
  className?: string;
}

export function ChatBubble({ role, children, className }: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "animate-slide-up flex",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-[0.95rem] leading-relaxed shadow-sm",
          role === "assistant"
            ? "rounded-tl-md bg-chat-assistant text-foreground"
            : "rounded-tr-md bg-chat-user text-chat-user-foreground",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}