import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

import useAudioSocketStore from "@/store/useAudioSocketStore";

type UseAudioSocketConnectType = {
  roomId: string;
};

export const useAudioSocketConnect = ({
  roomId,
}: UseAudioSocketConnectType) => {
  const audioSocketRef = useRef<Socket | null>(null);
  const setAudioSocket = useAudioSocketStore((state) => state.setSocket);
  const setAudioSocketIsConnected = useAudioSocketStore(
    (state) => state.setIsConnected,
  );

  const baseURL = ""; // env
  const AUDIO_SERVER_URL = `${baseURL}/Audio`;

  useEffect(() => {
    if (!roomId) return;

    const newAudioSocket = io(AUDIO_SERVER_URL, {
      path: "/Audio/socket.io",
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
      audioSocketRef.current?.off("connect");
      audioSocketRef.current?.off("connect_error");
      audioSocketRef.current?.off("disconnect");
      audioSocketRef.current?.disconnect();
      // console.log("End Socket Connection!");
    };
  }, [roomId]);
};