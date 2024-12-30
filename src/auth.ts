import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // 기본값으로 /lobby 설정
      return `${baseUrl}/lobby`;
    },
    async session({ session, token }) {
      // token.sub 에 구글 계정 ID가 들어있음
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
