// // /src/app/questmap/_components/RankingModal/RankingModal.tsx

// "use client";

// import styles from "./NeedSignIn.module.css";

// interface NeedSignInModalProps {
//   onClose: () => void;
// }

// export default function NeedSignInModal() {
//   return (
//     <div className={styles.overlay}>
//       <div className={styles.modal}>
//         <button className={styles.closeBtn} onClick={onClose}>
//           X
//         </button>
//         <div className={styles.modalHeader}>
//           <p className={styles.modalTitle}>로그인이 필요한 서비스 입니다!</p>
//         </div>

//         <div className={styles.modalContent}>
//           {/* 헤더 */}
//           <div className={styles.rankingItem}>
//             <p>랭킹</p>
//             <p>닉네임</p>
//             <p>소요시간</p>
//           </div>

//           {/* 2. 로딩 상태 표시 */}
//           {loading && (
//             <div className={styles.rankingItem}>
//               <p>로딩 중...</p>
//             </div>
//           )}

//           {/* 3. 에러 표시 */}
//           {error && (
//             <div className={styles.rankingItem}>
//               <p>에러가 발생했습니다: {error}</p>
//             </div>
//           )}

//           {/* 4. 데이터가 있을 때 표시 */}
//           {data &&
//             data.map((result, idx) => (
//               <div className={styles.rankingItem} key={result.id}>
//                 <p>{idx + 1}</p> {/* 랭킹(순위) */}
//                 <p>{result.user_name}</p>
//                 <p>{result.time_taken}</p>
//               </div>
//             ))}
//         </div>
//       </div>
//     </div>
//   );
// }
