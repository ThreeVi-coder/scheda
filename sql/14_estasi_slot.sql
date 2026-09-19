-- ============================================================
--  ESTASI ed ANEDONIE — Mattone 2: l'ASSEGNAZIONE al personaggio
--
--  Ogni personaggio ha 4 slot (uno per lobo: frontale/parietale/
--  temporale/occipitale). In ogni slot può esserci una voce del
--  catalogo "estasi" (una Estasi o una Anedonia), oppure niente.
--  Chi decide cosa mettere è il MASTER (narrazione): NON il giocatore.
--
--  Perciò l'assegnazione NON sta nel blob "dati" (che il giocatore
--  riscrive a ogni salvataggio e azzererebbe tutto), ma in una colonna
--  a parte della riga della scheda — esattamente come "origine_sbloccata".
--  È una mappa JSON lobo→id-voce, es.  {"frontale":"…uuid…","occipitale":"…"}.
--
--  Il giocatore la LEGGE sulla propria riga (per accendere i lobi), ma il
--  suo salvataggio non la include, quindi non può cambiarla.
--
--  La SCRITTURA passa da una funzione dedicata (assegna_estasi) che:
--   1) controlla da sola che chi chiama sia master o sviluppatore;
--   2) accetta solo le 4 chiavi-lobo valide e solo id di voci che
--      esistono davvero e appartengono a QUEL lobo (scarta il resto);
--   3) scrive solo la colonna estasi_slot, niente altro.
--  Così non serve toccare le regole (RLS) già esistenti sulle schede, e
--  un master può assegnare anche se non ha il permesso generale di
--  modificare le schede altrui. Lo sviluppatore fa sempre tutto.
--
--  Si può RILANCIARE quante volte si vuole senza rompere niente.
-- ============================================================

-- 1) la colonna: mappa JSON, vuota di default su tutte le schede.
alter table public.schede
  add column if not exists estasi_slot jsonb not null default '{}'::jsonb;

-- 2) la funzione di assegnazione (gira coi permessi del proprietario:
--    fa il suo controllo di ruolo da sé e aggira le RLS in sicurezza).
create or replace function public.assegna_estasi(target uuid, nuovo jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  k       text;
  v       text;
  pulito  jsonb := '{}'::jsonb;
  toccate integer;
begin
  -- solo master o sviluppatore (lo sviluppatore fa sempre tutto)
  if not exists (select 1 from public.ruoli r
                 where r.user_id = auth.uid()
                   and r.ruolo in ('master','sviluppatore')) then
    raise exception 'Non sei autorizzato ad assegnare Estasi ed Anedonie.';
  end if;

  if nuovo is null then nuovo := '{}'::jsonb; end if;

  -- tengo solo le 4 chiavi-lobo, e solo id di voci esistenti di QUEL lobo.
  foreach k in array array['frontale','parietale','temporale','occipitale'] loop
    v := nullif(nuovo ->> k, '');
    if v is not null and exists (
         select 1 from public.estasi e where e.id::text = v and e.lobo = k
       ) then
      pulito := pulito || jsonb_build_object(k, v);
    end if;
  end loop;

  update public.schede set estasi_slot = pulito where user_id = target;
  get diagnostics toccate = row_count;
  if toccate = 0 then
    raise exception 'Questa persona non ha ancora una scheda salvata: non posso assegnare gli slot.';
  end if;

  return pulito;
end;
$$;

grant execute on function public.assegna_estasi(uuid, jsonb) to authenticated;

-- Fine. Nel Table Editor la tabella "schede" ha ora la colonna "estasi_slot"
-- (vuota, {} , su tutte le schede) e compare la funzione "assegna_estasi".
