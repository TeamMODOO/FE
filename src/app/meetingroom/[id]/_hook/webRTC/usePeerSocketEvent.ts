import { useEffect } from "react";

import { Socket } from "socket.io-client";

import { PeerState, PeersType } from "../../_model/webRTC.type";

interface UsePeerEventsProps {
  audioSocket: Socket | null;
  isAudioConnected: boolean;
  setPeers: React.Dispatch<React.SetStateAction<PeersType[]>>;
  setPeerStates: React.Dispatch<
    React.SetStateAction<Record<string, PeerState>>
  >;
}

export const usePeerEvents = ({
  audioSocket,
  isAudioConnected,
  setPeers,
  setPeerStates,
}: UsePeerEventsProps) => {
  useEffect(() => {
    if (!audioSocket || !isAudioConnected) return;

    // 새로운 피어 입장 이벤트 핸들러
    const handleNewPeer = ({
      peerId,
      state,
      userName,
    }: {
      peerId: string;
      state: PeerState;
      userName: string;
    }) => {
      setPeers((prevPeers) => [
        ...prevPeers,
        { id: peerId, userName: userName },
      ]);
      setPeerStates((prevPeers) => ({
        ...prevPeers,
        [peerId]: { ...state },
      }));
    };

    // 피어 상태 변경 이벤트 핸들러
    const handlePeerStateChanged = ({
      peerId,
      state,
    }: {
      peerId: string;
      state: { type: "audio" | "video"; enabled: boolean };
    }) => {
      setPeerStates((prev) => ({
        ...prev,
        [peerId]: {
          ...prev[peerId],
          [state.type]: state.enabled,
        },
      }));
    };

    // 피어 퇴장 이벤트 핸들러
    const handlePeerLeft = ({ peerId }: { peerId: string }) => {
      setPeers((prevPeers) => prevPeers.filter((data) => data.id !== peerId));
      setPeerStates((prev) => {
        const newStates = { ...prev };
        delete newStates[peerId];
        return newStates;
      });
    };

    // 이벤트 리스너 등록
    audioSocket.on("new-peer", handleNewPeer);
    audioSocket.on("peer-state-changed", handlePeerStateChanged);
    audioSocket.on("peer-left", handlePeerLeft);

    // 클린업 함수
    return () => {
      audioSocket.off("new-peer", handleNewPeer);
      audioSocket.off("peer-state-changed", handlePeerStateChanged);
      audioSocket.off("peer-left", handlePeerLeft);
    };
  }, [audioSocket, isAudioConnected, setPeers, setPeerStates]);
};
