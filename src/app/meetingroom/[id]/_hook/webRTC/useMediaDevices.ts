import { useRef } from "react";

import * as mediasoupClient from "mediasoup-client";
import { Socket } from "socket.io-client";

export const useMediaDevices = (
  socket: Socket | null,
  isConnected: boolean,
  roomId: string,
) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const getLocalAudioStreamAndTrack = async () => {
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const audioTrack = audioStream.getAudioTracks()[0];
    return audioTrack;
  };

  const startCamera = async (
    sendTransport: mediasoupClient.types.Transport | null,
    videoProducer: mediasoupClient.types.Producer | null,
    localStream: MediaStream | null,
  ) => {
    if (!sendTransport || !socket || !isConnected) return;

    try {
      if (videoProducer) {
        videoProducer.close();
      }

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

      const videoTrack = stream.getVideoTracks()[0];

      if (videoTrack) {
        videoTrack.contentHint = "motion";

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

        socket.emit("user-state-changed", {
          roomId,
          peerId: socket.id,
          state: {
            type: "video",
            enabled: true,
          },
        });

        return {
          stream,
          producer: newVideoProducer,
        };
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(`Failed to start camera: ${error.message}`);
    }
  };

  const stopCamera = (
    localStream: MediaStream | null,
    videoProducer: mediasoupClient.types.Producer | null,
  ) => {
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
        localStream.removeTrack(track);
      });
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (videoProducer) {
      videoProducer.close();
    }
  };

  return {
    localVideoRef,
    getLocalAudioStreamAndTrack,
    startCamera,
    stopCamera,
  };
};
