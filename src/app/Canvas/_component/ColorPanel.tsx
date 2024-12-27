"use client";

import { fabric } from "fabric";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useCanvasStore from "@/store/useCanvasStore";

import { COLOR_CODE } from "../constant/colorCode";

type PenColorTypes =
  | "red"
  | "orange"
  | "yellow"
  | "lightGreen"
  | "blue"
  | "black";

const ColorPanel = () => {
  const canvas = useCanvasStore((state) => state.canvasInstance);
  const [penColor, setPenColor] = useState<PenColorTypes>("black");

  useEffect(() => {
    if (!(canvas instanceof fabric.Canvas)) return;
    canvas.freeDrawingBrush.color = COLOR_CODE[penColor];
  }, [penColor]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="size-10 p-0">
          <div
            className="size-6 rounded-full"
            style={{ backgroundColor: COLOR_CODE[penColor] }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(COLOR_CODE).map(([color, code]) => (
            <Button
              key={color}
              className="size-8 p-0"
              style={{ backgroundColor: code }}
              onClick={() => setPenColor(color as PenColorTypes)}
            >
              {penColor === color && <Check className="text-white" size={16} />}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPanel;
