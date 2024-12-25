// hooks/useLobbySocketEvents.ts
"use client";

import { useCallback, useEffect } from "react";

import useMainSocketStore from "@/store/useMainSocketStore";
import useUsersStore from "@/store/useUsersStore";

type LobbySocketEventsProps = {
  roomId: string; // 현재 방 or 로비 ID
  userId: string; // 내 유저 ID
};

interface MovementInfo {
  user_id: string;
  room_id: string;
  position_x: number;
  position_y: number;
}

interface SCEnterRoomData {
  user_name: string;
  position: {
    x: number;
    y: number;
  };
  img_url?: string;
}

/**
 * [메인 로비 전용] 소켓 이벤트 훅
 * - 이동 이벤트 emit
 * - SC_MOVEMENT_INFO / SC_ENTER_ROOM 등 수신
 */
export default function useLobbySocketEvents({
  roomId,
  userId,
}: LobbySocketEventsProps) {
  const mainSocket = useMainSocketStore((state) => state.socket);

  // Zustand Store 메서드
  const updateUserPosition = useUsersStore((s) => s.updateUserPosition);
  const addUser = useUsersStore((s) => s.addUser);

  // -----------------------------
  // (1) 내 캐릭터 이동 emit
  // -----------------------------
  const emitMovement = useCallback(
    (x: number, y: number) => {
      if (!mainSocket) return;
      // 프로토콜: CS_MOVEMENT_INFO
      const data = {
        user_id: userId,
        room_id: roomId,
        position_x: x,
        position_y: y,
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
      // data = { user_id, room_id, position_x, position_y }
      //   console.log("[LobbySocketEvents] SC_MOVEMENT_INFO:", data);
      updateUserPosition(data.user_id, data.position_x, data.position_y);
    };

    mainSocket.on("SC_MOVEMENT_INFO", onMovement);

    return () => {
      mainSocket.off("SC_MOVEMENT_INFO", onMovement);
    };
  }, [mainSocket, updateUserPosition]);

  // -----------------------------
  // (3) 새 유저 입장 수신 (SC_ENTER_ROOM)
  // -----------------------------
  useEffect(() => {
    if (!mainSocket) return;

    const onEnterRoom = (data: SCEnterRoomData) => {
      // data = { user_name, position: {x, y}, img_url, ...}
      // console.log("[LobbySocketEvents] SC_ENTER_ROOM:", data);

      // 임의로 id = user_name 사용
      addUser(
        data.user_name,
        data.user_name,
        data.position.x,
        data.position.y,
        data.img_url,
      );
    };
    mainSocket.on("SC_ENTER_ROOM", onEnterRoom);

    return () => {
      mainSocket.off("SC_ENTER_ROOM", onEnterRoom);
    };
  }, [mainSocket, addUser]);

  // 필요하다면 SC_MEET_ROOM_USER_LIST 등의 이벤트도 비슷하게 구독

  // -----------------------------
  // 이 훅에서 emitMovement를 return 해주면,
  // 컴포넌트에서 간단히 사용 가능
  // -----------------------------
  return { emitMovement };
}
