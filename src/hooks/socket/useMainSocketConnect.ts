"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { v4 as uuid } from "uuid";

import useMainSocketStore from "@/store/useMainSocketStore";

const useMainSocketConnect = () => {
  const mainSocketRef = useRef<Socket | null>(null);
  const setMainSocket = useMainSocketStore((state) => state.setSocket);
  const setMainSocketIsConnected = useMainSocketStore(
    (state) => state.setIsConnected,
  );

  // const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

    // const clientId = 사용자 고유 ID 가져오기. 로컬 스토리지?
    // const clientId = "user_id"; // 여기를 실제 클라이언트 ID로 교체

    let clientId = localStorage.getItem("client_id");
    if (!clientId) {
      // 없다면 새로 생성 후 저장
      clientId = uuid();
      localStorage.setItem("client_id", clientId);
    }

    const newMainSocket = io("http://127.0.0.1:8000", {
      path: "/sockets",
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
