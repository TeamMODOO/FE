"use client";

import { useEffect, useState } from "react";

import { BgMusicButton } from "@/components/bgMusic/BgMusicButton";
import { BgMusicGlobal } from "@/components/bgMusic/BgMusicGlobal";
import GameRuleModal from "@/components/gameRuleModal/GameRuleModal";
import { OutButton } from "@/components/outButton/OutButton";
import { Tetris } from "@/utils/tetrisLogic";

import Board from "../../components/tetris/Board";
import Score from "../../components/tetris/Score";

export default function Home() {
  const [game] = useState<Tetris>(new Tetris());
  const [board, setBoard] = useState<string[][]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [linesCleared, setLinesCleared] = useState(0);

  // 추가된 부분: 게임 시작 여부
  const [isGameStarted, setIsGameStarted] = useState(false);

  // 게임 룰 모달 상태
  const [isGameRuleModalOpen, setIsGameRuleModalOpen] = useState(true);

  const closeGameRuleModal = () => {
    setIsGameRuleModalOpen(false);
  };

  /**
   * 추가된 부분: [게임시작] 버튼 클릭 시 호출될 함수
   * - 모달을 닫고
   * - 게임을 시작하도록 isGameStarted를 true로 변경
   */
  const startGame = () => {
    setIsGameRuleModalOpen(false);
    setIsGameStarted(true);
  };

  /**
   * useEffect로 묶는 로직을 isGameStarted === true일 때만 실행.
   * (이전에 바로 실행되던 game.init(), setInterval 등을
   *  startGame()을 호출해야 실행되도록 분리)
   */
  useEffect(() => {
    if (!isGameStarted) return;

    game.init();
    setBoard(game.getBoard());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (game.gameOver) return;

      switch (event.key) {
        case "ArrowLeft":
          game.moveBlock("m", -1);
          break;
        case "ArrowRight":
          game.moveBlock("m", 1);
          break;
        case "ArrowDown":
          game.moveBlock("n", 1);
          break;
        case "ArrowUp":
        case "w":
        case "W":
          game.moveBlock("rotate", 1);
          break;
        // ▼ 스페이스바 누르면 회전
        case " ":
          // 기본적으로 스페이스바가 페이지 스크롤을 내릴 수 있으므로 방지
          event.preventDefault();
          game.moveBlock("rotate", 1);
          break;

        case "s":
        case "S":
          game.moveBlock("n", 1);
          break;
        case "a":
        case "A":
          game.moveBlock("m", -1);
          break;
        case "d":
        case "D":
          game.moveBlock("m", 1);
          break;
      }
      setBoard(game.getBoard());
      setScore(game.score);
      setLevel(game.level);
      setLinesCleared(game.linesCleared);
    };

    window.addEventListener("keydown", handleKeyDown);

    const interval = setInterval(() => {
      if (game.gameOver) {
        setGameOver(true);
        clearInterval(interval);
        return;
      }

      game.moveBlock("n", 1);
      setBoard(game.getBoard());
      setScore(game.score);
      setLevel(game.level);
      setLinesCleared(game.linesCleared);
    }, game.duration);

    // 클린업
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(interval);
    };
  }, [isGameStarted, game]);

  return (
    <div className="min-h-dvh bg-black">
      <BgMusicGlobal src="" />
      <BgMusicButton />
      <OutButton />

      {/* 모달 */}
      {isGameRuleModalOpen && (
        <GameRuleModal
          title="테트리스"
          onClose={closeGameRuleModal}
          /** 추가된 부분 */
          onConfirm={startGame}
          isConfirm
        >
          <p>블록 회전: ↑ 방향키</p>
          <p>블록 빠르게 내리기: ↓ 방향키</p>
        </GameRuleModal>
      )}

      {gameOver && <p>Game Over</p>}

      {/* 게임 정보 */}
      <Score score={score} level={level} linesCleared={linesCleared} />

      {/* 보드 */}
      <Board board={board} />
    </div>
  );
}
