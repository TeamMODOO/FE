"use client";

import { useEffect, useState } from "react";

import { fabric } from "fabric";
import { Eraser, Hand, Pencil, Redo, Undo } from "lucide-react";

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
import PenSizePanel from "./PenSizePanel";

const Toolbar = () => {
  const activeTool = useToolStore((state) => state.activeTool);
  const setActiveTool = useToolStore((state) => state.setActiveTool);
  const canvas = useCanvasStore((state) => state.canvasInstance);

  // 실행 취소를 위한 상태 관리
  const [isLocked, setIsLocked] = useState(false);
  const [history, setHistory] = useState<fabric.Object[]>([]);

  const setIsObjectSelectable = (isSelectable: boolean) => {
    if (!(canvas instanceof fabric.Canvas)) return;
    canvas.forEachObject((object) => (object.selectable = isSelectable));
  };

  const resetCanvasOption = () => {
    if (!(canvas instanceof fabric.Canvas)) return;
    setIsObjectSelectable(false);
    canvas.isDrawingMode = false;
    canvas.selection = false;
    //canvas.defaultCursor = "default";
  };

  const saveHistory = () => {
    if (!isLocked) {
      setHistory([]);
    }
    setIsLocked(false);
  };

  const handlePen = () => {
    if (!(canvas instanceof fabric.Canvas)) return;
    canvas.freeDrawingBrush.width = 10;
    canvas.isDrawingMode = true;
    canvas.freeDrawingCursor = `url('/svg/pen.svg') 2.5 12.5, auto`;
  };

  const handleEraser = () => {
    if (!(canvas instanceof fabric.Canvas)) return;

    setIsObjectSelectable(true);
    canvas.selection = true;
    // 커서 변경
    canvas.defaultCursor = `url('/svg/eraser.svg') 8 11, auto`;
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

  // 데이터 보내야함
  const handleUndoClick = () => {
    if (canvas && canvas._objects.length > 0) {
      const poppedObject = canvas._objects.pop();
      if (poppedObject) {
        setHistory((prev) => [...prev, poppedObject]);
        canvas.renderAll();
      }
    }
  };

  // 데이터 보내야함
  const handleRedoClick = () => {
    if (canvas && history) {
      if (history.length > 0) {
        setIsLocked(true);
        canvas.add(history[history.length - 1]);
        const newHistory = history.slice(0, -1);
        setHistory(newHistory);
      }
    }
  };

  useEffect(() => {
    if (!(canvas instanceof fabric.Canvas)) return;
    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");
    canvas.off("selection:created");

    resetCanvasOption();

    switch (activeTool) {
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

  useEffect(() => {
    if (canvas) {
      canvas.on("object:added", saveHistory);
      canvas.on("object:modified", saveHistory);
      canvas.on("object:removed", saveHistory);

      return () => {
        canvas.off("object:added", saveHistory);
        canvas.off("object:modified", saveHistory);
        canvas.off("object:removed", saveHistory);
      };
    }
  }, [canvas]);

  useEffect(() => {
    if (!activeTool) setActiveTool("pen");
  }, []);

  return (
    <TooltipProvider>
      <div className="absolute left-2.5 top-2.5 w-[60px]">
        <div className="bg-grayscale-lightgray border-grayscale-lightgray flex w-auto flex-col items-center justify-center gap-2 rounded-xl border p-2 shadow-md">
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

          {activeTool === "pen" && (
            <>
              <ColorPanel />
              <PenSizePanel />
            </>
          )}
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

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUndoClick}
                disabled={!canvas || canvas._objects.length === 0}
              >
                <Undo className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRedoClick}
                disabled={!canvas || history.length === 0}
              >
                <Redo className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>다시 실행</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Toolbar;
