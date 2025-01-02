"use client";

import { useState } from "react";

import { useSignInPost } from "@/hooks/signin/useSignInPost";
import useMainSocketConnect from "@/hooks/socket/useMainSocketConnect";

import LobbyCanvas from "./_component/Canvas/Canvas";
import ChatWidget from "./_component/Widget/ChattingWidget";
import FriendInformation from "./_component/Widget/FriendInformation";

export default function Page() {
  // 채팅창 열림 여부 (true면 열림, false면 닫힘)
  const [chatOpen, setChatOpen] = useState(false);

  useMainSocketConnect();
  useSignInPost();

  return (
    <>
      {/* chatOpen 넘기기 */}
      <LobbyCanvas chatOpen={chatOpen} />
      <ChatWidget isOpen={chatOpen} setIsOpen={setChatOpen} />
      <FriendInformation />
    </>
  );
}
