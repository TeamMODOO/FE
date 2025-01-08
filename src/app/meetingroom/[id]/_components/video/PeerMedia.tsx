/* eslint-disable jsx-a11y/media-has-caption */
import { UserIcon } from "lucide-react";

import { PeerMediaProps } from "../../_model/webRTC.type";
import { MediaStateIndicators } from "./MediaStateIndicators";

export function PeerMedia({
  peerId,
  peerStates,
  remoteStreams,
  setMediaRef,
}: PeerMediaProps) {
  const peerStreams = remoteStreams.filter(
    (stream) => stream.peerId === peerId,
  );
  const hasVideoStream = peerStreams.some((stream) => stream.kind === "video");
  const hasAudioStream = peerStreams.some((stream) => stream.kind === "audio");

  const peerState = peerStates[peerId] || { audio: false, video: false };

  const isVideoEnabled = peerState.video && hasVideoStream;
  const isAudioEnabled = peerState.audio && hasAudioStream;

  return (
    <div className="relative">
      {isVideoEnabled ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          ref={(el) => setMediaRef(peerId, "video", el)}
          autoPlay
          playsInline
          className="h-48 w-full rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-48 w-full flex-col items-center justify-center rounded-lg bg-gray-900">
          <UserIcon className="mb-2 size-12 text-gray-400" />
          <span className="text-sm text-gray-400">카메라가 꺼져 있습니다</span>
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
        userName={peerId}
      />
    </div>
  );
}
