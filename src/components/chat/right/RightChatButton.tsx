import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ChatButtonProps {
  onClick: () => void;
  notification: number;
}

export function ChatButton({ onClick, notification }: ChatButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="bg-color-none fixed right-32 top-6 z-50 size-20 rounded-full border-2 border-[rgba(111,99,98,1)] bg-gradient-to-b from-black/70 to-black/90 text-[rgba(171,159,158,1)] hover:bg-[rgba(255,255,255,0.9)]"
      title="채팅"
    >
      <MessageCircle className="min-h-8 min-w-8" />
      {notification > 0 && (
        <div className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
          {notification}
        </div>
      )}
    </Button>
  );
}
