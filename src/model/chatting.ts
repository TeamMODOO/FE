export interface ChattingRequest {
  chat_text: string;
}
export interface ChattingResponse {
  user_name: string;
  message: string;
}

export interface ChattingType extends ChattingResponse {
  create_at: Date;
}
