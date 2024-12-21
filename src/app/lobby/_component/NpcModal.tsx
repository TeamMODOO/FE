"use client";

import React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NpcModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
}

export const NpcModal: React.FC<NpcModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  // Shadcn-ui의 Dialog는 open 상태 관리가 내부적으로는 controlled/uncontrolled 혼합 방식이므로
  // "open" prop과 "onOpenChange"를 사용해 제어할 수 있습니다.
  // 여기서는 "isOpen"과 "onClose"로 연결.
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
};
