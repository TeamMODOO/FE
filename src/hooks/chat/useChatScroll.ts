import { RefObject, useEffect, useState } from "react";

import { ChattingType } from "@/model/chatting";

interface UseScrollProps {
  scrollRef: RefObject<HTMLDivElement>;
  messageList: ChattingType[];
}

export const useChatScroll = ({ scrollRef, messageList }: UseScrollProps) => {
  const [userScrolled, setUserScrolled] = useState(false);
  const [notification, setNotification] = useState(0);

  useEffect(() => {
    if (scrollRef.current && !userScrolled) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [scrollRef, userScrolled, messageList]);

  useEffect(() => {
    if (userScrolled) {
      setNotification((prev) => prev + 1);
    }
  }, [userScrolled, messageList]);

  const handleOnScroll = () => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      const isScroll =
        scrollContainer.scrollTop <
        scrollContainer.scrollHeight - scrollContainer.clientHeight - 10;

      setUserScrolled(isScroll);
      if (!isScroll) setNotification(0);
    }
  };

  const scrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setUserScrolled(false);
      setNotification(0);
    }
  };

  return {
    userScrolled,
    notification,
    handleOnScroll,
    scrollDown,
  };
};
