import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Position } from "@/model/chatting";

interface ChatContainerProps extends Position {
  isAnimating: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function ChatContainer({
  position,
  isAnimating,
  onClose,
  children,
}: ChatContainerProps) {
  const containerStyles = {
    right: {
      wrapper: "fixed inset-0 z-[60] flex items-start justify-end p-4",
      dimensions: "w-full md:w-96",
      card: "flex h-[calc(100vh-2rem)] flex-col",
    },
    left: {
      wrapper: "fixed bottom-2.5 left-2.5",
      dimensions: "w-full",
      card: "relative flex h-96 w-80 flex-col",
    },
  }[position];

  return (
    <div className={containerStyles.wrapper}>
      <div
        className={`
          ${containerStyles.dimensions}
          transition-all duration-200 ease-out
          ${
            isAnimating
              ? "scale-100 opacity-100"
              : "pointer-events-none scale-95 opacity-0"
          }
        `}
      >
        <Card className={containerStyles.card}>
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="font-semibold">Chat</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </CardHeader>
          {children}
        </Card>
      </div>
    </div>
  );
}
