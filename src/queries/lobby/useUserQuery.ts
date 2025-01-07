import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface UserType {
  name: string;
  google_id: string;
}

//전체 유저 목록을 가져오는 쿼리
export function useUserListQuery(isOpen: boolean) {
  const fetchUserList = async () => {
    const { data } = await axios.get<UserType[]>(
      `${process.env.NEXT_PUBLIC_API_SERVER_PATH}/users/all`,
    );
    return data;
  };

  return useQuery<UserType[]>({
    queryKey: ["users"],
    queryFn: fetchUserList,
    // isOpen이 true일 때만 쿼리 실행
    enabled: isOpen,
  });
}
