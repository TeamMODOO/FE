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

type ChatSocketType = {
  roomType: string;
  roomId: string;
  setNotification: Dispatch<SetStateAction<number>>;
};

export const useChatSocket = ({
  roomType,
  roomId,
  setNotification,
}: ChatSocketType) => {
  const mainSocket = useMainSocketStore((state) => state.socket);
  const [messageList, setMessageList] = useState<ChattingType[]>([]);
  const [messageValue, setMessageValue] = useState<string>("");
  const { data: session, status } = useSession();
  // const [userName, setUserName] = useState<string>("Guest");
  // useEffect(() => {
  //   if (status === "loading") return;

  //   if (status === "authenticated" && session && session?.user?.name)
  //     setUserName(session.user.name);
  // }, [status, session]);

  const addMessage = useCallback((newMessage: ChattingResponse) => {
    const addMessageInfo = {
      ...newMessage,
      create_at: new Date(),
    };

    setNotification((prev) => prev + 1);
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
      room_type: roomType,
      room_id: roomId,
      client_id: clientId,
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
