// utils/api.ts
import axios from "axios";

// API 응답 타입을 인터페이스로 정의하여 재사용성을 높입니다
interface HostResponse {
  name: string;
}

// API 호출 함수를 만들어 관심사를 분리합니다
export const getHostName = async (clientId: string): Promise<string> => {
  // 환경 변수를 사용하는 URL을 구성합니다
  const baseUrl = process.env.NEXT_PUBLIC_API_SERVER_PATH;
  const response = await axios.get<HostResponse>(`${baseUrl}/${clientId}`);

  return response.data.name;
};
