-- ============================================================
--  GRIMORIO DELLE RAZZE — Mattone 1: le fondamenta
--  Crea la tabella "razze", le regole d'accesso (tutti leggono,
--  solo supporto/sviluppatore scrivono) e il secchio immagini.
--  Si puo' RILANCIARE quante volte si vuole senza rompere niente.
-- ============================================================

-- 1) LA TABELLA -------------------------------------------------
create table if not exists public.razze (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  tipologia     text,
  eta           text,
  dimensioni    text,
  velocita      text,
  aspetto       text,
  scurovisione  text,
  abilita       text,
  incantesimi   text,
  lingue        text,
  lore          text,
  manuale       text,
  immagine_url  text,
  ordine        integer     not null default 0,
  creato_da     uuid        default auth.uid(),
  creato_il     timestamptz not null default now(),
  modificato_il timestamptz not null default now()
);

-- Se una versione precedente della tabella esisteva senza qualche
-- colonna, la aggiungo qui (innocuo se c'e' gia'). Cosi' lo script
-- resta ri-lanciabile anche se lo schema cambia in futuro.
alter table public.razze add column if not exists nome          text;
alter table public.razze add column if not exists tipologia     text;
alter table public.razze add column if not exists eta           text;
alter table public.razze add column if not exists dimensioni    text;
alter table public.razze add column if not exists velocita      text;
alter table public.razze add column if not exists aspetto       text;
alter table public.razze add column if not exists scurovisione  text;
alter table public.razze add column if not exists abilita       text;
alter table public.razze add column if not exists incantesimi   text;
alter table public.razze add column if not exists lingue        text;
alter table public.razze add column if not exists lore          text;
alter table public.razze add column if not exists manuale       text;
alter table public.razze add column if not exists immagine_url  text;
alter table public.razze add column if not exists ordine        integer     not null default 0;
alter table public.razze add column if not exists creato_da     uuid        default auth.uid();
alter table public.razze add column if not exists creato_il     timestamptz not null default now();
alter table public.razze add column if not exists modificato_il timestamptz not null default now();

-- ordina l'elenco del grimorio in fretta (per nome)
create index if not exists razze_nome_idx on public.razze (ordine, nome);

-- 2) ACCESSO ALLA TABELLA (RLS) --------------------------------
alter table public.razze enable row level security;

-- Tutti gli utenti loggati LEGGONO il grimorio.
drop policy if exists razze_leggi on public.razze;
create policy razze_leggi on public.razze
  for select
  to authenticated
  using (true);

-- Solo supporto/sviluppatore INSERISCONO.
drop policy if exists razze_inserisci on public.razze;
create policy razze_inserisci on public.razze
  for insert
  to authenticated
  with check (
    exists (select 1 from public.ruoli r
            where r.user_id = auth.uid()
              and r.ruolo in ('supporto','sviluppatore'))
  );

-- Solo supporto/sviluppatore MODIFICANO.
drop policy if exists razze_modifica on public.razze;
create policy razze_modifica on public.razze
  for update
  to authenticated
  using (
    exists (select 1 from public.ruoli r
            where r.user_id = auth.uid()
              and r.ruolo in ('supporto','sviluppatore'))
  )
  with check (
    exists (select 1 from public.ruoli r
            where r.user_id = auth.uid()
              and r.ruolo in ('supporto','sviluppatore'))
  );

-- Solo supporto/sviluppatore CANCELLANO.
drop policy if exists razze_cancella on public.razze;
create policy razze_cancella on public.razze
  for delete
  to authenticated
  using (
    exists (select 1 from public.ruoli r
            where r.user_id = auth.uid()
              and r.ruolo in ('supporto','sviluppatore'))
  );

-- 3) LO SPAZIO IMMAGINI (Storage) ------------------------------
-- Un "secchio" pubblico in lettura: le illustrazioni restano qui
-- per sempre (finche' non le cambiate) e vengono servite da una
-- rete veloce, cosi' il sito non rallenta.
insert into storage.buckets (id, name, public)
values ('razze', 'razze', true)
on conflict (id) do nothing;

-- Chiunque VEDE le immagini del secchio.
drop policy if exists razze_img_leggi on storage.objects;
create policy razze_img_leggi on storage.objects
  for select
  using (bucket_id = 'razze');

-- Solo supporto/sviluppatore CARICANO immagini.
drop policy if exists razze_img_carica on storage.objects;
create policy razze_img_carica on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'razze'
    and exists (select 1 from public.ruoli r
                where r.user_id = auth.uid()
                  and r.ruolo in ('supporto','sviluppatore'))
  );

-- Solo supporto/sviluppatore SOSTITUISCONO immagini.
drop policy if exists razze_img_modifica on storage.objects;
create policy razze_img_modifica on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'razze'
    and exists (select 1 from public.ruoli r
                where r.user_id = auth.uid()
                  and r.ruolo in ('supporto','sviluppatore'))
  );

-- Solo supporto/sviluppatore CANCELLANO immagini.
drop policy if exists razze_img_cancella on storage.objects;
create policy razze_img_cancella on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'razze'
    and exists (select 1 from public.ruoli r
                where r.user_id = auth.uid()
                  and r.ruolo in ('supporto','sviluppatore'))
  );

-- Fine. Se tutto va, in Table Editor compare "razze" (vuota) e in
-- Storage compare il secchio "razze".
