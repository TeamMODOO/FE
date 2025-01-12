import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

interface ChatContainerProps {
  isAnimating: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function ChatContainer({
  isAnimating,
  onClose,
  children,
}: ChatContainerProps) {
  return (
    <div className="fixed bottom-2.5 left-2.5">
      <div
        className={`
          w-full transition-all duration-200 ease-out
          ${
            isAnimating
              ? "scale-100 opacity-100"
              : "pointer-events-none scale-95 opacity-0"
          }
        `}
      >
        <Card className="relative flex h-96 w-80 flex-col">
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
