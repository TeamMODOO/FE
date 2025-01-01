// **수정 후 코드**: hooks/useLobbySocketEvents.ts
"use client";

import { useCallback, useEffect } from "react";

import useMainSocketStore from "@/store/useMainSocketStore";
import useUsersStore from "@/store/useUsersStore";

type LobbySocketEventsProps = {
  roomId: string;
  userId: string;
};

interface MovementInfo {
  user_id: string;
  room_id: string;
  position_x: number;
  position_y: number;
  direction: number; // 서버에서 보내주는 방향
}

interface SCEnterRoomData {
  user_name: string; // 서버에서 보내주는 user id (또는 닉네임)
  position: {
    x: number;
    y: number;
  };
  img_url?: string;
}

// (추가) user별 타이머를 저장하기 위한 임시 객체
const moveStopTimers: Record<string, NodeJS.Timeout> = {};

export default function useLobbySocketEvents({
  roomId,
  userId,
}: LobbySocketEventsProps) {
  const mainSocket = useMainSocketStore((state) => state.socket);

  const { users, updateUserPosition, addUser } = useUsersStore();

  // -----------------------------
  // (1) 내 캐릭터 이동 emit
  // -----------------------------
  const emitMovement = useCallback(
    (x: number, y: number, direction: number) => {
      if (!mainSocket) return;
      const data = {
        user_id: userId,
        room_id: roomId,
        position_x: x,
        position_y: y,
        direction, // 서버로 방향도 보냄
      };
      mainSocket.emit("CS_MOVEMENT_INFO", data);
    },
    [mainSocket, roomId, userId],
  );

  // -----------------------------
  // (2) 다른 사용자 이동 수신 (SC_MOVEMENT_INFO)
  // -----------------------------
  useEffect(() => {
    if (!mainSocket) return;

    const onMovement = (data: MovementInfo) => {
      // data = { user_id, room_id, position_x, position_y, direction }

      // 우선, 스토어에 해당 user가 없으면 addUser
      const movingUser = users.find((u) => u.id === data.user_id);
      if (!movingUser) {
        addUser(data.user_id, data.user_id, data.position_x, data.position_y);
      }

      // 캐릭터 이동/방향 업데이트
      const isMoving = true;
      updateUserPosition(
        data.user_id,
        data.position_x,
        data.position_y,
        data.direction,
        isMoving,
      );

      // (추가) 잠시 뒤 새 movement 없으면 isMoving=false 로 만드는 타이머
      if (moveStopTimers[data.user_id]) {
        clearTimeout(moveStopTimers[data.user_id]);
      }
      moveStopTimers[data.user_id] = setTimeout(() => {
        // 아직 같은 user가 Store에 존재한다면, isMoving=false로 업데이트
        const stillExists = useUsersStore
          .getState()
          .users.find((u) => u.id === data.user_id);
        if (stillExists) {
          // 위치 그대로, direction 그대로, isMoving만 false
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
      }, 200); // 200ms 뒤에 갱신 없음 -> 멈춤 처리
    };

    mainSocket.on("SC_MOVEMENT_INFO", onMovement);

    return () => {
      mainSocket.off("SC_MOVEMENT_INFO", onMovement);
    };
  }, [mainSocket, users, updateUserPosition, addUser]);

  // -----------------------------
  // (3) 새 유저 입장 수신 (SC_ENTER_ROOM)
  // -----------------------------
  useEffect(() => {
    if (!mainSocket) return;

    const onEnterRoom = (data: SCEnterRoomData) => {
      // ex) { user_name, position: {x, y}, img_url, ...}
      // user_name을 id 로 사용 (또는 서버에서 user_id 라는 키로 내려주면 더 명확)
      addUser(data.user_name, data.user_name, data.position.x, data.position.y);
    };
    mainSocket.on("SC_ENTER_ROOM", onEnterRoom);

    return () => {
      mainSocket.off("SC_ENTER_ROOM", onEnterRoom);
    };
  }, [mainSocket, addUser]);

  return { emitMovement };
}
