"use client";

import useMainSocketStore from "@/store/useMainSocketStore";

import { useCanvasEvents } from "../hooks/useCanvasEvents";
import { useCanvasInit } from "../hooks/useCanvasInit";
import { useCanvasSocket } from "../hooks/useCanvasSocket";
import Toolbar from "./Toolbar";

const CanvasSection = () => {
  const mainSocket = useMainSocketStore((state) => state.socket);

  // 캔버스 초기화
  const { canvasContainerRef, canvasRef, canvas } = useCanvasInit();
  // 캔버스 이벤트 설정
  useCanvasEvents(canvas);
  // 캔버스 데이터 소켓으로 전송
  useCanvasSocket(canvas, mainSocket);

  return (
    <div
      className="bg-grayscale-white relative h-screen w-full"
      ref={canvasContainerRef}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      <Toolbar />
    </div>
  );
};

export default CanvasSection;
