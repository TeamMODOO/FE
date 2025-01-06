// src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
// next-auth v5 이상에서 사용 가능
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // 1) 요청 경로 (예: /signin, /api, /somepage 등)
  const { pathname } = req.nextUrl;

  // 2) 만약 /signin 페이지이거나 public 파일(_next, favicon, ...) 등에 대한 요청이라면, 토큰 검사 없이 통과
  if (
    pathname.startsWith("/signin") ||
    pathname.startsWith("/background") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // 3) 인증 토큰(세션)을 가져옴
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 4) 토큰이 없으면 => 비로그인 상태 => /signin 으로 리다이렉트
  if (!token) {
    const signInUrl = new URL("/signin", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // 5) 토큰이 있으면 => 로그인 상태 => 정상 요청 진행
  return NextResponse.next();
}

// matcher 설정
export const config = {
  /**
   * 아래 matcher는 최소 예시입니다.
   *
   * 예를 들어, /signin 페이지는 미들웨어를 타지 않도록 하거나,
   * API 경로를 포함시키지 않도록 조정하려면
   * 정규표현식(또는 배열 형태)으로 자유롭게 커스텀할 수 있습니다.
   */
  matcher: ["/((?!_next|api|favicon.ico|signin|backgorund|css).*)"],
};
