import { Mic, MicOff, PhoneOff, Video } from "lucide-react";
import { Socket } from "socket.io-client";

import { Button } from "@/components/ui/button";

interface HeaderProps {
  socket: Socket;
  roomId: string | null;
  isMuted: boolean;
  localStream: MediaStream | null;
  onMuteToggle: () => void;
  onCameraToggle: () => void;
  onLeaveRoom: () => void;
}

export function Header({
  socket,
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
            {socket ? socket.id : "Not connected"}
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
          {isMuted ? "Unmute" : "Mute"}
        </Button>
        <Button
          variant={localStream ? "outline" : "default"}
          onClick={onCameraToggle}
        >
          <Video className="mr-2 size-4" />
          {localStream ? "Stop Camera" : "Start Camera"}
        </Button>
        <Button variant="destructive" onClick={onLeaveRoom}>
          <PhoneOff className="mr-2 size-4" />
          Leave Room
        </Button>
      </div>
    </header>
  );
}
