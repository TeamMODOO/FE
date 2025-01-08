import { Consumer } from "mediasoup-client/lib/Consumer";

export interface MediaElements {
  video?: HTMLVideoElement;
  audio?: HTMLAudioElement;
}

export interface PeerState {
  audio: boolean;
  video: boolean;
}

export interface RemoteStream {
  peerId: string;
  stream: MediaStream;
  kind: "audio" | "video";
  consumer: Consumer;
}

export interface RemoteMediaProps {
  peers: PeersType[];
  peerStates: Record<string, PeerState>;
  remoteStreams: RemoteStream[];
}

export interface PeerMediaProps {
  peerId: string;
  peerName: string;
  peerStates: Record<string, PeerState>;
  remoteStreams: RemoteStream[];
  setMediaRef: (
    peerId: string,
    type: "video" | "audio",
    element: HTMLVideoElement | HTMLAudioElement | null,
  ) => void;
}

export interface MediaStateIndicatorsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  userName: string;
}

export interface PeersType {
  id: string;
  userName: string;
}
