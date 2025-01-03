/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as mediasoupClient from "mediasoup-client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

import useAudioSocketConnect from "@/hooks/socket/useAudioSocketConnect";
import useMainSocketConnect from "@/hooks/socket/useMainSocketConnect";
import useAudioSocketStore from "@/store/useAudioSocketStore";

import ChatWidget from "./_components/ChatWidget";
import { Header } from "./_components/Header";
import { LocalVideo } from "./_components/LocalVideo";
import { RemoteMedia } from "./_components/RemoteMedia";
import { useMediaDevices } from "./_hook/useMediaDevices";
import { usePeerEvents } from "./_hook/usePeerSocketEvent";
import { useRoom } from "./_hook/useRoom";
import { useWebRTC } from "./_hook/useWebRTC";
import { RemoteStream } from "./_model/webRTC.type";

const ROOM_TYPE = "meeting";

function Page() {
  const router = useRouter();
  const params = useParams();
  const roomId = (params.id as string) ?? "99999";

  useMainSocketConnect({ roomType: ROOM_TYPE, roomId: roomId });
  useAudioSocketConnect({ roomId: roomId });

  const socket: Socket = useAudioSocketStore((state) => state.socket) as Socket;
  const isConnected = useAudioSocketStore((state) => state.isConnected);

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
  const [peers, setPeers] = useState<string[]>([]);
  const [peerStates, setPeerStates] = useState<
    Record<string, { audio: boolean; video: boolean }>
  >({});
  const [joined, setJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const {
    deviceRef,
    recvTransportRef,
    createDevice,
    createSendTransport,
    createRecvTransport,
  } = useWebRTC(socket, isConnected, roomId);

  const {
    localVideoRef,
    getLocalAudioStreamAndTrack,
    startCamera,
    stopCamera,
  } = useMediaDevices(socket, isConnected, roomId);

  const { consume } = useRoom(
    socket,
    isConnected,
    roomId,
    deviceRef,
    recvTransportRef,
    remoteStreams,
    setRemoteStreams,
    setPeerStates,
  );

  usePeerEvents({
    socket,
    isConnected,
    setPeers,
    setPeerStates,
  });

  const joinRoom = async () => {
    if (!socket || !isConnected || !roomId) return;

    socket.emit(
      "join-room",
      { roomId, peerId: socket.id },
      async (response: any) => {
        if (response.error) {
          throw new Error("Error joining room:", response.error);
        }

        const {
          sendTransportOptions,
          recvTransportOptions,
          rtpCapabilities,
          peerIds,
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

        socket.on("new-producer", handleNewProducer);

        const audioTrack = await getLocalAudioStreamAndTrack();
        if (newSendTransport) {
          const newAudioProducer = await newSendTransport.produce({
            track: audioTrack,
          });
          newAudioProducer.pause();
          setAudioProducer(newAudioProducer);
        }

        setPeers(peerIds.filter((id: string) => id !== socket.id));

        for (const producerInfo of existingProducers) {
          await consume(producerInfo);
        }

        setJoined(true);
      },
    );
  };

  const leaveRoom = () => {
    if (!socket || !isConnected) return;

    socket.emit("leave-room", (response: any) => {
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

      socket.off("new-producer", handleNewProducer);
      router.push("/lobby");
    });
  };

  const handleNewProducer = async ({ producerId, peerId, kind }: any) => {
    await consume({ producerId, peerId, kind });
  };

  const toggleCamera = async () => {
    if (!socket || !isConnected) return;

    try {
      if (localStream) {
        stopCamera(localStream, videoProducer);
        setLocalStream(null);
        setVideoProducer(null);

        socket.emit("user-state-changed", {
          roomId,
          peerId: socket.id,
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
      socket.emit("user-state-changed", {
        roomId,
        peerId: socket.id,
        state: {
          type: "audio",
          enabled: true,
        },
      });
    } else {
      audioProducer.pause();
      setIsMuted(true);
      socket.emit("user-state-changed", {
        roomId,
        peerId: socket.id,
        state: {
          type: "audio",
          enabled: false,
        },
      });
    }
  };

  useEffect(() => {
    if (socket && isConnected) {
      joinRoom();
    }
  }, [socket, isConnected]);

  return (
    <div className="flex h-screen flex-col">
      <Header
        socket={socket}
        roomId={roomId}
        isMuted={isMuted}
        localStream={localStream}
        onMuteToggle={toggleMicrophone}
        onCameraToggle={toggleCamera}
        onLeaveRoom={leaveRoom}
      />

      <div className="relative">
        {joined && (
          <div className="absolute right-2.5 top-2.5 flex w-64 flex-col overflow-y-auto">
            <div className="grid gap-4">
              <LocalVideo
                localVideoRef={localVideoRef}
                isMuted={isMuted}
                hasVideo={!!localStream}
              />
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
      <ChatWidget roomId={roomId} />
    </div>
  );
}

export default Page;
