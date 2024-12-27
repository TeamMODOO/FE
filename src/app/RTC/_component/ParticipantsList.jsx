import { Mic, MicOff } from "lucide-react";

const ParticipantsList = ({ socket, peers, isMuted, speakingStates }) => {
  return (
    <div className="participants-list">
      {/* 로컬 사용자 (자신) 표시 */}
      {socket && (
        <div className="participant-item self">
          <div className="participant-avatar self">
            {socket.id.slice(0, 2).toUpperCase()}
          </div>
          <div className="participant-info">
            <span className="participant-id">{socket.id}</span>
            <span className="participant-tag">You</span>
          </div>
          <div className={`mic-status ${isMuted ? "muted" : ""}`}>
            {isMuted ? (
              <MicOff className="size-4" />
            ) : (
              <Mic className="size-4" />
            )}
          </div>
        </div>
      )}

      {/* 원격 참가자들 표시 */}
      {peers.map((peerId) => (
        <div key={peerId} className="participant-item">
          <div className="participant-avatar">
            {peerId.slice(0, 2).toUpperCase()}
          </div>
          <span className="participant-id">{peerId}</span>
          <div
            className={`speaking-indicator ${speakingStates[peerId] ? "speaking" : ""}`}
          >
            {speakingStates[peerId] ? (
              <Mic className="size-4" />
            ) : (
              <MicOff className="size-4" />
            )}
          </div>
        </div>
      ))}

      {/* 참가자가 없을 때 메시지 */}
      {peers.length === 0 && (
        <p className="no-participants">No participants yet</p>
      )}
    </div>
  );
};

export default ParticipantsList;
