"use client";
import { useState } from "react";

import RankingModal from "./_component/RankingModal/RankingModal";
import styles from "./QuestMap.module.css";

export default function Complete() {
  // 모달 표시 여부를 관리하는 state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 모달 여는 함수
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // 모달 닫는 함수 (모달 오픈할 때 Prop으로 전달해주면 됨!)
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.container}>
      {/* 흰색 오버레이 */}
      <div className={styles.whiteOverlay} />

      {/* ~아래 주석 부분 삭제하고 진행하면 됨~ */}
      {/* <div className={styles.tmp}>
        <Image
          src="/character/npc4.webp"
          alt="tmpNPC"
          width={150}
          height={150}
          // Image 클릭 시 모달 오픈
          onClick={() => setIsModalOpen(true)}
          style={{ cursor: "pointer" }}
        />
        <p className={styles.npcName}>랭킹 확인</p>
      </div> */}

      {/* 모달 표시 여부에 따라 조건부로 렌더링 */}
      {isModalOpen && <RankingModal onClose={handleCloseModal} />}
    </div>
  );
}
