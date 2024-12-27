import { fabric } from "fabric";
import { create } from "zustand";

interface CanvasState {
  canvasInstance: fabric.Canvas | null;
  setCanvasInstance: (canvas: fabric.Canvas | null) => void;
}

const useCanvasStore = create<CanvasState>((set) => ({
  canvasInstance: null,
  setCanvasInstance: (canvas) => set({ canvasInstance: canvas }),
}));

export default useCanvasStore;
