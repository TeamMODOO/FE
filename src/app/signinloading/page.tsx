"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

import { useSignInPost } from "@/hooks/signin/useSignInPost";

import styles from "./SignInLoading.module.css";

function hasAccessTokenCookie(): boolean {
  // 'access_token=...' 형태의 쿠키가 있는지 검사
  return document.cookie
    .split(";")
    .some((item) => item.trim().startsWith("access_token="));
}

export default function SignInLoading() {
  const { data: session, status } = useSession();
  const { signIn, loading } = useSignInPost(); // custom hook
  const router = useRouter();
  // api 요청을 한 번만 보내기 위한 flag
  const didSignInRef = useRef(false);

  useEffect(() => {
    // 1) 구글 로그인 상태이면서, api 요청 전
    if (status === "authenticated" && !didSignInRef.current) {
      const hasToken = hasAccessTokenCookie();

      if (hasToken) {
        // 2) 구글 로그인 상태이면서, api 요청 전이고, access_token 쿠키가 존재
        router.push("/lobby");
      } else {
        didSignInRef.current = true;
        // 3) 구글 로그인 상태이면서, api 요청 전이고, access_token이 없으면 signIn() 호출
        // -> 토큰 발급 후 로비로 이동
        signIn()
          .then(() => {
            router.push("/lobby");
          })
          .catch((err) => {
            // 에러 처리 로직을 여기에 추가해도 됨
            // console.error("로그인 토큰 발급 실패:", err);
          });
      }
    }
  }, [status, router, signIn]);

  return (
    <div className={styles.container}>
      {/* 배경 반딧불이 애니메이션 */}
      {Array.from({ length: 30 }).map((_, index) => (
        <div key={index} className={styles.floatingSquare}></div>
      ))}

      <div className={styles.centersection}>
        <Image
          className={styles.logo}
          src="/logo/logo_jungletower.png"
          alt="logo"
          width={698}
          height={237}
        />
        <div className={styles.blackcover}>
          <div className={styles.spinner}></div>
          <div>
            <p> 로그인 중입니다...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
