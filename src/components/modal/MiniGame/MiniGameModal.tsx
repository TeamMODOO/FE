"use client";

import { useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import styles from "./MiniGameModal.module.css";

// MiniGameModal 컴포넌트 Props
interface MiniGameModalProps {
  onClose: () => void; // 모달 닫기 콜백
}

export default function MiniGameModal({ onClose }: MiniGameModalProps) {
  const router = useRouter();

  // 미니게임 이미지와 연결된 라우트 정보를 배열로 관리
  const games = [
    { src: "/minigames/minigame1.png", route: "/typing" },
    { src: "/minigames/minigame2.png", route: "/pingpong" },
    { src: "/minigames/minigame3.png", route: "/tetris" },
  ];

  // 현재 선택된 미니게임 인덱스
  const [currentIndex, setCurrentIndex] = useState(0);

  // 왼쪽 버튼 클릭 시: 이전 이미지로 이동
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? games.length - 1 : prev - 1));
  };

  // 오른쪽 버튼 클릭 시: 다음 이미지로 이동
  const handleNext = () => {
    setCurrentIndex((prev) => (prev === games.length - 1 ? 0 : prev + 1));
  };

  // [게임시작] 버튼 클릭 시: 해당 라우트로 이동
  const handleStartGame = () => {
    const gameRoute = games[currentIndex].route;
    router.push(gameRoute);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* 닫기 버튼 (X) */}
        <button className={styles.closeBtn} onClick={onClose}>
          X
        </button>

        {/* 타이틀 영역 */}
        <div className={styles.modalHeader}>
          <p className={styles.modalTitle}>미니게임</p>
        </div>

        {/* 본문 영역 */}
        <div className={styles.modalContent}>
          {/* 왼쪽 버튼 */}
          <button onClick={handlePrev} className={styles.arrowBtn}>
            &lt;
          </button>

          {/* 가운데 이미지 */}
          <div className={styles.imgSection} onClick={handleStartGame}>
            <Image
              src={games[currentIndex].src}
              alt="minigame preview"
              className={styles.gameImage}
              width={500}
              height={500}
            />
          </div>

          {/* 오른쪽 버튼 */}
          <button onClick={handleNext} className={styles.arrowBtn}>
            &gt;
          </button>
        </div>

        {/* 하단 [게임시작] 버튼 */}
        <div className={styles.modalFooter}>
          <button className={styles.startBtn} onClick={handleStartGame}>
            게임 시작
          </button>
        </div>
      </div>
    </div>
  );
}
