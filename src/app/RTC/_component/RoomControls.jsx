import { Mic, MicOff, Phone, PhoneOff, Video } from "lucide-react";

export const RoomControls = ({
  joined,
  roomId,
  setRoomId,
  joinRoom,
  leaveRoom,
  toggleMicrophone,
  isMuted,
  localStream,
  startCamera,
  stopCamera,
}) => {
  if (!joined) {
    return (
      <div className="join-container">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="input-room"
        />
        <button onClick={joinRoom} className="btn btn--primary">
          <Phone className="btn__icon" />
          Join Room
        </button>
      </div>
    );
  }

  return (
    <div className="control-buttons">
      <button onClick={leaveRoom} className="btn btn--danger">
        <PhoneOff className="btn__icon" />
        Leave Room
      </button>
      <button
        onClick={toggleMicrophone}
        className={`btn ${isMuted ? "btn--warning" : "btn--primary"}`}
      >
        {isMuted ? (
          <>
            <MicOff className="btn__icon" />
            Unmute
          </>
        ) : (
          <>
            <Mic className="btn__icon" />
            Mute
          </>
        )}
      </button>
      <button
        onClick={localStream ? stopCamera : startCamera}
        className={`btn ${localStream ? "btn--secondary" : "btn--primary"}`}
      >
        <Video className="btn__icon" />
        {localStream ? "Stop Camera" : "Start Camera"}
      </button>
    </div>
  );
};
