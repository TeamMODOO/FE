import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

/** ChatGPT가 반환할 JSON 구조 정의 */
interface CheckAnswerResult {
  isCorrect: boolean;
  betterSolution: string;
  hint: string;
}

/**
 * OpenAI 인스턴스 생성
 * OPENAI_API_KEY는 .env 등에 안전하게 보관
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/check-answer
 *
 * Body 예시:
 * {
 *   "qProblem": "문제 설명",
 *   "qInput": "입력 설명",
 *   "qOutput": "출력 설명",
 *   "userCode": "사용자가 작성한 코드"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // 1) 클라이언트에서 보낸 데이터 추출
    const body = await req.json();
    const { qProblem, qInput, qOutput, userCode } = body;

    // 2) ChatGPT에게 넘길 메시지 구성
    const systemPrompt = `
      You are a code checker that verifies user solutions.
      You will receive a problem statement, input specification, output specification, and user code.
      Return a JSON with:
      - "isCorrect": boolean
      - "betterSolution": string (if isCorrect is true, possibly a different solution code, 한국어로 작성)
      - "hint": string (if isCorrect is false, provide a helpful hint, 한국어로 작성)

      The entire response MUST be valid JSON, with no additional text, no code fences, and no explanation outside of JSON, even if there's no user's code. 
      No triple backticks, no phrases like "The user's code is correct.".
      Only respond with the JSON object itself.
    `;

    const userPrompt = `
Problem Statement:
${qProblem}

Input Spec:
${qInput}

Output Spec:
${qOutput}

User Code:
${userCode}

Please analyze the user's code to determine if it solves the problem correctly.
If correct, return { "isCorrect": true, "betterSolution": "..." }
If no  better solution, say "이미 모범 답안 수준이에요!" as "betterSolutuion".
If incorrect, return { "isCorrect": false, "betterSolution": "", "hint": "..." }
Return valid JSON only, without any other text or formatting, even if there's no user's code.
No code fences, no 'Here is the JSON' or explanation.
    `;

    // 3) ChatGPT 4 API 호출
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4-0613", // 최신 모델
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0,
    });

    // 4) ChatGPT가 준 메시지 (JSON 문자열이라고 가정)
    const content =
      chatCompletion.choices?.[0]?.message?.content?.trim() || "{}";

    // 디버깅:: chatGPT가 준 메시지 출력
    // console.log(content);

    // 5) JSON 파싱 시도
    let resultJson: CheckAnswerResult;
    try {
      resultJson = JSON.parse(content) as CheckAnswerResult;
    } catch (err) {
      // ChatGPT가 JSON 형식이 아닌 답변을 준 경우
      resultJson = {
        isCorrect: false,
        betterSolution: "",
        hint: "ChatGPT did not return valid JSON.",
      };
    }

    // 6) 결과 반환
    return NextResponse.json(resultJson);
  } catch (error: unknown) {
    // 에러 처리
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Something went wrong." },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
