import { Device } from "mediasoup-client";
import {
  Consumer,
  Producer,
  RtpCapabilities,
  Transport,
  TransportOptions,
} from "mediasoup-client/lib/types";
import { useEffect, useRef, useState } from "react";

import useAudioSocketStore from "@/store/useAudioSocketStore";

interface JoinRoomResponse {
  sendTransportOptions: TransportOptions;
  recvTransportOptions: TransportOptions;
  rtpCapabilities: RtpCapabilities;
  peerIds: string[];
  error?: string;
}

interface MediaState {
  producer: Producer | null;
  consumer: Consumer | null;
  localStream: MediaStream | null;
}

export default function AudioRTCRoom({ roomId }: { roomId: string }) {
  const socket = useAudioSocketStore((state) => state.socket);
  const isConnected = useAudioSocketStore((state) => state.isConnected);

  // 기본 상태
  const [isJoined, setIsJoined] = useState(false);
  const [peers, setPeers] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 미디어 및 디바이스 참조
  const mediaState = useRef<MediaState>({
    producer: null,
    consumer: null,
    localStream: null,
  });
  const deviceRef = useRef<Device | null>(null);
  const sendTransportRef = useRef<Transport | null>(null);
  const recvTransportRef = useRef<Transport | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // socket이 연결되었을 때만 초기화 진행
    if (socket && isConnected) {
      setupSocketListeners();
      joinRoom();
    }

    return () => {
      if (socket && isConnected) {
        cleanupResources();
        removeSocketListeners();
      }
    };
  }, [socket, isConnected]); // socket과 isConnected 둘 다 의존성으로 추가

  const setupSocketListeners = () => {
    if (!socket) return;

    socket.on("new-peer", handleNewPeer);
    socket.on("peer-left", handlePeerLeft);
    socket.on("new-producer", handleNewProducer);
    socket.on("error", handleError);
  };

  const removeSocketListeners = () => {
    if (!socket) return;

    socket.off("new-peer", handleNewPeer);
    socket.off("peer-left", handlePeerLeft);
    socket.off("new-producer", handleNewProducer);
    socket.off("error", handleError);
  };

  const handleError = (error: { message: string }) => {
    setError(error.message);
    throw new Error("WebRTC Error:" + error.message);
  };

  const handleNewPeer = ({ peerId }: { peerId: string }) => {
    setPeers((prev) => [...prev, peerId]);
  };

  const handlePeerLeft = ({ peerId }: { peerId: string }) => {
    setPeers((prev) => prev.filter((id) => id !== peerId));
  };

  const handleNewProducer = async ({
    producerId,
    peerId,
  }: {
    producerId: string;
    peerId: string;
  }) => {
    await consumeAudio({ producerId, peerId });
  };

  const createDevice = async (routerRtpCapabilities: RtpCapabilities) => {
    try {
      const device = new Device();
      await device.load({ routerRtpCapabilities });
      deviceRef.current = device;
      return device;
    } catch (error) {
      throw new Error("Failed to create device:" + error);
      setError("Failed to initialize audio device");
      throw error;
    }
  };

  const createSendTransport = (
    device: Device,
    transportOptions: TransportOptions,
  ) => {
    if (!socket) return null;

    const transport = device.createSendTransport(transportOptions);

    transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
      try {
        await new Promise<void>((resolve, reject) => {
          socket.emit(
            "connect-transport",
            {
              transportId: transport.id,
              dtlsParameters,
              roomId,
            },
            (response: { error?: string }) => {
              if (response.error) {
                reject(new Error(response.error));
              } else {
                resolve();
              }
            },
          );
        });
        callback();
      } catch (error) {
        // errback(error);
      }
    });

    transport.on(
      "produce",
      async ({ kind, rtpParameters }, callback, errback) => {
        if (!socket) {
          errback(new Error("Socket not connected"));
          return;
        }

        try {
          const { producerId, error } = await new Promise<{
            producerId?: string;
            error?: string;
          }>((resolve) => {
            socket.emit(
              "produce",
              {
                transportId: transport.id,
                kind,
                rtpParameters,
                roomId,
              },
              resolve,
            );
          });

          if (error) throw new Error(error);
          if (!producerId) throw new Error("No producer ID received");

          callback({ id: producerId });
        } catch (error) {
          // errback(error);
        }
      },
    );

    sendTransportRef.current = transport;
    return transport;
  };

  const createRecvTransport = (
    device: Device,
    transportOptions: TransportOptions,
  ) => {
    if (!socket) return null;

    const transport = device.createRecvTransport(transportOptions);

    transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
      try {
        await new Promise<void>((resolve, reject) => {
          socket.emit(
            "connect-transport",
            {
              transportId: transport.id,
              dtlsParameters,
              roomId,
            },
            (response: { error?: string }) => {
              if (response.error) {
                reject(new Error(response.error));
              } else {
                resolve();
              }
            },
          );
        });
        callback();
      } catch (error) {
        // errback(error);
      }
    });

    recvTransportRef.current = transport;
    return transport;
  };

  const joinRoom = async () => {
    if (!socket || isJoined) return;

    try {
      const response: JoinRoomResponse = await new Promise(
        (resolve, reject) => {
          socket.emit("join-room", { roomId }, (response: JoinRoomResponse) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          });
        },
      );

      const device = await createDevice(response.rtpCapabilities);
      createSendTransport(device, response.sendTransportOptions);
      createRecvTransport(device, response.recvTransportOptions);

      setPeers(response.peerIds.filter((id) => id !== socket.id));
      setIsJoined(true);
      setError(null);

      await startAudio();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
      throw new Error("Join room error:" + err);
    }
  };

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaState.current.localStream = stream;

      if (!sendTransportRef.current) {
        throw new Error("Send transport not initialized");
      }

      const audioTrack = stream.getAudioTracks()[0];
      const producer = await sendTransportRef.current.produce({
        track: audioTrack,
      });

      mediaState.current.producer = producer;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start audio");
      throw new Error("Start audio error:" + err);
    }
  };

  const consumeAudio = async ({
    producerId,
    peerId,
  }: {
    producerId: string;
    peerId: string;
  }) => {
    if (!socket || !deviceRef.current || !recvTransportRef.current) return;

    try {
      const { rtpCapabilities } = deviceRef.current;

      const { consumerOptions, error } = await new Promise<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        consumerOptions?: any;
        error?: string;
      }>((resolve) => {
        socket.emit(
          "consume",
          {
            rtpCapabilities,
            producerId,
            transportId: recvTransportRef.current?.id,
            roomId,
          },
          resolve,
        );
      });

      if (error) throw new Error(error);
      if (!consumerOptions) throw new Error("No consumer options received");

      const consumer = await recvTransportRef.current.consume(consumerOptions);
      mediaState.current.consumer = consumer;

      const remoteStream = new MediaStream([consumer.track]);

      if (audioRef.current) {
        audioRef.current.srcObject = remoteStream;
        await audioRef.current.play().catch((err) => {
          setError("Click to start audio playback");
        });
      }

      socket.emit("resume-consumer", { roomId });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to consume audio");
      throw new Error("Consume audio error:" + err);
    }
  };

  const toggleMute = () => {
    if (mediaState.current.localStream) {
      const audioTrack = mediaState.current.localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const leaveRoom = () => {
    if (!socket) return;

    socket.emit("leave-room", { roomId }, (response: { error?: string }) => {
      if (response.error) {
        setError(response.error);
        return;
      }
      cleanupResources();
    });
  };

  const cleanupResources = () => {
    if (mediaState.current.localStream) {
      mediaState.current.localStream.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
    }

    mediaState.current.producer?.close();
    mediaState.current.consumer?.close();
    sendTransportRef.current?.close();
    recvTransportRef.current?.close();

    mediaState.current = {
      producer: null,
      consumer: null,
      localStream: null,
    };

    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }

    setIsJoined(false);
    setPeers([]);
    setIsMuted(false);
    setError(null);
  };

  return (
    <div className="p-4">
      {error && (
        <div className="relative mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <audio ref={audioRef} autoPlay playsInline crossOrigin="anonymous">
        <track kind="captions" label="No captions" />
      </audio>

      <div className="space-y-4">
        <button
          onClick={toggleMute}
          className={`rounded px-4 py-2 ${
            isMuted ? "bg-red-500" : "bg-green-500"
          } text-white`}
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>

        <button
          onClick={leaveRoom}
          className="ml-2 rounded bg-gray-500 px-4 py-2 text-white"
        >
          Leave Room
        </button>

        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Connected Peers: {peers.length}
          </p>
          <p className="text-sm text-gray-600">
            Status: {isJoined ? "Connected" : "Disconnected"}
          </p>
        </div>
      </div>
    </div>
  );
}
