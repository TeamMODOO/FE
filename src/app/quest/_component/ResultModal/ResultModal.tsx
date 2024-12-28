// /src/components/Modal.tsx
"use client";

import styles from "./ResultModal.module.css";

type ModalProps = {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
};

export default function Modal({ children, onClose }: ModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          X
        </button>
        <div className={styles.content}>
          <p>{children}</p>
        </div>
      </div>
    </div>
  );
}
