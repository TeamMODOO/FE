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

import Style from "./ResumeModal.style";

/** 이력서(Resume) 모달 Props */
interface ResumeModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  resumeFile: File | null;
  setResumeFile: React.Dispatch<React.SetStateAction<File | null>>;
  onSave: () => void;
}

const ResumeModal: React.FC<ResumeModalProps> = ({
  open,
  onClose,
  resumeFile,
  setResumeFile,
  onSave,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={Style.dialogContent}>
        <DialogHeader>
          <DialogTitle className={Style.modalTitle}>
            이력서(PDF) 업로드
          </DialogTitle>
        </DialogHeader>

        <div className={Style.formContainer}>
          <Label htmlFor="resumePdf">PDF 파일 (이력서)</Label>
          <Input
            id="resumePdf"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className={Style.fileInput}
          />
          {resumeFile && (
            <div>
              <p className={Style.chosenFile}>선택된 파일: {resumeFile.name}</p>
            </div>
          )}

          <Button onClick={onSave} className={Style.saveButton}>
            저장하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeModal;
