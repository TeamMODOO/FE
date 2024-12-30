import { ArrowDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ScrollNotificationProps {
  userScrolled: boolean;
  notification: number;
  scrollDown: () => void;
}

export const ScrollNotification = ({
  userScrolled,
  notification,
  scrollDown,
}: ScrollNotificationProps) => {
  if (!userScrolled) return null;

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
      <Button
        variant={notification > 0 ? "default" : "outline"}
        size="sm"
        className="shadow-lg transition-all hover:scale-105 focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={scrollDown}
      >
        {notification > 0 ? (
          <>
            <span className="mr-2">New messages</span>
            <Badge variant="secondary">{notification}</Badge>
          </>
        ) : (
          <ArrowDown className="size-4" />
        )}
      </Button>
    </div>
  );
};
