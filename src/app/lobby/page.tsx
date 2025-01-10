"use client";

import { useState } from "react";

import { ChatWidget } from "@/components/chat/ChatWidget";

import LobbyCanvas from "./_components/Canvas/LobbyCanvas";
import FriendInformation from "./_components/Widget/FriendInformation";

const ROOM_TYPE = "floor";
const ROOM_ID = "floor7";

export default function Page() {
  const [chatOpen, setChatOpen] = useState(false);
  // useSignInPost();
  //useMainSocketConnect({ roomType: ROOM_TYPE, roomId: ROOM_ID });

  return (
    <>
      {/* chatOpen 넘기기 */}
      <LobbyCanvas chatOpen={chatOpen} />
      <ChatWidget isOpen={chatOpen} setIsOpen={setChatOpen} position="right" />
      <FriendInformation />
    </>
  );
}
