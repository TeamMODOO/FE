"use client";

import { PropsWithChildren, useEffect } from "react";

import { useSession } from "next-auth/react";

import { io } from "socket.io-client";

import useClientIdStore from "@/store/useClientIdStore";
import useSocketStore from "@/store/useSocketStore";

export function SocketProvider({ children }: PropsWithChildren) {
  const { data: session, status } = useSession();
  const { setSocket, setIsConnected, reset } = useSocketStore();

  const { clientId, initializeClientId } = useClientIdStore();

  // 세션 상태가 변경될 때 클라이언트 ID 초기화
  useEffect(() => {
    if (status === "loading") return;
    if (session && session.user && (session.user.id || session.user.guest_id))
      initializeClientId(session.user.id);
  }, [session]);

  useEffect(() => {
    // 세션 로딩 중이면 소켓 연결하지 않음
    if (status === "loading" || !clientId) return;

    // 소켓 인스턴스 생성
    const socket = io(process.env.NEXT_PUBLIC_BASE_URL!, {
      path: process.env.NEXT_PUBLIC_SOCKET_PATH!,
      withCredentials: true,
      transports: ["websocket"],
      autoConnect: true,
      query: {
        client_id: clientId,
        user_name: session?.user?.name || "Guest",
      },
    });

    // 소켓 이벤트 핸들러 등록
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      setIsConnected(false);
    });

    // 소켓 인스턴스를 스토어에 저장
    setSocket(socket);

    // 컴포넌트 언마운트 시 정리
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("reconnect");
      socket.disconnect();
      reset();
    };
  }, [status, session, clientId]);

  return children;
}
