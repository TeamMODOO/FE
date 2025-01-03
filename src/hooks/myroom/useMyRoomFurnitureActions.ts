"use client";

import { Dispatch, SetStateAction, useState } from "react";

import { Funiture } from "@/model/Funiture";

/**
 * 마이룸의 이력서/포트폴리오/기술스택 관련 모달 로직 등
 * - 열기/닫기
 * - 저장 로직
 * - "none" 가구 클릭 시 alert
 * - ...
 */
interface MyRoomFurnitureActionsProps {
  resume: Funiture[];
  setResume: Dispatch<SetStateAction<Funiture[]>>;

  portfolio: Funiture[];
  setPortfolio: Dispatch<SetStateAction<Funiture[]>>;

  technologyStack: Funiture[];
  setTechnologyStack: Dispatch<SetStateAction<Funiture[]>>;
}

export function useMyRoomFurnitureActions({
  resume,
  setResume,
  portfolio,
  setPortfolio,
  technologyStack,
  setTechnologyStack,
}: MyRoomFurnitureActionsProps) {
  // ------------------ 모달 state ------------------
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [portfolioLink, setPortfolioLink] = useState("");

  const [techStackModalOpen, setTechStackModalOpen] = useState(false);
  const [selectedTechList, setSelectedTechList] = useState<string[]>([]);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedFurnitureData, setSelectedFurnitureData] =
    useState<Funiture | null>(null);

  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  const [portfolioLinkViewModalOpen, setPortfolioLinkViewModalOpen] =
    useState(false);
  const [clickedPortfolioLink, setClickedPortfolioLink] = useState("");

  // ------------------ 버튼 비활성화 여부 ------------------
  const isResumeButtonDisabled = resume.some((r) => r.funitureType !== "none");
  const isPortfolioButtonDisabled =
    portfolio.filter((p) => p.funitureType !== "none").length >= 3;
  const isTechStackButtonDisabled =
    technologyStack.filter((t) => t.funitureType !== "none").length >= 9;

  // ------------------ 열기 함수 ------------------
  const handleOpenResumeModal = () => {
    if (isResumeButtonDisabled) {
      alert("이력서는 이미 등록됨(1개만)");
      return;
    }
    setResumeModalOpen(true);
  };
  const handleOpenPortfolioModal = () => {
    if (isPortfolioButtonDisabled) {
      alert("포트폴리오는 최대 3개까지.");
      return;
    }
    setPortfolioModalOpen(true);
  };
  const handleOpenTechStackModal = () => {
    setTechStackModalOpen(true);
  };

  // ------------------ 저장 함수 ------------------
  const handleSaveResume = async () => {
    if (!resumeFile) {
      setResumeModalOpen(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);

      const res = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }
      const s3Url = data.url;

      // 업데이트
      setResume((prev) =>
        prev.map((item, idx) =>
          idx === 0
            ? {
                ...item,
                funitureType: `resume/resume${idx + 1}`,
                data: { url: s3Url, fileName: resumeFile.name },
              }
            : item,
        ),
      );
      setResumeModalOpen(false);
      setResumeFile(null);
    } catch (error) {
      //   console.error("Resume upload error:", error);
    }
  };

  const handleSavePortfolio = () => {
    if (!portfolioLink.trim()) {
      setPortfolioModalOpen(false);
      return;
    }
    // 'none'인 첫 슬롯에 link 등록
    const idx = portfolio.findIndex((p) => p.funitureType === "none");
    if (idx !== -1) {
      setPortfolio((prev) =>
        prev.map((item, i) =>
          i === idx
            ? {
                ...item,
                funitureType: `portfolio/portfolio${idx + 1}`,
                data: { link: portfolioLink },
              }
            : item,
        ),
      );
    }
    setPortfolioModalOpen(false);
    setPortfolioLink("");
  };

  const handleSaveTechStack = () => {
    if (selectedTechList.length === 0) {
      setTechStackModalOpen(false);
      return;
    }

    const noneSlots = technologyStack.filter((t) => t.funitureType === "none");
    if (noneSlots.length === 0) {
      alert("더 이상 기술스택 추가 불가.");
      setTechStackModalOpen(false);
      return;
    }

    const usedCount = technologyStack.filter(
      (t) => t.funitureType !== "none",
    ).length;
    const newCount = selectedTechList.length;
    const totalCount = usedCount + newCount;
    if (totalCount > 9) {
      alert(
        `최대 9개까지. (현재 ${usedCount} + 새 ${newCount} = ${totalCount})`,
      );
      return;
    }

    setTechnologyStack((prev) => {
      const newArr = [...prev];
      let idxSlot = 0;
      for (let i = 0; i < newArr.length; i++) {
        if (newArr[i].funitureType === "none" && idxSlot < newCount) {
          newArr[i] = {
            ...newArr[i],
            funitureType: `technologyStack/technologyStack${i + 1}`,
            data: { stack: selectedTechList[idxSlot] },
          };
          idxSlot++;
        }
        if (idxSlot >= newCount) break;
      }
      return newArr;
    });

    setSelectedTechList([]);
    setTechStackModalOpen(false);
  };

  // ------------------ 가구 클릭 처리 ------------------
  const handleFurnitureClick = (f: Funiture) => {
    // 'none'인 경우
    if (f.funitureType === "none") {
      if (f.funiturename.includes("이력서")) {
        alert("이력서(PDF) 없음. 버튼으로 추가하세요!");
      } else if (f.funiturename.includes("포트폴리오")) {
        alert("포트폴리오 링크 없음. 버튼으로 추가하세요!");
      } else if (f.funiturename.includes("기술스택")) {
        alert("기술스택 없음. 버튼으로 추가하세요!");
      } else {
        alert("정보가 없습니다. 추가해주세요!");
      }
      return;
    }

    // 게시판 제외 (funitureType === "board")는 상위에서 처리

    // 이력서 = PDF
    if (f.funitureType.startsWith("resume/")) {
      const pdfLink = f.data?.url || "";
      if (pdfLink) {
        setPdfUrl(pdfLink);
        setPdfModalOpen(true);
      } else {
        alert("이력서 PDF가 없습니다!");
      }
      return;
    }

    // 포트폴리오 = 링크
    if (f.funitureType.startsWith("portfolio/")) {
      const link = f.data?.link || "";
      if (link) {
        setClickedPortfolioLink(link);
        setPortfolioLinkViewModalOpen(true);
      } else {
        alert("포트폴리오 링크가 없습니다!");
      }
      return;
    }

    // 기술스택 등 → 상세 모달
    setSelectedFurnitureData(f);
    setViewModalOpen(true);
  };

  return {
    // 모달 state
    resumeModalOpen,
    setResumeModalOpen,
    resumeFile,
    setResumeFile,
    portfolioModalOpen,
    setPortfolioModalOpen,
    portfolioLink,
    setPortfolioLink,
    techStackModalOpen,
    setTechStackModalOpen,
    selectedTechList,
    setSelectedTechList,
    viewModalOpen,
    setViewModalOpen,
    selectedFurnitureData,
    setSelectedFurnitureData,
    pdfModalOpen,
    setPdfModalOpen,
    pdfUrl,
    setPdfUrl,
    portfolioLinkViewModalOpen,
    setPortfolioLinkViewModalOpen,
    clickedPortfolioLink,
    setClickedPortfolioLink,

    // 버튼 비활성화
    isResumeButtonDisabled,
    isPortfolioButtonDisabled,
    isTechStackButtonDisabled,

    // 열기/저장/클릭 핸들러
    handleOpenResumeModal,
    handleOpenPortfolioModal,
    handleOpenTechStackModal,
    handleSaveResume,
    handleSavePortfolio,
    handleSaveTechStack,
    handleFurnitureClick,
  };
}
