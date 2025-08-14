{
  "doc_meta": {
    "id": "DB-001",
    "version": "2025-01-14",
    "owners": ["pablo"],
    "scope": ["database", "supabase", "postgresql"],
    "related": ["ARCH-001", "API-001"]
  }
}

# StayPost 데이터베이스 스키마

이 문서는 StayPost 프로젝트의 데이터베이스 스키마와 관련 설정을 설명합니다.

## 📋 목차
- [개요](#개요)
- [테이블 구조](#테이블-구조)
- [인덱스](#인덱스)
- [제약 조건](#제약-조건)
- [RLS 정책](#rls-정책)
- [마이그레이션](#마이그레이션)
- [백업 및 복구](#백업-및-복구)

## 🏗️ 아키텍처
<!-- 아키텍처 관련 내용 -->

## 🔌 API
<!-- API 관련 내용 -->

## 🎨 컴포넌트
<!-- 컴포넌트 관련 내용 -->

## 🔄 상태 관리
<!-- 상태 관리 관련 내용 -->

## 🤖 AI 통합
<!-- AI 통합 관련 내용 -->

## 🚀 배포
<!-- 배포 관련 내용 -->

## 🐛 문제 해결
<!-- 문제 해결 관련 내용 -->

## 🔮 향후 계획
<!-- 향후 계획 관련 내용 -->

## 개요

StayPost는 Supabase를 기반으로 한 PostgreSQL 데이터베이스를 사용합니다. 주요 테이블은 다음과 같습니다:

- `store_profiles`: 가게 정보 관리
- `emotion_cards`: 감정 카드 데이터
- `reservations`: 예약 정보

## 테이블 구조

### store_profiles 테이블

```sql
CREATE TABLE store_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  store_name TEXT NOT NULL,
  style_presets JSONB DEFAULT '[]',
  intro TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### emotion_cards 테이블

```sql
CREATE TABLE emotion_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  emotion TEXT NOT NULL,
  template_id TEXT NOT NULL,
  store_slug TEXT REFERENCES store_profiles(slug),
  seo_title TEXT,
  seo_keywords TEXT[],
  seo_hashtags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### reservations 테이블

```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_slug TEXT REFERENCES store_profiles(slug),
  date DATE NOT NULL,
  time TIME NOT NULL,
  person_count INTEGER NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  request TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 인덱스

```sql
-- store_profiles 테이블 인덱스
CREATE INDEX idx_store_profiles_user_id ON store_profiles(user_id);
CREATE INDEX idx_store_profiles_slug ON store_profiles(slug);

-- emotion_cards 테이블 인덱스
CREATE INDEX idx_emotion_cards_user_id ON emotion_cards(user_id);
CREATE INDEX idx_emotion_cards_store_slug ON emotion_cards(store_slug);
CREATE INDEX idx_emotion_cards_created_at ON emotion_cards(created_at);

-- reservations 테이블 인덱스
CREATE INDEX idx_reservations_store_slug ON reservations(store_slug);
CREATE INDEX idx_reservations_date ON reservations(date);
```

## 제약 조건

```sql
-- store_profiles 테이블 제약 조건
ALTER TABLE store_profiles ADD CONSTRAINT check_slug_format 
  CHECK (slug ~ '^[a-z0-9-]+$');

-- emotion_cards 테이블 제약 조건
ALTER TABLE emotion_cards ADD CONSTRAINT check_emotion 
  CHECK (emotion IN ('설렘', '평온', '즐거움', '로맨틱', '힐링'));

-- reservations 테이블 제약 조건
ALTER TABLE reservations ADD CONSTRAINT check_person_count 
  CHECK (person_count > 0 AND person_count <= 20);
```

## RLS 정책

### store_profiles 테이블 RLS

```sql
-- RLS 활성화
ALTER TABLE store_profiles ENABLE ROW LEVEL SECURITY;

-- 사용자별 읽기 정책
CREATE POLICY "select_own_stores" ON store_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 사용자별 삽입 정책
CREATE POLICY "insert_own_stores" ON store_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 사용자별 수정 정책
CREATE POLICY "update_own_stores" ON store_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 사용자별 삭제 정책
CREATE POLICY "delete_own_stores" ON store_profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
```

### emotion_cards 테이블 RLS

```sql
-- RLS 활성화
ALTER TABLE emotion_cards ENABLE ROW LEVEL SECURITY;

-- 사용자별 읽기 정책
CREATE POLICY "select_own_cards" ON emotion_cards
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 사용자별 삽입 정책
CREATE POLICY "insert_own_cards" ON emotion_cards
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 사용자별 수정 정책
CREATE POLICY "update_own_cards" ON emotion_cards
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 사용자별 삭제 정책
CREATE POLICY "delete_own_cards" ON emotion_cards
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
```

### reservations 테이블 RLS

```sql
-- RLS 활성화
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (예약 페이지용)
CREATE POLICY "select_public_reservations" ON reservations
  FOR SELECT TO anon
  USING (true);

-- 인증된 사용자 삽입 정책
CREATE POLICY "insert_authenticated_reservations" ON reservations
  FOR INSERT TO authenticated
  WITH CHECK (true);
```

## 마이그레이션

### 마이그레이션 파일 구조

```
supabase/migrations/
├── 20250101000000_create_reservations_table.sql
├── 20250102000000_update_store_profiles_rls.sql
├── 20250103000000_add_style_presets_to_store_profiles.sql
└── 20250730180000_create_emotion_cards.sql
```

### 마이그레이션 실행

```bash
# 로컬 개발 환경
supabase db reset

# 프로덕션 환경
supabase db push
```

## 백업 및 복구

### 자동 백업 설정

Supabase는 자동으로 매일 백업을 수행합니다. 백업 보관 기간은 7일입니다.

### 수동 백업

```bash
# 데이터베이스 덤프 생성
pg_dump -h db.supabase.co -U postgres -d postgres > backup.sql

# 특정 테이블만 백업
pg_dump -h db.supabase.co -U postgres -d postgres -t store_profiles > store_profiles_backup.sql
```

### 복구

```bash
# 전체 데이터베이스 복구
psql -h db.supabase.co -U postgres -d postgres < backup.sql

# 특정 테이블 복구
psql -h db.supabase.co -U postgres -d postgres < store_profiles_backup.sql
```

## 🏛️ ADR (Architecture Decision Records)

### ADR-001: Supabase PostgreSQL 선택
**날짜**: 2025-01-14  
**상태**: 승인됨  
**컨텍스트**: 데이터베이스 플랫폼 선택  
**결정**: Supabase PostgreSQL로 개발 속도와 확장성 확보  
**결과**: 빠른 개발 및 관리 용이성 달성

### ADR-002: Row Level Security (RLS) 적용
**날짜**: 2025-01-14  
**상태**: 승인됨  
**컨텍스트**: 데이터 보안 및 사용자별 접근 제어  
**결정**: PostgreSQL RLS를 사용하여 데이터베이스 레벨 보안 구현  
**결과**: 강력한 데이터 보안 및 사용자 격리

## 📋 Changelog

| 날짜 | 버전 | 요약 |
|------|------|------|
| 2025-01-14 | v1.0.0 | 데이터베이스 스키마 문서 초기 작성 |
| 2025-01-14 | v1.1.0 | RLS 정책 및 인덱스 추가 |
| 2025-01-14 | v1.2.0 | 마이그레이션 및 백업 가이드 추가 |
