"use client";

import { useEffect, useState } from "react";
import { IconType } from "react-icons";

import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Funiture } from "@/model/Funiture";

import Style from "./TechStackModal.style";

export interface TechStackModalProps {
  open: boolean;
  onClose: (v: boolean) => void;
  techStackList: { name: string; icon: IconType }[];
  prevTechStackList: Funiture[];
  selectedTechList: string[];
  setSelectedTechList: (list: string[]) => void;
  onSave: () => void;
}

const TechStackModal: React.FC<TechStackModalProps> = ({
  open,
  onClose,
  techStackList,
  prevTechStackList,
  selectedTechList,
  setSelectedTechList,
  onSave,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTechStack = techStackList.filter((stack) =>
    stack.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCheckboxChange = (stack: string) => {
    if (selectedTechList.includes(stack)) {
      const newList = selectedTechList.filter((item) => item !== stack);
      setSelectedTechList(newList);
    } else {
      if (selectedTechList.length < 8) {
        setSelectedTechList([...selectedTechList, stack]);
      }
    }
  };

  const resetSelection = () => {
    setSelectedTechList([]);
    setSearchTerm("");
  };

  useEffect(() => {}, []);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={Style.dialogContent}>
        <DialogHeader>
          <DialogTitle className={Style.modalTitle}>기술 스택 선택</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              placeholder="기술 스택 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={Style.searchInput}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className={Style.warningMent}>
              최대 8개를 선택할 수 있습니다.
              {selectedTechList.length > 0 &&
                ` • ${selectedTechList.length}개 선택됨`}
            </div>
            {selectedTechList.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className={Style.stackButton}
                onClick={resetSelection}
              >
                <RotateCcw className="mr-2 size-4" />
                초기화
              </Button>
            )}
          </div>

          <div className="custom-scrollbar max-h-[300px] overflow-y-auto">
            <div className={Style.buttonSection}>
              {filteredTechStack.map((stack, idx) => (
                <Button
                  key={idx}
                  variant={
                    selectedTechList.includes(stack.name)
                      ? "default"
                      : "outline"
                  }
                  className={`${Style.stackButton} ${
                    selectedTechList.includes(stack.name)
                      ? "bg-[rgba(65,240,185,0.6)] text-white"
                      : ""
                  }`}
                  onClick={() => handleCheckboxChange(stack.name)}
                >
                  {stack.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-end border-t pt-4">
            <Button onClick={onSave} className={Style.saveButton}>
              저장하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TechStackModal;
