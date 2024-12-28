// /src/app/quest/complete/page.tsx
import styles from "./QuestComplete.module.css";

export default function Complete() {
  return (
    <div className={styles.container}>
      {/* 흰색 오버레이 (처음 2초간 하얗게 덮고, 애니메이션으로 서서히 사라짐) */}
      <div className={styles.whiteOverlay} />
    </div>
  );
}
