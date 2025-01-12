// /src/app/questmap/_components/RankingModal/RankingModal.tsx

"use client";

import { getRandomQuestNumber } from "@/app/quest/utils/getRandomQuestNumber";
import { useQuestMapModalGet } from "@/hooks/questmap/useQuetMapModalGet";

import styles from "./RankingModal.module.css";

interface RankingModalProps {
  onClose: () => void;
}

export default function RankingModal({ onClose }: RankingModalProps) {
  // 1. 훅 호출
  const { data, loading, error } = useQuestMapModalGet();
  const todaysProblem = getRandomQuestNumber();

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          X
        </button>
        <div className={styles.modalHeader}>
          <p className={styles.modalTitle}>오늘의 랭킹 🏆</p>
          {/* 여기서는 가령 랜덤으로 뽑힌 문제 번호를 표시하거나 원하는 텍스트로 바꿔도 됨 */}
          <div>
            <p className={styles.modalSub}> 오늘의 문제: BOJ {todaysProblem}</p>
          </div>
        </div>
        <div className={styles.rankingItemTitle}>
          <p>랭킹</p>
          <p>닉네임</p>
          <p>소요시간</p>
        </div>
        <div className={styles.modalContent}>
          {/* 헤더 */}

          {/* 2. 로딩 상태 표시 */}
          {loading && (
            <div
              className="
            flex-col 
            justify-center
            text-center"
            >
              <p>로딩 중...</p>
            </div>
          )}

          {/* 3. 에러 표시 */}
          {error && (
            <div>
              <p>에러가 발생했습니다: {error}</p>
            </div>
          )}

          {/* 4. 데이터가 있을 때 표시 */}
          {data &&
            data.map((result, idx) => {
              let extraClass = "";
              if (idx === 0) {
                extraClass = styles.rankingItemGold;
              } else if (idx === 1) {
                extraClass = styles.rankingItemSilver;
              } else if (idx === 2) {
                extraClass = styles.rankingItemBronze;
              }

              return (
                <div
                  key={result.id}
                  className={`${styles.rankingItem} ${extraClass}`}
                >
                  <p className="flex">
                    {idx === 0 && (
                      <img
                        src="/npc_event/firstmedal.png"
                        alt="금메달"
                        style={{ width: "1.5rem", marginRight: "0.5rem" }}
                      />
                    )}
                    {idx === 1 && (
                      <img
                        src="/npc_event/secondmedal.png"
                        alt="은메달"
                        style={{ width: "1.5rem", marginRight: "0.5rem" }}
                      />
                    )}
                    {idx === 2 && (
                      <img
                        src="/npc_event/thirdmedal.png"
                        alt="동메달"
                        style={{ width: "1.5rem", marginRight: "0.5rem" }}
                      />
                    )}
                    {idx + 1}
                  </p>
                  <p>{result.user_name}</p>
                  <p>{result.time_taken}</p>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
