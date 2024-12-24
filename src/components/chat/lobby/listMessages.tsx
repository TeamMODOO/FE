import { RefObject, useRef } from "react";

import { useScroll } from "@/hooks/useChatScroll";
import { ChattingResponse } from "@/model/chatting";

import { Message } from "../message";
import { ScrollNotification } from "../ScrollNotification";

type ListMessagesType = {
  messageList: ChattingResponse[];
};

export const ListMessages = ({ messageList }: ListMessagesType) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { userScrolled, notification, handleOnScroll, scrollDown } = useScroll({
    scrollRef: scrollRef as RefObject<HTMLDivElement>,
    messageList,
  });

  const messages = [
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
    {
      created_at: "2000.02.28",
      id: "123",
      text: "123",
      user_id: "123",
      users: {
        avatar_url: "",
        created_at: "20000228",
        display_name: "123",
        id: "123",
      },
    },
  ];

  return (
    <div
      className="flex h-full flex-1 flex-col overflow-y-auto p-3"
      ref={scrollRef}
      onScroll={handleOnScroll}
    >
      <div className="space-y-7">
        {messages.map((message, idx) => (
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
