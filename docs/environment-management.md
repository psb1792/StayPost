# 🔧 환경 관리 가이드

StayPost 프로젝트의 개발 및 운영 환경 설정과 관리 방법을 설명합니다.

## 📝 변경사항
- 2024-01-XX: Flask API 서버 및 AI 파이프라인 환경 설정 추가

## 환경 설정 개요

이 문서는 다양한 환경에서 StayPost 프로젝트를 설정하고 관리하는 방법을 다룹니다.

### 지원 환경
- **개발 환경**: 로컬 개발 서버
- **테스트 환경**: Supabase 로컬 환경
- **프로덕션 환경**: Netlify + Supabase Cloud

## 환경 변수 관리

### 필수 환경 변수

```env
# OpenAI API 설정
OPENAI_API_KEY=sk-your-api-key-here

# Supabase 설정
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Flask API 설정
VITE_AI_ROUTER_SERVICE_URL=http://localhost:8000
HOST=0.0.0.0
PORT=8000
DEBUG=true

# 데이터베이스 설정
CHROMA_DB_PATH=./chroma_db
LOG_PATH=./logs
```

## 개발 환경 설정

### 1. 의존성 설치
```bash
# Node.js 의존성
npm install

# Python 의존성
pip install -r requirements.txt
```

### 2. 환경 파일 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 실제 값 입력
```

### 3. 서버 실행
```bash
# 프론트엔드 개발 서버
npm run dev

# Flask API 서버
python app.py
```

## 프로덕션 환경 관리

프로덕션 환경 설정은 `docs/deployment-setup.md`를 참조하세요.