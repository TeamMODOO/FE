"use client";

import { useEffect, useRef } from "react";

import { io, Socket } from "socket.io-client";

import useAudioSocketStore from "@/store/useAudioSocketStore";

type UseAudioSocketConnectType = {
  roomId: string;
};

const useAudioSocketConnect = ({ roomId }: UseAudioSocketConnectType) => {
  const audioSocketRef = useRef<Socket | null>(null);
  const setAudioSocket = useAudioSocketStore((state) => state.setSocket);
  const setAudioSocketIsConnected = useAudioSocketStore(
    (state) => state.setIsConnected,
  );

  useEffect(() => {
    const AUDIO_SERVER_URL = process.env.NEXT_PUBLIC_WEB_RTC_URL;

    if (!roomId) return;

    const newAudioSocket = io(AUDIO_SERVER_URL, {
      withCredentials: true,
      transports: ["websocket"],
      autoConnect: true,
    });

    newAudioSocket?.on("connect", () => {
      audioSocketRef.current = newAudioSocket;
      setAudioSocket(newAudioSocket);
      setAudioSocketIsConnected(true);
      // console.log("Audio Socket connected", newAudioSocket.id);
    });

    newAudioSocket.on("connect_error", (error) => {
      // console.log("Audio Socket connect_error:", error);
    });

    newAudioSocket?.on("disconnect", (reason) => {
      setAudioSocketIsConnected(false);
      // console.log("Audio Socket disconnected", reason);
    });

    return () => {
      setAudioSocket(null);
      setAudioSocketIsConnected(false);
      audioSocketRef.current?.emit("leave-room", { roomId });
      audioSocketRef.current?.off("connect");
      audioSocketRef.current?.off("connect_error");
      audioSocketRef.current?.off("disconnect");
      audioSocketRef.current?.disconnect();
      // console.log("End Socket Connection!");
    };
  }, [roomId]);
};

export default useAudioSocketConnect;
