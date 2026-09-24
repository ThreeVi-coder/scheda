-- ============================================================
--  ESTASI ed ANEDONIE — nessuno se le assegna DA SOLO
--
--  Aggiunge un divieto alla funzione assegna_estasi: un master NON può
--  assegnare Estasi/Anedonie alla PROPRIA scheda (target = sé stesso).
--  Le assegna solo agli altri. È la stessa regola dello sblocco del +1
--  d'origine: la narrazione la incide qualcun altro, non te la fai da solo.
--
--  Unica eccezione: lo SVILUPPATORE, che per regola ferrea fa sempre tutto,
--  anche sulla propria scheda.
--
--  Questa è la sicurezza VERA (il database rifiuta comunque); il frontend
--  nasconde solo il pulsante "+ Assegna" sulla propria scheda.
--
--  Ridefinisce solo la funzione (create or replace): rilanciabile a volontà.
-- ============================================================

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

  -- NESSUNO se le assegna da solo: se il bersaglio sono io, blocco —
  -- tranne lo sviluppatore, che fa sempre tutto anche sulla propria scheda.
  if target = auth.uid()
     and not exists (select 1 from public.ruoli r
                     where r.user_id = auth.uid()
                       and r.ruolo = 'sviluppatore') then
    raise exception 'Non puoi assegnare Estasi ed Anedonie a te stesso: deve farlo un altro master.';
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
