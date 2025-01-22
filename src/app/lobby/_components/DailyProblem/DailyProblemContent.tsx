"use client";

import React, { useEffect, useState } from "react";
import { useTypewriter } from "react-simple-typewriter";

import { useRouter } from "next/navigation";

import AlertModal from "@/components/alertModal/AlertModal";

// import { Typewriter } from "@/components/Typewriter";
import styles from "@/components/modalAnimation/ModalAnimation.module.css";

const DailyProblemContent: React.FC = () => {
  const router = useRouter();
  const [content] = useTypewriter({
    words: [
      `"오, 거기 지나가는 용사여!
정글 타워 옥상에 용이 나타나 정글러들을 위협하고 있다네.
자네의 도움이 절실하니, 당장 용을 처단하고 이 땅의 평화를 되찾아주겠나?"`,
    ],
    loop: 1,
    typeSpeed: 20,
    deleteSpeed: 0,
  });

  // 오늘 이미 문제를 풀었는지 여부
  const [isAlreadyDone, setIsAlreadyDone] = useState(false);

  //AlertModal을 띄울지 여부
  const [showAlertModal, setShowAlertModal] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 localStorage에 저장된 날짜 확인
    const doneDate = localStorage.getItem("dailyQuestDone");
    if (doneDate) {
      // 오늘 날짜 계산
      const todayString = new Date().toISOString().slice(0, 10);
      if (doneDate === todayString) {
        // 이미 오늘 완료된 기록
        setIsAlreadyDone(true);
      } else {
        // 날짜가 다르다면, 어제 기록이므로 초기화
        localStorage.removeItem("dailyQuestDone");
        setIsAlreadyDone(false);
      }
    } else {
      setIsAlreadyDone(false);
    }
  }, []);

  const handleDailyQuestClick = () => {
    if (isAlreadyDone) {
      // 이미 완료라면 AlertModal 띄우기
      setShowAlertModal(true);
    } else {
      // 완료가 아니라면 /quest 페이지로 이동
      router.push("/quest");
    }
  };

  // AlertModal의 닫기 버튼
  const closeAlert = () => {
    setShowAlertModal(false);
  };

  return (
    <div>
      <p className="pointer-events-none my-4 whitespace-pre-line">{content}</p>

      {/* 버튼을 세로로 배치 (flex-col) */}
      <div className={`flex flex-col gap-2 opacity-0 ${styles.fadeInDelayed}`}>
        <button
          onClick={() => handleDailyQuestClick()}
          className="
            cursor-pointer 
            py-2 
            text-left
            text-[rgb(255,255,0)]
            hover:text-[rgb(253,224,71,0.7)]
          "
        >
          [일일 퀘스트] 백준 문제를 풀어 용을 처치하자!
        </button>
      </div>

      {showAlertModal && (
        <AlertModal title="알림" onClose={closeAlert}>
          <p>오늘은 이미 일일 퀘스트를 완료하셨습니다.</p>
        </AlertModal>
      )}
    </div>
  );
};

export default DailyProblemContent;
