"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import QuestSection from "./_component/QuestSection/page";
import styles from "./Quest.module.css";

export default function Quest() {
  // 드래곤 이미지 로드 완료 여부
  const [dragonImgLoaded, setDragonImgLoaded] = useState(false);

  // 드래곤 애니메이션을 실제로 보여줄지 여부
  const [showFlyingDragon, setShowFlyingDragon] = useState(false);

  // blackcover 영역 노출 여부
  const [showBlackcover, setShowBlackcover] = useState(false);

  // 이미지 로딩 완료되면 → 드래곤 애니메이션 시작 (opacity: 0 → 1, 왼쪽 → 오른쪽)
  useEffect(() => {
    if (dragonImgLoaded) {
      setShowFlyingDragon(true);

      // 1.5초 후(드래곤 애니메이션이 끝난 뒤) blackcover 보여주기
      const blackcoverTimer = setTimeout(() => {
        setShowBlackcover(true);
      }, 1500); // 애니메이션 시간과 맞추기

      return () => clearTimeout(blackcoverTimer);
    }
  }, [dragonImgLoaded]);

  return (
    <div className={styles.container}>
      {/** (1) 떠다니는 사각형 */}
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className={styles.floatingSquare}></div>
      ))}

      {/** (2) 용 이미지는 항상 렌더링하되, 처음엔 opacity: 0 → 애니메이션 시점에만 보이도록 */}
      <div
        className={styles.dragonFlyWrapper}
        // 용 애니메이션을 완전히 끄고 싶다면, showFlyingDragon이 끝난 뒤 display: none 처리 가능
        style={{
          display: showFlyingDragon || !dragonImgLoaded ? "block" : "none",
        }}
      >
        <Image
          src="/portrait/dragon_flying.webp"
          alt="flying_dragon"
          width={1600}
          height={1600}
          // 이미지 로딩 끝나면 상태 업데이트
          onLoadingComplete={() => setDragonImgLoaded(true)}
          // 로딩 우선순위 (선택)
          priority
          // 로딩 전엔 opacity: 0, 로딩 완료 & showFlyingDragon === true가 되면 .dragonFly로 애니메이션 실행
          className={showFlyingDragon ? styles.dragonFly : styles.dragonHidden}
        />
      </div>

      {/** (3) blackcover 영역 */}
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
          <QuestSection />
        </div>
      )}
    </div>
  );
}
