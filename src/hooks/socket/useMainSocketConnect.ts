// hooks/useMainSocketConnect.ts
"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

import useMainSocketStore from "@/store/useMainSocketStore";

/**
 * 전역적으로 소켓을 연결하는 훅 (공통)
 * - 불필요한 이벤트는 등록하지 않고,
 *   단순히 connect / disconnect + store 관리만 한다.
 */
const useMainSocketConnect = () => {
  const mainSocketRef = useRef<Socket | null>(null);

  // 소켓 Store
  const setMainSocket = useMainSocketStore((state) => state.setSocket);
  const setIsConnected = useMainSocketStore((state) => state.setIsConnected);

  useEffect(() => {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

    // const clientId = 사용자 고유 ID 가져오기. 로컬 스토리지?
    const clientId = "user_id"; // 여기를 실제 클라이언트 ID로 교체

    const newMainSocket = io(baseURL, {
      path: "/sio/sockets",
      query: {
        client_id: clientId, // 클라이언트 ID를 query로 전달
      },
    });

    newMainSocket.on("connect", () => {
      mainSocketRef.current = newMainSocket;
      setMainSocket(newMainSocket);
      setIsConnected(true);
      // console.log("[useMainSocketConnect] connected:", newMainSocket.id);
    });

    newMainSocket.on("connect_error", (error) => {
      // console.log("[useMainSocketConnect] connect_error:", error);
    });

    newMainSocket.on("disconnect", (reason) => {
      setIsConnected(false);
      // console.log("[useMainSocketConnect] disconnected:", reason);
    });

    // unmount 시
    return () => {
      setMainSocket(null);
      setIsConnected(false);

      if (mainSocketRef.current) {
        mainSocketRef.current.off("connect");
        mainSocketRef.current.off("connect_error");
        mainSocketRef.current.off("disconnect");
        mainSocketRef.current.disconnect();
      }
      // console.log("[useMainSocketConnect] End Socket Connection");
    };
  }, [setMainSocket, setIsConnected]);

  // 커스텀 훅이므로 return 없이 내부에서만 동작
};

export default useMainSocketConnect;
