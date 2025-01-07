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
  const [isAnimating, setIsAnimating] = useState(false);

  const mainSocket = useMainSocketStore((state) => state.socket);
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
        if (a.status === "online" && b.status === "offline") return -1;
        if (a.status === "offline" && b.status === "online") return 1;
        return a.name.localeCompare(b.name);
      }) ?? [];

  useEffect(() => {
    if (!mainSocket) return;

    const handleUserConnect = (data: MovementInfoFromServer) => {
      const { user_name } = data;
      setOnlineUsers((prev) => [...prev, user_name]);
    };

    const handleUserDisconnect = (clientId: string) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== clientId));
    };

    mainSocket.on("SC_MOVEMENT_INFO", handleUserConnect);
    mainSocket.on("user_disconnect", handleUserDisconnect);

    return () => {
      mainSocket.off("SC_MOVEMENT_INFO", handleUserConnect);
      mainSocket.off("user_disconnect", handleUserDisconnect);
    };
  }, [mainSocket]);

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
            <Card className="flex h-[calc(100vh-2rem)] flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
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
          </div>
        </div>
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
