"use client";

import { useCallback, useEffect } from "react";

import useMainSocketStore from "@/store/useMainSocketStore";
import useUsersStore from "@/store/useUsersStore";

type QuestMapSocketEventsProps = {
  roomId: string;
  userId: string;
};

interface MovementInfo {
  user_id: string;
  room_id: string;
  position_x: number;
  position_y: number;
  direction: number;
}

/** QUEST_MAP_ENTER 이벤트에서 받을 데이터 구조 (예시) */
interface EnterQuestMapData {
  user_id: string;
  nickname: string;
  x: number;
  y: number;
  // 필요하다면 여기서 추가 field도 선언
  // e.g. characterType: string;
}

export default function useQuestMapSocketEvents({
  roomId,
  userId,
}: QuestMapSocketEventsProps) {
  const mainSocket = useMainSocketStore((state) => state.socket);
  const { users, updateUserPosition, addUser } = useUsersStore();

  // (1) 캐릭터 이동 emit
  const emitMovement = useCallback(
    (x: number, y: number, dir: number) => {
      if (!mainSocket) return;
      const data = {
        user_id: userId,
        room_id: roomId,
        position_x: x,
        position_y: y,
        direction: dir,
      };
      mainSocket.emit("QUEST_MAP_MOVE", data);
    },
    [mainSocket, roomId, userId],
  );

  // (2) 다른 사용자 이동 수신
  useEffect(() => {
    if (!mainSocket) return;

    const onMovement = (data: MovementInfo) => {
      // data = { user_id, room_id, position_x, position_y, direction }
      const movingUser = users.find((u) => u.id === data.user_id);
      if (!movingUser) return;

      updateUserPosition(
        data.user_id,
        data.position_x,
        data.position_y,
        data.direction,
        true,
      );

      // 200ms 뒤 isMoving=false 처리
      setTimeout(() => {
        const stillExists = useUsersStore
          .getState()
          .users.find((u) => u.id === data.user_id);
        if (stillExists) {
          useUsersStore
            .getState()
            .updateUserPosition(
              data.user_id,
              data.position_x,
              data.position_y,
              data.direction,
              false,
            );
        }
      }, 200);
    };

    mainSocket.on("QUEST_MAP_MOVE", onMovement);

    return () => {
      mainSocket.off("QUEST_MAP_MOVE", onMovement);
    };
  }, [mainSocket, users, updateUserPosition]);

  // (3) 새 유저 입장 등 이벤트 (예시)
  useEffect(() => {
    if (!mainSocket) return;

    const onEnterQuestMap = (data: EnterQuestMapData) => {
      // data = { user_id, nickname, x, y, ... }
      addUser(data.user_id, data.nickname, data.x, data.y);
    };

    mainSocket.on("QUEST_MAP_ENTER", onEnterQuestMap);

    return () => {
      mainSocket.off("QUEST_MAP_ENTER", onEnterQuestMap);
    };
  }, [mainSocket, addUser]);

  return { emitMovement };
}
