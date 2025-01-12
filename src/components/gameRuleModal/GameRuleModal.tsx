"use client";
import { useRouter } from "next/navigation";

import useEscapeKey from "@/hooks/useEscapeKey";

import styles from "./GameRuleModal.module.css";

interface GameRuleModalProps {
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;

  /** 추가된 부분(이미 선언은 있으나) */
  isConfirm?: boolean;
  onConfirm?: () => void; // 게임시작을 누르면 동작
}

export default function GameRuleModal({
  title,
  onClose,
  children,
  isConfirm = false,
  onConfirm,
}: GameRuleModalProps) {
  const router = useRouter();
  function goLobby() {
    router.push("/lobby");
  }

  useEscapeKey(onClose, true);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* 닫기 버튼 (X) */}
        <button className={styles.closeBtn} onClick={onClose}>
          X
        </button>

        {/* 타이틀 */}
        <div className={styles.modalHeader}>
          <p className={styles.modalTitle}>{title}</p>
        </div>

        {/* 본문 */}
        <div className={styles.modalContent}>{children}</div>

        {/**
         * 기본 모달(확인 버튼만) + isConfirm 모달(게임시작/나가기 버튼)
         *  - 상황에 따라 UI를 다르게 노출
         */}
        {!isConfirm && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={onClose}
              className="min-h-16 w-24 rounded-lg border-2 border-[rgba(111,99,98,0.5)] text-[1.5rem]"
            >
              확인
            </button>
          </div>
        )}

        {isConfirm && (
          <div className={styles.buttonSection}>
            {/* [게임시작] 버튼 */}
            <button
              className={styles.yesButton}
              onClick={() => {
                if (onConfirm) onConfirm();
              }}
            >
              게임시작
            </button>
            {/* [나가기] 버튼 */}
            <button className={styles.noButton} onClick={goLobby}>
              나가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
