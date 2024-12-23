export interface ResumeModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  resumeLink: string;
  setResumeLink: React.Dispatch<React.SetStateAction<string>>;
  onSave: () => void;
}
