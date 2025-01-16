"use client";

import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

import { BgMusicButton } from "@/components/bgMusic/BgMusicButton";
import { BgMusicGlobal } from "@/components/bgMusic/BgMusicGlobal";
import GameRuleModal from "@/components/gameRuleModal/GameRuleModal";
import { OutButton } from "@/components/outButton/OutButton";

// import Swal from "sweetalert2";
import TypingCompleteModal from "./_components/TypingCompleteModal/TypingCompleteModal";

import styles from "./typing.module.css";

/** GitHub 코드 검색 결과의 item 타입 정의 */
interface GitHubCodeSearchItem {
  url: string; // RAW API URL
  html_url: string; // 브라우저에서 보는 URL
}

/** GitHub 파일 정보 (content, encoding 등) */
interface GitHubCodeFile {
  content?: string; // Base64로 인코딩된 코드
  encoding?: string;
  // 필요한 필드가 더 있다면 추가
}

/** 타자 기록 인터페이스 */
interface TypingRecord {
  completedAt: string;
  time: number;
  accuracy: string | number;
  wpm: string | number;
}

export default function TypingPage() {
  const [userInput, setUserInput] = useState<string>("");
  const [fileLink, setFileLink] = useState<string>("");
  const [codeToType, setCodeToType] = useState<string>("");
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [wpm, setWpm] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const fetchDelay = 2000; // 요청 간격 (2초)
  const [typingRecords, setTypingRecords] = useState<TypingRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  /** 여러 레포지토리 중 랜덤으로 선택해 .js 파일 검색하기 위한 배열 */
  const repositories = [
    "lodash/lodash",
    "axios/axios",
    "facebook/react",
    "ramda/ramda",
    "jquery/jquery",
    "mrdoob/three.js",
    "d3/d3",
    "chartjs/Chart.js",
    "expressjs/express",
    "angular/angular",
    "vuejs/vue",
    "airbnb/lottie-web",
    "vercel/next.js",
    "socketio/socket.io",
  ];

  /**
   * GitHub API에서 특정 레포지토리의 .js 파일 목록을 검색하고,
   * 랜덤한 파일을 골라 코드 스니펫을 가져오는 함수
   */
  const fetchJSFilesFromGithub = async (retryCount = 3) => {
    if (isFetching) return;

    setIsFetching(true);
    const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

    // 랜덤 리포지토리 선택
    const randomRepo =
      repositories[Math.floor(Math.random() * repositories.length)];
    const query = "extension:js"; // .js 파일

    try {
      const response = await fetch(
        `https://api.github.com/search/code?q=${query}+repo:${randomRepo}`,
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
          },
        },
      );

      if (!response.ok) {
        if (response.status === 403) {
          // console.error("API 요청이 금지되었습니다. 잠시 후 다시 시도합니다.");
          // Swal.fire({
          //   position: "top",
          //   icon: "error",
          //   title: "잠시 후 다시 시도해주세요",
          //   showConfirmButton: false,
          //   timer: 2000,
          //   customClass: {
          //     title: "custom-title",
          //     popup: "custom-popup",
          //   },
          // });
          setIsDisabled(true);
          return;
        }
        return;
      }

      // 응답을 JSON 형태로 파싱 (items 배열을 가진다)
      const data = (await response.json()) as {
        items: GitHubCodeSearchItem[];
      };

      if (data.items && data.items.length > 0) {
        // 그 중 하나를 랜덤으로 선택
        const randomItem =
          data.items[Math.floor(Math.random() * data.items.length)];
        await fetchCodeSnippet(randomItem);
      } else {
        if (retryCount > 0) {
          await new Promise((resolve) => setTimeout(resolve, fetchDelay));
          await fetchJSFilesFromGithub(retryCount - 1);
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        // console.error("에러 발생:", error.message);
      } else {
        // console.error("에러 발생:", error);
      }
    } finally {
      setIsFetching(false);
    }
  };

  /**
   * GitHub에서 특정 파일의 코드 스니펫을 가져와서
   * 랜덤 함수/클래스 등 특정 블록을 추출하는 함수
   */
  const fetchCodeSnippet = async (item: GitHubCodeSearchItem) => {
    if (isFetching) return;
    setIsFetching(true);

    try {
      const response = await fetch(item.url, {
        headers: {
          Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`코드 스니펫 요청 실패: ${response.status}`);
      }

      // 코드 파일 데이터 (Base64 인코딩된 content)
      const codeData = (await response.json()) as GitHubCodeFile;

      if (codeData.content) {
        try {
          // Base64 디코딩
          const decodedContent = atob(codeData.content);

          // 정규 표현식 패턴
          const regexPatterns: { [key: string]: RegExp } = {
            function: /function\s+\w+\s*\(.*?\)\s*{[^}]*}/g,
            class: /class\s+\w+\s*{[^}]*}/g,
            arrow: /\w+\s*=\s*\(.*?\)\s*=>\s*{[^}]*}/g,
            async: /async\s+function\s+\w+\s*\(.*?\)\s*{[^}]*}/g,
            loop: /\b(for|while)\s*\(.*?\)\s*{[^}]*}/g,
            conditional: /\b(if|switch)\s*\(.*?\)\s*{[^}]*}/g,
            object: /const\s+\w+\s*=\s*{[^}]*}/g,
          };

          const allMatches: string[] = [];

          // 각 패턴별로 매칭되는 모든 블록을 추출
          for (const pattern of Object.values(regexPatterns)) {
            const matches = decodedContent.match(pattern) || [];
            matches.forEach((match) => {
              const nestedBlocks = extractNestedBlocks(match);
              allMatches.push(...nestedBlocks);
            });
          }

          if (allMatches.length > 0) {
            // 랜덤 코드 조각 선택
            const randomSnippet =
              allMatches[Math.floor(Math.random() * allMatches.length)];
            setCodeToType(randomSnippet);
            setFileLink(item.html_url);
          } else {
            if (!codeToType) {
              setTimeout(() => {
                setIsFetching(false);
                fetchJSFilesFromGithub();
              }, fetchDelay);
            }
          }
        } catch (decodeError: unknown) {
          if (decodeError instanceof Error) {
            // console.error("Base64 디코딩 에러:", decodeError.message);
          } else {
            // console.error("Base64 디코딩 에러:", decodeError);
          }
          setIsFetching(false);
        }
      } else {
        setIsFetching(false);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        // console.error("코드 스니펫 에러:", error.message);
      } else {
        // console.error("코드 스니펫 에러:", error);
      }
      setIsFetching(false);
    }
  };

  /**
   * 코드 문자열 내부에서 중첩된 중괄호 블록을 추출하는 함수
   * 예: function foo() { ... } 등
   */
  const extractNestedBlocks = (code: string): string[] => {
    const blocks: string[] = [];
    const stack: string[] = [];
    let currentBlock = "";

    for (const char of code) {
      currentBlock += char;
      if (char === "{") {
        stack.push(char);
      } else if (char === "}") {
        stack.pop();
        // 모든 괄호가 닫혔다면 블록 완성
        if (stack.length === 0) {
          blocks.push(currentBlock);
          currentBlock = "";
        }
      }
    }

    return blocks;
  };

  /** 컴포넌트가 처음 마운트될 때, GitHub에서 코드 로드 및 로컬 스토리지 기록 불러오기 */
  useEffect(() => {
    fetchJSFilesFromGithub();

    const storedRecords = JSON.parse(
      localStorage.getItem("typingRecords") || "[]",
    ) as TypingRecord[];
    setTypingRecords(storedRecords);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 타이핑이 완료되었을 때, 로컬 스토리지에서 기록 갱신 */
  useEffect(() => {
    if (isFinished) {
      const storedRecords = JSON.parse(
        localStorage.getItem("typingRecords") || "[]",
      ) as TypingRecord[];
      setTypingRecords(storedRecords);
    }
  }, [isFinished]);

  /** textarea 입력 핸들러 */
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    setUserInput(inputValue);

    // 최초 입력 순간에 타이머 시작
    if (!startTime) {
      setStartTime(new Date().getTime());
    }
    autoResizeTextarea();
  };

  /** 타이핑이 끝났는지(코드 길이를 모두 입력했는지) 체크하고 정확도, WPM 계산 */
  useEffect(() => {
    const cleanedCodeToType = codeToType.replace(/\s+/g, " ").trim();
    if (
      userInput.length >= cleanedCodeToType.length &&
      userInput.length > 0 &&
      cleanedCodeToType.length > 0
    ) {
      setIsFinished(true);

      // 걸린 시간(초)을 분으로 변환
      const timeTaken = currentTime / 60;
      // 정확하게 맞춘 글자 수
      const correctChars = userInput
        .split("")
        .filter((char, index) => char === cleanedCodeToType[index]).length;

      // 정확도
      const computedAccuracy = (
        (correctChars / cleanedCodeToType.length) *
        100
      ).toFixed(2);
      setAccuracy(Number(computedAccuracy));

      // WPM (분당 타자 수)
      if (timeTaken > 0) {
        const computedWpm = (userInput.length / 5 / timeTaken).toFixed(2);
        setWpm(Number(computedWpm));
        saveTypingRecord(currentTime, computedAccuracy, computedWpm);
      }

      setIsModalOpen(true);
    }
  }, [userInput, codeToType, currentTime]);

  /**
   * codeToType을 화면에 렌더링해 주는 함수.
   * 문자열을 배열로 분할(split) 후 `.map()`을 사용해 인덱스별로 스타일링
   */
  const renderCode = () => {
    const cleanedCodeToType = codeToType.replace(/\s+/g, " ");

    return cleanedCodeToType.split("").map((char, index) => {
      let bgColor;
      let color;

      if (index < userInput.length) {
        if (userInput[index] === char) {
          color = "green";
        } else {
          bgColor = "red";
        }
      }
      if (index === userInput.length) {
        bgColor = "gray";
      }

      return (
        <span
          key={index}
          style={{
            backgroundColor: bgColor,
            color: color,
          }}
        >
          {char}
        </span>
      );
    });
  };

  /** textarea에서 Tab, Enter 키 입력 시 공백 추가 */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      setUserInput((prev) => prev + " ");
    }
    if (e.key === "Enter") {
      e.preventDefault();
      setUserInput((prev) => prev + " ");
    }
  };

  /** 타이머 동작 */
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (startTime && !isFinished) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prevTime) => {
          const updatedTime = (parseFloat(String(prevTime)) || 0) + 0.1;
          return parseFloat(updatedTime.toFixed(1));
        });
      }, 100);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, isFinished, isPaused]);

  /** 새 코드 스니펫 가져오기 */
  const refreshCodeSnippet = () => {
    setUserInput("");
    setIsFinished(false);
    setCurrentTime(0);
    setStartTime(null);
    fetchJSFilesFromGithub();
    autoResizeTextarea();
  };

  /** textarea 자동 리사이즈 */
  const autoResizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  /** 로컬 스토리지에 기록 저장 */
  const saveTypingRecord = (
    time: number,
    accuracyVal: string | number,
    wpmVal: string | number,
  ) => {
    const completedAt = new Date().toLocaleString();
    const record: TypingRecord = {
      completedAt,
      time,
      accuracy: accuracyVal,
      wpm: wpmVal,
    };

    const storedRecords = JSON.parse(
      localStorage.getItem("typingRecords") || "[]",
    ) as TypingRecord[];
    storedRecords.push(record);
    localStorage.setItem("typingRecords", JSON.stringify(storedRecords));
  };

  /** 모달 닫기 */
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 게임 룰 설명 모달
  const [isGameRuleModalOpen, setIsGameRuleModalOpen] = useState<boolean>(true);

  const closeGameRuleModal = () => {
    setIsGameRuleModalOpen(false);
  };

  return (
    <>
      {isGameRuleModalOpen && (
        <GameRuleModal title="타자 연습" onClose={closeGameRuleModal}>
          <p>
            코드를 따라 입력하세요. 타자 속도, 정확도를 측정합니다.
            <br />
            코드는 랜덤으로 가져오며, 새로고침 버튼을 눌러 새 코드를 가져올 수
            있습니다.
          </p>
          <p>화면 가운데 텍스트 영역을 클릭하면 타자 연습이 시작됩니다.</p>
          <p>
            타자 연습을 마치면 정확도, 소요 시간, 분당 타자 수(WPM)를 확인할 수
            있습니다.
          </p>
        </GameRuleModal>
      )}
      <BgMusicGlobal src="/sounds/typing.wav" />
      <BgMusicButton />
      <OutButton />
      <div className={styles.container}>
        {/* 배경 반딧불이 애니메이션 */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className={styles.floatingSquare}></div>
        ))}
        <div className="max-h-[80%]">
          <div className="align-center flex justify-center">
            <div>
              <img
                src="/logo/typing_logo.png"
                alt="타자 연습 로고"
                width={800}
                className="flex-0.5 max-h-[10dvh] w-auto"
              />
            </div>
          </div>
          <div className={styles.typingarea}>
            <h2>타자 연습</h2>
            <div className={styles.refreshCodeSnippet}>
              {fileLink && (
                <span>
                  <a href={fileLink} target="_blank" rel="noopener noreferrer">
                    코드 출처
                  </a>
                </span>
              )}
              <button onClick={refreshCodeSnippet}>새로고침</button>
            </div>

            <div className={styles.codecontainer}>
              {isFetching ? (
                <div className={styles.loadingtext}>
                  <div className={styles.spinner}></div>
                  <span>코드 가져오는 중...</span>
                </div>
              ) : (
                renderCode()
              )}
            </div>

            <textarea
              placeholder="이곳을 클릭하고 텍스트를 입력하면 타자 연습이 시작됩니다."
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              spellCheck="false"
              disabled={isPaused || isFinished || isDisabled}
              ref={textareaRef}
              className={styles.textareaSection}
            />

            <div className={styles.footer}>
              {!isFinished && currentTime > 0 && (
                <>
                  <div>
                    <p>소요 시간: {currentTime} 초</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 저장된 기록 표시 */}
          {typingRecords.length > 0 && (
            <div className={styles.typingRecords}>
              <h3>타자 연습 기록</h3>
              <div>
                {typingRecords.map((record, index) => (
                  <div key={index} className={styles.typingRecordsItem}>
                    <p>완료 시간: {record.completedAt}</p>
                    <span>소요 시간: {record.time} 초</span>
                    &nbsp;&nbsp;&nbsp;||&nbsp;&nbsp;&nbsp;
                    <span>정확도: {record.accuracy}%</span>
                    &nbsp;&nbsp;&nbsp;||&nbsp;&nbsp;&nbsp;
                    <span>속도: {record.wpm} WPM</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {isModalOpen && (
            <TypingCompleteModal
              currentTime={currentTime}
              accuracy={accuracy}
              wpm={wpm}
              onClose={closeModal}
              onNext={() => {
                refreshCodeSnippet();
                closeModal();
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
