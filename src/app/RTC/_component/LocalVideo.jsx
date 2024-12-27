import { Video } from "lucide-react";

export const LocalVideo = ({ localVideoRef, localStream }) => {
  return (
    <div className="card">
      <h2 className="card__title">Local Video</h2>
      <div className="video-container">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="video"
        ></video>
        {!localStream && (
          <div className="video-placeholder">
            <Video className="video-placeholder__icon" />
          </div>
        )}
      </div>
    </div>
  );
};
