"use client";

import { useCallback, useEffect } from "react";

import useMainSocketStore from "@/store/useMainSocketStore";
import useUsersStore from "@/store/useUsersStore";

type MyRoomSocketEventsProps = {
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

interface EnterMyRoomData {
  user_id: string;
  nickname: string;
  x: number;
  y: number;
}

/**
 * 마이룸 전용 소켓 이벤트 훅
 * (서버와의 이벤트명은 실제 환경에 맞춰 조정하세요)
 */
export default function useMyRoomSocketEvents({
  roomId,
  userId,
}: MyRoomSocketEventsProps) {
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
        direction,
      };
      mainSocket.emit("CS_MYROOM_MOVEMENT_INFO", data);
    },
    [mainSocket, roomId, userId],
  );

  // -----------------------------
  // (2) 다른 사용자 이동 수신 (SC_MYROOM_MOVEMENT_INFO)
  // -----------------------------
  useEffect(() => {
    if (!mainSocket) return;

    const onMovement = (data: MovementInfo) => {
      // data = { user_id, room_id, position_x, position_y, direction }
      // 내 화면에서 해당 user 정보 업데이트
      const movingUser = users.find((u) => u.id === data.user_id);
      if (!movingUser) return;

      // 이미 Store에 있는 사용자라면, 위치/방향 업데이트
      updateUserPosition(
        data.user_id,
        data.position_x,
        data.position_y,
        data.direction,
        true,
      );

      // 약간의 지연 후 isMoving=false 처리는 여기서 해도 되고
      // 혹은 로비처럼 타이머 로직을 둬도 됩니다.
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

    mainSocket.on("SC_MYROOM_MOVEMENT_INFO", onMovement);
    return () => {
      mainSocket.off("SC_MYROOM_MOVEMENT_INFO", onMovement);
    };
  }, [mainSocket, users, updateUserPosition]);

  // -----------------------------
  // (3) 새 유저 입장 or 기타 이벤트도 가능
  // -----------------------------
  useEffect(() => {
    if (!mainSocket) return;

    const onEnterMyRoom = (newUserData: EnterMyRoomData) => {
      // 예) { user_id, nickname, x, y, ... }
      addUser(
        newUserData.user_id,
        newUserData.nickname,
        newUserData.x,
        newUserData.y,
      );
    };
    mainSocket.on("SC_ENTER_MYROOM", onEnterMyRoom);

    return () => {
      mainSocket.off("SC_ENTER_MYROOM", onEnterMyRoom);
    };
  }, [mainSocket, addUser]);

  return { emitMovement };
}
