// /src/app/questmap/_components/RankingModal/RankingModal.tsx

"use client";

import styles from "./NeedSignInModal.module.css";

interface NeedSignInModalProps {
  onClose: () => void;
}

function onClose() {
  // 여기에 모달 종료 함수 작성
}

export default function NeedSignInModal() {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          X
        </button>
        <div className={styles.modalHeader}>
          <p className={styles.modalTitle}>로그인이 필요한 서비스 입니다!</p>
        </div>

        <div className={styles.modalContent}>
          <p>해당 서비스는 Google 로그인이 필요한 서비스입니다.</p>
          <p>로그인 하시겠습니까?</p>
        </div>
      </div>
    </div>
  );
}
