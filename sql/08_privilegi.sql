-- ============================================================
--  PRIVILEGI DI CLASSE E SOTTOCLASSE — Mattone 1: le fondamenta
--  Crea due tabelle:
--    • "sottoclassi": l'elenco delle sottoclassi di ogni classe
--      (es. Mago → Scuola di Illusione), con a che livello si sceglie.
--    • "privilegi": ogni singolo privilegio, legato a una classe e,
--      se è una capacità di sottoclasse, alla sua sottoclasse.
--  Regole d'accesso come per le razze: tutti leggono, solo
--  supporto/sviluppatore scrivono. Si può RILANCIARE quante volte si
--  vuole senza rompere niente.
-- ============================================================

-- 1) LE SOTTOCLASSI --------------------------------------------
create table if not exists public.sottoclassi (
  id             uuid primary key default gen_random_uuid(),
  classe         text        not null,   -- la "chiave" della classe: mago, guerriero, ...
  nome           text        not null,   -- es. "Scuola di Illusione"
  descrizione    text,                   -- frase di presentazione (facoltativa)
  livello_scelta integer     not null default 3,  -- a che livello si sceglie
  ordine         integer     not null default 0,
  creato_da      uuid        default auth.uid(),
  creato_il      timestamptz not null default now(),
  modificato_il  timestamptz not null default now()
);

-- Se una versione precedente esisteva senza qualche colonna, la aggiungo
-- qui (innocuo se c'è già): così lo script resta ri-lanciabile.
alter table public.sottoclassi add column if not exists classe         text;
alter table public.sottoclassi add column if not exists nome           text;
alter table public.sottoclassi add column if not exists descrizione    text;
alter table public.sottoclassi add column if not exists livello_scelta integer     not null default 3;
alter table public.sottoclassi add column if not exists ordine         integer     not null default 0;
alter table public.sottoclassi add column if not exists creato_da      uuid        default auth.uid();
alter table public.sottoclassi add column if not exists creato_il      timestamptz not null default now();
alter table public.sottoclassi add column if not exists modificato_il  timestamptz not null default now();

create index if not exists sottoclassi_classe_idx on public.sottoclassi (classe, ordine, nome);

-- 2) I PRIVILEGI -----------------------------------------------
create table if not exists public.privilegi (
  id             uuid primary key default gen_random_uuid(),
  classe         text        not null,   -- la classe a cui appartiene (chiave)
  sottoclasse_id uuid        references public.sottoclassi(id) on delete cascade,
                                          -- NULL = privilegio della classe base;
                                          -- valorizzato = capacità di quella sottoclasse
  livello        integer     not null default 1,   -- a che livello si ottiene
  nome           text        not null,   -- es. "Recupero Arcano"
  descrizione    text,
  ordine         integer     not null default 0,   -- ordine a parità di livello
  creato_da      uuid        default auth.uid(),
  creato_il      timestamptz not null default now(),
  modificato_il  timestamptz not null default now()
);

alter table public.privilegi add column if not exists classe         text;
alter table public.privilegi add column if not exists sottoclasse_id uuid references public.sottoclassi(id) on delete cascade;
alter table public.privilegi add column if not exists livello        integer     not null default 1;
alter table public.privilegi add column if not exists nome           text;
alter table public.privilegi add column if not exists descrizione    text;
alter table public.privilegi add column if not exists ordine         integer     not null default 0;
alter table public.privilegi add column if not exists creato_da      uuid        default auth.uid();
alter table public.privilegi add column if not exists creato_il      timestamptz not null default now();
alter table public.privilegi add column if not exists modificato_il  timestamptz not null default now();

create index if not exists privilegi_classe_liv_idx on public.privilegi (classe, livello, ordine);
create index if not exists privilegi_sottoclasse_idx on public.privilegi (sottoclasse_id);

-- 3) ACCESSO (RLS) — stesse regole delle razze --------------------
-- Tutti gli utenti loggati LEGGONO; solo supporto/sviluppatore scrivono.

alter table public.sottoclassi enable row level security;
alter table public.privilegi   enable row level security;

-- ----- sottoclassi -----
drop policy if exists sottoclassi_leggi on public.sottoclassi;
create policy sottoclassi_leggi on public.sottoclassi
  for select to authenticated using (true);

drop policy if exists sottoclassi_inserisci on public.sottoclassi;
create policy sottoclassi_inserisci on public.sottoclassi
  for insert to authenticated
  with check (exists (select 1 from public.ruoli r
                      where r.user_id = auth.uid()
                        and r.ruolo in ('supporto','sviluppatore')));

drop policy if exists sottoclassi_modifica on public.sottoclassi;
create policy sottoclassi_modifica on public.sottoclassi
  for update to authenticated
  using      (exists (select 1 from public.ruoli r
                      where r.user_id = auth.uid()
                        and r.ruolo in ('supporto','sviluppatore')))
  with check (exists (select 1 from public.ruoli r
                      where r.user_id = auth.uid()
                        and r.ruolo in ('supporto','sviluppatore')));

drop policy if exists sottoclassi_cancella on public.sottoclassi;
create policy sottoclassi_cancella on public.sottoclassi
  for delete to authenticated
  using (exists (select 1 from public.ruoli r
                 where r.user_id = auth.uid()
                   and r.ruolo in ('supporto','sviluppatore')));

-- ----- privilegi -----
drop policy if exists privilegi_leggi on public.privilegi;
create policy privilegi_leggi on public.privilegi
  for select to authenticated using (true);

drop policy if exists privilegi_inserisci on public.privilegi;
create policy privilegi_inserisci on public.privilegi
  for insert to authenticated
  with check (exists (select 1 from public.ruoli r
                      where r.user_id = auth.uid()
                        and r.ruolo in ('supporto','sviluppatore')));

drop policy if exists privilegi_modifica on public.privilegi;
create policy privilegi_modifica on public.privilegi
  for update to authenticated
  using      (exists (select 1 from public.ruoli r
                      where r.user_id = auth.uid()
                        and r.ruolo in ('supporto','sviluppatore')))
  with check (exists (select 1 from public.ruoli r
                      where r.user_id = auth.uid()
                        and r.ruolo in ('supporto','sviluppatore')));

drop policy if exists privilegi_cancella on public.privilegi;
create policy privilegi_cancella on public.privilegi
  for delete to authenticated
  using (exists (select 1 from public.ruoli r
                 where r.user_id = auth.uid()
                   and r.ruolo in ('supporto','sviluppatore')));

-- Fine. Nel Table Editor compaiono due tabelle nuove e vuote:
-- "sottoclassi" e "privilegi".
