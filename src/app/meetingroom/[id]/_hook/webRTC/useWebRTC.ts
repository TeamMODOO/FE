/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from "react";

import * as mediasoupClient from "mediasoup-client";
import { Socket } from "socket.io-client";

export const useWebRTC = (
  socket: Socket | null,
  isConnected: boolean,
  roomId: string,
) => {
  const deviceRef = useRef<mediasoupClient.Device | null>(null);
  const recvTransportRef = useRef<mediasoupClient.types.Transport | null>(null);

  const createDevice = async (rtpCapabilities: any) => {
    const newDevice = new mediasoupClient.Device();
    await newDevice.load({ routerRtpCapabilities: rtpCapabilities });
    deviceRef.current = newDevice;
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
    recvTransportRef.current = newRecvTransport;
    return newRecvTransport;
  };

  return {
    deviceRef,
    recvTransportRef,
    createDevice,
    createSendTransport,
    createRecvTransport,
  };
};
