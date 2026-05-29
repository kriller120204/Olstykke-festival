-- ============================================================
-- Afstemningskandidater med billedupload
-- Kør i Supabase → SQL Editor
-- ============================================================

create table if not exists vote_options (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  owner      text default '',
  image_url  text,
  sort_order int  default 0
);

alter table vote_options enable row level security;

create policy "Public read votes" on vote_options for select using (true);
create policy "Anon manage votes" on vote_options for all using (true) with check (true);

insert into vote_options (name, owner, sort_order) values
('Cadillac De Ville Lowrider ''70', 'Hilde''s Custom Garage',    1),
('Simpsons Scania',                 'Morten Rasmussen',           2),
('E-Trasborg Showtruck',            'E-Trasborg',                 3),
('Vejby Cementstøberi',             'Vejby Cementstøberi',        4),
('Casper G. Scania',                'Casper G. Christensen',      5),
('Poul H. Hansen Flåde',            'Poul H. Hansen',             6),
('Scarlet Autohjælp',               'Scarlet Autohjælp',          7),
('Sander''s Tuk Tuk',               'Sander fra Sorø',            8);
