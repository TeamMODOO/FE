// /src/components/alertModal/AlertModal.tsx
"use client";

import { useEffect } from "react";

import useEscapeKey from "@/hooks/useEscapeKey";

import styles from "./AlertModal.module.css";

interface AlertModalProps {
  /** 모달 제목 */
  title?: string;
  /** 모달 닫기 함수 (X 버튼 또는 '아니오' 선택 시) */
  onClose: () => void;
  /** 자식 노드 (본문 메시지 등) */
  children?: React.ReactNode;

  /** 확인 모달인지(= 두 개의 버튼이 필요한지) 여부 */
  isConfirm?: boolean;
  /** '예' 버튼 클릭 시 동작 */
  onConfirm?: () => void;
  noCloseBtn?: boolean;
}

export default function AlertModal({
  title,
  onClose,
  children,
  isConfirm = false,
  onConfirm,
  noCloseBtn = false,
}: AlertModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (noCloseBtn) return;
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEscapeKey(onClose, noCloseBtn ? false : true);
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* 닫기 버튼 (X) */}
        {!noCloseBtn && (
          <button className={styles.closeBtn} onClick={onClose}>
            X
          </button>
        )}

        {/* 타이틀 */}
        <div className={styles.modalHeader}>
          <p className={styles.modalTitle}>{title}</p>
        </div>

        {/* 본문 */}
        <div className={styles.modalContent}>{children}</div>

        {/* isConfirm === true이면 "예/아니오" 버튼 노출 */}
        {isConfirm && (
          <div className={styles.buttonSection}>
            <button
              className={styles.yesButton}
              onClick={() => {
                if (onConfirm) onConfirm();
              }}
            >
              예
            </button>
            <button className={styles.noButton} onClick={onClose}>
              아니오
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
