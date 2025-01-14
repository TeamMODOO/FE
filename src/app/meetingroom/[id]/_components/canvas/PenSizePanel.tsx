"use client";

import { useEffect, useState } from "react";

import { fabric } from "fabric";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import useCanvasStore from "@/store/useCanvasStore";
import usePenColorStore, { PenColorTypes } from "@/store/usePenColor";

import { COLOR_CODE } from "../../_constant";

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
      <PopoverTrigger
        asChild
        className="bg-[rgba(100,100,100,0.6)] hover:!bg-[rgba(100,100,100,1)]
      text-white border-1 border-[rgba(201,189,188,1)]"
      >
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
      <PopoverContent className="w-auto p-4 bg-[rgba(100,100,100,0.9)] border-2 border-[rgba(201,189,188,1)] ml-[0.7rem]">
        <div className="flex flex-col gap-2">
          <span className="text-center text-xl text-[rgba(201,189,188,1)]">
            펜 크기: {penSize}
          </span>
          <Slider
            min={1}
            max={50}
            step={1}
            value={[penSize]}
            onValueChange={(value) => setPenSize(value[0])}
            className={`
              w-full min-w-[200px]
          
              // Track (가장 첫 div)
              [&>span]:bg-[rgba(50,50,50,0.6)]
          
              // Range (track 내부의 div)
              [&>span>span]:bg-yellow-500
            `}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PenSizePanel;
