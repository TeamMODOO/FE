import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { Socket } from "socket.io-client";

import { Button } from "@/components/ui/button";

interface HeaderProps {
  audioSocket: Socket;
  roomId: string | null;
  isMuted: boolean;
  localStream: MediaStream | null;
  onMuteToggle: () => void;
  onCameraToggle: () => void;
  onLeaveRoom: () => void;
}

export function Header({
  audioSocket,
  roomId,
  isMuted,
  localStream,
  onMuteToggle,
  onCameraToggle,
  onLeaveRoom,
}: HeaderProps) {
  return (
    <header className="flex w-full items-center justify-between bg-gray-100 p-4">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <p>
          My ID:
          <span className="font-mono">
            {audioSocket ? audioSocket.id : "Not connected"}
          </span>
        </p>
        <p>
          Room: <span className="font-mono">{roomId ? roomId : "-"}</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Button
          variant={isMuted ? "default" : "outline"}
          onClick={onMuteToggle}
        >
          {isMuted ? (
            <MicOff className="mr-2 size-4" />
          ) : (
            <Mic className="mr-2 size-4" />
          )}
          {isMuted ? "음소거 해제" : "음소거"}
        </Button>
        <Button
          variant={localStream ? "outline" : "default"}
          onClick={onCameraToggle}
        >
          {localStream ? (
            <Video className="mr-2 size-4" />
          ) : (
            <VideoOff className="mr-2 size-4" />
          )}
          {localStream ? "카메라 끄기" : "카메라 켜기"}
        </Button>
        <Button variant="destructive" onClick={onLeaveRoom}>
          <PhoneOff className="mr-2 size-4" />방 나가기
        </Button>
      </div>
    </header>
  );
}
