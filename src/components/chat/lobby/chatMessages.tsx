"use client";

import { useChatSocket } from "@/hooks/useChatSocket";

import { ChatInput } from "./chatInput";
import { ListMessages } from "./listMessages";

export const ChatMessages = () => {
  const { messageList, messageValue, setMessageValue, handleSendMessage } =
    useChatSocket({
      responseType: "SC_CHAT",
      requestType: "CS_CHAT",
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
