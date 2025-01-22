import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";

interface HeaderProps {
  isMuted: boolean;
  localStream: MediaStream | null;
  onMuteToggle: () => void;
  onCameraToggle: () => void;
  onLeaveRoom: () => void;
}

export function Header({
  isMuted,
  localStream,
  onMuteToggle,
  onCameraToggle,
  onLeaveRoom,
}: HeaderProps) {
  return (
    <header className="flex w-full items-center bg-[rgba(0,0,0,0.8)] p-4 text-white">
      <div className="flex items-center gap-4 text-xl text-muted-foreground"></div>
      <div className="flex flex-1 items-start justify-start">
        <img src="/logo/logo_jungletower.png" alt="정글타워_로고" width={200} />
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          // variant={isMuted ? "default" : "outline"}
          onClick={onMuteToggle}
          className="
          flex gap-2
          rounded-lg
          border-2 
          border-[rgba(111,99,98,1)] 
          bg-[rgba(0,0,0,0.4)]
          p-4 
          text-xl
          text-[rgba(201,189,188,1)]
          hover:bg-[rgba(100,100,100,0.4)]
          "
        >
          {isMuted ? (
            <MicOff className="mr-2 min-h-6 min-w-6" />
          ) : (
            <Mic className="mr-2 min-h-6 min-w-6" />
          )}
          {isMuted ? "음소거 해제" : "음소거"}
        </button>
        <button
          // variant={localStream ? "outline" : "default"}
          onClick={onCameraToggle}
          className="
          flex gap-2
          rounded-lg
          border-2 
          border-[rgba(111,99,98,1)] 
          bg-[rgba(0,0,0,0.4)]
          p-4 
          text-xl
          text-[rgba(201,189,188,1)]
          hover:bg-[rgba(100,100,100,0.4)]
          "
        >
          {localStream ? (
            <Video className="mr-2 min-h-6 min-w-6" />
          ) : (
            <VideoOff className="mr-2 min-h-6 min-w-6" />
          )}
          {localStream ? "카메라 끄기" : "카메라 켜기"}
        </button>
        <button
          onClick={onLeaveRoom}
          className="
          flex gap-2
          rounded-lg
          border-2 
          border-[rgba(111,99,98,1)] 
          bg-[rgba(0,0,0,0.4)] 
          p-4 
          text-[rgba(201,189,188,1)]
          hover:bg-[rgba(100,100,100,0.4)]
          "
        >
          <PhoneOff className="mr-2 min-h-6 min-w-6 " />
          <span className="text-xl ">방 나가기</span>
        </button>
      </div>
    </header>
  );
}
