export interface MeetingRoom {
  room_id: string;
  title: string;
  clients: string[]; // client_id
}

// 미팅룸 생성 시 필요한 입력 타입
export interface CreateMeetingRoomPayload {
  room_id: string;
  title: string;
  client_id: string;
}
