"use client";

import { useEffect, useState } from "react";

import { BgMusicButton } from "@/components/bgMusic/BgMusicButton";
import { BgMusicGlobal } from "@/components/bgMusic/BgMusicGlobal";
import { OutButton } from "@/components/outButton/OutButton";
import { Tetris } from "@/utils/tetrisLogic";

import Board from "../../components/tetris/Board";
import Score from "../../components/tetris/Score";

export default function Home() {
  const [game] = useState<Tetris>(new Tetris());
  const [board, setBoard] = useState<string[][]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1); // 레벨 초기값 1
  const [linesCleared, setLinesCleared] = useState(0); // 삭제된 라인 수 초기값 0

  useEffect(() => {
    game.init();
    setBoard(game.getBoard());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (game.gameOver) return;

      switch (event.key) {
        case "ArrowLeft":
          game.moveBlock("m", -1); // 왼쪽 이동
          break;
        case "ArrowRight":
          game.moveBlock("m", 1); // 오른쪽 이동
          break;
        case "ArrowDown":
          game.moveBlock("n", 1); // 아래로 빠르게 이동
          break;
        case "ArrowUp":
          game.moveBlock("rotate", 1); // 블록 회전
          break;
        case "w":
          game.moveBlock("rotate", 1); // 블록 회전
          break;
        case "W":
          game.moveBlock("rotate", 1); // 블록 회전
          break;
        case "s":
          game.moveBlock("n", 1); // 아래로 이동
          break;
        case "S":
          game.moveBlock("n", 1); // 아래로 이동
          break;
        case "a":
          game.moveBlock("m", -1); // 왼쪽 이동
          break;
        case "A":
          game.moveBlock("m", -1); // 왼쪽 이동
          break;
        case "d":
          game.moveBlock("m", 1); // 오른쪽 이동
          break;
        case "D":
          game.moveBlock("m", 1); // 오른쪽 이동
          break;
      }
      setBoard(game.getBoard()); // 이동 후 보드 상태 업데이트
      setScore(game.score); // 점수 업데이트
      setLevel(game.level); // 레벨 업데이트
      setLinesCleared(game.linesCleared); // 삭제된 라인 수 업데이트
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

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(interval);
    };
  }, [game]);

  return (
    <div className="min-h-dvh bg-black">
      <BgMusicGlobal src="" />
      <BgMusicButton />
      <OutButton />
      {gameOver && <p>Game Over</p>}
      <Score score={score} level={level} linesCleared={linesCleared} />
      <Board board={board} />
    </div>
  );
}
