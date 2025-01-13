type ScoreProps = {
  score: number;
  level: number;
  linesCleared: number;
};

const Score: React.FC<ScoreProps> = ({ score, level, linesCleared }) => {
  return (
    <div className="flex flex-col gap-2">
      <img src="/logo/logo_tetris.png" alt="tetris-logo" width={300} />
      <div className="flex flex-col items-baseline rounded-xl border-2 border-gray-400 p-4 text-lg text-white">
        <p>현재 스코어: {score}</p>
      </div>
      <div className="flex flex-col items-baseline justify-center rounded-xl border-2 border-gray-400 p-4 text-lg text-white">
        <p>레벨: {level}</p>
      </div>
      <div className="flex flex-col items-baseline justify-center rounded-xl border-2 border-gray-400 p-4 text-lg text-white">
        <p>클리어 한 라인: {linesCleared}</p>
      </div>
    </div>
  );
};

export default Score;
