"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { v4 as uuid } from "uuid";

import useMainSocketStore from "@/store/useMainSocketStore";

/**
 * 전역적으로 소켓을 연결하는 훅 (공통)
 */
const useMainSocketConnect = () => {
  const mainSocketRef = useRef<Socket | null>(null);

  // 소켓 Store
  const setMainSocket = useMainSocketStore((state) => state.setSocket);
  const setIsConnected = useMainSocketStore((state) => state.setIsConnected);

  // NextAuth session
  const { data: session, status } = useSession();

  useEffect(() => {
    // ------------------------------------------------------------------
    // (1) 세션 로딩 중이면 소켓 연결 X
    //     (중요) 배포시 세션이 천천히 로드되면, user_name이 null/undefined가 될 수 있음
    // ------------------------------------------------------------------
    if (status === "loading") {
      return;
    }

    // 이미 소켓 연결이 되어 있다면 재연결하지 않도록 방어
    if (mainSocketRef.current) {
      return;
    }

    // ------------------------------------------------------------------
    // (2) 세션에서 user_name 가져오기 (없으면 "Guest")
    // ------------------------------------------------------------------
    const userName = session?.user?.name || "Guest";

    // ------------------------------------------------------------------
    // (3) 소켓 접속 로직 (client_id 생성/조회)
    // ------------------------------------------------------------------
    let clientId = localStorage.getItem("client_id");
    if (!clientId) {
      clientId = uuid();
      localStorage.setItem("client_id", clientId);
    }

    // 서버 URL
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

    // ------------------------------------------------------------------
    // (4) io 연결 - 여기서 query로 user_name, client_id를 넘김
    // ------------------------------------------------------------------
    const newMainSocket = io(baseURL!, {
      path: "/sio/sockets",
      query: {
        client_id: clientId, // 클라이언트 ID
        user_name: userName, // 세션에서 가져온 닉네임(혹은 이름)
      },
    });

    // ------------------------------------------------------------------
    // (5) 이벤트 등록
    // ------------------------------------------------------------------
    newMainSocket.on("connect", () => {
      mainSocketRef.current = newMainSocket;
      setMainSocket(newMainSocket);
      setIsConnected(true);
      // console.log("[useMainSocketConnect] connected:", newMainSocket.id);
    });

    newMainSocket.on("connect_error", (error) => {
      // console.error("[useMainSocketConnect] connect_error:", error);
    });

    newMainSocket.on("disconnect", (reason) => {
      setIsConnected(false);
      // console.log("[useMainSocketConnect] disconnected:", reason);
    });

    // ------------------------------------------------------------------
    // (6) unmount 시 해제
    // ------------------------------------------------------------------
    return () => {
      setMainSocket(null);
      setIsConnected(false);

      if (mainSocketRef.current) {
        mainSocketRef.current.off("connect");
        mainSocketRef.current.off("connect_error");
        mainSocketRef.current.off("disconnect");
        mainSocketRef.current.disconnect();
        mainSocketRef.current = null;
      }
      // console.log("[useMainSocketConnect] End Socket Connection");
    };
  }, [status, session, setMainSocket, setIsConnected]);

  // 커스텀 훅이므로 return 없음
};

export default useMainSocketConnect;
