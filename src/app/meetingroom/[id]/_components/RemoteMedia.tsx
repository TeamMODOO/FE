import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useMediaAttachments } from "../_hook/useMediaAttachments";
import { RemoteMediaProps } from "../_model/webRTC.type";
import { PeerMedia } from "./PeerMedia";

export function RemoteMedia({
  peers,
  peerStates,
  remoteStreams,
}: RemoteMediaProps) {
  const { setMediaRef } = useMediaAttachments(remoteStreams, peerStates);

  if (peers.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>상대 비디오 ({peers.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {peers.map((peerId) => (
            <PeerMedia
              key={peerId}
              peerId={peerId}
              peerStates={peerStates}
              remoteStreams={remoteStreams}
              setMediaRef={setMediaRef}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
