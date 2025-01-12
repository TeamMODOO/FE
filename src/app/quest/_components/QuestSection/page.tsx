"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";

import AlertModal from "@/components/alertModal/AlertModal";
import { Button } from "@/components/ui/button";
import { useQuestGet } from "@/hooks/quest/useQuestGet";
import { useQuestPost } from "@/hooks/quest/useQuestPost";
import { useToast } from "@/hooks/use-toast";

import { getRandomQuestNumber } from "../../utils/getRandomQuestNumber";
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
    ".cm-scroller::-webkit-scrollbar": {
      width: "3px",
    },
    ".cm-scroller::-webkit-scrollbar:horizontal": {
      height: "3px",
    },
    ".cm-scroller::-webkit-scrollbar-track": {
      background: "none",
    },
    ".cm-scroller::-webkit-scrollbar-thumb": {
      background: "red",
      borderRadius: "5px",
    },
  },
  { dark: true },
);

export default function QuestSection() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  // 효과음 처리 위한 Ref
  const correctAudioRef = useRef<HTMLAudioElement>(null);
  const incorrectAudioRef = useRef<HTMLAudioElement>(null);

  /** 문제 풀이 시작 여부 */
  const [isStart, setIsStart] = useState(false);

  // Confirm Modal 관련 State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalMsg, setConfirmModalMsg] = useState("");
  // “예” 버튼을 클릭했을 때 실행할 함수
  const [onConfirm, setOnConfirm] = useState<() => void>(() => () => {});

  const handleLockedClick = () => {
    playSwordSound();
    setIsStart(true);
  };

  /** (예시) 1시간(3600초) 타이머 */
  const [timeLeft, setTimeLeft] = useState(3600);

  /** 문제 푼 데 걸린 시간(초) */
  const [timeSpent, setTimeSpent] = useState(0);

  /** 에디터 상태 */
  const [selectedLang, setSelectedLang] =
    useState<keyof typeof languageExtensions>("python");
  const [code, setCode] = useState("");

  /* 결과 모달 */
  const [showModal, setShowModal] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [betterSolution, setBetterSolution] = useState("");
  const [hint, setHint] = useState("");

  /* Loading 상태 */
  const [isLoading, setIsLoading] = useState(false);

  // 난수 문제
  const randomQuestNumber = getRandomQuestNumber();
  const { data, loading, error } = useQuestGet(randomQuestNumber);
  const { submitQuestResult } = useQuestPost(randomQuestNumber);

  // 문제 정보
  const qNum = data?.quest_number;
  const qTitle = data?.title;
  const qProblem = data?.content;
  const qInput = data?.input_example;
  const qOutput = data?.output_example;

  /** 제출 이벤트 */
  const handleSubmit = async () => {
    setShowModal(true);
    setIsLoading(true);
    try {
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

      setIsCorrect(data.isCorrect);
      setBetterSolution(data.betterSolution);
      setHint(data.hint);

      // 정답이면 시간 계산
      if (data.isCorrect) {
        setIsStart(false);
        const spent = 3600 - timeLeft;
        setTimeSpent(spent);
      }
    } catch (error) {
      setIsCorrect(false);
      setBetterSolution("");
      setHint("에러가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // isCorrect 여부 감지 후 사운드 재생
  useEffect(() => {
    if (isCorrect !== null) {
      if (isCorrect) {
        correctAudioRef.current?.play().catch(() => {});
      } else {
        incorrectAudioRef.current?.play().catch(() => {});
      }
    }
  }, [isCorrect]);

  /* 모달 닫기 */
  const handleCloseModal = () => {
    setShowModal(false);
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
    if (isStart && timeLeft === 0) {
      toast({
        title: "시간 초과!",
        description: `아쉽습니다. 시간 초과로 인해 일일 챌린지를 해결하지 못했습니다. (메인 화면으로 이동합니다...)`,
        variant: "destructive",
        duration: 3000,
      });
      setTimeout(() => {
        router.push("/lobby");
      }, 5000);
    }
  }, [timeLeft, isStart, router, toast]);

  /** 시간 포맷 */
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(hours).padStart(2, "0")}:${String(
    minutes,
  ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  /** “문제 풀이 시작”/“중단” 버튼 */
  const buttonText = isStart ? "중단하고 나가기" : "문제 풀이 시작";

  const handleStartOrStop = () => {
    if (!isStart) {
      playSwordSound();
      setIsStart(true);
    } else {
      // 기존 window.confirm 대신 → ConfirmModal 열기
      setConfirmModalMsg("정말 포기하고 나가시겠습니까?");
      setOnConfirm(() => () => {
        router.push("/lobby");
      });
      setConfirmModalOpen(true);
    }
  };

  /** 언어 선택/에디터 onChange */
  const onChangeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLang(e.target.value as keyof typeof languageExtensions);
  };
  const onChangeCode = (value: string) => setCode(value);

  /** 에디터의 “읽기 전용” 여부 */
  const editableExtension = EditorView.editable.of(isStart);

  /** 걸린 시간 포맷 */
  function formatTimeSpent(totalSec: number) {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
      s,
    ).padStart(2, "0")}`;
  }

  const handleCompleteQuest = async () => {
    const todayString = new Date().toISOString().slice(0, 10);
    if (session?.user.role !== "guest") {
      localStorage.setItem("dailyQuestDone", todayString);
      await submitQuestResult(formatTimeSpent(timeSpent));
    }
    router.push("/lobby");
  };

  const swordAudioRef = useRef<HTMLAudioElement>(null);

  function playSwordSound() {
    if (!swordAudioRef.current) return;
    swordAudioRef.current.currentTime = 0;
    swordAudioRef.current.play().catch(() => {});
  }

  return (
    <div className={styles.container}>
      <audio
        ref={swordAudioRef}
        src="/sounds/swordSFX.wav"
        style={{ display: "none" }}
      />
      <audio
        ref={correctAudioRef}
        src="/sounds/correctFx.wav"
        style={{ display: "none" }}
      />
      <audio
        ref={incorrectAudioRef}
        src="/sounds/incorrectFx.wav"
        style={{ display: "none" }}
      />

      <div className={styles.questHeader}>
        <h1 className={styles.title}>오늘의 문제</h1>
        <h1 className={styles.timer}>{isStart ? formattedTime : "00:00:00"}</h1>
        <Button className={styles.startButton} onClick={handleStartOrStop}>
          {buttonText}
        </Button>
      </div>

      <div className={styles.questionBoard}>
        <Problem
          isStart={isStart}
          qNum={String(qNum ?? "")}
          qTitle={qTitle ?? ""}
          qProblem={qProblem ?? ""}
          qInput={qInput ?? ""}
          qOutput={qOutput ?? ""}
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

          {/* 결과 모달 */}
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
                        정답입니다! 용을 물리쳤습니다.
                      </h2>

                      {betterSolution && betterSolution !== "" ? (
                        <>
                          <p className={styles.modalSubTitle}>
                            이렇게도 풀 수 있어요:
                          </p>
                          <div className={styles.modalBottomSection}>
                            <p>{betterSolution}</p>
                          </div>
                          <div>
                            <p className={styles.modalSubTitle}>
                              <p>문제해결까지 소요 시간:</p>
                            </p>
                            <div className={styles.timeSpent}>
                              <p>{formatTimeSpent(timeSpent)}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className={styles.modalSubTitle}>
                          이미 모범답안 수준입니다!
                        </p>
                      )}
                      <Button
                        onClick={handleCompleteQuest}
                        disabled={loading}
                        className="min-h-11 text-xl"
                      >
                        일일 챌린지 완료하기
                      </Button>
                      {session?.user?.role === "guest" && (
                        <p className={styles.guestWarning}>
                          현재 게스트 로그인 상태입니다! 일일 퀘스트 완료로
                          기록되지 않습니다.
                        </p>
                      )}
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
                        <h2 className={styles.modalTitle}>
                          아쉽습니다. 오답입니다!
                        </h2>
                      </div>
                      <p className={styles.modalSubTitle}>
                        아래 힌트를 참고하세요.
                      </p>
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

      {/* "확인(네/아니오)" AlertModal */}
      {confirmModalOpen && (
        <AlertModal
          title="확인"
          isConfirm
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={() => {
            // 예 버튼 클릭 시
            onConfirm();
            setConfirmModalOpen(false);
          }}
        >
          <p>{confirmModalMsg}</p>
        </AlertModal>
      )}
    </div>
  );
}
