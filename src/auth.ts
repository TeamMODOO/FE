//auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// console.log(process.env.NEXTAUTH_URL);

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
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
