"use client";

import { fabric } from "fabric";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import useCanvasStore from "@/store/useCanvasStore";
import usePenColorStore, { PenColorTypes } from "@/store/usePenColor";

import { COLOR_CODE } from "../_constant";

const PenSizePanel = () => {
  const canvas = useCanvasStore((state) => state.canvasInstance);
  const [penSize, setPenSize] = useState(10);
  const penColor = usePenColorStore((state) => state.penColor);

  useEffect(() => {
    if (!(canvas instanceof fabric.Canvas)) return;
    canvas.freeDrawingBrush.width = penSize;
  }, [penSize, canvas]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="size-10 p-0">
          <div
            className="rounded-full bg-black"
            style={{
              width: `${penSize}px`,
              height: `${penSize}px`,
              backgroundColor: COLOR_CODE[penColor as PenColorTypes],
            }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="flex flex-col gap-2">
          <span className="text-center text-sm">펜 크기: {penSize}</span>
          <Slider
            min={1}
            max={50}
            step={1}
            value={[penSize]}
            onValueChange={(value) => setPenSize(value[0])}
            className="w-full min-w-[200px]"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PenSizePanel;
