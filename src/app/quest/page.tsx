"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import AlertModal from "@/components/alertModal/AlertModal";
import { BgMusicButton } from "@/components/bgMusic/BgMusicButton";
import { BgMusicGlobal } from "@/components/bgMusic/BgMusicGlobal";

import QuestSection from "./_components/QuestSection/page";

import styles from "./Quest.module.css";

export default function Quest() {
  const router = useRouter();

  const dragonAudioRef = useRef<HTMLAudioElement>(null);

  const [showBlackcover, setShowBlackcover] = useState(false);
  const [dragonImgLoaded, setDragonImgLoaded] = useState(false);
  const [showFlyingDragon, setShowFlyingDragon] = useState(true);

  /** 이미 오늘 일일 퀘스트 완료한 경우 => 모달 노출 */
  const [showDoneModal, setShowDoneModal] = useState(false);

  /** 1) 컴포넌트 마운트 시 localStorage에서 dailyQuestDone 확인 */
  useEffect(() => {
    const doneDate = localStorage.getItem("dailyQuestDone");
    if (doneDate) {
      // 오늘 날짜 ex) "2025-01-13"
      const todayString = new Date().toISOString().slice(0, 10);
      // 날짜가 동일하다면 => 이미 일일 퀘스트 완료
      if (doneDate === todayString) {
        setShowDoneModal(true);
        // 2초 뒤 /lobby로 이동
        setTimeout(() => {
          router.push("/lobby");
        }, 2000);
      }
    }
  }, [router]);

  /** 2) 드래곤 애니메이션 사운드 */
  function playDragonEventSound() {
    if (!dragonAudioRef.current) return;
    dragonAudioRef.current.currentTime = 0;
    dragonAudioRef.current.play().catch(() => {});
  }

  /** 3) 드래곤 날아간 뒤 블랙 커버 표시 */
  useEffect(() => {
    // 드래곤이 로드된 뒤(애니메이션 시작), 1.4초 후에 blackcover 표시
    const blackcoverTimer = setTimeout(() => {
      setShowBlackcover(true);
    }, 1400);

    return () => {
      clearTimeout(blackcoverTimer);
    };
  }, [dragonImgLoaded]);

  /** 4) 날아가는 드래곤 숨김 처리 (2초 뒤) */
  useEffect(() => {
    if (dragonImgLoaded) {
      const flyingDragonTimer = setTimeout(() => {
        setShowFlyingDragon(false);
      }, 2000);

      return () => clearTimeout(flyingDragonTimer);
    }
  }, [dragonImgLoaded]);

  return (
    <div className={styles.container}>
      {/* 이미 완료한 경우 모달 표시 */}
      {showDoneModal && (
        <AlertModal
          title="알림"
          noCloseBtn
          onClose={() => {
            /* 아무 동작 안 함 */
          }}
        >
          <p>오늘의 일일 퀘스트를 이미 완료하셨습니다.</p>
          <p>2초 뒤 로비로 이동합니다...</p>
        </AlertModal>
      )}

      <BgMusicGlobal src="/sounds/questBGM.wav" />
      <BgMusicButton position="left" />

      <audio
        ref={dragonAudioRef}
        src="/sounds/dragonGrowl.wav"
        style={{ display: "none" }}
      />

      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className={styles.floatingSquare}></div>
      ))}

      {/* 드래곤 애니메이션 */}
      <div
        className={styles.dragonFlyWrapper}
        style={{ display: showFlyingDragon ? "block" : "none" }}
      >
        <Image
          src="/portrait/dragon_flying.webp"
          alt="flying_dragon"
          width={1600}
          height={1600}
          priority
          onLoadingComplete={() => {
            setDragonImgLoaded(true);
            playDragonEventSound();
          }}
          className={showFlyingDragon ? styles.dragonFly : styles.dragonHidden}
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
          {/* 일일 퀘스트 섹션 */}
          <QuestSection />
        </div>
      )}
    </div>
  );
}
