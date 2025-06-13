import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // --- (나중에) FormData에서 이미지 꺼내기 ---
  // const formData = await req.formData();
  // const files = formData.getAll('images') as File[];

  // --- (나중에) OpenAI Vision + GPT 호출 로직 ---

  // 🟢  임시 캡션 반환
  return NextResponse.json({
    captions: [
      'A cozy morning at the guesthouse ☕️',
      'Golden hour vibes with stunning architecture ✨',
      'Perfect blend of comfort and elegance 🏡',
    ],
  });
}