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
    // status가 "authenticated" 아니면 대기
    if (status !== "authenticated") return;

    // 이미 한 번 로직을 실행했다면 대기
    if (didSignInRef.current) return;

    // 이제 session.providerName 확인
    if (session?.providerName === "credentials") {
      // 게스트 로그인 → 바로 /lobby
      didSignInRef.current = true;
      router.push("/lobby");
    } else if (session?.providerName === "google") {
      // 구글 로그인
      const hasToken = hasAccessTokenCookie();
      if (hasToken) {
        router.push("/lobby");
      } else {
        didSignInRef.current = true;
        signIn().then(() => {
          router.push("/lobby");
        });
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
