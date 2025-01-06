//auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// console.log(process.env.NEXTAUTH_URL);

export const { handlers, signIn, signOut, auth } = NextAuth({
  // debug: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  callbacks: {
    async redirect({ url, baseUrl }) {
      // 기본값으로 /lobby 설정
      return `${baseUrl}/signinloading`;
    },
    async jwt({ token, user, account, profile, trigger }) {
      // console.log("[DEBUG] JWT CALLBACK >>>");
      // console.log("trigger:", trigger);
      // console.log("user:", user);
      // console.log("account:", account);
      // console.log("profile:", profile);
      // console.log("token (before):", token);
      if (account?.provider === "google") {
        // 일반적으로 account.providerAccountId === 구글에서 받은 'sub'
        if (account.providerAccountId) {
          // token.sub를 실제 구글 계정 ID로 덮어씁니다.
          token.sub = account.providerAccountId;
        }
      }

      // console.log("token (after):", token);
      return token;
    },
    async session({ session, token }) {
      // console.log("[DEBUG] SESSION CALLBACK >>>");
      // console.log("token:", token);
      // console.log("session (before):", session);
      // token.sub 에 구글 계정 ID가 들어있음
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      // console.log("session (after):", session);
      return session;
    },
  },
});
