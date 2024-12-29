// /src/components/Modal.tsx
"use client";

import styles from "./RankingModal.module.css";

interface RankingModalProps {
  onClose: () => void;
}

export default function RankingModal({ onClose }: RankingModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          X
        </button>
        <div className={styles.modalHeader}>
          <p className={styles.modalTitle}>오늘의 랭킹 🏆</p>
          <p> 오늘의 문제: BOJ 1920</p>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.rankingItem}>
            <p>랭킹</p>
            <p>닉네임</p>
            <p>소요시간</p>
          </div>
          <div className={styles.rankingItem}>
            <p>1</p>

            <p>트럼프트월킹</p>
            <p>15:03:54</p>
          </div>
          <div className={styles.rankingItem}>
            <p>2</p>

            <p>민주주의계엄킹</p>
            <p>16:03:54</p>
          </div>
          <div className={styles.rankingItem}>
            <p>3</p>
            <p>사과해요나한테</p>
            <p>17:03:54</p>
          </div>
          <div className={styles.rankingItem}>
            <p>4</p>
            <p>헤어지자고?너누군뎅</p>
            <p>18:03:54</p>
          </div>
        </div>
      </div>
    </div>
  );
}
