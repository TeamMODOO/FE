// hooks/lobby/useLobbyKeyboard.ts
"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

import { NpcInfo } from "@/model/Npc";
import { PortalInfo } from "@/model/Portal";
import { User } from "@/model/User";

/** 파라미터 타입 정의 */
interface UseLobbyKeyboardParams {
  roomId: string;
  localClientId: string; // 로컬스토리지에서 가져온 uuid
  chatOpen: boolean; // 채팅창 열림 여부
  isAnyModalOpen: boolean; // 모달 열림 여부
  npcs: NpcInfo[];
  portals: PortalInfo[];
  onMeetingModalOpen: () => void;
  onNoticeModalOpen: () => void;

  // [추가] ref와 함수들을 외부에서 넘겨받기
  usersRef: React.MutableRefObject<User[]>;
}

export function useLobbyKeyboard({
  roomId,
  localClientId,
  chatOpen,
  isAnyModalOpen,
  npcs,
  portals,
  onMeetingModalOpen,
  onNoticeModalOpen,
  // [추가]
  usersRef,
}: UseLobbyKeyboardParams) {
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const { data: session, status } = useSession();

  /**
   * 스페이스바 상호작용
   */
  function handleSpacebarInteraction() {
    // [기존] useUsersStore.getState().users -> [변경] usersRef.current
    const me = usersRef.current.find((u) => u.id === localClientId);
    if (!me) return;

    const [cl, cr, ct, cb] = [me.x, me.x + 32, me.y, me.y + 32];

    // 1) 포탈 충돌
    for (const portal of portals) {
      const [pl, pr, pt, pb] = [
        portal.x,
        portal.x + portal.width,
        portal.y,
        portal.y + portal.height,
      ];
      const overlap = cl < pr && cr > pl && ct < pb && cb > pt;
      if (overlap) {
        if (portal.name === "회의실") {
          onMeetingModalOpen();
          return;
        }
        if (portal.name === "마이룸") {
          if (status === "loading") {
            alert("세션 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
            return;
          }
          if (status === "unauthenticated" || !session?.user?.id) {
            alert("로그인이 필요합니다.");
            return;
          }
          router.push(`/myroom/${session.user.id}`);
          return;
        }
      }
    }

    // 2) NPC 충돌
    for (let i = 0; i < npcs.length; i++) {
      const npc = npcs[i];
      const [nl, nr, nt, nb] = [
        npc.x,
        npc.x + npc.width,
        npc.y,
        npc.y + npc.height,
      ];
      const overlap = cl < nr && cr > nl && ct < nb && cb > nt;
      if (overlap) {
        // 모달 열기
        if (npc.name === "NPC1") {
          // NPC1 관련 동작
        }
        if (npc.name === "NPC2") {
          // NPC2 관련 동작
        }
        if (npc.name === "공지사항") {
          onNoticeModalOpen();
        }
        return;
      }
    }
  }

  /**
   * 키보드 이벤트 등록
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (chatOpen || isAnyModalOpen) return;

      // 이동키/Space
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      ) {
        e.preventDefault();
      }
      if (e.key === " ") {
        handleSpacebarInteraction();
      }
      setPressedKeys((prev) => ({ ...prev, [e.key]: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (chatOpen || isAnyModalOpen) return;
      setPressedKeys((prev) => ({ ...prev, [e.key]: false }));
    };

    const handleBlur = () => {
      setPressedKeys({});
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [chatOpen, isAnyModalOpen, status, session, router]);

  return {
    pressedKeys,
    setPressedKeys,
  };
}
