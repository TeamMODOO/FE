"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** 포트폴리오 링크 확인 모달 Props */
interface PortfolioLinkViewModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  link: string;
}

const PortfolioLinkViewModal: React.FC<PortfolioLinkViewModalProps> = ({
  open,
  onClose,
  link,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>포트폴리오 링크</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {link ? (
            <div>
              <p>해당 링크를 확인해보세요:</p>
              <p className="break-all text-blue-600 underline">{link}</p>
            </div>
          ) : (
            <p>링크가 없습니다.</p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => onClose(false)}>닫기</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioLinkViewModal;
