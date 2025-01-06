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
  direction: number; // 0=Down,1=Up,2=Right,3=Left
}

/**
 * 서버 → 클라이언트 (SC_MOVEMENT_INFO)
 * : 다른 사용자의 이동 패킷
 */
interface MovementInfoFromServer {
  client_id: string;
  position_x: number;
  position_y: number;
  direction: number;
  user_name: string;
}

/**
 * 새 유저가 "처음 방에 들어왔을 때" (SC_ENTER_ROOM)
 */
interface SCEnterRoomData {
  client_id: string;
  position_x: number;
  position_y: number;
  direction: number;
  user_name: string;
}

/**
 * 유저 퇴장 (SC_LEAVE_USER)
 */
interface SCLeaveUserData {
  client_id: string;
}

/**
 * 새로 추가된 프로토콜: SC_USER_POSITION_INFO
 * : 서버가 "현재 접속해있는 모든 유저 정보"를 개별적으로 내려줌
 */
interface SCUserPositionInfo {
  client_id: string;
  position_x: number;
  position_y: number;
  direction: number;
  user_name: string;
}

type LobbySocketEventsProps = {
  userId: string; // 내 클라이언트 ID
  userNickname: string; // 내 닉네임
};

const moveStopTimers: Record<string, NodeJS.Timeout> = {};

export default function useLobbySocketEvents({
  userId,
  userNickname,
}: LobbySocketEventsProps) {
  const mainSocket = useMainSocketStore((state) => state.socket);

  // 유저 스토어
  const { users, addUser, updateUserPosition, removeUser } = useUsersStore();

  // ─────────────────────────────────────────────
  // (A) 캐릭터 이동 정보 emit → "CS_MOVEMENT_INFO"
  // ─────────────────────────────────────────────
  const emitMovement = useCallback(
    (x: number, y: number, direction: number) => {
      if (!mainSocket) return;

      const data: MovementInfoToServer = {
        position_x: x,
        position_y: y,
        direction,
      };
      mainSocket.emit("CS_MOVEMENT_INFO", data);
    },
    [mainSocket],
  );

  // ─────────────────────────────────────────────
  // (B) 다른 사용자 이동 정보 수신 → "SC_MOVEMENT_INFO"
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!mainSocket) return;

    const onMovement = (data: MovementInfoFromServer) => {
      // 1) 스토어에 없으면 새 유저 등록
      const movingUser = users.find((u) => u.id === data.client_id);
      if (!movingUser) {
        addUser(
          data.client_id,
          data.user_name,
          data.position_x,
          data.position_y,
        );
      }

      // 2) 이동/방향 갱신 + isMoving=true
      updateUserPosition(
        data.client_id,
        data.position_x,
        data.position_y,
        data.direction,
        true,
      );

      // 3) 짧은 시간 뒤 isMoving=false 처리
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
  }, [mainSocket, users, addUser, updateUserPosition]);

  // ─────────────────────────────────────────────
  // (C) 내가 방에 처음 들어왔을 때 → "SC_ENTER_ROOM"
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!mainSocket) return;

    const onEnterRoom = (data: SCEnterRoomData) => {
      // data = { client_id, position_x, position_y, direction, user_name }
      const exists = users.find((u) => u.id === data.client_id);
      if (!exists) {
        addUser(
          data.client_id,
          data.user_name,
          data.position_x,
          data.position_y,
        );
      }
      updateUserPosition(
        data.client_id,
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
  }, [mainSocket, users, addUser, updateUserPosition]);

  // ─────────────────────────────────────────────
  // (D) 유저 퇴장 → "SC_LEAVE_USER"
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // (E) **새로 추가**: "SC_USER_POSITION_INFO"
  //     : 서버가 "현재 방에 있는 모든 사용자 정보"를 개별적으로 내려줌
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!mainSocket) return;

    const onUserPositionInfo = (userData: SCUserPositionInfo) => {
      // console.log("Received SC_USER_POSITION_INFO:", userData);

      const exists = users.find((x) => x.id === userData.client_id);
      if (!exists) {
        addUser(
          userData.client_id,
          userData.user_name,
          userData.position_x,
          userData.position_y,
        );
      }
      updateUserPosition(
        userData.client_id,
        userData.position_x,
        userData.position_y,
        userData.direction,
        false,
      );
    };

    mainSocket.on("SC_USER_POSITION_INFO", onUserPositionInfo);

    return () => {
      mainSocket.off("SC_USER_POSITION_INFO", onUserPositionInfo);
    };
  }, [mainSocket, users, addUser, updateUserPosition]);

  // ─────────────────────────────────────────────
  // export
  // ─────────────────────────────────────────────
  return { emitMovement };
}
