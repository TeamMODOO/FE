"use client";

import React, { useState } from "react";

import Image from "next/image";

import useEscapeKey from "@/hooks/useEscapeKey";
import { NpcModalProps } from "@/model/NpcModal";

import styles from "./NpcModal.module.css";

export const NpcModal: React.FC<NpcModalProps> = ({
  isOpen,
  onClose,
  title,
  imgSrc,
  children,
}) => {
  useEscapeKey(onClose, true);

  // 이미지 로딩 완료 상태
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!isOpen) {
    // 모달이 아예 열리지 않았다면 렌더링 X
    return null;
  }

  if (imgSrc === "") {
    // NPC 이미지가 없는 경우
    return (
      <div className={styles.modalContainer}>
        <div className={styles.rightSection}>
          <button className={styles.closeBtn} onClick={onClose}>
            X
          </button>
          <div className={styles.modalHeader}>
            <p className={styles.modalTitle}>{title}</p>
          </div>
          <div className={styles.modalContent}>{children}</div>
        </div>
      </div>
    );
  } else {
    // NPC 이미지가 있는 경우
    return (
      <div className={styles.modalContainer}>
        {/* 이미지 영역 */}
        {/* 
            1) 항상 렌더링해서 이미지를 로드. 
            2) 로드가 끝나면 setImageLoaded(true) -> 본문 표시 
        */}
        <div className={styles.imageSection}>
          {!imageLoaded && (
            <div className={styles.loadingSpinner}>
              {/* 로딩 중 UI (스피너 등) */}
              <p>이미지 로딩 중...</p>
            </div>
          )}
          <Image
            src={imgSrc}
            width={500}
            height={500}
            alt="(NPC 이미지)"
            style={imageLoaded ? {} : { display: "none" }}
            onLoadingComplete={() => setImageLoaded(true)}
            priority
          />
        </div>

        {/* 오른쪽 본문 영역 */}
        {/* 로딩 전이라면 숨기거나, 반투명하게 처리할 수도 있음 */}
        {imageLoaded ? (
          <div className={styles.rightSection}>
            <button className={styles.closeBtn} onClick={onClose}>
              X
            </button>
            <div className={styles.modalHeader}>
              <p className={styles.modalTitle}>{title}</p>
            </div>
            <div className={styles.modalContent}>{children}</div>
          </div>
        ) : null}
      </div>
    );
  }
};
