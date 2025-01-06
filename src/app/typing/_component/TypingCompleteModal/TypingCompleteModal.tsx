"use client";

import styles from "./TypingCompleteModal.module.css"; // 원하는 CSS 모듈 경로

interface TypingCompleteModalProps {
  currentTime: number;
  accuracy: number;
  wpm: number;
  onClose: () => void; // 모달을 닫는 함수
  onNext: () => void; // 다음 버튼을 눌렀을 때 실행할 함수
}

export default function TypingCompleteModal({
  currentTime,
  accuracy,
  wpm,
  onClose,
  onNext,
}: TypingCompleteModalProps) {
  return (
    <div className={styles.modal}>
      <div className={styles.modalcontent}>
        <span className={styles.close} onClick={onClose}>
          &times;
        </span>
        <p>소요 시간: {currentTime} 초</p>
        <p>정확도: {accuracy}%</p>
        <p>속도: {wpm} WPM</p>
        <button onClick={onNext}>다음</button>
      </div>
    </div>
  );
}
