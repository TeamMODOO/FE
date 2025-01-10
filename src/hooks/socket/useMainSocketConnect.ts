"use client";

import { useEffect, useRef } from "react";

import { useSession } from "next-auth/react";

import { io, Socket } from "socket.io-client";
import { v4 as uuid } from "uuid";

import useMainSocketStore from "@/store/useMainSocketStore";

type UseMainSocketConnectType = {
  roomType: string;
  roomId: string;
};

const useMainSocketConnect = ({
  roomType,
  roomId,
}: UseMainSocketConnectType) => {
  const mainSocketRef = useRef<Socket | null>(null);
  // 소켓 초기화 상태를 추적하는 새로운 ref
  const isCleanupCompleteRef = useRef(false);

  const setMainSocket = useMainSocketStore((state) => state.setSocket);
  const setIsConnected = useMainSocketStore((state) => state.setIsConnected);

  const { data: session, status } = useSession();

  useEffect(() => {
    // cleanup 함수를 별도로 정의
    const cleanup = () => {
      if (mainSocketRef.current) {
        mainSocketRef.current.off("connect");
        mainSocketRef.current.off("connect_error");
        mainSocketRef.current.off("disconnect");
        mainSocketRef.current.disconnect();
        mainSocketRef.current = null;
      }
      setMainSocket(null);
      setIsConnected(false);
      // cleanup 완료 표시
      isCleanupCompleteRef.current = true;
    };

    // 이전 연결이 있다면 먼저 정리
    if (!isCleanupCompleteRef.current) cleanup();

    // 세션 로딩 중이면 소켓 연결 X
    if (status === "loading") return;

    // 새로운 연결 시도 전에 약간의 지연을 주어 cleanup이 완료되도록 보장
    const initializeSocket = () => {
      const userName = session?.user?.name || "Guest";

      let clientId = localStorage.getItem("client_id");
      if (!clientId) {
        if (session?.user?.id) clientId = session.user.id;
        else clientId = uuid();
        localStorage.setItem("client_id", clientId);
      } else {
        if (session?.user?.id) {
          if (clientId !== session?.user?.id) clientId = session.user.id;
          localStorage.setItem("client_id", clientId);
        }
      }

      const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
      return;
      // 새로운 소켓 연결 시도
      const newMainSocket = io(baseURL!, {
        path: "/sio/sockets",
        withCredentials: true,
        transports: ["websocket"],
        autoConnect: true,
        query: {
          client_id: clientId,
          user_name: userName,
          room_id: roomId,
          room_type: roomType,
        },
      });

      newMainSocket.on("connect", () => {
        mainSocketRef.current = newMainSocket;
        setMainSocket(newMainSocket);
        setIsConnected(true);
        // 연결 성공 시 cleanup 상태 초기화
        isCleanupCompleteRef.current = false;
      });

      newMainSocket.on("disconnect", () => {
        setIsConnected(false);
      });

      newMainSocket.on("connect_error", () => {
        if (mainSocketRef.current) {
          mainSocketRef.current = null;
        }
      });
    };

    // cleanup이 완료된 후에만 새로운 연결 시도
    if (isCleanupCompleteRef.current) {
      initializeSocket();
    }

    return cleanup;
  }, [status, roomId, roomType]);
};

export default useMainSocketConnect;
