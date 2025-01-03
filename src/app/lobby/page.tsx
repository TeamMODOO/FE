"use client";

import { useState } from "react";

import useMainSocketConnect from "@/hooks/socket/useMainSocketConnect";

import LobbyCanvas from "./_component/Canvas/LobbyCanvas";
import ChatWidget from "./_component/Widget/ChattingWidget";
import FriendInformation from "./_component/Widget/FriendInformation";

const ROOM_TYPE = "floor";
const ROOM_ID = "7";

export default function Page() {
  // 채팅창 열림 여부 (true면 열림, false면 닫힘)
  const [chatOpen, setChatOpen] = useState(false);
  // useSignInPost();
  useMainSocketConnect({ roomType: ROOM_TYPE, roomId: ROOM_ID });

  return (
    <>
      {/* chatOpen 넘기기 */}
      <LobbyCanvas chatOpen={chatOpen} />
      <ChatWidget isOpen={chatOpen} setIsOpen={setChatOpen} />
      <FriendInformation />
    </>
  );
}
