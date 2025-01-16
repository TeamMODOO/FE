"use client";

import { useEffect, useState } from "react";

import { BgMusicButton } from "@/components/bgMusic/BgMusicButton";
import { BgMusicGlobal } from "@/components/bgMusic/BgMusicGlobal";
import { ChatWidget } from "@/components/chat/right/RightChatWidget";
import useClientIdStore from "@/store/useClientIdStore";
import useSocketStore from "@/store/useSocketStore";
import useUsersRef from "@/store/useUsersRef";

import LobbyCanvas from "./_components/Canvas/LobbyCanvas";
import FriendInformation from "./_components/Widget/FriendInformation";

const ROOM_TYPE = "floor";
const ROOM_ID = "floor7";

export default function Page() {
  const [chatOpen, setChatOpen] = useState(false);
  const { clientId } = useClientIdStore();
  const { socket, isConnected } = useSocketStore();
  const [isJoin, setIsJoin] = useState<boolean>(false);
  const {
    usersRef,
    getUser,
    addUser,
    removeUser,
    updateUserPosition,
    isChanged,
  } = useUsersRef();

  useEffect(() => {
    if (!clientId || !socket || !isConnected) return;

    // 새로운 방 입장
    socket.emit("CS_JOIN_ROOM", {
      client_id: clientId,
      room_type: ROOM_TYPE,
      room_id: ROOM_ID,
    });

    socket.emit("CS_USER_POSITION", {
      client_id: clientId,
      room_id: ROOM_ID,
    });
    setIsJoin(true);
  }, [socket, isConnected]);

  useEffect(() => {
    return () => {
      if (!clientId || !socket || !isConnected) return;
      const me = getUser(clientId);

      socket.emit("CS_LEAVE_ROOM", {
        client_id: clientId,
        room_id: ROOM_ID,
        position_x: me?.x ?? 350,
        position_y: me?.y ?? 170,
      });
      setIsJoin(false);
    };
  }, []);

  return (
    <>
      <LobbyCanvas
        chatOpen={chatOpen}
        isJoin={isJoin}
        usersRef={usersRef}
        getUser={getUser}
        addUser={addUser}
        removeUser={removeUser}
        updateUserPosition={updateUserPosition}
      />
      <ChatWidget isOpen={chatOpen} setIsOpen={setChatOpen} />
      <FriendInformation chatOpen={chatOpen} />
      <BgMusicGlobal src="/sounds/lobbyBGM.wav" />
      <BgMusicButton chatOpen={chatOpen} />
    </>
  );
}
