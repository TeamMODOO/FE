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
        <Card
          className="bg-color-none relative flex h-96 w-80 flex-col
        border-[rgba(111,99,98,1)] bg-[rgba(0,0,0,0.9)]
        "
        >
          <CardHeader
            className="
          flex flex-row items-center justify-between
          text-2xl text-fuchsia-500
          "
          >
            <h3 className="font-semibold">회의실 채팅</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="size-4 text-white" />
            </Button>
          </CardHeader>
          {children}
        </Card>
      </div>
    </div>
  );
}
