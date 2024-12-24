"use client";
import { useCallback, useEffect, useState } from "react";

import { ChattingResponse } from "@/model/chatting";
import useMainSocketStore from "@/store/useMainSocketStore";

type ChatSocketType = {
  responseType: string;
  requestType: string;
};

export const useChatSocket = ({
  responseType,
  requestType,
}: ChatSocketType) => {
  const mainSocket = useMainSocketStore((state) => state.socket);
  const [messageList, setMessageList] = useState<ChattingResponse[]>([]);
  const [messageValue, setMessageValue] = useState<string>("");

  const addMessage = useCallback((newMessage: ChattingResponse) => {
    setMessageList((prev) => [...prev, newMessage]);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!mainSocket || !messageValue.trim()) {
      return;
    }

    mainSocket.emit(requestType, messageValue);
    setMessageValue("");
  }, [mainSocket, messageValue, requestType]);

  useEffect(() => {
    if (!mainSocket) return;
    mainSocket.on(responseType, addMessage);
    return () => {
      mainSocket.off(responseType);
    };
  }, [mainSocket, responseType, addMessage]);

  return {
    messageList,
    messageValue,
    setMessageValue,
    handleSendMessage,
  };
};
