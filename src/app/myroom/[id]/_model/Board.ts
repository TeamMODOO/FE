interface BoardComment {
  id: number;
  name: string;
  message: string;
}

export interface BoardModalProps {
  open: boolean;
  onClose: (open: boolean) => void;
  boardComments: BoardComment[];
  visitorName: string;
  visitorMessage: string;
  setVisitorName: React.Dispatch<React.SetStateAction<string>>;
  setVisitorMessage: React.Dispatch<React.SetStateAction<string>>;
  handleAddComment: () => void;
}
