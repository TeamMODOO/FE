"use client";

import { useEffect, useRef } from "react";

import { LobbyCanvasSurfaceProps } from "../../_model/LobbyCanvasSurface";
import { MAP_CONSTANTS } from "../MapConstants";
import Style from "./LobbyCanvasSurface.style";

function LobbyCanvasSurface({
  canvasRef,
  renderCanvas,
  users,
}: LobbyCanvasSurfaceProps) {
  const requestAnimationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const FRAME_RATE = 30;
    const FRAME_INTERVAL = 1000 / FRAME_RATE;
    let lastFrameTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = currentTime - lastFrameTime;
      if (delta >= FRAME_INTERVAL) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderCanvas(ctx, canvas);
        lastFrameTime = currentTime;
      }
      requestAnimationRef.current = requestAnimationFrame(loop);
    };

    requestAnimationRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestAnimationRef.current) {
        cancelAnimationFrame(requestAnimationRef.current);
      }
    };
  }, [canvasRef, renderCanvas, users]);

  return (
    <canvas
      ref={canvasRef}
      className={Style.canvasClass}
      width={MAP_CONSTANTS.CANVAS_WIDTH}
      height={MAP_CONSTANTS.CANVAS_HEIGHT}
    />
  );
}

export default LobbyCanvasSurface;
