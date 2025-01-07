/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";

import * as mediasoupClient from "mediasoup-client";
import { Socket } from "socket.io-client";

import { RemoteStream } from "../../_model/webRTC.type";

type UseRoomType = {
  audioSocket: Socket | null;
  isAudioConnected: boolean;
  roomId: string;
  deviceRef: React.RefObject<mediasoupClient.Device | null>;
  recvTransportRef: React.RefObject<mediasoupClient.types.Transport | null>;
  remoteStreams: RemoteStream[];
  setRemoteStreams: React.Dispatch<React.SetStateAction<RemoteStream[]>>;
  setPeerStates: React.Dispatch<
    React.SetStateAction<Record<string, { audio: boolean; video: boolean }>>
  >;
};

export const useRoom = ({
  audioSocket,
  isAudioConnected,
  roomId,
  deviceRef,
  recvTransportRef,
  remoteStreams,
  setRemoteStreams,
  setPeerStates,
}: UseRoomType) => {
  const consume = async ({ producerId, peerId, kind }: any) => {
    const device = deviceRef.current;
    const recvTransport = recvTransportRef.current;

    if (!device || !recvTransport || !audioSocket || !isAudioConnected) return;

    try {
      const existingStream = remoteStreams.find(
        (stream) => stream.peerId === peerId && stream.kind === kind,
      );

      if (existingStream) {
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
        audioSocket.emit(
          "consume",
          {
            transportId: recvTransport.id,
            producerId,
            roomId,
            peerId: audioSocket.id,
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

      consumer.resume();

      const stream = new MediaStream([consumer.track]);

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

      setPeerStates((prev) => ({
        ...prev,
        [peerId]: {
          ...prev[peerId],
          [kind]: kind === "video",
        },
      }));
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

  useEffect(() => {
    if (!audioSocket || !isAudioConnected) return;

    const handleBeforeUnload = () => {
      audioSocket.emit("leave-room", { roomId });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      audioSocket.emit("leave-room", { roomId });
    };
  }, [audioSocket, isAudioConnected, roomId]);

  return {
    consume,
  };
};
