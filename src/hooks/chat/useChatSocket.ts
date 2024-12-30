"use client";
import { useCallback, useEffect, useState } from "react";

import { ChattingResponse, ChattingType } from "@/model/chatting";
import useMainSocketStore from "@/store/useMainSocketStore";

type ChatSocketType = {
  roomId: string;
};

export const useChatSocket = ({ roomId }: ChatSocketType) => {
  const mainSocket = useMainSocketStore((state) => state.socket);
  const [messageList, setMessageList] = useState<ChattingType[]>([]);
  const [messageValue, setMessageValue] = useState<string>("");

  const addMessage = useCallback((newMessage: ChattingResponse) => {
    const addMessageInfo = {
      ...newMessage,
      create_at: new Date().toISOString(),
    };

    setMessageList((prev) => [...prev, addMessageInfo]);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!mainSocket || !messageValue.trim()) {
      return;
    }

    // 1) 로컬 스토리지에 있는 uuid 가져오기
    const clientId = localStorage.getItem("client_id") || "anonymous";
    // (만약 로컬 스토리지에 없다면 fallback으로 "anonymous")

    // 2) 메시지 정보
    const messageInfo = {
      room_id: roomId,
      client_id: clientId,
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
