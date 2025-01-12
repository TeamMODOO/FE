"use client";

import { useCallback, useEffect } from "react";

import { Direction } from "@/model/LobbyUser";
import useSocketStore from "@/store/useSocketStore";

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
export interface MovementInfoFromServer {
  client_id: string;
  position_x: number;
  position_y: number;
  direction: Direction;
  user_name: string;
}

/**
 * 새 유저가 "처음 방에 들어왔을 때" (SC_ENTER_ROOM)
 */
interface SCEnterRoomData {
  client_id: string;
  position_x: number;
  position_y: number;
  direction: Direction;
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
export interface SCUserPositionInfo {
  client_id: string;
  position_x: number;
  position_y: number;
  direction: Direction;
  user_name: string;
}

type LobbySocketEventsProps = {
  userId: string; // 내 클라이언트 ID
  userNickname: string; // 내 닉네임

  // ★ ref 업데이트용 콜백
  onAddUser: (id: string, nickname: string, x?: number, y?: number) => void;
  onUpdateUserPosition: (
    userId: string,
    x: number,
    y: number,
    direction: Direction,
    isMoving: boolean,
  ) => void;
  onRemoveUser: (id: string) => void;
};

const moveStopTimers: Record<string, NodeJS.Timeout> = {};

export default function useLobbySocketEvents({
  userId,
  userNickname,
  onAddUser,
  onUpdateUserPosition,
  onRemoveUser,
}: LobbySocketEventsProps) {
  const { socket, isConnected } = useSocketStore();

  // (A) 내 이동 emit
  const emitMovement = useCallback(
    (x: number, y: number, direction: Direction) => {
      if (!socket || !isConnected) return;
      socket.emit("CS_MOVEMENT_INFO", {
        position_x: x,
        position_y: y,
        direction,
      });
    },
    [socket, isConnected],
  );

  // (B) 다른 사용자 이동 수신
  useEffect(() => {
    if (!socket || !isConnected) return;

    const onMovement = (data: MovementInfoFromServer) => {
      // data: MovementInfoFromServer
      // 1) 유저 추가 (이미 있으면 내부에서 위치만 갱신)
      onAddUser(
        data.client_id,
        data.user_name,
        data.position_x,
        data.position_y,
      );

      // 2) 이동 업데이트
      onUpdateUserPosition(
        data.client_id,
        data.position_x,
        data.position_y,
        data.direction,
        true,
      );

      // 3) 잠시 뒤 isMoving=false
      if (moveStopTimers[data.client_id]) {
        clearTimeout(moveStopTimers[data.client_id]);
      }
      moveStopTimers[data.client_id] = setTimeout(() => {
        onUpdateUserPosition(
          data.client_id,
          data.position_x,
          data.position_y,
          data.direction,
          false,
        );
      }, 200);
    };

    socket.on("SC_MOVEMENT_INFO", onMovement);
    return () => {
      socket.off("SC_MOVEMENT_INFO", onMovement);
    };
  }, [socket, isConnected, onAddUser, onUpdateUserPosition]);

  // (C) SC_ENTER_ROOM
  useEffect(() => {
    if (!socket || !isConnected) return;

    const onEnterRoom = (data: SCEnterRoomData) => {
      // console.log("SC_ENTER_ROOM", data);
      onAddUser(
        data.client_id,
        data.user_name,
        data.position_x,
        data.position_y,
      );
      onUpdateUserPosition(
        data.client_id,
        data.position_x,
        data.position_y,
        data.direction,
        false,
      );
    };

    socket.on("SC_ENTER_ROOM", onEnterRoom);
    return () => {
      socket.off("SC_ENTER_ROOM", onEnterRoom);
    };
  }, [socket, isConnected, onAddUser, onUpdateUserPosition]);

  // (D) SC_LEAVE_USER
  useEffect(() => {
    if (!socket || !isConnected) return;

    const onLeaveUser = (data: SCLeaveUserData) => {
      onRemoveUser(data.client_id);
    };

    socket.on("SC_LEAVE_USER", onLeaveUser);
    return () => {
      socket.off("SC_LEAVE_USER", onLeaveUser);
    };
  }, [socket, isConnected, onRemoveUser]);

  // (E) SC_USER_POSITION_INFO
  useEffect(() => {
    if (!socket || !isConnected) return;

    const onUserPositionInfo = (data: SCUserPositionInfo) => {
      // console.log("SC_USER_POSITION_INFO", data);
      onAddUser(
        data.client_id,
        data.user_name,
        data.position_x,
        data.position_y,
      );
      onUpdateUserPosition(
        data.client_id,
        data.position_x,
        data.position_y,
        data.direction,
        false,
      );
    };

    socket.on("SC_USER_POSITION_INFO", onUserPositionInfo);
    return () => {
      socket.off("SC_USER_POSITION_INFO", onUserPositionInfo);
    };
  }, [socket, isConnected, onAddUser, onUpdateUserPosition]);

  return { emitMovement };
}
