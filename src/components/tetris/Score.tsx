type ScoreProps = {
  score: number;
  level: number;
  linesCleared: number;
};

const Score: React.FC<ScoreProps> = ({ score, level, linesCleared }) => {
  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <p>Score: {score}</p>
      <p>Level: {level}</p>
      <p>Lines Cleared: {linesCleared}</p>
    </div>
  );
};

export default Score;
