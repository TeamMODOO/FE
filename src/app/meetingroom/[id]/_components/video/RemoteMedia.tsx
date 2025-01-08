import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useMediaAttachments } from "../../_hook/webRTC/useMediaAttachments";
import { RemoteMediaProps } from "../../_model/webRTC.type";
import { PeerMedia } from "./PeerMedia";

export function RemoteMedia({
  peers,
  peerStates,
  remoteStreams,
}: RemoteMediaProps) {
  const { setMediaRef } = useMediaAttachments(remoteStreams, peerStates);

  if (peers.length === 0) return null;

  return (
    <Card className="max-h-[calc(100vh-100px)] overflow-auto border-none bg-gray-200">
      <CardHeader>
        <CardTitle>상대 비디오</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="max-h-full">
          <div className="grid grid-cols-1 gap-4">
            {peers.map((data) => (
              <PeerMedia
                key={data.id}
                peerId={data.id}
                peerName={data.userName}
                peerStates={peerStates}
                remoteStreams={remoteStreams}
                setMediaRef={setMediaRef}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
