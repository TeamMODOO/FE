/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

import * as mediasoupClient from "mediasoup-client";
import { Socket } from "socket.io-client";

import { ChatWidget } from "@/components/chat/ChatWidget";
import useAudioSocketConnect from "@/hooks/socket/useAudioSocketConnect";
import useAudioSocketStore from "@/store/useAudioSocketStore";
import useClientIdStore from "@/store/useClientIdStore";
import useSocketStore from "@/store/useSocketStore";

import CanvasSection from "./_components/canvas/CanvasSection";
import { Header } from "./_components/Header";
import { LocalVideo } from "./_components/video/LocalVideo";
import { RemoteMedia } from "./_components/video/RemoteMedia";
import { useMeetingRoomAttend } from "./_hook/useMeetingRoom";
import { useMediaDevices } from "./_hook/webRTC/useMediaDevices";
import { usePeerEvents } from "./_hook/webRTC/usePeerSocketEvent";
import { useRoom } from "./_hook/webRTC/useRoom";
import { useWebRTC } from "./_hook/webRTC/useWebRTC";
import { PeersType, RemoteStream } from "./_model/webRTC.type";

const ROOM_TYPE = "meeting";

function Page() {
  const router = useRouter();
  const params = useParams();
  const roomId = (params.id as string) ?? "99999";

  useAudioSocketConnect({ roomId: roomId });
  useMeetingRoomAttend({ roomId: roomId });

  const audioSocket: Socket = useAudioSocketStore(
    (state) => state.socket,
  ) as Socket;
  const isAudioConnected = useAudioSocketStore((state) => state.isConnected);

  const { clientId } = useClientIdStore();
  const { socket, isConnected, currentRoom, setCurrentRoom } = useSocketStore();

  const { data: session } = useSession();

  const [device, setDevice] = useState<mediasoupClient.Device | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);

  const [sendTransport, setSendTransport] =
    useState<mediasoupClient.types.Transport | null>(null);
  const [recvTransport, setRecvTransport] =
    useState<mediasoupClient.types.Transport | null>(null);
  const [videoProducer, setVideoProducer] =
    useState<mediasoupClient.types.Producer | null>(null);
  const [audioProducer, setAudioProducer] =
    useState<mediasoupClient.types.Producer | null>(null);

  const [peers, setPeers] = useState<PeersType[]>([]);
  const [peerStates, setPeerStates] = useState<
    Record<string, { audio: boolean; video: boolean }>
  >({});

  const [joined, setJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const [chatOpen, setChatOpen] = useState(false);

  const {
    deviceRef,
    recvTransportRef,
    createDevice,
    createSendTransport,
    createRecvTransport,
  } = useWebRTC(audioSocket, isAudioConnected, roomId);

  const {
    localVideoRef,
    getLocalAudioStreamAndTrack,
    startCamera,
    stopCamera,
  } = useMediaDevices(audioSocket, isAudioConnected, roomId);

  const { consume } = useRoom({
    audioSocket,
    isAudioConnected,
    roomId,
    deviceRef,
    recvTransportRef,
    remoteStreams,
    setRemoteStreams,
    setPeerStates,
  });

  usePeerEvents({
    audioSocket,
    isAudioConnected,
    setPeers,
    setPeerStates,
  });

  const joinRoom = async () => {
    if (!audioSocket || !isAudioConnected || !roomId) return;

    audioSocket.emit(
      "join-room",
      {
        roomId,
        peerId: audioSocket.id,
        userName: session?.user.name ?? "GuestUser",
      },
      async (response: any) => {
        if (response.error) {
          throw new Error("Error joining room:", response.error);
        }

        const {
          sendTransportOptions,
          recvTransportOptions,
          rtpCapabilities,
          peers,
          existingProducers,
        } = response;

        const newDevice = await createDevice(rtpCapabilities);
        setDevice(newDevice);

        const newSendTransport = createSendTransport(
          newDevice,
          sendTransportOptions,
        );
        if (newSendTransport) setSendTransport(newSendTransport);

        const newRecvTransport = createRecvTransport(
          newDevice,
          recvTransportOptions,
        );
        setRecvTransport(newRecvTransport);

        audioSocket.on("new-producer", handleNewProducer);

        const audioTrack = await getLocalAudioStreamAndTrack();
        if (newSendTransport) {
          const newAudioProducer = await newSendTransport.produce({
            track: audioTrack,
          });
          newAudioProducer.pause();
          setAudioProducer(newAudioProducer);
        }
        const filterPeer = peers.filter(
          (list: PeersType) => list.id !== audioSocket.id,
        );
        setPeers(filterPeer);

        for (const producerInfo of existingProducers) {
          await consume(producerInfo);
        }

        setJoined(true);
      },
    );
  };

  const leaveRoom = () => {
    if (!audioSocket || !isAudioConnected) return;

    audioSocket.emit("leave-room", (response: any) => {
      if (response && response.error) {
        throw new Error("Error leaving room:", response.error);
      }

      setJoined(false);
      setPeers([]);

      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
      if (sendTransport) {
        sendTransport.close();
        setSendTransport(null);
      }
      if (recvTransport) {
        recvTransport.close();
        setRecvTransport(null);
      }
      if (device) {
        setDevice(null);
      }

      audioSocket.off("new-producer", handleNewProducer);
      router.push("/lobby");
    });
  };

  const handleNewProducer = async ({ producerId, peerId, kind }: any) => {
    await consume({ producerId, peerId, kind });
  };

  const toggleCamera = async () => {
    if (!audioSocket || !isAudioConnected) return;

    try {
      if (localStream) {
        stopCamera(localStream, videoProducer);
        setLocalStream(null);
        setVideoProducer(null);

        audioSocket.emit("user-state-changed", {
          roomId,
          peerId: audioSocket.id,
          state: {
            type: "video",
            enabled: false,
          },
        });
      } else {
        const result = await startCamera(
          sendTransport,
          videoProducer,
          localStream,
        );
        if (result) {
          setLocalStream(result.stream);
          setVideoProducer(result.producer);
        }
      }
    } catch (error) {
      throw new Error("Error toggling camera:" + error);
    }
  };

  const toggleMicrophone = async () => {
    if (!audioProducer) return;

    if (isMuted) {
      audioProducer.resume();
      setIsMuted(false);
      audioSocket.emit("user-state-changed", {
        roomId,
        peerId: audioSocket.id,
        state: {
          type: "audio",
          enabled: true,
        },
      });
    } else {
      audioProducer.pause();
      setIsMuted(true);
      audioSocket.emit("user-state-changed", {
        roomId,
        peerId: audioSocket.id,
        state: {
          type: "audio",
          enabled: false,
        },
      });
    }
  };

  useEffect(() => {
    if (audioSocket && isAudioConnected) {
      joinRoom();
    }
  }, [audioSocket, isAudioConnected]);

  useEffect(() => {
    if (!clientId || !socket || !isConnected) return;

    // 이전 방에서 나가기
    if (currentRoom) {
      socket.emit("CS_LEAVE_ROOM", {
        client_id: clientId,
        roomId: currentRoom,
      });
    }

    // 새로운 방 입장
    socket.emit("CS_JOIN_ROOM", {
      client_id: clientId,
      room_type: ROOM_TYPE,
      room_id: roomId,
    });

    setCurrentRoom(roomId);

    return () => {
      if (socket && isConnected) {
        socket.emit("CS_LEAVE_ROOM", {
          client_id: clientId,
          roomId: currentRoom,
        });
        setCurrentRoom(null);
      }
    };
  }, [socket, isConnected]);

  return (
    <div className="flex h-screen flex-col">
      <Header
        isMuted={isMuted}
        localStream={localStream}
        onMuteToggle={toggleMicrophone}
        onCameraToggle={toggleCamera}
        onLeaveRoom={leaveRoom}
      />

      <div className="relative z-10">
        {joined && (
          <div className="absolute right-0 top-0 flex w-64 flex-col overflow-y-auto">
            <div className="grid gap-4">
              {peers.length > 0 && (
                <RemoteMedia
                  peers={peers}
                  peerStates={peerStates}
                  remoteStreams={remoteStreams}
                />
              )}
            </div>
          </div>
        )}
      </div>
      <CanvasSection />
      <div className="fixed bottom-2.5 left-2.5 flex w-64 flex-col overflow-y-auto">
        <LocalVideo
          localVideoRef={localVideoRef}
          isMuted={isMuted}
          hasVideo={!!localStream}
          userName={session?.user.name ?? ""}
        />
      </div>
      <ChatWidget isOpen={chatOpen} setIsOpen={setChatOpen} position="left" />
    </div>
  );
}

export default Page;
