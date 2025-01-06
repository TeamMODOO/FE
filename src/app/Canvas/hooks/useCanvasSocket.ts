import { fabric } from "fabric";
import Pako from "pako";
import { useCallback, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

export const useCanvasSocket = (
  canvas: fabric.Canvas | null,
  mainSocket: Socket | null,
) => {
  const animationFrameIdRef = useRef<number>(0);
  const lastCanvasStateRef = useRef<string>("");

  const saveCanvasData = useCallback(() => {
    if (!canvas || !mainSocket) return;

    // 현재 캔버스의 전체 상태를 JSON 문자열로 변환
    const currentCanvasState = JSON.stringify(canvas);

    // 이전 상태와 비교하여 변경 사항을 감지
    if (lastCanvasStateRef.current !== currentCanvasState) {
      const newObjects = canvas.getObjects();
      const compressedObjects = Pako.gzip(JSON.stringify(newObjects));
      lastCanvasStateRef.current = currentCanvasState;

      mainSocket.emit("edit", {
        content: compressedObjects,
      });
    }
  }, [canvas, mainSocket]);

  useEffect(() => {
    if (!canvas) return;

    lastCanvasStateRef.current = JSON.stringify(canvas.toJSON());

    const checkCanvasChanges = () => {
      saveCanvasData();
      animationFrameIdRef.current = requestAnimationFrame(checkCanvasChanges);
    };

    animationFrameIdRef.current = requestAnimationFrame(checkCanvasChanges);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [canvas, mainSocket, saveCanvasData]);
};
