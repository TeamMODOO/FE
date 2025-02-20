"use client";

import { PropsWithChildren, useEffect } from "react";

import { usePathname } from "next/navigation";

import { useSession } from "next-auth/react";

import { io } from "socket.io-client";

import useClientIdStore from "@/store/useClientIdStore";
import { useIsConnectionsStore } from "@/store/useIsConnectionsStore";
import useSocketStore from "@/store/useSocketStore";

export function SocketProvider({ children }: PropsWithChildren) {
  const { data: session, status } = useSession();
  const { setSocket, setIsConnected, reset } = useSocketStore();
  const { clientId, initializeClientId } = useClientIdStore();
  const { setIsConnections } = useIsConnectionsStore();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.id) {
      initializeClientId(session.user.id);
    } else if (session?.user?.guest_id) {
      initializeClientId(session.user.guest_id);
    }
  }, [session?.user.id, session?.user.guest_id]);

  useEffect(() => {
    if (pathname === "/signin") return;
    if (status === "loading" || !clientId) return;

    // 기존 소켓 연결을 정리
    const cleanup = () => {
      if (socket) socket.disconnect();
    };

    // 페이지를 떠날 때 동기적으로 처리하기 위한 함수
    const handleBeforeUnload = () => cleanup();
    window.addEventListener("beforeunload", handleBeforeUnload);

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

    socket.on("connect", () => {
      setSocket(socket);
      setIsConnected(true);
    });

    socket.on("SC_DUPLICATE_CONNECTION", () => {
      // 여기서 중복 접속 모달 키면 됨
      setIsConnections(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);

      window.removeEventListener("beforeunload", handleBeforeUnload);
    });

    socket.on("connect_error", () => {
      setIsConnected(false);
    });

    // 컴포넌트 언마운트나 clientId 변경 시 정리
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      cleanup();
      reset();
    };
  }, [clientId]);

  return children;
}
