// tetrisLogic.ts

import blocks from "./blocks";

export class Tetris {
  N: number;
  M: number;
  score: number;
  level: number;
  duration: number;
  linesCleared: number; // 총 삭제된 라인 수
  movingBlock?: { type: string; direction: number; n: number; m: number };
  nextBlocks: string[];
  board: string[][];
  gameOver: boolean;

  constructor() {
    this.N = 20; // 보드 세로 길이
    this.M = 10; // 보드 가로 길이
    this.score = 0;
    this.level = 1;
    this.duration = 1000;
    this.linesCleared = 0;
    this.nextBlocks = [];
    this.board = this.createEmptyBoard();
    this.gameOver = false; // 게임 종료 상태
  }

  // 게임 초기화
  init(): void {
    this.score = 0;
    this.level = 1;
    this.duration = 1000;
    this.linesCleared = 0;
    this.board = this.createEmptyBoard();
    this.nextBlocks = [];
    this.gameOver = false;

    for (let i = 0; i < 4; i++) {
      this.makeNextBlock();
    }
    this.makeNewBlock();
  }

  // 빈 보드 생성
  createEmptyBoard(): string[][] {
    return Array.from({ length: this.N }, () => Array(this.M).fill(""));
  }

  // 점수 및 레벨 계산
  updateScore(clearedLines: number): void {
    const lineScoreMap = [0, 40, 100, 300, 1200]; // 삭제된 줄 수에 따른 점수 배수
    const baseScore = lineScoreMap[clearedLines] || 0;

    this.score += baseScore * (this.level + 1); // 레벨 기반 점수 계산
    this.linesCleared += clearedLines; // 총 삭제된 줄 수 업데이트

    // 레벨 업: 10줄 삭제마다 레벨 증가
    if (this.linesCleared >= this.level * 10) {
      this.level++;
      this.duration = Math.max(200, this.duration - 100); // 레벨 증가 시 속도 감소 (최소 200ms)
    }
  }

  // 보드 데이터를 반환
  getBoard(): string[][] {
    return this.board.map((row) => [...row]); // 보드의 복사본 반환
  }

  // 다음 블록 생성 (추가된 함수)
  makeNextBlock(): void {
    const blockArray = Object.keys(blocks);
    const randomIndex = Math.floor(Math.random() * blockArray.length);
    this.nextBlocks.push(blockArray[randomIndex]);
  }

  // 새 블록 생성
  makeNewBlock(): void {
    if (!this.nextBlocks.length) {
      this.makeNextBlock();
    }

    const next = this.nextBlocks.shift();
    if (!next) {
      throw new Error("Failed to create new block.");
    }

    this.movingBlock = {
      type: next,
      direction: 0,
      n: 0,
      m: Math.floor(this.M / 2) - 2,
    };

    if (
      this.isColliding(
        this.movingBlock.n,
        this.movingBlock.m,
        this.movingBlock.direction,
      )
    ) {
      this.gameOver = true; // 게임 종료 상태 업데이트
      return; // 새 블록을 만들지 않고 종료
    }

    this.renderBlock();
    this.makeNextBlock(); // 다음 블록 큐에 새로운 블록 추가
  }

  // 충돌 감지
  isColliding(n: number, m: number, direction: number): boolean {
    const type = this.movingBlock?.type || "";
    return blocks[type][direction].some(([x, y]) => {
      const newX = n + y; // y와 x를 바꿔야 할 수 있음
      const newY = m + x;
      return (
        newX < 0 ||
        newX >= this.N ||
        newY < 0 ||
        newY >= this.M ||
        this.board[newX][newY] === "fixed"
      );
    });
  }

  // 블록 렌더링
  renderBlock(): void {
    if (!this.movingBlock) return;

    const { type, direction, n, m } = this.movingBlock;

    // 기존 active 블록 제거
    this.clearMovingBlock();

    const isColliding = this.isColliding(n, m, direction);

    if (isColliding) {
      this.finishBlock(); // 충돌 시 현재 블록 고정
      return;
    }

    // 이동 중인 블록 렌더링
    blocks[type][direction].forEach(([x, y]) => {
      const newX = n + y; // y와 x를 바꿔야 할 수 있음
      const newY = m + x;
      if (this.board[newX]) {
        this.board[newX][newY] = "active";
      }
    });
  }

  // 기존 블록 제거
  clearMovingBlock(): void {
    this.board = this.board.map(
      (row) => row.map((cell) => (cell === "active" ? "" : cell)), // active만 제거
    );
  }

  // 블록 고정
  finishBlock(): void {
    if (!this.movingBlock) return;

    const { type, direction, n, m } = this.movingBlock;

    // 현재 블록을 고정 상태로 설정
    blocks[type][direction].forEach(([x, y]) => {
      const newX = n + y; // y와 x를 바꿔야 할 수 있음
      const newY = m + x;

      // 유효한 좌표인지 확인 후 고정
      if (this.board[newX]) {
        this.board[newX][newY] = "fixed";
      }
    });

    this.checkFullLines(); // 가득 찬 줄 제거
    this.makeNewBlock(); // 새로운 블록 생성
  }

  // 완전히 채워진 줄 제거 및 점수 계산
  checkFullLines(): void {
    const newBoard = this.board.filter(
      (row) => !row.every((cell) => cell === "fixed"),
    ); // 고정된 블록으로 가득 찬 줄 제외
    const clearedLines = this.board.length - newBoard.length; // 삭제된 줄 수 계산

    // 삭제된 줄만큼 새로운 빈 줄 추가
    for (let i = 0; i < clearedLines; i++) {
      newBoard.unshift(Array(this.M).fill(""));
    }

    this.board = newBoard;

    // 점수 계산 및 업데이트
    if (clearedLines > 0) {
      this.updateScore(clearedLines);
    }
  }

  // 블록 이동
  moveBlock(where: "n" | "m" | "rotate", amount: number): void {
    if (!this.movingBlock) return;

    const nextPosition = { ...this.movingBlock };

    if (where === "rotate") {
      nextPosition.direction = (this.movingBlock.direction + amount + 4) % 4; // 방향을 0~3 사이로 유지
    } else {
      nextPosition[where] += amount;
    }

    // 충돌 감지
    if (
      this.isColliding(nextPosition.n, nextPosition.m, nextPosition.direction)
    ) {
      if (where === "n") {
        this.finishBlock(); // 아래로 이동 중 충돌 시 블록 고정
      }
      return;
    }

    // 이동 허용
    if (where === "rotate") {
      this.movingBlock.direction = nextPosition.direction; // 회전 적용
    } else {
      this.movingBlock[where] += amount; // 이동 적용
    }

    this.renderBlock();
  }
}
