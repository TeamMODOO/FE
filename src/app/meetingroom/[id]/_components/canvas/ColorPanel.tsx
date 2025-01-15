"use client";

import { useEffect, useState } from "react";

import { fabric } from "fabric";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useCanvasStore from "@/store/useCanvasStore";
import usePenColorStore, { PenColorTypes } from "@/store/usePenColor";

import { COLOR_CODE } from "../../_constant";

const ColorPanel = () => {
  const [isOpen, setIsOpen] = useState(false);

  const canvas = useCanvasStore((state) => state.canvasInstance);
  const penColor = usePenColorStore((state) => state.penColor);
  const setPenColor = usePenColorStore((state) => state.setPenColor);

  useEffect(() => {
    if (!(canvas instanceof fabric.Canvas)) return;
    canvas.freeDrawingBrush.color = COLOR_CODE[penColor as PenColorTypes];
  }, [penColor]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        asChild
        className="border-1 border-[rgba(201,189,188,1)]
                bg-[rgba(100,100,100,0.6)] text-white hover:!bg-[rgba(100,100,100,1)]"
      >
        <Button variant="outline" className="size-10 p-0">
          <div
            className="size-6 rounded-full"
            style={{ backgroundColor: COLOR_CODE[penColor as PenColorTypes] }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="ml-[0.7rem] w-auto border-2 border-[rgba(201,189,188,1)] bg-[rgba(100,100,100,0.9)] p-2">
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(COLOR_CODE).map(([color, code]) => (
            <Button
              key={color}
              className="size-8 p-0"
              style={{ backgroundColor: code }}
              onClick={() => {
                setPenColor(color);
                setIsOpen(false);
              }}
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
