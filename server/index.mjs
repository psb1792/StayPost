import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';
import 'dotenv/config';
import fetch, { FormData } from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

/* ---------- OpenAI & multer 초기화 ---------- */
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

/* ---------- 캡션 엔드포인트 ---------- */
app.post('/api/caption', upload.any(), async (req, res) => {
  try {
    // 1) 업로드 파일 확인
    const file = req.files[0];   // 첫 번째 파일
    if (!file) return res.status(400).json({ error: 'no-file' });

    // 2) 이미지 → data URI (Vision API용)
    const dataURI =
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // 3) GPT-4o-mini Vision 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' }, // JSON 객체 강제
      messages: [
        {
          role: 'system',
          content: `
            You are a social-media copywriter.
            Return a JSON object that looks like:
            { "captions": ["...", "...", "..."] }
            Do not output anything except valid JSON.
          `.trim(),
        },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: dataURI } },
          ],
        },
      ],
      max_tokens: 120,
      temperature: 0.8,
    });

    // 4) 응답 파싱 & 전송
    const { captions } = JSON.parse(
      completion.choices[0].message.content.trim(),
    );
    return res.json({ captions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'caption-fail' });
  }
});

/* ---------- 헬스 체크 ---------- */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

/* ---------- 서버 시작 ---------- */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 API on http://localhost:${PORT}`);
});

app.post('/api/relight', upload.single('image_file'), async (req, res) => {
  console.log(`[${new Date().toISOString()}] POST /api/relight 호출됨`);
  const ENDPOINT = 'https://clipdrop-api.co/portrait-surface-normals/v1';
  try {
    const prompt = req.body.prompt;
    const file = req.file;

    if (!file || !prompt) {
      return res.status(400).json({ error: 'Missing file or prompt' });
    }

    
    const formData = new FormData();
    formData.append('image_file', file.buffer, file.originalname);
    formData.append('prompt', prompt);

    const response = await fetch(ENDPOINT,  {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLIPDROP_API_KEY,
      },
      body: formData,
    });

    console.error(`🛑 ClipDrop 응답 상태: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`🛑 ClipDrop 오류 본문: ${errorText}`);
      return res.status(500).json({ error: 'ClipDrop relighting failed' });
    }

    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(Buffer.from(buffer));
    console.log('📥 파일 정보:', file);
    console.log('📝 프롬프트:', prompt);
  } catch (err) {
    console.error('❌ 리터칭 처리 실패:', err);
    res.status(500).json({ error: 'relight-fail' });
    console.error('❌ 리터칭 처리 실패:', err);
  }
});