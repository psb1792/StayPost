create table if not exists public.emotion_cards (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text not null,
  emotion text,
  template_id text,
  store_slug text,
  created_at timestamp with time zone default timezone('utc', now())
);
