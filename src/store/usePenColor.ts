import { create } from "zustand";

export type PenColorTypes =
  | "red"
  | "orange"
  | "yellow"
  | "blue"
  | "navy"
  | "violet"
  | "pink"
  | "black"
  | "white";
interface PenColorState {
  penColor: string;
  setPenColor: (penColor: string) => void;
}

const usePenColorStore = create<PenColorState>((set) => ({
  penColor: "white",
  setPenColor: (color) => set({ penColor: color }),
}));

export default usePenColorStore;
