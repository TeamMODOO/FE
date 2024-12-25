"use client";

import { useCallback, useEffect, useState } from "react";

import useMainSocketStore from "@/store/useMainSocketStore";

// 변경된 프로토콜: position_x, position_y (int)
type MovementResponse = {
  room_id: string;
  user_id: string;
  position_x: number; // int
  position_y: number; // int
};

type UseMovementSocketProps = {
  roomId: string; // 현재 방(지도) ID
  userId: string; // 내 유저 ID
};

export const useMovementSocket = ({
  roomId,
  userId,
}: UseMovementSocketProps) => {
  // 전역 Store(Zustand 등)에서 소켓 가져오기
  const mainSocket = useMainSocketStore((state) => state.socket);

  // 서버에서 받은 이동 이벤트를 임시 저장할 배열
  const [movementLogs, setMovementLogs] = useState<MovementResponse[]>([]);

  // SC_MOVEMENT_INFO 수신 시 → movementLogs에 추가
  const handleMovementInfo = useCallback((data: MovementResponse) => {
    // data = { room_id, user_id, position_x, position_y }
    setMovementLogs((prev) => [...prev, data]);
    // console.log(data);
  }, []);

  // 캐릭터 이동을 서버에 emit (CS_MOVEMENT_INFO)
  const emitMovement = useCallback(
    (x: number, y: number) => {
      if (!mainSocket) return;

      // 변경된 프로토콜: position_x, position_y
      const movementData = {
        user_id: userId,
        room_id: roomId,
        position_x: x,
        position_y: y,
      };
      mainSocket.emit("CS_MOVEMENT_INFO", movementData);
    },
    [mainSocket, roomId, userId],
  );

  // 소켓 이벤트 등록: SC_MOVEMENT_INFO
  useEffect(() => {
    if (!mainSocket) return;

    // 서버 -> 클라이언트: SC_MOVEMENT_INFO
    mainSocket.on("SC_MOVEMENT_INFO", handleMovementInfo);

    // 언마운트 시 or 소켓 교체 시, 이벤트 해제
    return () => {
      mainSocket.off("SC_MOVEMENT_INFO", handleMovementInfo);
    };
  }, [mainSocket, handleMovementInfo]);

  return {
    movementLogs, // 서버에서 받은 이동 이벤트 목록
    emitMovement, // (x, y) 좌표를 서버로 전송
  };
};
