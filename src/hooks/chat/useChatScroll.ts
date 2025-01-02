import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useState,
} from "react";

import { ChattingType } from "@/model/chatting";

interface UseScrollProps {
  scrollRef: RefObject<HTMLDivElement>;
  setNotification: Dispatch<SetStateAction<number>>;
  messageList: ChattingType[];
  isOpen: boolean;
}

export const useChatScroll = ({
  scrollRef,
  setNotification,
  messageList,
  isOpen,
}: UseScrollProps) => {
  const [userScrolled, setUserScrolled] = useState(false);

  useEffect(() => {
    if (scrollRef.current && !userScrolled) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [scrollRef, userScrolled, messageList, isOpen]);

  const handleOnScroll = () => {
    const CHAT_CARD_HEIGHT = 70;
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      const isScroll =
        scrollContainer.scrollTop <
        scrollContainer.scrollHeight -
          scrollContainer.clientHeight -
          CHAT_CARD_HEIGHT;

      setUserScrolled(isScroll);
      if (!isScroll) setNotification(0);
    }
  };

  const scrollDown = () => {
    if (scrollRef.current) {
      // 최적화 필요
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setUserScrolled(false);
      setNotification(0);
    }
  };

  return {
    userScrolled,
    handleOnScroll,
    scrollDown,
  };
};
