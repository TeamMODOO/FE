type PopupProps = {
  onRestart: () => void; // 재시작 함수
};

const Popup: React.FC<PopupProps> = ({ onRestart }) => {
  return (
    <div className="popup">
      <p>Game Over</p>
      <button onClick={onRestart}>Restart</button>
    </div>
  );
};

export default Popup;
