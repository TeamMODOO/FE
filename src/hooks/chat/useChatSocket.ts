"use client";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

import { ChattingResponse, ChattingType } from "@/model/chatting";
import useSocketStore from "@/store/useSocketStore";

export const useChatSocket = (
  setNotification: Dispatch<SetStateAction<number>>,
) => {
  const { socket, isConnected } = useSocketStore();

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
    if (!socket || !isConnected || !messageValue.trim()) return;

    const messageInfo = {
      message: `${messageValue} `,
    };

    socket.emit("CS_CHAT", messageInfo);
    setMessageValue("");
  }, [socket, messageValue]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("SC_CHAT", addMessage);
  }, [socket, addMessage]);

  return {
    messageList,
    messageValue,
    setMessageValue,
    handleSendMessage,
  };
};
