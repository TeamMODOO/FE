"use client";

import useMainSocketConnect from "@/hooks/socket/useMainSocketConnect";

import LobbyCanvas from "./_component/Canvas/Canvas";
import ChatWidget from "./_component/Widget/Chatting";
import FriendInformation from "./_component/Widget/FriendInformation";

export default function Page() {
  useMainSocketConnect();
  return (
    <>
      <LobbyCanvas></LobbyCanvas>
      <ChatWidget />
      <FriendInformation />
    </>
  );
}
