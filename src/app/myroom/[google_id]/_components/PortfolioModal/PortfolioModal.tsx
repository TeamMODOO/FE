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

import Style from "./PortfolioModal.style";

/** 포트폴리오(링크) 모달 Props */
interface PortfolioModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  portfolioLink: string; // 새로 입력할 링크
  setPortfolioLink: React.Dispatch<React.SetStateAction<string>>;
  onSave: () => void;
}

const PortfolioModal: React.FC<PortfolioModalProps> = ({
  open,
  onClose,
  portfolioLink,
  setPortfolioLink,
  onSave,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={Style.dialogContent}>
        <DialogHeader>
          <DialogTitle>포트폴리오 링크 추가</DialogTitle>
        </DialogHeader>

        <div className={Style.formContainer}>
          <Label htmlFor="portfolioLink">링크(URL)</Label>
          <Input
            id="portfolioLink"
            placeholder="예: https://github.com/my-portfolio ..."
            value={portfolioLink}
            onChange={(e) => setPortfolioLink(e.target.value)}
          />
          <Button onClick={onSave}>저장하기</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioModal;
