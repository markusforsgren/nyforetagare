-- =============================================================
--  Nyföretagare – redaktionens användare och roller
--  Kör i Supabase: SQL Editor -> New query -> klistra in -> Run
-- =============================================================

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  namn        text,
  roll        text    not null default 'redaktor' check (roll in ('admin', 'redaktor')),
  lan         text[]  not null default '{}',   -- t.ex. {dalarna}. Tomt = alla län
  publicera   boolean not null default false,  -- false = artiklar går via granskning
  aktiv       boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Bara servern (service role-nyckeln i Netlify) får läsa och skriva tabellen.
alter table public.profiles enable row level security;

-- -------------------------------------------------------------
--  GÖR DIG SJÄLV TILL ADMIN
--  1. Authentication -> Users -> Add user -> Create new user
--     (din e-post + ett lösenord, bocka i "Auto Confirm User")
--  2. Byt e-postadressen nedan till din och kör raderna.
-- -------------------------------------------------------------
insert into public.profiles (id, email, namn, roll, publicera)
select id, email, 'Markus Forsgren', 'admin', true
from auth.users
where email = 'DIN-EPOST@exempel.se'
on conflict (id) do update set roll = 'admin', publicera = true, aktiv = true;
