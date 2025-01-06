// src/app/signin/page.tsx
"use client";

import Image from "next/image";
import { signIn } from "next-auth/react"; // 클라이언트 사이드 signIn import

import { Button } from "@/components/ui/button";

import styles from "./SignInpage.module.css";

export default function SignInPage() {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/signinloading" });
  };

  const handleGuestLogin = () => {
    signIn("credentials", { callbackUrl: "/signinloading" });
  };

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
          width={1396}
          height={474}
        />

        <div className={styles.buttonSection}>
          {/* 구글 로그인 버튼 */}
          <Button
            className={styles.googleLoginButton}
            onClick={handleGoogleSignIn}
          >
            <Image
              src="/button/google_login_button.png"
              alt="google 로그인"
              width={350}
              height={80}
            />
            <Image
              className={styles.googleLoginButtonHover}
              src="/button/google_login_button_hover.png"
              alt="google 로그인_호버"
              width={350}
              height={80}
            />
          </Button>
          {/* 게스트 로그인 버튼 */}
          <Button
            className={styles.guestLoginButton}
            onClick={handleGuestLogin}
          >
            <Image
              src="/button/guest_login_button.png"
              alt="guest 로그인"
              width={350}
              height={80}
            />
            <Image
              className={styles.guestLoginButtonHover}
              src="/button/guest_login_button_hover.png"
              alt="guest 로그인_호버"
              width={350}
              height={80}
            />
          </Button>
          <div className={styles.guestWarning}>
            <p>* 게스트 로그인 시, 일부 기능이 제한 됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
