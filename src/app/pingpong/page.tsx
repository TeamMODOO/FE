"use client";

import { useEffect, useRef, useState } from "react";

import GameRuleModal from "@/components/gameRuleModal/GameRuleModal";

import styles from "./Pingpong.module.css";

export default function Game() {
  // Canvas 참조
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 점수
  const [score, setScore] = useState({ player: 0, ai: 0 });

  // ========== 추가된 부분: 게임 시작/종료/타이머 관련 State ==========
  // 1) 게임 규칙 모달 (처음에 true => 모달 열림)
  const [isGameRuleModalOpen, setIsGameRuleModalOpen] = useState(true);
  // 2) 게임 시작 여부
  const [isGameStarted, setIsGameStarted] = useState(false);
  // 3) 게임 종료 여부 (시간이 다 되었을 때)
  const [isGameEnded, setIsGameEnded] = useState(false);
  // 4) 남은 시간
  const [timeRemaining, setTimeRemaining] = useState(60);
  // 5) 결과 모달 (게임 종료 시 표시)
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  // 모달 닫기
  const closeGameRuleModal = () => {
    setIsGameRuleModalOpen(false);
  };

  // ========== [게임시작] 버튼을 누르면 호출되는 함수 ==========
  function handleGameStart() {
    // 규칙 모달 닫기 & 게임 시작
    setIsGameRuleModalOpen(false);
    setIsGameStarted(true);
  }

  // ========== 시간이 다 되거나(0초) 다른 사유로 게임 종료 시 호출 ==========
  function handleGameEnd() {
    setIsGameEnded(true);
    setIsResultModalOpen(true); // 결과 모달 열기
  }

  // ========== [결과 모달] 닫기 버튼 함수 ==========
  function closeResultModal() {
    setIsResultModalOpen(false);
    // 필요하다면 로비로 이동/페이지 리셋 등 추가 로직
  }

  /**
   * ====================
   * 1) 타이머 관리용 useEffect
   * ====================
   */
  useEffect(() => {
    if (!isGameStarted || isGameEnded) return;

    // 1초마다 timeRemaining 감소
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 클린업
    return () => {
      clearInterval(timer);
    };
  }, [isGameStarted, isGameEnded]);

  /**
   * ====================
   * 2) 핑퐁 게임 로직용 useEffect
   * ====================
   */
  useEffect(() => {
    // 게임 시작 전이거나, 이미 끝났으면 로직 실행 X
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

    const resetBall = () => {
      ballX = canvas.width / 2;
      ballY = canvas.height / 2;
      // x방향 반대로
      ballSpeedX *= -1;
      // y방향은 랜덤
      ballSpeedY = Math.random() > 0.5 ? 4 : -4;
    };

    const render = () => {
      // 만약 중간에 1분이 끝나면 종료
      if (isGameEnded) return;

      // 배경
      context.fillStyle = "black";
      context.fillRect(0, 0, canvas.width, canvas.height);

      // 패들(플레이어, AI)
      context.fillStyle = "white";
      context.fillRect(10, playerY, paddleWidth, paddleHeight);
      context.fillRect(canvas.width - 20, aiY, paddleWidth, paddleHeight);

      // 공
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

    // 이벤트 등록
    canvas.addEventListener("mousemove", handleMouseMove);

    // 첫 렌더 시작
    render();

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isGameStarted, isGameEnded]);

  /**
   * 최종 결과 모달에서 승패 계산
   */
  function getResultMessage() {
    if (score.player > score.ai) return "You Win!";
    if (score.player < score.ai) return "AI Wins!";
    return "Draw!";
  }

  return (
    <div className={styles.container}>
      {/* 게임 규칙 모달 */}
      {isGameRuleModalOpen && (
        <GameRuleModal
          title="핑퐁 게임"
          onClose={closeGameRuleModal}
          onConfirm={handleGameStart}
          isConfirm
        >
          <p>마우스를 움직이세요! 패들이 상/하로 따라갑니다.</p>
          <p>1분 후 점수가 더 높은 쪽이 승리!</p>
        </GameRuleModal>
      )}

      {/* 게임 결과 모달 (1분 끝나면 표시) */}
      {isResultModalOpen && (
        <GameRuleModal title="게임 종료" onClose={closeResultModal}>
          <p>최종 스코어:</p>
          <p>
            Player: {score.player} vs AI: {score.ai}
          </p>
          <p>{getResultMessage()}</p>
        </GameRuleModal>
      )}

      {/* 상단: 1분 카운트 다운과 점수 표시 */}
      <div className={styles.gameTimer}>
        <p className={styles.timer}>Time: {timeRemaining} s</p>
      </div>
      <div className={styles.recordBoard}>
        <p className={styles.playerRecord}>Player: {score.player}</p>
        <p className={styles.aiRecord}>AI: {score.ai}</p>
      </div>

      {/* ========= 캔버스 조건부 렌더링 ========= */}
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
