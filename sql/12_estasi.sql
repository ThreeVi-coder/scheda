-- ============================================================
--  ESTASI ed ANEDONIE — Mattone 1: la tabella del catalogo
--  Crea la tabella "estasi": tutte le voci del catalogo (Estasi e
--  Anedonie), divise per LOBO (frontale/parietale/temporale/
--  occipitale) e per RARITÀ. Ogni voce ha i tre testi del documento:
--  Effetto (la meccanica), Origine (come nasce, in-lore) e
--  Manifestazione (il segno fisico).
--
--  È dato di riferimento gestito dallo staff, come le razze/talenti/
--  privilegi: tutti leggono, solo supporto/sviluppatore scrivono.
--  Il carico vero (le 120 voci dall'Excel) sta nel seed 13, a parte.
--
--  L'ASSEGNAZIONE dei 4 slot al personaggio (chi ha cosa) NON sta qui:
--  arriverà in un mattone successivo, come colonna sulla tabella
--  "schede" scritta solo dai master.
--
--  Si può RILANCIARE quante volte si vuole senza rompere niente.
-- ============================================================

create table if not exists public.estasi (
  id             uuid primary key default gen_random_uuid(),
  lobo           text        not null,   -- frontale | parietale | temporale | occipitale
  rarita         text        not null,   -- comune | non_comune | rara | molto_rara | leggendaria
  tipo           text        not null,   -- estasi | anedonia
  coppia         integer     not null default 0,  -- lega l'Estasi alla sua Anedonia gemella (stesso lobo)
  nome           text        not null,
  effetto        text,                   -- la meccanica
  origine        text,                   -- come nasce (in-lore)
  manifestazione text,                   -- il segno fisico visibile
  ordine         integer     not null default 0,  -- ordine di visualizzazione dentro il lobo
  creato_da      uuid        default auth.uid(),
  creato_il      timestamptz not null default now(),
  modificato_il  timestamptz not null default now()
);

-- Se una versione precedente esisteva senza qualche colonna, la aggiungo qui
-- (innocuo se c'è già): così lo script resta ri-lanciabile.
alter table public.estasi add column if not exists lobo           text;
alter table public.estasi add column if not exists rarita         text;
alter table public.estasi add column if not exists tipo           text;
alter table public.estasi add column if not exists coppia         integer     not null default 0;
alter table public.estasi add column if not exists nome           text;
alter table public.estasi add column if not exists effetto        text;
alter table public.estasi add column if not exists origine        text;
alter table public.estasi add column if not exists manifestazione text;
alter table public.estasi add column if not exists ordine         integer     not null default 0;
alter table public.estasi add column if not exists creato_da      uuid        default auth.uid();
alter table public.estasi add column if not exists creato_il      timestamptz not null default now();
alter table public.estasi add column if not exists modificato_il  timestamptz not null default now();

create index if not exists estasi_lobo_idx   on public.estasi (lobo, ordine);
create index if not exists estasi_coppia_idx on public.estasi (lobo, rarita, coppia);

-- ACCESSO (RLS) — stesse regole delle razze/privilegi -----------------
-- Tutti gli utenti loggati LEGGONO; solo supporto/sviluppatore scrivono.
alter table public.estasi enable row level security;

drop policy if exists estasi_leggi on public.estasi;
create policy estasi_leggi on public.estasi
  for select to authenticated using (true);

drop policy if exists estasi_inserisci on public.estasi;
create policy estasi_inserisci on public.estasi
  for insert to authenticated
  with check (exists (select 1 from public.ruoli r
                      where r.user_id = auth.uid()
                        and r.ruolo in ('supporto','sviluppatore')));

drop policy if exists estasi_modifica on public.estasi;
create policy estasi_modifica on public.estasi
  for update to authenticated
  using      (exists (select 1 from public.ruoli r
                      where r.user_id = auth.uid()
                        and r.ruolo in ('supporto','sviluppatore')))
  with check (exists (select 1 from public.ruoli r
                      where r.user_id = auth.uid()
                        and r.ruolo in ('supporto','sviluppatore')));

drop policy if exists estasi_cancella on public.estasi;
create policy estasi_cancella on public.estasi
  for delete to authenticated
  using (exists (select 1 from public.ruoli r
                 where r.user_id = auth.uid()
                   and r.ruolo in ('supporto','sviluppatore')));

-- Fine. Nel Table Editor compare la tabella nuova e vuota "estasi".
-- Poi lancia il seed 13 per riempirla con le 120 voci.
