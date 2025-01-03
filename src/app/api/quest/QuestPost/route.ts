// src/app/api/QuestPost/route.ts

import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { questNumber, timeTaken } = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const response = await axios.post(
      `${baseUrl}/quests/results/${questNumber}`,
      {
        time_taken: timeTaken,
      },
      {
        // 필요한 경우 인증 토큰이나 기타 헤더 추가
        // headers: { Authorization: `Bearer ${token}` },
      },
    );

    return NextResponse.json(response.data, { status: 201 });
  } catch (error: unknown) {
    // error가 unknown 타입이기 때문에, 사용 전 직접 타입 가드 등을 통해 검사할 수 있습니다.
    // 예: axios.isAxiosError(error) 등
    // console.error("Error while posting quest result:", error);

    return NextResponse.json(
      { message: "문제 해결 정보 생성 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
