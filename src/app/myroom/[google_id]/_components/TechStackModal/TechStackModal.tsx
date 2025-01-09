"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import Style from "./TechStackModal.style";

export interface TechStackModalProps {
  open: boolean;
  onClose: (v: boolean) => void;
  techStackList: string[];
  selectedTechList: string[]; // ← 다중 선택 목록
  setSelectedTechList: (list: string[]) => void; // ← 다중 선택 세터
  onSave: () => void; // 최종 저장 (MyRoomCanvas에서 호출)
}

const TechStackModal: React.FC<TechStackModalProps> = ({
  open,
  onClose,
  techStackList,
  selectedTechList,
  setSelectedTechList,
  onSave,
}) => {
  // 체크박스 onChange
  const handleCheckboxChange = (stack: string) => {
    if (selectedTechList.includes(stack)) {
      // 이미 선택되어 있으면 제거
      const newList = selectedTechList.filter((item) => item !== stack);
      setSelectedTechList(newList);
    } else {
      // 새로 추가
      setSelectedTechList([...selectedTechList, stack]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={Style.dialogContent}>
        <DialogHeader>
          <DialogTitle>기술 스택 선택</DialogTitle>
        </DialogHeader>

        <div className={Style.container}>
          <div className="mb-2 mt-4 text-sm text-muted-foreground">
            여러 개를 선택할 수 있습니다. (최대 8개)
          </div>

          <div className={Style.stackList}>
            {techStackList.map((stack) => {
              const isChecked = selectedTechList.includes(stack);
              return (
                <label
                  key={stack}
                  className="flex items-center gap-2 rounded px-2 py-1 hover:bg-secondary"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCheckboxChange(stack)}
                  />
                  <span>{stack}</span>
                </label>
              );
            })}
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
