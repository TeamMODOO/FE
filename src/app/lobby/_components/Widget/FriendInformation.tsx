"use client";

import { useEffect, useMemo, useState } from "react";

import { Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SCUserPositionInfo } from "@/hooks/lobby/useLobbySocketEvents";
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
    if (!mainSocket) return;

    const handleUserConnect = (data: SCUserPositionInfo) => {
      const { client_id } = data;
      setOnlineUsersId((prev) => [...prev, client_id]);
    };

    const handleUserDisconnect = (clientId: string) => {
      setOnlineUsersId((prev) => prev.filter((id) => id !== clientId));
    };

    mainSocket.on("SC_USER_POSITION_INFO", handleUserConnect);
    mainSocket.on("user_disconnect", handleUserDisconnect);

    return () => {
      mainSocket.off("SC_USER_POSITION_INFO", handleUserConnect);
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
