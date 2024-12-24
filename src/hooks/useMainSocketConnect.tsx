"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

import useMainSocketStore from "@/store/useMainSocketStore";

const useMainSocketConnect = () => {
  const mainSocketRef = useRef<Socket | null>(null);
  const setMainSocket = useMainSocketStore((state) => state.setSocket);
  const setMainSocketIsConnected = useMainSocketStore(
    (state) => state.setIsConnected,
  );

  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    const newMainSocket = io(baseURL, {
      path: process.env.NEXT_APP_SOCKET_PATH,
    });

    newMainSocket?.on("connect", () => {
      mainSocketRef.current = newMainSocket;
      setMainSocket(newMainSocket);
      setMainSocketIsConnected(true);
      // console.log("Main Socket connected", newMainSocket.id);
    });

    newMainSocket.on("connect_error", (error) => {
      // console.log("Main Socket connect_error:", error);
    });

    newMainSocket?.on("disconnect", (reason) => {
      setMainSocketIsConnected(false);
      // console.log("Main Socket disconnected", reason);
    });

    return () => {
      setMainSocket(null);
      setMainSocketIsConnected(false);
      mainSocketRef.current?.off("connect");
      mainSocketRef.current?.off("connect_error");
      mainSocketRef.current?.off("disconnect");
      mainSocketRef.current?.disconnect();
      // console.log("End Socket Connection!");
    };
  }, []);
};
export default useMainSocketConnect;
