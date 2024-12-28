"use client"; // ← App Router에서 useEffect 사용을 위해 필요

import Image from "next/image";
import { useEffect, useState } from "react";

import QuestSection from "./_component/QuestSection/page";
import styles from "./Quest.module.css";

export default function Quest() {
  // 드래곤 애니메이션 노출 여부
  const [showFlyingDragon, setShowFlyingDragon] = useState(true);
  // blackcover 영역 노출 여부
  const [showBlackcover, setShowBlackcover] = useState(false);

  useEffect(() => {
    // 2초 후에 드래곤 애니메이션 숨김
    const flyingDragonTimer = setTimeout(() => {
      setShowFlyingDragon(false);
    }, 2000);

    // 1.4초 후에 blackcover 영역 표시
    const blackcoverTimer = setTimeout(() => {
      setShowBlackcover(true);
    }, 1400);

    return () => {
      clearTimeout(flyingDragonTimer);
      clearTimeout(blackcoverTimer);
    };
  }, []);

  return (
    <div className={styles.container}>
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className={styles.floatingSquare}></div>
      ))}

      {showFlyingDragon && (
        <div className={styles.dragonFlyWrapper}>
          <Image
            src="/portrait/dragon_flying.webp"
            alt="flying_dragon"
            width={1600}
            height={1600}
            className={styles.dragonFly}
          />
        </div>
      )}

      {showBlackcover && (
        <div className={styles.blackcover}>
          <div className={styles.leftsection}>
            <Image
              src="/portrait/dragon_seated.webp"
              alt="seated_dragon"
              width={700}
              height={700}
            />
          </div>
          {/* QuestSection 렌더 */}
          <QuestSection />
        </div>
      )}
    </div>
  );
}
