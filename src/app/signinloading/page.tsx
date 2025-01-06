// src/app/signinloading/page.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

import { useSignInPost } from "@/hooks/signin/useSignInPost";

import styles from "./SignInLoading.module.css";

/** access_token 쿠키 존재 여부 판별 */
function hasAccessTokenCookie(): boolean {
  return document.cookie
    .split(";")
    .some((item) => item.trim().startsWith("access_token="));
}

export default function SignInLoading() {
  const { data: session, status } = useSession();
  const { signIn, loading } = useSignInPost(); // custom hook
  const router = useRouter();
  const didSignInRef = useRef(false);

  useEffect(() => {
    // 1) 게스트 로그인인지 확인 (providerName === "credentials")
    if (session?.providerName === "credentials") {
      router.push("/lobby");
      return;
    }

    // 세션이 "authenticated" 상태이며, 아직 API 요청을 안 했다면
    if (status === "authenticated" && !didSignInRef.current) {
      // 2) 구글 로그인인 경우 (providerName === "google")
      if (session?.providerName === "google") {
        // 먼저 access_token 쿠키가 있는지 확인
        const hasToken = hasAccessTokenCookie();
        if (hasToken) {
          // 이미 access_token이 있다면 바로 로비 이동
          router.push("/lobby");
        } else {
          // console.log(session);
          didSignInRef.current = true; // 중복 실행 방지
          // 토큰이 없다면 직접 발급 받기
          signIn()
            .then(() => {
              router.push("/lobby");
            })
            .catch((err) => {
              // 에러 처리
              // console.error("구글 로그인 토큰 발급 실패:", err);
              // 필요시 에러 페이지로 이동
            });
        }
      }
    }
  }, [status, session, router, signIn]);

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
