import { MessageCircle, Send, X } from "lucide-react";
import { RefObject, useRef, useState } from "react";

import { ScrollNotification } from "@/app/lobby/_component/Widget/ScrollNotification";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useChatScroll } from "@/hooks/chat/useChatScroll";
import { useChatSocket } from "@/hooks/chat/useChatSocket";
import { formatTime } from "@/lib/utils/date";

export default function ChatWidget({ roomId }: { roomId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState<number>(0);

  const { messageList, messageValue, setMessageValue, handleSendMessage } =
    useChatSocket({
      roomType: "floor",
      roomId: "floor07",
      setNotification,
    });

  const scrollRef = useRef<HTMLDivElement>(null);
  const { userScrolled, handleOnScroll, scrollDown } = useChatScroll({
    scrollRef: scrollRef as RefObject<HTMLDivElement>,
    setNotification,
    messageList,
    isOpen,
  });

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <div className="fixed bottom-4 left-4">
      {isOpen && (
        <Card className="relative mb-4 flex h-96 w-80 flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="font-semibold">Chat</h3>
            <Button variant="ghost" size="icon" onClick={toggleChat}>
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent
            className="flex grow flex-col overflow-auto"
            ref={scrollRef}
            onScroll={handleOnScroll}
          >
            <div className="mt-auto">
              {messageList.map((list, index) => (
                <div key={index} className="mb-2">
                  <div className="rounded-lg bg-secondary p-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{list.user_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(list.create_at)}
                        </span>
                      </div>
                      <span className="text-sm">{list.message}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <form onSubmit={sendMessage} className="flex w-full gap-2">
              <Input
                value={messageValue}
                onChange={(e) => setMessageValue(e.target.value)}
                placeholder="send message"
              />
              <Button type="submit" size="icon">
                <Send className="size-4" />
              </Button>
            </form>
          </CardFooter>
          <ScrollNotification
            userScrolled={userScrolled}
            notification={notification}
            scrollDown={scrollDown}
          />
        </Card>
      )}
      <Button onClick={toggleChat} size="icon" className="size-12 rounded-full">
        <MessageCircle className="size-6" />
        {!isOpen && notification > 0 && (
          <div className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
            {notification}
          </div>
        )}
      </Button>
    </div>
  );
}
