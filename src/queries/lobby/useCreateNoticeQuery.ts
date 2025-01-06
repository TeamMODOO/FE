import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

/** (POST) 요청 바디 */
export interface CreateNoticePayload {
  title: string;
  content: string;
}

/** (POST) 응답 바디 */
export interface CreateNoticeResponse {
  message: string; // "게시글 작성 성공"
}

export function useCreateNoticeQuery() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateNoticeResponse, // TData
    Error, // TError
    CreateNoticePayload, // TVariables
    unknown // TContext
  >({
    mutationFn: async (payload) => {
      const { data } = await axios.post<CreateNoticeResponse>(
        `${process.env.NEXT_PUBLIC_API_SERVER_PATH}/posts/notices`,
        payload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["noticesList"] });
    },
  });
}
