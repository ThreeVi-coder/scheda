"use strict";
/* ============================================================
   FINTO SUPABASE per le prove automatiche.
   Non è una copia fedele di Supabase: è quel tanto che basta a far
   partire app.js senza rete e senza login vero. Tiene i dati in memoria
   e risponde alle sole chiamate che la scheda fa davvero:
     - auth.getSession / signInWithOAuth / signOut
     - from(tabella).select().eq().order().maybeSingle()/then()
       + upsert/update/insert/delete (usati nel salvataggio e nello staff)
     - rpc(...) (sync_profilo, approva, pausa)
     - channel(...).on(...).subscribe()   (la "diretta", qui inerte)
   Se un domani app.js userà una chiamata nuova, va aggiunta qui.
   ============================================================ */

/* piccola risposta "alla Supabase": { data, error } dentro una Promise */
function ok(data){ return Promise.resolve({ data: (data === undefined ? null : data), error: null }); }

/* Costruttore di query per UNA tabella. Accumula i filtri .eq() e, quando
   qualcuno chiede il risultato (.then / .maybeSingle), applica i filtri sulle
   righe in memoria. select/order non cambiano nulla: tornano la stessa query. */
function makeTable(store, nome){
  var filtri = [];
  function righe(){
    var arr = store[nome] || [];
    return arr.filter(function(r){ return filtri.every(function(f){ return r[f[0]] === f[1]; }); });
  }
  var q = {
    select: function(){ return q; },
    order:  function(){ return q; },
    eq:     function(col, val){ filtri.push([col, val]); return q; },
    /* letture */
    maybeSingle: function(){ var r = righe(); return ok(r.length ? r[0] : null); },
    single:      function(){ var r = righe(); return ok(r.length ? r[0] : null); },
    then: function(risolvi, rifiuta){ return ok(righe()).then(risolvi, rifiuta); },
    /* scritture: aggiornano il magazzino in memoria e tornano un thenable */
    upsert: function(row){
      var arr = store[nome] || (store[nome] = []);
      var i = -1;
      for (var k = 0; k < arr.length; k++){ if (arr[k].user_id === row.user_id){ i = k; break; } }
      if (i >= 0) arr[i] = Object.assign({}, arr[i], row); else arr.push(row);
      return ok(row);
    },
    insert: function(row){ (store[nome] || (store[nome] = [])).push(row); return ok(row); },
    update: function(patch){
      return {
        eq: function(col, val){
          (store[nome] || []).forEach(function(r){ if (r[col] === val) Object.assign(r, patch); });
          return ok(null);
        }
      };
    },
    delete: function(){
      return {
        eq: function(col1, val1){
          return {
            eq: function(col2, val2){
              store[nome] = (store[nome] || []).filter(function(r){ return !(r[col1] === val1 && r[col2] === val2); });
              return ok(null);
            },
            then: function(risolvi, rifiuta){
              store[nome] = (store[nome] || []).filter(function(r){ return r[col1] !== val1; });
              return ok(null).then(risolvi, rifiuta);
            }
          };
        }
      };
    }
  };
  return q;
}

/* seed = { session, schede:[...], profili:[...], ruoli:[...], razze:[...],
   talenti:[...], sottoclassi:[...], privilegi:[...] } */
function makeFakeSupabase(seed){
  var store = {
    schede:     (seed && seed.schede)     || [],
    profili:    (seed && seed.profili)    || [],
    ruoli:      (seed && seed.ruoli)      || [],
    razze:      (seed && seed.razze)      || [],
    talenti:    (seed && seed.talenti)    || [],
    sottoclassi:(seed && seed.sottoclassi)|| [],
    privilegi:  (seed && seed.privilegi)  || [],
    estasi:     (seed && seed.estasi)     || []
  };
  var session = (seed && seed.session) || null;
  var client = {
    _store: store,   // esposto per le prove (ispezione/scrittura diretta)
    auth: {
      getSession:        function(){ return ok({ session: session }); },
      signInWithOAuth:   function(){ return ok({}); },
      signOut:           function(){ return ok({}); },
      onAuthStateChange: function(){ return { data: { subscription: { unsubscribe: function(){} } } }; }
    },
    from: function(nome){ return makeTable(store, nome); },
    rpc:  function(nome, args){
      // rispecchia la funzione SQL "assegna_estasi": tiene solo le 4 chiavi-lobo
      // e solo id di voci che esistono e appartengono a QUEL lobo; scrive la
      // colonna estasi_slot della scheda e ritorna la mappa ripulita.
      if(nome === "assegna_estasi"){
        // rispecchia anche i divieti della funzione SQL: chi chiama dev'essere
        // master o sviluppatore, e NESSUNO (tranne lo sviluppatore) se le assegna
        // da solo.
        var uid = session && session.user && session.user.id;
        var mieiRuoli = (store.ruoli||[]).filter(function(r){ return r.user_id===uid; }).map(function(r){ return r.ruolo; });
        var isDev = mieiRuoli.indexOf("sviluppatore")>=0;
        if(!(isDev || mieiRuoli.indexOf("master")>=0))
          return Promise.resolve({ data:null, error:{ message:"Non sei autorizzato ad assegnare Estasi ed Anedonie." } });
        if((args && args.target)===uid && !isDev)
          return Promise.resolve({ data:null, error:{ message:"Non puoi assegnare Estasi ed Anedonie a te stesso." } });
        var target = args && args.target, nuovo = (args && args.nuovo) || {}, pulito = {};
        ["frontale","parietale","temporale","occipitale"].forEach(function(k){
          var v = nuovo[k];
          if(v && (store.estasi||[]).some(function(e){ return String(e.id)===String(v) && e.lobo===k; })) pulito[k] = v;
        });
        var toccate = 0;
        (store.schede||[]).forEach(function(r){ if(r.user_id===target){ r.estasi_slot = pulito; toccate++; } });
        if(!toccate) return Promise.resolve({ data:null, error:{ message:"Questa persona non ha ancora una scheda salvata." } });
        return ok(pulito);
      }
      return ok(null);
    },
    channel: function(){
      var ch = { on: function(){ return ch; }, subscribe: function(){ return ch; }, unsubscribe: function(){ return ok(null); } };
      return ch;
    }
  };
  return client;
}

module.exports = { makeFakeSupabase: makeFakeSupabase };
