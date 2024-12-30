// src/hooks/signin/useSignIn.ts

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

interface User {
  email: string;
  name: string;
  google_id: string;
}

interface LoginResponse {
  message: string;
}

export function useSignIn() {
  const { data: session, status } = useSession();

  const { mutate: login, data: loginData } = useMutation<
    LoginResponse,
    Error,
    User
  >({
    mutationFn: async (userData: User) => {
      const { data } = await axios.post<LoginResponse>(
        "/users/login",
        userData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      return data;
    },
  });

  // session이 있고 authenticated 상태일 때 자동으로 로그인 시도
  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.email &&
      session.user.name &&
      session.user.id
    ) {
      // console.log(session.user);

      login({
        email: session.user.email,
        name: session.user.name,
        google_id: session.user.id,
      });
    }
  }, [session, status, login]);

  return {
    session,
    status,
    loginMessage: loginData?.message || "",
  };
}
