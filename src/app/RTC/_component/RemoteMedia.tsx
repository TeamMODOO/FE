/* eslint-disable jsx-a11y/media-has-caption */
import { MicOffIcon, UserIcon, VideoOffIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface PeerState {
  audio: boolean;
  video: boolean;
}

export interface RemoteStream {
  peerId: string;
  stream: MediaStream;
  kind: "audio" | "video";
}

// 타입 정의를 별도로 분리하여 코드 가독성 향상
interface MediaElements {
  video?: HTMLVideoElement;
  audio?: HTMLAudioElement;
}

interface ActiveStreamState {
  video?: MediaStream;
  audio?: MediaStream;
}

interface RemoteMediaProps {
  peers: string[];
  peerStates: Record<string, PeerState>;
  remoteStreams: RemoteStream[];
}

export function RemoteMedia({
  peers,
  peerStates,
  remoteStreams,
}: RemoteMediaProps) {
  // 활성 스트림 상태 관리
  const [activeStreams, setActiveStreams] = useState<
    Map<string, ActiveStreamState>
  >(new Map());
  // 미디어 엘리먼트 참조 관리
  const mediaRefs = useRef<Map<string, MediaElements>>(new Map());

  // 미디어 엘리먼트 참조 설정을 위한 커스텀 훅
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
    }
  };

  // 스트림 상태 업데이트 처리
  useEffect(() => {
    console.log("Remote streams updated:", remoteStreams);

    const updateActiveStreams = () => {
      const newActiveStreams = new Map();

      remoteStreams.forEach(({ peerId, stream, kind }) => {
        const peerStreams = newActiveStreams.get(peerId) || {};
        newActiveStreams.set(peerId, {
          ...peerStreams,
          [kind]: stream,
        });
      });

      setActiveStreams(newActiveStreams);
    };

    updateActiveStreams();
  }, [remoteStreams]);

  // 미디어 엘리먼트에 스트림 연결
  useEffect(() => {
    console.log("Attaching streams to elements:", activeStreams);

    const attachStreams = () => {
      activeStreams.forEach((streams, peerId) => {
        const elements = mediaRefs.current.get(peerId);
        if (!elements) return;

        Object.entries(streams).forEach(([kind, stream]) => {
          const element = kind === "video" ? elements.video : elements.audio;
          if (element && element.srcObject !== stream) {
            element.srcObject = stream;
            element.play().catch((error) => {
              console.warn(`Error playing ${kind} for peer ${peerId}:`, error);
            });
          }
        });
      });
    };

    attachStreams();

    // 클린업 함수
    return () => {
      mediaRefs.current.forEach((elements) => {
        if (elements.video) {
          elements.video.pause();
          elements.video.srcObject = null;
        }
        if (elements.audio) {
          elements.audio.pause();
          elements.audio.srcObject = null;
        }
      });
    };
  }, [activeStreams]);
  // 개별 피어의 미디어 렌더링을 위한 컴포넌트
  const PeerMedia = ({ peerId }: { peerId: string }) => {
    const peerStreams = activeStreams.get(peerId) || {};
    const hasVideoStream = !!peerStreams.video;
    const hasAudioStream = !!peerStreams.audio;
    const isVideoEnabled = peerStates[peerId]?.video && hasVideoStream;
    const isAudioEnabled = peerStates[peerId]?.audio && hasAudioStream;

    return (
      <div className="relative">
        {isVideoEnabled ? (
          <video
            ref={(el) => setMediaRef(peerId, "video", el)}
            autoPlay
            playsInline
            className="h-48 w-full rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-48 w-full flex-col items-center justify-center rounded-lg bg-gray-900">
            <UserIcon className="mb-2 size-12 text-gray-400" />
            <span className="text-sm text-gray-400">Camera is turned off</span>
          </div>
        )}

        {hasAudioStream && (
          <audio
            ref={(el) => setMediaRef(peerId, "audio", el)}
            autoPlay
            className="hidden"
          />
        )}

        <MediaStateIndicators
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
        />
      </div>
    );
  };

  // 미디어 상태 표시기 컴포넌트
  const MediaStateIndicators = ({
    isAudioEnabled,
    isVideoEnabled,
  }: {
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
  }) => (
    <div className="absolute right-2 top-2 flex gap-2">
      {!isAudioEnabled && (
        <div className="rounded-full bg-red-500 p-1">
          <MicOffIcon className="size-4 text-white" />
        </div>
      )}
      {!isVideoEnabled && (
        <div className="rounded-full bg-red-500 p-1">
          <VideoOffIcon className="size-4 text-white" />
        </div>
      )}
    </div>
  );

  if (peers.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Remote Media ({peers.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {peers.map((peerId) => (
            <PeerMedia key={peerId} peerId={peerId} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
