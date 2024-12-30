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

export default function ChatWidget({ roomId }: { roomId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleChat = () => setIsOpen(!isOpen);

  const { messageList, messageValue, setMessageValue, handleSendMessage } =
    useChatSocket({
      roomType: "meeting_room",
      roomId: "floor07", // 수정 필요
    });

  const scrollRef = useRef<HTMLDivElement>(null);
  const { userScrolled, notification, handleOnScroll, scrollDown } =
    useChatScroll({
      scrollRef: scrollRef as RefObject<HTMLDivElement>,
      messageList,
    });

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
                <div key={index} className="mb-2 rounded-lg bg-secondary p-2">
                  {list.user_name}: {list.message}{" "}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <form onSubmit={sendMessage} className="flex w-full gap-2">
              <Input
                value={messageValue}
                onChange={(e) => setMessageValue(e.target.value)}
                placeholder="Type a message..."
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
      </Button>
    </div>
  );
}
