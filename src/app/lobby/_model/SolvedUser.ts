export interface SolvedUser {
  userId: string;
  nickname: string;
  solvedProblemId: number;
  solvedDate: string;
}

export interface SolvedUsersProps {
  dailySolvedUsers: SolvedUser[];
  getTodayString: () => string;
}
