import React, { RefObject, useEffect, useRef, useState } from "react";

import { MessageCircle, Send, X } from "lucide-react";

import { ScrollNotification } from "@/app/lobby/_components/Widget/ScrollNotification";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useChatScroll } from "@/hooks/chat/useChatScroll";
import { useChatSocket } from "@/hooks/chat/useChatSocket";
import { formatTime } from "@/lib/utils/date";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState<number>(0);

  const { messageList, messageValue, setMessageValue, handleSendMessage } =
    useChatSocket(setNotification);

  const scrollRef = useRef<HTMLDivElement>(null);
  const { userScrolled, handleOnScroll, scrollDown } = useChatScroll({
    scrollRef: scrollRef as RefObject<HTMLDivElement>,
    setNotification,
    messageList,
    isOpen,
  });

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else {
      if (!userScrolled) setNotification(0);
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return;
    if (e.shiftKey) return;
    else {
      e.preventDefault(); // 기본 줄바꿈 동작 방지
      sendMessage(e);
    }
  };

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
                      <span className="max-w-[326px] whitespace-pre-wrap break-all text-sm">
                        {list.message}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <form
              onSubmit={sendMessage}
              className="flex w-[286px] justify-between gap-2"
            >
              <Textarea
                value={messageValue}
                placeholder="send message"
                onKeyDown={handleKeyDown}
                onChange={(e) => setMessageValue(e.target.value)}
                className="min-h-[40px] w-[225px] resize-none p-2"
              />
              <Button type="submit" size="icon" className="size-[58px]">
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
