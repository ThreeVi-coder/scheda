-- ============================================================
--  TALENTI (le CARTE) — Mattone 1: le fondamenta
--  Crea la tabella "talenti", le regole d'accesso (tutti leggono,
--  solo supporto/sviluppatore scrivono) e il secchio immagini.
--  Stesso stampo del Grimorio delle razze (01_razze.sql).
--  Si puo' RILANCIARE quante volte si vuole senza rompere niente.
-- ============================================================

-- 1) LA TABELLA -------------------------------------------------
create table if not exists public.talenti (
  id                 uuid primary key default gen_random_uuid(),
  nome               text not null,
  benefici           text,            -- cosa da' il talento (testo a mano)
  prerequisiti       text,            -- es. "livello 4", "Forza 13+"
  immagine_url       text,            -- illustrazione della carta
  tipo_asi           text not null default 'nessuno',  -- 'nessuno' | 'fisso' | 'scelta'
  asi_caratteristica text,            -- quale caratteristica se tipo_asi = 'fisso'
  fonte              text,            -- da quale manuale/homebrew viene
  ordine             integer     not null default 0,
  creato_da          uuid        default auth.uid(),
  creato_il          timestamptz not null default now(),
  modificato_il      timestamptz not null default now()
);

-- Se una versione precedente della tabella esisteva senza qualche
-- colonna, la aggiungo qui (innocuo se c'e' gia'). Cosi' lo script
-- resta ri-lanciabile anche se lo schema cambia in futuro.
alter table public.talenti add column if not exists nome               text;
alter table public.talenti add column if not exists benefici           text;
alter table public.talenti add column if not exists prerequisiti       text;
alter table public.talenti add column if not exists immagine_url       text;
alter table public.talenti add column if not exists tipo_asi           text        not null default 'nessuno';
alter table public.talenti add column if not exists asi_caratteristica text;
alter table public.talenti add column if not exists fonte              text;
alter table public.talenti add column if not exists ordine             integer     not null default 0;
alter table public.talenti add column if not exists creato_da          uuid        default auth.uid();
alter table public.talenti add column if not exists creato_il          timestamptz not null default now();
alter table public.talenti add column if not exists modificato_il      timestamptz not null default now();

-- Un solo tipo di +1 ammesso: nessuno / fisso / scelta. Ricreo il
-- vincolo ad ogni lancio cosi' resta allineato anche se lo cambio.
alter table public.talenti drop constraint if exists talenti_tipo_asi_valido;
alter table public.talenti add  constraint talenti_tipo_asi_valido
  check (tipo_asi in ('nessuno','fisso','scelta'));

-- ordina il mazzo in fretta (alfabetico, con l'ordine manuale come spareggio)
create index if not exists talenti_nome_idx on public.talenti (ordine, nome);

-- 2) ACCESSO ALLA TABELLA (RLS) --------------------------------
alter table public.talenti enable row level security;

-- Tutti gli utenti loggati LEGGONO i talenti.
drop policy if exists talenti_leggi on public.talenti;
create policy talenti_leggi on public.talenti
  for select
  to authenticated
  using (true);

-- Solo supporto/sviluppatore INSERISCONO.
drop policy if exists talenti_inserisci on public.talenti;
create policy talenti_inserisci on public.talenti
  for insert
  to authenticated
  with check (
    exists (select 1 from public.ruoli r
            where r.user_id = auth.uid()
              and r.ruolo in ('supporto','sviluppatore'))
  );

-- Solo supporto/sviluppatore MODIFICANO.
drop policy if exists talenti_modifica on public.talenti;
create policy talenti_modifica on public.talenti
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
drop policy if exists talenti_cancella on public.talenti;
create policy talenti_cancella on public.talenti
  for delete
  to authenticated
  using (
    exists (select 1 from public.ruoli r
            where r.user_id = auth.uid()
              and r.ruolo in ('supporto','sviluppatore'))
  );

-- 3) LO SPAZIO IMMAGINI (Storage) ------------------------------
-- Un "secchio" pubblico in lettura: le illustrazioni delle carte
-- restano qui e vengono servite da una rete veloce, cosi' il sito
-- non rallenta.
insert into storage.buckets (id, name, public)
values ('talenti', 'talenti', true)
on conflict (id) do nothing;

-- Chiunque VEDE le immagini del secchio.
drop policy if exists talenti_img_leggi on storage.objects;
create policy talenti_img_leggi on storage.objects
  for select
  using (bucket_id = 'talenti');

-- Solo supporto/sviluppatore CARICANO immagini.
drop policy if exists talenti_img_carica on storage.objects;
create policy talenti_img_carica on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'talenti'
    and exists (select 1 from public.ruoli r
                where r.user_id = auth.uid()
                  and r.ruolo in ('supporto','sviluppatore'))
  );

-- Solo supporto/sviluppatore SOSTITUISCONO immagini.
drop policy if exists talenti_img_modifica on storage.objects;
create policy talenti_img_modifica on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'talenti'
    and exists (select 1 from public.ruoli r
                where r.user_id = auth.uid()
                  and r.ruolo in ('supporto','sviluppatore'))
  );

-- Solo supporto/sviluppatore CANCELLANO immagini.
drop policy if exists talenti_img_cancella on storage.objects;
create policy talenti_img_cancella on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'talenti'
    and exists (select 1 from public.ruoli r
                where r.user_id = auth.uid()
                  and r.ruolo in ('supporto','sviluppatore'))
  );

-- Fine. Se tutto va, in Table Editor compare "talenti" (vuota) e in
-- Storage compare il secchio "talenti".
