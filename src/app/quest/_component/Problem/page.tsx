import Image from "next/image";

import styles from "./Problem.module.css";

interface ProblemProps {
  isStart: boolean;
  qNum: string;
  qTitle: string;
  qProblem: string;
  qInput: string;
  qOutput: string;
}

export default function Problem({
  isStart,
  qNum,
  qTitle,
  qProblem,
  qInput,
  qOutput,
}: ProblemProps) {
  return (
    <div className={styles.container}>
      {/* 아직 시작 전 */}
      <div
        className={styles.hideProblem}
        style={{ display: isStart ? "none" : "flex" }}
      >
        <section className={styles.hideBody}>
          <Image src="/etc/locked.webp" alt="locked" width={367} height={392} />
          <p>우측 상단의 [문제 풀이 시작] 버튼을 클릭하세요.</p>
        </section>
      </div>

      {/* 문제 풀이 시작 후 */}
      <div
        className={styles.showProblem}
        style={{ display: isStart ? "flex" : "none" }}
      >
        <section className={styles.problemSection}>
          <p className={styles.title}>{`${qNum}: ${qTitle}`}</p>
          {/* 문제 설명 */}
          <p>{qProblem}</p>
        </section>

        <section className={styles.inputSection}>
          <p className={styles.title}>입력</p>
          <p>{qInput}</p>
        </section>

        <section className={styles.outputSection}>
          <p className={styles.title}>출력</p>
          <p>{qOutput}</p>
        </section>
      </div>
    </div>
  );
}
