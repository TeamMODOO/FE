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

  const baseURL = ""; // env
  const MAIN_SERVER_URL = `${baseURL}/main`;

  useEffect(() => {
    return; // 수정 필요
    const newMainSocket = io(MAIN_SERVER_URL, {
      path: "/main/socket.io",
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
