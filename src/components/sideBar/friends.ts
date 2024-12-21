// data/friends.ts

export const friends = Array.from({ length: 30 }, (_, index) => ({
  name: `친구 ${index + 1}`,
  status: index % 2 === 0 ? "참여" : "비참여", // 짝수 인덱스는 참여, 홀수는 비참여
  avatar: `/profile/profile${((index + 1) % 3) + 1}.png`, // profile 이미지 경로
}));
