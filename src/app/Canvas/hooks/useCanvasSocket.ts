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

      mainSocket.emit("CS_PICTURE_INFO", {
        picture: compressedObjects,
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
  }, [canvas, saveCanvasData]);

  const loadCanvasData = (data: { picture: Uint8Array }) => {
    if (!canvas) return;
    if (!data || !data.picture) return;
    const isCanvasDataChanged = data.picture.byteLength !== 0;

    if (!isCanvasDataChanged) return;
    const receiveObjects = JSON.parse(
      Pako.inflate(data.picture, { to: "string" }),
    );
    const currentObjects = canvas.getObjects();

    // 객체를 식별하기 위한 고유 키 생성 함수
    const findUniqueObjects = (a: fabric.Object[], b: fabric.Object[]) => {
      const aSet = new Set(a.map((item) => JSON.stringify(item)));
      const bSet = new Set(b.map((item) => JSON.stringify(item)));

      const uniqueInA = a.filter((obj) => !bSet.has(JSON.stringify(obj)));
      const uniqueInB = b.filter((obj) => !aSet.has(JSON.stringify(obj)));

      return [uniqueInA, uniqueInB];
    };

    const [deletedObjects, newObjects] = findUniqueObjects(
      currentObjects,
      receiveObjects,
    );

    const deleteObject = () => {
      for (let i = 0; i < deletedObjects.length; i++) {
        canvas.remove(deletedObjects[i]);
      }
    };
    const addObject = () => {
      fabric.util.enlivenObjects(
        newObjects,
        (objs: fabric.Object[]) => {
          objs.forEach((item) => {
            canvas.add(item);
          });
        },
        "",
      );
    };
    deleteObject();
    addObject();

    canvas.renderAll();
  };

  useEffect(() => {
    if (!canvas || !mainSocket) return;

    mainSocket.on(`SC_PICTURE_INFO`, ({ data }) => loadCanvasData(data));
  }, [canvas, saveCanvasData]);
};
