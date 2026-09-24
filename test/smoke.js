"use strict";
/* ============================================================
   PROVA DI SICUREZZA (smoke test) della scheda.
   Carica il VERO app.js dentro un browser finto (jsdom) con un Supabase
   finto, poi verifica che i calcoli portanti e il salvataggio/ricarica
   diano ESATTAMENTE i risultati attesi. Serve durante la pulizia del
   codice: se dopo una modifica un controllo qui cambia risultato, il
   comportamento NON è più identico e va guardato.

   Come si lancia (dalla cartella scheda):
     npm install      (una volta sola, installa jsdom)
     npm test
   Stampa "TUTTO OK (N controlli)" oppure elenca cosa è cambiato.
   ============================================================ */

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const { makeFakeSupabase } = require("./fake-supabase");

const RADICE = path.join(__dirname, "..");

/* ---- contatore dei controlli ---- */
let passati = 0, falliti = 0;
function ok(cond, cosa){
  if (cond){ passati++; }
  else { falliti++; console.log("  ✗ " + cosa); }
}
function eq(a, b, cosa){ ok(a === b, cosa + "  (atteso " + JSON.stringify(b) + ", ottenuto " + JSON.stringify(a) + ")"); }

/* ---- dati finti nel database ---- */
function seed(){
  return {
    session: { user: { id: "u1", user_metadata: { full_name: "Tester", provider_id: "999" } } },
    // sviluppatore + approvato: la scheda si apre di sicuro
    profili: [{ user_id: "u1", username: "tester", nome: "Tester", approvato: true, in_pausa: false, accesso_tolto_il: null }],
    ruoli:   [{ user_id: "u1", ruolo: "sviluppatore" }],
    schede:  [{ user_id: "u1", dati: {}, origine_sbloccata: false }],
    razze:   [{ id: "r_umano", nome: "Umano", tipologia: "Umanoide", velocita: "9 metri (30 piedi)" }],
    // un talento col +1 FISSO su Costituzione, e l'Aumento di Caratteristica (asi)
    talenti: [
      { id: "t_fisso", nome: "Robusto", tipo_asi: "fisso", asi_caratteristica: "cos", ripetibile: false, prereq: null, prerequisiti: "" },
      { id: "t_asi",   nome: "Aumento di Caratteristica", tipo_asi: "asi", ripetibile: true, prereq: null, prerequisiti: "" }
    ],
    sottoclassi: [],
    privilegi:   [],
    // due voci del catalogo Estasi ed Anedonie (una coppia del lobo frontale)
    estasi: [
      { id:"e_f1",  lobo:"frontale", rarita:"comune", tipo:"estasi",   coppia:1, ordine:1, nome:"Chiarezza",     effetto:"Vantaggio ai TS contro Affascinato.",  origine:"Meditazione profonda.", manifestazione:"Le pupille diventano argentate." },
      { id:"e_f1a", lobo:"frontale", rarita:"comune", tipo:"anedonia", coppia:1, ordine:2, nome:"Nebbia Mentale", effetto:"Svantaggio ai TS contro Affascinato.", origine:"Reliquie corrotte.",    manifestazione:"Lo sguardo è assente." }
    ]
  };
}

async function main(){
  // 1) carico l'HTML VERO, ma tolgo i due <script> (Supabase da CDN e app.js):
  //    il DOM lo voglio, l'esecuzione la controllo io qui sotto.
  let html = fs.readFileSync(path.join(RADICE, "index.html"), "utf8");
  html = html.replace(/<script\b[^>]*supabase[^>]*><\/script>/i, "")
             .replace(/<script\b[^>]*app\.js[^>]*><\/script>/i, "");

  const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, url: "https://esempio.test/" });
  const win = dom.window;

  // 2) stub minimi che jsdom non ha (app.js li usa con le guardie, ma meglio esserci)
  const fake = makeFakeSupabase(seed());
  win.supabase = { createClient: function(){ return fake; } };
  if (!win.matchMedia) win.matchMedia = function(){ return { matches: false, media: "", addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){}, dispatchEvent(){ return false; } }; };

  // 3) inietto il VERO app.js: parte, chiama avvia(), disegna la scheda
  const appSrc = fs.readFileSync(path.join(RADICE, "app.js"), "utf8");
  const s = win.document.createElement("script");
  s.textContent = appSrc;
  win.document.body.appendChild(s);

  // 4) lascio sfogare le promesse dell'avvio (getSession → letture → disegni)
  for (let i = 0; i < 8; i++) await new Promise(r => setTimeout(r, 20));

  // se app.js non si è caricato, mi fermo con un messaggio chiaro
  if (typeof win.levelFromXP !== "function"){
    console.log("ERRORE: app.js non si è caricato nel DOM finto (le funzioni globali non ci sono).");
    process.exit(1);
  }

  const W = win;   // scorciatoia: le funzioni e lo stato sono globali (window.*)

  /* ===== A) tabella livelli / competenza / formattazione numeri ===== */
  eq(W.levelFromXP(0), 1, "livello a 0 XP");
  eq(W.levelFromXP(299), 1, "livello appena sotto la 2ª soglia");
  eq(W.levelFromXP(300), 2, "livello alla 2ª soglia");
  eq(W.levelFromXP(2700), 4, "livello a 2700 XP");
  eq(W.levelFromXP(355000), 20, "livello all'ultima soglia");
  eq(W.levelFromXP(9999999), 20, "livello oltre l'ultima soglia (resta 20)");
  eq(W.profForLevel(1), 2, "competenza liv.1");
  eq(W.profForLevel(4), 2, "competenza liv.4");
  eq(W.profForLevel(5), 3, "competenza liv.5");
  eq(W.profForLevel(20), 6, "competenza liv.20");
  eq(W.numIt(1234567), "1.234.567", "numero coi punti delle migliaia");
  eq(W.avgDado(10), 6, "media del d10");

  /* ===== B) un personaggio noto: Guerriero liv.7 ===== */
  const pg = {
    name: "Kaelen", xp: 23000, classes: [{ key: "guerriero", level: 7 }], classeIniziale: "guerriero",
    stats: { base: { for: 15, des: 14, cos: 14, int: 8, sag: 10, car: 12 }, formato: "", slots: [] },
    abilita: { atletica: 1, percezione: 2 },
    talenti: { origine: [], normali: [], asiOrigine: [], asiNormali: [] }
  };
  W.applicaDati(pg);

  eq(W.totalLevel(), 7, "livello totale da 23000 XP");
  eq(W.totaleCar("for"), 15, "totale Forza");
  eq(W.modCar("for"), 2, "modificatore Forza (15 → +2)");
  eq(W.modCar("int"), -1, "modificatore Intelligenza (8 → −1)");
  eq(W.valoreTs("for"), 5, "TS Forza (competente: +2 mod +3 comp)");
  eq(W.valoreTs("int"), -1, "TS Intelligenza (non competente: solo mod)");
  eq(W.valoreAbil("atletica"), 5, "Atletica (competenza: +2 +3)");
  eq(W.valoreAbil("percezione"), 6, "Percezione (maestria: +0 +6)");
  eq(W.percezionePassiva(), 16, "percezione passiva (10 + valore)");
  // PF: guerriero d10 liv.7, Cos 14 (+2). Primo livello dado pieno (10+2=12),
  //     altri 6 livelli media(10)=6 +2 = 8 → 12 + 48 = 60
  eq(W.pfMax(), 60, "PF massimi (Guerriero 7, Cos 14)");

  /* ===== C) salva → ricarica: il comportamento deve restare identico ===== */
  const salvato = W.datiDaSalvare();
  eq(salvato.name, "Kaelen", "il nome si salva");
  eq(salvato.xp, 23000, "gli XP si salvano");
  eq(JSON.stringify(salvato.classes), JSON.stringify([{ key: "guerriero", level: 7 }]), "le classi si salvano");
  eq(JSON.stringify(salvato.abilita), JSON.stringify({ atletica: 1, percezione: 2 }), "le abilità scelte si salvano");
  eq(salvato.stats.base.for, 15, "la Forza base si salva");
  W.applicaDati(salvato);   // ricarico esattamente ciò che ho salvato
  eq(W.totaleCar("for"), 15, "Forza invariata dopo ricarica");
  eq(W.pfMax(), 60, "PF invariati dopo ricarica");
  eq(W.valoreAbil("percezione"), 6, "Percezione invariata dopo ricarica");

  /* ===== D) le reti di sicurezza sui dati sballati ===== */
  W.applicaDati({ statsColor: "non-un-colore", stats: { base: { for: 999 } }, xp: -5, abilita: { atletica: 5 } });
  eq(W.state.statsColor, "#7C5CFF", "colore sballato → torna al valore di partenza");
  eq(W.totaleCar("for"), 30, "Forza 999 → limitata al massimo (30)");
  ok(W.state.xp >= 0, "XP negativo rifiutato (resta ≥ 0)");
  eq(W.livelloAbil("atletica"), 0, "livello abilità 5 (non valido) → 0");

  /* ===== E) il +1 dei talenti e il TETTO 20 ===== */
  W.applicaDati({
    classes: [{ key: "guerriero", level: 8 }], classeIniziale: "guerriero",
    stats: { base: { for: 10, des: 10, cos: 19, int: 10, sag: 10, car: 10 }, formato: "", slots: [] },
    talenti: { origine: [], normali: ["t_fisso"], asiOrigine: [], asiNormali: [null] }
  });
  eq(W.bonusCarTalenti("cos"), 1, "il talento Robusto dà +1 a Costituzione");
  eq(W.totaleCar("cos"), 20, "Cos 19 + talento = 20");
  W.state.stats.base.cos = 20;   // già a 20: il +1 non deve sforare
  eq(W.bonusCarTalentiEff("cos"), 0, "a 20 il +1 del talento non si applica (tetto 20)");
  eq(W.totaleCar("cos"), 20, "Cos resta 20, non 21");

  /* ===== F) il +1 d'ORIGINE è bloccato finché lo staff non sblocca ===== */
  W.applicaDati({
    classes: [{ key: "guerriero", level: 5 }], classeIniziale: "guerriero",
    stats: { base: { for: 10, des: 10, cos: 14, int: 10, sag: 10, car: 10 }, formato: "", slots: [] },
    talenti: { origine: ["t_fisso"], normali: [], asiOrigine: [], asiNormali: [] }
  });
  eq(W.bonusCarTalenti("cos"), 0, "+1 d'origine BLOCCATO senza sblocco dello staff");
  W.state.talenti.sbloccoOrigine = true;
  eq(W.bonusCarTalenti("cos"), 1, "+1 d'origine attivo dopo lo sblocco");

  /* ===== G) Estasi ed Anedonie: catalogo + vista dei 4 slot ===== */
  ok(W.ESTASI.length >= 2, "il catalogo Estasi si carica dal database");
  W.state.estasiSlot = {};
  eq(W.vociEstasi().length, 0, "senza assegnazione, nessuno slot da mostrare");
  W.state.estasiSlot = { frontale: "e_f1", parietale: "e_f1a" };
  const ve = W.vociEstasi();
  eq(ve.length, 2, "due slot assegnati → due voci");
  eq(ve[0].nome, "Lobo Frontale · Chiarezza", "lo slot Frontale mostra lobo + nome della voce");
  ok(ve[0].desc.indexOf("Estasi · Comune") === 0, "il corpo apre con tipo e rarità");
  ok(ve[0].desc.indexOf("Vantaggio ai TS") !== -1, "il corpo contiene l'Effetto");
  ok(ve[1].nome.indexOf("Lobo Parietale") === 0, "gli slot escono in ordine di lobo (Parietale dopo Frontale)");
  eq(W.rarLabel("molto_rara"), "Molto Rara", "l'etichetta della rarità è leggibile");

  /* ===== H) auto-riparazione: la lettura RITENTA se la rete casca ===== */
  let tentativiFinti = 0;
  const fromVero = W.sb.from;
  W.sb.from = function(nome){
    if(nome === "provaretry"){
      tentativiFinti++;
      const primo = (tentativiFinti === 1);
      return { select:function(){ return this; }, order:function(){ return this; },
        then:function(ris,rif){
          return (primo ? Promise.reject(new Error("Failed to fetch"))     // 1° giro: QUIC caduto
                        : Promise.resolve({ data:[{id:"ok"}], error:null }) // 2° giro: recupera
                 ).then(ris,rif);
        } };
    }
    return fromVero.call(W.sb, nome);
  };
  const datiRecuperati = await W.leggiTabella("provaretry", function(q){ return q; }, 3);
  W.sb.from = fromVero;
  eq(tentativiFinti, 2, "la lettura ha RITENTATO dopo il primo fallimento di rete");
  eq(datiRecuperati.length, 1, "al secondo tentativo i dati arrivano (auto-riparazione)");

  /* ===== I) Estasi ed Anedonie — Mattone 2: assegnazione dei master ===== */
  // lettura della colonna nello stato (come applicaSbloccoOrigine)
  W.applicaEstasiSlot({ estasi_slot: { frontale: "e_f1" } });
  eq(JSON.stringify(W.state.estasiSlot), JSON.stringify({ frontale: "e_f1" }), "applicaEstasiSlot legge la mappa dalla riga");
  W.applicaEstasiSlot({ estasi_slot: "roba-sbagliata" });
  eq(JSON.stringify(W.state.estasiSlot), "{}", "una estasi_slot non valida diventa mappa vuota");
  W.applicaEstasiSlot(null);
  eq(JSON.stringify(W.state.estasiSlot), "{}", "senza riga, mappa vuota");
  // il gate: assegna il master (e lo sviluppatore, qui il tester lo è)
  ok(W.puoAssegnareEstasi() === true, "lo sviluppatore può assegnare le Estasi");
  // l'ordine del menù per lobo: prima le Estasi, poi le Anedonie
  const perFront = W.estasiPerLobo("frontale");
  eq(perFront.length, 2, "il lobo frontale ha due voci nel catalogo di prova");
  eq(perFront[0].tipo, "estasi", "nel menù del lobo l'Estasi viene prima");
  eq(perFront[1].tipo, "anedonia", "e l'Anedonia dopo");
  // il TOMO: chi assegna apre l'editor col "+", sceglie, Salva → rpc → aggiorna.
  W.estasiSlotCache = { u1: {} };
  W.bersaglio = null;               // sto sulla MIA scheda (u1)
  W.state.estasiSlot = {};
  W.apriPriv("estasi");             // di base esce il TOMO (nessun menù)
  ok(!W.document.querySelector('#privBody .ea-pick'), "di base il tomo NON mostra i menù (vista da lettura)");
  ok(!!W.document.querySelector('#privBody .cerv-svg'), "il tomo mostra il cervello");
  W.apriEditorEstasi();             // il master apre l'editor col +
  const pickF = W.document.querySelector('#privBody .ea-pick[data-lobo="frontale"]');
  ok(!!pickF, "il + apre l'editor coi menù per lobo (a chi assegna)");
  if(pickF){
    // aprire il menù NON deve chiudere l'editor (era il bug col <select>)
    pickF.querySelector('.ea-pick-btn').dispatchEvent(new W.MouseEvent("click", { bubbles: true }));
    ok(!W.document.getElementById("estEditor").hidden, "aprire un menù non chiude l'editor");
    ok(!pickF.querySelector('.ea-pick-menu').hidden, "il menù si apre");
    // scelgo la voce e_f1
    const optF = pickF.querySelector('.ea-opt[data-eaval="e_f1"]');
    if(optF) optF.dispatchEvent(new W.MouseEvent("click", { bubbles: true }));
    eq(pickF.getAttribute("data-val"), "e_f1", "scegliendo una voce il menù registra il valore");
    W.salvaEstasiDaPopup();
    for (let i = 0; i < 5; i++) await new Promise(r => setTimeout(r, 20));
    eq(JSON.stringify(W.state.estasiSlot), JSON.stringify({ frontale: "e_f1" }), "il salvataggio aggiorna lo stato vivo della scheda");
    eq(JSON.stringify(W.estasiSlotCache.u1), JSON.stringify({ frontale: "e_f1" }), "e la cache del Controllo");
    const rigaU1 = W.sb._store.schede.filter(function(r){ return r.user_id==="u1"; })[0];
    eq(JSON.stringify(rigaU1.estasi_slot), JSON.stringify({ frontale: "e_f1" }), "e la colonna estasi_slot nel database");
    eq(W.vociEstasi().length, 1, "ora la vista mostra un lobo assegnato");
  }
  // il DETTAGLIO si legge cliccando il lobo: la PAGINA DI SINISTRA diventa la voce
  // (con una dissolvenza: aspetto che finisca prima di leggere il contenuto)
  const box = W.document.getElementById("tomoText");
  W.apriDettaglioLobo("frontale");
  for (let i = 0; i < 32; i++) await new Promise(r => setTimeout(r, 20));
  ok(box && box.textContent.indexOf("Chiarezza")!==-1, "cliccando il lobo la pagina di sinistra mostra il nome della voce");
  ok(box && box.textContent.indexOf("Vantaggio ai TS")!==-1, "e il testo dell'Effetto (leggibile dai master)");
  ok(box && box.querySelector("[data-tornaintro]"), "c'è il «Torna» all'introduzione");
  W.tornaIntro();
  for (let i = 0; i < 32; i++) await new Promise(r => setTimeout(r, 20));
  ok(box && box.textContent.indexOf("Cornelious Vane")!==-1, "«Torna» rimette l'introduzione (estratto di Vane)");

  // il SIGILLO (lucchetto) per chi NON assegna: sigillato se vuoto, sblocco la 1ª volta
  const ruoliBak = W.ruoli.slice();
  W.ruoli = [];                      // fingo un giocatore normale (non master)
  W.state.estasiSlot = {};
  eq(W.estasiVuoto(), true, "senza voci estasiVuoto è vero");
  eq(W.lockModeEstasi(), "sigillato", "senza voci il giocatore vede la pagina sigillata");
  W.state.estasiSlot = { frontale: "e_f1" };
  W.bersaglio = null;
  try { W.localStorage.removeItem("est_unlock_u1"); } catch(e) {}
  eq(W.lockModeEstasi(), "sblocca", "con la prima voce, la prima volta, parte lo sblocco");
  W.segnaSbloccoEstasi("u1");
  eq(W.lockModeEstasi(), "", "dopo aver visto lo sblocco niente più lucchetto");
  W.ruoli = ruoliBak;
  eq(W.lockModeEstasi(), "", "il master non vede mai il lucchetto");
  // un id inventato o del lobo sbagliato viene SCARTATO dalla funzione
  const puliaOut = await W.sb.rpc("assegna_estasi", { target:"u1", nuovo:{ frontale:"e_f1", parietale:"inventato", temporale:"e_f1" } });
  eq(JSON.stringify(puliaOut.data), JSON.stringify({ frontale:"e_f1" }), "id non validi o del lobo sbagliato vengono scartati");

  /* ===== J) Controllo a sezioni per ruolo ===== */
  ok(W.sezOk("panoramica") && W.sezOk("master") && W.sezOk("supporto") && W.sezOk("moderazione") && W.sezOk("ruoli"),
     "lo sviluppatore vede tutte le sezioni del Controllo");
  const pTest = { user_id:"uX", approvato:true, in_pausa:false };
  ok(W.azioniRiga("moderazione", pTest).indexOf('data-azione="accesso"')!==-1
     && W.azioniRiga("moderazione", pTest).indexOf('data-azione="pausa"')!==-1,
     "la sezione Moderazione mostra accesso e pausa nella riga");
  ok(W.azioniRiga("master", pTest).indexOf('data-apri=')!==-1, "la sezione Master mostra Apri scheda");
  ok(W.azioniRiga("panoramica", pTest)==="" || W.azioniRiga("panoramica", pTest).indexOf('data-azione')===-1,
     "la Panoramica non mette pulsanti d'azione per riga");

  /* ===== K) Diretta su TUTTA la scheda (Realtime schede) ===== */
  // La diretta segue la scheda aperta e ne aggiorna il corpo quando cambia da
  // fuori, MA senza calpestare le modifiche non salvate (in tal caso: avviso).
  W.bersaglio = null;
  W.nascondiAvvisoFuori();
  W.state.estasiSlot = {};
  W.state.talenti.sbloccoOrigine = false;
  W.salvato = W.foto();                                   // baseline: nessuna modifica in sospeso
  const base = JSON.parse(W.salvato);

  // 1) corpo cambiato da fuori, SENZA modifiche mie -> si applica da solo
  const fuori1 = JSON.parse(JSON.stringify(base)); fuori1.xp = (base.xp||0) + 1234;
  W.arrivaScheda({ user_id:"u1", dati:fuori1, estasi_slot:{}, origine_sbloccata:false }, "u1");
  eq(W.state.xp, fuori1.xp, "senza modifiche in sospeso, il corpo si aggiorna dal vivo");
  eq(W.sporco(), false, "e il tasto Salva resta spento (ri-fotografato)");

  // 2) ho modifiche NON salvate e intanto cambia da fuori -> tengo le mie + avviso
  W.state.xp = W.state.xp + 5;                            // una mia modifica non salvata
  const mioXp = W.state.xp;
  const fuori2 = JSON.parse(W.salvato); fuori2.xp = 99999;
  W.arrivaScheda({ user_id:"u1", dati:fuori2, estasi_slot:{}, origine_sbloccata:false }, "u1");
  eq(W.state.xp, mioXp, "con modifiche non salvate la diretta NON sovrascrive il corpo");
  const avv = W.document.getElementById("avvisoFuori");
  ok(avv && !avv.hidden, "e compare l'avviso «aggiornata altrove»");

  // 3) cambio delle SOLE estasi (corpo uguale) mentre ho modifiche: si applica, niente avviso
  W.nascondiAvvisoFuori();
  const ugual = JSON.parse(W.salvato);                   // stesso corpo del salvato
  W.arrivaScheda({ user_id:"u1", dati:ugual, estasi_slot:{ frontale:"e_f1" }, origine_sbloccata:false }, "u1");
  eq(JSON.stringify(W.state.estasiSlot), JSON.stringify({ frontale:"e_f1" }),
     "un cambio delle sole estasi si applica anche con modifiche in sospeso");
  const avv2 = W.document.getElementById("avvisoFuori");
  ok(!avv2 || avv2.hidden, "e NON scatta l'avviso di conflitto (il corpo non è cambiato)");

  // 4) update per un'ALTRA scheda (non quella che guardo) -> ignorato
  const xpPrima = W.state.xp;
  W.arrivaScheda({ user_id:"uX", dati:fuori2, estasi_slot:{}, origine_sbloccata:false }, "uX");
  eq(W.state.xp, xpPrima, "un update per un'altra scheda non tocca quella aperta");
  ok(typeof W.ascoltaScheda === "function", "esiste l'aggancio della diretta alla scheda aperta");
  W.nascondiAvvisoFuori();

  /* ===== esito ===== */
  console.log("");
  if (falliti === 0){
    console.log("TUTTO OK (" + passati + " controlli passati).");
    process.exit(0);
  } else {
    console.log("ATTENZIONE: " + falliti + " controlli falliti su " + (passati + falliti) + ".");
    process.exit(1);
  }
}

main().catch(function(e){
  console.log("La prova è esplosa (errore imprevisto):");
  console.log(e && e.stack ? e.stack : e);
  process.exit(1);
});
