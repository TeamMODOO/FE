"use client";

import { useEffect, useState } from "react";

import { Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MovementInfoFromServer } from "@/hooks/lobby/useLobbySocketEvents";
import { UserType, useUserListQuery } from "@/queries/lobby/useUserQuery";
import useMainSocketStore from "@/store/useMainSocketStore";

import FriendDoor from "./FriendDoor";

interface ExtendedUser extends UserType {
  status: string;
}

export const FriendInformation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const mainSocket = useMainSocketStore((state) => state.socket);
  // 현재 접속 중인 유저들의 google_id 목록
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { data: users } = useUserListQuery(isOpen);

  const sortedUsers: ExtendedUser[] =
    users
      ?.map((user) => ({
        ...user,
        status: onlineUsers.includes(user.google_id)
          ? ("online" as const)
          : ("offline" as const),
      }))
      .sort((a, b) => {
        // 온라인 유저를 먼저 정렬
        if (a.status === "online" && b.status === "offline") return -1;
        if (a.status === "offline" && b.status === "online") return 1;
        // 같은 상태인 경우 이름순으로 정렬
        return a.name.localeCompare(b.name);
      }) ?? [];

  useEffect(() => {
    if (!mainSocket) return;

    const handleUserConnect = (data: MovementInfoFromServer) => {
      const { user_name } = data;
      setOnlineUsers((prev) => [...prev, user_name]);
    };

    // 유저 접속 종료 이벤트
    const handleUserDisconnect = (clientId: string) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== clientId));
    };

    // 이벤트 리스너 등록
    mainSocket.on("SC_MOVEMENT_INFO", handleUserConnect);
    mainSocket.on("user_disconnect", handleUserDisconnect);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      mainSocket.off("user_coSC_MOVEMENT_INFOnnect", handleUserConnect);
      mainSocket.off("user_disconnect", handleUserDisconnect);
    };
  }, [mainSocket]);

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

  const toggleWidget = () => setIsOpen(!isOpen);

  return (
    <>
      {isOpen && (
        <Card className="fixed inset-0 z-[60] flex flex-col md:bottom-auto md:left-auto md:right-4 md:top-4 md:h-[calc(100vh-2rem)] md:w-96">
          <CardHeader className="pt-safe-top flex flex-row items-center justify-between md:pt-0">
            <h3 className="font-semibold">친구 목록</h3>
            <Button variant="ghost" size="icon" onClick={toggleWidget}>
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="grow overflow-auto">
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
      )}
      {!isOpen && (
        <Button
          onClick={toggleWidget}
          size="icon"
          className="fixed right-20 top-4 z-50 size-12 rounded-full"
        >
          <Users className="size-6" />
        </Button>
      )}
    </>
  );
};

export default FriendInformation;
