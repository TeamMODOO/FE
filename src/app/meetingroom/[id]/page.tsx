/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import axios from "axios";
import * as mediasoupClient from "mediasoup-client";
import { Socket } from "socket.io-client";

import useAudioSocketConnect from "@/hooks/socket/useAudioSocketConnect";
import useMainSocketConnect from "@/hooks/socket/useMainSocketConnect";
import useAudioSocketStore from "@/store/useAudioSocketStore";

import CanvasSection from "./_components/canvas/CanvasSection";
import ChatWidget from "./_components/chat/ChatWidget";
import { Header } from "./_components/Header";
import { LocalVideo } from "./_components/video/LocalVideo";
import { RemoteMedia } from "./_components/video/RemoteMedia";
import { useMediaDevices } from "./_hook/webRTC/useMediaDevices";
import { usePeerEvents } from "./_hook/webRTC/usePeerSocketEvent";
import { useRoom } from "./_hook/webRTC/useRoom";
import { useWebRTC } from "./_hook/webRTC/useWebRTC";
import { RemoteStream } from "./_model/webRTC.type";

const ROOM_TYPE = "meeting";

function Page() {
  const router = useRouter();
  const params = useParams();
  const roomId = (params.id as string) ?? "99999";

  useMainSocketConnect({ roomType: ROOM_TYPE, roomId: roomId });
  useAudioSocketConnect({ roomId: roomId });

  const audioSocket: Socket = useAudioSocketStore(
    (state) => state.socket,
  ) as Socket;
  const isAudioConnected = useAudioSocketStore((state) => state.isConnected);

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
      { roomId, peerId: audioSocket.id },
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

        audioSocket.on("new-producer", handleNewProducer);

        const audioTrack = await getLocalAudioStreamAndTrack();
        if (newSendTransport) {
          const newAudioProducer = await newSendTransport.produce({
            track: audioTrack,
          });
          newAudioProducer.pause();
          setAudioProducer(newAudioProducer);
        }

        setPeers(peerIds.filter((id: string) => id !== audioSocket.id));

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
    const fetchData = async () => {
      const clientId = localStorage.getItem("client_id") ?? "";

      const payload = {
        room_id: roomId,
        client_id: clientId,
      };
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_SERVER_PATH}/meetingroom/join`,
        payload,
      );
    };
    fetchData();

    return () => {
      const fetchData = async () => {
        const clientId = localStorage.getItem("client_id") ?? "";

        const payload = {
          room_id: roomId,
          client_id: clientId,
        };

        await axios.post(
          `${process.env.NEXT_PUBLIC_API_SERVER_PATH}/meetingroom/leave`,
          payload,
        );
      };
      fetchData();
    };
  }, []);

  return (
    <div className="flex h-screen flex-col">
      <Header
        audioSocket={audioSocket}
        roomId={roomId}
        isMuted={isMuted}
        localStream={localStream}
        onMuteToggle={toggleMicrophone}
        onCameraToggle={toggleCamera}
        onLeaveRoom={leaveRoom}
      />

      <div className="relative z-10">
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
      <CanvasSection />
      <ChatWidget />
    </div>
  );
}

export default Page;
