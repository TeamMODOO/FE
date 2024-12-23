import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
/** LangChain import (Core prompts) */
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import Replicate from "replicate";
import sharp from "sharp";

/**
 * 타입 예시
 * - img2prompt 결과가 문자열 또는 문자열 배열이라고 가정
 */
type Img2PromptOutput = string | string[];

/**
 * DALL·E 결과 (간소화)
 */
interface DallEGenerateResponse {
  data: { url: string }[];
}

export async function POST(req: NextRequest) {
  try {
    // console.log("[generate-avatar] Step 0: Request started.");

    // 0) 클라이언트로부터 base64 파일 받기
    const { base64Image } = (await req.json()) as { base64Image: string };
    // console.log(
    //   "[generate-avatar] Step 1: base64Image received, length=",
    //   base64Image?.length,
    // );

    // ------------------------------------------------
    // 1) Replicate(img2prompt): 이미지 → 텍스트
    // ------------------------------------------------
    // console.log("[generate-avatar] Step 2: Replicate start...");
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN ?? "",
    });

    const output = (await replicate.run(
      "methexis-inc/img2prompt:50adaf2d3ad20a6f911a8a9e3ccf777b263b8596fbd2c8fc26e8888f8a0edbb5",
      { input: { image: base64Image } },
    )) as Img2PromptOutput;

    // console.log("[generate-avatar] Step 2: Replicate success, output=", output);

    const replicatePrompt = Array.isArray(output) ? output.join("\n") : output;

    // ------------------------------------------------
    // 2) LangChain 사용 → 시스템 프롬프트 + human 메시지로 최종 프롬프트 구성
    // ------------------------------------------------
    // console.log(
    //   "[generate-avatar] Step 2.5: Building final DALL·E prompt via system/human messages...",
    // );

    // 시스템 프롬프트(픽셀 아트 조건)
    const systemMessage = SystemMessagePromptTemplate.fromTemplate(`
You are a pixel art prompt expert.
Based on the description below (pixel art style reference/character description),
please write the final prompt that can be directly input into DALL·E.

Conditions:
- Refer to the pixel art style with vibrant, lively details.
- Depict the person as a character in that natural, slightly dynamic style.
- The final output should be a single prompt sentence.
- Provide as much detail as possible about composition, layout, palette, and resolution.
- Only one character should be presented.
- The character should be facing to the left in a walking pose, with a bit of dynamic movement.
- The character should be depicted as a full-body figure.
- Use a pure white background, and do not include any other objects.
`);

    // 사용자 메시지(픽셀 아트 스타일 고정 + Replicate 결과 결합)
    const pixelArtStyle =
      "26x36 pixel size, big-headed cute character style, crisp outlines, subtle shading for a lively chibi look, charming proportions, full-body figure, pure white background, facing left in a walking pose with a slightly dynamic posture";

    const humanMessage = HumanMessagePromptTemplate.fromTemplate(`
Pixel art style description: {pixel_art_style}
Character description: {person_description}

Please create the final DALL·E prompt that reflects both of the above.
`);

    // LangChain ChatPromptTemplate
    const chatPrompt = ChatPromptTemplate.fromMessages([
      systemMessage,
      humanMessage,
    ]);

    // ChatOpenAI 인스턴스
    const llm = new ChatOpenAI({
      temperature: 0.3,
      modelName: "gpt-3.5-turbo", // or "gpt-4"
      // apiKey: process.env.OPENAI_API_KEY, // ChatOpenAI 옵션에서 사용
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const chain = chatPrompt.pipe(llm);

    // chain.invoke: 실제 LLM 호출
    const finalPromptResult = await chain.invoke({
      pixel_art_style: pixelArtStyle,
      person_description: replicatePrompt,
    });

    // 최종 프롬프트
    const dallEPrompt = String(finalPromptResult.content).trim();

    // console.log(
    //   "[generate-avatar] Step 2.5: Final DALL·E prompt =>",
    //   dallEPrompt,
    // );

    // ------------------------------------------------
    // 3) DALL·E: 텍스트 → 이미지 URL
    // ------------------------------------------------
    // console.log("[generate-avatar] Step 3: DALL·E start...");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const dalleResp = (await openai.images.generate({
      prompt: dallEPrompt,
      n: 1,
      size: "1024x1024",
    })) as DallEGenerateResponse;

    // console.log(
    //   "[generate-avatar] Step 3: DALL·E success, response=",
    //   dalleResp,
    // );

    const dallEImageUrl = dalleResp.data[0]?.url;
    if (!dallEImageUrl) {
      // console.error("[generate-avatar] Step 3: DALL·E returned no url!");
      return NextResponse.json(
        { success: false, error: "DALL·E no url" },
        { status: 500 },
      );
    }

    // ------------------------------------------------
    // 4) remove.bg
    // ------------------------------------------------
    // console.log(
    //   "[generate-avatar] Step 4: remove.bg start. dallEImageUrl=",
    //   dallEImageUrl,
    // );

    // remove.bg는 public URL을 받아야 하며,
    // 만약 URL이 만료/접근 불가 상태라면 400(Bad Request) 발생 가능.
    const formData = new FormData();
    formData.append("size", "auto");
    formData.append("image_url", dallEImageUrl);

    const removeBgResp = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": process.env.REMOVE_BG_API_KEY ?? "",
      },
      body: formData,
    });

    if (!removeBgResp.ok) {
      // console.error(
      //   "[generate-avatar] Step 4: remove.bg failed code=",
      //   removeBgResp.status,
      //   removeBgResp.statusText,
      // );
      return NextResponse.json(
        {
          success: false,
          error: `remove.bg failed: ${removeBgResp.status} ${removeBgResp.statusText}`,
        },
        { status: 500 },
      );
    }

    const removedBgArrayBuffer = await removeBgResp.arrayBuffer();
    // console.log(
    //   "[generate-avatar] Step 4: remove.bg success, length=",
    //   removedBgArrayBuffer.byteLength,
    // );

    // ------------------------------------------------
    // 5) Sharp(webp 변환) + S3 업로드
    // ------------------------------------------------
    // console.log("[generate-avatar] Step 5: sharp & S3 upload...");
    const webpBuffer = await sharp(Buffer.from(removedBgArrayBuffer))
      .webp({ quality: 80 })
      .toBuffer();

    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
      },
    });

    const bucketName = "jgtower";
    const key = `avatars/${Date.now()}.webp`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: webpBuffer,
        ContentType: "image/webp",
      }),
    );
    // console.log("[generate-avatar] Step 5: S3 upload success");

    const finalS3Url = `https://${bucketName}.s3.amazonaws.com/${key}`;

    // ------------------------------------------------
    // 완료
    // ------------------------------------------------
    // console.log("[generate-avatar] Step 6: Return success =>", finalS3Url);
    return NextResponse.json({
      success: true,
      finalImageUrl: finalS3Url,
    });
  } catch (error: unknown) {
    // console.error("[generate-avatar] Error in main try-catch:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
