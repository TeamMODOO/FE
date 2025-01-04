// src/app/quest/utils/getRandomQuestNumber.ts

// 가져올 수 있는 문제 번호들
const QUEST_NUMBERS = [8983, 11725, 14888, 2294, 2748];

// 시드 값을 바탕으로 난수를 생성해주는 함수
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * 오늘 날짜(일자)를 시드로 사용하여
 * QUEST_NUMBERS 중 하나를 랜덤으로 반환
 */
export function getRandomQuestNumber(): number {
  const today = new Date();
  const day = today.getDate(); // 1~31
  const rand = seededRandom(day);
  const index = Math.floor(rand * QUEST_NUMBERS.length);

  return QUEST_NUMBERS[index];
}
