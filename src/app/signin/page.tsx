import Image from "next/image";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

import styles from "./SignInpage.module.css";

export default function SignInPage() {
  // 각각 별도의 Server Action 정의
  async function handleGoogleSignIn() {
    "use server";
    const result = await signIn("google", {
      callbackUrl: "/registeravatar",
    });
    return result;
  }

  // 게스트 로그인
  async function handleGuestLogin() {
    "use server";
    // 이 부분에 게스트 세션 발급 내용 들어갈 예정
    redirect("/lobby");
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

        <div className={styles.buttonSection}>
          {/* 구글 로그인 버튼 */}
          <form action={handleGoogleSignIn}>
            <Button className={styles.googleLoginButton}>
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
          </form>

          {/* 게스트 로그인 버튼 */}
          <form action={handleGuestLogin}>
            <Button className={styles.guestLoginButton}>
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
          </form>
        </div>
      </div>
    </div>
  );
}
