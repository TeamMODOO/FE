export interface TechStackModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  techStackList: string[];
  selectedTech: string;
  setSelectedTech: React.Dispatch<React.SetStateAction<string>>;
  onSave: () => void;
}
