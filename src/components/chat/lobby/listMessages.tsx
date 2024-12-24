import { RefObject, useRef } from "react";

import { useChatScroll } from "@/hooks/useChatScroll";
import { ChattingType } from "@/model/chatting";

import { Message } from "../message";
import { ScrollNotification } from "../ScrollNotification";

type ListMessagesType = {
  messageList: ChattingType[];
};

export const ListMessages = ({ messageList }: ListMessagesType) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { userScrolled, notification, handleOnScroll, scrollDown } =
    useChatScroll({
      scrollRef: scrollRef as RefObject<HTMLDivElement>,
      messageList,
    });

  return (
    <div
      className="flex h-full flex-1 flex-col overflow-y-auto p-3"
      ref={scrollRef}
      onScroll={handleOnScroll}
    >
      <div className="space-y-7">
        {messageList.map((message, idx) => (
          <Message key={idx} message={message} />
        ))}
      </div>
      <ScrollNotification
        userScrolled={userScrolled}
        notification={notification}
        scrollDown={scrollDown}
      />
    </div>
  );
};
