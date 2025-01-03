// components/QuestMapCanvas/hooks/useQuestMapKeyboard.ts
"use client";

import { useEffect, useState } from "react";

interface UseQuestMapKeyboardProps {
  /** 모달 열려 있으면 입력/스페이스 동작을 막을지 여부 */
  isAnyModalOpen: boolean;
}

/**
 * 이동키 pressedKeys + "스페이스가 눌린 순간" (spacePressed) 전달
 */
export function useQuestMapKeyboard({
  isAnyModalOpen,
}: UseQuestMapKeyboardProps) {
  const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
  const [spacePressed, setSpacePressed] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // 모달이 열려 있으면 → 막을지 말지 결정
      if (isAnyModalOpen) {
        // return;
      }

      if (e.key === " ") {
        e.preventDefault();
        // "이번 키다운 이벤트" 때만 true → useEffect에서 검사 후 false로 되돌려야 함
        setSpacePressed(true);
      } else {
        setPressedKeys((prev) => ({ ...prev, [e.key]: true }));
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (isAnyModalOpen) {
        // return;
      }

      if (e.key === " ") {
        setSpacePressed(false);
      } else {
        setPressedKeys((prev) => ({ ...prev, [e.key]: false }));
      }
    }

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isAnyModalOpen]);

  return {
    pressedKeys,
    setPressedKeys,
    spacePressed,
  };
}
