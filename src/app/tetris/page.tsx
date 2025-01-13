"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import AlertModal from "@/components/alertModal/AlertModal"; // <-- AlertModal 임포트
import { BgMusicButton } from "@/components/bgMusic/BgMusicButton";
import { BgMusicGlobal } from "@/components/bgMusic/BgMusicGlobal";
import GameRuleModal from "@/components/gameRuleModal/GameRuleModal";
import { OutButton } from "@/components/outButton/OutButton";
import { Tetris } from "@/utils/tetrisLogic";

import Board from "../../components/tetris/Board";
import Score from "../../components/tetris/Score";

import styles from "./Tetris.module.css";

export default function Home() {
  const router = useRouter();

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
        case " ":
          event.preventDefault(); // 스페이스바 기본 스크롤 방지
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

  /**
   * Game Over 시 띄울 AlertModal
   * - 닫기 버튼 없이(noCloseBtn), ESC로도 안 닫힘
   * - [나가기] 버튼 누르면 /lobby로
   */
  const handleCloseGameOverModal = () => {
    // 필요하다면 여기서 다른 후처리 로직
    router.push("/lobby");
  };

  return (
    <div className="flex h-full flex-col items-center justify-center overflow-hidden bg-black">
      <BgMusicGlobal src="/sounds/tetris.wav" />
      <BgMusicButton />
      <OutButton />

      {/* 게임 룰 모달 */}
      {isGameRuleModalOpen && (
        <GameRuleModal
          title="테트리스"
          onClose={closeGameRuleModal}
          onConfirm={startGame}
          isConfirm
        >
          <p>블록 회전: ↑ 방향키 (또는 W / 스페이스바)</p>
          <p>블록 빠르게 내리기: ↓ 방향키 (또는 S)</p>
        </GameRuleModal>
      )}

      {/* GameOver 시 AlertModal 표시 */}
      {gameOver && (
        <AlertModal
          title="Game Over"
          // 닫기 버튼 X, ESC로도 닫기 X
          noCloseBtn
          onClose={() => {
            // 모달 자체를 강제로 닫지는 않지만,
            // 여기서는 onClose가 결국 [아니오] 버튼이나 ESC에 연동될 수 있음.
            // noCloseBtn이기 때문에 ESC도 안 먹히고 닫기 버튼도 없음.
            // 혹시 "확인 모달" 형태가 필요하면 isConfirm={true}를 써도 됩니다.
          }}
        >
          <div className="my-4 text-center text-lg text-white">
            <p>최종 스코어: {score}</p>
            <p>레벨: {level}</p>
            <p>클리어 한 라인: {linesCleared}</p>
          </div>
          <div className="flex w-full justify-center">
            <button
              onClick={handleCloseGameOverModal}
              className="rounded-md bg-gray-700 px-4 py-2 text-white"
            >
              나가기
            </button>
          </div>
        </AlertModal>
      )}

      <div className="flex items-center justify-center gap-3 pt-8">
        {/* 배경 반딧불이 애니메이션 */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className={styles.floatingSquare}></div>
        ))}

        {/* 보드 */}
        <Board board={board} />

        {/* 게임 정보 */}
        {isGameStarted && (
          <Score score={score} level={level} linesCleared={linesCleared} />
        )}
      </div>
    </div>
  );
}
