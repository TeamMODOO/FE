export interface ChattingRequest {
  chat_text: string;
}
export interface ChattingResponse {
  room_id: string;
  user_name: string;
  chat_text: string;
  create_at: string;
}
