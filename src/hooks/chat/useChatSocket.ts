"use client";
import { useSession } from "next-auth/react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

import { ChattingResponse, ChattingType } from "@/model/chatting";
import useMainSocketStore from "@/store/useMainSocketStore";

export const useChatSocket = (
  setNotification: Dispatch<SetStateAction<number>>,
) => {
  const mainSocket = useMainSocketStore((state) => state.socket);
  const [messageList, setMessageList] = useState<ChattingType[]>([]);
  const [messageValue, setMessageValue] = useState<string>("");
  const { data: session } = useSession();

  const addMessage = useCallback((newMessage: ChattingResponse) => {
    const addMessageInfo = {
      ...newMessage,
      create_at: new Date(),
    };

    setNotification((prev) => prev + 1);
    setMessageList((prev) => [...prev, addMessageInfo]);
  }, []);

  const handleSendMessage = useCallback(() => {
    addMessage({ message: messageValue, user_name: "게스트" });
    if (!mainSocket || !messageValue.trim()) {
      return;
    }

    const messageInfo = {
      user_name: session && session.user ? session.user.name : "Guest",
      message: messageValue,
    };

    mainSocket.emit("CS_CHAT", messageInfo);
    setMessageValue("");
  }, [mainSocket, messageValue]);

  useEffect(() => {
    if (!mainSocket) return;

    mainSocket.on("SC_CHAT", addMessage);
  }, [mainSocket, addMessage]);

  return {
    messageList,
    messageValue,
    setMessageValue,
    handleSendMessage,
  };
};
