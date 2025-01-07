"use client";
import { useEffect, useRef } from "react";

import {
  MediaElements,
  PeerState,
  RemoteStream,
} from "../../_model/webRTC.type";

export const useMediaAttachments = (
  remoteStreams: RemoteStream[],
  peerStates: Record<string, PeerState>,
) => {
  const mediaRefs = useRef<Map<string, MediaElements>>(new Map());

  const attachStreamToElement = async (
    element: HTMLVideoElement | HTMLAudioElement,
    stream: MediaStream,
    kind: "audio" | "video",
  ) => {
    try {
      if (element.srcObject !== stream) {
        if (element.srcObject) {
          element.pause();
          element.srcObject = null;
        }

        element.srcObject = stream;

        if (kind === "audio") {
          element.volume = 1.0;
        }

        try {
          await element.play();
        } catch (error) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((error as any).name === "NotAllowedError") {
            element.muted = true;
            await element.play();
            if (kind === "audio") {
              element.muted = false;
            }
          }
        }
      }
    } catch (error) {
      throw new Error("Error attaching stream: " + error);
    }
  };

  const setMediaRef = (
    peerId: string,
    type: "video" | "audio",
    element: HTMLVideoElement | HTMLAudioElement | null,
  ) => {
    if (element) {
      const current = mediaRefs.current.get(peerId) || {};
      mediaRefs.current.set(peerId, {
        ...current,
        [type]: element,
      });

      const peerStreams = remoteStreams.filter((s) => s.peerId === peerId);
      const matchingStream = peerStreams.find((s) => s.kind === type);

      if (matchingStream && peerStates[peerId]?.[type]) {
        attachStreamToElement(element, matchingStream.stream, type);
      }
    }
  };

  useEffect(() => {
    const mediaRef = mediaRefs.current;
    mediaRef.forEach((elements, peerId) => {
      const peerStreams = remoteStreams.filter((s) => s.peerId === peerId);

      for (const stream of peerStreams) {
        const element =
          stream.kind === "video" ? elements.video : elements.audio;
        if (element && peerStates[peerId]?.[stream.kind]) {
          attachStreamToElement(element, stream.stream, stream.kind);
        }
      }
    });

    return () => {
      mediaRef.forEach((elements) => {
        Object.values(elements).forEach((element) => {
          if (element) {
            element.pause();
            element.srcObject = null;
          }
        });
      });
    };
  }, [remoteStreams, peerStates]);

  return { setMediaRef };
};
