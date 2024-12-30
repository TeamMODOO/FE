import { MicOffIcon, VideoOffIcon } from "lucide-react";

import { MediaStateIndicatorsProps } from "../_model/webRTC.type";

export function MediaStateIndicators({
  isAudioEnabled,
  isVideoEnabled,
}: MediaStateIndicatorsProps) {
  return (
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
}
