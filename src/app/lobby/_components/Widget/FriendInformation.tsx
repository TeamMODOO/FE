"use client";
import { useEffect, useMemo, useState } from "react";

import { Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SCUserPositionInfo } from "@/hooks/lobby/useLobbySocketEvents";
import { UserType, useUserListQuery } from "@/queries/lobby/useUserQuery";
import useSocketStore from "@/store/useSocketStore";

import FriendDoor from "./FriendDoor";

interface ExtendedUser extends UserType {
  status: string;
}

interface FriendInformationProps {
  chatOpen?: boolean;
}

export const FriendInformation = ({
  chatOpen = false,
}: FriendInformationProps) => {
  const [isOpen, setIsOpen] = useState(false); // 열림/닫힘 여부
  const [isAnimating, setIsAnimating] = useState(false); // 애니메이션 진행 여부

  const { socket, isConnected } = useSocketStore();
  const [onlineUsersId, setOnlineUsersId] = useState<string[]>([]);
  const { data: users } = useUserListQuery();

  const sortedUsers: ExtendedUser[] = useMemo(
    () =>
      users
        ?.map((user) => ({
          ...user,
          status: onlineUsersId.includes(user.google_id) ? "online" : "offline",
        }))
        .sort((a, b) => {
          if (a.status === "online" && b.status === "offline") return -1;
          if (a.status === "offline" && b.status === "online") return 1;
          return a.name.localeCompare(b.name);
        }) ?? [],
    [users, onlineUsersId],
  );

  // 소켓 이벤트 처리
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleUserConnect = (data: SCUserPositionInfo) => {
      const { client_id } = data;
      setOnlineUsersId((prev) => [...prev, client_id]);
    };

    const handleUserDisconnect = ({ client_id }: { client_id: string }) => {
      setOnlineUsersId((prev) => prev.filter((id) => id !== client_id));
    };

    socket.on("SC_USER_POSITION_INFO", handleUserConnect);
    socket.on("SC_LEAVE_USER", handleUserDisconnect);

    return () => {
      socket.off("SC_USER_POSITION_INFO", handleUserConnect);
      socket.off("SC_LEAVE_USER", handleUserDisconnect);
    };
  }, [socket, isConnected]);

  // 모달 열고 닫기 시, 애니메이션 처리
  useEffect(() => {
    if (isOpen) {
      // 열 때
      const rafId = requestAnimationFrame(() => setIsAnimating(true));
      return () => cancelAnimationFrame(rafId);
    } else {
      // 닫을 때: 200ms 뒤에 실제 DOM에서 제거
      const timer = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 배경 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscKey);
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen]);

  // 'z', 'Z', 'ㅋ' 키로 열기/닫기
  useEffect(() => {
    const handleZKey = (e: KeyboardEvent) => {
      // 여기서 chatOpen이 true라면, 친구목록 단축키 무시
      if (chatOpen) return;

      // IME 입력(한글 조합 등) 중이면 단축키 무시
      if (e.isComposing) return;

      // input, textarea, contentEditable 포커스 시 단축키 무시
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isInputFocused =
        tagName === "input" ||
        tagName === "textarea" ||
        (target as HTMLElement).isContentEditable;
      if (isInputFocused) return;

      if (e.key === "z" || e.key === "Z" || e.key === "ㅋ") {
        toggleWidget();
      }
    };

    window.addEventListener("keydown", handleZKey);
    return () => {
      window.removeEventListener("keydown", handleZKey);
    };
  }, [chatOpen]);
  // chatOpen이 바뀌면(즉, true/false 바뀔 때) 이 핸들러도 갱신

  const toggleWidget = () => setIsOpen((prev) => !prev);

  return (
    <>
      {(isOpen || isAnimating) && (
        <div className="fixed inset-0 z-[60] flex items-start justify-end p-4">
          <div
            className={`
              w-full transition-all duration-200 ease-out md:w-96
              ${isAnimating ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}
            `}
          >
            <Card
              className="
                bg-color-none 
                flex h-[calc(100vh-2rem)]
                flex-col
                rounded-xl
                border-2 
                border-[rgba(111,99,98,1)]
                bg-gradient-to-b
                from-black/60
                to-black/95
                [backdrop-filter:blur(2px)]
                [font-family:var(--font-noto-serif-kr),serif]
              "
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <h3
                  className="
                    text-3xl
                    font-bold
                    text-fuchsia-600
                  "
                >
                  친구 목록
                </h3>
                <Button variant="ghost" size="icon" onClick={toggleWidget}>
                  <X className="text-2xl text-white" />
                </Button>
              </CardHeader>

              <CardContent className="custom-scrollbar grow overflow-auto">
                <div className="grid grid-cols-3 gap-2">
                  {sortedUsers.map((user) => (
                    <FriendDoor
                      key={user.google_id}
                      friend={{
                        id: user.google_id,
                        name: user.name,
                        status: user.status,
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 닫혀있을 때만 버튼 노출 */}
      {!isOpen && (
        <Button
          onClick={toggleWidget}
          size="icon"
          title="친구 목록"
          className="
            bg-color-none 
            fixed 
            right-60 
            top-6 
            z-50 
            size-20
            rounded-full
            border-2
            border-[rgba(111,99,98,1)] 
            bg-gradient-to-b
            from-black/70 
            to-black/90
            text-[rgba(171,159,158,1)]
            hover:bg-[rgba(255,255,255,0.9)]
          "
        >
          <Users className="min-h-8 min-w-8" />
        </Button>
      )}
    </>
  );
};

export default FriendInformation;
