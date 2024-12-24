// solvedacProblems.ts

// 각 문제에 대한 인터페이스 예시
export interface SolvedacProblem {
  id: number; // 백준 문제 번호
  title: string; // 문제 제목
  solvedAcClass: 2 | 3 | 4 | 5; // 클래스 (2, 3, 4, 5 중 하나)
  // 필요하다면 난이도 별점, 태그 등 추가 가능
}

// 클래스 2 문제 (확장된 샘플)
export const CLASS2_PROBLEMS: SolvedacProblem[] = [
  {
    id: 1018,
    title: "체스판 다시 칠하기",
    solvedAcClass: 2,
  },
  {
    id: 1259,
    title: "녹색 옷 입은 애가 젤다지?",
    solvedAcClass: 2,
  },
  {
    id: 2231,
    title: "분해합",
    solvedAcClass: 2,
  },
  {
    id: 1929,
    title: "소수 구하기",
    solvedAcClass: 2,
  },
  {
    id: 2839,
    title: "설탕 배달",
    solvedAcClass: 2,
  },
  {
    id: 2775,
    title: "부녀회장이 될테야",
    solvedAcClass: 2,
  },
  {
    id: 10250,
    title: "ACM 호텔",
    solvedAcClass: 2,
  },
  {
    id: 15829,
    title: "Hashing",
    solvedAcClass: 2,
  },
  {
    id: 2309,
    title: "일곱 난쟁이",
    solvedAcClass: 2,
  },
  {
    id: 10989,
    title: "수 정렬하기 3",
    solvedAcClass: 2,
  },
  {
    id: 10814,
    title: "나이순 정렬",
    solvedAcClass: 2,
  },
  {
    id: 10828,
    title: "스택",
    solvedAcClass: 2,
  },
  {
    id: 2609,
    title: "최대공약수와 최소공배수",
    solvedAcClass: 2,
  },
  {
    id: 18870,
    title: "좌표 압축",
    solvedAcClass: 2,
  },
  {
    id: 4949,
    title: "균형잡힌 세상",
    solvedAcClass: 2,
  },
  {
    id: 5086,
    title: "배수와 약수",
    solvedAcClass: 2,
  },
  {
    id: 2798,
    title: "블랙잭",
    solvedAcClass: 2,
  },
  {
    id: 11050,
    title: "이항 계수 1",
    solvedAcClass: 2,
  },
  {
    id: 9012,
    title: "괄호",
    solvedAcClass: 2,
  },
  {
    id: 10845,
    title: "큐",
    solvedAcClass: 2,
  },
];

// 클래스 3 문제 (확장된 샘플)
export const CLASS3_PROBLEMS: SolvedacProblem[] = [
  {
    id: 11399,
    title: "ATM",
    solvedAcClass: 3,
  },
  {
    id: 15649,
    title: "N과 M (1)",
    solvedAcClass: 3,
  },
  {
    id: 2579,
    title: "계단 오르기",
    solvedAcClass: 3,
  },
  {
    id: 1463,
    title: "1로 만들기",
    solvedAcClass: 3,
  },
  {
    id: 11724,
    title: "연결 요소의 개수",
    solvedAcClass: 3,
  },
  {
    id: 2606,
    title: "바이러스",
    solvedAcClass: 3,
  },
  {
    id: 2667,
    title: "단지번호붙이기",
    solvedAcClass: 3,
  },
  {
    id: 11047,
    title: "동전 0",
    solvedAcClass: 3,
  },
  {
    id: 11726,
    title: "2×n 타일링",
    solvedAcClass: 3,
  },
  {
    id: 11727,
    title: "2×n 타일링 2",
    solvedAcClass: 3,
  },
  {
    id: 1932,
    title: "정수 삼각형",
    solvedAcClass: 3,
  },
  {
    id: 1003,
    title: "피보나치 함수",
    solvedAcClass: 3,
  },
];

// 클래스 4 문제 (확장된 샘플)
export const CLASS4_PROBLEMS: SolvedacProblem[] = [
  {
    id: 1967,
    title: "트리의 지름",
    solvedAcClass: 4,
  },
  {
    id: 9095,
    title: "1, 2, 3 더하기",
    solvedAcClass: 4,
  },
  {
    id: 9251,
    title: "LCS",
    solvedAcClass: 4,
  },
  {
    id: 7576,
    title: "토마토",
    solvedAcClass: 4,
  },
  {
    id: 12865,
    title: "평범한 배낭",
    solvedAcClass: 4,
  },
  {
    id: 16236,
    title: "아기 상어",
    solvedAcClass: 4,
  },
  {
    id: 1918,
    title: "후위 표기식",
    solvedAcClass: 4,
  },
  {
    id: 5014,
    title: "스타트링크",
    solvedAcClass: 4,
  },
  {
    id: 2573,
    title: "빙산",
    solvedAcClass: 4,
  },
  {
    id: 11404,
    title: "플로이드",
    solvedAcClass: 4,
  },
  {
    id: 1707,
    title: "이분 그래프",
    solvedAcClass: 4,
  },
  {
    id: 1717,
    title: "집합의 표현",
    solvedAcClass: 4,
  },
  {
    id: 1753,
    title: "최단경로",
    solvedAcClass: 4,
  },
];

// 클래스 5 문제 (확장된 샘플)
export const CLASS5_PROBLEMS: SolvedacProblem[] = [
  {
    id: 2150,
    title: "Strongly Connected Component",
    solvedAcClass: 5,
  },
  {
    id: 13549,
    title: "숨바꼭질 3",
    solvedAcClass: 5,
  },
  {
    id: 1167,
    title: "트리의 지름",
    solvedAcClass: 5,
  },
  {
    id: 2263,
    title: "트리의 순회",
    solvedAcClass: 5,
  },
  {
    id: 13913,
    title: "숨바꼭질 4",
    solvedAcClass: 5,
  },
  {
    id: 17070,
    title: "파이프 옮기기 1",
    solvedAcClass: 5,
  },
  {
    id: 12851,
    title: "숨바꼭질 2",
    solvedAcClass: 5,
  },
  {
    id: 2638,
    title: "치즈",
    solvedAcClass: 5,
  },
  {
    id: 1520,
    title: "내리막 길",
    solvedAcClass: 5,
  },
  {
    id: 1937,
    title: "욕심쟁이 판다",
    solvedAcClass: 5,
  },
  {
    id: 14938,
    title: "서강그라운드",
    solvedAcClass: 5,
  },
  {
    id: 1915,
    title: "가장 큰 정사각형",
    solvedAcClass: 5,
  },
];

// 모든 문제를 합쳐서 export할 수도 있음
export const SOLVEDAC_CLASS_2_3_4_5: SolvedacProblem[] = [
  ...CLASS2_PROBLEMS,
  ...CLASS3_PROBLEMS,
  ...CLASS4_PROBLEMS,
  ...CLASS5_PROBLEMS,
];
