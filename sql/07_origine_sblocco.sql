-- ============================================================
--  SCHEDE — aggiunta: "origine_sbloccata"
--  Il +1 del Talento d'Origine resta BLOCCATO finché lo staff (supporto o
--  sviluppatore) non conferma la missione di lore. Quel via libera è di
--  competenza dello staff, NON del giocatore: perciò NON sta dentro il blob
--  "dati" (che il giocatore riscrive a ogni salvataggio), ma in una colonna
--  a parte della riga della scheda. Così il salvataggio del giocatore (che
--  manda solo "dati" e "user_id") non può azzerare lo sblocco.
--
--  Vero/falso, spento di default. Si può RILANCIARE senza rompere niente: se
--  la colonna c'è già, non fa nulla. Non tocca nessuna regola (RLS) esistente:
--  lo staff che già apre e salva le schede altrui può scrivere anche questa
--  colonna; il giocatore la legge sulla propria riga ma il suo salvataggio non
--  la include.
-- ============================================================

alter table public.schede
  add column if not exists origine_sbloccata boolean not null default false;

-- Fine. Nel Table Editor la tabella "schede" ha ora la colonna
-- "origine_sbloccata" (spenta su tutte le schede esistenti).
