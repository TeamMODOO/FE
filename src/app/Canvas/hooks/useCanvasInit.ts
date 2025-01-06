import { fabric } from "fabric";
import { useEffect, useRef } from "react";

import useCanvasStore from "@/store/useCanvasStore";

const INITIAL_BRUSH_WIDTH = 10;

export const useCanvasInit = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { canvasInstance: canvas, setCanvasInstance: setCanvas } =
    useCanvasStore();

  useEffect(() => {
    if (!canvasContainerRef.current || !canvasRef.current) return;

    const newCanvas = new fabric.Canvas(canvasRef.current, {
      width: canvasContainerRef.current.offsetWidth,
      height: canvasContainerRef.current.offsetHeight,
    });

    // Canvas 기본 설정
    newCanvas.backgroundColor = "white";
    newCanvas.freeDrawingBrush.width = INITIAL_BRUSH_WIDTH;
    newCanvas.isDrawingMode = true;

    setCanvas(newCanvas);

    return () => {
      newCanvas.dispose();
    };
  }, [setCanvas]);

  return {
    canvasContainerRef,
    canvasRef,
    canvas,
  };
};
