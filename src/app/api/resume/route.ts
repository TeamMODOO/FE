import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

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
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
      },
    });

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
