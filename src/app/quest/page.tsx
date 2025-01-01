"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import QuestSection from "./_component/QuestSection/page";
import styles from "./Quest.module.css";

export default function Quest() {
  // blackcover 영역 노출 여부
  const [showBlackcover, setShowBlackcover] = useState(false);
  // 드래곤 이미지 로드 완료 여부
  const [dragonImgLoaded, setDragonImgLoaded] = useState(false);
  // 드래곤을 계속 보여줄 것인지 여부(애니메이션이 끝나면 끄기)
  const [showFlyingDragon, setShowFlyingDragon] = useState(true);

  useEffect(() => {
    // 1.4초 후에 blackcover 영역 표시
    const blackcoverTimer = setTimeout(() => {
      setShowBlackcover(true);
    }, 1400);

    return () => {
      clearTimeout(blackcoverTimer);
    };
  }, [dragonImgLoaded]);

  useEffect(() => {
    // 이미 로딩이 끝났다면 → 2초 후에 숨김
    if (dragonImgLoaded) {
      const flyingDragonTimer = setTimeout(() => {
        setShowFlyingDragon(false);
      }, 2000);

      return () => clearTimeout(flyingDragonTimer);
    }
  }, [dragonImgLoaded]);

  return (
    <div className={styles.container}>
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className={styles.floatingSquare}></div>
      ))}

      {/**
       * 이미지를 항상 렌더링하되,
       * 애니메이션은 dragonImgLoaded가 true일 때만 발동.
       * showFlyingDragon이 false가 되면 안 보이도록 처리.
       */}
      <div
        className={styles.dragonFlyWrapper}
        style={{ display: showFlyingDragon ? "block" : "none" }}
      >
        <Image
          src="/portrait/dragon_flying.webp"
          alt="flying_dragon"
          width={1600}
          height={1600}
          // 이미지 로딩이 끝나면 dragonImgLoaded = true
          onLoadingComplete={() => {
            setDragonImgLoaded(true);
          }}
          // 우선 로딩
          priority
          className={
            dragonImgLoaded
              ? styles.dragonFly // 로딩 완료 후에는 날아가는 애니메이션 적용
              : ""
          }
        />
      </div>

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
