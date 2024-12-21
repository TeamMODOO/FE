import Image from "next/image";

import { signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

import styles from "./SignInPage.module.css";

export default function SignInPage() {
  // 각각 별도의 Server Action 정의
  async function handleSignIn() {
    "use server";
    await signIn("google");
  }

  async function handleSignOut() {
    "use server";
    await signOut();
  }

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
        {/* 구글 로그인 버튼 */}
        <form action={handleSignIn}>
          <Button className={styles.googleLoginButton}>
            <Image
              src="/button/google_login_button.png"
              alt="google 로그인"
              width={700}
              height={160}
            />
            <Image
              className={styles.googleLoginButtonHover}
              src="/button/google_login_button_hover.png"
              alt="google 로그인_호버"
              width={350}
              height={80}
            />
          </Button>
        </form>
      </div>
    </div>
  );
}
