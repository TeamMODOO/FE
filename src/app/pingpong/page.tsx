"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { BgMusicButton } from "@/components/bgMusic/BgMusicButton";
import { BgMusicGlobal } from "@/components/bgMusic/BgMusicGlobal";
import GameRuleModal from "@/components/gameRuleModal/GameRuleModal";
import { OutButton } from "@/components/outButton/OutButton";

import styles from "./Pingpong.module.css";

export default function Game() {
  const router = useRouter();

  // Canvas 참조
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 현재 게임 중 점수
  const [score, setScore] = useState({ player: 0, ai: 0 });
  // 게임이 끝난 시점의 최종 점수(= 고정 스코어)
  const [finalScore, setFinalScore] = useState({ player: 0, ai: 0 });

  // ========== 게임 시작/종료/타이머 관련 State ==========
  const [isGameRuleModalOpen, setIsGameRuleModalOpen] = useState(true); // 게임 룰 모달
  const [isGameStarted, setIsGameStarted] = useState(false); // 게임 시작 여부
  const [isGameEnded, setIsGameEnded] = useState(false); // 게임 종료 여부
  const [timeRemaining, setTimeRemaining] = useState(60); // 남은 시간(초)
  const [isResultModalOpen, setIsResultModalOpen] = useState(false); // 결과 모달

  /** 게임 룰 모달 닫기 */
  const closeGameRuleModal = () => {
    setIsGameRuleModalOpen(false);
  };

  /** [게임시작] 버튼 클릭 시 */
  function handleGameStart() {
    setIsGameRuleModalOpen(false);
    setIsGameStarted(true);
  }

  /**
   * 게임 종료
   * - 이 시점에 `score`의 최신 값을 `finalScore`에 저장
   * - 모달 열기
   */
  function handleGameEnd() {
    // 점수를 갱신하는 콜백으로 처리 => 최신 score를 바로 finalScore에 복사
    setScore((prevScore) => {
      const final = { ...prevScore };
      setFinalScore(final); // 여기서 최신 score를 finalScore에 복사
      return prevScore; // score state는 변경 없으니 prevScore 그대로 반환
    });

    setIsGameEnded(true);
    setIsResultModalOpen(true);
  }

  /** [결과 모달] 확인 버튼 -> /lobby 이동 */
  function closeResultModal() {
    setIsResultModalOpen(false);
    router.push("/lobby");
  }

  /**
   * 타이머를 "분:초:00" 형태(예: 1:00:00)로 변환
   *  - 60초 -> "1:00:00"
   *  - 45초 -> "0:45:00"
   */
  function formatTime(secondsLeft: number) {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}:00`;
  }

  /**
   * 1) 타이머 관리
   */
  useEffect(() => {
    if (!isGameStarted || isGameEnded) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGameEnd();
          return 0; // 0초로 세팅
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameStarted, isGameEnded]);

  /**
   * 2) 핑퐁 게임 로직
   */
  useEffect(() => {
    if (!isGameStarted || isGameEnded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const paddleWidth = 10;
    const paddleHeight = 100;
    const ballSize = 15;
    const difficulty = "easy"; // 'easy', 'medium', 'hard'
    const aiSpeed = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 4;
    const reactionRange =
      difficulty === "easy" ? 100 : difficulty === "medium" ? 75 : 50;

    // 초기 위치
    let playerY = canvas.height / 2 - paddleHeight / 2;
    let aiY = canvas.height / 2 - paddleHeight / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = 4;
    let ballSpeedY = 4;

    // 공 재설정
    const resetBall = () => {
      ballX = canvas.width / 2;
      ballY = canvas.height / 2;
      // x방향 반대로
      ballSpeedX *= -1;
      // y방향은 랜덤
      ballSpeedY = Math.random() > 0.5 ? 4 : -4;
    };

    const render = () => {
      if (isGameEnded) return; // 종료 시 움직임 중단

      // 배경
      context.fillStyle = "black";
      context.fillRect(0, 0, canvas.width, canvas.height);

      // 플레이어 패들
      context.fillStyle = "white";
      context.fillRect(10, playerY, paddleWidth, paddleHeight);

      // AI 패들
      context.fillRect(canvas.width - 20, aiY, paddleWidth, paddleHeight);

      // 공 (색상을 #4caf50로 변경)
      context.fillStyle = "#4caf50";
      context.fillRect(ballX, ballY, ballSize, ballSize);

      // 공 이동
      ballX += ballSpeedX;
      ballY += ballSpeedY;

      // 상/하 벽 충돌
      if (ballY <= 0 || ballY + ballSize >= canvas.height) {
        ballSpeedY *= -1;
      }

      // 플레이어 패들과 충돌
      if (
        ballX <= 20 &&
        ballY + ballSize >= playerY &&
        ballY <= playerY + paddleHeight
      ) {
        ballSpeedX *= -1;
      }

      // AI 패들과 충돌
      if (
        ballX + ballSize >= canvas.width - 20 &&
        ballY + ballSize >= aiY &&
        ballY <= aiY + paddleHeight
      ) {
        ballSpeedX *= -1;
      }

      // 좌우 밖으로 벗어나면 점수 업데이트 + 공 리셋
      if (ballX <= 0) {
        setScore((prev) => ({ ...prev, ai: prev.ai + 1 }));
        resetBall();
      }
      if (ballX + ballSize >= canvas.width) {
        setScore((prev) => ({ ...prev, player: prev.player + 1 }));
        resetBall();
      }

      // AI 움직임
      if (Math.abs(ballY - (aiY + paddleHeight / 2)) > reactionRange) {
        aiY += ballY > aiY + paddleHeight / 2 ? aiSpeed : -aiSpeed;
      }

      requestAnimationFrame(render);
    };

    // 마우스 이벤트로 플레이어 패들 위치 제어
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      playerY = event.clientY - rect.top - paddleHeight / 2;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    render();

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isGameStarted, isGameEnded]);

  /** 최종 결과 모달에서 승패 계산 (finalScore 기준) */
  function getResultMessage() {
    if (finalScore.player > finalScore.ai) return "You Win!";
    if (finalScore.player < finalScore.ai) return "AI Wins!";
    return "Draw!";
  }

  return (
    <div className={styles.container}>
      <OutButton />
      <BgMusicGlobal src="/sounds/pingpong.wav" />
      <BgMusicButton />
      {/* 게임 룰 모달 */}
      {isGameRuleModalOpen && (
        <GameRuleModal
          title="핑퐁 게임"
          onClose={closeGameRuleModal}
          onConfirm={handleGameStart}
          isConfirm
        >
          <p>마우스를 움직이세요! 패들이 상/하로 따라갑니다.</p>
          <p>1분 후 점수가 더 높은 쪽이 승리합니다!</p>
        </GameRuleModal>
      )}

      {/* 게임 결과 모달 */}
      {isResultModalOpen && (
        <GameRuleModal title="게임 종료" onClose={closeResultModal}>
          <p>최종 스코어:</p>
          <p>
            Player: {finalScore.player} vs AI: {finalScore.ai}
          </p>
          <p>{getResultMessage()}</p>
        </GameRuleModal>
      )}

      {/* 상단: 타이머 & 점수 표시 */}
      <div className={styles.gameTimer}>
        <p className={styles.timer}>Time: {formatTime(timeRemaining)}</p>
      </div>
      <div className={styles.recordBoard}>
        <p className={styles.playerRecord}>Player: {score.player}</p>
        <p className={styles.aiRecord}>AI: {score.ai}</p>
      </div>

      {/* 게임 Canvas (조건부 렌더링) */}
      {isGameStarted && !isGameEnded && (
        <div>
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className={styles.gameCanvas}
          />
        </div>
      )}
    </div>
  );
}
