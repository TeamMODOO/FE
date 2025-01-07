import { useEffect, useRef, useState } from "react";

import { ScrollNotification } from "@/app/lobby/_components/Widget/ScrollNotification";
import { CardFooter } from "@/components/ui/card";
import { useChatScroll } from "@/hooks/chat/useChatScroll";
import { useChatSocket } from "@/hooks/chat/useChatSocket";
import { Position } from "@/model/chatting";

import { ChatButton } from "./ChatButton";
import { ChatContainer } from "./ChatContainer";
import { ChatInputArea } from "./ChatInputArea";
import { ChatMessageList } from "./ChatMessageList";

interface ChatWidgetProps extends Position {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export function ChatWidget({
  position,
  isOpen: propIsOpen,
  setIsOpen: propSetIsOpen,
}: ChatWidgetProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [notification, setNotification] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const isOpen = propIsOpen ?? internalIsOpen;
  const setIsOpen = propSetIsOpen ?? setInternalIsOpen;

  const { messageList, messageValue, setMessageValue, handleSendMessage } =
    useChatSocket(setNotification);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { userScrolled, handleOnScroll, scrollDown } = useChatScroll({
    scrollRef,
    messageList,
    isOpen,
    setNotification,
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      if (!userScrolled) setNotification(0);
      const timer = setTimeout(() => {
        document.body.style.overflow = "unset";
      }, 200);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, userScrolled]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return;
    if (e.shiftKey) return;
    e.preventDefault();
    sendMessage(e);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <>
      {(isOpen || isAnimating) && (
        <ChatContainer
          position={position}
          isAnimating={isAnimating}
          onClose={toggleChat}
        >
          <ChatMessageList
            messages={messageList}
            scrollRef={scrollRef}
            onScroll={handleOnScroll}
          />
          <CardFooter>
            <ChatInputArea
              position={position}
              value={messageValue}
              onChange={setMessageValue}
              onSubmit={sendMessage}
              onKeyDown={handleKeyDown}
            />
          </CardFooter>
          <ScrollNotification
            userScrolled={userScrolled}
            notification={notification}
            scrollDown={scrollDown}
          />
        </ChatContainer>
      )}
      {!isOpen && (
        <ChatButton
          position={position}
          onClick={toggleChat}
          notification={notification}
        />
      )}
    </>
  );
}
