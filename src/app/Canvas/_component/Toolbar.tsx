"use client";

import { fabric } from "fabric";
import { Eraser, Hand, Mouse, Pencil } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useCanvasStore from "@/store/useCanvasStore";
import useToolStore from "@/store/useToolStore";

import ColorPanel from "./ColorPanel";

const Toolbar = () => {
  const activeTool = useToolStore((state) => state.activeTool);
  const setActiveTool = useToolStore((state) => state.setActiveTool);
  const canvas = useCanvasStore((state) => state.canvasInstance);

  /**
   * @description 화이트 보드에 그려져 있는 요소들을 클릭을 통해 선택 가능한지 여부를 제어하기 위한 함수입니다.
   */
  const setIsObjectSelectable = (isSelectable: boolean) => {
    if (!(canvas instanceof fabric.Canvas)) return;
    canvas.forEachObject((object) => (object.selectable = isSelectable));
  };

  /**
   * @description 캔버스의 옵션을 리셋하는 함수입니다.
   * @description 그래픽 요소 선택 기능: off, 드로잉 모드: off, 드래그 블럭지정모드: off, 커서: 디폴트 포인터
   */
  const resetCanvasOption = () => {
    if (!(canvas instanceof fabric.Canvas)) return;
    setIsObjectSelectable(false);
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = "default";
  };

  const handleSelect = () => {
    if (!(canvas instanceof fabric.Canvas)) return;

    setIsObjectSelectable(true);
    canvas.selection = true;
    canvas.defaultCursor = "default";
  };

  const handlePen = () => {
    if (!(canvas instanceof fabric.Canvas)) return;

    canvas.freeDrawingBrush.width = 10;
    canvas.isDrawingMode = true;
  };

  const handleEraser = () => {
    if (!(canvas instanceof fabric.Canvas)) return;

    setIsObjectSelectable(true);
    canvas.selection = true;

    canvas.defaultCursor = "crosshair";

    const handleMouseUp = (target: fabric.Object | undefined) => {
      if (!target) return;
      canvas.remove(target);
    };

    const handleSelectionCreated = (selected: fabric.Object[] | undefined) => {
      if (activeTool === "eraser") {
        selected?.forEach((object) => canvas.remove(object));
      }
      canvas.discardActiveObject().renderAll();
    };

    canvas.on("mouse:up", ({ target }) => handleMouseUp(target));

    canvas.on("selection:created", ({ selected }) =>
      handleSelectionCreated(selected),
    );
  };

  const handleHand = () => {
    if (!(canvas instanceof fabric.Canvas)) return;

    canvas.defaultCursor = "move";

    let panning = false;
    const handleMouseDown = () => {
      panning = true;
    };
    const handleMouseMove = (event: fabric.IEvent<MouseEvent>) => {
      if (panning) {
        const delta = new fabric.Point(event.e.movementX, event.e.movementY);
        canvas.relativePan(delta);
      }
    };
    const handleMouseUp = () => {
      panning = false;
    };
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
  };

  useEffect(() => {
    if (!(canvas instanceof fabric.Canvas)) return;
    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");
    canvas.off("selection:created");

    resetCanvasOption();

    switch (activeTool) {
      case "select":
        handleSelect();
        break;

      case "pen":
        handlePen();
        break;

      case "eraser":
        handleEraser();
        break;

      case "hand":
        handleHand();
        break;
    }
  }, [activeTool]);

  return (
    <TooltipProvider>
      <div className="absolute left-2.5 top-2.5 w-[60px]">
        <div className="bg-grayscale-lightgray border-grayscale-lightgray flex w-auto flex-col items-center justify-center gap-2 rounded-xl border p-2 shadow-md">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "select" ? "default" : "ghost"}
                size="icon"
                onClick={() => setActiveTool("select")}
              >
                <Mouse className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Select Tool</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "pen" ? "default" : "ghost"}
                size="icon"
                onClick={() => setActiveTool("pen")}
              >
                <Pencil className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Pen Tool</TooltipContent>
          </Tooltip>

          {activeTool === "pen" && <ColorPanel />}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "eraser" ? "default" : "ghost"}
                size="icon"
                onClick={() => setActiveTool("eraser")}
              >
                <Eraser className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Eraser Tool</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "hand" ? "default" : "ghost"}
                size="icon"
                onClick={() => setActiveTool("hand")}
              >
                <Hand className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Hand Tool</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Toolbar;
