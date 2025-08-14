-- 0) 소유자 컬럼이 없으면 추가(빠른 패치)
do $$
begin
  if not exists (select 1 from information_schema.columns 
                 where table_schema = 'public' 
                 and table_name = 'emotion_cards' 
                 and column_name = 'user_id') then
    alter table public.emotion_cards add column user_id uuid;
  end if;
end $$;

-- (선택) FK로 auth.users와 연결해 두면 데이터 무결성 관리에 좋습니다.
-- 이미 있으면 생성 안 됨
do $$
begin
  if not exists (select 1 from information_schema.table_constraints 
                 where table_schema = 'public' 
                 and table_name = 'emotion_cards' 
                 and constraint_name = 'emotion_cards_user_id_fkey') then
    alter table public.emotion_cards
      add constraint emotion_cards_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

-- 1) RLS 활성화
alter table if exists public.emotion_cards enable row level security;

-- 2) 중복 정책 제거(여러 번 적용해도 안전)
drop policy if exists insert_own_emotion_card on public.emotion_cards;
drop policy if exists select_own_emotion_cards on public.emotion_cards;
drop policy if exists update_own_emotion_card on public.emotion_cards;
drop policy if exists delete_own_emotion_card on public.emotion_cards;

-- 3) 본인 소유만 허용 정책
create policy insert_own_emotion_card
on public.emotion_cards
for insert
to authenticated
with check (auth.uid() = user_id);

create policy select_own_emotion_cards
on public.emotion_cards
for select
to authenticated
using (auth.uid() = user_id);

create policy update_own_emotion_card
on public.emotion_cards
for update
to authenticated
using (auth.uid() = user_id);

create policy delete_own_emotion_card
on public.emotion_cards
for delete
to authenticated
using (auth.uid() = user_id);
