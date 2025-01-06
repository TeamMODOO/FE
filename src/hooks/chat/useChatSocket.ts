"use client";
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

  const addMessage = useCallback((newMessage: ChattingResponse) => {
    const addMessageInfo = {
      ...newMessage,
      create_at: new Date(),
    };

    setNotification((prev) => prev + 1);
    setMessageList((prev) => [...prev, addMessageInfo]);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!mainSocket || !messageValue.trim()) return;

    const messageInfo = {
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
