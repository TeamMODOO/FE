export interface NpcModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imgSrc: string;
  children?: React.ReactNode;
}
