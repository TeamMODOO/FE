"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { TechStackModalProps } from "../_model/TechStack";

const TechStackModal: React.FC<TechStackModalProps> = ({
  open,
  onClose,
  techStackList,
  selectedTech,
  setSelectedTech,
  onSave,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[700px]">
        <DialogHeader>
          <DialogTitle>기술 스택 선택</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <Input
            placeholder="스택 검색(예: react)... (데모)"
            className="mb-2"
          />
          {/* 추천 스택 목록 */}
          <div className="flex flex-wrap gap-2">
            {techStackList.map((stack) => (
              <Button
                key={stack}
                variant={selectedTech === stack ? "default" : "outline"}
                onClick={() => setSelectedTech(stack)}
              >
                {stack}
              </Button>
            ))}
          </div>

          <div className="mt-4">
            <Button onClick={onSave}>저장하기</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TechStackModal;
