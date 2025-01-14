import { MicOffIcon, VideoOffIcon } from "lucide-react";

import { MediaStateIndicatorsProps } from "../../_model/webRTC.type";

export function MediaStateIndicators({
  isAudioEnabled,
  isVideoEnabled,
  userName,
}: MediaStateIndicatorsProps) {
  return (
    <>
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
      <div className="absolute bottom-2 right-2 flex gap-2">
        <div className="bg-black text-white p-1">{userName}</div>
      </div>
    </>
  );
}
