"use client";

import { useEffect, useRef } from "react";
import { LobbyCanvasSurfaceProps } from "../_model/LobbyCanvasSurface";
import { MAP_CONSTANTS } from "../data/config";

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
        // 실제 그리기
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderCanvas(ctx, canvas);
        lastFrameTime = currentTime;
      }
      requestAnimationRef.current = requestAnimationFrame(loop);
    };

    requestAnimationRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestAnimationRef.current)
        cancelAnimationFrame(requestAnimationRef.current);
    };
  }, [canvasRef, renderCanvas, users]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 2, // NPC/포탈보다 뒤
      }}
      width={MAP_CONSTANTS.CANVAS_WIDTH}
      height={MAP_CONSTANTS.CANVAS_HEIGHT}
    />
  );
}

export default LobbyCanvasSurface;
