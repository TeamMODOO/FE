// hooks/useLobbySocketEvents.ts
"use client";

import { useCallback, useEffect } from "react";

import useMainSocketStore from "@/store/useMainSocketStore";
import useUsersStore from "@/store/useUsersStore";

type LobbySocketEventsProps = {
  roomId: string;
  userId: string; // 로컬스토리지 UUID (유일 식별자)
  userNickname: string;
};

/** CS_MOVEMENT_INFO / SC_MOVEMENT_INFO 구조 예시 */
interface MovementInfo {
  user_id: string; // 식별자 (uuid)
  room_id: string; // 방 ID
  position_x: number;
  position_y: number;
  direction: number; // 0=down,1=up,2=right,3=left

  user_name: string; // 화면에 표시할 이름
}

/** SC_ENTER_ROOM 구조 예시 */
interface SCEnterRoomData {
  user_id: string;
  position_x: number;
  position_y: number;
  direction: number;
  user_name: string; // 화면 표시용 이름
}

// (추가) user별 isMoving false로 만들 타이머
const moveStopTimers: Record<string, NodeJS.Timeout> = {};

export default function useLobbySocketEvents({
  roomId,
  userId,
  userNickname,
}: LobbySocketEventsProps) {
  const mainSocket = useMainSocketStore((state) => state.socket);

  const { users, updateUserPosition, addUser } = useUsersStore();

  // -----------------------------
  // (1) 내 캐릭터 이동 emit
  // -----------------------------
  const emitMovement = useCallback(
    (x: number, y: number, direction: number) => {
      if (!mainSocket) return;

      // 새 프로토콜에 user_name이 추가되었으나,
      // 여기서는 간단히 임시값 "MyName" 으로 전송(예시)
      // 실제로는 세션이나 스토어에 저장된 이름을 쓸 수도 있음.
      const data: MovementInfo = {
        user_id: userId,
        room_id: roomId,
        position_x: x,
        position_y: y,
        direction,
        user_name: userNickname,
      };
      mainSocket.emit("CS_MOVEMENT_INFO", data);
    },
    [mainSocket, roomId, userId, userNickname],
  );

  // -----------------------------
  // (2) 다른 사용자 이동 수신 (SC_MOVEMENT_INFO)
  // -----------------------------
  useEffect(() => {
    if (!mainSocket) return;

    const onMovement = (data: MovementInfo) => {
      // data = { user_id, room_id, position_x, position_y, direction, user_name }

      // 1) 스토어에 유저가 없으면 새로 addUser
      const movingUser = users.find((u) => u.id === data.user_id);
      if (!movingUser) {
        // nickname = data.user_name (화면 표시용)
        addUser(data.user_id, data.user_name, data.position_x, data.position_y);
      }

      // 2) 위치/방향 갱신
      updateUserPosition(
        data.user_id,
        data.position_x,
        data.position_y,
        data.direction,
        true, // isMoving
      );

      // 3) 일정 시간 뒤 움직임 없으면 isMoving=false
      if (moveStopTimers[data.user_id]) {
        clearTimeout(moveStopTimers[data.user_id]);
      }
      moveStopTimers[data.user_id] = setTimeout(() => {
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
      // data = { user_id, position_x, position_y, direction, user_name }

      // nickname에 user_name
      addUser(data.user_id, data.user_name, data.position_x, data.position_y);

      // 필요하다면 방향 설정도 해줄 수 있음
      updateUserPosition(
        data.user_id,
        data.position_x,
        data.position_y,
        data.direction,
        false,
      );
    };

    mainSocket.on("SC_ENTER_ROOM", onEnterRoom);

    return () => {
      mainSocket.off("SC_ENTER_ROOM", onEnterRoom);
    };
  }, [mainSocket, addUser, updateUserPosition]);

  return { emitMovement };
}
