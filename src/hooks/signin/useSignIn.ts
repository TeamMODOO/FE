"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function useSignIn() {
  const { data: session, status } = useSession();
  const [loginMessage, setLoginMessage] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const { email, name, id } = session.user;
      fetch("/users/login", {
        method: "POST",
        credentials: "include", // 쿠키를 포함해서 요청
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          google_id: id,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`로그인 요청 실패: ${res.status}`);
          }
          const data = await res.json();
          setLoginMessage(data.message || "백엔드 로그인 완료");
        })
        .catch((err) => {
          // console.error(err);
        });
    }
  }, [session, status]);

  // 훅 내부에서 session, status, loginMessage를 return
  return {
    session,
    status,
    loginMessage,
  };
}
