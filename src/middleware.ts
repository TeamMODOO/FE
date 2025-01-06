// src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 인증이 필요 없는 경로 목록
  const excludedPaths = ["/_next", "/api", "/favicon.ico", "/background"];

  // 현재 요청 경로가 제외 목록에 속하는지 확인
  const isExcluded = excludedPaths.some((path) => pathname.startsWith(path));

  if (isExcluded) {
    // 인증이 필요 없는 경로는 통과
    return NextResponse.next();
  }

  // 루트 경로('/')에 접근 시 처리
  if (pathname === "/") {
    // '/signin' 으로 리다이렉트
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // /signin 경로에 접근하려는 경우 추가 로직 수행
  if (pathname.startsWith("/signin")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (token && token.providerName === "google") {
      // 이미 구글 로그인 상태라면 /lobby로 리디렉션
      return NextResponse.redirect(new URL("/lobby", req.url));
    }
    // 로그인되지 않은 사용자는 /signin에 접근 가능
    return NextResponse.next();
  }

  // 인증이 필요한 경로일 경우 토큰 확인
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    // 인증되지 않은 사용자라면 /signin으로 리디렉션
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // 모든 조건을 통과하면 요청을 계속 진행
  return NextResponse.next();
}

export const config = {
  matcher: [
    // 모든 경로에 미들웨어 적용
    "/:path*",
  ],
};
