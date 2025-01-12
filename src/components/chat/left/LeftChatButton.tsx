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
      className="fixed bottom-4 left-4 size-12 rounded-full"
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
