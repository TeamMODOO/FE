import { MicOffIcon, UserIcon, VideoOffIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LocalVideoProps {
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  isMuted: boolean;
  hasVideo: boolean;
  userName: string;
}

export function LocalVideo({
  localVideoRef,
  isMuted,
  hasVideo,
  userName,
}: LocalVideoProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`h-[200px] w-full rounded-lg object-cover ${
              !hasVideo ? "hidden" : ""
            }`}
          />
          {!hasVideo && (
            <div className="flex h-[200px] w-full flex-col items-center justify-center rounded-lg bg-gray-900">
              <UserIcon className="mb-2 size-12 text-gray-400" />
              <span className="text-sm text-gray-400">
                카메라가 꺼져 있습니다
              </span>
            </div>
          )}
          <div className="absolute right-2 top-2 flex gap-2">
            {isMuted && (
              <div className="rounded-full bg-red-500 p-1">
                <MicOffIcon className="size-4 text-white" />
              </div>
            )}
            {!hasVideo && (
              <div className="rounded-full bg-red-500 p-1">
                <VideoOffIcon className="size-4 text-white" />
              </div>
            )}
          </div>
          <div className="absolute bottom-2 right-2 flex gap-2">
            <div className="rounded-full bg-white p-1">{userName}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
