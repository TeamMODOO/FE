import { NextResponse } from "next/server";

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const createS3Client = () => {
  return new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
  });
};

/**
 * [POST] /api/resume
 *  - 파일: formData에 "file"로 전송
 *  - 본 예시에서는 PDF 업로드를 가정
 */
export async function POST(request: Request) {
  try {
    // 1) formData로 파일 받기
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 2) 서버 환경 변수 사용
    //  - 서버 코드는 NEXT_PUBLIC 없이 그냥 process.env.AWS_* 사용해도 됩니다.
    const s3Client = createS3Client();

    // 3) 파일을 Buffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // 4) 업로드할 버킷, 키 설정
    const bucketName = "jgtower";
    const key = `resume/${Date.now()}_${file.name}`;

    // 5) PutObjectCommand로 업로드
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: pdfBuffer,
        ContentType: "application/pdf",
      }),
    );

    // 6) 업로드된 파일 접근 URL
    const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    // 7) 성공 응답
    return NextResponse.json({ success: true, url: s3Url });
  } catch (error) {
    // console.error("Error uploading file to S3:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 },
    );
  }
}

/**
 * [GET] /api/resume
 *  - URL 파라미터로 key를 받아 해당 PDF 파일을 다운로드
 *  - 예시: /api/resume?key=resume/1234567890_example.pdf
 */
export async function GET(request: Request) {
  // URL에서 key 파라미터 추출
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "No key provided" }, { status: 400 });
  }

  // S3 클라이언트 생성
  const s3Client = createS3Client();

  // GetObjectCommand로 파일 다운로드
  const command = new GetObjectCommand({
    Bucket: "jgtower",
    Key: key,
  });

  const response = await s3Client.send(command);

  // 스트림을 Buffer로 변환
  const chunks = [];
  const bodyStream = response.Body as ReadableStream;
  const reader = bodyStream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const pdfBuffer = Buffer.concat(chunks);

  // PDF 파일 전송을 위한 응답 헤더 설정
  const headers = {
    "Content-Type": "application/pdf",
    "Content-Length": pdfBuffer.length.toString(),
    "Content-Disposition": `inline; filename=${key.split("/").pop()}`,
    // 1시간 동안 캐시 허용
    "Cache-Control": "public, max-age=3600",
  };

  // PDF 데이터와 함께 응답 반환
  return new NextResponse(pdfBuffer, { headers });
}
