// src/auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { v4 as uuid } from "uuid";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Guest",
      credentials: {},
      async authorize(credentials, req) {
        // 게스트 로그인: guest_id, name, role 등을 리턴
        return {
          guest_id: uuid(),
          name: "GuestUser",
          role: "guest",
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  callbacks: {
    async redirect({ baseUrl }) {
      // 로그인 후 /signinloading으로 이동
      return `${baseUrl}/signinloading`;
    },

    async jwt({ token, user, account }) {
      // 구글 로그인
      if (account?.provider === "google" && account.providerAccountId) {
        token.providerName = "google";
        // 구글 사용자의 실제 id
        token.google_id = account.providerAccountId;
      }

      // 게스트 로그인
      if (account?.provider === "credentials" && user?.guest_id) {
        token.providerName = "credentials";
        // guest_id를 JWT에 담아둔다
        token.guest_id = user.guest_id;
      }
      return token;
    },

    async session({ session, token }) {
      // providerName 세팅
      if (token.providerName) {
        session.providerName = token.providerName;
      }

      // 구글 로그인 -> session.user.id = token.google_id
      if (token.providerName === "google" && token.google_id) {
        session.user.id = token.google_id;
        session.user.role = "google_user";
      }

      // 게스트 로그인 -> session.user.guest_id = token.guest_id
      if (token.providerName === "credentials" && token.guest_id) {
        session.user.guest_id = token.guest_id;
        session.user.role = "guest";
      }

      return session;
    },
  },
});
