"use client";

import useSocketStore from "@/store/useSocketStore";

import { useCanvasEvents } from "../../_hook/canvas/useCanvasEvents";
import { useCanvasInit } from "../../_hook/canvas/useCanvasInit";
import { useCanvasSocket } from "../../_hook/canvas/useCanvasSocket";
import Toolbar from "./Toolbar";

const CanvasSection = () => {
  const { socket, isConnected } = useSocketStore();

  // 캔버스 초기화
  const { canvasContainerRef, canvasRef, canvas } = useCanvasInit();
  // 캔버스 이벤트 설정
  useCanvasEvents(canvas, canvasContainerRef);
  // 캔버스 데이터 소켓으로 전송
  useCanvasSocket(canvas, socket, isConnected);

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
