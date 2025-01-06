import { create } from "zustand";

export type PenColorTypes =
  | "red"
  | "orange"
  | "yellow"
  | "lightGreen"
  | "blue"
  | "black";

interface PenColorState {
  penColor: string;
  setPenColor: (penColor: string) => void;
}

const usePenColorStore = create<PenColorState>((set) => ({
  penColor: "black",
  setPenColor: (color) => set({ penColor: color }),
}));

export default usePenColorStore;
