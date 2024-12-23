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

import { ResumeModalProps } from "../_model/Resume";

const ResumeModal: React.FC<ResumeModalProps> = ({
  open,
  onClose,
  resumeLink,
  setResumeLink,
  onSave,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>이력서 만들기</DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-4">
          <Label htmlFor="resumeLink">이력서 링크</Label>
          <Input
            id="resumeLink"
            placeholder="이력서 링크(예: Google Docs, Notion 등)"
            value={resumeLink}
            onChange={(e) => setResumeLink(e.target.value)}
          />
          <Button onClick={onSave}>저장하기</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeModal;
