// src/app/replicate/route.ts
import { NextRequest } from "next/server";
import Replicate from "replicate";

export async function POST(request: NextRequest) {
  // body에서 imageUrl(혹은 base64 등) 파싱
  const { imageUrl } = await request.json();

  // 실제로는 process.env.REPLICATE_API_TOKEN에 본인의 Replicate 토큰이 있어야 함
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN || "",
  });

  try {
    // img2prompt 모델 호출
    const output = await replicate.run(
      "methexis-inc/img2prompt:50adaf2d3ad20a6f911a8a9e3ccf777b263b8596fbd2c8fc26e8888f8a0edbb5",
      {
        input: {
          image: imageUrl,
        },
      },
    );

    // output은 모델 결과(즉, 이미지 설명)이 문자열 배열 or 문자열 형태로 반환됨
    return new Response(JSON.stringify({ result: output }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // console.error(error);
    return new Response(JSON.stringify({ error: "Failed to process image" }), {
      status: 500,
    });
  }
}
