"use client";

import React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Funiture } from "../_model/Funiture";

interface FurnitureInfoModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  furniture: Funiture | null;
}

const FurnitureInfoModal: React.FC<FurnitureInfoModalProps> = ({
  open,
  onClose,
  furniture,
}) => {
  if (!furniture) {
    return null; // 가구 정보가 없으면 표시 안 함
  }

  const { funitureType, data } = furniture;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>등록 정보 확인</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          {funitureType.startsWith("resume/") && (
            <>
              <div className="font-bold">[이력서]</div>
              <div>링크: {data?.resumeLink}</div>
            </>
          )}

          {funitureType.startsWith("portfolio/") && (
            <>
              <div className="font-bold">[포트폴리오]</div>
              <div>파일명: {data?.fileName}</div>
            </>
          )}

          {funitureType.startsWith("technologyStack/") && (
            <>
              <div className="font-bold">[기술 스택]</div>
              <div>선택 스택: {data?.stack}</div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FurnitureInfoModal;
