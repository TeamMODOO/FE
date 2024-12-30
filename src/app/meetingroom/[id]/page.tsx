/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as mediasoupClient from "mediasoup-client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

import useAudioSocketConnect from "@/hooks/socket/useAudioSocketConnect";
import useAudioSocketStore from "@/store/useAudioSocketStore";

import ChatWidget from "./_components/ChatWidget";
import { Header } from "./_components/Header";
import { LocalVideo } from "./_components/LocalVideo";
import { RemoteMedia } from "./_components/RemoteMedia";
import { RemoteStream } from "./_model/webRTC.type";

function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = (params.id as string) ?? "99999";

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
    Record<
      string,
      {
        audio: boolean;
        video: boolean;
      }
    >
  >({});

  const [joined, setJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const deviceRef = useRef<mediasoupClient.Device | null>(null);
  const recvTransportRef = useRef<mediasoupClient.types.Transport | null>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    joinRoom();

    socket.on("new-peer", ({ peerId, state }) => {
      setPeers((prevPeers) => [...prevPeers, peerId]);

      setPeerStates((prevPeers) => ({
        ...prevPeers,
        [peerId]: { audio: false, video: false, ...state },
      }));
    });

    socket.on("peer-state-changed", ({ peerId, state }) => {
      setPeerStates((prev) => ({
        ...prev,
        [peerId]: {
          ...prev[peerId],
          [state.type]: state.enabled,
        },
      }));
    });

    socket.on("peer-left", ({ peerId }) => {
      setPeers((prevPeers) => prevPeers.filter((id) => id !== peerId));

      // peer의 상태 정보를 제거합니다
      setPeerStates((prev) => {
        const newStates = { ...prev };
        delete newStates[peerId];
        return newStates;
      });
    });

    return () => {
      socket.off("new-peer");
      socket.off("peer-state-changed");
      socket.off("peer-left");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleBeforeUnload = () => {
      if (joined) {
        socket.emit("leave-room", { roomId });
      }
    };

    // 페이지 언로드 시 이벤트 처리
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (joined) {
        socket.emit("leave-room", { roomId });
      }
    };
  }, [socket, joined, roomId]);

  const createDevice = async (rtpCapabilities: any) => {
    const newDevice = new mediasoupClient.Device();
    await newDevice.load({ routerRtpCapabilities: rtpCapabilities });
    setDevice(newDevice);
    deviceRef.current = newDevice; // deviceRef에 값 할당
    return newDevice;
  };

  const createSendTransport = (
    device: mediasoupClient.Device,
    transportOptions: any,
  ) => {
    if (!socket || !isConnected) return;

    const newSendTransport = device.createSendTransport(transportOptions);
    newSendTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
      try {
        socket.emit("connect-transport", {
          transportId: newSendTransport.id,
          dtlsParameters,
          roomId,
          peerId: socket.id,
        });
        callback();
      } catch (error: any) {
        errback(error);
      }
    });

    newSendTransport.on(
      "produce",
      ({ kind, rtpParameters }, callback, errback) => {
        try {
          socket.emit(
            "produce",
            {
              transportId: newSendTransport.id,
              kind,
              rtpParameters,
              roomId,
              peerId: socket.id,
            },
            (producerId: string) => {
              callback({ id: producerId });
            },
          );
        } catch (error: any) {
          errback(error);
        }
      },
    );
    setSendTransport(newSendTransport);
    return newSendTransport;
  };

  const createRecvTransport = (
    device: mediasoupClient.types.Device,
    transportOptions: any,
  ) => {
    const newRecvTransport = device.createRecvTransport(transportOptions);
    newRecvTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
      if (!socket || !isConnected) return;

      try {
        socket.emit("connect-transport", {
          transportId: newRecvTransport.id,
          dtlsParameters,
          roomId,
          peerId: socket.id,
        });
        callback();
      } catch (error: any) {
        errback(error);
      }
    });
    setRecvTransport(newRecvTransport);
    recvTransportRef.current = newRecvTransport;
    return newRecvTransport;
  };

  const getLocalAudioStreamAndTrack = async () => {
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const audioTrack = audioStream.getAudioTracks()[0];
    return audioTrack;
  };

  const joinRoom = () => {
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

        // Device 생성 및 로드
        const newDevice = await createDevice(rtpCapabilities);

        // 송신용 Transport 생성
        const newSendTransport = createSendTransport(
          newDevice,
          sendTransportOptions,
        );

        // 수신용 Transport 생성
        createRecvTransport(newDevice, recvTransportOptions);

        socket.on("new-producer", handleNewProducer);

        // 오디오 스트림 캡처 및 Producer 생성
        const audioTrack = await getLocalAudioStreamAndTrack();

        if (!newSendTransport)
          throw new Error("Send transport is not initialized");

        const newAudioProducer = await newSendTransport.produce({
          track: audioTrack,
        });
        newAudioProducer.pause();
        setAudioProducer(newAudioProducer);

        // 기존 참여자 목록 업데이트
        setPeers(peerIds.filter((id: string) => id !== socket.id));

        // 기존 Producer들에 대한 Consumer 생성
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
      // 로컬 상태 초기화
      setJoined(false);
      setPeers([]);
      // 리소스 정리
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
      // 이벤트 리스너 제거
      socket.off("new-producer", handleNewProducer);
      router.push("/lobby");
    });
  };

  const handleNewProducer = async ({ producerId, peerId, kind }: any) => {
    await consume({ producerId, peerId, kind });
  };

  const consume = async ({ producerId, peerId, kind }: any) => {
    const device = deviceRef.current;
    const recvTransport = recvTransportRef.current;

    if (!device || !recvTransport || !socket) return;

    try {
      // 이전 스트림 정리
      const existingStream = remoteStreams.find(
        (stream) => stream.peerId === peerId && stream.kind === kind,
      );

      if (existingStream) {
        // consumer가 있는 경우 명시적으로 close
        if ("consumer" in existingStream) {
          (existingStream.consumer as mediasoupClient.types.Consumer).close();
        }
        setRemoteStreams((prev) =>
          prev.filter(
            (stream) => !(stream.peerId === peerId && stream.kind === kind),
          ),
        );
      }

      const { consumerData }: any = await new Promise((resolve, reject) => {
        socket.emit(
          "consume",
          {
            transportId: recvTransport.id,
            producerId,
            roomId,
            peerId: socket.id,
            rtpCapabilities: device.rtpCapabilities,
          },
          (response: any) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          },
        );
      });

      const consumer = await recvTransport.consume({
        id: consumerData.id,
        producerId: consumerData.producerId,
        kind: consumerData.kind,
        rtpParameters: consumerData.rtpParameters,
      });

      consumer.resume(); // 모든 consumer를 즉시 resume

      const stream = new MediaStream([consumer.track]);

      // consumer 정보를 포함하여 저장
      setRemoteStreams((prev) => {
        const withoutOld = prev.filter(
          (s) => !(s.peerId === peerId && s.kind === kind),
        );
        return [
          ...withoutOld,
          {
            peerId,
            stream,
            kind,
            consumer,
          },
        ];
      });

      if (kind === "audio") {
        setPeerStates((prev) => ({
          ...prev,
          [peerId]: {
            ...prev[peerId],
            [kind]: false,
          },
        }));
      } else {
        setPeerStates((prev) => ({
          ...prev,
          [peerId]: {
            ...prev[peerId],
            [kind]: true,
          },
        }));
      }
    } catch (error) {
      setPeerStates((prev) => ({
        ...prev,
        [peerId]: {
          ...prev[peerId],
          [kind]: false,
        },
      }));
    }
  };

  const toggleCamera = async () => {
    if (!socket || !isConnected) return;

    try {
      if (localStream) {
        stopCamera();

        socket.emit("user-state-changed", {
          roomId,
          peerId: socket.id,
          state: {
            type: "video",
            enabled: false,
          },
        });
      } else {
        await startCamera();

        socket.emit("user-state-changed", {
          roomId,
          peerId: socket.id,
          state: {
            type: "video",
            enabled: true,
          },
        });
      }
    } catch (error) {
      throw new Error("Error toggling camera:" + error);
    }
  };

  // 카메라 시작
  const startCamera = async () => {
    if (!sendTransport) return;

    try {
      if (videoProducer) {
        videoProducer.close();
        setVideoProducer(null);
      }

      // 새로운 비디오 스트림을 얻기 전에 이전 스트림 정리
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setLocalStream(stream);

      const videoTrack = stream.getVideoTracks()[0];

      // 트랙 설정 확인
      if (videoTrack) {
        videoTrack.contentHint = "motion";

        // Producer 생성
        const newVideoProducer = await sendTransport.produce({
          track: videoTrack,
          encodings: [
            { maxBitrate: 100000 },
            { maxBitrate: 300000 },
            { maxBitrate: 900000 },
          ],
          codecOptions: {
            videoGoogleStartBitrate: 1000,
          },
        });

        setVideoProducer(newVideoProducer);

        socket.emit("user-state-changed", {
          roomId,
          peerId: socket.id,
          state: {
            type: "video",
            enabled: true,
          },
        });
      }
    } catch (error: any) {
      throw new Error(`Failed to start camera: ${error.message}`);
    }
  };

  // 카메라 중지
  const stopCamera = () => {
    if (localStream) {
      // 모든 트랙을 개별적으로 중지
      localStream.getTracks().forEach((track) => {
        track.stop();
        localStream.removeTrack(track);
      });
      setLocalStream(null);
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (videoProducer) {
      videoProducer.close();
      setVideoProducer(null);
    }
  };

  // 마이크 토글 함수 추가
  const toggleMicrophone = async () => {
    if (!audioProducer) return;

    if (isMuted) {
      // 음소거 해제
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
      // 음소거
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
      <ChatWidget />
    </div>
  );
}

export default RoomPage;
