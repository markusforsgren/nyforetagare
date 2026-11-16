-- =============================================================
--  Nyföretagare – öppna forumet för alla medlemmar
--  Kör i Supabase: SQL Editor -> New query -> klistra in -> Run
--  Kör efter community.sql. Går att köra flera gånger.
--
--  Före: bara medlemmar med GODKÄND företagsprofil kunde skriva.
--  Nu:   alla som skapat en profil kan skriva direkt (även medan
--        profilen granskas). Nekade profiler kan inte skriva.
--        Profilsidan i företagskatalogen visas fortfarande först
--        efter godkännande.
-- =============================================================

create or replace function public.is_member(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select uid is not null and (
    exists (select 1 from public.companies where owner_id = uid and status in ('pending', 'approved'))
    or exists (select 1 from public.profiles where id = uid and aktiv)
  )
$$;

-- Medlemskatalogen: även profiler som granskas visas med namn,
-- men länk (slug) och logga visas bara för godkända profiler.
create or replace view public.members as
  select c.owner_id as user_id, c.namn,
         case when c.status = 'approved' then c.slug end as slug,
         case when c.status = 'approved' then c.logo_url end as logo_url,
         c.lan, c.bransch, 'foretag'::text as typ
  from public.companies c where c.status in ('pending', 'approved')
  union all
  select p.id, coalesce(nullif(p.namn, ''), 'Redaktionen'), null, null, null, 'Nyföretagare', 'redaktion'
  from public.profiles p
  where p.aktiv and not exists (select 1 from public.companies c2 where c2.owner_id = p.id and c2.status in ('pending', 'approved'));

grant select on public.members to anon, authenticated;
