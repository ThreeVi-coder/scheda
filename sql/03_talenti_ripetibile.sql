-- ============================================================
--  TALENTI — aggiunta: "ripetibile"
--  Alcuni talenti si possono prendere più di una volta. Aggiungo una
--  colonna vero/falso (default: falso). Si può RILANCIARE senza rompere
--  niente: se la colonna c'è già, non fa nulla.
-- ============================================================

alter table public.talenti
  add column if not exists ripetibile boolean not null default false;

-- Fine. Nel Table Editor la tabella "talenti" ha ora la colonna
-- "ripetibile" (spenta su tutti i talenti esistenti).
