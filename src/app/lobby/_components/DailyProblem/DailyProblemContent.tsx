"use client";

import React from "react";
import { useTypewriter } from "react-simple-typewriter";

import { useRouter } from "next/navigation";

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

  return (
    <div>
      <p className="pointer-events-none my-4 whitespace-pre-line">
        {/* <Typewriter text={content} speed={30} /> */}
        {content}
      </p>

      {/* 버튼을 세로로 배치 (flex-col) */}
      <div className={`flex flex-col gap-2 opacity-0 ${styles.fadeInDelayed}`}>
        <button
          onClick={() => router.push("/quest")}
          className="
            cursor-pointer 
            py-2 
            text-left
            text-[rgb(15,190,135)]
            hover:text-[rgb(6,209,130,0.7)]
          "
        >
          [일일 퀘스트] 백준 문제를 풀어 용을 처치하자!
        </button>

        <button
          onClick={() => router.push("/questmap")}
          className="
            cursor-pointer 
            py-2 
            text-left
            text-[rgb(15,190,135)]
            hover:text-[rgb(6,209,130,0.7)]
          "
        >
          명예의 전당으로 바로 이동…
        </button>
      </div>
    </div>
  );
};

export default DailyProblemContent;
