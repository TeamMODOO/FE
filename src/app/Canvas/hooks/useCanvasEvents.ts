import { fabric } from "fabric";
import { useCallback, useEffect } from "react";

const MAX_ZOOM = 20;
const MIN_ZOOM = 0.01;

export const useCanvasEvents = (canvas: fabric.Canvas | null) => {
  const handleZoom = useCallback(
    (fabricCanvas: fabric.Canvas, event: WheelEvent) => {
      const delta = event.deltaY;
      let zoom = fabricCanvas.getZoom();
      zoom *= 0.999 ** delta;

      // 줌 범위 제한
      zoom = Math.min(Math.max(zoom, MIN_ZOOM), MAX_ZOOM);

      fabricCanvas.zoomToPoint({ x: event.offsetX, y: event.offsetY }, zoom);

      event.preventDefault();
      event.stopPropagation();
    },
    [],
  );

  const handleDelete = useCallback(
    (event: KeyboardEvent) => {
      if (!canvas) return;

      const isDeleteKey =
        event.key === "Delete" ||
        event.code === "Delete" ||
        event.key === "Backspace" ||
        event.code === "Backspace";

      if (!isDeleteKey) return;

      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length === 0) return;

      // 선택된 객체들 삭제
      activeObjects.forEach((obj) => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
    },
    [canvas],
  );

  useEffect(() => {
    if (!canvas) return;

    canvas.on("mouse:wheel", (opt) => handleZoom(canvas, opt.e));
    window.addEventListener("keyup", handleDelete);

    return () => {
      canvas.off("mouse:wheel");
      window.removeEventListener("keyup", handleDelete);
    };
  }, [canvas, handleZoom, handleDelete]);
};
