"use client";

import { FC } from "react";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

interface PdfViewerModalProps {
  open: boolean;
  onClose: (v: boolean) => void;
  pdfUrl: string; // S3에 저장된 PDF 링크
}

const PdfViewerModal: FC<PdfViewerModalProps> = ({ open, onClose, pdfUrl }) => {
  // pdfUrl이 빈 문자열이면 모달 닫힘
  if (!pdfUrl) {
    return null;
  }

  const handleClose = () => {
    onClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* 
        h-[80vh] : 화면의 80% 높이
        max-w-5xl : 최대 폭 (원하는 대로 조정 가능)
        flex flex-col : 수직 배치
        p-0 : 기본 패딩 제거
      */}
      <DialogContent className="flex h-[80vh] max-w-5xl flex-col overflow-hidden p-0">
        {/* 상단 헤더 (닫기 버튼, 제목 등) */}
        <DialogHeader className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold">PDF 미리보기</h3>
        </DialogHeader>

        {/* iframe 영역을 flex-1로 잡아 남은 공간 전부 차지 */}
        <div className="size-full flex-1 overflow-hidden">
          <iframe
            src={pdfUrl}
            title="PDF Viewer"
            className="size-full"
            style={{ border: "none" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewerModal;
