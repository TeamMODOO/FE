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
import { Label } from "@/components/ui/label";

import { PortfolioModalProps } from "../../_model/Portfolio";
import Style from "./PortfolioModal.style";

const PortfolioModal: React.FC<PortfolioModalProps> = ({
  open,
  onClose,
  portfolioFile,
  setPortfolioFile,
  onSave,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPortfolioFile(e.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={Style.dialogContent}>
        <DialogHeader>
          <DialogTitle>포트폴리오 만들기</DialogTitle>
        </DialogHeader>

        <div className={Style.formContainer}>
          <Label htmlFor="portfolioPdf">PDF 파일 업로드</Label>
          <Input
            id="portfolioPdf"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
          />
          {portfolioFile && <div>선택된 파일: {portfolioFile.name}</div>}

          <Button onClick={onSave}>저장하기</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioModal;
