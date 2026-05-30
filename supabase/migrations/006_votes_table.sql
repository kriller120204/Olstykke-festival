-- ============================================================
-- Stemmer til afstemningen (persistente på tværs af brugere)
-- Kør i Supabase → SQL Editor
-- ============================================================

create table if not exists votes (
  id         uuid primary key default gen_random_uuid(),
  option_id  uuid not null,
  created_at timestamptz default now()
);

alter table votes enable row level security;

create policy "Public read votes" on votes for select using (true);
create policy "Anon insert vote"  on votes for insert with check (true);
