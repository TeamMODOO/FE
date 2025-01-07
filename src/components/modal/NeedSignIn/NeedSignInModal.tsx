// /src/app/questmap/_components/RankingModal/RankingModal.tsx
"use client";

import { useRouter } from "next/navigation"; // ✅ next/navigation 사용

import { Button } from "@/components/ui/button";

import styles from "./NeedSignInModal.module.css";

interface NeedSignInModalProps {
  onClose: () => void;
}

export default function NeedSignInModal({ onClose }: NeedSignInModalProps) {
  const router = useRouter();

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
          <div>
            <p>해당 서비스는 Google 로그인이 필요한 서비스입니다.</p>
            <p>로그인 페이지로 이동 하시겠습니까?</p>
          </div>
          <div className={styles.buttonSection}>
            <Button
              onClick={() => {
                router.push("/signin");
              }}
              className="bg-[#0070f3] hover:bg-[#0070f3]"
            >
              예
            </Button>
            <Button onClick={onClose} variant="destructive">
              아니오
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
