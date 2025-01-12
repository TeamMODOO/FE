// import styles from "../styles/Board.module.css";
import styles from "../tetris/Board.module.css";

type BoardProps = {
  board: string[][];
};

const Board: React.FC<BoardProps> = ({ board }) => {
  return (
    <table className={styles.board}>
      <tbody>
        {board.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                className={
                  cell === "active"
                    ? styles.active
                    : cell === "fixed"
                      ? styles.fixed
                      : ""
                }
              ></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Board;
