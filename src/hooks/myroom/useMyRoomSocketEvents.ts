// hooks/lobby/useMyRoomSocketEvents.ts
"use client";

import { useCallback, useEffect } from "react";

import { User } from "@/model/User";
import useSocketStore from "@/store/useSocketStore";

type MyRoomSocketEventsProps = {
  roomId: string;
  userId: string;

  // [추가] ref와 관련 메서드들을 주입
  usersRef: React.MutableRefObject<User[]>;

  // addUser, updateUserPosition
  onAddUser: (id: string, nickname: string, x?: number, y?: number) => void;
  onUpdateUserPosition: (
    userId: string,
    x: number,
    y: number,
    direction: number,
    isMoving: boolean,
  ) => void;
};

// 서버에서 오는 MovementInfo 예시
interface MovementInfo {
  user_id: string;
  room_id: string;
  position_x: number;
  position_y: number;
  direction: number;
}

// 서버에서 오는 EnterMyRoomData 예시
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

  // [추가]
  usersRef,
  onAddUser,
  onUpdateUserPosition,
}: MyRoomSocketEventsProps) {
  const { socket, isConnected } = useSocketStore();

  // (1) 내 캐릭터 이동 emit
  const emitMovement = useCallback(
    (x: number, y: number, direction: number) => {
      if (!socket || !isConnected) return;
      const data = {
        user_id: userId,
        room_id: roomId,
        position_x: x,
        position_y: y,
        direction,
      };
      socket.emit("CS_MYROOM_MOVEMENT_INFO", data);
    },
    [socket, isConnected, userId, roomId],
  );

  // (2) 다른 사용자 이동 수신
  useEffect(() => {
    if (!socket || !isConnected) return;

    const onMovement = (data: MovementInfo) => {
      // data = { user_id, room_id, position_x, position_y, direction }
      // 1) 유저가 usersRef.current에 없으면 새로 add
      const movingUser = usersRef.current.find((u) => u.id === data.user_id);
      if (!movingUser) {
        // 닉네임이 없다면 서버에서 별도 값이 올 수도 있으니, 샘플로 "Guest"라고 처리
        onAddUser(data.user_id, "Guest", data.position_x, data.position_y);
      }

      // 2) 위치/방향 업데이트
      onUpdateUserPosition(
        data.user_id,
        data.position_x,
        data.position_y,
        data.direction,
        true,
      );

      // 3) 잠시 뒤 isMoving = false 처리
      setTimeout(() => {
        // 여전히 존재한다면, isMoving = false
        const stillExists = usersRef.current.find((u) => u.id === data.user_id);
        if (stillExists) {
          onUpdateUserPosition(
            data.user_id,
            data.position_x,
            data.position_y,
            data.direction,
            false,
          );
        }
      }, 200);
    };

    socket.on("SC_MYROOM_MOVEMENT_INFO", onMovement);

    return () => {
      socket.off("SC_MYROOM_MOVEMENT_INFO", onMovement);
    };
  }, [socket, isConnected, usersRef, onAddUser, onUpdateUserPosition]);

  // (3) 새 유저 입장 (예: SC_ENTER_MYROOM)
  useEffect(() => {
    if (!socket || !isConnected) return;

    const onEnterMyRoom = (newUserData: EnterMyRoomData) => {
      onAddUser(
        newUserData.user_id,
        newUserData.nickname,
        newUserData.x,
        newUserData.y,
      );
    };

    socket.on("SC_ENTER_MYROOM", onEnterMyRoom);

    return () => {
      socket.off("SC_ENTER_MYROOM", onEnterMyRoom);
    };
  }, [socket, isConnected, onAddUser]);

  return { emitMovement };
}
