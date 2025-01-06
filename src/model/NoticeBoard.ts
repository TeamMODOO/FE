export interface NoticeItem {
  id: number;
  name: string; // 작성자
  message: string; // 글 내용
}

export interface NoticeBoardModalProps {
  open: boolean; // 모달 열림/닫힘
  onClose: (open: boolean) => void; // 모달 닫기 함수
  noticeList: NoticeItem[]; // 공지사항(글) 목록
  writerName: string; // 입력 중인 작성자명
  writerMessage: string; // 입력 중인 메세지
  setWriterName: React.Dispatch<React.SetStateAction<string>>;
  setWriterMessage: React.Dispatch<React.SetStateAction<string>>;
  handleAddNotice: () => void; // "글 작성" 버튼 클릭 시 로직
}
export interface NoticeData {
  id: number;
  title: string;
  content: string;
  author_name: string;
  author_google_id: string;
  created_at: string; // ISO datetime
}
