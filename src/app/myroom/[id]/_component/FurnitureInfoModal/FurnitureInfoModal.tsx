"use client";

import React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { FurnitureInfoModalProps } from "../../_model/Funiture";
import Style from "./FurnitureInfoModal.style";

const FurnitureInfoModal: React.FC<FurnitureInfoModalProps> = ({
  open,
  onClose,
  furniture,
}) => {
  if (!furniture) {
    return null;
  }

  const { funitureType, data } = furniture;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={Style.dialogContent}>
        <DialogHeader>
          <DialogTitle>등록 정보 확인</DialogTitle>
        </DialogHeader>

        <div className={Style.infoContainer}>
          {funitureType.startsWith("resume/") && (
            <>
              <div className={Style.infoTitle}>[이력서]</div>
              <div>링크: {data?.resumeLink}</div>
            </>
          )}

          {funitureType.startsWith("portfolio/") && (
            <>
              <div className={Style.infoTitle}>[포트폴리오]</div>
              <div>파일명: {data?.fileName}</div>
            </>
          )}

          {funitureType.startsWith("technologyStack/") && (
            <>
              <div className={Style.infoTitle}>[기술 스택]</div>
              <div>선택 스택: {data?.stack}</div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FurnitureInfoModal;
