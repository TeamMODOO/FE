"use client";

import { useCallback, useEffect } from "react";

import useMainSocketStore from "@/store/useMainSocketStore";
import useUsersStore from "@/store/useUsersStore";

/**
 * 클라이언트 → 서버로 보낼 이동 정보 (CS_MOVEMENT_INFO)
 */
interface MovementInfoToServer {
  position_x: number;
  position_y: number;
  direction: number; // 0=down,1=up,2=right,3=left
}

/**
 * 서버 → 클라이언트로 받을 이동 정보 (SC_MOVEMENT_INFO)
 */
interface MovementInfoFromServer {
  client_id: string;
  position_x: number;
  position_y: number;
  direction: number;
  user_name: string;
}

/** 새 유저 입장 (SC_ENTER_USER) */
interface SCEnterUserData {
  client_id: string;
}

/** 유저 퇴장 (SC_LEAVE_USER) */
interface SCLeaveUserData {
  client_id: string;
}

type LobbySocketEventsProps = {
  userId: string; // 클라이언트에서 관리하는 고유 id (ex: 'Y1234...' or 'Nxxxx...')
  userNickname: string; // 클라이언트에서 관리하는 닉네임 (세션 등에 담긴 사용자명)
};

const moveStopTimers: Record<string, NodeJS.Timeout> = {};

export default function useLobbySocketEvents({
  userId,
  userNickname,
}: LobbySocketEventsProps) {
  const mainSocket = useMainSocketStore((state) => state.socket);

  const { users, updateUserPosition, addUser, removeUser } = useUsersStore();

  // --------------------------------------------------
  // (1) 캐릭터 이동 (CS_MOVEMENT_INFO) emit
  // --------------------------------------------------
  const emitMovement = useCallback(
    (x: number, y: number, direction: number) => {
      if (!mainSocket) return;

      // 서버 프로토콜에 맞게  { position_x, position_y, direction } 만 보냄
      const data: MovementInfoToServer = {
        position_x: x,
        position_y: y,
        direction,
      };

      // "CS_MOVEMENT_INFO" 라는 이벤트명으로 전송
      mainSocket.emit("CS_MOVEMENT_INFO", data);
    },
    [mainSocket],
  );

  // --------------------------------------------------
  // (2) 다른 사용자 이동 정보 (SC_MOVEMENT_INFO) 수신
  // --------------------------------------------------
  useEffect(() => {
    if (!mainSocket) return;

    const onMovement = (data: MovementInfoFromServer) => {
      // 1) 스토어에 해당 user가 없으면 새로 추가
      const movingUser = users.find((u) => u.id === data.client_id);
      if (!movingUser) {
        addUser(
          data.client_id,
          data.user_name,
          data.position_x,
          data.position_y,
        );
      }

      // 2) 위치/방향 갱신 + isMoving = true
      updateUserPosition(
        data.client_id,
        data.position_x,
        data.position_y,
        data.direction,
        true,
      );

      // 3) 일정 시간 뒤 움직임 없으면 isMoving=false
      if (moveStopTimers[data.client_id]) {
        clearTimeout(moveStopTimers[data.client_id]);
      }
      moveStopTimers[data.client_id] = setTimeout(() => {
        const stillExists = useUsersStore
          .getState()
          .users.find((u) => u.id === data.client_id);
        if (stillExists) {
          useUsersStore
            .getState()
            .updateUserPosition(
              data.client_id,
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

  // --------------------------------------------------
  // (3) 새 유저 입장 (SC_ENTER_USER)
  // --------------------------------------------------
  useEffect(() => {
    if (!mainSocket) return;

    const onEnterUser = (data: SCEnterUserData) => {
      const exists = users.find((u) => u.id === data.client_id);
      if (!exists) {
        // 임시로 "Guest" 사용
        addUser(data.client_id, "Guest", 500, 500);
      }
    };

    mainSocket.on("SC_ENTER_USER", onEnterUser);

    return () => {
      mainSocket.off("SC_ENTER_USER", onEnterUser);
    };
  }, [mainSocket, users, addUser]);

  // --------------------------------------------------
  // (4) 유저 퇴장 (SC_LEAVE_USER)
  // --------------------------------------------------
  useEffect(() => {
    if (!mainSocket) return;

    const onLeaveUser = (data: SCLeaveUserData) => {
      removeUser(data.client_id);
    };

    mainSocket.on("SC_LEAVE_USER", onLeaveUser);

    return () => {
      mainSocket.off("SC_LEAVE_USER", onLeaveUser);
    };
  }, [mainSocket, removeUser]);

  return { emitMovement };
}
