"use client";

import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";

import Problem from "../Problem/page";
import Modal from "../ResultModal/ResultModal";
import styles from "./QuestSection.module.css";

/** 언어별 CodeMirror 확장 매핑 */
const languageExtensions = {
  python: python(),
  c: cpp(),
  java: java(),
};

/** 폰트 사이즈 테마 */
const customFontSizeTheme = EditorView.theme(
  {
    ".cm-content": {
      fontSize: "17px",
    },
  },
  { dark: true },
);

export default function QuestSection() {
  const router = useRouter();
  /** 문제 풀이 시작 여부 */
  const [isStart, setIsStart] = useState(false);

  // src/app/quest/_component/QuestSection/page.tsx

  // 'locked.webp' 이미지를 클릭 시에도 문제풀이를 시작시키는 함수
  const handleLockedClick = () => {
    setIsStart(true);
  };

  /** (예시) 1시간(3600초) 타이머 */
  const [timeLeft, setTimeLeft] = useState(3600);

  /** 추가: 문제 푸는데 걸린 시간(초) */
  const [timeSpent, setTimeSpent] = useState(0);

  /** 에디터 상태 */
  const [selectedLang, setSelectedLang] =
    useState<keyof typeof languageExtensions>("python");
  const [code, setCode] = useState("");

  /* 모달 관련 상태 */
  const [showModal, setShowModal] = useState(false);
  /* ChatGPT 응답 */
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [betterSolution, setBetterSolution] = useState<string>("");
  const [hint, setHint] = useState<string>("");

  /* Loading 상태 */
  const [isLoading, setIsLoading] = useState(false);

  // 문제 정보 (하드코딩 예시)
  const qNum = "1920";
  const qTitle = "수 찾기";
  const qProblem = `N개의 정수 A[1], A[2], …, A[N]이 주어져 있을 때, 
  이 안에 X라는 정수가 존재하는지 알아내는 프로그램을 작성하시오.`;
  const qInput = `첫째 줄에 자연수 N(1 ≤ N ≤ 100,000)이 주어진다. 
다음 줄에는 N개의 정수 A[1], A[2], …, A[N]이 주어진다. 
다음 줄에는 M(1 ≤ M ≤ 100,000)이 주어진다. 
다음 줄에는 M개의 수들이 주어지는데, 
이 수들이 A안에 존재하는지 알아내면 된다. 
모든 정수의 범위는 -2^31 이상 2^31 미만이다.`;
  const qOutput = `M개의 줄에 답을 출력한다. 
존재하면 1을, 존재하지 않으면 0을 출력한다.`;

  /* 제출 이벤트 */
  const handleSubmit = async () => {
    // 1. 모달창 띄우기 (결과 표시용)
    setShowModal(true);
    // 2. 로딩 시작
    setIsLoading(true);

    try {
      // 3. API 호출
      const res = await fetch("/api/check-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qProblem,
          qInput,
          qOutput,
          userCode: code,
        }),
      });
      const data = await res.json();

      // 4. 결과 파싱
      // data = { isCorrect: boolean, betterSolution: string, hint: string }
      setIsCorrect(data.isCorrect);
      setBetterSolution(data.betterSolution);
      setHint(data.hint);

      // --- 추가: 정답이면 타이머 멈추고, 경과시간(timeSpent) 계산 ---
      if (data.isCorrect) {
        // 1) 타이머 멈춤
        setIsStart(false);
        // 2) 문제 푼 데 걸린 시간(초)
        const spent = 3600 - timeLeft;
        setTimeSpent(spent);
      }
    } catch (error) {
      // console.error(error);
      setIsCorrect(false);
      setBetterSolution("");
      setHint("에러가 발생했습니다.");
    } finally {
      // 5. 로딩 종료
      setIsLoading(false);
    }
  };

  /* 모달 닫기 */
  const handleCloseModal = () => {
    setShowModal(false);
    // 모달 닫으면서 필요하다면 state 초기화
    // setIsCorrect(null);
    // setBetterSolution("");
    // setHint("");
  };

  /** 타이머 로직 */
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    if (isStart) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => (prev <= 0 ? 0 : prev - 1));
      }, 1000);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isStart]);

  useEffect(() => {
    // isStart인 상태에서 timeLeft가 0이 되면
    if (isStart && timeLeft === 0) {
      toast.error(
        `아쉽습니다. 시간 초과로 인해 일일 챌린지를 해결하지 못했습니다.
        (메인 화면으로 이동합니다...)`,
      );
      setTimeout(() => {
        router.push("/lobby");
      }, 5000);
    }
  }, [timeLeft, isStart, router]);

  /** 시간 포맷 */
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(hours).padStart(2, "0")}:${String(
    minutes,
  ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  /** 버튼 */
  const buttonText = isStart ? "중단하고 나가기" : "문제 풀이 시작";
  const handleStartOrStop = () => {
    if (!isStart) {
      // 문제 풀이 시작 전이면 그냥 시작
      setIsStart(true);
    } else {
      // 이미 문제 풀이가 시작됐다면, 정말 나갈지 확인
      const confirmResult = window.confirm("정말 포기하고 나가시겠습니까?");
      if (confirmResult) {
        router.push("/questmap");
      }
    }
  };

  /** 에디터 onChange */
  const onChangeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLang(e.target.value as keyof typeof languageExtensions);
  };
  const onChangeCode = (value: string) => setCode(value);

  /** CodeMirror 6: 읽기 전용 제어 -> editable Extension */
  const editableExtension = EditorView.editable.of(isStart);

  // --- 추가: 걸린 시간 포맷 함수 (timeSpent를 시:분:초로 표현) ---
  function formatTimeSpent(totalSec: number) {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
      s,
    ).padStart(2, "0")}`;
  }

  return (
    <div className={styles.container}>
      <div className={styles.questHeader}>
        <h1 className={styles.title}>오늘의 문제</h1>
        <h1 className={styles.timer}>{isStart ? formattedTime : "00:00:00"}</h1>
        <Button className={styles.startButton} onClick={handleStartOrStop}>
          {buttonText}
        </Button>
      </div>

      <div className={styles.questionBoard}>
        {/**
         * Problem 컴포넌트에 Props로
         *  isStart, qNum, qTitle, qProblem, qInput, qOutput 전달
         */}
        <Problem
          isStart={isStart}
          qNum={qNum}
          qTitle={qTitle}
          qProblem={qProblem}
          qInput={qInput}
          qOutput={qOutput}
          onLockedClick={handleLockedClick}
        />

        <section className={styles.submitForm}>
          <select
            name="languages"
            className={styles.selectLang}
            value={selectedLang}
            onChange={onChangeLanguage}
            disabled={!isStart}
          >
            <option value="python">python</option>
            <option value="c">c++</option>
            <option value="java">java</option>
          </select>

          <CodeMirror
            className={styles.textEditor}
            value={code}
            height="100%"
            theme="dark"
            placeholder="// 문제를 풀어 용을 무찌르세요!"
            extensions={[
              editableExtension,
              languageExtensions[selectedLang],
              customFontSizeTheme,
            ]}
            onChange={onChangeCode}
          />

          <Button disabled={!isStart} onClick={handleSubmit}>
            제출하기
          </Button>

          {/* 모달 렌더링 */}
          {showModal && (
            <Modal onClose={handleCloseModal}>
              {isLoading ? (
                <div className={styles.spinnerContainer}>
                  <div className={styles.spinner}></div>
                  <p>답안을 검토 중입니다... 잠시만 기다려주세요.</p>
                </div>
              ) : (
                <>
                  {isCorrect === null ? (
                    <div className={styles.spinnerContainer}>
                      <div className={styles.spinner}></div>
                      <p>결과를 불러오는 중...</p>
                    </div>
                  ) : isCorrect ? (
                    <div className={styles.correctDiv}>
                      <div className={styles.modalUpperSection}>
                        <Image
                          src="/etc/trophy.webp"
                          alt="correct"
                          width={200}
                          height={200}
                        />
                      </div>
                      <h2
                        className={styles.modalTitle}
                        style={{ color: "green" }}
                      >
                        정답입니다! 용을 물리쳤습니다. 💫
                      </h2>

                      <p className={styles.timeSpent}>
                        소요 시간: {formatTimeSpent(timeSpent)}
                      </p>
                      {betterSolution && betterSolution !== "" ? (
                        <>
                          <p className={styles.modalSubTitle}>
                            이렇게도 풀 수 있어요:
                          </p>
                          <section className={styles.modalBottomSection}>
                            <p>{betterSolution}</p>
                          </section>
                        </>
                      ) : (
                        <p className={styles.modalSubTitle}>
                          이미 모범답안 수준입니다!
                        </p>
                      )}
                      <Button onClick={() => router.push("/questmap")}>
                        일일 챌린지 완료하기
                      </Button>
                    </div>
                  ) : (
                    <div className={styles.incorrectDiv}>
                      <div className={styles.modalUpperSection}>
                        <Image
                          src="/etc/warning.webp"
                          alt="incorrect"
                          width={187}
                          height={250}
                        />
                        <h2
                          className={styles.modalTitle}
                          style={{ color: "red" }}
                        >
                          아쉽습니다. 오답입니다! 😣
                        </h2>
                      </div>
                      <p className={styles.modalSubTitle}>Hint?</p>
                      <div className={styles.modalBottomSection}>
                        <p>{hint}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Modal>
          )}
        </section>
      </div>
    </div>
  );
}
