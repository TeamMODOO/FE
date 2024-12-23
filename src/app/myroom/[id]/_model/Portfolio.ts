export interface PortfolioModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  portfolioFile: File | null;
  setPortfolioFile: React.Dispatch<React.SetStateAction<File | null>>;
  onSave: () => void;
}
