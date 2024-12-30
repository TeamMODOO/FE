"use client";

import { useChatSocket } from "@/hooks/chat/useChatSocket";

import { ChatInput } from "./ChatInput";
import { ListMessages } from "./ListMessages";

export const ChatMessages = () => {
  const { messageList, messageValue, setMessageValue, handleSendMessage } =
    useChatSocket({
      roomId: "floor07",
    });

  return (
    <div className=" h-screen pb-10">
      <div className="relative flex h-[98%] flex-col rounded-md">
        <ListMessages messageList={messageList} />
        <ChatInput
          messageValue={messageValue}
          setMessageValue={setMessageValue}
          handleSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};
