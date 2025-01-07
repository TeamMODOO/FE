import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Position } from "@/model/chatting";

interface ChatButtonProps extends Position {
  onClick: () => void;
  notification: number;
}

export function ChatButton({
  position,
  onClick,
  notification,
}: ChatButtonProps) {
  const buttonStyles = {
    left: "fixed bottom-4 left-4 size-12 rounded-full",
    right: "fixed right-4 top-4 z-50 size-12 rounded-full",
  }[position];

  return (
    <Button onClick={onClick} size="icon" className={buttonStyles}>
      <MessageCircle className="size-6" />
      {notification > 0 && (
        <div className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
          {notification}
        </div>
      )}
    </Button>
  );
}
