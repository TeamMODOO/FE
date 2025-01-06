// src/types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

/**
 * NextAuth의 타입을 확장합니다.
 */
declare module "next-auth" {
  interface User extends DefaultUser {
    // 게스트일 경우 사용할 guest_id
    guest_id?: string;
    role?: string;
  }

  interface Session {
    /** JWT 콜백에서 세팅해줄 provider 정보 (예: "google" | "credentials") */
    providerName?: string;
    user: {
      /** 구글 로그인 시 google_id를 세팅할 수도 있음 */
      id?: string;
      role?: string;
      guest_id?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** "google" | "credentials" 등 */
    providerName?: string;
    role?: string;
    /** 게스트 로그인 시 */
    guest_id?: string;
    /** 구글 로그인 시 */
    google_id?: string;
  }
}
