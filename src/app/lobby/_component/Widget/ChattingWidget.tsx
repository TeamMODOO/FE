"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { RefObject, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useChatScroll } from "@/hooks/chat/useChatScroll";
import { useChatSocket } from "@/hooks/chat/useChatSocket";

import { ChatInput } from "./ChatInput";
import { ScrollNotification } from "./ScrollNotification";

// 부모에서 받아올 props 타입
interface ChatWidgetProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function ChattingWidget({ isOpen, setIsOpen }: ChatWidgetProps) {
  const { messageList, messageValue, setMessageValue, handleSendMessage } =
    useChatSocket({
      roomType: "floor",
      roomId: "floor07",
    });

  const scrollRef = useRef<HTMLDivElement>(null);
  const { userScrolled, notification, handleOnScroll, scrollDown } =
    useChatScroll({
      scrollRef: scrollRef as RefObject<HTMLDivElement>,
      messageList,
    });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <>
      {isOpen && (
        <Card className="fixed inset-0 z-[60] flex flex-col md:bottom-auto md:left-auto md:right-4 md:top-4 md:h-[calc(100vh-2rem)] md:w-96">
          <CardHeader className="pt-safe-top flex flex-row items-center justify-between md:pt-0">
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
                  {list.user_name}: {list.message}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <form onSubmit={sendMessage} className="flex w-full gap-2">
              <ChatInput
                messageValue={messageValue}
                setMessageValue={setMessageValue}
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
      {!isOpen && (
        <Button
          onClick={toggleChat}
          size="icon"
          className="fixed right-4 top-4 z-50 size-12 rounded-full"
        >
          <MessageCircle className="size-6" />
        </Button>
      )}
    </>
  );
}
