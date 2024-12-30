"use client";

import { useSignIn } from "@/hooks/signin/useSignIn";
import useMainSocketConnect from "@/hooks/socket/useMainSocketConnect";

import LobbyCanvas from "./_component/Canvas/Canvas";
import ChatWidget from "./_component/Widget/Chatting";
import FriendInformation from "./_component/Widget/FriendInformation";

export default function Page() {
  const { session, status, loginMessage } = useSignIn();

  useMainSocketConnect();
  return (
    <>
      <LobbyCanvas></LobbyCanvas>
      <ChatWidget />
      <FriendInformation />
    </>
  );
}
