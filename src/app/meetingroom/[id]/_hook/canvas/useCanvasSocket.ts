"use client";
import { useCallback, useEffect, useRef } from "react";

import { useParams } from "next/navigation";

import { fabric } from "fabric";
import Pako from "pako";
import { Socket } from "socket.io-client";

import useClientIdStore from "@/store/useClientIdStore";

interface CanvasState {
  objects: fabric.Object[];
}

export const useCanvasSocket = (
  canvas: fabric.Canvas | null,
  socket: Socket | null,
  isConnected: boolean,
) => {
  const { clientId } = useClientIdStore();

  // 마지막 캔버스 상태를 저장하는 ref
  const lastCanvasStateRef = useRef<CanvasState>({ objects: [] });
  // 업데이트 진행 중 여부를 추적하는 ref
  const isUpdatingRef = useRef(false);
  // 룸 아이디
  const params = useParams();
  const roomId = (params.id as string) ?? "99999";

  const extractObjectState = useCallback((obj: fabric.Object) => {
    const baseState = {
      type: obj.type,
      left: obj.left,
      top: obj.top,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      angle: obj.angle,
    };

    if (obj.type === "path") {
      return {
        ...baseState,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        path: (obj as any).path,
      };
    }

    return baseState;
  }, []);

  // 상태 변경 감지
  const hasSignificantChanges = useCallback(
    (currentObjects: fabric.Object[]) => {
      if (currentObjects.length !== lastCanvasStateRef.current.objects.length) {
        return true;
      }

      // 객체별 상태 비교를 통한 변경 감지
      return currentObjects.some((obj, index) => {
        const currentState = extractObjectState(obj);
        const prevObject = lastCanvasStateRef.current.objects[index];

        if (!prevObject) return true;

        const prevState = extractObjectState(prevObject);
        return JSON.stringify(currentState) !== JSON.stringify(prevState);
      });
    },
    [extractObjectState],
  );

  // 상태 전송 함수
  const sendCanvasState = useCallback(
    (objects: fabric.Object[]) => {
      if (!socket || !isConnected || isUpdatingRef.current) return;

      const serializedObjects = objects.map((obj) =>
        obj.toObject([
          "type",
          "path",
          "left",
          "top",
          "scaleX",
          "scaleY",
          "angle",
        ]),
      );
      const compressedData = Pako.gzip(JSON.stringify(serializedObjects));

      socket.emit("CS_PICTURE_INFO", {
        picture: compressedData,
        room_id: roomId,
        client_id: clientId,
      });
    },
    [socket],
  );

  // 캔버스 수정 이벤트 처리
  const handleCanvasModification = useCallback(() => {
    if (!canvas || isUpdatingRef.current) return;

    const currentObjects = canvas.getObjects();
    if (hasSignificantChanges(currentObjects)) {
      lastCanvasStateRef.current = {
        objects: [...currentObjects],
      };
      sendCanvasState(currentObjects);
    }
  }, [canvas, hasSignificantChanges, sendCanvasState]);

  // 수신된 데이터 처리
  const handleIncomingData = useCallback(
    (data: { picture: Uint8Array }) => {
      if (!canvas || !data.picture || isUpdatingRef.current) return;

      isUpdatingRef.current = true;
      const decompressedData = JSON.parse(
        Pako.inflate(data.picture, { to: "string" }),
      );

      // 현재 상태와 새로운 데이터의 효율적인 비교
      const currentState = canvas.getObjects().map(extractObjectState);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newState = decompressedData.map((obj: any) => ({
        type: obj.type,
        path: obj.path,
        left: obj.left,
        top: obj.top,
        scaleX: obj.scaleX,
        scaleY: obj.scaleY,
        angle: obj.angle,
      }));

      if (JSON.stringify(currentState) !== JSON.stringify(newState)) {
        // requestAnimationFrame을 사용하여 렌더링 최적화
        requestAnimationFrame(() => {
          canvas.clear();
          fabric.util.enlivenObjects(
            decompressedData,
            (objects: fabric.Object[]) => {
              objects.forEach((obj) => canvas.add(obj));
              canvas.renderAll();
              isUpdatingRef.current = false;
            },
            "",
          );
        });
      } else {
        isUpdatingRef.current = false;
      }
    },
    [canvas, extractObjectState],
  );

  // 이벤트 리스너 설정
  useEffect(() => {
    if (!canvas) return;

    const events = [
      "object:added",
      "object:modified",
      "object:removed",
      "path:created",
    ];

    events.forEach((event) => {
      canvas.on(event, handleCanvasModification);
    });

    return () => {
      events.forEach((event) => {
        canvas.off(event, handleCanvasModification);
      });
    };
  }, [canvas, handleCanvasModification]);

  // 소켓 이벤트 리스너
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("SC_PICTURE_INFO", handleIncomingData);

    return () => {
      socket.off("SC_PICTURE_INFO", handleIncomingData);
    };
  }, [socket, handleIncomingData]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("SC_GET_PICTURE", () => {
      sendCanvasState(lastCanvasStateRef.current.objects);
    });
  }, [lastCanvasStateRef, lastCanvasStateRef.current]);

  useEffect(() => {
    if (!socket || !isConnected || !canvas) return;

    socket.on("SC_GET_PICTURE", () => {
      const currentObjects = canvas.getObjects();
      sendCanvasState(currentObjects);
    });
  }, [canvas]);
};
