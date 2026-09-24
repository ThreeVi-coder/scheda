-- 15_realtime_schede.sql
-- Accende la "diretta" (Supabase Realtime) sulla tabella public.schede, così le
-- modifiche alla riga di un giocatore (estasi_slot, origine_sbloccata) arrivano
-- al suo browser SENZA ricaricare la pagina: il lucchetto delle Estasi si apre
-- da solo, gli sblocchi si vedono subito, ecc.
--
-- La pubblicazione "supabase_realtime" esiste già (profili e ruoli sono in
-- diretta da tempo): qui mi limito ad aggiungerci schede, ma SOLO se non c'è già.
-- Rilanciabile all'infinito senza errori (idempotente): se schede è già dentro,
-- oppure la pubblicazione non esiste, non fa niente.
--
-- La sicurezza resta quella di sempre: Realtime rispetta la RLS, quindi ogni
-- browser riceve solo le modifiche alle righe che ha già il diritto di leggere
-- (un giocatore: la propria; lo staff: quelle che può vedere). Non serve alcuna
-- policy nuova.

do $$
begin
  if exists (
        select 1 from pg_publication where pubname = 'supabase_realtime'
     )
     and not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'schede'
     )
  then
    alter publication supabase_realtime add table public.schede;
  end if;
end $$;
