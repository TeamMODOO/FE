// src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "./auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const session = await auth();

  // 인증이 필요 없는 경로 목록
  const excludedPaths = ["/_next", "/api", "/favicon.png", "/background"];

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

  // 인증이 필요한 경로일 경우 토큰 확인
  await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!session) {
    // 인증되지 않은 사용자라면 /signin으로 리디렉션
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // 모든 조건을 통과하면 요청을 계속 진행
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|api|signin|signinloading|favicon.png|background|css|hooks).*)",
  ],
};
