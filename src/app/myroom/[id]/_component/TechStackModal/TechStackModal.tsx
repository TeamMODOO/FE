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

import { TechStackModalProps } from "../../_model/TechStack";

// 추가: 스타일 import
import Style from "./TechStackModal.style";

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
      <DialogContent className={Style.dialogContent}>
        <DialogHeader>
          <DialogTitle>기술 스택 선택</DialogTitle>
        </DialogHeader>

        <div className={Style.container}>
          <Input
            placeholder="스택 검색(예: react)... (데모)"
            className={Style.searchInput}
          />

          <div className={Style.stackList}>
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

          <div className={Style.bottomSection}>
            <Button onClick={onSave}>저장하기</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TechStackModal;
