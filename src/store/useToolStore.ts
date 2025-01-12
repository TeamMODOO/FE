import { create } from "zustand";

type ToolType = "" | "select" | "pen" | "eraser" | "hand";

interface ToolState {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

const useToolStore = create<ToolState>((set) => ({
  activeTool: "",
  setActiveTool: (tool) => set({ activeTool: tool }),
}));

export default useToolStore;
