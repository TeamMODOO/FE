"use client";

import { useCallback, useEffect, useState } from "react";

import { Direction } from "@/model/LobbyUser";
import { getHostName } from "@/queries/myroom/getName";
import useClientIdStore from "@/store/useClientIdStore";
import useSocketStore from "@/store/useSocketStore";
import { LobbyUser } from "@/store/useUsersRef";

interface MovementInfoToServer {
  position_x: number;
  position_y: number;
  direction: number; // 0=Down,1=Up,2=Right,3=Left
  client_id: string;
  user_name: string;
}

export interface MovementInfoFromServer {
  client_id: string;
  position_x: number;
  position_y: number;
  direction: Direction;
  user_name: string;
}

interface SCEnterRoomData {
  client_id: string;
  position_x: number;
  position_y: number;
  direction: Direction;
  user_name: string;
}

interface SCLeaveUserData {
  client_id: string;
}

export interface SCUserPositionInfo {
  client_id: string;
  position_x: number;
  position_y: number;
  direction: Direction;
  user_name: string;
}

type LobbySocketEventsProps = {
  userId: string;
  userNickname: string;

  // [중요] 기존 사용자 정보를 가져오는 함수
  getUser: (id: string) => LobbyUser | undefined;

  onAddUser: (id: string, nickname: string, x?: number, y?: number) => void;
  onUpdateUserPosition: (
    userId: string,
    x: number,
    y: number,
    direction: Direction,
    isMoving: boolean,
    nickname: string,
  ) => void;
  onRemoveUser: (id: string) => void;
};

// 이 타이머는 "움직임 발생 후 약간의 시간" 후에 isMoving=false로 바꿔주는 역할
const moveStopTimers: Record<string, NodeJS.Timeout> = {};

export default function useLobbySocketEvents({
  userId,
  userNickname,
  getUser,
  onAddUser,
  onUpdateUserPosition,
  onRemoveUser,
}: LobbySocketEventsProps) {
  const { clientId } = useClientIdStore();
  const { socket, isConnected } = useSocketStore();
  const [userName, setUserName] = useState("");

  // (A) 내 이동 emit
  const emitMovement = useCallback(
    (x: number, y: number, direction: Direction) => {
      if (!socket || !isConnected) return;
      socket.emit("CS_MOVEMENT_INFO", {
        position_x: x,
        position_y: y,
        direction,
        client_id: clientId!,
        user_name: userName,
      } satisfies MovementInfoToServer);
    },
    [socket, isConnected],
  );

  // (B) 다른 사용자 이동 수신
  useEffect(() => {
    if (!socket || !isConnected) return;

    const onMovement = (data: MovementInfoFromServer) => {
      // [수정1] 우선 기존 유저 정보(이전 좌표/방향)를 가져온다
      const existing = getUser(data.client_id);

      // [수정2] 기존 유저가 없다면(=새 유저다) → onAddUser로 등록
      if (!existing) {
        onAddUser(
          data.client_id,
          data.user_name,
          data.position_x,
          data.position_y,
        );
        // 새 유저는 "처음 등장"이므로 굳이 움직임으로 볼 필요는 없다고 가정
        onUpdateUserPosition(
          data.client_id,
          data.position_x,
          data.position_y,
          data.direction,
          false,
          data.user_name,
        );
        return;
      }

      // [수정3] 기존 유저가 있다면, 이전 위치&방향과 비교하여 실제로 움직였는지 판단
      // 예) x 혹은 y 혹은 direction 중 하나라도 바뀌면 "움직임"으로 본다
      let isActuallyMoving = false;

      const sameX = existing.x === data.position_x;
      const sameY = existing.y === data.position_y;
      const sameDir = existing.direction === data.direction;

      if (!sameX || !sameY) {
        // x나 y 중 하나가 달라지면 -> 실제 이동
        isActuallyMoving = true;
      } else {
        // x,y가 동일하더라도, "방향만 바뀌었는데 제자리에서 돌고 있다" 라면
        // 그걸 "이동"으로 볼지 여부는 상황에 따라 다릅니다.
        // 여기서는 "회전"도 움직임으로 처리하고 싶다면:
        if (!sameDir) {
          isActuallyMoving = true;
        }
      }

      // [수정4] 이동 업데이트
      onUpdateUserPosition(
        data.client_id,
        data.position_x,
        data.position_y,
        data.direction,
        isActuallyMoving,
        data.user_name,
      );

      // [수정5] 실제로 움직임이 있었다면, 잠시 뒤 isMoving=false로 만드는 타이머
      if (isActuallyMoving) {
        if (moveStopTimers[data.client_id]) {
          clearTimeout(moveStopTimers[data.client_id]);
        }
        moveStopTimers[data.client_id] = setTimeout(() => {
          // 혹시 그 사이에 새 좌표가 또 들어오면, 그때 다시 움직임이 true로 될테니 괜찮음
          onUpdateUserPosition(
            data.client_id,
            data.position_x,
            data.position_y,
            data.direction,
            false,
            data.user_name,
          );
        }, 200);
      }
    };

    socket.on("SC_MOVEMENT_INFO", onMovement);
    return () => {
      socket.off("SC_MOVEMENT_INFO", onMovement);
    };
  }, [
    socket,
    isConnected,
    onAddUser,
    onUpdateUserPosition,
    onRemoveUser,
    getUser,
  ]);

  // (C) SC_ENTER_ROOM
  useEffect(() => {
    if (!socket || !isConnected) return;

    const onEnterRoom = (data: SCEnterRoomData) => {
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
        data.user_name,
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

    socket.on("SC_LEAVE_ROOM", onLeaveUser);
    return () => {
      socket.off("SC_LEAVE_ROOM", onLeaveUser);
    };
  }, [socket, isConnected, onRemoveUser]);

  // (E) SC_USER_POSITION_INFO
  useEffect(() => {
    if (!socket || !isConnected) return;

    const onUserPositionInfo = (data: SCUserPositionInfo) => {
      // "현재 접속 중인 모든 유저" 정보를 한 번에 내려줄 때
      // 어차피 "처음"으로 받는 정보이므로 → isMoving=false
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
        data.user_name,
      );
    };
    socket.on("SC_USER_POSITION_INFO", onUserPositionInfo);

    return () => {
      socket.off("SC_USER_POSITION_INFO", onUserPositionInfo);
    };
  }, [socket, isConnected, onAddUser, onUpdateUserPosition]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const onMovementInfo = () => {
      const userInfo = getUser(userId);

      socket.emit("CS_MOVEMENT_INFO", {
        client_id: userInfo?.id,
        position_x: userInfo?.x,
        position_y: userInfo?.y,
        direction: userInfo?.direction,
        user_name: userInfo?.nickname,
      });
    };

    socket.on("SC_GET_POSITION", onMovementInfo);
    return () => {
      socket.off("SC_GET_POSITION", onMovementInfo);
    };
  }, [getUser, isConnected, socket, userId]);

  useEffect(() => {
    async function fetchData() {
      const name = await getHostName(clientId ?? "");
      setUserName(name);
    }

    fetchData();
  }, [clientId]);

  return { emitMovement };
}
