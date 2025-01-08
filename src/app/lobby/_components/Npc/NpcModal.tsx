//src/app/lobby/_components/Npc/NpcModal.tsx
"use client";

import React from "react";

import Image from "next/image";

import { NpcModalProps } from "@/model/NpcModal";

import styles from "./NpcModal.module.css";

export const NpcModal: React.FC<NpcModalProps> = ({
  isOpen,
  onClose,
  title,
  imgSrc,
  children,
}) => {
  if (imgSrc != "") {
    // imgSrc가 있을 경우 (즉, NPC 이미지가 있을 경우)
    return (
      <>
        {isOpen && (
          <div className={styles.modalContainer}>
            <div className={styles.imageSection}>
              <Image src={imgSrc} width={500} height={500} alt="(NPC 이미지)" />
            </div>
            <div className={styles.rightSection}>
              <button className={styles.closeBtn} onClick={onClose}>
                X
              </button>
              <div className={styles.modalHeader}>
                <p className={styles.modalTitle}>{title}</p>
              </div>
              <div className={styles.modalContent}>{children}</div>
              {/* <Typewriter
                text={typeof children === "string" ? children : ""}
                speed={50}
              /> */}
            </div>
          </div>
        )}
      </>
    );
  } else {
    // imgSrc가 ""일 경우 (즉, NPC 이미지가 없을 경우)
    return (
      <>
        {isOpen && (
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
        )}
      </>
    );
  }
};
