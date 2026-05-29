-- ============================================================
-- Hvad-sker-der-tiles og generelle indstillinger
-- Kør i Supabase → SQL Editor
-- ============================================================

create table if not exists what_items (
  id         uuid primary key default gen_random_uuid(),
  num        text not null,
  title      text not null,
  sub        text default '',
  sort_order int  default 0
);

create table if not exists site_settings (
  key        text primary key,
  value      text not null,
  label      text default '',
  updated_at timestamptz default now()
);

alter table what_items    enable row level security;
alter table site_settings enable row level security;

create policy "Public read what"     on what_items    for select using (true);
create policy "Public read settings" on site_settings for select using (true);
create policy "Anon manage what"     on what_items    for all using (true) with check (true);
create policy "Anon manage settings" on site_settings for all using (true) with check (true);

insert into what_items (num, title, sub, sort_order) values
('01','Heavy Showtrucks','Chrome, lyssætning og lyd der vibrerer i brystkassen.',1),
('02','Lastbiler','Over 150 tilmeldte — Scania, Volvo, MAN, DAF og specialbygger.',2),
('03','Lowriders & Custom','Hopping hydraulics, candy paint og amerikanere på dansk asfalt.',3),
('04','Motorcykler','Cruiser, sport, custom og veteran på to hjul.',4),
('05','Veteran & Special','Klassikere, ombyggede tractorer og specialbyg du aldrig har set før.',5),
('06','Musik & Scene','Live optræden lørdag aften — rock, country og dansktop.',6),
('07','Mad & Øl','Pølsevogn, grillmad, fadøl og fællesspisning fra Holstedt Pøllegris.',7),
('08','Kræmmer & Tivoli','Markedsboder, karrusel og aktiviteter for hele familien.',8);

insert into site_settings (key, value, label) values
('phone',        '33 60 52 74',  'Telefonnummer'),
('facebook_url', '#',            'Facebook-link'),
('address1',     'Stadionvej',   'Adresse linje 1'),
('address2',     '3650 Ølstykke','Adresse linje 2'),
('ticket_price', '30',           'Billetpris (kr)');
