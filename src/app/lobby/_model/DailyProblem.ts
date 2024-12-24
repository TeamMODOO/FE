export interface DailyProblemProps {
  dailyProblem: {
    id: number;
    title: string;
    link: string;
  } | null;
  isProblemSolved: boolean;
  handleSolveDailyProblem: () => void;
}
