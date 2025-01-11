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

export const FriendInformation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleUserConnect = (data: SCUserPositionInfo) => {
      const { client_id } = data;
      setOnlineUsersId((prev) => [...prev, client_id]);
    };

    const handleUserDisconnect = (clientId: string) => {
      setOnlineUsersId((prev) => prev.filter((id) => id !== clientId));
    };

    socket.on("SC_USER_POSITION_INFO", handleUserConnect);
    socket.on("user_disconnect", handleUserDisconnect);

    return () => {
      socket.off("SC_USER_POSITION_INFO", handleUserConnect);
      socket.off("user_disconnect", handleUserDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        document.body.style.overflow = "unset";
      }, 200);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleWidget = () => setIsOpen(!isOpen);

  return (
    <>
      {(isOpen || isAnimating) && (
        <div className="fixed inset-0 z-[60] flex items-start justify-end p-4">
          <div
            className={`
              w-full transition-all duration-200
              ease-out md:w-96
              ${
                isAnimating
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-95 opacity-0"
              }
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
