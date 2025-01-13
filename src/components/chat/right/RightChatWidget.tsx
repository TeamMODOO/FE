import { useEffect, useRef, useState } from "react";

import { ScrollNotification } from "@/app/lobby/_components/Widget/ScrollNotification";
import { CardFooter } from "@/components/ui/card";
import { useChatScroll } from "@/hooks/chat/useChatScroll";
import { useChatSocket } from "@/hooks/chat/useChatSocket";

import { ChatButton } from "./RightChatButton";
import { ChatContainer } from "./RightChatContainer";
import { ChatInputArea } from "./RightChatInputArea";
import { ChatMessageList } from "./RightChatMessageList";

interface ChatWidgetProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export function ChatWidget({
  isOpen: propIsOpen,
  setIsOpen: propSetIsOpen,
}: ChatWidgetProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [notification, setNotification] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // 우선순위: prop이 있으면 prop 사용, 없으면 내부 state 사용
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

  /**
   * =========================
   * 1) Esc 키 눌렀을 때 모달 닫기
   * =========================
   */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, setIsOpen]);

  /**
   * =========================
   * 2) 모달 열릴 때 배경 스크롤 막기
   * =========================
   */
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

  /** 모달 토글 */
  const toggleChat = () => setIsOpen(!isOpen);

  /** Enter 키 핸들링 */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return;
    if (e.shiftKey) return;
    if (e.nativeEvent.isComposing) return;

    e.preventDefault();
    handleSendMessage();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <>
      {/* 모달(챗) 열림 상태 + 애니메이션 시점에 표시 */}
      {(isOpen || isAnimating) && (
        <ChatContainer isAnimating={isAnimating} onClose={toggleChat}>
          <ChatMessageList
            messages={messageList}
            scrollRef={scrollRef}
            onScroll={handleOnScroll}
          />
          <CardFooter>
            <ChatInputArea
              value={messageValue}
              onChange={setMessageValue}
              onSubmit={handleSubmit}
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

      {/* 모달이 닫혀 있을 때만 버튼 표시 */}
      {!isOpen && (
        <ChatButton onClick={toggleChat} notification={notification} />
      )}
    </>
  );
}
