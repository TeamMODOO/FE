"use client";

import React, { useEffect, useRef } from "react";

import Style from "./Canvas.style";

const MeetingRoomCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const backgroundImage = new Image();
      backgroundImage.src = "/background/MeetingRoom.webp";
      backgroundImage.onload = () => {
        context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
      };
    }
  }, []);

  return (
    <div className={Style.canvasContainerClass}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default MeetingRoomCanvas;
