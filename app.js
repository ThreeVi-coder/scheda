"use strict";

/* ================= COLLEGAMENTO AL DATABASE ================= */
var SB_URL="https://azlfyuxxoxcqwqvjenua.supabase.co";
var SB_KEY="sb_publishable_S0bnh2LHjCR2cgeQCAfyMg_Z5rFJUi9";
var sb=window.supabase.createClient(SB_URL, SB_KEY);
var utente=null, ruoli=[];
function haRuolo(r){ return ruoli.indexOf(r)>=0; }

var ICONS={
  artificere:'<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="2.5"/><path d="M12 3 v2 M12 19 v2 M3 12 h2 M19 12 h2 M5.6 5.6 l1.4 1.4 M17 17 l1.4 1.4 M18.4 5.6 l-1.4 1.4 M5.6 18.4 l1.4 -1.4"/>',
  barbaro:'<line x1="7" y1="21" x2="15" y2="6"/><path d="M13 5 c3 -1 6 1 6 4 c-3 2 -6 1 -8 -2 Z"/>',
  bardo:'<path d="M7 5 C4 9 4 15 8 19"/><path d="M17 5 C20 9 20 15 16 19"/><line x1="7" y1="5" x2="17" y2="5"/><line x1="10" y1="7" x2="10" y2="17"/><line x1="12" y1="7" x2="12" y2="17.5"/><line x1="14" y1="7" x2="14" y2="17"/>',
  chierico:'<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="5" y1="5" x2="7" y2="7"/><line x1="17" y1="17" x2="19" y2="19"/><line x1="19" y1="5" x2="17" y2="7"/><line x1="7" y1="17" x2="5" y2="19"/>',
  druido:'<path d="M6 18 C6 9 12 5 18 5 C18 12 14 18 6 18 Z"/><line x1="7" y1="17" x2="15" y2="9"/>',
  guerriero:'<line x1="12" y1="2" x2="12" y2="16"/><path d="M10.5 4 L12 2 L13.5 4"/><line x1="8" y1="16" x2="16" y2="16"/><line x1="12" y1="16" x2="12" y2="21"/>',
  ladro:'<path d="M10 6 L12 3 L14 6"/><line x1="12" y1="3" x2="12" y2="14"/><line x1="9" y1="14" x2="15" y2="14"/><line x1="12" y1="14" x2="12" y2="20"/><circle cx="12" cy="21" r="1"/>',
  mago:'<path d="M12 6 C10 4 6 4 4 5 L4 18 C6 17 10 17 12 19 C14 17 18 17 20 18 L20 5 C18 4 14 4 12 6 Z"/><line x1="12" y1="6" x2="12" y2="19"/>',
  monaco:'<path d="M12 18 C8 15 7 11 12 6 C17 11 16 15 12 18 Z"/><path d="M12 18 C9 18 6 15 6 11 C10 12 11 15 12 18 Z"/><path d="M12 18 C15 18 18 15 18 11 C14 12 13 15 12 18 Z"/>',
  paladino:'<path d="M12 3 L20 6 V12 C20 17 16 20 12 21 C8 20 4 17 4 12 V6 Z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
  ranger:'<path d="M7 4 C15 7 15 17 7 20"/><line x1="7" y1="4" x2="7" y2="20"/><line x1="4" y1="12" x2="20" y2="12"/><path d="M17 9 L21 12 L17 15"/>',
  stregone:'<path d="M12 3 C13 7 17 9 16 14 C16 18 14 21 12 21 C10 21 8 18 8 14 C8 11 10 10 10 8 C10 6 12 6 12 3 Z"/><path d="M12 21 C11 19 11 16 12 14 C13 16 13 19 12 21 Z"/>',
  warlock:'<path d="M3 12 C6 7 18 7 21 12 C18 17 6 17 3 12 Z"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="0.9" style="fill:currentColor;stroke:none"/>'
};
function emblemSVG(key){ return ICONS[key] ? '<svg viewBox="0 0 24 24">'+ICONS[key]+'</svg>' : ''; }

/* "ts" sono i due tiri salvezza in cui la classe rende competenti. Attenzione:
   valgono solo se e' la classe INIZIALE del personaggio. Multiclassando non se
   ne guadagnano altri: e' una regola del manuale, non una semplificazione. */
var CLASSES=[
  {key:"artificere", name:"Artificere", die:8,  sug:"Intelligenza e Costituzione",              ts:["cos","int"]},
  {key:"barbaro",    name:"Barbaro",    die:12, sug:"Forza e Costituzione",                     ts:["for","cos"]},
  {key:"bardo",      name:"Bardo",      die:8,  sug:"Carisma",                                  ts:["des","car"]},
  {key:"chierico",   name:"Chierico",   die:8,  sug:"Saggezza",                                 ts:["sag","car"]},
  {key:"druido",     name:"Druido",     die:8,  sug:"Saggezza",                                 ts:["int","sag"]},
  {key:"guerriero",  name:"Guerriero",  die:10, sug:"Forza (o Destrezza) e Costituzione",       ts:["for","cos"]},
  {key:"ladro",      name:"Ladro",      die:8,  sug:"Destrezza e Intelligenza (o Costituzione)",ts:["des","int"]},
  {key:"mago",       name:"Mago",       die:6,  sug:"Intelligenza",                             ts:["int","sag"]},
  {key:"monaco",     name:"Monaco",     die:8,  sug:"Destrezza e Saggezza",                     ts:["for","des"]},
  {key:"paladino",   name:"Paladino",   die:10, sug:"Forza e Carisma",                          ts:["sag","car"]},
  {key:"ranger",     name:"Ranger",     die:10, sug:"Destrezza e Saggezza",                     ts:["for","des"]},
  {key:"stregone",   name:"Stregone",   die:6,  sug:"Carisma",                                  ts:["cos","car"]},
  {key:"warlock",    name:"Warlock",    die:8,  sug:"Carisma",                                  ts:["sag","car"]}
];
var BY_KEY={}; CLASSES.forEach(function(c){ BY_KEY[c.key]=c; });
var MAX_CLASSI=3;   /* fino al triclasse, non oltre */

/* ============ DATI DELLE CLASSI (Manuale 2024) ============
   Il "cosa dà ogni classe": caratteristica primaria (per il multiclasse),
   addestramento nelle armature, abilità a scelta, armi, strumenti e cosa porta
   in dote quando la si prende in multiclasse. Sono DATI puri: aggiungerne o
   correggerne non tocca alcun calcolo. Le competenze nei tiri salvezza stanno
   già in CLASSES (campo `ts`). Per ora la scheda ne usa solo una parte (le
   armature serviranno alla CA, le abilità all'auto-assegnazione): il resto è
   qui pronto per i mattoni successivi. `abilTra:"tutte"` = qualsiasi abilità;
   `primaOr:true` = per il multiclasse basta UNA delle primarie (le altre le
   richiedono tutte). Armature: leggera | media | pesante | scudi. */
var CLASSE_DATI={
  artificere:{ primaria:["int"], armature:["leggera","media","scudi"], abilNum:2,
    abilTra:["arcani","storia","indagini","medicina","natura","percezione","rapidita"],
    armi:"semplici", strumenti:"Arnesi da scasso, Strumenti da inventore e un tipo di Strumenti da artigiano a scelta",
    multi:"1 abilità dalla lista, Strumenti da inventore, armatura Leggera e Media, Scudi" },
  barbaro:{ primaria:["for"], armature:["leggera","media","scudi"], abilNum:2,
    abilTra:["animali","atletica","intimidazione","natura","percezione","sopravvivenza"],
    armi:"semplici e da guerra", strumenti:"", multi:"armi da Guerra, Scudi" },
  bardo:{ primaria:["car"], armature:["leggera"], abilNum:3, abilTra:"tutte",
    armi:"semplici", strumenti:"tre Strumenti musicali a scelta",
    multi:"1 abilità a scelta, uno Strumento musicale, armatura Leggera" },
  chierico:{ primaria:["sag"], armature:["leggera","media","scudi"], abilNum:2,
    abilTra:["storia","intuizione","medicina","persuasione","religione"],
    armi:"semplici", strumenti:"", multi:"armatura Leggera e Media, Scudi" },
  druido:{ primaria:["sag"], armature:["leggera","scudi"], abilNum:2,
    abilTra:["arcani","animali","intuizione","medicina","natura","percezione","religione","sopravvivenza"],
    armi:"semplici", strumenti:"Kit da erborista", multi:"armatura Leggera, Scudi" },
  guerriero:{ primaria:["for","des"], primaOr:true, armature:["leggera","media","pesante","scudi"], abilNum:2,
    abilTra:["acrobazia","animali","atletica","storia","intuizione","intimidazione","persuasione","percezione","sopravvivenza"],
    armi:"semplici e da guerra", strumenti:"", multi:"armi da Guerra, armatura Leggera e Media, Scudi" },
  ladro:{ primaria:["des"], armature:["leggera"], abilNum:4,
    abilTra:["acrobazia","atletica","inganno","intuizione","intimidazione","indagini","percezione","persuasione","rapidita","furtivita"],
    armi:"semplici e armi da guerra con proprietà Accuratezza o Leggera", strumenti:"Arnesi da scasso",
    multi:"1 abilità dalla lista, Arnesi da scasso, armatura Leggera" },
  mago:{ primaria:["int"], armature:[], abilNum:2,
    abilTra:["arcani","storia","intuizione","indagini","medicina","natura","religione"],
    armi:"semplici", strumenti:"", multi:"nessuna competenza aggiuntiva" },
  monaco:{ primaria:["des","sag"], armature:[], abilNum:2,
    abilTra:["acrobazia","atletica","storia","intuizione","religione","furtivita"],
    armi:"semplici e armi da guerra con proprietà Leggera",
    strumenti:"un tipo di Strumenti da artigiano o uno Strumento musicale a scelta", multi:"nessuna competenza aggiuntiva" },
  paladino:{ primaria:["for","car"], armature:["leggera","media","pesante","scudi"], abilNum:2,
    abilTra:["atletica","intuizione","intimidazione","medicina","persuasione","religione"],
    armi:"semplici e da guerra", strumenti:"", multi:"armi da Guerra, armatura Leggera e Media, Scudi" },
  ranger:{ primaria:["des","sag"], armature:["leggera","media","scudi"], abilNum:3,
    abilTra:["animali","atletica","intuizione","indagini","natura","percezione","furtivita","sopravvivenza"],
    armi:"semplici e da guerra", strumenti:"", multi:"1 abilità dalla lista, armi da Guerra, armatura Leggera e Media, Scudi" },
  stregone:{ primaria:["car"], armature:[], abilNum:2,
    abilTra:["arcani","inganno","intuizione","intimidazione","persuasione","religione"],
    armi:"semplici", strumenti:"", multi:"nessuna competenza aggiuntiva" },
  warlock:{ primaria:["car"], armature:["leggera"], abilNum:2,
    abilTra:["arcani","inganno","storia","intimidazione","indagini","natura","religione"],
    armi:"semplici", strumenti:"", multi:"armatura Leggera" }
};
/* Soglie di esperienza per livello (manuale base) */
var XP_TABLE=[0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000];
function levelFromXP(xp){
  var lv=1;
  for(var i=0;i<XP_TABLE.length;i++){ if(xp>=XP_TABLE[i]) lv=i+1; else break; }
  return lv;
}
function xpForLevel(lv){ return XP_TABLE[lv-1]; }
function profForLevel(lv){ return 2+Math.floor((lv-1)/4); }
function numIt(n){ return String(Math.floor(Number(n)||0)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }

var FONT_GROUPS=[
  ["Classici e incisi",[["cinzel","Cinzel","'Cinzel',Georgia,serif"],["cinzeldec","Cinzel Decorative","'Cinzel Decorative',Georgia,serif"],
    ["cormorant","Cormorant Garamond","'Cormorant Garamond',Georgia,serif"],["ebgaramond","EB Garamond","'EB Garamond',Georgia,serif"],
    ["marcellus","Marcellus","'Marcellus',Georgia,serif"],["cardo","Cardo","'Cardo',Georgia,serif"],
    ["playfair","Playfair Display","'Playfair Display',Georgia,serif"],["spectral","Spectral","'Spectral',Georgia,serif"]]],
  ["Medievali e gotici",[["uncial","Uncial Antiqua","'Uncial Antiqua','Cinzel',serif"],["medievalsharp","MedievalSharp","'MedievalSharp',Georgia,serif"],
    ["grenzegotisch","Grenze Gotisch","'Grenze Gotisch',Georgia,serif"],["unifraktur","UnifrakturCook","'UnifrakturCook','Grenze Gotisch',serif"],
    ["metamorphous","Metamorphous","'Metamorphous',Georgia,serif"],["pirata","Pirata One","'Pirata One','Cinzel',serif"],
    ["imfell","IM Fell English","'IM Fell English',Georgia,serif"]]],
  ["Calligrafici ed eleganti",[["greatvibes","Great Vibes","'Great Vibes',cursive"],["tangerine","Tangerine","'Tangerine',cursive"],
    ["cormorantsc","Cormorant SC","'Cormorant SC',Georgia,serif"],["almendra","Almendra","'Almendra',Georgia,serif"]]],
  ["Fantasia",[["griffy","Griffy","'Griffy',cursive"],["eaglelake","Eagle Lake","'Eagle Lake',Georgia,serif"],
    ["fondamento","Fondamento","'Fondamento',Georgia,serif"],["macondo","Macondo","'Macondo',cursive"]]],
  ["Moderni",[["inter","Inter","'Inter',system-ui,sans-serif"],["oswald","Oswald","'Oswald',system-ui,sans-serif"],
    ["bebas","Bebas Neue","'Bebas Neue',system-ui,sans-serif"]]]
];
var FONTS={}, FONT_NAME={};
FONT_GROUPS.forEach(function(g){ g[1].forEach(function(f){ FONTS[f[0]]=f[2]; FONT_NAME[f[0]]=f[1]; }); });

var PRESETS=['#FFFFFF','#F6F1E6','#E0B15E','#D4AF37','#C0C0C0','#E5484D','#B4202A','#E8722C',
  '#F2C744','#5FBF6A','#2F9E7B','#37B6C4','#4C7DF0','#7C5CFF','#A78BFA','#C264C7','#E86BB0','#14141C'];

function hexToRgb(hex){ hex=hex.replace('#',''); if(hex.length===3) hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  var n=parseInt(hex,16); return {r:(n>>16)&255,g:(n>>8)&255,b:n&255}; }
function rgbToHex(r,g,b){ function h(x){ x=Math.max(0,Math.min(255,Math.round(x))); return (x<16?'0':'')+x.toString(16); } return '#'+h(r)+h(g)+h(b); }
function rgbToHsv(r,g,b){ r/=255;g/=255;b/=255; var mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn,h=0;
  if(d){ if(mx===r)h=((g-b)/d)%6; else if(mx===g)h=(b-r)/d+2; else h=(r-g)/d+4; h*=60; if(h<0)h+=360; }
  return {h:h,s:mx?d/mx:0,v:mx}; }
function hsvToRgb(h,s,v){ var c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c,r=0,g=0,b=0;
  if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}
  return {r:(r+m)*255,g:(g+m)*255,b:(b+m)*255}; }
function hsvHex(h,s,v){ var c=hsvToRgb(h,s,v); return rgbToHex(c.r,c.g,c.b); }

function makePicker(host, initialHex, onChange){
  var rgb=hexToRgb(initialHex), st=rgbToHsv(rgb.r,rgb.g,rgb.b), h=st.h, s=st.s, v=st.v;
  host.innerHTML='<div class="svsquare"><div class="svknob"></div></div>'
   +'<div class="pickside"><div class="huestrip"><div class="hueknob"></div></div>'
   +'<div class="pickrow"><div class="preview"></div><input class="hexin" type="text" spellcheck="false"/></div>'
   +'<div class="swatches"></div></div>';
  var sq=host.querySelector('.svsquare'), sk=host.querySelector('.svknob'),
      hs=host.querySelector('.huestrip'), hk=host.querySelector('.hueknob'),
      pv=host.querySelector('.preview'), hx=host.querySelector('.hexin'), swrap=host.querySelector('.swatches');
  PRESETS.forEach(function(hex){ var b=document.createElement('div'); b.className='sw'; b.style.background=hex; b.setAttribute('data-hex',hex); swrap.appendChild(b); });
  function curHex(){ return hsvHex(h,s,v); }
  function updateUI(){
    sq.style.backgroundColor='hsl('+h+',100%,50%)';
    sq.style.backgroundImage='linear-gradient(to right,#fff,rgba(255,255,255,0)),linear-gradient(to bottom,rgba(0,0,0,0),#000)';
    var w=sq.clientWidth||180, hh=sq.clientHeight||118;
    sk.style.left=(s*w)+'px'; sk.style.top=((1-v)*hh)+'px';
    hk.style.left=((h/360)*(hs.clientWidth||180))+'px';
    var hex=curHex(); pv.style.background=hex; if(document.activeElement!==hx) hx.value=hex.toUpperCase();
  }
  // Mentre si trascina, la pallina segue il dito subito (updateUI e' leggero),
  // ma il lavoro pesante -- ridipingere le scritte, ridisegnare il grafico,
  // ricalcolare il salvataggio -- gira al massimo una volta per fotogramma.
  // Cosi' sul telefono il colore smette di arrivare in ritardo.
  var raf=0;
  function applica(){ onChange(curHex()); }
  function emitLive(){
    updateUI();
    if(!raf) raf=requestAnimationFrame(function(){ raf=0; applica(); });
  }
  function emitNow(){
    if(raf){ cancelAnimationFrame(raf); raf=0; }
    applica(); updateUI();
  }
  function sqAt(e){ var r=sq.getBoundingClientRect();
    s=Math.min(Math.max(e.clientX-r.left,0),r.width)/r.width;
    v=1-Math.min(Math.max(e.clientY-r.top,0),r.height)/r.height; emitLive(); }
  function hueAt(e){ var r=hs.getBoundingClientRect(); h=Math.min(Math.max(e.clientX-r.left,0),r.width)/r.width*360; emitLive(); }
  function drag(t,fn){ t.addEventListener('pointerdown', function(e){ e.preventDefault(); fn(e);
    function m(ev){ fn(ev); } function u(){ document.removeEventListener('pointermove',m); document.removeEventListener('pointerup',u); }
    document.addEventListener('pointermove',m); document.addEventListener('pointerup',u); }); }
  drag(sq,sqAt); drag(hs,hueAt);
  swrap.addEventListener('click', function(e){ var b=e.target.closest('[data-hex]'); if(b) setHex(b.getAttribute('data-hex')); });
  hx.addEventListener('change', function(){ var val=hx.value.trim().replace('#',''); if(/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) setHex('#'+val); else updateUI(); });
  function setHex(hex){ var r=hexToRgb(hex), q=rgbToHsv(r.r,r.g,r.b); h=q.h;s=q.s;v=q.v; emitNow(); }
  updateUI();
  return { setHex:setHex, refresh:updateUI };
}

var state={
  font:"cinzel", size:40, align:"left",
  bold:true, italic:false, underline:false, smallcaps:false, neon:false, dropcap:false,
  upper:false, label:true,
  nameColor:"#E8E6F0", capColor:"#E0B15E",
  emblemMode:"auto",
  classes:[],
  classeIniziale:"",   // quale classe e' la prima: da li' arrivano i tiri salvezza
  razza:"",            // id (dal database) della razza scelta per il personaggio; "" = nessuna
  talenti:{origine:[],normali:[],asiOrigine:[],asiNormali:[],sbloccoOrigine:false},   // talenti scelti: id in ordine di scelta (origine = creazione, normali = agli ASI); asi* = caratteristica del +1 a scelta; sblocco = +1 d'origine confermato dallo staff
  allineamento:"",     // codice dell'allineamento scelto (LB, N, CM, SA...); "" = nessuno
  abilita:{},          // abilita' -> 1 competenza, 2 maestria (le altre non ci sono)
  abilCarColore:{},    // colore scelto per ogni caratteristica (vuoto = base)
  xp:0,
  xpStyle:"grad", xpColor1:"#7C5CFF", xpColor2:"#E0B15E",
  statsEvid:true,   // illumina la stat piu' alta sul grafico
  statsColor:"#7C5CFF",   // colore del poligono e della linea illuminata
  transizione:"morph",    // come si passa tra Caratteristiche e Abilita': "morph" | "dissolvenza"
  retroVista:"hub",       // pagina Retro: "hub" (illustrazione con richiami) | "elenco" (immagine a lato + lista a tendina)
  classSymColor:"#a78bfa",   // colore di partenza dei simboli (seme per i nuovi)
  tsCompColor:"#E0B15E",     // colore degli esagoni accesi dei tiri salvezza
  tsDadoColor:"#A78BFA",     // colore del dado disegnato al centro del favo
  nomiClasse:{},   // stile del nome, per ogni classe (chiave = classe)
  sottoStili:{},   // stile della sottoclasse, per ogni classe (font/colore/formato suoi)
  simboli:{},      // colore e neon del simbolo, per ogni classe
  pfAttuali:null,   // punti ferita attuali (null = pieni, non ancora toccati)
  pfTemp:0,         // punti ferita temporanei (riserva che si consuma per prima)
  pfScostamento:0,  // ritocco a mano del massimo: max = media calcolata + scostamento
  dvSpesi:{},       // dadi vita spesi, per taglia del dado: {"8":n, "10":n, ...}
  morteS:0, morteF:0,   // tiri salvezza contro la morte: successi / fallimenti (0..3)
  hpColorPieno:"#57C46A",   // barra e numero PF: colore quando la vita e' piena
  hpColorFerito:"#E0B15E",  // colore sotto un quarto della vita (25%)
  hpColorCritico:"#E5686D", // colore sotto un decimo della vita (10%) o a 0
  difScost:{},              // ritocco a mano di CA/Iniziativa/Velocita' (differenza dal calcolo)
  difIcoColor:"#E0B15E",    // colore dei tre simboli (scudo, fulmine, frecce)
  testi:null,  // riempiti subito sotto, quando TESTI e CARATT sono dichiarati
  stats:null
};

/* ================= CARATTERISTICHE =================
   Le sei di D&D. Ogni valore e' tenuto diviso in due: il "base", che scegli
   tu, e il "bonus", che arrivera' dalla razza e per ora vale zero. Il totale
   e la modifica non si salvano: si ricalcolano, cosi' non possono mai
   raccontare una cosa diversa da quella che c'e' scritta sopra. */
var CARATT=[
  { k:"for", sigla:"FOR", nome:"Forza" },
  { k:"des", sigla:"DES", nome:"Destrezza" },
  { k:"cos", sigla:"COS", nome:"Costituzione" },
  { k:"int", sigla:"INT", nome:"Intelligenza" },
  { k:"sag", sigla:"SAG", nome:"Saggezza" },
  { k:"car", sigla:"CAR", nome:"Carisma" }
];
var CAR_MIN=1, CAR_MAX=30;

/* Un colore per ogni caratteristica: e' la firma grafica che tiene insieme
   l'esagono e la griglia delle abilita' (e domani, le Caratteristiche). Base
   fissa; l'oro resta libero perche' li' vuol dire "sei competente". */
var CAR_COL={ for:"#e5686d", des:"#57c46a", cos:"#d68f5a", int:"#5c8dfa", sag:"#3fc8c4", car:"#a78bfa" };
/* Il colore di una caratteristica: quello scelto dall'utente se c'e' ed e'
   valido, altrimenti la base. Le sigle nell'esagono e le intestazioni dei
   gruppi lo leggono da qui, cosi' restano sempre legate. */
function colCar(k){
  var m = (typeof state!=="undefined" && state.abilCarColore) ? state.abilCarColore : null;
  var c = m && m[k];
  return /^#[0-9a-fA-F]{6}$/.test(c||"") ? c : (CAR_COL[k] || "#9a97ad");
}

/* Point buy: la tabella dei costi delle regole base. Salire costa poco fino
   a 13 e caro dopo, ed e' quello che scoraggia i personaggi con un 15 e
   cinque miserie. */
var PB_COSTO={ 8:0, 9:1, 10:2, 11:3, 12:4, 13:5, 14:7, 15:9 };
var PB_MIN=8, PB_MAX=15, PB_TOTALE=27;

function statsDiPartenza(){
  // "modo" resta per compatibilita' con le schede gia' salvate.
  // formato/slots = il bonus di creazione al livello 1 (regola della casa):
  //   formato "2+1" | "1+1+1" | "" (nessuno); slots = a quale caratteristica va
  //   ogni voce, nell'ordine degli importi. Il "bonus" per caratteristica si
  //   ricalcola da qui (non e' piu' un campo a mano).
  var o={ modo:"pointbuy", base:{}, bonus:{}, formato:"", slots:[] };
  CARATT.forEach(function(c){ o.base[c.k]=PB_MIN; o.bonus[c.k]=0; });
  return o;
}
/* Gli importi di un formato, nell'ordine: +2/+1 -> [2,1]; +1/+1/+1 -> [1,1,1]. */
function importiFormato(f){ return f==="2+1" ? [2,1] : (f==="1+1+1" ? [1,1,1] : []); }
/* Ricalcola il bonus per caratteristica dal formato scelto e dagli slot. */
function applicaBonusCreazione(){
  CARATT.forEach(function(c){ state.stats.bonus[c.k]=0; });
  var imp=importiFormato(state.stats.formato), sl=state.stats.slots||[];
  for(var i=0;i<imp.length;i++){
    var k=sl[i];
    if(k && Object.prototype.hasOwnProperty.call(state.stats.bonus, k)) state.stats.bonus[k]+=imp[i];
  }
}
/* Il bonus di creazione e' completo? (tutte le voci del formato assegnate) */
function creazioneCompleta(){
  var imp=importiFormato(state.stats.formato); if(!imp.length) return false;
  var sl=state.stats.slots||[];
  for(var i=0;i<imp.length;i++){ if(!sl[i]) return false; }
  return true;
}
function totaleCar(k){
  var v=state.stats.base[k]+state.stats.bonus[k]+bonusCarTalentiEff(k);   // i talenti non sforano 20
  return Math.max(CAR_MIN, Math.min(CAR_MAX, v));
}
function modCar(k){ return Math.floor((totaleCar(k)-10)/2); }
function segno(n){ return (n>=0?"+":"\u2212")+Math.abs(n); }
function conBonus(){ return CARATT.some(function(c){ return state.stats.bonus[c.k]!==0; }); }

/* ================= TIRI SALVEZZA =================
   Un tiro salvezza e' il modificatore della caratteristica piu' il bonus di
   competenza, ma solo dove si e' competenti. Come il modificatore, il numero
   non si salva: si ricalcola sempre, cosi' non puo' raccontare una cosa
   diversa dai riquadri qui sopra.

   La competenza arriva SOLO dalla classe iniziale. Chi multiclassa non ne
   guadagna altre: e' una regola del manuale, non una scorciatoia nostra. */
var TS_A_COSA={
  for:"Resistere a chi ti spinge, ti trascina o ti costringe a muoverti contro la tua volont\u00E0.",
  des:"Schivare le minacce ad area, come una palla di fuoco o il soffio di un drago.",
  cos:"Resistere a veleni, malattie e sfinimento, e tenere la concentrazione su un incantesimo quando ti feriscono.",
  int:"Resistere agli attacchi che colpiscono la mente e riconoscere le illusioni per quello che sono.",
  sag:"Restare padrone di te contro fascino, paura e tentativi di dominarti.",
  car:"Resistere alle magie che alterano la tua essenza o che vogliono bandirti in un altro piano."
};
/* La classe iniziale e' quella scelta, se e' ancora nella scheda; altrimenti
   la prima della lista, che e' la prima che era stata aggiunta. Cosi' anche
   una scheda salvata prima di questa scelta si comporta come deve. */
function classeTs(){
  if(!state.classes.length) return "";
  var scelta=state.classeIniziale;
  if(scelta && state.classes.some(function(c){ return c.key===scelta; })) return scelta;
  return state.classes[0].key;
}
function competenzeTs(){
  var k=classeTs();
  return (k && BY_KEY[k] && BY_KEY[k].ts) ? BY_KEY[k].ts : [];
}
function competenteTs(k){ return competenzeTs().indexOf(k)>=0; }
function valoreTs(k){ return modCar(k) + (competenteTs(k) ? profForLevel(totalLevel()) : 0); }

/* ================= ABILITA' =================
   Diciotto abilita', ognuna legata a una caratteristica. Il numero e' il
   modificatore piu' il bonus di competenza: una volta con la Competenza, due
   volte con la Maestria. Come i tiri salvezza, il numero non si salva mai: si
   salva solo la scelta (0 niente, 1 competenza, 2 maestria).

   La Costituzione non ha abilita': non e' una nostra dimenticanza, e' cosi'
   nel manuale, e va detto a chi guarda o pensera' a un buco.

   Oggi le competenze si spuntano a mano. Quando arriveranno background e
   specie potranno assegnarle da sole: per quel giorno il dato e' gia' nella
   forma giusta, una mappa abilita' -> livello. */
var ABILITA=[
  { k:"atletica",        nome:"Atletica",           car:"for" },
  { k:"acrobazia",       nome:"Acrobazia",          car:"des" },
  { k:"furtivita",       nome:"Furtivit\u00E0",          car:"des" },
  { k:"rapidita",        nome:"Rapidit\u00E0 di Mano",   car:"des" },
  { k:"arcani",          nome:"Arcano",             car:"int" },
  { k:"indagini",        nome:"Indagare",           car:"int" },
  { k:"natura",          nome:"Natura",             car:"int" },
  { k:"religione",       nome:"Religione",          car:"int" },
  { k:"storia",          nome:"Storia",             car:"int" },
  { k:"animali",         nome:"Addestrare Animali", car:"sag" },
  { k:"intuizione",      nome:"Intuizione",         car:"sag" },
  { k:"medicina",        nome:"Medicina",           car:"sag" },
  { k:"percezione",      nome:"Percezione",         car:"sag" },
  { k:"sopravvivenza",   nome:"Sopravvivenza",      car:"sag" },
  { k:"inganno",         nome:"Inganno",            car:"car" },
  { k:"intimidazione",   nome:"Intimidazione",      car:"car" },
  { k:"intrattenimento", nome:"Intrattenimento",    car:"car" },
  { k:"persuasione",     nome:"Persuasione",        car:"car" }
];
var ABIL_BY={}; ABILITA.forEach(function(a){ ABIL_BY[a.k]=a; });
var ABIL_NOME_LIV=["Nessuna", "Competenza", "Maestria"];
/* Le caratteristiche che hanno almeno un'abilita', nell'ordine di D&D */
function carConAbilita(){
  return CARATT.filter(function(c){
    return ABILITA.some(function(a){ return a.car===c.k; });
  });
}
function abilitaDi(kCar){ return ABILITA.filter(function(a){ return a.car===kCar; }); }

function livelloAbil(k){
  var v = state.abilita && state.abilita[k];
  return (v===1 || v===2) ? v : 0;
}
function valoreAbil(k){
  var a=ABIL_BY[k]; if(!a) return 0;
  return modCar(a.car) + profForLevel(totalLevel())*livelloAbil(k);
}
/* Gira tra i tre stati: niente -> competenza -> maestria -> niente */
function giraAbil(k){
  if(!state.abilita) state.abilita={};
  var v=livelloAbil(k)+1; if(v>2) v=0;
  if(v===0) delete state.abilita[k]; else state.abilita[k]=v;
}
function quanteAbil(liv){
  return ABILITA.filter(function(a){ return livelloAbil(a.k)===liv; }).length;
}
/* Percezione passiva: dieci piu' il valore di Percezione. Dice al master cosa
   noti senza bisogno che tu tiri. Si ricava, non si salva. */
function percezionePassiva(){ return 10 + valoreAbil("percezione"); }
/* Si salvano solo le abilita' scelte: le altre sarebbero diciotto zeri inutili
   dentro la scheda di ogni giocatore. */
function abilitaDaSalvare(){
  var o={};
  ABILITA.forEach(function(a){ var v=livelloAbil(a.k); if(v) o[a.k]=v; });
  return o;
}

function pbCosto(v){ return PB_COSTO[v]; }
function pbUsati(){
  var t=0;
  CARATT.forEach(function(c){ var v=state.stats.base[c.k]; t += (PB_COSTO[v]===undefined ? 0 : PB_COSTO[v]); });
  return t;
}
function pbLiberi(){ return PB_TOTALE - pbUsati(); }

function statsWarn(t){
  var el=document.getElementById("statsWarn"); if(!el) return;
  el.textContent=t||""; el.classList.toggle("on", !!t);
}

function cambiaPb(k, verso){
  var v=state.stats.base[k], n=v+verso;
  if(!isFinite(n)) return;   // rete di sicurezza: mai scrivere un valore non numerico
  if(n<PB_MIN || n>PB_MAX) return;
  if(verso>0 && (pbCosto(n)-pbCosto(v))>pbLiberi()) return;
  state.stats.base[k]=n;
  renderAll();
}

/* Quanto e' lontano dal centro il vertice di una caratteristica, tra 0 e 1.
   Usata sia dall'esagono in scheda sia da quello nella finestra. */
function frazioneDi(k){
  var base=Math.max(PB_MIN, Math.min(PB_MAX, state.stats.base[k]));
  // parte da 0.18 cosi' il poligono non collassa in un punto quando tutto e' al minimo
  return 0.18 + 0.82*((base-PB_MIN)/(PB_MAX-PB_MIN || 1));
}

/* Il riquadro in scheda: esagono da un lato, sei stat dall'altro. Ogni
   etichetta sta ALL'ALTEZZA del suo vertice, e la linea esce dritta dal
   vertice, gomito, e va all'etichetta. Cosi' le linee non si incrociano mai
   e restano ordinate. Niente pallini sul poligono, solo la forma. */
var SL_W=520, SL_H=280, SL_CY=140;
var statAtt="for";   // quale asse si sta modificando nella finestra

/* La stat piu' alta, per illuminarla sul grafico. A parita' vince la prima
   in ordine (FOR, DES, ...): una sola linea accesa, senza ambiguita'. */
function statPiuAlta(){
  var top=CARATT[0].k, val=totaleCar(CARATT[0].k);
  CARATT.forEach(function(c){ if(totaleCar(c.k)>val){ val=totaleCar(c.k); top=c.k; } });
  return top;
}

function slVertice(idx, frazione){
  // l'esagono sta al centro; le etichette lo circondano su entrambi i lati
  var cx = SL_W/2;
  var ang=(-90+idx*60)*Math.PI/180, r=84*frazione;
  return [cx + r*Math.cos(ang), SL_CY + r*Math.sin(ang)];
}

function renderStats(){
  var host=document.getElementById("statsLine");
  var out="", wires="", lbls="";
  var col=state.statsColor||"#7C5CFF";
  var alta=statPiuAlta();

  // maglie di fondo
  [1,0.6,0.28].forEach(function(f){
    var pts=CARATT.map(function(c,i){ return slVertice(i,f).map(function(n){return n.toFixed(1);}).join(","); }).join(" ");
    out+='<polygon class="slgrid" points="'+pts+'"/>';
  });
  // poligono del personaggio, col colore scelto
  var poly=CARATT.map(function(c,i){ return slVertice(i,frazioneDi(c.k)).map(function(n){return n.toFixed(1);}).join(","); });
  out+='<polygon class="slhex" points="'+poly.join(" ")+'" style="fill:'+col+'22;stroke:'+col+'"/>';

  var quote=[40, 130, 220];
  function posizione(idx){
    if(idx===0) return ["dx", quote[0]];
    if(idx===1) return ["dx", quote[1]];
    if(idx===2) return ["dx", quote[2]];
    if(idx===3) return ["sx", quote[2]];
    if(idx===4) return ["sx", quote[1]];
    return ["sx", quote[0]];
  }

  CARATT.forEach(function(c,idx){
    var pos=posizione(idx), suLato=pos[0], ly=pos[1];
    var vFull=slVertice(idx,1);
    // illumina solo la stat piu' alta, se l'opzione e' accesa
    var acceso = state.statsEvid && c.k===alta;
    var lblX = suLato==="dx" ? SL_W-16 : 16;
    var anchor = suLato==="dx" ? "end" : "start";
    var colX = suLato==="dx" ? (SL_W-150) : 150;
    // la linea finisce prima del numero: lascio uno spazio, cosi' non si
    // sovrappone alle cifre a due caratteri come "14" o "20"
    var endX = suLato==="dx" ? (SL_W-74) : 74;
    var stile = acceso ? ' style="stroke:'+col+';stroke-width:2"' : '';
    wires+='<path class="slwire'+(acceso?' att':'')+'"'+stile+' d="M '+vFull[0].toFixed(1)+' '+vFull[1].toFixed(1)
         + ' L '+colX+' '+vFull[1].toFixed(1)
         + ' L '+colX+' '+ly
         + ' L '+endX+' '+ly+'"/>';
    var colSig = acceso ? ' style="fill:'+col+'"' : '';
    lbls+='<text class="slsig'+(acceso?' att':'')+'"'+colSig+' x="'+lblX+'" y="'+(ly-9)+'" text-anchor="'+anchor+'">'+c.sigla+'</text>'
       + '<text class="slval" x="'+lblX+'" y="'+(ly+17)+'" text-anchor="'+anchor+'">'+totaleCar(c.k)+'</text>'
       + '<text class="slmod" x="'+(suLato==="dx"?lblX-44:lblX+44)+'" y="'+(ly+17)+'" text-anchor="'+anchor+'">['+segno(modCar(c.k))+']</text>';
  });

  host.innerHTML =
    '<svg viewBox="0 0 '+SL_W+' '+SL_H+'">'
    + '<g class="wires">'+wires+'</g>'
    + out
    + '<g class="lbls">'+lbls+'</g></svg>'
    + '<div class="stcol">'+CARATT.map(function(c){
        var acceso = state.statsEvid && c.k===alta;
        return '<div class="scrow'+(acceso?' att':'')+'"><span class="ss">'+c.sigla+'</span>'
             + '<span class="sv">'+totaleCar(c.k)+'</span>'
             + '<span class="sm">['+segno(modCar(c.k))+']</span></div>';
      }).join("")+'</div>';

  applicaTesti();
}

function renderStatsDialog(){
  state.stats.modo="pointbuy";
  var punti=document.getElementById("statsPunti");
  punti.innerHTML='<span class="pblab">Punti rimasti</span><span class="pbnum">'+pbLiberi()+'</span><span class="pbtot">/ '+PB_TOTALE+'</span>';
  punti.className="puntibox"+(pbLiberi()===0?" finiti":"");

  disegnaEsagono();
  disegnaFila();
  disegnaCreazione();
}

/* La sezione "Bonus di creazione": scegli il formato (+2/+1 o +1/+1/+1) e
   assegni ogni voce a una caratteristica DIVERSA. Il totale si aggiorna da solo
   (base + bonus di creazione). Le voci gia' usate sono disattivate negli altri
   menu', cosi' non puoi metterne due sulla stessa caratteristica. */
function disegnaCreazione(){
  var host=document.getElementById("statsCrea"); if(!host) return;
  var f=state.stats.formato, imp=importiFormato(f), sl=state.stats.slots||[];
  var html='<div class="creahd">Bonus di creazione</div>';
  html+='<div class="crfmt">'
    + '<button type="button" class="opt'+(f==="2+1"?" on":"")+'" data-crfmt="2+1">+2 / +1</button>'
    + '<button type="button" class="opt'+(f==="1+1+1"?" on":"")+'" data-crfmt="1+1+1">+1 / +1 / +1</button>'
    + (f ? '<button type="button" class="opt crnull" data-crfmt="">Nessuno</button>' : '')
    + '</div>';
  if(imp.length){
    html+='<div class="crslots">';
    imp.forEach(function(amt,i){
      var scelto=sl[i]||"";
      var opts='<option value="">—</option>'+CARATT.map(function(c){
        var usataAltrove = sl.some(function(k,j){ return j!==i && k===c.k; });
        return '<option value="'+c.k+'"'+(scelto===c.k?' selected':'')+(usataAltrove?' disabled':'')+'>'+esc(c.nome)+'</option>';
      }).join("");
      html+='<label class="crslot"><span class="cramt">'+segno(amt)+'</span>'
        + '<select data-crslot="'+i+'">'+opts+'</select></label>';
    });
    html+='</div>';
    if(!creazioneCompleta()) html+='<div class="crwarn">Assegna tutte le voci del bonus.</div>';
  }
  host.innerHTML=html;
}
/* Comandi del bonus di creazione (scelta formato + assegnazione alle stat). */
(function(){
  var ms=document.getElementById("modalStats"); if(!ms) return;
  ms.addEventListener("click", function(e){
    var fb=e.target.closest("[data-crfmt]"); if(!fb) return;
    var f=fb.getAttribute("data-crfmt");
    state.stats.formato = (f==="2+1"||f==="1+1+1") ? f : "";
    state.stats.slots = importiFormato(state.stats.formato).map(function(){ return ""; });
    applicaBonusCreazione(); renderAll(); aggiornaSalva();
  });
  ms.addEventListener("change", function(e){
    var s=e.target.closest("[data-crslot]"); if(!s) return;
    var i=parseInt(s.getAttribute("data-crslot"),10), val=s.value;
    var sl=(state.stats.slots||[]).slice();
    // caratteristiche diverse: se il valore e' gia' usato altrove, liberalo li'
    if(val) sl.forEach(function(k,j){ if(j!==i && k===val) sl[j]=""; });
    sl[i]=val; state.stats.slots=sl;
    applicaBonusCreazione(); renderAll(); aggiornaSalva();
  });
})();

var HEX_CX=150, HEX_CY=150, HEX_R=112;
function hexPunto(idx, frazione){
  var ang=(-90+idx*60)*Math.PI/180, r=HEX_R*frazione;
  return [HEX_CX + r*Math.cos(ang), HEX_CY + r*Math.sin(ang)];
}
function disegnaEsagono(){
  var out="", i;
  // le maglie di fondo, tre esagoni concentrici
  [1, 0.62, 0.3].forEach(function(f){
    var p=CARATT.map(function(c,idx){ return hexPunto(idx,f).map(function(n){return n.toFixed(1);}).join(","); }).join(" ");
    out+='<polygon class="hexgrid" points="'+p+'"/>';
  });
  // i sei raggi
  CARATT.forEach(function(c,idx){
    var e=hexPunto(idx,1);
    out+='<line class="hexspoke" x1="'+HEX_CX+'" y1="'+HEX_CY+'" x2="'+e[0].toFixed(1)+'" y2="'+e[1].toFixed(1)+'"/>';
  });
  // il poligono del personaggio, col colore scelto
  var col=state.statsColor||"#7C5CFF";
  var pts=CARATT.map(function(c,idx){ return hexPunto(idx,frazioneDi(c.k)).map(function(n){return n.toFixed(1);}).join(","); });
  out+='<polygon class="hexfill" points="'+pts.join(" ")+'" style="fill:'+col+'26;stroke:'+col+'"/>';
  // solo le sigle agli angoli: niente numeri, quelli stanno nei riquadri sotto
  CARATT.forEach(function(c,idx){
    var lab=hexPunto(idx,1.24), att=(c.k===statAtt);
    var dy = idx===0 ? -2 : (idx===3 ? 14 : 5);
    out+='<text class="hexsig'+(att?' att':'')+'" x="'+lab[0].toFixed(1)+'" y="'+(lab[1]+dy).toFixed(1)+'" text-anchor="middle">'+c.sigla+'</text>';
  });
  document.getElementById("hexSvg").innerHTML=out;
  applicaTesti();
}

function disegnaFila(){
  // mostro la riga di calcolo se c'è QUALSIASI bonus in gioco: quello di
  // creazione o il +1 di un talento
  var mostraCalc = conBonus() || CARATT.some(function(x){ return bonusCarTalentiEff(x.k)!==0; });
  document.getElementById("stFila").innerHTML = CARATT.map(function(c){
    var v=state.stats.base[c.k];
    var bonC=state.stats.bonus[c.k], bonT=bonusCarTalentiEff(c.k);   // effettivo: già cappato a 20
    var giu = v<=PB_MIN;
    var su  = v>=PB_MAX || (pbCosto(v+1)-pbCosto(v))>pbLiberi();
    var comando = '<span class="pb">'
      + '<button class="pbtn" data-car="'+c.k+'" data-verso="-1"'+(giu?' disabled':'')+'>&minus;</button>'
      + '<span class="pbv">'+v+'</span>'
      + '<button class="pbtn" data-car="'+c.k+'" data-verso="1"'+(su?' disabled':'')+'>+</button>'
      + '</span>';
    var somma=''+v;
    if(bonC!==0) somma+=' '+segno(bonC);
    if(bonT!==0) somma+=' <b class="bcalc-tal" title="dal talento">'+segno(bonT)+'</b>';
    var calc = mostraCalc
      ? '<div class="bcalc">'+somma+' = '+totaleCar(c.k)+' <i>'+segno(modCar(c.k))+'</i></div>'
      : '';
    var cls="stbox"+(c.k===statAtt?" att":"")+((bonC!==0||bonT!==0)?" conbonus":"");
    return '<div class="'+cls+'" data-pick="'+c.k+'"><span class="bs">'+c.sigla+'</span>'
         + '<span class="bn">'+c.nome+'</span>'+comando+calc+'</div>';
  }).join("");
}

/* ================= ASPETTO DELLE SCRITTE =================
   Ogni scritta della scheda e' registrata qui una volta sola: font e colore
   suoi, piu' due agganci al nome (uno per il font, uno per il colore).
   I valori di partenza sono quelli che la scheda ha gia' nel foglio di stile,
   quindi finche' non si tocca niente non cambia niente.
   Quando arriveranno i riquadri nuovi (caratteristiche, tiri salvezza...)
   basta aggiungere una riga qui e i comandi compaiono da soli. */
var TESTI=[
  { id:"etNome",    dove:"name",  nome:"Etichetta",            sel:"#eyebrow",             font:"",       colore:"#9A97AD" },
  { id:"etLivello", dove:"xp",    nome:"Etichetta",            sel:"#levelPanel .eyebrow", font:"",       colore:"#9A97AD" },
  { id:"numLv",     dove:"xp",    nome:"Numero del livello",   sel:"#lvNum",               font:"cinzel", colore:"#E0B15E" },
  { id:"txtPE",     dove:"xp",    nome:"Riga dei PE",          sel:"#xpTxt, #lvMax",       font:"",       colore:"#9A97AD" },
  { id:"numPE",     dove:"xp",    nome:"Numeri dei PE",        sel:"#xpTxt b",             font:"",       colore:"#E8E6F0" },
  { id:"etClasse",  dove:"class", nome:"Etichetta",            sel:"#classPanel .eyebrow", font:"",       colore:"#9A97AD" },
  { id:"lvCl",      dove:"class", nome:"Livello della classe", sel:".cl",                  font:"",       colore:"#E0B15E" },
  { id:"etRazza",   dove:"razza", nome:"Etichetta",            sel:"#razzaPanel .eyebrow", font:"",       colore:"#9A97AD" },
  { id:"nomeRazza", dove:"razza", nome:"Nome della razza",     sel:".rzname",              font:"cinzel", colore:"#E8E6F0" },
  { id:"tipoRazza", dove:"razza", nome:"Tipologia",            sel:".rztipo",              font:"",       colore:"#E0B15E" },
  { id:"etAlign",   dove:"align", nome:"Etichetta",            sel:"#alignPanel .eyebrow", font:"",       colore:"#9A97AD" },
  { id:"nomeAlign", dove:"align", nome:"Allineamento",         sel:".alname",              font:"cinzel", colore:"#E8E6F0" },
  { id:"siglaCar",  dove:"stats", nome:"Sigla",                sel:".slsig, .scrow .ss, .hexsig", font:"", colore:"#9A97AD" },
  { id:"valCar",    dove:"stats", nome:"Valore",               sel:".slval, .scrow .sv, .hexval", font:"cinzel", colore:"#E8E6F0" },
  { id:"modiCar",   dove:"stats", nome:"Modificatore",         sel:".slmod, .scrow .sm, .hexmod", font:"", colore:"#E0B15E" },
  { id:"etProf",    dove:"prof",  nome:"Etichetta",            sel:"#profPanel .eyebrow",  font:"",       colore:"#9A97AD" },
  { id:"valProf",   dove:"prof",  nome:"Bonus",                sel:"#profVal",             font:"cinzel", colore:"#E0B15E" },
  { id:"siglaTs",   dove:"ts",    nome:"Sigla",                sel:".tssig",               font:"",       colore:"#9A97AD" },
  { id:"valTs",     dove:"ts",    nome:"Valore",               sel:".tsval",               font:"cinzel", colore:"#E8E6F0" },
  { id:"nomeAbil",  dove:"abil",  nome:"Nome dell'abilit\u00E0",    sel:".abnome",              font:"",       colore:"#E8E6F0" },
  { id:"valAbil",   dove:"abil",  nome:"Valore",               sel:".abval",               font:"cinzel", colore:"#E0B15E" },
  { id:"etPP",      dove:"abil",  nome:"Etichetta passiva",    sel:".ppet",                font:"",       colore:"#9A97AD" },
  { id:"valPP",     dove:"abil",  nome:"Valore passivo",       sel:".ppval",               font:"cinzel", colore:"#E8E6F0" },
  { id:"etPf",      dove:"hp",    nome:"Etichetta",            sel:"#hpPanel .eyebrow",     font:"",       colore:"#9A97AD" },
  { id:"numPf",     dove:"hp",    nome:"Punti attuali",        sel:"#hpCur",                font:"cinzel", colore:"#57C46A" },
  { id:"maxPf",     dove:"hp",    nome:"Massimo",              sel:"#hpMax",                font:"cinzel", colore:"#9A97AD" },
  { id:"tempPf",    dove:"hp",    nome:"Temporanei",           sel:"#hpTemp",               font:"",       colore:"#A78BFA" },
  { id:"etDif",     dove:"dif",   nome:"Etichette",            sel:"#difPanel .eyebrow",    font:"",       colore:"#9A97AD" },
  { id:"valDif",    dove:"dif",   nome:"Valore",               sel:"#dif_ca_val, #dif_iniz_val, #dif_vel_val", font:"cinzel", colore:"#E0B15E" }
];
var TESTO={}; TESTI.forEach(function(t){ TESTO[t.id]=t; });
function testiDiPartenza(){
  var o={};
  TESTI.forEach(function(t){ o[t.id]={ font:t.font, colore:t.colore, legaFont:false, legaColore:false,
    bold:false, italic:false, underline:false, smallcaps:false, neon:false, legaFmt:false }; });
  return o;
}
var FORMATI=["bold","italic","underline","smallcaps","neon"];
/* Quali formati valgono per una scritta: i suoi, o quelli del nome se
   l'aggancio dei formati e' acceso. Il nome tiene i suoi in state.bold ecc. */
function fmtDi(id){
  var s=state.testi[id];
  if(s.legaFmt) return { bold:state.bold, italic:state.italic, underline:state.underline, smallcaps:state.smallcaps, neon:state.neon };
  return { bold:s.bold, italic:s.italic, underline:s.underline, smallcaps:s.smallcaps, neon:s.neon };
}

/* Valori di partenza, usati dai tasti Azzera */
var DEF_NAME={ font:"cinzel", size:40, align:"left", bold:true, italic:false, underline:false,
  smallcaps:false, neon:false, dropcap:false, upper:false, label:true,
  nameColor:"#E8E6F0", capColor:"#E0B15E", emblemMode:"auto" };
var DEF_XP={ xpStyle:"grad", xpColor1:"#7C5CFF", xpColor2:"#E0B15E" };
var DEF_HP={ hpColorPieno:"#57C46A", hpColorFerito:"#E0B15E", hpColorCritico:"#E5686D" };

state.testi = testiDiPartenza();
state.stats = statsDiPartenza();

var elName=document.getElementById("name"), elHeader=document.getElementById("header"),
    elEyebrow=document.getElementById("eyebrow"), elReadout=document.getElementById("readout"),
    elFont=document.getElementById("font"), elCapSection=document.getElementById("capSection"),
    elEmblem=document.getElementById("emblem"), emLeft=document.getElementById("emLeft"), emRight=document.getElementById("emRight");

var SAVE_FIELDS=["font","size","align","bold","italic","underline","smallcaps","neon","dropcap","upper","label","nameColor","capColor","emblemMode","xpStyle","xpColor1","xpColor2","statsEvid","statsColor","transizione","retroVista","classSymColor","tsCompColor","tsDadoColor","abilCarColore","hpColorPieno","hpColorFerito","hpColorCritico","difIcoColor","razza","allineamento"];
/* "testi" non sta nell'elenco qui sopra apposta: si salva con tutto il resto
   ma si rilegge una scritta alla volta, in applicaDati. */

/* Legge un oggetto scheda e lo riversa nello stato */
function applicaDati(o){
  if(!o || typeof o!=="object") return;
  SAVE_FIELDS.forEach(function(k){ if(o[k]!==undefined) state[k]=o[k]; });
  // Le caratteristiche si rileggono una per una, e ogni numero passa da un
  // controllo: una scheda vecchia non le ha, e una modificata a mano potrebbe
  // avere dentro qualsiasi cosa.
  state.stats = statsDiPartenza();
  if(o.stats && typeof o.stats==="object"){
    state.stats.modo="pointbuy";   // unico modo rimasto
    CARATT.forEach(function(c){
      var b = o.stats.base && o.stats.base[c.k];
      if(typeof b==="number" && isFinite(b)) state.stats.base[c.k]=Math.max(CAR_MIN, Math.min(CAR_MAX, Math.round(b)));
    });
    // bonus di creazione: si rilegge il formato e gli slot; il bonus per
    // caratteristica si ricalcola da qui (il vecchio campo "bonus" a mano non
    // esiste piu' e le schede vecchie che lo avevano ripartono senza).
    state.stats.formato = (o.stats.formato==="2+1" || o.stats.formato==="1+1+1") ? o.stats.formato : "";
    state.stats.slots = Array.isArray(o.stats.slots)
      ? o.stats.slots.map(function(k){ return (typeof k==="string" && CARATT.some(function(c){return c.k===k;})) ? k : ""; })
      : [];
    applicaBonusCreazione();
  }
  state.statsEvid = (o.statsEvid!==false);   // acceso di default
  if(state.transizione!=="dissolvenza") state.transizione="morph";   // solo valori validi, default morph
  if(state.retroVista!=="elenco") state.retroVista="hub";            // solo valori validi, default hub
  if(typeof o.statsColor==="string" && /^#[0-9a-fA-F]{6}$/.test(o.statsColor)) state.statsColor=o.statsColor;
  else state.statsColor="#7C5CFF";
  if(typeof o.classSymColor==="string" && /^#[0-9a-fA-F]{6}$/.test(o.classSymColor)) state.classSymColor=o.classSymColor;
  else state.classSymColor="#a78bfa";
  // i due colori dei tiri salvezza: se la scheda e' vecchia o il valore e'
  // scritto male, si torna a quelli di partenza invece di rompere il disegno
  if(typeof o.tsCompColor==="string" && /^#[0-9a-fA-F]{6}$/.test(o.tsCompColor)) state.tsCompColor=o.tsCompColor;
  else state.tsCompColor="#E0B15E";
  if(typeof o.tsDadoColor==="string" && /^#[0-9a-fA-F]{6}$/.test(o.tsDadoColor)) state.tsDadoColor=o.tsDadoColor;
  else state.tsDadoColor="#A78BFA";
  // i tre colori "salute" della barra dei punti ferita: se mancano o sono
  // scritti male, tornano ai valori standard (verde / oro / rosso).
  ["hpColorPieno","hpColorFerito","hpColorCritico"].forEach(function(k){
    state[k] = (typeof o[k]==="string" && /^#[0-9a-fA-F]{6}$/.test(o[k])) ? o[k] : DEF_HP[k];
  });

  // le scritte si travasano una per una invece di copiare l'oggetto intero:
  // una scheda vecchia non ce l'ha, una nuova potrebbe averne di piu'
  state.testi = testiDiPartenza();
  if(o.testi && typeof o.testi==="object"){
    TESTI.forEach(function(t){
      var v=o.testi[t.id], d=state.testi[t.id];
      if(!v || typeof v!=="object") return;
      if(v.font==="" || FONTS[v.font]) d.font=v.font;
      if(typeof v.colore==="string" && /^#[0-9a-fA-F]{6}$/.test(v.colore)) d.colore=v.colore;
      d.legaFont=!!v.legaFont; d.legaColore=!!v.legaColore; d.legaFmt=!!v.legaFmt;
      FORMATI.forEach(function(k){ d[k]=!!v[k]; });
    });
  }
  if(Array.isArray(o.classes)) state.classes=o.classes.filter(function(c){ return BY_KEY[c.key]; }).slice(0,MAX_CLASSI);

  // Abilita': si rileggono una per una e si accettano solo 1 e 2. Una scheda
  // vecchia non ce le ha, una modificata a mano potrebbe avere dentro di tutto.
  state.abilita={};
  if(o.abilita && typeof o.abilita==="object"){
    ABILITA.forEach(function(a){
      var v=o.abilita[a.k];
      if(v===1 || v===2) state.abilita[a.k]=v;
    });
  }
  // colore scelto per ogni caratteristica: solo esadecimali validi, il resto
  // torna alla base. Una scheda vecchia non ce l'ha: parte tutta dalla base.
  state.abilCarColore={};
  if(o.abilCarColore && typeof o.abilCarColore==="object"){
    CARATT.forEach(function(c){
      var v=o.abilCarColore[c.k];
      if(/^#[0-9a-fA-F]{6}$/.test(v||"")) state.abilCarColore[c.k]=v;
    });
  }

  // Classe iniziale: da qui arrivano i tiri salvezza. Se la scheda e' vecchia
  // e non ce l'ha, o indica una classe che non c'e' piu', vale la prima della
  // lista, cioe' la prima che era stata aggiunta.
  state.classeIniziale = (typeof o.classeIniziale==="string"
      && state.classes.some(function(c){ return c.key===o.classeIniziale; }))
    ? o.classeIniziale
    : (state.classes.length ? state.classes[0].key : "");

  // Nomi e simboli per-classe. Se mancano (scheda vecchia), si ricava lo stile
  // dal vecchio nome unico e dal vecchio colore simbolo, cosi' l'aspetto non cambia.
  state.nomiClasse={}; state.simboli={}; state.sottoStili={};
  function validaNomeCl(v){
    if(!v || typeof v!=="object") return null;
    var d={}; for(var kk in DEF_NOMECL) d[kk]=DEF_NOMECL[kk];
    if(v.font==="" || FONTS[v.font]) d.font=v.font;
    if(typeof v.colore==="string" && /^#[0-9a-fA-F]{6}$/.test(v.colore)) d.colore=v.colore;
    d.legaFont=!!v.legaFont; d.legaColore=!!v.legaColore; d.legaFmt=!!v.legaFmt;
    FORMATI.forEach(function(k){ d[k]=!!v[k]; });
    return d;
  }
  var vecchioNome = (o.testi && typeof o.testi==="object") ? o.testi.nomeCl : null;
  state.classes.forEach(function(c){
    var v = o.nomiClasse && o.nomiClasse[c.key];
    var d = validaNomeCl(v) || validaNomeCl(vecchioNome);
    if(d) state.nomiClasse[c.key]=d;
    var ds = validaNomeCl(o.sottoStili && o.sottoStili[c.key]);
    if(ds) state.sottoStili[c.key]=ds;
    var sv = o.simboli && o.simboli[c.key];
    if(sv && typeof sv==="object"){
      var col = (typeof sv.colore==="string" && /^#[0-9a-fA-F]{6}$/.test(sv.colore)) ? sv.colore : state.classSymColor;
      state.simboli[c.key]={ colore:col, neon:!!sv.neon };
    } else {
      state.simboli[c.key]={ colore:state.classSymColor, neon:false };
    }
  });
  sel.class=null;
  // Razza: si salva solo l'id (una stringa) della razza scelta nel grimorio.
  // Se la scheda e' vecchia o il dato e' scritto male, resta "nessuna razza".
  state.razza = (typeof o.razza==="string") ? o.razza : "";
  // Sottoclassi: una per classe, mappa chiave-classe -> id sottoclasse (stringhe).
  // Una scheda vecchia non ce l'ha; una modificata a mano potrebbe avere di tutto.
  state.sottoclassi={};
  if(o.sottoclassi && typeof o.sottoclassi==="object"){
    for(var _k in o.sottoclassi){
      if(BY_KEY[_k] && typeof o.sottoclassi[_k]==="string" && o.sottoclassi[_k]) state.sottoclassi[_k]=o.sottoclassi[_k];
    }
  }
  // Talenti scelti: due liste di id (stringhe), in ordine di scelta, piu' le
  // liste parallele delle caratteristiche scelte per i "+1 a scelta" e lo sblocco
  // dell'origine. Una scheda vecchia non ce le ha; una modificata a mano potrebbe
  // avere di tutto: si rimette tutto in forma (vedi normalizzaTalenti).
  state.talenti = normalizzaTalenti(o.talenti);
  if(typeof o.xp==="number" && isFinite(o.xp) && o.xp>=0) state.xp=o.xp;

  // Punti ferita: attuali, temporanei, ritocco del massimo, dadi vita spesi e
  // tiri contro la morte. Il massimo non si salva (si ricalcola dai dadi vita).
  state.pfScostamento = (typeof o.pfScostamento==="number" && isFinite(o.pfScostamento)) ? Math.round(o.pfScostamento) : 0;
  state.pfAttuali = (typeof o.pfAttuali==="number" && isFinite(o.pfAttuali)) ? Math.round(o.pfAttuali) : null;
  state.pfTemp = (typeof o.pfTemp==="number" && isFinite(o.pfTemp) && o.pfTemp>0) ? Math.round(o.pfTemp) : 0;
  state.dvSpesi = {};
  if(o.dvSpesi && typeof o.dvSpesi==="object"){
    [6,8,10,12].forEach(function(d){ var v=o.dvSpesi[d]; if(typeof v==="number" && isFinite(v) && v>0) state.dvSpesi[d]=Math.round(v); });
  }
  state.morteS = (typeof o.morteS==="number" && o.morteS>0) ? Math.min(3, Math.round(o.morteS)) : 0;
  state.morteF = (typeof o.morteF==="number" && o.morteF>0) ? Math.min(3, Math.round(o.morteF)) : 0;
  // ritocco a mano: ormai solo la CA (Iniziativa e Velocita' sono automatiche);
  // gli eventuali vecchi ritocchi di iniz/vel si lasciano cadere.
  state.difScost={};
  if(o.difScost && typeof o.difScost==="object"){
    DIF_ORD.forEach(function(k){ if(!DIF_MANUALE[k]) return; var v=o.difScost[k]; if(typeof v==="number" && isFinite(v)) state.difScost[k]=Math.round(v); });
  }
  state.difIcoColor = (typeof o.difIcoColor==="string" && /^#[0-9a-fA-F]{6}$/.test(o.difIcoColor)) ? o.difIcoColor : "#E0B15E";

  elName.textContent = (typeof o.name==="string") ? o.name : "";
}
/* Impacchetta lo stato per il database */
function datiDaSalvare(){
  var o={}; SAVE_FIELDS.forEach(function(k){ o[k]=state[k]; });
  o.classes=state.classes; o.classeIniziale=classeTs(); o.xp=state.xp; o.name=elName.textContent.trim();
  o.sottoclassi=state.sottoclassi;
  o.abilita=abilitaDaSalvare();
  o.testi=state.testi; o.stats=state.stats;
  o.nomiClasse=state.nomiClasse; o.sottoStili=state.sottoStili; o.simboli=state.simboli;
  o.pfAttuali=state.pfAttuali; o.pfTemp=state.pfTemp; o.pfScostamento=state.pfScostamento;
  o.dvSpesi=state.dvSpesi; o.morteS=state.morteS; o.morteF=state.morteF;
  o.difScost=state.difScost;
  // NB: lo sblocco del +1 d'origine NON si salva qui: vive nella colonna
  // schede.origine_sbloccata (roba dello staff), così il salvataggio del player
  // non può azzerarlo. Salvo solo le liste scelte e le caratteristiche scelte.
  o.talenti={
    origine:state.talenti.origine, normali:state.talenti.normali,
    asiOrigine:state.talenti.asiOrigine, asiNormali:state.talenti.asiNormali
  };
  return o;
}

/* Il salvataggio e' uno solo, in alto. La scheda si tiene la fotografia
   dell'ultima versione salvata e la confronta con quella di adesso: se sono
   diverse c'e' qualcosa da salvare, e il tasto si accende da solo. Cosi'
   funziona anche se uno rimette le cose com'erano: il tasto si rispegne. */
var salvato="", statoSalva="";
function foto(){ return JSON.stringify(datiDaSalvare()); }
function sporco(){ return foto()!==salvato; }

function msgSalva(t,ko){
  var el=document.getElementById("salvaMsg"); if(!el) return;
  el.textContent=t||""; el.className="salvamsg"+(ko?" ko":"");
  clearTimeout(msgSalva._t);
  if(t && !ko) msgSalva._t=setTimeout(function(){ var e=document.getElementById("salvaMsg"); if(e) e.textContent=""; },2200);
}
function aggiornaSalva(){
  var b=document.getElementById("btnSalva"); if(!b) return;
  if(statoSalva==="salvo"){ b.className="btn-salva"; b.disabled=true; b.textContent="Salvo\u2026"; return; }
  var s=sporco();
  b.className="btn-salva"+(s?" on":"");
  b.disabled=!s;
  b.textContent=s?"Salva":"Salvato";
}

function saveState(poi){
  if(!utente){ msgSalva("Non risulti entrato: ricarica la pagina",true); return; }
  if(soloLettura){ msgSalva("Questa scheda la puoi solo guardare",true); return; }
  var scatto=foto();               // la fotografia si prende adesso: se cambi qualcosa
  statoSalva="salvo"; aggiornaSalva();   // mentre salva, resta da salvare
  msgSalva("");
  var chi = bersaglio || utente.id;
  var riga = { user_id: chi, dati: datiDaSalvare() };
  var did = bersaglio ? discordDi(chi) : ((utente.user_metadata && utente.user_metadata.provider_id) || null);
  if(did) riga.discord_id=did;   // se non lo sappiamo non lo tocchiamo: mandarlo vuoto lo cancellerebbe
  sb.from("schede").upsert(riga).then(function(res){
    statoSalva="";
    if(res.error){ msgSalva("Non ha salvato: "+res.error.message,true); console.error(res.error); aggiornaSalva(); }
    else {
      salvato=scatto; msgSalva("Salvato \u2713"); aggiornaSalva();
      if(bersaglio) ctrlCaricato=false;   // l'elenco mostra dati vecchi: si rilegge alla prossima apertura
      if(poi) poi();
    }
  }).catch(function(e){
    statoSalva=""; msgSalva("Non ha risposto: riprova",true); aggiornaSalva(); console.error(e);
  });
}

/* ============ la scheda di un altro ============
   bersaglio = di chi e' la scheda che ho davanti. null vuol dire la mia.
   Il master guarda e basta, il supporto e lo sviluppatore mettono le mani.
   Il salvataggio finisce sulla riga di quella persona, non sulla propria. */
var bersaglio=null, soloLettura=false, personalizza=false;

/* Due fasi separate. Nella scheda si compila: nome, classi, esperienza,
   caratteristiche. In personalizzazione si guarda come sta: font, colori,
   aspetto. Tenerle insieme voleva dire avere sempre sotto gli occhi roba che
   distrae da quella che stai facendo. La finestra del Nome e' tutta estetica,
   quindi la sua rotellina esiste solo qui dentro. */
function modoEstetica(acceso){
  personalizza = !!acceso && !soloLettura;
  var b=document.getElementById("btnEste");
  if(b){ b.classList.toggle("on", personalizza); b.textContent = personalizza ? "Fine" : "Personalizza"; }
  document.getElementById("fasciaEste").hidden = !personalizza;
  var e=document.querySelectorAll(".este"), m=document.querySelectorAll(".mech"), i;
  for(i=0;i<e.length;i++) e[i].hidden = !personalizza;
  for(i=0;i<m.length;i++) m[i].hidden = personalizza;
  aggiornaRotelline();
  var _d=apertaAspetto(); if(_d) sincronizzaSel(_d);
}

function aggiornaRotelline(){
  var g=document.getElementById("gearName");
  if(g) g.hidden = soloLettura || !personalizza;   // il nome ha solo comandi estetici
  ["gearXp","gearClass","gearCore","gearProf","gearAlign"].forEach(function(id){
    var x=document.getElementById(id); if(x) x.hidden = soloLettura;
  });
  // le "i" (abilita' / tiri salvezza) si mostrano solo sulla vista attiva e non
  // a chi guarda soltanto
  var ia=document.getElementById("abilInfoBtn");
  if(ia) ia.hidden = soloLettura || vistaCore!=="abil";
  var it=document.getElementById("tsInfoBtn");
  if(it) it.hidden = soloLettura || vistaCore!=="ts";
  var b=document.getElementById("btnEste"); if(b) b.hidden = soloLettura;
}

function discordDi(id){
  var p=profiliCache.filter(function(x){ return x.user_id===id; })[0];
  return (p && p.discord_id) || null;
}
function nomeDi(id){
  var p=profiliCache.filter(function(x){ return x.user_id===id; })[0];
  return (p && (p.nome || p.username)) || "questa persona";
}

/* Rimette la scheda com'e' appena nata: senza, aprendo quella di un altro
   resterebbero addosso i font, i colori e le classi della propria. */
function schedaVuota(){
  for(var k in DEF_NAME) state[k]=DEF_NAME[k];
  for(var j in DEF_XP) state[j]=DEF_XP[j];
  state.classes=[]; state.xp=0; state.testi=testiDiPartenza(); state.stats=statsDiPartenza();
  state.nomiClasse={}; state.sottoStili={}; state.simboli={}; state.classSymColor="#a78bfa"; sel.class=null;
  state.razza="";
  state.sottoclassi={};
  state.talenti=talentiVuoti();
  state.allineamento="";
  elName.textContent="";
  if(typeof resetPagine==="function") resetPagine();   // ogni scheda si apre sul Fronte
}

function modoScheda(){
  var altrui = !!bersaglio;
  soloLettura = altrui && !puoToccareSchede();
  document.getElementById("fascia").hidden = !altrui;
  if(altrui){
    document.getElementById("fasciaTxt").innerHTML = "Stai guardando la scheda di <b>"+esc(nomeDi(bersaglio))+"</b>";
    document.getElementById("fasciaModo").textContent = soloLettura ? "sola lettura" : "puoi modificarla e salvarla";
  }
  elName.contentEditable = soloLettura ? "false" : "true";
  if(soloLettura && personalizza) modoEstetica(false);   // guardando quella di un altro non si personalizza
  aggiornaRotelline();
  var b=document.getElementById("btnSalva"); if(b) b.hidden=soloLettura;
  if(soloLettura) closeAll();
}

function apriScheda(id){
  conModifiche(function(){ caricaScheda(id); },
    "Sono state effettuate delle modifiche non salvate. Vuoi salvarle prima di aprire un'altra scheda?");
}

function caricaScheda(id){
  var msg=document.getElementById("ctrlMsg");
  if(msg) msg.textContent="Apro la scheda\u2026";
  sb.from("schede").select("dati,origine_sbloccata").eq("user_id", id).maybeSingle().then(function(r){
    if(r && r.error){ if(msg) msg.textContent="Non riesco ad aprirla: "+r.error.message; return; }
    if(msg) msg.textContent="";
    bersaglio=id;
    schedaVuota();
    if(r && r.data && r.data.dati) applicaDati(r.data.dati);
    applicaSbloccoOrigine(r && r.data);
    modoScheda();
    sincronizzaComandi();
    salvato=foto(); aggiornaSalva();
    mostraPane("scheda");
  }).catch(function(e){
    if(msg) msg.textContent="Non ha risposto: riprova.";
    console.error(e);
  });
}

function tornaAllaMia(){
  conModifiche(function(){ caricaLaMia(); },
    "Sono state effettuate delle modifiche non salvate. Vuoi salvarle prima di tornare alla tua?");
}

function caricaLaMia(){
  sb.from("schede").select("dati,origine_sbloccata").eq("user_id", utente.id).maybeSingle().then(function(r){
    bersaglio=null;
    schedaVuota();
    if(r && r.data && r.data.dati) applicaDati(r.data.dati);
    applicaSbloccoOrigine(r && r.data);
    modoScheda();
    sincronizzaComandi();
    salvato=foto(); aggiornaSalva();
    mostraPane("scheda");
  });
}

/* Uscire, o cambiare scheda, con roba non salvata */
var inSospeso=null;
function conModifiche(azione, testo){
  if(!sporco()){ azione(); return; }
  inSospeso=azione;
  document.getElementById("esciTxt").textContent=testo;
  document.getElementById("modalEsci").hidden=false;
}
function esciDavvero(){ sb.auth.signOut().then(function(){ location.reload(); }); }
function chiediUscita(){
  conModifiche(esciDavvero, "Sono state effettuate delle modifiche alla scheda. Vuoi salvarle prima di uscire?");
}
window.addEventListener("beforeunload", function(e){
  // il browser non lascia scrivere il nostro testo qui dentro: mostra il suo
  if(!utente || uscitaForzata || !sporco()) return;
  e.preventDefault(); e.returnValue="";
});

/* Il livello totale nasce dagli XP; i livelli di classe sono la sua distribuzione */
function totalLevel(){ return levelFromXP(state.xp); }
function assignedLevels(){ return state.classes.reduce(function(s,c){ return s+c.level; },0); }
function freeLevels(){ return totalLevel()-assignedLevels(); }
function has(key){ return state.classes.some(function(c){ return c.key===key; }); }

/* ================= PUNTI FERITA =================
   Il massimo nasce dai dadi vita delle classi + Costituzione, col metodo "media"
   del manuale: il PRIMO livello (della classe iniziale) prende il dado pieno,
   ogni altro livello la media del suo dado; ogni livello vale almeno 1. E' solo
   un suggerimento: il giocatore puo' ritoccarlo a mano, e si salva soltanto lo
   scostamento dal calcolo (cosi' segue comunque i cambi di livello e Costituzione).
   Il massimo NON si salva (si ricalcola); si salvano attuali, temporanei, dadi
   vita spesi e i tiri contro la morte. */
function avgDado(d){ return Math.floor(d/2)+1; }   // d6->4, d8->5, d10->6, d12->7

function pfMedia(){
  if(!state.classes.length) return 0;
  var conMod=modCar("cos"), iniz=classeTs(), tot=0, primoFatto=false;
  state.classes.forEach(function(c){
    var die=(BY_KEY[c.key] && BY_KEY[c.key].die) || 8;
    for(var i=0;i<c.level;i++){
      var pieno = (!primoFatto && c.key===iniz);   // il primissimo livello della classe iniziale
      if(pieno) primoFatto=true;
      tot += Math.max(1, (pieno?die:avgDado(die)) + conMod);   // mai meno di 1 per livello
    }
  });
  return tot;
}
function pfMax(){ return state.classes.length ? Math.max(1, pfMedia()+(state.pfScostamento||0)) : 0; }
/* Attuali validi e dentro i limiti; se mai impostati, la scheda parte piena. */
function pfAttualiVal(){
  var m=pfMax(), v=state.pfAttuali;
  if(typeof v!=="number" || !isFinite(v)) return m;
  return Math.max(0, Math.min(m, Math.round(v)));
}
function pfTempVal(){ var v=state.pfTemp; return (typeof v==="number"&&isFinite(v)&&v>0)?Math.round(v):0; }

/* I dadi vita, raggruppati per taglia (classi diverse con lo stesso dado si
   sommano). Ogni voce: taglia del dado, totale (= livelli con quel dado) e spesi. */
function dadiVitaPool(){
  var per={};
  state.classes.forEach(function(c){
    var die=(BY_KEY[c.key] && BY_KEY[c.key].die) || 8;
    per[die]=(per[die]||0)+c.level;
  });
  return Object.keys(per).map(Number).sort(function(a,b){ return a-b; }).map(function(d){
    var tot=per[d], sp=Math.max(0, Math.min(tot, Math.round((state.dvSpesi&&state.dvSpesi[d])||0)));
    return { die:d, tot:tot, spesi:sp, liberi:tot-sp };
  });
}
/* ============ SORGENTI E CONTRIBUTI (CA, Iniziativa, Velocità) ============
   Ogni valore derivato nasce da una BASE più una somma di CONTRIBUTI, ognuno con
   un'etichetta e una fonte. Oggi le fonti sono le caratteristiche e le regole di
   base; domani si aggiungono specie, sottoclassi, talenti e homebrew SENZA
   toccare i calcoli: basta che queste funzioni restituiscano più voci. Ogni
   valore ha inoltre un RITOCCO a mano salvato (la rete di sicurezza). I cassetti
   delle fonti future sono già qui e per ora tornano vuoti. */
function contribRazza(k){ return []; }         // niente finché non c'è la specie
function contribSottoclassi(k){ return []; }   // niente sottoclassi ancora
function contribTalenti(k){ return []; }        // niente talenti ancora
function contribHomebrew(k){ return []; }       // regole della casa: per ora a mano (il ritocco)
function contribFuture(k){ return contribRazza(k).concat(contribSottoclassi(k), contribTalenti(k), contribHomebrew(k)); }

function contributiCA(){
  // FUTURO: armatura indossata e scudo (equipaggiamento), Difesa senza armatura
  // di Barbaro/Monaco, bonus da talenti/oggetti/specie — ognuno una voce qui.
  return [{ et:"Base", val:10, fonte:"regola" },
          { et:"Destrezza", val:modCar("des"), fonte:"caratteristica" }].concat(contribFuture("ca"));
}
function contributiIniz(){
  // FUTURO: talento Allerta, tratti di specie, altri bonus.
  return [{ et:"Destrezza", val:modCar("des"), fonte:"caratteristica" }].concat(contribFuture("iniz"));
}
/* Ricava un numero di PIEDI dal testo libero della velocità nel grimorio
   (es. "9 metri (30 piedi)" → 30). Preferisce i piedi se scritti; altrimenti
   converte i metri (regola D&D: 1,5 m = 5 ft, cioè 1 ft = 0,3 m). Se non trova
   un'unità riconoscibile torna null (e si usa la base di regola). */
function parseVelPiedi(txt){
  if(!txt) return null;
  var s=String(txt).toLowerCase().replace(/,/g,"."), m;
  // preferisco i PIEDI se scritti (anche tra parentesi); poi i METRI convertiti.
  if((m=s.match(/(\d+(?:\.\d+)?)\s*(?:piedi|piede|feet|ft)\b/))) return Math.round(parseFloat(m[1]));
  if((m=s.match(/(\d+(?:\.\d+)?)\s*(?:metri|metro|mt|m)\b/)))    return Math.round(parseFloat(m[1])/0.3);
  return null;   // nessuna unità riconoscibile → velocità "non definita" (trattino)
}
function velRazzaPiedi(){
  var r = state.razza ? razzaById(state.razza) : null;
  return r ? parseVelPiedi(r.velocita) : null;
}
function contributiVel(){
  // La velocità arriva TUTTA dalla specie (nessuna base fissa): se non c'è razza,
  // o il testo non è leggibile, non è definita (in vista appare "—"). Tratti e
  // talenti si aggiungeranno come voci in più (cassetti futuri) senza toccare questo.
  var rv=velRazzaPiedi();
  var base = (rv!=null) ? { et:"Base (specie)", val:rv, fonte:"specie" }
                        : { et:"Base", val:0, fonte:"regola" };
  return [base].concat(contribFuture("vel"));
}
var DIF_VOCI={
  ca:  { nome:"Classe Armatura", fn:contributiCA },
  iniz:{ nome:"Iniziativa", fn:contributiIniz, segno:true },
  vel: { nome:"Velocità", fn:contributiVel, unita:" ft",
         fmt:function(v){ return metriDaPiedi(v)+" m ("+v+" ft)"; } }
};
/* Converte i piedi in metri per la vista (5 ft = 1,5 m), con la virgola
   italiana e senza decimali inutili: 30→"9", 35→"10,5". */
function metriDaPiedi(ft){ var m=Math.round(ft*0.3*100)/100; return (m%1===0?String(m):String(m).replace(".",",")); }
var DIF_ORD=["ca","iniz","vel"];
/* Quali valori si possono ancora ritoccare a mano. Iniziativa e Velocità si
   calcolano da sole (Destrezza / specie), quindi niente ritocco. La CA per ora
   sì: è solo "senza armatura" finché non costruiamo l'equipaggiamento; quando
   l'armatura la calcolerà da sola, basta mettere ca:false qui. */
var DIF_MANUALE={ ca:true, iniz:false, vel:false };
function ritoccoDif(k){ if(!DIF_MANUALE[k]) return 0; var m=state.difScost||{}, v=m[k]; return (typeof v==="number"&&isFinite(v))?Math.round(v):0; }
function baseDif(k){ return DIF_VOCI[k].fn().reduce(function(s,x){ return s+(x.val||0); },0); }
function valoreDif(k){ return baseDif(k)+ritoccoDif(k); }
/* Formattazione per la vista: l'iniziativa col segno, la velocità coi piedi. */
function mostraDif(k, v){
  var d=DIF_VOCI[k];
  if(k==="vel" && velRazzaPiedi()==null) return "—";   // niente razza (o velocità illeggibile) → trattino
  if(d.fmt) return d.fmt(v);
  return d.segno ? segno(v) : (v + (d.unita||""));
}

/* La "salute": pieno finche' stai sopra un quarto della vita, ferito sotto il
   25%, critico sotto il 10% (e a 0). Da qui nascono il colore della barra e
   quello del numero dei punti attuali quando cala. */
function saluteHp(){
  if(!state.classes.length) return "pieno";
  var max=pfMax(), cur=pfAttualiVal();
  if(cur<=0) return "critico";
  if(max<=0) return "pieno";
  var r=cur/max;
  if(r<=0.10) return "critico";
  if(r<=0.25) return "ferito";
  return "pieno";
}
function coloreSaluteHp(st){
  var k = st==="critico" ? "hpColorCritico" : (st==="ferito" ? "hpColorFerito" : "hpColorPieno");
  return /^#[0-9a-fA-F]{6}$/.test(state[k]||"") ? state[k] : DEF_HP[k];
}
/* Dipinge la barra e, quando la vita cala, tinge il numero dei punti attuali di
   oro/rosso per avvertire (a vita piena resta il suo colore, deciso dalle
   scritte). Va chiamata come ultimo tocco, dopo applicaTesti. */
function dipingiSaluteHp(){
  var fill=document.getElementById("hpFill"), cur=document.getElementById("hpCur");
  if(!fill) return;
  var noCl=!state.classes.length, st=saluteHp(), col=coloreSaluteHp(st);
  fill.style.background = noCl ? "" : col;
  if(cur && !noCl && st!=="pieno"){ cur.style.color=col; cur.style.fill=col; }
  var heart=document.getElementById("hpHeart");
  if(heart) heart.style.color = noCl ? "" : col;   // il cuore segue la salute (verde/oro/rosso)
}

/* Lo stato mortale del personaggio, dai tiri contro la morte quando sei a 0:
   "morente" (stai tirando), "stabile" (tre successi), "morto" (tre fallimenti).
   Sopra 0 sei "vivo". */
function statoMortale(){
  if(!state.classes.length || pfAttualiVal()>0) return "vivo";
  if((state.morteF||0)>=3) return "morto";
  if((state.morteS||0)>=3) return "stabile";
  return "morente";
}
/* Quanto la scheda e' sbiadita: 0 colori pieni, 1 grigio cenere. A 0 PF una
   leggera velatura; ogni fallimento spegne di piu', ogni successo ridA colore.
   La cenere piena (1) e' riservata alla morte vera. */
function progressoMorte(){
  var st=statoMortale();
  if(st==="morto") return 1;
  if(st==="stabile" || st==="vivo") return 0;
  var g = 0.15 + 0.28*(state.morteF||0) - 0.13*(state.morteS||0);
  return Math.max(0, Math.min(0.92, g));
}
/* Sbiadisce la scheda (header + riquadri), accende il banner "MORTO" e mette il
   teschio negli HP. I modali e il banner restano fuori dal filtro, cosi' non si
   incasinano e il banner resta a colori sopra la cenere. */
function aggiornaMortalita(){
  var st=statoMortale(), g=progressoMorte();
  var filtro = g>0 ? "grayscale("+g.toFixed(3)+") brightness("+(1-0.22*g).toFixed(3)+")" : "";
  var head=document.getElementById("header"), prow=document.querySelector("#paneScheda .prow");
  if(head) head.style.filter=filtro;
  if(prow) prow.style.filter=filtro;
  var banner=document.getElementById("hpBanner");
  if(banner) banner.classList.toggle("on", st==="morto");
  var hp=document.getElementById("hpPanel");
  if(hp){ hp.classList.toggle("morto", st==="morto"); hp.classList.toggle("stabile", st==="stabile"); }
  var cur=document.getElementById("hpCur");
  if(cur && st==="morto") cur.textContent="☠";   // teschio al posto del numero
  var rev=document.getElementById("hpRevive"); if(rev) rev.disabled=soloLettura;
}
/* Riporta in vita: un punto ferita e tiri contro la morte azzerati (l'esito di
   una magia come Rincuorare). La scheda torna a colori da sola. */
function rianima(){
  if(soloLettura || !state.classes.length) return;
  state.pfAttuali=1; state.morteS=0; state.morteF=0;
  vistaHp="dadi";
  renderAll(); aggiornaSalva();
}

function emblemKeys(){
  if(state.emblemMode==="auto") return state.classes.map(function(c){ return c.key; });
  if(state.emblemMode==="none") return [];
  return ICONS[state.emblemMode] ? [state.emblemMode] : [];
}
function groupHTML(keys){
  return keys.map(function(k,i){
    return (i? '<span class="embsep"></span>' : '') + '<span class="emb">'+emblemSVG(k)+'</span>';
  }).join("");
}
function positionEmblems(){
  var keys=emblemKeys();
  emLeft.classList.remove("mirror");
  if(!keys.length){
    emLeft.innerHTML=emRight.innerHTML="";
    emLeft.style.display=emRight.style.display="none";
  } else if(state.align==="center"){
    if(keys.length===1){
      emLeft.innerHTML=groupHTML(keys); emRight.innerHTML=groupHTML(keys);
      emLeft.classList.add("mirror");
    } else {
      var half=Math.ceil(keys.length/2);
      emLeft.innerHTML=groupHTML(keys.slice(0,half));
      emRight.innerHTML=groupHTML(keys.slice(half));
    }
    emLeft.style.display=emRight.style.display="flex";
  } else if(state.align==="right"){
    emLeft.innerHTML=groupHTML(keys); emRight.innerHTML="";
    emLeft.style.display="flex"; emRight.style.display="none";
  } else {
    emRight.innerHTML=groupHTML(keys); emLeft.innerHTML="";
    emRight.style.display="flex"; emLeft.style.display="none";
  }
  var jc = state.align==="center" ? "center" : (state.align==="right" ? "flex-end" : "flex-start");
  document.getElementById("namerow").style.justifyContent=jc;
}
function setNameSize(px){
  elName.style.fontSize=px+"px";
  var em=Math.round(px*1.45)+"px", sep=Math.round(px*0.42)+"px";
  var embs=document.querySelectorAll(".emb");
  for(var i=0;i<embs.length;i++){ embs[i].style.width=em; embs[i].style.height=em; }
  // il separatore tra i simboli e' un trattino orizzontale: scala in LARGHEZZA
  // col nome, l'altezza (sottile) la tiene il CSS
  var seps=document.querySelectorAll(".embsep");
  for(var j=0;j<seps.length;j++){ seps[j].style.width=sep; seps[j].style.height=""; }
}
function fitName(){
  var row=document.getElementById("namerow");
  var avail=row.clientWidth;
  // Se la scheda \u00E8 ancora nascosta la larghezza \u00E8 zero: misurare ora darebbe un nome minuscolo
  if(!avail){ setNameSize(state.size); return; }
  var size=state.size, guard=0;
  setNameSize(size);
  while(guard<90 && size>14){
    var need=elName.scrollWidth;
    if(emLeft.style.display!=="none") need+=emLeft.offsetWidth+16;
    if(emRight.style.display!=="none") need+=emRight.offsetWidth+16;
    if(need<=avail) break;
    size-=1; setNameSize(size); guard++;
  }
}

function apply(){
  elName.style.fontFamily=FONTS[state.font];
  elName.style.fontWeight=state.bold?700:500;
  elName.style.fontStyle=state.italic?"italic":"normal";
  elName.style.textDecoration=state.underline?"underline":"none";
  elName.style.fontVariant=state.smallcaps?"small-caps":"normal";
  elName.style.textTransform=state.upper?"uppercase":"none";
  elName.style.letterSpacing=state.upper?"0.04em":"normal";
  elHeader.style.setProperty("--name-color", state.nameColor);
  elHeader.style.setProperty("--cap-color", state.capColor);
  elName.style.setProperty("--name-color", state.nameColor);
  elName.style.setProperty("--cap-color", state.capColor);
  elName.classList.toggle("neon", state.neon);
  elHeader.classList.toggle("neon", state.neon);
  elName.classList.toggle("dropcap", state.dropcap);
  elName.style.textAlign=state.align;
  elEyebrow.style.textAlign=state.align;
  elEyebrow.classList.toggle("hidden", !state.label);
  positionEmblems();
  fitName();

  var showCap=state.dropcap;
  elCapSection.style.display=showCap?"block":"none";
  if(showCap && capPicker) capPicker.refresh();

  setActive("data-align", state.align);
  setActive("data-upper", state.upper?"on":"off");
  setActive("data-label", state.label?"on":"off");
  ["bold","italic","underline","smallcaps","neon","dropcap"].forEach(function(k){
    var b=document.querySelector('[data-fmt="'+k+'"]'); if(b) b.classList.toggle("on", state[k]);
  });
  document.getElementById("sizeval").textContent=state.size+"px";
  if(elEmblem.value!==state.emblemMode) elEmblem.value=state.emblemMode;
  document.getElementById("emblemNote").textContent =
    state.emblemMode==="auto"
      ? (state.classes.length ? "Segue la classe: cambia con la ruota." : "Segue la classe: scegline una per farlo comparire.")
      : "Scelta manuale: non cambier\u00E0 pi\u00F9 con la classe. Rimetti \u201CAutomatico\u201D per ricollegarlo.";

  var fmt=[]; if(state.bold)fmt.push("grassetto"); if(state.italic)fmt.push("corsivo"); if(state.underline)fmt.push("sottolineato");
  if(state.smallcaps)fmt.push("maiuscoletto"); if(state.neon)fmt.push("neon"); if(state.dropcap)fmt.push("capolettera");
  var alignIt=state.align==="center"?"al centro":(state.align==="right"?"a destra":"a sinistra");
  var embIt = state.emblemMode==="auto" ? "automatico" : (state.emblemMode==="none" ? "nessuno" : BY_KEY[state.emblemMode].name+" (manuale)");
  applicaTesti();
  applicaClassi();   // i nomi/simboli agganciati al nome vanno ridipinti
  var _da=apertaAspetto(); if(_da) disegnaAntepSel(_da);
  aggiornaSalva();
  elReadout.innerHTML="Scelta attuale: <b>"+FONT_NAME[state.font]+"</b>, <b>"+state.size+"px</b>, "+alignIt
    +", formato: <b>"+(fmt.length?fmt.join(", "):"nessuno")+"</b>, colore nome <b>"+state.nameColor.toUpperCase()+"</b>"
    +(state.dropcap?", capolettera <b>"+state.capColor.toUpperCase()+"</b>":"")
    +", simbolo <b>"+embIt+"</b>, "+(state.upper?"tutto maiuscolo":"maiuscole normali")
    +", etichetta "+(state.label?"visibile":"nascosta")+".";
}
function setActive(attr,val){ var n=document.querySelectorAll("["+attr+"]"); for(var i=0;i<n.length;i++) n[i].classList.toggle("on", n[i].getAttribute(attr)===val); }

function renderCapSuggestions(){
  var host=document.getElementById("capSuggest"); if(!host) return;
  var r=hexToRgb(state.nameColor), q=rgbToHsv(r.r,r.g,r.b);
  var s=Math.max(q.s,0.55), v=Math.max(q.v,0.8);
  var list=[["Complementare",hsvHex((q.h+180)%360,s,v)],["Analogo",hsvHex((q.h+30)%360,s,v)],
    ["Triade",hsvHex((q.h+120)%360,s,v)],["Oro","#E0B15E"],
    ["Chiaro",hsvHex(q.h,Math.min(q.s,0.35),0.98)],["Bianco","#F6F1E6"]];
  host.innerHTML=list.map(function(it){
    return '<div class="sugsw" data-hex="'+it[1]+'" title="'+it[1]+'"><div class="chip" style="background:'+it[1]+'"></div><div class="lab">'+it[0]+'</div></div>';
  }).join("");
}

var CX=250, CY=250, RO=236, RI=96, REM=148, RTX=198;
function polar(r,deg){ var a=deg*Math.PI/180; return [CX+r*Math.cos(a), CY+r*Math.sin(a)]; }
function sectorPath(R,r,a0,a1){
  var p0=polar(R,a0), p1=polar(R,a1), p2=polar(r,a1), p3=polar(r,a0);
  var big=(a1-a0)>180?1:0;
  return "M"+p0[0].toFixed(1)+","+p0[1].toFixed(1)
       +" A"+R+","+R+" 0 "+big+" 1 "+p1[0].toFixed(1)+","+p1[1].toFixed(1)
       +" L"+p2[0].toFixed(1)+","+p2[1].toFixed(1)
       +" A"+r+","+r+" 0 "+big+" 0 "+p3[0].toFixed(1)+","+p3[1].toFixed(1)+" Z";
}
function buildWheel(){
  var n=CLASSES.length, step=360/n, gap=0.9, out="";
  CLASSES.forEach(function(c,i){
    var mid=-90+i*step, a0=mid-step/2+gap, a1=mid+step/2-gap;
    var pe=polar(REM,mid), pt=polar(RTX,mid);
    out+='<g class="slice" data-key="'+c.key+'">'
      +'<path class="sl" d="'+sectorPath(RO,RI,a0,a1)+'"/>'
      +'<g class="em" transform="translate('+pe[0].toFixed(1)+','+pe[1].toFixed(1)+') scale(2) translate(-12,-12)">'+ICONS[c.key]+'</g>'
      +'<text class="cn2" x="'+pt[0].toFixed(1)+'" y="'+(pt[1]+4).toFixed(1)+'">'+c.name+'</text>'
      +'</g>';
  });
  out+='<circle class="hubring" cx="'+CX+'" cy="'+CY+'" r="'+(RI-8)+'"/>';
  document.getElementById("wheel").innerHTML=out;
}
function markWheel(){
  var sl=document.querySelectorAll("#wheel .slice");
  for(var i=0;i<sl.length;i++){
    var k=sl[i].getAttribute("data-key");
    sl[i].classList.toggle("sel", has(k));
    // "canpick": classe scelta che ha raggiunto il livello per la sottoclasse → pulsa
    sl[i].classList.toggle("canpick", !soloLettura && classeEleggibileSott(k));
    // già scelta una sottoclasse per questa classe → segno discreto
    sl[i].classList.toggle("hassub", !!(state.sottoclassi && state.sottoclassi[k]));
  }
}
function setHub(key){
  var hub=document.getElementById("hub");
  if(!key){
    var t=totalLevel();
    hub.innerHTML = state.classes.length
      ? '<div class="hubname">Livello '+t+'</div><div class="hubinfo">'+state.classes.length+(state.classes.length===1?' classe':' classi')+'</div><div class="hubhint">tocca uno spicchio per aggiungerne un\'altra</div>'
      : '<div class="hubname">Scegli</div><div class="hubsug">Tocca uno spicchio per aggiungere la classe</div>';
    return;
  }
  var c=BY_KEY[key];
  hub.innerHTML='<div class="hubname">'+c.name+'</div><div class="hubinfo">dado vita d'+c.die+'</div>'
    +'<div class="hubsug">'+c.sug+'</div>'
    +'<div class="hubhint">'+(has(key)?'gi\u00E0 nella scheda':'tocca per aggiungere')+'</div>';
}
function warn(msg){
  var el=document.getElementById("cwarn"); el.textContent=msg||"";
  if(msg){ clearTimeout(warn._t); warn._t=setTimeout(function(){ el.textContent=""; },3000); }
}

function addClass(key){
  if(has(key)){ warn(BY_KEY[key].name+" \u00E8 gi\u00E0 nella scheda: cambia il suo livello nell'elenco qui sotto."); return; }
  if(state.classes.length>=MAX_CLASSI){ warn("Un personaggio arriva al massimo a "+MAX_CLASSI+" classi: togline una dall'elenco qui sotto per cambiarla."); return; }
  if(freeLevels()<=0){ warn("Non hai livelli da assegnare: servono altri punti esperienza, oppure togli un livello a un'altra classe."); return; }
  state.classes.push({key:key, level:1});
  renderAll();
}
function removeClass(key){ state.classes=state.classes.filter(function(c){ return c.key!==key; }); renderAll(); }
function changeLevel(key,delta){
  var c=state.classes.filter(function(x){ return x.key===key; })[0]; if(!c) return;
  if(c.level+delta<1) return;
  if(delta>0 && freeLevels()<=0){ warn("Non hai livelli da assegnare: servono altri punti esperienza."); return; }
  c.level+=delta; renderAll();
}
function setXP(v){
  v=Math.max(0, Math.floor(Number(v)||0));
  state.xp=v; renderAll();
}

/* ---- Azzeramenti, ognuno con la sua conferma ---- */
function askReset(which){
  document.getElementById("bar"+which).hidden=true;
  document.getElementById("cfm"+which).hidden=false;
}
function cancelReset(which){
  document.getElementById("cfm"+which).hidden=true;
  document.getElementById("bar"+which).hidden=false;
}
function azzeraTesti(dove){
  var d=testiDiPartenza();
  TESTI.forEach(function(t){ if(t.dove===dove) state.testi[t.id]=d[t.id]; });
}
function doReset(which){
  if(which==="Name"){
    for(var k in DEF_NAME){ state[k]=DEF_NAME[k]; }
    azzeraTesti("name");
    elName.textContent="";
    elFont.value=state.font;
    elEmblem.value=state.emblemMode;
    document.getElementById("size").value=state.size;
    namePicker.setHex(state.nameColor);
    capPicker.setHex(state.capColor);
    renderCapSuggestions();
  } else if(which==="Stats"){
    state.stats=statsDiPartenza();
    azzeraTesti("stats");
    statsWarn("");
  } else if(which==="Class"){
    state.classes=[];
    state.classeIniziale="";
    state.classSymColor="#a78bfa";
    state.nomiClasse={};
    state.simboli={};
    sel.class=null;
    azzeraTesti("class");
    if(typeof modalClass!=="undefined" && modalClass && !modalClass.hidden && personalizza) sincronizzaClasse();
  } else if(which==="Xp"){
    state.xp=0;
    azzeraTesti("xp");
    for(var j in DEF_XP){ state[j]=DEF_XP[j]; }
    document.getElementById("xpInput").value=0;
    xpPicker1.setHex(state.xpColor1);
    xpPicker2.setHex(state.xpColor2);
  } else if(which==="Prof"){
    azzeraTesti("prof");
  } else if(which==="Align"){
    azzeraTesti("align");   // solo l'aspetto: la scelta dell'allineamento resta
  } else if(which==="RazzaAsp"){
    azzeraTesti("razza");
    if(personalizza){ var mrza=document.getElementById("modalRazzaAsp"); if(mrza && !mrza.hidden) sincronizzaSel("razza"); }
  } else if(which==="Ts"){
    azzeraTesti("ts");
    state.tsCompColor="#E0B15E";
    state.tsDadoColor="#A78BFA";
    tsFermo=true;
    try{ tsCompPicker.setHex(state.tsCompColor); tsDadoPicker.setHex(state.tsDadoColor); }
    finally{ tsFermo=false; }
  } else if(which==="Abil"){
    state.abilita={};      // via tutte le competenze scelte
    state.abilCarColore={}; // colori delle caratteristiche di nuovo alla base
    azzeraTesti("abil");
    if(typeof abilCarPicker!=="undefined" && abilCarPicker){
      abilFermo=true;
      try{ abilCarPicker.setHex(colCar(document.getElementById("abilCarSel").value||"for")); }
      finally{ abilFermo=false; }
    }
  } else if(which==="Hp"){
    azzeraTesti("hp");     // solo l'aspetto: numeri, temporanei e dadi vita restano
    for(var h in DEF_HP){ state[h]=DEF_HP[h]; }
    if(typeof hpPienoPicker!=="undefined" && hpPienoPicker){
      hpFermo=true;
      try{ hpPienoPicker.setHex(state.hpColorPieno); hpFeritoPicker.setHex(state.hpColorFerito); hpCriticoPicker.setHex(state.hpColorCritico); }
      finally{ hpFermo=false; }
    }
  } else if(which==="Dif"){
    azzeraTesti("dif");   // solo l'aspetto: i valori e i ritocchi restano
    state.difIcoColor="#E0B15E";
    if(typeof difIcoPicker!=="undefined" && difIcoPicker){
      difFermo=true;
      try{ difIcoPicker.setHex(state.difIcoColor); } finally{ difFermo=false; }
    }
  }
  cancelReset(which);
  renderAll();
}

function renderChosen(){
  var host=document.getElementById("chosen");
  var free=freeLevels(), tot=totalLevel();
  var head='<h3>Classi del personaggio</h3>';
  if(!state.classes.length){
    host.innerHTML=head+'<div class="cnone">Nessuna classe scelta: hai '+free+(free===1?' livello':' livelli')+' da assegnare.</div>';
    return;
  }
  var rows=state.classes.map(function(c){
    var cl=BY_KEY[c.key];
    return '<div class="crow"><span class="cre">'+emblemSVG(c.key)+'</span>'
      +'<span class="crn">'+cl.name+' <span class="crd">d'+cl.die+'</span></span>'
      +'<div class="lvlbox"><button data-act="lvldec" data-key="'+c.key+'"'+(c.level<=1?' disabled':'')+'>\u2212</button>'
      +'<span class="lvlv">'+c.level+'</span>'
      +'<button data-act="lvlinc" data-key="'+c.key+'"'+(free<=0?' disabled':'')+'>+</button></div>'
      +'<button class="del" data-act="del" data-key="'+c.key+'" title="Togli"><svg viewBox="0 0 24 24"><path d="M4 7 h16 M9 7 V5 h6 v2 M6 7 l1 13 h10 l1 -13"/></svg></button></div>';
  }).join("");
  var msg = free>0 ? '<b>'+free+'</b> da assegnare' : (free<0 ? '<b>'+(-free)+'</b> in eccesso: togline' : 'tutti assegnati');
  host.innerHTML=head+rows
    +'<div class="cfoot"><span>Livello '+tot+' \u2014 livelli: '+msg+'</span>'
    +'<span>L\'ordine \u00E8 quello di aggiunta</span></div>';
}

function xpFillStyle(){
  if(state.xpStyle==="name") return state.nameColor;
  if(state.xpStyle==="solid") return state.xpColor1;
  return "linear-gradient(90deg,"+state.xpColor1+","+state.xpColor2+")";
}
function renderLevel(){
  var lv=totalLevel(), xp=state.xp, free=freeLevels();
  document.getElementById("lvNum").textContent=lv;
  renderProf();
  var isMax = lv>=20;
  document.getElementById("lvMax").textContent = isMax ? "livello massimo" : "";
  var cur=xpForLevel(lv), next=isMax?null:xpForLevel(lv+1);
  var pct = isMax ? 100 : Math.max(0, Math.min(100, ((xp-cur)/(next-cur))*100));
  var fill=document.getElementById("xpFill");
  fill.style.width=pct.toFixed(1)+"%";
  fill.style.background=xpFillStyle();
  document.getElementById("xpTxt").innerHTML = isMax
    ? '<b>'+numIt(xp)+'</b> XP'
    : '<b>'+numIt(xp)+'</b> / <b>'+numIt(next)+'</b> XP <span class="miss">\u00B7 mancano '+numIt(next-xp)+'</span>';
  var fl=document.getElementById("freeLv");
  if(free>0){ fl.className="freelv"; fl.textContent=free+(free===1?" livello da assegnare":" livelli da assegnare"); }
  else if(free<0){ fl.className="freelv over"; fl.textContent=(-free)+(free===-1?" livello in eccesso":" livelli in eccesso"); }
  else fl.className="freelv hidden";

  applicaTesti();   // la riga dei PE si riscrive ogni volta: idem
  setActive("data-xpstyle", state.xpStyle);
  document.getElementById("xpc1row").style.display = state.xpStyle==="name" ? "none" : "flex";
  document.getElementById("xpc2row").style.display = state.xpStyle==="grad" ? "flex" : "none";
  document.getElementById("xpc1lab").textContent = state.xpStyle==="grad" ? "Colore iniziale" : "Colore";
  aggiornaSalva();
}

function renderXpDialog(){
  var lv=totalLevel(), xp=state.xp, isMax=lv>=20;
  var next=isMax?null:xpForLevel(lv+1);
  var res=document.getElementById("xpRes");
  res.innerHTML='<div class="big">Livello '+lv+'</div><div class="sub">'
    + (isMax ? 'Livello massimo raggiunto.' : 'Al livello '+(lv+1)+' mancano '+numIt(next-xp)+' XP.')
    + ' Bonus di competenza +'+profForLevel(lv)+'.</div>';
  var tb=document.querySelector("#xpTable tbody");
  tb.innerHTML=XP_TABLE.map(function(soglia,i){
    var l=i+1;
    return '<tr'+(l===lv?' class="cur"':'')+'><td>'+numIt(soglia)+'</td><td>'+l+'</td><td>+'+profForLevel(l)+'</td></tr>';
  }).join("");
  var inp=document.getElementById("xpInput");
  if(document.activeElement!==inp) inp.value=state.xp;
  disegnaAntepBar();
}

/* Il bonus di competenza: un numero solo, ricavato dal livello, mai salvato.
   Il pannello mostra il valore; la finestra spiega da dove viene e la tabella
   dei cinque scaglioni. */
function renderProf(){
  var el=document.getElementById("profVal"); if(!el) return;
  el.textContent="+"+profForLevel(totalLevel());
}
function renderProfDialog(){
  var lv=totalLevel(), pb=profForLevel(lv);
  var res=document.getElementById("profRes");
  if(res) res.innerHTML='<div class="big">+'+pb+'</div><div class="sub">Livello '+lv
    +'. Si somma a tiri salvezza, prove di abilit\u00E0 e tiri per colpire in cui sei competente.</div>';
  var tb=document.querySelector("#profTable tbody"); if(!tb) return;
  var scaglioni=[[1,4],[5,8],[9,12],[13,16],[17,20]];
  tb.innerHTML=scaglioni.map(function(r){
    var cur = lv>=r[0] && lv<=r[1];
    return '<tr'+(cur?' class="cur"':'')+'><td>'+r[0]+'\u2013'+r[1]+'</td><td>+'+profForLevel(r[0])+'</td></tr>';
  }).join("");
}
/* ===== Riquadro dei tiri salvezza =====
   Un favo: sei esagoni attorno a un settimo. I sei stanno nelle STESSE
   posizioni che le caratteristiche hanno nel grafico qui sopra (Forza in
   cima, poi in senso orario), cosi' la mappa mentale e' una sola.
   Al centro un d20, che e' il dado che si tira davvero per un tiro salvezza:
   niente cuore e niente scudo, perche' quelli serviranno ai punti ferita e
   alla classe armatura, che arriveranno piu' avanti.
   Il colore del numero resta in mano alla personalizzazione: a dire dove sei
   competente ci pensa l'esagono, che si accende. */
/* Colori scelti dall'utente, con la rete di sicurezza se il valore manca o
   e' scritto male: meglio il colore di partenza che un disegno rotto. */
function coloreTsComp(){ return /^#[0-9a-fA-F]{6}$/.test(state.tsCompColor||"") ? state.tsCompColor : "#E0B15E"; }
function coloreTsDado(){ return /^#[0-9a-fA-F]{6}$/.test(state.tsDadoColor||"") ? state.tsDadoColor : "#A78BFA"; }
/* Lo stesso colore, ma trasparente: serve per i riempimenti e per l'alone. */
function velo(hex,a){ var c=hexToRgb(hex); return "rgba("+c.r+","+c.g+","+c.b+","+a+")"; }

var TS_R=35;                                   // raggio di ogni esagono
function tsPoli(x,y,r){
  var p=[];
  for(var i=0;i<6;i++){ var a=i*Math.PI/3; p.push((x+r*Math.cos(a)).toFixed(1)+","+(y+r*Math.sin(a)).toFixed(1)); }
  return p.join(" ");
}
function tsPunto(gradi,d,cx,cy){ var a=gradi*Math.PI/180; return [cx+d*Math.cos(a), cy+d*Math.sin(a)]; }

function renderTs(){
  var host=document.getElementById("tsGrid");
  if(host){
    var R=TS_R, D=Math.sqrt(3)*R, W=5*R, H=3*Math.sqrt(3)*R, CX=W/2, CY=H/2, out="";
    // i due colori scelti dall'utente: l'esagono acceso e il dado al centro
    var cComp=coloreTsComp(), cDado=coloreTsDado();
    var stileDado='stroke:'+cDado+';';
    var stileComp='fill:'+velo(cComp,.13)+';stroke:'+cComp
      +';filter:drop-shadow(0 0 5px '+velo(cComp,.45)+');';

    // il dado al centro: l'esagono stesso e' la sagoma vista di piatto di un d20
    out+='<g class="tsdado"><polygon class="tshex tsdadohex" points="'+tsPoli(CX,CY,R)
      +'" style="fill:'+velo(cDado,.07)+';stroke:'+velo(cDado,.35)+'"/>';
    var tri=[-90,30,150].map(function(g){ return tsPunto(g,R*0.46,CX,CY); });
    out+='<polygon class="tsemb" style="'+stileDado+'" points="'+tri.map(function(p){ return p[0].toFixed(1)+","+p[1].toFixed(1); }).join(" ")+'"/>';
    [[-90,[240,300]],[30,[0,60]],[150,[120,180]]].forEach(function(par){
      var da=tsPunto(par[0],R*0.46,CX,CY);
      par[1].forEach(function(gv){
        var a=tsPunto(gv,R,CX,CY);
        out+='<line class="tsemb" style="'+stileDado+'" x1="'+da[0].toFixed(1)+'" y1="'+da[1].toFixed(1)
          +'" x2="'+a[0].toFixed(1)+'" y2="'+a[1].toFixed(1)+'"/>';
      });
    });
    out+='</g>';

    // i sei attorno, nell'ordine del grafico delle caratteristiche
    CARATT.forEach(function(c,idx){
      var p=tsPunto(-90+idx*60, D, CX, CY), comp=competenteTs(c.k);
      out+='<g class="tscell'+(comp?' comp':'')+'" data-tsk="'+c.k+'">'
        +'<polygon class="tshex" points="'+tsPoli(p[0],p[1],R)+'"'+(comp?' style="'+stileComp+'"':'')+'/>'
        +'<text class="tssig" x="'+p[0].toFixed(1)+'" y="'+(p[1]-10).toFixed(1)+'" text-anchor="middle">'+c.sigla+'</text>'
        +'<text class="tsval" x="'+p[0].toFixed(1)+'" y="'+(p[1]+14).toFixed(1)+'" text-anchor="middle">'+segno(valoreTs(c.k))+'</text>'
        +'</g>';
    });
    host.innerHTML='<svg viewBox="0 0 '+W.toFixed(0)+' '+H.toFixed(0)+'" role="img" aria-label="Tiri salvezza">'+out+'</svg>';
  }
  var hint=document.getElementById("tsHint");
  if(hint){
    var k=classeTs();
    hint.innerHTML = k
      ? '<b>Esagono acceso</b> = sei competente, bonus gi\u00E0 compreso.<br>Competenze da <b>'+esc(BY_KEY[k].name)+'</b>, la classe iniziale.'
      : 'Scegli una classe per le competenze: per ora c\u2019\u00E8 solo il modificatore.';
  }
  applicaTesti();
}

/* La finestra spiega da dove nasce ogni numero e, se le classi sono piu' di
   una, lascia dire qual e' quella iniziale: e' l'unica che da' competenze. */
function renderTsDialog(){
  var pb=profForLevel(totalLevel()), kIni=classeTs(), molte=state.classes.length>1;

  var row=document.getElementById("tsIniRow"), pick=document.getElementById("tsIni"),
      nota=document.getElementById("tsIniNota");
  if(row) row.hidden=!molte;
  if(nota){
    nota.hidden=!molte;
    nota.textContent="Le competenze arrivano solo dalla classe con cui hai cominciato: multiclassando non se ne guadagnano altre.";
  }
  if(pick && molte){
    pick.innerHTML=state.classes.map(function(c){
      return '<option value="'+c.key+'"'+(c.key===kIni?' selected':'')+'>'+esc(BY_KEY[c.key].name)+'</option>';
    }).join("");
  }

  var tb=document.querySelector("#tsTable tbody");
  if(tb) tb.innerHTML=CARATT.map(function(c){
    var comp=competenteTs(c.k);
    return '<tr'+(comp?' class="cur"':'')+'><td>'+c.nome+'</td><td>'+segno(modCar(c.k))
      +'</td><td>'+(comp?"+"+pb:"\u2014")+'</td><td>'+segno(valoreTs(c.k))+'</td></tr>';
  }).join("");

  var cosa=document.getElementById("tsCosa");
  if(cosa) cosa.innerHTML=CARATT.map(function(c){
    return '<div class="tscr"><b>'+c.nome+'</b> '+TS_A_COSA[c.k]+'</div>';
  }).join("");
}

/* ===== Riquadro delle abilita' =====
   Raggruppate per caratteristica, col segno di competenza (un punto) e di
   maestria (due). La Percezione passiva sta in fondo, staccata da una riga:
   non e' un'abilita' da tirare, e' il numero che il master guarda quando tu
   non tiri affatto, e mescolarla alle altre confonderebbe. */
/* Un esagono-ancora con la sigla di ogni caratteristica al suo vertice, del
   colore della caratteristica, e la percezione passiva al centro. Accanto, la
   griglia dei gruppi, ognuno con l'intestazione dello stesso colore: il colore
   e' il filo che lega l'esagono alle abilita', senza una riga disegnata. */
function abilVtx(i, f, CX, CY, R){ var a=(-90+i*60)*Math.PI/180, r=R*(f==null?1:f); return [CX+r*Math.cos(a), CY+r*Math.sin(a)]; }
function renderAbil(){
  var R=72, W=2*R+64, H=2*R+64, CX=W/2, CY=H/2;
  var map=document.getElementById("abilMap");
  if(map){
    var hp=CARATT.map(function(c,i){ return abilVtx(i,1,CX,CY,R).map(function(n){return n.toFixed(1);}).join(","); }).join(" ");
    var s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Abilit\u00E0 per caratteristica">';
    s+='<polygon class="abhex" points="'+hp+'"/>';
    CARATT.forEach(function(c,i){
      var v=abilVtx(i,1,CX,CY,R), d=abilVtx(i,1,CX,CY,1), dir=[d[0]-CX,d[1]-CY];
      var lx=v[0]+dir[0]*15, ly=v[1]+dir[1]*13;
      var anc = Math.abs(dir[0])<0.2 ? "middle" : (dir[0]<0?"end":"start");
      var col=colCar(c.k);
      s+='<g class="abvtx" data-car="'+c.k+'" style="--c:'+col+'">'
        +'<circle class="abdot" cx="'+v[0].toFixed(1)+'" cy="'+v[1].toFixed(1)+'" r="3.4" style="fill:'+col+'"/>'
        +'<text class="absg" x="'+lx.toFixed(1)+'" y="'+(ly+4).toFixed(1)+'" text-anchor="'+anc+'" style="fill:'+col+'">'+c.sigla+'</text>'
        +'</g>';
    });
    s+='<text class="ppet" x="'+CX+'" y="'+(CY-9)+'" text-anchor="middle">Perc. passiva</text>';
    s+='<text class="ppval" x="'+CX+'" y="'+(CY+20)+'" text-anchor="middle">'+percezionePassiva()+'</text>';
    s+='</svg>';
    map.innerHTML=s;
  }
  var host=document.getElementById("abilGrid");
  if(host){
    host.innerHTML=CARATT.map(function(c){
      var col=colCar(c.k), lista=abilitaDi(c.k);
      var righe = lista.length ? lista.map(function(a){
        var liv=livelloAbil(a.k);
        var seg = liv===0 ? '<i class="vuoto"></i>' : (liv===1 ? '<i></i>' : '<i></i><i></i>');
        return '<div class="abrow'+(liv?" lv"+liv:"")+'" data-abil="'+a.k+'">'
          +'<span class="abseg" aria-hidden="true">'+seg+'</span>'
          +'<span class="abnome">'+a.nome+'</span>'
          +'<span class="abval">'+segno(valoreAbil(a.k))+'</span>'
          +'</div>';
      }).join("") : '<div class="abnes">nessuna</div>';
      return '<div class="abgrp" data-car="'+c.k+'" style="--c:'+col+'">'
        +'<div class="abcar" style="color:'+col+'">'+c.nome+'</div>'+righe+'</div>';
    }).join("");
  }
  var hint=document.getElementById("abilHint");
  if(hint) hint.innerHTML='Una prova di abilit\u00E0 \u00E8 1d20 pi\u00F9 questo numero.'
    +'<br><b>Un punto</b> = Competenza, <b>due punti</b> = Maestria, che raddoppia il bonus.'
    +'<br>Ogni caratteristica ha il suo colore, uguale nell\u2019esagono e nelle sue abilit\u00E0.'
    +'<br>La <b>Costituzione</b> non ha abilit\u00E0: \u00E8 cos\u00EC nel manuale, non manca niente.'
    +'<br>Al centro, la <b>percezione passiva</b>: quanto noti senza bisogno di tirare.';
  applicaTesti();
}

/* La finestra: qui si scelgono le competenze, e si vede da dove nasce ogni
   numero. Un solo pulsante per abilita' che gira fra i tre stati: con
   diciotto righe, due caselle per riga sarebbero state un muro. */
function renderAbilDialog(){
  var pb=profForLevel(totalLevel());
  var conta=document.getElementById("abilConta");
  if(conta) conta.innerHTML='Competenza: <b>'+quanteAbil(1)+'</b> \u00B7 Maestria: <b>'+quanteAbil(2)+'</b>'
    +' \u00B7 bonus attuale <b>+'+pb+'</b>';
  var host=document.getElementById("abilSel");
  if(host) host.innerHTML=carConAbilita().map(function(c){
    var righe=abilitaDi(c.k).map(function(a){
      var liv=livelloAbil(a.k), agg = liv ? "+"+(pb*liv) : "\u2014";
      return '<button type="button" class="absel'+(liv?" lv"+liv:"")+'" data-abilsel="'+a.k+'">'
        +'<span class="asnome">'+a.nome+'</span>'
        +'<span class="asliv">'+ABIL_NOME_LIV[liv]+'</span>'
        +'<span class="ascalc">'+segno(modCar(a.car))+' <b>'+agg+'</b></span>'
        +'<span class="asval">'+segno(valoreAbil(a.k))+'</span>'
        +'</button>';
    }).join("");
    return '<div class="asgrp"><div class="ascar" style="color:'+colCar(c.k)+'">'+c.nome+'</div>'+righe+'</div>';
  }).join("");
}

/* Il nome della sottoclasse scelta per una classe (stringa vuota se non \u00e8 stata
   scelta, o se l'elenco delle sottoclassi non \u00e8 ancora arrivato dal database:
   in quel caso ricompare da solo appena i dati si caricano). */
function nomeSottoclasse(key){
  var id = state.sottoclassi && state.sottoclassi[key];
  if(!id) return "";
  var s = sottoclasseById(id);
  return s ? (s.nome||"") : "";
}
function renderPanel(){
  var line=document.getElementById("classLine");
  if(!state.classes.length){
    line.innerHTML='<span class="cempty">Nessuna classe scelta \u2014 apri la rotellina</span>';
    return;
  }
  // il livello totale non si ripete qui: lo mostra gia' il riquadro Livello.
  // Nome della classe e, sotto, la sottoclasse scelta (se c'\u00e8); il livello
  // resta in alto, allineato al nome. Vale per mono/bi/tri-classe.
  line.innerHTML=state.classes.map(function(c){
    var sub=nomeSottoclasse(c.key);
    var blocco='<span class="cnwrap"><span class="cn" data-clskey="'+c.key+'">'+BY_KEY[c.key].name+'</span>'
      + (sub ? '<span class="csub" data-clskey="'+c.key+'">'+esc(sub)+'</span>' : '')
      + '</span>';
    return '<span class="cls"><span class="ce" data-clskey="'+c.key+'">'+emblemSVG(c.key)+'</span>'
      + blocco + '<span class="cl">'+c.level+'</span></span>';
  }).join('<span class="cdiv"></span>');
  applicaTesti();     // etichetta e livello (condivisi)
  applicaClassi();    // nomi, sottoclassi e simboli, uno per classe
}

/* ================= ALLINEAMENTO =================
   Le nove caselle classiche (legge/caos x bene/male) piu' "Senza allineamento"
   per creature e costrutti. Il codice si salva, il nome mostrato no: cosi' un
   domani si puo' cambiare la scritta senza toccare le schede gia' salvate. */
var ALLINEAMENTI=[
  {k:"LB",nome:"Legale Buono",     d:"Fa la cosa giusta seguendo regole e tradizioni: onore, lealtà, dovere."},
  {k:"NB",nome:"Neutrale Buono",   d:"Fa del bene come può, senza pregiudizi verso o contro l’ordine."},
  {k:"CB",nome:"Caotico Buono",    d:"Segue la propria coscienza, ribelle alle regole ma dalla parte del bene."},
  {k:"LN",nome:"Legale Neutrale",  d:"Agisce secondo legge, codice o tradizione, al di là di bene e male."},
  {k:"N", nome:"Neutrale",         d:"Evita gli estremi: lascia che le cose seguano il loro corso naturale."},
  {k:"CN",nome:"Caotico Neutrale", d:"Segue i propri capricci e la propria libertà sopra ogni altra cosa."},
  {k:"LM",nome:"Legale Malvagio",  d:"Prende ciò che vuole nei limiti di un codice, con metodo e disciplina."},
  {k:"NM",nome:"Neutrale Malvagio",d:"Fa il male quando conviene, senza scrupoli né rispetto per le regole."},
  {k:"CM",nome:"Caotico Malvagio", d:"Agisce con crudeltà e violenza, spinto da avidità, odio o sete di sangue."},
  {k:"SA",nome:"Senza allineamento",d:"Creature prive di coscienza morale (bestie, molti costrutti): non hanno un allineamento."}
];
var ALLIN_BY={}; ALLINEAMENTI.forEach(function(a){ ALLIN_BY[a.k]=a; });
function nomeAllin(k){ return ALLIN_BY[k] ? ALLIN_BY[k].nome : ""; }

function renderAlign(){
  var line=document.getElementById("alignLine"); if(!line) return;
  var k=state.allineamento;
  line.innerHTML = k
    ? '<span class="alname">'+esc(nomeAllin(k))+'</span>'
    : '<span class="alempty">Nessuno — apri la rotellina</span>';
  applicaTesti();
}
function renderAlignDialog(){
  var g=document.getElementById("alignGrid"); if(!g) return;
  g.innerHTML=ALLINEAMENTI.filter(function(a){ return a.k!=="SA"; }).map(function(a){
    return '<button type="button" class="alcell'+(state.allineamento===a.k?" sel":"")+'" data-allin="'+a.k+'">'+esc(a.nome)+'</button>';
  }).join("");
  var sa=document.querySelector('#modalAlign [data-allin="SA"]');
  if(sa) sa.classList.toggle("sel", state.allineamento==="SA");
  var d=document.getElementById("alignDesc");
  if(d){ var cur=ALLIN_BY[state.allineamento]; d.textContent = cur ? cur.d : ""; }
}
function openAlign(){ document.getElementById("modalAlign").hidden=false; renderAlignDialog(); if(personalizza) sincronizzaSel("align"); }
/* Scelta dell'allineamento: toccare la casella scelta la toglie (ritocco). */
(function(){
  var ma=document.getElementById("modalAlign"); if(!ma) return;
  ma.addEventListener("click", function(e){
    var b=e.target.closest("[data-allin]"); if(!b) return;
    var k=b.getAttribute("data-allin");
    state.allineamento = (state.allineamento===k) ? "" : k;
    renderAlign(); renderAlignDialog(); aggiornaSalva();
  });
})();

/* ===== Classe: nomi e simboli, uno per classe =====
   Ogni nome di classe ha uno stile suo (nomiClasse), e ogni simbolo pure
   (simboli): colore e neon. I nuovi nascono da un modello, cosi' una scheda
   che non ha questi dati non cambia aspetto. */
var DEF_NOMECL={ font:"cinzel", colore:"#E8E6F0", bold:false, italic:false, underline:false, smallcaps:false, neon:false, legaFont:false, legaColore:false, legaFmt:false };
function stileNome(key){
  if(!state.nomiClasse[key]){ var d={}; for(var k in DEF_NOMECL) d[k]=DEF_NOMECL[k]; state.nomiClasse[key]=d; }
  return state.nomiClasse[key];
}
function simboloDi(key){
  if(!state.simboli[key]) state.simboli[key]={ colore:(state.classSymColor||"#a78bfa"), neon:false };
  return state.simboli[key];
}
/* stile della sottoclasse: ha il suo font/colore/formato, indipendente dal nome
   della classe (nasce dal modello, così una scheda senza questi dati non cambia). */
function stileSotto(key){
  if(!state.sottoStili[key]){ var d={}; for(var k in DEF_NOMECL) d[k]=DEF_NOMECL[k]; state.sottoStili[key]=d; }
  return state.sottoStili[key];
}
/* Risolve gli agganci al nome e restituisce i valori veri di una scritta */
function risolviTesto(s){
  return {
    font:   s.legaFont  ? state.font      : s.font,
    colore: s.legaColore? state.nameColor : s.colore,
    bold:      s.legaFmt ? state.bold      : s.bold,      italic:    s.legaFmt ? state.italic    : s.italic,
    underline: s.legaFmt ? state.underline : s.underline, smallcaps: s.legaFmt ? state.smallcaps : s.smallcaps,
    neon:      s.legaFmt ? state.neon      : s.neon
  };
}
function pitturaTesto(el, s){
  var r=risolviTesto(s), svg=(el.namespaceURI==="http://www.w3.org/2000/svg");
  el.style.fontFamily = r.font ? FONTS[r.font] : "";
  el.style.color=r.colore; el.style.fill=r.colore;
  el.style.fontWeight = r.bold ? "700" : "";
  el.style.fontStyle  = r.italic ? "italic" : "";
  el.style.fontVariant= r.smallcaps ? "small-caps" : "";
  el.style.textDecoration = r.underline ? "underline" : "";
  if(r.neon){
    if(svg) el.style.filter="drop-shadow(0 0 3px "+r.colore+") drop-shadow(0 0 7px "+r.colore+")";
    else el.style.textShadow="0 0 4px "+r.colore+",0 0 9px "+r.colore+",0 0 18px "+r.colore;
  } else { el.style.filter=""; el.style.textShadow=""; }
}
function pitturaSimbolo(el, s){
  el.style.color=s.colore;
  el.style.filter = s.neon ? ("drop-shadow(0 0 3px "+s.colore+") drop-shadow(0 0 7px "+s.colore+")") : "";
}
function applicaClassi(){
  var nomi=document.querySelectorAll("#classLine .cn");
  for(var i=0;i<nomi.length;i++){ var k=nomi[i].getAttribute("data-clskey"); if(k) pitturaTesto(nomi[i], stileNome(k)); }
  // la sottoclasse ha il SUO stile (font/colore/formato), personalizzabile a
  // parte dal nome della classe; è solo più piccola (misura dal CSS).
  var sub=document.querySelectorAll("#classLine .csub");
  for(var s=0;s<sub.length;s++){ var ks=sub[s].getAttribute("data-clskey"); if(ks) pitturaTesto(sub[s], stileSotto(ks)); }
  var simb=document.querySelectorAll("#classLine .ce");
  for(var j=0;j<simb.length;j++){ var q=simb[j].getAttribute("data-clskey"); if(q) pitturaSimbolo(simb[j], simboloDi(q)); }
}

/* ===== GRIMORIO DELLE RAZZE =====
   Le razze vivono nel database (tabella "razze"), non nel codice: il supporto
   tecnico le aggiunge e tutti le leggono in tempo reale. Qui le teniamo in una
   cache e disegniamo il grimorio: a sinistra l'indice, a destra la pagina del
   bestiario (in lettura) oppure il modulo d'inserimento (solo per chi può
   toccare le schede: supporto/sviluppatore). */
var RAZZE=[], razzeCaricate=false, razzaVista=null;   // razzaVista = quale razza si sta guardando ora
var grimMode="view";      // "view" = pagina bestiario | "form" = modulo aggiungi/modifica razza
var grimFile=null;        // il file immagine scelto nel modulo (non ancora caricato)
var grimSalvando=false;   // sto salvando: blocco i pulsanti per non salvare due volte
var grimEditId=null;      // null = sto aggiungendo; altrimenti l'id della razza che sto modificando
var grimImgRemoved=false; // in modifica: ho tolto l'immagine esistente (senza caricarne una nuova)
var grimDelId=null;       // id della razza in attesa di conferma d'eliminazione
var grimAnima=false;      // il prossimo disegno della pagina deve fare la rivelazione a inchiostro
var razzeSig="";          // "firma" dell'elenco: per non ridisegnare (e interrompere l'effetto) se nulla è cambiato
var grimStage="cover";    // "cover" = copertina del tomo | "aperto" = libro aperto (indice + pagina)
var grimGirando=false;    // sto voltando pagina: non ripeto l'animazione

/* Piccolo scudo: qualsiasi testo libero (i nomi dei personaggi scritti dai
   giocatori, i testi di razze e talenti inseriti dallo staff) va disinnescato
   prima di finire nella pagina, così eventuali < > & " ' non rompono il layout
   né iniettano HTML. È il disinnescatore UNICO di tutta la scheda. */
function esc(s){
  return String(s==null?"":s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

function caricaRazze(poi){
  sb.from("razze").select("*").order("ordine",{ascending:true}).order("nome",{ascending:true}).then(function(res){
    if(!res.error && Array.isArray(res.data)) RAZZE=res.data;
    else if(res.error) console.warn("Non riesco a leggere le razze:", res.error.message);
    razzeCaricate=true;
    // "firma" dell'elenco: se il ricarico non cambia niente, NON ridisegno il
    // grimorio (così non interrompo la rivelazione a inchiostro appena partita)
    var nuova = RAZZE.map(function(r){ return r.id+":"+(r.modificato_il||r.nome||""); }).join("|");
    var cambiato = nuova!==razzeSig; razzeSig=nuova;
    renderRazzaPanel();
    if(typeof renderRetro==="function") renderRetro();   // le razze appena caricate decidono le caselle Origine (Umano = 2)
    var mr=document.getElementById("modalRazze");
    if(mr && !mr.hidden && cambiato) renderGrimorio();
    if(typeof poi==="function") poi();
  }, function(e){ razzeCaricate=true; console.warn("Razze:", e); if(typeof poi==="function") poi(); });
}
function razzaById(id){ for(var i=0;i<RAZZE.length;i++){ if(RAZZE[i].id===id) return RAZZE[i]; } return null; }

/* Il pannello in scheda: "Razza" in alto, e sotto la frase di sapore (o il nome
   della razza scelta). Al passaggio del mouse la piuma riscrive un invito. */
var RZ_FRASE = "A te la scelta del corpo, l’anima agli Dei.";
var RZ_INVITO = "Dai inizio alla Caccia";
var razzaRest = "";               // HTML "a riposo" del pannello (da ripristinare dopo l'hover)
var rzHovering = false, rzTypeTimer = null;

function renderRazzaPanel(){
  var line=document.getElementById("razzaLine"); if(!line) return;
  var r = state.razza ? razzaById(state.razza) : null;
  var html;
  if(state.razza && !r){
    // razza salvata ma non in cache: sto caricando, o è stata cancellata dal grimorio
    html = razzeCaricate ? '<span class="rzghost">Razza non più nel grimorio</span>' : '<span class="rzghost">…</span>';
  } else if(!r){
    html = '<span class="rztag">'+esc(RZ_FRASE)+'</span>';
  } else {
    html = '<span class="rzname">'+esc(r.nome||"Senza nome")+'</span>'
         + (r.tipologia ? '<span class="rztipo">'+esc(r.tipologia)+'</span>' : '');
  }
  razzaRest = html;
  // se il mouse sta scrivendo l'invito, non gli scippo la scritta: aggiorno solo il "riposo"
  if(!rzHovering){
    line.innerHTML = html;
    if(r) applicaTesti();   // nome/tipologia nascono ora: ridipinti col loro stile
  }
  renderDif();   // la Velocità dipende dalla razza scelta → si aggiorna qui
}

/* La piuma "scrive" un testo lettera per lettera */
function rzStopType(){ if(rzTypeTimer){ clearTimeout(rzTypeTimer); rzTypeTimer=null; } }
function rzWrite(testo){
  var line=document.getElementById("razzaLine"); if(!line) return;
  rzStopType();
  line.innerHTML='<span class="rztag rzwriting"></span>';
  var span=line.firstChild, i=0;
  (function step(){
    if(!rzHovering || !span) return;              // uscito col mouse: mi fermo
    span.textContent = testo.slice(0, i);
    if(i<testo.length){ i++; rzTypeTimer=setTimeout(step, 55); }
    else { span.classList.remove("rzwriting"); }  // finito: via il cursore
  })();
}
function rzEnter(){ if(personalizza) return; rzHovering=true; rzWrite(RZ_INVITO); }
function rzLeave(){
  rzHovering=false; rzStopType();
  var line=document.getElementById("razzaLine");
  if(line){ line.innerHTML=razzaRest; if(state.razza && razzaById(state.razza)) applicaTesti(); }
}

function openRazze(){
  var mr=document.getElementById("modalRazze"); if(!mr) return;
  mr.hidden=false;
  grimMode="view"; grimFile=null; grimEditId=null; grimImgRemoved=false; grimDelId=null;   // si riparte sempre dalla lettura
  grimStage="cover"; grimGirando=false;   // si apre sulla COPERTINA
  razzaVista=null;    // dentro non si parte da una razza: pagina vuota ("Richiama la tua razza")
  grimAnima=false;
  var cov=document.getElementById("grimCover"); if(cov) cov.classList.remove("gira");
  var bdy=document.getElementById("grimBody"); if(bdy) bdy.classList.remove("apre");
  mostraStadio();
  renderGrimorio();   // disegno l'indice e la pagina (restano dietro la copertina)
  caricaRazze();      // e intanto rinfresco dal database
}

/* Mostra lo stadio giusto: copertina, oppure libro aperto */
function mostraStadio(){
  var wrap=document.getElementById("grimWrap"); if(!wrap) return;
  wrap.classList.remove("turning");
  wrap.classList.toggle("in-cover", grimStage==="cover");
  wrap.classList.toggle("in-aperto", grimStage!=="cover");
}

/* Volta la copertina: gira via e sotto si apre il libro (indice a sinistra, pagina a destra) */
function voltaPagina(){
  if(grimGirando || grimStage!=="cover") return;
  var wrap=document.getElementById("grimWrap"), cover=document.getElementById("grimCover"), body=document.getElementById("grimBody");
  if(!wrap||!cover||!body){ grimStage="aperto"; mostraStadio(); return; }
  grimGirando=true;
  wrap.classList.add("turning");        // durante il giro il libro resta nascosto (dietro solo scuro)
  cover.classList.add("gira");          // la copertina si dissolve come sabbia
  setTimeout(function(){
    // dissolvenza FINITA: solo ora compaiono le pagine chiare
    grimStage="aperto"; mostraStadio();
    cover.classList.remove("gira");
    body.classList.add("apre");         // le pagine si rivelano
    grimGirando=false;
    setTimeout(function(){ body.classList.remove("apre"); }, 700);
  }, 950);
}

/* Mostra una razza con la transizione: prima la pagina attuale ("Richiama la tua
   razza", o la razza precedente) viene ASSORBITA, poi la nuova si rivela a
   inchiostro (nome scritto a mano + righe + immagine a fuoco). */
function mostraRazza(id){
  var page=document.getElementById("grimPage");
  if(!page){ razzaVista=id; grimMode="view"; grimAnima=true; renderGrimorio(); return; }
  if(id===razzaVista && grimMode==="view") return;   // già lì: niente da fare
  page.classList.remove("entra");
  page.classList.add("assorbe");
  setTimeout(function(){
    page.classList.remove("assorbe");
    razzaVista=id; grimMode="view"; grimAnima=true;
    renderGrimorio();
  }, 380);
}

/* In personalizzazione il pannello Razza apre l'aspetto delle sue scritte
   (font/colori/formato), come le rotelline degli altri riquadri. */
function openRazzaAsp(){
  var m=document.getElementById("modalRazzaAsp"); if(!m) return;
  m.hidden=false;
  sincronizzaSel("razza");
}
/* Il tocco sul pannello: in personalizzazione l'aspetto, altrimenti il grimorio */
function apriRazzaPanel(){ if(personalizza) openRazzaAsp(); else openRazze(); }

var grimFiltro="";   // testo cercato nell'indice delle razze

/* Filtra l'indice per nome: nasconde le voci che non contengono il testo cercato,
   senza ridisegnare la lista (così non perde il fuoco mentre si scrive). */
function applicaFiltroGrimorio(){
  var list=document.getElementById("grimList"); if(!list) return;
  var q=(grimFiltro||"").trim().toLowerCase();
  var items=list.querySelectorAll(".grimitem"), visti=0;
  for(var i=0;i<items.length;i++){
    var n=items[i].getAttribute("data-nome")||"";
    var ok = !q || n.indexOf(q)>=0;
    items[i].style.display = ok ? "" : "none";
    if(ok) visti++;
  }
  var msg=document.getElementById("grimNoRes");
  if(q && visti===0){
    if(!msg){ msg=document.createElement("div"); msg.id="grimNoRes"; msg.className="grimvuoto"; msg.textContent="Nessuna razza trovata."; list.appendChild(msg); }
  } else if(msg){ msg.parentNode.removeChild(msg); }
}

function renderGrimorio(){
  var list=document.getElementById("grimList"), page=document.getElementById("grimPage");
  if(!list||!page) return;
  page.style.visibility="";   // non lascio mai la pagina invisibile da un'attesa precedente
  var staff=puoToccareSchede();
  // INDICE (colonna sinistra) — con il "+" in cima per chi può aggiungere
  var testa = staff ? '<button class="grimadd" type="button" data-grimadd>+ Aggiungi razza</button>' : '';
  var cerca = RAZZE.length ? '<div class="grimsearch"><input id="grimCerca" type="search" placeholder="Cerca una razza&hellip;" aria-label="Cerca una razza" autocomplete="off"></div>' : '';
  if(!RAZZE.length){
    list.innerHTML=testa+'<div class="grimvuoto">'+(razzeCaricate?'Il grimorio &egrave; ancora vuoto.':'Carico&hellip;')+'</div>';
  } else {
    if(razzaVista && !razzaById(razzaVista)) razzaVista=null;   // NON forzo la prima: si può stare "a pagina vuota"
    list.innerHTML=cerca+testa+RAZZE.map(function(r){
      return '<button class="grimitem'+((r.id===razzaVista && grimMode==="view")?' on':'')+'" type="button" data-razza="'+esc(r.id)+'" data-nome="'+esc((r.nome||"").toLowerCase())+'">'
        + esc(r.nome||"Senza nome")
        + (r.tipologia?'<span class="git-tipo">'+esc(r.tipologia)+'</span>':'')
        + '</button>';
    }).join('');
    // ripristino il testo cercato e riapplico il filtro dopo il ridisegno
    var inpC=document.getElementById("grimCerca");
    if(inpC) inpC.value=grimFiltro;
    applicaFiltroGrimorio();
  }
  // PAGINA (colonna destra): il modulo d'inserimento, o la pagina del bestiario
  if(grimMode==="form"){
    if(staff){ page.classList.remove("entra"); page.innerHTML=formRazzaHtml(); grimAnima=false; return; }
    grimMode="view";   // sicurezza: se non è più staff, niente modulo
  }
  var r = razzaVista ? razzaById(razzaVista) : null;
  if(!r){
    page.classList.remove("entra");
    page.innerHTML = RAZZE.length
      ? '<div class="grimchiama">Richiama la tua razza.</div>'
      : '<div class="grimvuoto">'+(staff
          ? 'Il grimorio è ancora vuoto. Premi <b>+ Aggiungi razza</b> per inserire la prima.'
          : 'Quando il supporto tecnico avr&agrave; aggiunto le prime razze, compariranno qui, come le pagine di un bestiario.')+'</div>';
    grimAnima=false;
    return;
  }
  // la rivelazione a inchiostro scatta solo se richiesta (apertura o cambio razza)
  if(grimAnima){
    page.classList.remove("entra");
    page.innerHTML=paginaRazza(r);
    // Se c'è un'immagine, aspetto che sia caricata PRIMA di rivelare: così il
    // layout è già a posto e i pulsanti non "saltano" quando l'immagine arriva.
    // Intanto tengo la pagina invisibile (niente lampo di contenuto statico), e
    // poi nome/righe/immagine/pulsanti compaiono tutti insieme.
    var img=page.querySelector(".grimillu img");
    var avvia=function(){
      page.style.visibility="";
      void page.offsetWidth;        // forza il riavvio dell'animazione
      page.classList.add("entra");
    };
    if(img && !img.complete){
      page.style.visibility="hidden";
      var partito=false, go=function(){
        if(partito || !page.contains(img)) return;   // già partito, o pagina già cambiata
        partito=true; avvia();
      };
      img.addEventListener("load", go);
      img.addEventListener("error", go);
      setTimeout(go, 450);          // rete lenta: non aspetto all'infinito
    } else {
      avvia();
    }
  } else {
    page.classList.remove("entra");
    page.innerHTML=paginaRazza(r);
  }
  grimAnima=false;
}

/* La pagina del bestiario di UNA razza: immagine + nome + tutte le informazioni */
function paginaRazza(r){
  // una riga dell'elenco: etichetta in maiuscolo + valore (il valore va a capo
  // da solo, e la lore mantiene gli a-capo scritti grazie al pre-wrap)
  function riga(lab, val, delay){
    return '<li class="grimriga"'+(delay?' style="animation-delay:'+delay+'s"':'')+'>'
      + '<span class="gl-lab">'+lab+':</span><span class="gl-val">'+esc(val)+'</span></li>';
  }
  function pieno(v){ return (v!=null && String(v).trim()!==""); }
  function tratt(v){ return pieno(v) ? v : "—"; }   // "—" quando il campo e' vuoto

  var img = r.immagine_url
    ? '<img src="'+esc(r.immagine_url)+'" alt="'+esc(r.nome||"")+'" loading="lazy">'
    : '<div class="ph">Nessuna<br>illustrazione</div>';
  var scelta = (state.razza===r.id);
  var ass = soloLettura ? ''
    : '<div class="grimass"><button class="btn-assegna'+(scelta?' gia':'')+'" type="button" data-assegna="'+esc(r.id)+'">'
      + (scelta ? '✓ È la tua razza — togli' : 'Scegli questa razza') + '</button></div>';
  // comandi dello staff: Modifica / Elimina (con conferma per l'eliminazione)
  var staff = !puoToccareSchede() ? ''
    : (grimDelId===r.id
        ? '<div class="grimstaff"><div class="grimdelconf">Eliminare «'+esc(r.nome||"questa razza")+'» dal grimorio? Non si può annullare.'
          + '<div class="grimdelbtns"><button type="button" data-delno>Annulla</button>'
          + '<button type="button" class="danger" data-delyes="'+esc(r.id)+'">Elimina</button></div></div></div>'
        : '<div class="grimstaff"><button class="grimlink" type="button" data-edit="'+esc(r.id)+'">Modifica</button>'
          + '<button class="grimlink danger" type="button" data-del="'+esc(r.id)+'">Elimina</button></div>');

  // Le sei "fisse" (attributi del bestiario) ci sono sempre, con "—" se vuote;
  // le "lunghe" compaiono solo se compilate.
  var voci=[
    ["TIPOLOGIA", tratt(r.tipologia)], ["ETÀ", tratt(r.eta)], ["DIMENSIONI", tratt(r.dimensioni)],
    ["VELOCITÀ DI MOVIMENTO", tratt(r.velocita)], ["SCUROVISIONE", tratt(r.scurovisione)], ["LINGUE", tratt(r.lingue)]
  ];
  if(pieno(r.abilita))     voci.push(["ABILITÀ DI RAZZA", r.abilita]);
  if(pieno(r.incantesimi)) voci.push(["INCANTESIMI DI RAZZA", r.incantesimi]);
  if(pieno(r.aspetto))     voci.push(["ASPETTO", r.aspetto]);
  if(pieno(r.lore))        voci.push(["LORE", r.lore]);
  if(pieno(r.manuale))     voci.push(["MANUALE", r.manuale]);
  // ogni riga parte un pelo dopo la precedente (lo scaglionamento a inchiostro);
  // il ritardo serve solo quando è attiva la classe .entra, altrimenti è inerte
  var righe=voci.map(function(v,i){ return riga(v[0], v[1], (0.85 + i*0.07).toFixed(2)); }).join("");

  return '<div class="grimtitle"><h3 class="grimnome">'+esc(r.nome||"Senza nome")+'</h3><div class="grimrule"></div></div>'
    + '<div class="grimcols">'
    +   '<div class="grimillu">'+img+ass+staff+'</div>'
    +   '<div class="grimtesto"><ul class="grimlista">'+righe+'</ul></div>'
    + '</div>';
}

/* ===== INSERIMENTO RAZZA (solo supporto/sviluppatore) =====
   Un modulo con tutti i campi (i testi lunghi senza limiti) e il caricamento
   dell'immagine su Supabase Storage. Nome obbligatorio, il resto libero. */
function campoText(id, lab, ph, req, val){
  return '<div class="frz-row"><label for="'+id+'">'+lab+(req?' <span class="req">*</span>':'')+'</label>'
    + '<input class="frz-in" id="'+id+'" type="text" autocomplete="off"'+(ph?' placeholder="'+ph+'"':'')
    + ' value="'+esc(val||"")+'"></div>';
}
function campoArea(id, lab, big, val){
  return '<div class="frz-row"><label for="'+id+'">'+lab+'</label>'
    + '<textarea class="frz-ta'+(big?' big':'')+'" id="'+id+'">'+esc(val||"")+'</textarea></div>';
}
/* Il campo FAMIGLIA come scelta guidata: input con suggerimenti (datalist) presi
   dalle famiglie che i prerequisiti dei talenti usano davvero, più un elenco sotto
   per ricordarle. Resta testo libero (si può scrivere anche una famiglia nuova). */
function campoFamigliaRazza(val){
  var fams=famiglieRichieste();
  var opts=fams.map(function(f){ return '<option value="'+esc(f)+'"></option>'; }).join("");
  var sugg = fams.length
    ? '<div class="frz-hint" style="margin:5px 0 0">Famiglie usate dai prerequisiti: <b>'+esc(fams.join(", "))+'</b>. Usane una di queste (es. Drow &rarr; <b>elfo</b>).</div>'
    : '<div class="frz-hint" style="margin:5px 0 0">Scrivi la famiglia in minuscolo (es. elfo, nano). Serve ai prerequisiti dei talenti sulle varianti.</div>';
  return '<div class="frz-row"><label for="frz_famiglia">Famiglia (per i prerequisiti)</label>'
    + '<input class="frz-in" id="frz_famiglia" type="text" autocomplete="off" list="frz_fam_lista" placeholder="Es. elfo, nano, gnomo&hellip;" value="'+esc(val||"")+'">'
    + '<datalist id="frz_fam_lista">'+opts+'</datalist>'
    + sugg + '</div>';
}
/* l'immagine da mostrare ora nell'anteprima del modulo: il nuovo file scelto,
   oppure (in modifica) quella già salvata se non è stata tolta */
function immagineCorrente(){
  if(grimFile) return URL.createObjectURL(grimFile);
  if(grimEditId && !grimImgRemoved){ var r=razzaById(grimEditId); if(r && r.immagine_url) return r.immagine_url; }
  return null;
}
function formRazzaHtml(){
  var r = grimEditId ? (razzaById(grimEditId) || {}) : {};
  var mod = !!grimEditId;
  var src = immagineCorrente();
  var prev = src ? '<img src="'+esc(src)+'" alt="anteprima">' : 'Nessuna<br>immagine';
  return '<div class="grimform">'
    + '<h3>'+(mod?'Modifica razza':'Aggiungi una razza')+'</h3>'
    + '<p class="frz-hint">Solo il <b>Nome</b> è obbligatorio. I campi lunghi (Abilità, Aspetto, Lore) non hanno limiti. '+(mod?'Le modifiche sono visibili a tutti.':'Una volta salvata, la razza compare nel grimorio per tutti.')+'</p>'
    + campoText("frz_nome","Nome razza","Es. Umano",true,r.nome)
    + '<div class="frz-grid">'+campoFamigliaRazza(r.famiglia)+campoText("frz_tipologia","Tipologia","Es. Umanoide",false,r.tipologia)+'</div>'
    + '<div class="frz-grid">'+campoText("frz_eta","Età","Es. Maturi verso i 18 anni…",false,r.eta)+campoText("frz_dimensioni","Dimensioni","Es. Media (1,5–1,8 m)",false,r.dimensioni)+'</div>'
    + '<div class="frz-grid">'+campoText("frz_velocita","Velocità di movimento","Es. 9 metri (30 piedi)",false,r.velocita)+campoText("frz_scurovisione","Scurovisione","Es. 18 metri — oppure lascia vuoto",false,r.scurovisione)+'</div>'
    + campoText("frz_lingue","Lingue","Es. Comune e una a scelta",false,r.lingue)
    + campoText("frz_manuale","Manuale di riferimento","Es. Manuale del Giocatore 2024, p. 36",false,r.manuale)
    + campoArea("frz_abilita","Abilità di razza",false,r.abilita)
    + campoArea("frz_incantesimi","Incantesimi di razza",false,r.incantesimi)
    + campoArea("frz_aspetto","Aspetto",false,r.aspetto)
    + campoArea("frz_lore","Lore", true, r.lore)
    + '<div class="frz-row"><label>Illustrazione</label>'
    +   '<div class="frz-imgbox">'
    +     '<div class="frz-preview" id="frz_prev">'+prev+'</div>'
    +     '<div class="frz-imgbtns">'
    +       '<input class="frz-file" id="frz_img" type="file" accept="image/*">'
    +       '<button class="grimlink" type="button" id="frz_rm" data-imgremove'+(src?'':' hidden')+'>Togli immagine</button>'
    +       '<span class="frz-hint" style="margin:0">Consigliato un PNG <b>senza sfondo</b> (solo il soggetto): nel grimorio non avrà cornice.</span>'
    +     '</div>'
    +   '</div>'
    + '</div>'
    + '<div class="grimformbar">'
    +   '<button class="btn-assegna" type="button" data-grimsave'+(grimSalvando?' disabled':'')+'>'+(grimSalvando?'Salvo…':(mod?'Salva modifiche':'Salva razza'))+'</button>'
    +   '<button class="btn-close" type="button" data-grimcancel>Annulla</button>'
    +   '<span class="frz-err" id="frz_err"></span>'
    + '</div>'
    + '</div>';
}

function apriFormRazza(id){
  if(!puoToccareSchede()) return;
  grimEditId = id || null; grimMode="form"; grimFile=null; grimImgRemoved=false; grimDelId=null;
  renderGrimorio();
}

/* Aggiorna solo l'anteprima dell'immagine (senza ridisegnare il modulo, per non
   perdere quello che si è già scritto nei campi) */
function aggiornaAnteprimaImg(){
  var prev=document.getElementById("frz_prev"); if(!prev) return;
  var src=immagineCorrente();
  prev.innerHTML = src ? '<img src="'+esc(src)+'" alt="anteprima">' : 'Nessuna<br>immagine';
  var rm=document.getElementById("frz_rm"); if(rm) rm.hidden = !src;
}

function salvaRazza(){
  if(!puoToccareSchede() || grimSalvando) return;
  var g=function(id){ var e=document.getElementById(id); return e ? e.value : ""; };
  var err=document.getElementById("frz_err");
  var nome=g("frz_nome").trim();
  if(!nome){ if(err) err.textContent="Il nome è obbligatorio."; var n=document.getElementById("frz_nome"); if(n) n.focus(); return; }
  if(err) err.textContent="";
  var obj={
    nome:nome,
    famiglia:(g("frz_famiglia").trim()||null) && g("frz_famiglia").trim().toLowerCase(),
    tipologia:g("frz_tipologia").trim()||null,
    eta:g("frz_eta").trim()||null,
    dimensioni:g("frz_dimensioni").trim()||null,
    velocita:g("frz_velocita").trim()||null,
    scurovisione:g("frz_scurovisione").trim()||null,
    lingue:g("frz_lingue").trim()||null,
    manuale:g("frz_manuale").trim()||null,
    abilita:g("frz_abilita")||null,
    incantesimi:g("frz_incantesimi")||null,
    aspetto:g("frz_aspetto")||null,
    lore:g("frz_lore")||null
  };
  // i testi lunghi: se sono solo spazi/vuoti, meglio null (campo assente)
  ["abilita","incantesimi","aspetto","lore"].forEach(function(k){ if(obj[k]!=null && !obj[k].trim()) obj[k]=null; });

  grimSalvando=true;
  var saveBtn=document.querySelector("[data-grimsave]");
  if(saveBtn){ saveBtn.disabled=true; saveBtn.textContent="Salvo…"; }
  function fallito(msg){
    grimSalvando=false;
    var b=document.querySelector("[data-grimsave]"); if(b){ b.disabled=false; b.textContent=grimEditId?"Salva modifiche":"Salva razza"; }
    var e=document.getElementById("frz_err"); if(e) e.textContent=msg;
  }
  function scrivi(){
    if(grimEditId) obj.modificato_il = new Date().toISOString();
    var op = grimEditId
      ? sb.from("razze").update(obj).eq("id", grimEditId).select()
      : sb.from("razze").insert(obj).select();
    op.then(function(res){
      if(res.error){ fallito("Non riesco a salvare: "+res.error.message); return; }
      var row = res.data && res.data[0];
      var idFatto = (row && row.id) || grimEditId;
      grimSalvando=false; grimFile=null; grimImgRemoved=false; grimEditId=null; grimMode="view";
      caricaRazze(function(){ if(idFatto) razzaVista=idFatto; renderGrimorio(); });
    }, function(){ fallito("Non riesco a salvare: la rete non ha risposto."); });
  }
  if(grimFile){
    // c'è una NUOVA immagine: la carico e poi scrivo la riga con il suo indirizzo
    var ext=((grimFile.name||"").split(".").pop()||"png").toLowerCase().replace(/[^a-z0-9]/g,"") || "png";
    var path=Date.now()+"_"+Math.random().toString(36).slice(2)+"."+ext;
    sb.storage.from("razze").upload(path, grimFile, { cacheControl:"3600", upsert:false }).then(function(res){
      if(res.error){ fallito("Immagine non caricata: "+res.error.message); return; }
      var pub=sb.storage.from("razze").getPublicUrl(path);
      obj.immagine_url = (pub && pub.data && pub.data.publicUrl) || null;
      scrivi();
    }, function(){ fallito("Immagine non caricata: la rete non ha risposto."); });
  } else if(grimEditId){
    // modifica senza nuova immagine: se è stata tolta azzero il campo, altrimenti
    // NON lo tocco affatto (resta quella già salvata)
    if(grimImgRemoved) obj.immagine_url=null;
    scrivi();
  } else {
    obj.immagine_url=null;   // nuova razza senza immagine
    scrivi();
  }
}

/* Elimina una razza dal grimorio (solo staff, con conferma già data nella pagina) */
function eliminaRazza(id){
  if(!puoToccareSchede() || !id) return;
  sb.from("razze").delete().eq("id", id).then(function(res){
    if(res.error){ console.warn("Eliminazione razza:", res.error.message); grimDelId=null; renderGrimorio(); return; }
    grimDelId=null;
    if(razzaVista===id) razzaVista=null;   // era quella aperta: il grimorio sceglierà la prima
    // se qualche personaggio l'aveva scelta, il suo pannello dirà "non più nel grimorio"
    caricaRazze(function(){ renderRazzaPanel(); renderGrimorio(); });
  }, function(){ console.warn("Eliminazione razza: rete assente"); });
}

/* ===== TALENTI — IL MAZZO DI CARTE (Retro) =====
   I talenti vivono nel database (tabella "talenti"), come le razze: lo staff li
   inserisce e tutti li leggono. Sul Retro un pulsante apre una finestra col
   MAZZO: una carta al centro, frecce ai lati per sfogliare (ordine alfabetico),
   ricerca in alto. Qui c'è solo lo SFOGLIO e la gestione staff (mattone 2); la
   selezione con la bruciatura e il +1 in scheda arriveranno dopo (mattone 3).
   (Riuso esc e le classi del modulo grimform/frz-* nella loro versione scura.) */
var TALENTI=[], talentiCaricate=false, talentiSig="";
var PRIVILEGI=[], privilegiCaricati=false, privilegiSig="";       // i privilegi di classe/sottoclasse (tabella staff)
var SOTTOCLASSI=[], sottoclassiCaricate=false, sottoclassiSig=""; // l'elenco delle sottoclassi (tabella staff)
var talIdx=0;             // indice della carta attiva nella lista filtrata
var talMode="view";       // "view" = sfoglio | "form" = modulo aggiungi/modifica
var talFile=null;         // file immagine scelto (non ancora caricato)
var talSalvando=false;    // sto salvando: blocco i pulsanti
var talEditId=null;       // null = aggiungo; altrimenti l'id in modifica
var talImgRemoved=false;  // in modifica: ho tolto l'immagine esistente
var talDelId=null;        // id della carta in attesa di conferma d'eliminazione
var talFiltro="";         // testo cercato
var talAnimDir=0;         // -1 sx, +1 dx, 0: verso dell'animazione d'ingresso
var talScopo=null;        // perché è aperto il mazzo: null=sfoglio | "origine" | "normale" (sto scegliendo)
var talTarget=null;       // lo SLOT che sto compilando: {sez:"origine"|"normali", idx:num|null}. idx null = slot nuovo, da creare alla prima scelta. Scegliere di nuovo SOSTITUISCE nello stesso slot (non aggiunge righe).
var talElenco=false;      // l'elenco rapido è aperto?

function nomeCaratt(k){ for(var i=0;i<CARATT.length;i++){ if(CARATT[i].k===k) return CARATT[i].nome; } return ""; }

/* la razza è ESATTAMENTE "Umano" (non una variante tra parentesi)? Allora ha
   due talenti d'origine (regola della casa) */
function razzaUmano(){ var r = state.razza ? razzaById(state.razza) : null; return !!(r && (r.nome||"").trim().toLowerCase()==="umano"); }
function slotOrigine(){ return razzaUmano() ? 2 : 1; }

/* ===== FORMA E NORMALIZZAZIONE DEI TALENTI SCELTI =====
   Oltre alle due liste di id (origine/normali, in ordine di scelta) teniamo due
   liste PARALLELE, allineate per posizione, con la caratteristica scelta per i
   talenti "+1 a scelta" (null finché il player non sceglie), e un interruttore
   di sblocco per il +1 del talento d'origine (lo mette lo staff dal Controllo). */
function talentiVuoti(){ return { origine:[], normali:[], asiOrigine:[], asiNormali:[], sbloccoOrigine:false }; }
function isCaratt(k){ for(var i=0;i<CARATT.length;i++){ if(CARATT[i].k===k) return true; } return false; }
/* la scelta salvata in asiOrigine/asiNormali[i] può avere DUE forme, a seconda
   del talento: una STRINGA (caratteristica) per il "+1 a scelta", oppure un
   OGGETTO {modo:"uno"|"due", a, b} per il talento "asi" (+2 su una / +1 su due).
   Ripulisce ciò che arriva dal database tenendo solo le forme buone. */
function asiValoreSalvabile(x){
  if(isCaratt(x)) return x;                                  // "+1 a scelta"
  if(x && typeof x==="object" && !Array.isArray(x)){         // distribuzione ASI
    var o={};
    if(x.modo==="uno"||x.modo==="due") o.modo=x.modo;
    if(isCaratt(x.a)) o.a=x.a;
    if(isCaratt(x.b)) o.b=x.b;
    if(o.modo || o.a || o.b) return o;
  }
  return null;
}
/* rimette in forma un blocco talenti letto dal database (o scritto a mano):
   liste di sole stringhe, liste asi allineate in lunghezza alle liste id (valori
   solo se sono caratteristiche vere, altrimenti null), sblocco booleano. */
function normalizzaTalenti(o){
  var t=talentiVuoti();
  if(o && typeof o==="object"){
    ["origine","normali"].forEach(function(sez){
      if(Array.isArray(o[sez])) t[sez]=o[sez].filter(function(x){ return typeof x==="string" && x; });
    });
    [["origine","asiOrigine"],["normali","asiNormali"]].forEach(function(par){
      var src=Array.isArray(o[par[1]])?o[par[1]]:[];
      t[par[1]]=t[par[0]].map(function(_,i){ return asiValoreSalvabile(src[i]); });
    });
    t.sbloccoOrigine = !!o.sbloccoOrigine;
  }
  return t;
}
/* lo sblocco del +1 d'origine NON sta nel blob dati: sta nella colonna
   schede.origine_sbloccata (la accende lo staff). Lo si legge dalla riga della
   scheda, subito dopo applicaDati, e diventa la verità in memoria. */
function applicaSbloccoOrigine(rigaScheda){
  state.talenti.sbloccoOrigine = !!(rigaScheda && rigaScheda.origine_sbloccata);
}

/* ===== IL +1 DEI TALENTI CHE ENTRA NEI PUNTEGGI =====
   Ogni talento può dare +1 a una caratteristica: FISSA (scritta sulla carta) o
   A SCELTA (la sceglie il player). Regole della casa:
   - Talento NORMALE: il +1 vale subito.
   - Talento ORIGINE: il +1 è BLOCCATO finché lo staff non lo sblocca (missione di
     lore), e vale SOLO per la prima casella; una seconda origine (Umano) non dà
     mai il +1. */
function asiScelta(sez, idx){
  var arr = sez==="origine" ? state.talenti.asiOrigine : state.talenti.asiNormali;
  return (Array.isArray(arr) && isCaratt(arr[idx])) ? arr[idx] : null;
}
/* il valore grezzo salvato in una posizione (stringa per "scelta", oggetto per
   "asi", null se non c'è): serve al talento ASI, che non è una semplice stringa */
function asiRaw(sez, idx){
  var arr = sez==="origine" ? state.talenti.asiOrigine : state.talenti.asiNormali;
  return (Array.isArray(arr)) ? arr[idx] : null;
}
/* dalla scelta ASI grezza {modo,a,b} ricava la distribuzione vera dei punti come
   mappa caratteristica→punti. Conta SOLO le parti complete: "+2 a una" vale solo
   con la caratteristica scelta; "+1 a due" vale solo con DUE caratteristiche
   diverse scelte (una scelta a metà non dà punti finché non è finita). */
function distrDa(o){
  var d={};
  if(!o || typeof o!=="object") return d;
  if(o.modo==="uno"){ if(isCaratt(o.a)) d[o.a]=2; }
  else if(o.modo==="due"){ if(isCaratt(o.a) && isCaratt(o.b) && o.a!==o.b){ d[o.a]=1; d[o.b]=1; } }
  return d;
}
/* la scelta ASI è ancora incompleta? (modo non scelto, o mancano caratteristiche) */
function asiIncompleto(o){
  if(!o || typeof o!=="object") return true;
  if(o.modo==="uno") return !isCaratt(o.a);
  if(o.modo==="due") return !(isCaratt(o.a) && isCaratt(o.b) && o.a!==o.b);
  return true;   // modo non ancora scelto
}
/* quanti punti dà, alla caratteristica k, il talento in una data posizione.
   fisso = +1 sulla stat scritta; scelta = +1 sulla stat scelta; asi = +2/+1+1
   secondo la distribuzione salvata. */
function asiPunti(id, sez, idx, k){
  var t=talentoById(id); if(!t) return 0;
  if(t.tipo_asi==="fisso")  return t.asi_caratteristica===k ? 1 : 0;
  if(t.tipo_asi==="scelta") return asiScelta(sez,idx)===k ? 1 : 0;
  if(t.tipo_asi==="asi")    return distrDa(asiRaw(sez,idx))[k] || 0;
  return 0;
}
/* somma di tutti i punti dei talenti ATTIVI sulla caratteristica k.
   NB: nome diverso da contribTalenti() (quello è il cassetto dei talenti per
   CA/Iniziativa/Velocità, torna una lista): questo è il bonus ai PUNTEGGI. */
function bonusCarTalenti(k){
  var t=state.talenti; if(!t) return 0;
  var tot=0;
  (t.normali||[]).forEach(function(id,i){ tot += asiPunti(id, "normali", i, k); });
  if(t.sbloccoOrigine && (t.origine||[]).length)   // solo la PRIMA casella d'origine, e solo se sbloccata
    tot += asiPunti(t.origine[0], "origine", 0, k);
  return tot;
}
/* TETTO 20: i bonus dei talenti/ASI non possono portare una caratteristica sopra
   20 (le altre fonti — oggetti magici, ecc. — verranno dopo e potranno superarlo).
   Questo è il bonus dei talenti EFFETTIVO, già limitato a quanto ci sta fino a 20. */
function bonusCarTalentiEff(k){
  var pre = state.stats.base[k] + state.stats.bonus[k];   // base + bonus di creazione
  return Math.min(bonusCarTalenti(k), Math.max(0, 20 - pre));
}
/* spazio (punti) che resta fino a 20 per la caratteristica k, IGNORANDO il
   contributo del talento che sto compilando in (sez,idx): serve ai menù dell'ASI
   e del "+1 a scelta" per disabilitare le caratteristiche che sforerebbero. */
function spazioAsi(k, sez, idx){
  var pre = state.stats.base[k] + state.stats.bonus[k];
  var slotId = state.talenti[sez] ? state.talenti[sez][idx] : null;
  var contribSlot = (slotId!=null) ? asiPunti(slotId, sez, idx, k) : 0;
  var altriTal = bonusCarTalenti(k) - contribSlot;        // talenti ESCLUSO questo slot
  return Math.max(0, 20 - (pre + altriTal));
}

/* sigla breve di una caratteristica (FOR/DES/...) */
function siglaCar(k){ for(var i=0;i<CARATT.length;i++){ if(CARATT[i].k===k) return CARATT[i].sigla; } return String(k||"").toUpperCase(); }

/* ===== PREREQUISITI — controllo automatico (fase ibrida) =====
   Leggo dal TESTO libero dei prerequisiti le sole cose che la scheda sa
   verificare con certezza: il livello minimo ("Liv. N") e i punteggi minimi di
   caratteristica ("For 13+", eventualmente in OR con "/"). Razza, talenti,
   classe e capacità arriveranno come campi strutturati più avanti. */
function analizzaPrereq(txt){
  txt=String(txt||"");
  // livello: riconosce "Liv. 4", "Liv 4", "Livello 4", "Lvl 4"
  var liv=null, m=txt.match(/Liv(?:ello)?\.?\s*(\d+)/i) || txt.match(/\bLvl\.?\s*(\d+)/i);
  if(m) liv=parseInt(m[1],10);
  var stats=[], re=/(For|Des|Cos|Int|Sag|Car)\s*(\d+)\s*\+/gi, mm;
  while((mm=re.exec(txt))) stats.push({ car:mm[1].toLowerCase(), min:parseInt(mm[2],10) });
  return { liv:liv, stats:stats };
}
/* ===== Ciò che la scheda SA del personaggio (per i prerequisiti) ===== */
var CLASSI_INCANTATORI=["bardo","chierico","druido","mago","stregone","warlock","paladino","ranger","artificere"];
function classiPossedute(){ return (state.classes||[]).map(function(c){ return c.key; }); }
/* Le "famiglie" di razza che i prerequisiti dei talenti richiedono DAVVERO
   (es. elfo, nano, tiefling…), ricavate dai dati caricati: così quando lo staff
   tagga una razza sceglie una parola che combacia con ciò che i controlli cercano
   (niente errori di battitura che farebbero fallire il controllo in silenzio).
   In ordine alfabetico, senza doppioni. */
function famiglieRichieste(){
  var set={};
  (TALENTI||[]).forEach(function(t){
    var P=t && t.prereq; if(!P || !P.and) return;
    P.and.forEach(function(g){ (g||[]).forEach(function(c){
      if(c && c.razza) set[String(c.razza).trim().toLowerCase()]=1;
    }); });
  });
  return Object.keys(set).sort();
}
function tagliaPg(){ var r=state.razza?razzaById(state.razza):null; if(!r||!r.dimensioni) return null; var d=String(r.dimensioni).toLowerCase(); if(/piccol/.test(d))return"piccola"; if(/grande/.test(d))return"grande"; if(/medi/.test(d))return"media"; return null; }
function talentiSceltiNomi(){ var ids=state.talenti.origine.concat(state.talenti.normali), out=[]; ids.forEach(function(id){ var t=talentoById(id); if(t&&t.nome) out.push(t.nome.toLowerCase()); }); return out; }
function haMarchioDrago(){ return talentiSceltiNomi().some(function(n){ return /mark of|dragonmark|marchio del drago/.test(n); }); }
/* la "linea" di marchio di un talento (per la regola "un solo Marchio del Drago"):
   le versioni Greater dello stesso marchio hanno la stessa linea. null = non è un marchio. */
function markLine(nome){
  var n=String(nome||"").toLowerCase();
  if(/aberrant/.test(n)) return "aberrant";
  var m=n.match(/mark of ([a-zàèéìòù]+)/); if(m) return "mark:"+m[1];
  if(/dragonmark|marchio del drago/.test(n)) return "generico";
  return null;
}
function armaturaAllenataPg(tipo){
  var t = tipo==="scudo" ? "scudi" : tipo;
  var cl=classiPossedute(); if(!cl.length) return null;   // non lo so ancora
  return cl.some(function(k){ var d=CLASSE_DATI[k]; return d && d.armature && d.armature.indexOf(t)>=0; });
}
/* valuta UNA condizione: true=soddisfatta, false=di sicuro NON soddisfatta,
   null=non lo sappiamo (non blocca) */
function condValuta(c){
  if(!c || typeof c!=="object") return null;
  if(c.stat) return totaleCar(c.stat[0]) >= c.stat[1];
  if(c.razza){
    var r = state.razza ? razzaById(state.razza) : null;
    if(!r) return null;                                  // nessuna razza scelta: non blocco
    var fam=String(c.razza).toLowerCase();
    if(r.famiglia) return String(r.famiglia).trim().toLowerCase()===fam;   // famiglia taggata = preciso
    return (r.nome||"").toLowerCase().indexOf(fam)>=0;   // ripiego: il nome contiene la famiglia
  }
  if(c.taglia){ var tg=tagliaPg(); return tg==null ? null : (tg===String(c.taglia).toLowerCase()); }
  if(c.classe){ var cl=classiPossedute(); return cl.length ? (cl.indexOf(String(c.classe).toLowerCase())>=0) : null; }
  if(c.talento){ var nm=String(c.talento).toLowerCase(); return talentiSceltiNomi().indexOf(nm)>=0; }
  if(c.armatura) return armaturaAllenataPg(String(c.armatura).toLowerCase());
  // incantesimi E magia dei patti: le classi magiche possono; Barbaro/Guerriero/
  // Ladro/Monaco NO (bloccati). Senza classe: non lo so ancora. (Le sottoclassi
  // magiche le gestiremo più avanti.)
  if(c.cap==="incantesimi" || c.cap==="magia_patti"){
    var cls=classiPossedute();
    if(cls.some(function(k){ return CLASSI_INCANTATORI.indexOf(k)>=0; })) return true;
    return cls.length ? false : null;
  }
  if(c.cap==="armi_marziali"){ var cl3=classiPossedute(); if(!cl3.length) return null; return cl3.some(function(k){ return CLASSE_DATI[k] && /guerra/i.test(CLASSE_DATI[k].armi||""); }) ? true : null; }
  if(c.marchio_qualsiasi) return haMarchioDrago();
  if(c.senza_marchi) return !haMarchioDrago();
  if(c.volante) return null;     // la razza volante non è ancora un dato strutturato
  return null;                    // {nota:...} o sconosciuto: non blocca
}
/* un gruppo è in OR: fallisce SOLO se tutte le condizioni sono di sicuro false */
function gruppoOk(g){ return (g||[]).some(function(c){ return condValuta(c)!==false; }); }
function cap0(s){ s=String(s||""); return s.charAt(0).toUpperCase()+s.slice(1); }
function descriviCond(c){
  if(c.stat) return siglaCar(c.stat[0])+" "+c.stat[1]+"+";
  if(c.razza) return cap0(c.razza)+(c.variante?" ("+c.variante+")":"");
  if(c.taglia) return "taglia "+c.taglia;
  if(c.classe) return cap0(c.classe);
  if(c.talento) return c.talento;
  if(c.armatura) return "addestramento con armatura "+c.armatura;
  if(c.cap==="incantesimi") return "saper lanciare incantesimi";
  if(c.cap==="magia_patti") return "magia dei patti";
  if(c.cap==="armi_marziali") return "competenza con armi marziali";
  if(c.marchio_qualsiasi) return "un Marchio del Drago";
  if(c.senza_marchi) return "nessun Marchio del Drago";
  if(c.volante) return "razza volante";
  if(c.nota) return c.nota;
  return "requisito";
}

/* Prerequisiti NON soddisfatti (lista di scritte; vuota = a posto per quel che la
   scheda sa). Usa il PREREQ STRUTTURATO (colonna prereq); se assente, ripiega sul
   testo libero (livello + caratteristiche). */
function prereqMancanti(t){
  var man=[];
  // Requisito di LIVELLO: scegliendo un Talento ORIGINE il "Liv. 4" è ignorato
  // (i talenti di creazione si possono prendere anche senza il livello), ma i
  // requisiti alti (es. Liv. 11) restano. Come Talento normale, invece, vale sempre.
  var origine = (talScopo==="origine");
  function livOk(liv){
    if(liv==null) return true;
    if(origine && liv<=4) return true;
    return totalLevel() >= liv;
  }
  var P = t && t.prereq;
  var strutturato = P && typeof P==="object" && (P.liv!=null || (P.and && P.and.length));
  if(strutturato){
    if(P.liv!=null && !livOk(P.liv)) man.push("Livello "+P.liv);
    (P.and||[]).forEach(function(g){ if(!gruppoOk(g)) man.push(g.map(descriviCond).join(" o ")); });
  } else {
    var a=analizzaPrereq(t && t.prerequisiti);
    if(a.liv!=null && !livOk(a.liv)) man.push("Livello "+a.liv);
    if(a.stats.length){
      var ok=a.stats.some(function(s){ return totaleCar(s.car) >= s.min; });
      if(!ok) man.push(a.stats.map(function(s){ return siglaCar(s.car)+" "+s.min+"+"; }).join(" o "));
    }
  }
  // regola "UN SOLO Marchio del Drago": un talento-marchio si può prendere solo se
  // non ne hai già un altro di linea DIVERSA (le versioni Greater dello stesso ok)
  var mia = t && markLine(t.nome);
  if(mia){
    var conflitto = state.talenti.origine.concat(state.talenti.normali).some(function(id){
      var tt=talentoById(id); if(!tt) return false; var l=markLine(tt.nome); return l && l!==mia;
    });
    if(conflitto) man.push("un solo Marchio del Drago (ne hai già un altro)");
  }
  return man;
}

function caricaTalenti(poi){
  sb.from("talenti").select("*").order("ordine",{ascending:true}).order("nome",{ascending:true}).then(function(res){
    if(!res.error && Array.isArray(res.data)) TALENTI=res.data;
    else if(res.error) console.warn("Non riesco a leggere i talenti:", res.error.message);
    talentiCaricate=true;
    // firma dell'elenco: se il ricarico non cambia niente, non ridisegno
    var nuova = TALENTI.map(function(t){ return t.id+":"+(t.modificato_il||t.nome||""); }).join("|");
    var cambiato = nuova!==talentiSig; talentiSig=nuova;
    var mt=document.getElementById("modalTalenti");
    if(mt && !mt.hidden && cambiato) renderTalenti();
    // i talenti possono cambiare nomi/badge sul Retro E il +1 che entra nei
    // punteggi (e a valle: modificatori, TS, abilità, PF dalla Costituzione)
    if(cambiato) renderAll();
    if(typeof poi==="function") poi();
  }, function(e){ talentiCaricate=true; console.warn("Talenti:", e); if(typeof poi==="function") poi(); });
}
function talentoById(id){ for(var i=0;i<TALENTI.length;i++){ if(TALENTI[i].id===id) return TALENTI[i]; } return null; }

/* Le sottoclassi e i privilegi dal database (tabella staff). Servono al pop-up
   "Classe e Sottoclasse" del Retro. Se il pop-up è aperto e i dati sono
   cambiati, lo ridisegno; altrimenti basta che siano in memoria per la prossima
   apertura. */
function caricaSottoclassi(poi){
  sb.from("sottoclassi").select("*").order("classe",{ascending:true}).order("ordine",{ascending:true}).order("nome",{ascending:true}).then(function(res){
    if(!res.error && Array.isArray(res.data)) SOTTOCLASSI=res.data;
    else if(res.error) console.warn("Non riesco a leggere le sottoclassi:", res.error.message);
    sottoclassiCaricate=true;
    var nuova = SOTTOCLASSI.map(function(s){ return s.id+":"+(s.modificato_il||s.nome||""); }).join("|");
    var cambiato = nuova!==sottoclassiSig; sottoclassiSig=nuova;
    if(cambiato){ aggiornaVistePriv(); if(document.getElementById("classLine")) renderPanel(); }
    if(typeof poi==="function") poi();
  }, function(e){ sottoclassiCaricate=true; console.warn("Sottoclassi:", e); if(typeof poi==="function") poi(); });
}
function caricaPrivilegi(poi){
  sb.from("privilegi").select("*").order("classe",{ascending:true}).order("livello",{ascending:true}).order("ordine",{ascending:true}).then(function(res){
    if(!res.error && Array.isArray(res.data)) PRIVILEGI=res.data;
    else if(res.error) console.warn("Non riesco a leggere i privilegi:", res.error.message);
    privilegiCaricati=true;
    var nuova = PRIVILEGI.map(function(p){ return p.id+":"+(p.modificato_il||p.nome||""); }).join("|");
    var cambiato = nuova!==privilegiSig; privilegiSig=nuova;
    if(cambiato) aggiornaVistePriv();
    if(typeof poi==="function") poi();
  }, function(e){ privilegiCaricati=true; console.warn("Privilegi:", e); if(typeof poi==="function") poi(); });
}
/* dati nuovi: ridipingo sia il pop-up del Retro (se aperto sui privilegi di
   classe) sia il pannello di gestione nel Controllo (se visibile) */
function aggiornaVistePriv(){
  var m=document.getElementById("modalPriv");
  if(m && !m.hidden && privFonte==="classe") apriPriv("classe");
  var pb=document.getElementById("privBlock");
  if(pb && !pb.hidden) renderPrivManage();
}

/* ===== GESTIONE STAFF DEI PRIVILEGI (sezione nel Controllo) =====
   Solo supporto/sviluppatore. Si sceglie una classe da un menù e si gestiscono
   le sue SOTTOCLASSI e i suoi PRIVILEGI (della classe base o di una sottoclasse).
   Le scritture vanno sulle tabelle "sottoclassi" e "privilegi"; dopo ogni
   salvataggio ricarico così tutti (anche il Retro) vedono la novità. */
var privClasseSel="";     // chiave della classe scelta nel menù
var privForm=null;        // null | {kind:"priv", id, sott} | {kind:"sott", id}
var privDelId=null;       // privilegio in attesa di conferma d'eliminazione
var privScDelId=null;     // sottoclasse in attesa di conferma d'eliminazione
var privSalvando=false;

function sottoclassiDi(k){ return SOTTOCLASSI.filter(function(s){ return s.classe===k; }); }
function privBaseDi(k){ return PRIVILEGI.filter(function(p){ return p.classe===k && !p.sottoclasse_id; })
  .sort(function(a,b){ return (a.livello||1)-(b.livello||1) || (a.ordine||0)-(b.ordine||0); }); }
function privDiSott(id){ return PRIVILEGI.filter(function(p){ return p.sottoclasse_id===id; })
  .sort(function(a,b){ return (a.livello||1)-(b.livello||1) || (a.ordine||0)-(b.ordine||0); }); }
function sottoclasseById(id){ for(var i=0;i<SOTTOCLASSI.length;i++){ if(SOTTOCLASSI[i].id===id) return SOTTOCLASSI[i]; } return null; }
function privilegioById(id){ for(var i=0;i<PRIVILEGI.length;i++){ if(PRIVILEGI[i].id===id) return PRIVILEGI[i]; } return null; }

/* prepara il menù delle classi (una volta) e mostra il blocco allo staff */
function initPrivBlock(){
  var pb=document.getElementById("privBlock"); if(!pb) return;
  if(!puoToccareSchede()){ pb.hidden=true; return; }
  var menuClasse=document.getElementById("privClasse");
  if(menuClasse && !menuClasse.options.length){
    menuClasse.innerHTML = CLASSES.map(function(c){ return '<option value="'+esc(c.key)+'">'+esc(c.name)+'</option>'; }).join("");
  }
  if(!privClasseSel) privClasseSel = (CLASSES[0] && CLASSES[0].key) || "";
  if(menuClasse) menuClasse.value=privClasseSel;
  pb.hidden=false;
  renderPrivManage();
}

function renderPrivManage(){
  var box=document.getElementById("privManage"); if(!box) return;
  var k=privClasseSel;
  if(!k){ box.innerHTML=""; return; }
  var nomeCl=(BY_KEY[k] && BY_KEY[k].name) || k;
  var html="";

  // --- SOTTOCLASSI ---
  html += '<div class="privsec"><div class="privsec-tit">Sottoclassi di '+esc(nomeCl)+'</div>';
  if(privForm && privForm.kind==="sott" && !privForm.id) html += formSottoclasseHtml(null);
  var scs=sottoclassiDi(k);
  if(!scs.length && !(privForm && privForm.kind==="sott" && !privForm.id))
    html += '<div class="priv-vuoto">Ancora nessuna sottoclasse.</div>';
  scs.forEach(function(s){
    if(privForm && privForm.kind==="sott" && privForm.id===s.id){ html += formSottoclasseHtml(s); return; }
    html += '<div class="privsott">'
      + '<div class="privsott-cap"><span class="privsott-nome">'+esc(s.nome||"")+'</span>'
      + '<span class="priv-liv">sceglie al '+esc(String(s.livello_scelta||3))+'&deg; livello</span>'
      + '<span class="priv-cmd"><button type="button" class="grimlink" data-scedit="'+esc(s.id)+'">Modifica</button>'
      + '<button type="button" class="grimlink danger" data-scdel="'+esc(s.id)+'">Elimina</button></span></div>';
    if(privScDelId===s.id)
      html += '<div class="priv-delconf">Eliminare la sottoclasse «'+esc(s.nome||"")+'» e tutti i suoi privilegi? Non si può annullare.'
        + '<span class="priv-delbtns"><button type="button" data-scdelno>Annulla</button>'
        + '<button type="button" class="danger" data-scdelyes="'+esc(s.id)+'">Elimina</button></span></div>';
    // privilegi di questa sottoclasse
    html += '<div class="priv-list">';
    if(privForm && privForm.kind==="priv" && !privForm.id && privForm.sott===s.id) html += formPrivilegioHtml(null, s.id);
    privDiSott(s.id).forEach(function(p){ html += rigaPrivilegioHtml(p); });
    html += '<button type="button" class="priv-add" data-privadd="'+esc(s.id)+'">+ Aggiungi privilegio a questa sottoclasse</button>';
    html += '</div></div>';
  });
  html += '<button type="button" class="priv-add" data-scadd>+ Aggiungi sottoclasse</button>';
  html += '</div>';

  // --- PRIVILEGI DELLA CLASSE BASE ---
  html += '<div class="privsec"><div class="privsec-tit">Privilegi della classe base</div><div class="priv-list">';
  if(privForm && privForm.kind==="priv" && !privForm.id && !privForm.sott) html += formPrivilegioHtml(null, null);
  var base=privBaseDi(k);
  if(!base.length && !(privForm && privForm.kind==="priv" && !privForm.id && !privForm.sott))
    html += '<div class="priv-vuoto">Ancora nessun privilegio di classe.</div>';
  base.forEach(function(p){ html += rigaPrivilegioHtml(p); });
  html += '<button type="button" class="priv-add" data-privadd="">+ Aggiungi privilegio di classe</button>';
  html += '</div></div>';

  box.innerHTML=html;
}

/* una riga di privilegio (in modifica diventa il modulo) */
function rigaPrivilegioHtml(p){
  if(privForm && privForm.kind==="priv" && privForm.id===p.id) return formPrivilegioHtml(p, p.sottoclasse_id||null);
  var s='<div class="privriga"><span class="priv-liv">'+esc(String(p.livello||1))+'&deg;</span>'
    + '<span class="priv-nome">'+esc(p.nome||"")+'</span>'
    + '<span class="priv-cmd"><button type="button" class="grimlink" data-priedit="'+esc(p.id)+'">Modifica</button>'
    + '<button type="button" class="grimlink danger" data-pridel="'+esc(p.id)+'">Elimina</button></span></div>';
  if(privDelId===p.id)
    s += '<div class="priv-delconf">Eliminare «'+esc(p.nome||"")+'»? Non si può annullare.'
      + '<span class="priv-delbtns"><button type="button" data-pridelno>Annulla</button>'
      + '<button type="button" class="danger" data-pridelyes="'+esc(p.id)+'">Elimina</button></span></div>';
  return s;
}

/* il modulo per aggiungere/modificare un privilegio */
function formPrivilegioHtml(p, sottDefault){
  p=p||{};
  var k=privClasseSel;
  var appartiene = (p.sottoclasse_id!==undefined ? p.sottoclasse_id : sottDefault) || "";
  var opts='<option value="">— Classe base —</option>' + sottoclassiDi(k).map(function(s){
    return '<option value="'+esc(s.id)+'"'+(appartiene===s.id?' selected':'')+'>'+esc(s.nome||"")+'</option>';
  }).join("");
  return '<div class="privform">'
    + '<div class="frz-grid">'
    +   '<div class="frz-row"><label for="prf_app">Appartiene a</label><select id="prf_app" class="frz-in">'+opts+'</select></div>'
    +   '<div class="frz-row"><label for="prf_liv">Livello</label><input id="prf_liv" class="frz-in" type="number" min="1" max="20" value="'+esc(String(p.livello||1))+'"></div>'
    +   '<div class="frz-row"><label for="prf_ord">Ordine (a parità di livello)</label><input id="prf_ord" class="frz-in" type="number" value="'+esc(String(p.ordine||0))+'"></div>'
    + '</div>'
    + '<div class="frz-row"><label for="prf_nome">Nome <span class="req">*</span></label><input id="prf_nome" class="frz-in" type="text" autocomplete="off" value="'+esc(p.nome||"")+'"></div>'
    + '<div class="frz-row"><label for="prf_desc">Descrizione</label><textarea id="prf_desc" class="frz-ta big">'+esc(p.descrizione||"")+'</textarea></div>'
    + '<div class="priv-formbar"><button type="button" class="btn-apri" data-prisave="'+esc(p.id||"")+'">'+(p.id?"Salva modifiche":"Salva privilegio")+'</button>'
    + '<button type="button" class="grimlink" data-priannulla>Annulla</button>'
    + '<span class="priv-err" id="prf_err"></span></div>'
    + '</div>';
}

/* il modulo per aggiungere/modificare una sottoclasse */
function formSottoclasseHtml(s){
  s=s||{};
  return '<div class="privform">'
    + '<div class="frz-grid">'
    +   '<div class="frz-row"><label for="scf_nome">Nome della sottoclasse <span class="req">*</span></label><input id="scf_nome" class="frz-in" type="text" autocomplete="off" value="'+esc(s.nome||"")+'"></div>'
    +   '<div class="frz-row"><label for="scf_liv">Si sceglie al livello</label><input id="scf_liv" class="frz-in" type="number" min="1" max="20" value="'+esc(String(s.livello_scelta||3))+'"></div>'
    +   '<div class="frz-row"><label for="scf_ord">Ordine</label><input id="scf_ord" class="frz-in" type="number" value="'+esc(String(s.ordine||0))+'"></div>'
    + '</div>'
    + '<div class="frz-row"><label for="scf_desc">Descrizione (facoltativa)</label><textarea id="scf_desc" class="frz-ta">'+esc(s.descrizione||"")+'</textarea></div>'
    + '<div class="priv-formbar"><button type="button" class="btn-apri" data-scsave="'+esc(s.id||"")+'">'+(s.id?"Salva modifiche":"Salva sottoclasse")+'</button>'
    + '<button type="button" class="grimlink" data-scannulla>Annulla</button>'
    + '<span class="priv-err" id="scf_err"></span></div>'
    + '</div>';
}

function salvaPrivilegio(id){
  if(!puoToccareSchede() || privSalvando) return;
  var g=function(i){ var e=document.getElementById(i); return e?e.value:""; };
  var err=document.getElementById("prf_err");
  var nome=g("prf_nome").trim();
  if(!nome){ if(err) err.textContent="Il nome è obbligatorio."; var n=document.getElementById("prf_nome"); if(n) n.focus(); return; }
  var liv=parseInt(g("prf_liv"),10); if(!isFinite(liv)||liv<1) liv=1; if(liv>20) liv=20;
  var ord=parseInt(g("prf_ord"),10); if(!isFinite(ord)) ord=0;
  var sott=g("prf_app")||null;
  var obj={ classe:privClasseSel, sottoclasse_id:sott, livello:liv, ordine:ord, nome:nome,
    descrizione:(g("prf_desc").trim()||null) ? g("prf_desc") : null };
  privSalvando=true;
  var op = id ? sb.from("privilegi").update(Object.assign({modificato_il:new Date().toISOString()},obj)).eq("id",id).select()
              : sb.from("privilegi").insert(obj).select();
  op.then(function(res){
    privSalvando=false;
    if(res.error){ if(err) err.textContent="Non riesco a salvare: "+res.error.message; return; }
    privForm=null;
    caricaPrivilegi();
  }, function(){ privSalvando=false; if(err) err.textContent="Non riesco a salvare: la rete non ha risposto."; });
}

function eliminaPrivilegio(id){
  if(!puoToccareSchede() || !id) return;
  sb.from("privilegi").delete().eq("id",id).then(function(res){
    privDelId=null;
    if(res.error){ console.warn("Eliminazione privilegio:", res.error.message); renderPrivManage(); return; }
    caricaPrivilegi();
  }, function(){ console.warn("Eliminazione privilegio: rete assente"); });
}

function salvaSottoclasse(id){
  if(!puoToccareSchede() || privSalvando) return;
  var g=function(i){ var e=document.getElementById(i); return e?e.value:""; };
  var err=document.getElementById("scf_err");
  var nome=g("scf_nome").trim();
  if(!nome){ if(err) err.textContent="Il nome è obbligatorio."; var n=document.getElementById("scf_nome"); if(n) n.focus(); return; }
  var liv=parseInt(g("scf_liv"),10); if(!isFinite(liv)||liv<1) liv=3; if(liv>20) liv=20;
  var ord=parseInt(g("scf_ord"),10); if(!isFinite(ord)) ord=0;
  var obj={ classe:privClasseSel, nome:nome, livello_scelta:liv, ordine:ord,
    descrizione:(g("scf_desc").trim()||null) ? g("scf_desc") : null };
  privSalvando=true;
  var op = id ? sb.from("sottoclassi").update(Object.assign({modificato_il:new Date().toISOString()},obj)).eq("id",id).select()
              : sb.from("sottoclassi").insert(obj).select();
  op.then(function(res){
    privSalvando=false;
    if(res.error){ if(err) err.textContent="Non riesco a salvare: "+res.error.message; return; }
    privForm=null;
    caricaSottoclassi();
  }, function(){ privSalvando=false; if(err) err.textContent="Non riesco a salvare: la rete non ha risposto."; });
}

function eliminaSottoclasse(id){
  if(!puoToccareSchede() || !id) return;
  // i privilegi collegati se ne vanno da soli (on delete cascade nel database)
  sb.from("sottoclassi").delete().eq("id",id).then(function(res){
    privScDelId=null;
    if(res.error){ console.warn("Eliminazione sottoclasse:", res.error.message); renderPrivManage(); return; }
    caricaSottoclassi(function(){ caricaPrivilegi(); });
  }, function(){ console.warn("Eliminazione sottoclasse: rete assente"); });
}

/* agganci del pannello di gestione (delega su #privBlock) */
(function(){
  var pb=document.getElementById("privBlock"); if(!pb) return;
  var menuClasse=document.getElementById("privClasse");
  if(menuClasse) menuClasse.addEventListener("change", function(){ privClasseSel=menuClasse.value; privForm=null; privDelId=null; privScDelId=null; renderPrivManage(); });
  pb.addEventListener("click", function(e){
    var t=e.target.closest("button"); if(!t) return;
    var a=function(n){ return t.hasAttribute(n) ? t.getAttribute(n) : null; };
    if(a("data-scadd")!==null){ privForm={kind:"sott",id:null}; privDelId=null; privScDelId=null; renderPrivManage(); return; }
    if(a("data-scedit")){ privForm={kind:"sott",id:a("data-scedit")}; privDelId=null; privScDelId=null; renderPrivManage(); return; }
    if(a("data-scannulla")!==null){ privForm=null; renderPrivManage(); return; }
    if(a("data-scsave")!==null){ salvaSottoclasse(a("data-scsave")||null); return; }
    if(a("data-scdel")){ privScDelId=a("data-scdel"); privDelId=null; renderPrivManage(); return; }
    if(a("data-scdelno")!==null){ privScDelId=null; renderPrivManage(); return; }
    if(a("data-scdelyes")){ eliminaSottoclasse(a("data-scdelyes")); return; }
    if(a("data-privadd")!==null){ privForm={kind:"priv",id:null,sott:a("data-privadd")||null}; privDelId=null; privScDelId=null; renderPrivManage(); return; }
    if(a("data-priedit")){ var p=privilegioById(a("data-priedit")); privForm={kind:"priv",id:a("data-priedit"),sott:p?p.sottoclasse_id:null}; privDelId=null; privScDelId=null; renderPrivManage(); return; }
    if(a("data-priannulla")!==null){ privForm=null; renderPrivManage(); return; }
    if(a("data-prisave")!==null){ salvaPrivilegio(a("data-prisave")||null); return; }
    if(a("data-pridel")){ privDelId=a("data-pridel"); privScDelId=null; renderPrivManage(); return; }
    if(a("data-pridelno")!==null){ privDelId=null; renderPrivManage(); return; }
    if(a("data-pridelyes")){ eliminaPrivilegio(a("data-pridelyes")); return; }
  });
})();

/* la lista da sfogliare: tutti i talenti, filtrati per il testo cercato (nome) */
function talentiFiltrati(){
  var q=(talFiltro||"").trim().toLowerCase();
  var base=TALENTI.slice();
  // nel mazzo dell'ORIGINE l'Aumento di Caratteristica non compare proprio:
  // si prende solo come Talento normale (agli ASI)
  if(talScopo==="origine") base=base.filter(function(t){ return t.tipo_asi!=="asi"; });
  if(!q) return base;
  return base.filter(function(t){ return (t.nome||"").toLowerCase().indexOf(q)>=0; });
}

function openTalenti(scopo, target){
  var mt=document.getElementById("modalTalenti"); if(!mt) return;
  mt.hidden=false;
  talScopo = (scopo==="origine"||scopo==="normale") ? scopo : null;
  // lo slot da compilare: se non me lo passano ma c'è uno scopo, è uno slot NUOVO
  talTarget = talScopo
    ? (target || { sez: (talScopo==="origine"?"origine":"normali"), idx:null })
    : null;
  talMode="view"; talFile=null; talEditId=null; talImgRemoved=false; talDelId=null;
  talIdx=0; talFiltro=""; talAnimDir=0; talElenco=false;
  renderTalenti();
  caricaTalenti();   // e intanto rinfresco dal database
}
/* chiude SOLO il mazzo (una finestra alla volta): si torna alla lista dei
   talenti, non alla pagina illustrata. Lo slot in lavorazione si azzera. */
function chiudiTalenti(){
  var mt=document.getElementById("modalTalenti"); if(mt) mt.hidden=true;
  talScopo=null; talTarget=null; talElenco=false;
  renderRetro();   // rinfresco la tabella dietro (lo slot compilato si vede)
}
/* "+ Aggiungi ...": apre il mazzo per compilare UNO slot nuovo (idx null = riga
   da creare alla prima scelta). Riscegliendo si sostituisce, non si aggiunge. */
function apriAggiuntaTalento(scopo){
  var sez = scopo==="origine" ? "origine" : "normali";
  openTalenti(scopo, { sez:sez, idx:null });
}

/* scelgo il talento della carta attiva → finisce nella sezione giusta del Retro,
   in coda (ordine di scelta), e la scheda si "sporca" per il salvataggio */
function scegliTalento(id){
  if(soloLettura || !talScopo || !talTarget) return;
  var t=talentoById(id); if(!t) return;
  var sez=talTarget.sez, asiKey = sez==="origine" ? "asiOrigine" : "asiNormali";
  var arr=state.talenti[sez], asiArr=state.talenti[asiKey];
  // l'Aumento di Caratteristica NON può essere un Talento Origine (regola secca,
  // nessuna eccezione: si prende agli ASI, come Talento normale)
  if(asiComeOrigineVietato(t)) return;
  // i talenti normali (ASI compreso) si prendono dal livello 4; lo staff può forzare
  if(sez==="normali" && totalLevel()<4 && !puoToccareSchede()) return;
  // un talento non ripetibile si prende una volta sola: se è GIÀ altrove (non in
  // questo slot che sto compilando) non lo si può rimettere
  if(!t.ripetibile && talGiaSceltoTranne(id, sez, talTarget.idx)) return;
  // prerequisiti: i player sono bloccati se non li soddisfano; lo staff può forzare
  if(prereqMancanti(t).length && !puoToccareSchede()) return;
  if(talTarget.idx==null){
    // PRIMA scelta in questo slot: creo la riga (rispettando il limite d'origine)
    if(sez==="origine" && arr.length >= slotOrigine()) return;
    arr.push(id); asiArr.push(null);
    talTarget.idx = arr.length-1;
  } else {
    // scelta SUCCESSIVA nello stesso slot: SOSTITUISCO, non aggiungo una riga
    if(arr[talTarget.idx]===id){ disegnaCarta(); return; }   // stesso talento: niente da fare
    arr[talTarget.idx]=id; asiArr[talTarget.idx]=null;       // talento diverso: azzero la scelta del +1
  }
  aggiornaSalva(); renderAll();   // il +1 può cambiare i punteggi: ridisegno tutto
  // NON si chiude il mazzo: si resta a sfogliare e si può cambiare la scelta.
  // Aggiorno la carta e l'elenco e mostro un breve riscontro. Tutto resta
  // modificabile finché non si salva.
  disegnaCarta();
  if(talElenco) renderElenco();
  flashTalAggiunto(t.nome);
}
/* un talento non ripetibile è già scelto in QUALCHE slot diverso da (sez,idx)?
   (idx null = sto creando un slot nuovo, quindi conta ogni riga esistente) */
function talGiaSceltoTranne(id, sez, idx){
  function dentro(arr, arrSez){
    for(var i=0;i<arr.length;i++){
      if(arrSez===sez && i===idx) continue;   // salto lo slot che sto compilando
      if(arr[i]===id) return true;
    }
    return false;
  }
  return dentro(state.talenti.origine,"origine") || dentro(state.talenti.normali,"normali");
}
/* l'Aumento di Caratteristica (tipo "asi") non è un talento d'origine: si prende
   agli ASI. Regola secca del gioco, VALE PER TUTTI (anche lo sviluppatore): non è
   un permesso, è che concettualmente non è un talento d'origine. */
function asiComeOrigineVietato(t){
  return !!(t && t.tipo_asi==="asi" && talScopo==="origine");
}
/* breve riscontro "✓ impostato" dentro il mazzo, senza chiuderlo */
function flashTalAggiunto(nome){
  var host=document.getElementById("modalTalenti"); if(!host) return;
  var vecchio=host.querySelector(".tal-toast"); if(vecchio) vecchio.remove();
  var el=document.createElement("div");
  el.className="tal-toast";
  el.innerHTML='<span class="tal-toast-ok">&#10003;</span> '+(nome?'&laquo;'+esc(nome)+'&raquo; ':'')+'impostato in questa riga';
  host.appendChild(el);
  void el.offsetWidth;            // forza il reflow, così la comparsa si anima
  el.classList.add("on");
  clearTimeout(flashTalAggiunto._t);
  flashTalAggiunto._t=setTimeout(function(){
    el.classList.remove("on");
    setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 260);
  }, 1300);
}
/* tolgo un talento scelto da una sezione, per POSIZIONE (così i doppioni dei
   talenti ripetibili si tolgono uno per volta) */
function togliTalento(sez, idx){
  if(soloLettura) return;
  var arr = state.talenti[sez]; if(!arr) return;
  idx=parseInt(idx,10); if(isNaN(idx) || idx<0 || idx>=arr.length) return;
  arr.splice(idx,1);
  var asiKey = sez==="origine" ? "asiOrigine" : "asiNormali";   // tolgo la scelta allineata
  if(Array.isArray(state.talenti[asiKey])) state.talenti[asiKey].splice(idx,1);
  aggiornaSalva(); renderAll();
}

/* il player sceglie a quale caratteristica va il "+1 a scelta" di un talento */
function scegliAsiTalento(sez, idx, k){
  if(soloLettura) return;
  var asiKey = sez==="origine" ? "asiOrigine" : "asiNormali";
  var arr = state.talenti[asiKey]; if(!Array.isArray(arr)) return;
  idx=parseInt(idx,10); if(isNaN(idx) || idx<0 || idx>=arr.length) return;
  arr[idx] = isCaratt(k) ? k : null;
  aggiornaSalva(); renderAll();
}

/* il player regola la distribuzione di un talento "asi" (+2/+1+1). slot dice
   quale pezzo cambia: "modo" (+2 a una / +1 a due), "a" (prima caratteristica),
   "b" (seconda). La scelta si salva come oggetto {modo,a,b}. */
function scegliAsiDistr(sez, idx, slot, value){
  if(soloLettura) return;
  var asiKey = sez==="origine" ? "asiOrigine" : "asiNormali";
  var arr = state.talenti[asiKey]; if(!Array.isArray(arr)) return;
  idx=parseInt(idx,10); if(isNaN(idx) || idx<0 || idx>=arr.length) return;
  var vecchio = arr[idx];
  var o = (vecchio && typeof vecchio==="object" && !Array.isArray(vecchio))
    ? { modo:vecchio.modo, a:vecchio.a, b:vecchio.b } : {};
  if(slot==="modo"){
    o.modo = (value==="uno"||value==="due") ? value : undefined;
    if(o.modo==="uno") o.b=undefined;           // "+2 a una" non usa la seconda
  } else if(slot==="a"){
    o.a = isCaratt(value) ? value : undefined;
  } else if(slot==="b"){
    o.b = isCaratt(value) ? value : undefined;
  }
  if(o.modo==="due" && o.a && o.b===o.a) o.b=undefined;   // mai due volte la stessa
  arr[idx] = o;
  aggiornaSalva(); renderAll();
}

/* il badge del bonus sulla carta: fisso "+1 Forza", scelta "+1 a scelta",
   asi "+2 / +1+1 a scelta", o niente */
function badgeAsi(t){
  if(t.tipo_asi==="fisso"){ var n=nomeCaratt(t.asi_caratteristica); return n ? ("+1 "+n) : "+1 a una caratteristica"; }
  if(t.tipo_asi==="scelta") return "+1 a scelta";
  if(t.tipo_asi==="asi")    return "+2 a una o +1 a due";
  return "";
}

/* disegna la carta attiva (e aggiorna contatore + frecce). Non ricostruisce la
   barra in alto: così la ricerca non perde il fuoco mentre si scrive. */
/* una "slitta" = carte-fantasma dietro + la carta attiva. La finestra resta
   ferma: quando si sfoglia, la slitta vecchia scivola via e la nuova entra dal
   lato opposto (unica animazione). */
function cartaSlotHtml(t, idx, lista){
  var dietro=Math.min(2, lista.length-1-idx), stack="";
  for(var s=dietro;s>=1;s--) stack+='<div class="tghost tghost-'+s+'"></div>';
  return '<div class="tcard-slot">'+stack+cartaTalento(t)+'</div>';
}
function disegnaCarta(dir){
  var host=document.getElementById("talCarte"); if(!host) return;
  var lista=talentiFiltrati();
  var conta=document.getElementById("talConta");
  var prev=document.querySelector("[data-talprev]"), next=document.querySelector("[data-talnext]");
  if(!lista.length){
    var msg = !talentiCaricate ? "Carico&hellip;"
      : talFiltro ? "Nessun talento trovato."
      : (puoToccareSchede()
          ? "Il mazzo &egrave; ancora vuoto. Premi <b>+ Aggiungi talento</b> per creare la prima carta."
          : "Quando lo staff avr&agrave; aggiunto i talenti, le carte compariranno qui.");
    host.innerHTML='<div class="mazzo-vuoto">'+msg+'</div>';
    if(conta) conta.textContent="0 / 0";
    if(prev) prev.disabled=true; if(next) next.disabled=true;
    return;
  }
  if(talIdx<0) talIdx=0; if(talIdx>lista.length-1) talIdx=lista.length-1;
  var t=lista[talIdx];
  if(conta) conta.textContent=(talIdx+1)+" / "+lista.length;
  if(prev) prev.disabled=(talIdx<=0);
  if(next) next.disabled=(talIdx>=lista.length-1);

  // Effetto MAZZO: la finestra resta ferma (altezza fissa). Sfogliando, la carta
  // nuova esce dalla pila dietro e viene avanti PASSANDO SOPRA la vecchia, che si
  // ritira dietro. Le carte-fantasma restano lì come "resto del mazzo".
  var vecchioSlot=host.querySelector(".tcard-slot");
  var mobile = window.matchMedia && window.matchMedia("(max-width:720px)").matches;
  if(dir && vecchioSlot && !mobile){
    // slot nuovo con la SOLA carta (i fantasmi del vecchio restano come sfondo)
    var nuovoSlot=document.createElement("div");
    nuovoSlot.className="tcard-slot"; nuovoSlot.style.zIndex="4";
    nuovoSlot.innerHTML=cartaTalento(t);
    host.appendChild(nuovoSlot);
    var nuovaCard=nuovoSlot.querySelector(".tcard");
    var vecchiaCard=vecchioSlot.querySelector(".tcard");
    var off = dir>0 ? 46 : -46;
    // la nuova parte dalla posa "dietro" (dal mazzo): spostata, piccola, storta
    nuovaCard.style.transform="translate("+off+"px,16px) scale(.9) rotate("+(dir>0?4:-4)+"deg)";
    nuovaCard.style.opacity="0";
    void host.offsetWidth;                     // fisso il punto di partenza
    nuovaCard.classList.add("deck-anim"); if(vecchiaCard) vecchiaCard.classList.add("deck-anim");
    nuovaCard.style.transform="none"; nuovaCard.style.opacity="1";
    if(vecchiaCard){ vecchiaCard.style.transform="translate("+(-off/3)+"px,10px) scale(.93)"; vecchiaCard.style.opacity="0"; }
    window.clearTimeout(disegnaCarta._t);
    disegnaCarta._t=window.setTimeout(function(){ host.innerHTML=cartaSlotHtml(t, talIdx, lista); }, 350);
  } else {
    host.innerHTML=cartaSlotHtml(t, talIdx, lista);   // cambio secco (apertura, ricerca, telefono)
  }
}

/* la carta di UN talento: illustrazione + nome + badge +1 + prerequisiti +
   benefici + fonte, e (per lo staff) Modifica/Elimina */
function cartaTalento(t){
  function pieno(v){ return v!=null && String(v).trim()!==""; }
  var img = t.immagine_url
    ? '<img src="'+esc(t.immagine_url)+'" alt="'+esc(t.nome||"")+'" loading="lazy">'
    : '<div class="tcard-ph">&#10022;</div>';
  var badge=badgeAsi(t);
  // area di SCELTA: compare solo quando il mazzo è aperto per scegliere un
  // talento (dal Retro) e non è in sola lettura
  var scelta = '';
  if(talScopo && !soloLettura){
    var tgt = talTarget || {}, puoStaff = puoToccareSchede();
    // il talento è quello GIÀ nello slot che sto compilando?
    var inQuestoSlot = (tgt.idx!=null && state.talenti[tgt.sez] && state.talenti[tgt.sez][tgt.idx]===t.id);
    if(asiComeOrigineVietato(t)){
      scelta = '<div class="tcard-scegli"><button class="btn-scegli no" type="button" disabled>Non pu&ograve; essere un Talento Origine</button>'
        + '<div class="tcard-manca">L&rsquo;Aumento di Caratteristica si prende come <b>Talento</b> (agli ASI), non come Talento Origine.</div></div>';
    } else if(inQuestoSlot){
      // è già lui in questa riga: niente da riscegliere (per cambiarlo, scegline un altro)
      scelta = '<div class="tcard-scegli"><button class="btn-scegli gia" type="button" disabled>&#10003; Scelto in questa riga</button></div>';
    } else if(tgt.sez==="normali" && totalLevel()<4 && !puoStaff){
      // i talenti normali (ASI compreso) si prendono dal livello 4
      scelta = '<div class="tcard-scegli"><button class="btn-scegli no" type="button" disabled>Disponibile dal livello 4</button>'
        + '<div class="tcard-manca">I talenti si prendono dal <b>livello 4</b>.</div></div>';
    } else if(!t.ripetibile && talGiaSceltoTranne(t.id, tgt.sez, tgt.idx)){
      scelta = '<div class="tcard-scegli"><button class="btn-scegli gia" type="button" disabled>&#10003; Gi&agrave; in scheda</button></div>';
    } else {
      var manca = prereqMancanti(t), staff = puoStaff;
      var etich = talScopo==="origine"
        ? "Scegli come Talento Origine"
        : (tgt.idx!=null ? "Metti questo al posto" : "Scegli questo talento");
      if(manca.length && !staff){
        // player: bloccato, spiego cosa manca
        scelta = '<div class="tcard-scegli"><button class="btn-scegli no" type="button" disabled>Requisiti non soddisfatti</button>'
          + '<div class="tcard-manca">Ti manca: '+esc(manca.join(", "))+'</div></div>';
      } else {
        // ok, oppure staff che può forzare (con avviso)
        var nota = (manca.length && staff)
          ? '<div class="tcard-manca staff">Requisiti non soddisfatti ('+esc(manca.join(", "))+') — puoi forzare come staff.</div>'
          : '';
        scelta = '<div class="tcard-scegli"><button class="btn-scegli" type="button" data-talpick="'+esc(t.id)+'">'+etich+'</button>'+nota+'</div>';
      }
    }
  }
  var staff = !puoToccareSchede() ? ''
    : (talDelId===t.id
        ? '<div class="tcard-delconf">Eliminare &laquo;'+esc(t.nome||"questa carta")+'&raquo;? Non si pu&ograve; annullare.'
          + '<div class="tcard-delbtns"><button type="button" data-taldelno>Annulla</button>'
          + '<button type="button" class="danger" data-taldelyes="'+esc(t.id)+'">Elimina</button></div></div>'
        : '<div class="tcard-staff"><button class="tcard-link" type="button" data-taledit="'+esc(t.id)+'">Modifica</button>'
          + '<button class="tcard-link danger" type="button" data-taldel="'+esc(t.id)+'">Elimina</button></div>');
  return '<article class="tcard" data-cardid="'+esc(t.id)+'">'
    + '<div class="tcard-cornice"></div>'
    + '<div class="tcard-illu">'+img+'</div>'
    + '<div class="tcard-right">'
    + '<div class="tcard-head">'
    +   '<h3 class="tcard-nome">'+esc(t.nome||"Senza nome")+'</h3>'
    +   (badge ? '<div class="tcard-asi">'+esc(badge)+'</div>' : '')
    +   (t.ripetibile ? '<div class="tcard-rip">Si pu&ograve; prendere pi&ugrave; volte</div>' : '')
    +   (pieno(t.prerequisiti) ? '<div class="tcard-prq"><span>Prerequisiti</span> '+esc(t.prerequisiti)+'</div>' : '')
    + '</div>'
    + '<div class="tcard-scroll">'
    +   '<div class="tcard-ben">'+(pieno(t.benefici)?esc(t.benefici):'<span class="tcard-vuoto">Nessun beneficio descritto.</span>')+'</div>'
    +   (pieno(t.fonte) ? '<div class="tcard-fonte">'+esc(t.fonte)+'</div>' : '')
    + '</div>'
    + scelta
    + staff
    + '</div>'
    + '</article>';
}

/* sfoglia il mazzo di una carta (con l'animazione dal lato giusto) */
function talVai(dir){
  var lista=talentiFiltrati(); if(!lista.length) return;
  var n=talIdx+dir;
  if(n<0 || n>lista.length-1) return;
  talIdx=n; talDelId=null;
  disegnaCarta(dir);
}

/* costruisce tutta la finestra: modulo (staff) oppure barra + scena + contatore */
function renderTalenti(){
  var wrap=document.getElementById("talWrap"); if(!wrap) return;
  var staff=puoToccareSchede();
  // nel MODULO (modifica/inserimento) la finestra deve poter scorrere per
  // arrivare in fondo e salvare; nello sfoglio no (barra inutile)
  wrap.classList.toggle("modulo", talMode==="form" && staff);
  if(talMode==="form"){
    if(staff){ wrap.innerHTML=formTalentoHtml(); return; }
    talMode="view";   // sicurezza: se non è più staff, niente modulo
  }
  var add = staff ? '<button class="mazzo-add" type="button" data-taladd>+ Aggiungi talento</button>' : '';
  var indice = TALENTI.length ? '<button class="mazzo-indice'+(talElenco?' on':'')+'" type="button" data-talindice>&#9776; Elenco</button>' : '';
  var cerca = TALENTI.length
    ? '<div class="mazzo-cerca"><input id="talCerca" type="search" placeholder="Cerca un talento&hellip;" aria-label="Cerca un talento" autocomplete="off"></div>'
    : '';
  var banda = talScopo
    ? '<div class="mazzo-scopo">Stai scegliendo un <b>'+(talScopo==="origine"?"Talento Origine":"Talento")+'</b> &mdash; sfoglia e premi <b>Scegli</b> sulla carta.</div>'
    : '';
  wrap.innerHTML =
    banda
    + '<div class="mazzo-top">'+add+indice+cerca+'</div>'
    + '<div class="mazzo-scena">'
    +   '<button class="mazzo-frec sx" type="button" data-talprev aria-label="Carta precedente"><svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 5 8 12 15 19"/></svg></button>'
    +   '<div class="mazzo-carte" id="talCarte"></div>'
    +   '<button class="mazzo-frec dx" type="button" data-talnext aria-label="Carta successiva"><svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 5 16 12 9 19"/></svg></button>'
    +   '<div class="mazzo-elenco" id="talElencoBox" hidden></div>'
    + '</div>'
    + '<div class="mazzo-conta"><span id="talConta"></span></div>';
  var inp=document.getElementById("talCerca"); if(inp) inp.value=talFiltro;
  disegnaCarta();
  renderElenco();
}

/* l'elenco rapido: la lista dei talenti (filtrata dalla ricerca); cliccando un
   nome si va dritti alla sua carta. */
function renderElenco(){
  var box=document.getElementById("talElencoBox"); if(!box) return;
  box.hidden = !talElenco;
  if(!talElenco) return;
  var lista=talentiFiltrati();
  if(!lista.length){ box.innerHTML='<div class="elenco-vuoto">'+(talFiltro?"Nessun talento trovato.":"Nessun talento.")+'</div>'; return; }
  box.innerHTML = lista.map(function(t){
    var badge=badgeAsi(t);
    return '<button class="elenco-item" type="button" data-taljump="'+esc(t.id)+'"><span>'+esc(t.nome||"Senza nome")+'</span>'
      + (badge?'<span class="elenco-asi">'+esc(badge)+'</span>':'')+'</button>';
  }).join("");
}
/* vai dritto alla carta di un talento (dal suo id) e chiudi l'elenco */
function vaiATalento(id){
  var lista=talentiFiltrati();
  for(var i=0;i<lista.length;i++){ if(lista[i].id===id){ talIdx=i; break; } }
  talElenco=false; talDelId=null;
  renderElenco();
  var b=document.querySelector(".mazzo-indice"); if(b) b.classList.remove("on");
  disegnaCarta();
}

/* ===== INSERIMENTO TALENTO (solo supporto/sviluppatore) =====
   Stesso modulo scuro delle razze (grimform/frz-*), coi campi dei talenti. */
function immagineCorrenteTal(){
  if(talFile) return URL.createObjectURL(talFile);
  if(talEditId && !talImgRemoved){ var t=talentoById(talEditId); if(t && t.immagine_url) return t.immagine_url; }
  return null;
}
function formTalentoHtml(){
  var t = talEditId ? (talentoById(talEditId) || {}) : {};
  var mod=!!talEditId;
  var src=immagineCorrenteTal();
  var prev = src ? '<img src="'+esc(src)+'" alt="anteprima">' : 'Nessuna<br>immagine';
  var tipo = t.tipo_asi || "nessuno";
  function opt(v,lab,cur){ return '<option value="'+v+'"'+(cur===v?' selected':'')+'>'+lab+'</option>'; }
  var selTipo = '<div class="frz-row"><label for="tf_tipoasi">Bonus di caratteristica</label>'
    + '<select class="frz-in" id="tf_tipoasi">'
    +   opt("nessuno","Nessuno", tipo) + opt("fisso","+1 fisso su una caratteristica", tipo) + opt("scelta","+1 a scelta del giocatore", tipo)
    +   opt("asi","Aumento di Caratteristica (+2 a una o +1 a due)", tipo)
    + '</select></div>';
  var caropts = CARATT.map(function(c){ return opt(c.k, c.nome, t.asi_caratteristica||"for"); }).join("");
  var selCar = '<div class="frz-row" id="tf_carrow"'+(tipo==="fisso"?'':' hidden')+'><label for="tf_caratt">Quale caratteristica</label>'
    + '<select class="frz-in" id="tf_caratt">'+caropts+'</select></div>';
  return '<div class="grimform talform">'
    + '<h3>'+(mod?'Modifica talento':'Aggiungi un talento')+'</h3>'
    + '<p class="frz-hint">Solo il <b>Nome</b> è obbligatorio. I <b>Benefici</b> si scrivono a mano (nessun limite) e a capo dove vuoi. '+(mod?'Le modifiche sono visibili a tutti.':'Una volta salvato, il talento compare nel mazzo per tutti.')+'</p>'
    + campoText("tf_nome","Nome talento","Es. Vigile",true,t.nome)
    + '<div class="frz-grid">'+campoText("tf_prereq","Prerequisiti","Es. Livello 4 — oppure lascia vuoto",false,t.prerequisiti)+campoText("tf_fonte","Fonte","Es. Manuale del Giocatore 2024, p. 200",false,t.fonte)+'</div>'
    + '<div class="frz-grid">'+selTipo+selCar+'</div>'
    + '<div class="frz-row frz-check"><label for="tf_ripet"><input type="checkbox" id="tf_ripet"'+(t.ripetibile?' checked':'')+'> Si pu&ograve; prendere pi&ugrave; volte (ripetibile)</label></div>'
    + campoArea("tf_benefici","Benefici", true, t.benefici)
    + '<div class="frz-row"><label>Illustrazione</label>'
    +   '<div class="frz-imgbox">'
    +     '<div class="frz-preview" id="tf_prev">'+prev+'</div>'
    +     '<div class="frz-imgbtns">'
    +       '<input class="frz-file" id="tf_img" type="file" accept="image/*">'
    +       '<button class="grimlink" type="button" id="tf_rm" data-talimgremove'+(src?'':' hidden')+'>Togli immagine</button>'
    +       '<span class="frz-hint" style="margin:0">Consigliato un PNG <b>senza sfondo</b> (solo il soggetto): sulla carta sta senza cornice.</span>'
    +     '</div>'
    +   '</div>'
    + '</div>'
    + '<div class="grimformbar">'
    +   '<button class="btn-assegna" type="button" data-talsave'+(talSalvando?' disabled':'')+'>'+(talSalvando?'Salvo…':(mod?'Salva modifiche':'Salva talento'))+'</button>'
    +   '<button class="btn-close" type="button" data-talcancel>Annulla</button>'
    +   '<span class="frz-err" id="tf_err"></span>'
    + '</div>'
    + '</div>';
}

function apriFormTalento(id){
  if(!puoToccareSchede()) return;
  talEditId = id || null; talMode="form"; talFile=null; talImgRemoved=false; talDelId=null;
  renderTalenti();
}

/* aggiorna solo l'anteprima immagine, senza ridisegnare il modulo (per non
   perdere quello che si è già scritto) */
function aggiornaAnteprimaImgTal(){
  var prev=document.getElementById("tf_prev"); if(!prev) return;
  var src=immagineCorrenteTal();
  prev.innerHTML = src ? '<img src="'+esc(src)+'" alt="anteprima">' : 'Nessuna<br>immagine';
  var rm=document.getElementById("tf_rm"); if(rm) rm.hidden = !src;
}

function salvaTalento(){
  if(!puoToccareSchede() || talSalvando) return;
  var g=function(id){ var e=document.getElementById(id); return e ? e.value : ""; };
  var err=document.getElementById("tf_err");
  var nome=g("tf_nome").trim();
  if(!nome){ if(err) err.textContent="Il nome è obbligatorio."; var n=document.getElementById("tf_nome"); if(n) n.focus(); return; }
  if(err) err.textContent="";
  var tipo=g("tf_tipoasi")||"nessuno";
  var obj={
    nome:nome,
    prerequisiti:g("tf_prereq").trim()||null,
    fonte:g("tf_fonte").trim()||null,
    tipo_asi:tipo,
    asi_caratteristica: tipo==="fisso" ? (g("tf_caratt")||null) : null,
    ripetibile: !!((document.getElementById("tf_ripet")||{}).checked),
    benefici:g("tf_benefici")||null
  };
  if(obj.benefici!=null && !obj.benefici.trim()) obj.benefici=null;

  talSalvando=true;
  var saveBtn=document.querySelector("[data-talsave]");
  if(saveBtn){ saveBtn.disabled=true; saveBtn.textContent="Salvo…"; }
  function fallito(msg){
    talSalvando=false;
    var b=document.querySelector("[data-talsave]"); if(b){ b.disabled=false; b.textContent=talEditId?"Salva modifiche":"Salva talento"; }
    var e=document.getElementById("tf_err"); if(e) e.textContent=msg;
  }
  function scrivi(){
    if(talEditId) obj.modificato_il = new Date().toISOString();
    var op = talEditId
      ? sb.from("talenti").update(obj).eq("id", talEditId).select()
      : sb.from("talenti").insert(obj).select();
    op.then(function(res){
      if(res.error){ fallito("Non riesco a salvare: "+res.error.message); return; }
      var row = res.data && res.data[0];
      var idFatto = (row && row.id) || talEditId;
      talSalvando=false; talFile=null; talImgRemoved=false; talEditId=null; talMode="view";
      caricaTalenti(function(){
        // dopo il salvataggio mi fermo sulla carta appena scritta
        renderTalenti();
        if(idFatto){ var lista=talentiFiltrati(); for(var i=0;i<lista.length;i++){ if(lista[i].id===idFatto){ talIdx=i; break; } } disegnaCarta(); }
      });
    }, function(){ fallito("Non riesco a salvare: la rete non ha risposto."); });
  }
  if(talFile){
    var ext=((talFile.name||"").split(".").pop()||"png").toLowerCase().replace(/[^a-z0-9]/g,"") || "png";
    var path=Date.now()+"_"+Math.random().toString(36).slice(2)+"."+ext;
    sb.storage.from("talenti").upload(path, talFile, { cacheControl:"3600", upsert:false }).then(function(res){
      if(res.error){ fallito("Immagine non caricata: "+res.error.message); return; }
      var pub=sb.storage.from("talenti").getPublicUrl(path);
      obj.immagine_url = (pub && pub.data && pub.data.publicUrl) || null;
      scrivi();
    }, function(){ fallito("Immagine non caricata: la rete non ha risposto."); });
  } else if(talEditId){
    if(talImgRemoved) obj.immagine_url=null;   // tolta senza sostituirla
    scrivi();
  } else {
    obj.immagine_url=null;   // nuovo talento senza immagine
    scrivi();
  }
}

function eliminaTalento(id){
  if(!puoToccareSchede() || !id) return;
  sb.from("talenti").delete().eq("id", id).then(function(res){
    if(res.error){ console.warn("Eliminazione talento:", res.error.message); talDelId=null; disegnaCarta(); return; }
    talDelId=null;
    caricaTalenti(function(){ renderTalenti(); renderRetro(); });   // la lista si accorcia; anche il Retro si riallinea
  }, function(){ console.warn("Eliminazione talento: rete assente"); });
}

/* ===== LA TABELLA DEI TALENTI SCELTI (Retro) =====
   Due sezioni: "Talento Origine" (1 casella, 2 se la razza è Umano) e "Talento"
   (la lista che cresce a ogni ASI, in ordine di scelta). Si aggiunge scegliendo
   dal mazzo, si toglie con la ✕. Il +1 del talento si APPLICA qui: fisso in
   automatico, a scelta con un menù (avviso rosso finché non si sceglie). Per il
   talento d'origine resta BLOCCATO finché lo staff non lo sblocca dal Controllo,
   e la seconda casella (Umano) non dà mai il +1. */

/* la cella del +1 nella riga: menù di scelta, avviso rosso, "fisso", "bloccato"
   o "nessun +1", a seconda del talento e della posizione */
function cellaAsi(t, sez, idx){
  if(!t || !t.tipo_asi || t.tipo_asi==="nessuno") return '<span class="tt-asi"></span>';
  // seconda casella d'origine (solo Umano): non dà mai il +1
  if(sez==="origine" && idx>=1)
    return '<span class="tt-asi tt-asi-no" title="Il secondo talento d&rsquo;origine non porta il +1">nessun +1</span>';
  // origine ancora bloccata: il +1 aspetta lo sblocco dello staff
  if(sez==="origine" && !state.talenti.sbloccoOrigine)
    return '<span class="tt-asi tt-asi-lock" title="Il +1 si sblocca quando lo staff conferma la missione di lore">&#128274; +1 bloccato</span>';
  if(t.tipo_asi==="fisso"){
    var n=nomeCaratt(t.asi_caratteristica);
    return '<span class="tt-asi tt-asi-ok">+1 '+esc(n||"a una caratteristica")+'</span>';
  }
  // "asi": il talento Aumento di Caratteristica — DUE punti (+2 a una / +1 a due)
  if(t.tipo_asi==="asi") return cellaAsiDistr(sez, idx);
  // "+1 a scelta": il player sceglie la caratteristica
  var scelto = asiScelta(sez, idx) || "";
  if(soloLettura)
    return scelto
      ? '<span class="tt-asi tt-asi-ok">+1 '+esc(nomeCaratt(scelto))+'</span>'
      : '<span class="tt-asi tt-asi-manca">+1 a scelta</span>';
  var opts='<option value="">+1 a scelta&hellip;</option>'+CARATT.map(function(c){
    var scel=(c.k===scelto);
    var pieno = !scel && spazioAsi(c.k, sez, idx) < 1;   // già a 20: il +1 non ci sta
    return '<option value="'+c.k+'"'+(scel?' selected':'')+(pieno?' disabled':'')+'>'+esc(c.nome)+(pieno?' (max 20)':'')+'</option>';
  }).join("");
  var bang = scelto ? '' : '<span class="tt-asi-bang" aria-hidden="true">&#10071;</span>';
  return '<span class="tt-asi tt-asi-pick '+(scelto?'tt-asi-ok':'tt-asi-manca')+'" data-talasi>'
    + bang + '<select data-talasi-sez="'+sez+'" data-talasi-idx="'+idx+'" aria-label="Caratteristica del +1">'+opts+'</select></span>';
}

/* la cella del talento "asi" (+2/+1+1): menù del modo (+2 a una / +1 a due) e
   una o due caratteristiche. Riepilogo verde quando è completa, avviso rosso
   finché non lo è. In sola lettura mostra solo il riepilogo. */
function cellaAsiDistr(sez, idx){
  var raw = asiRaw(sez, idx) || {};
  var modo = (raw.modo==="uno"||raw.modo==="due") ? raw.modo : "";
  var completo = !asiIncompleto(raw);
  if(soloLettura){
    if(!completo) return '<span class="tt-asi tt-asi-manca">+2 a scelta</span>';
    var d=distrDa(raw), parti=[];
    CARATT.forEach(function(c){ if(d[c.k]) parti.push('+'+d[c.k]+' '+nomeCaratt(c.k)); });
    return '<span class="tt-asi tt-asi-ok">'+esc(parti.join("  "))+'</span>';
  }
  // menù del modo
  function op(v,et,sel){ return '<option value="'+v+'"'+(v===sel?' selected':'')+'>'+et+'</option>'; }
  var modoSel='<select data-talasi-sez="'+sez+'" data-talasi-idx="'+idx+'" data-talasi-slot="modo" aria-label="Come distribuire i due punti">'
    + op("", "+2 come&hellip;", modo) + op("uno","+2 a una",modo) + op("due","+1 a due",modo) + '</select>';
  // le caratteristiche (una in "uno", due in "due"; l'altra scelta è disabilitata
  // per non ripeterla, e quelle che sforerebbero 20 sono disabilitate col "max 20").
  // need = punti che questa scelta metterebbe (2 in "+2 a una", 1 in "+1 a due").
  function carSel(slot, sel, escludi, need, aria){
    var opts='<option value="">car.&hellip;</option>'+CARATT.map(function(c){
      var isSel=(c.k===sel);
      var ripet=(escludi && c.k===escludi);
      var pieno=!isSel && spazioAsi(c.k, sez, idx) < need;   // non ci sta fino a 20
      var dis=(ripet||pieno)?' disabled':'';
      return '<option value="'+c.k+'"'+(isSel?' selected':'')+dis+'>'+esc(c.nome)+(pieno?' (max 20)':'')+'</option>';
    }).join("");
    return '<select data-talasi-sez="'+sez+'" data-talasi-idx="'+idx+'" data-talasi-slot="'+slot+'" aria-label="'+aria+'">'+opts+'</select>';
  }
  var cars="";
  var a=isCaratt(raw.a)?raw.a:"", b=isCaratt(raw.b)?raw.b:"";
  if(modo==="uno")      cars=carSel("a", a, "", 2, "Caratteristica del +2");
  else if(modo==="due") cars=carSel("a", a, b, 1, "Prima caratteristica del +1")+carSel("b", b, a, 1, "Seconda caratteristica del +1");
  var bang = completo ? '' : '<span class="tt-asi-bang" aria-hidden="true">&#10071;</span>';
  return '<span class="tt-asi tt-asi-pick tt-asi-multi '+(completo?'tt-asi-ok':'tt-asi-manca')+'" data-talasi>'
    + bang + modoSel + cars + '</span>';
}

function rigaTalentoRetro(id, sez, idx){
  var t=talentoById(id);
  var togli = soloLettura ? '' : '<button class="tt-x" type="button" data-talrem="'+idx+'" data-talsez="'+sez+'" aria-label="Togli questo talento" title="Togli">&times;</button>';
  if(!t){
    var ghost = talentiCaricate ? "Talento non pi&ugrave; nel mazzo" : "&hellip;";
    return '<div class="tt-row tt-ghost"><span class="tt-nome">'+ghost+'</span><span class="tt-asi"></span>'+togli+'</div>';
  }
  var rip = t.ripetibile ? ' <span class="tt-rip" title="Si pu&ograve; prendere pi&ugrave; volte">ripetibile</span>' : '';
  // il talento ASI ha il selettore su DUE menù: quando è modificabile lo mando su
  // una riga tutta sua sotto il nome (classe tt-row-asi), così non sfora mai.
  var cls = "tt-row" + (rigaAsiEditabile(t, sez, idx) ? " tt-row-asi" : "");
  return '<div class="'+cls+'" data-talview="'+esc(id)+'" role="button" tabindex="0" title="Apri la carta">'
    + '<span class="tt-nome">'+esc(t.nome||"Senza nome")+rip+'</span>'
    + cellaAsi(t, sez, idx)
    + togli + '</div>';
}
/* la riga mostra il selettore ASI a due menù (e quindi va mandato a capo)? Solo
   se è un talento "asi" davvero modificabile in questa posizione. */
function rigaAsiEditabile(t, sez, idx){
  if(!t || t.tipo_asi!=="asi" || soloLettura) return false;
  if(sez==="origine" && idx>=1) return false;                        // 2ª casella Umano: nessun bonus
  if(sez==="origine" && !state.talenti.sbloccoOrigine) return false; // origine ancora bloccata
  return true;
}

/* una riga con il pulsante per aggiungere (apre il mazzo con lo scopo giusto) */
function rigaAggiungi(scopo, label){
  return '<div class="tt-row tt-addrow"><button class="tt-add" type="button" data-taladdsez="'+scopo+'">+ '+label+'</button></div>';
}

/* ============ RETRO: HUB ILLUSTRATO + POP-UP DEI PRIVILEGI ============
   La pagina 2 mostra l'illustrazione (a contorni) della classe scelta; da punti
   scelti partono richiami (pallino → linea → parola) verso Talenti, Sottoclasse,
   Razza, Classe. Cliccando un richiamo si apre un pop-up con l'elenco di quella
   fonte; le voci si aprono a fisarmonica per la descrizione. Su schermi stretti i
   richiami diventano quattro pulsanti sotto l'immagine. */
/* nome del file immagine per ogni classe (stanno nella cartella scheda). La
   maggior parte = Nome.png; l'unica eccezione è artificere → "Artefice". Manca
   ancora "Mago.png": per quella classe si mostra lo stato "immagine in arrivo". */
var IMG_CLASSE={
  artificere:"Artefice", barbaro:"Barbaro", bardo:"Bardo", chierico:"Chierico",
  druido:"Druido", guerriero:"Guerriero", ladro:"Ladro", mago:"Mago", monaco:"Monaco",
  paladino:"Paladino", ranger:"Ranger", stregone:"Stregone", warlock:"Warlock"
};
function classePrimaria(){ return (state.classes && state.classes[0]) ? state.classes[0].key : null; }
function immagineClasse(){ var c=classePrimaria(); if(!c) return null; var f=IMG_CLASSE[c]; return f ? (f+".png") : null; }
function immagineClasseKey(key){ var f=IMG_CLASSE[key]; return f ? (f+".png") : null; }

// punti di richiamo: ax/ay = posizione in % SULL'IMMAGINE; lato = da che parte va la parola.
// Sono PER CLASSE (le pose cambiano): per ora un default; Threevi riempirà le
// posizioni vere di ogni classe in HUB_PUNTI_CLASSE (chiave = classe).
var HUB_PUNTI_DEFAULT=[
  { id:"talenti", label:"Talenti",             ax:23, ay:19, lato:"sx" },
  { id:"estasi",  label:"Estasi ed Anedonie",  ax:57, ay:12, lato:"dx" },
  { id:"razza",   label:"Tratti di Razza",     ax:54, ay:45, lato:"dx" },
  { id:"classe",  label:"Classe", label2:"Sottoclasse", ax:83, ay:50, lato:"dx" }
];
var HUB_PUNTI_CLASSE={
  artificere:[{id:"talenti",label:"Talenti",ax:26.5,ay:82.4,lato:"sx"},{id:"razza",label:"Tratti di Razza",ax:47.8,ay:50,lato:"sx"},{id:"classe",label:"Classe",label2:"Sottoclasse",ax:60.3,ay:41.3,lato:"dx"},{id:"estasi",label:"Estasi ed Anedonie",ax:43.6,ay:17.2,lato:"sx"}],
  barbaro:[{id:"talenti",label:"Talenti",ax:88,ay:53.3,lato:"dx"},{id:"razza",label:"Tratti di Razza",ax:62.3,ay:37.9,lato:"dx"},{id:"classe",label:"Classe",label2:"Sottoclasse",ax:25.2,ay:53.8,lato:"sx"},{id:"estasi",label:"Estasi ed Anedonie",ax:74.8,ay:19.3,lato:"dx"}],
  bardo:[{id:"talenti",label:"Talenti",ax:25,ay:49.3,lato:"sx"},{id:"razza",label:"Tratti di Razza",ax:47.5,ay:21.9,lato:"sx"},{id:"classe",label:"Classe",label2:"Sottoclasse",ax:44.1,ay:36.4,lato:"sx"},{id:"estasi",label:"Estasi ed Anedonie",ax:34.8,ay:8.5,lato:"sx"}],
  chierico:[{id:"talenti",label:"Talenti",ax:47.1,ay:52.3,lato:"sx"},{id:"razza",label:"Tratti di Razza",ax:50.7,ay:38.9,lato:"dx"},{id:"classe",label:"Classe",label2:"Sottoclasse",ax:34.1,ay:34.8,lato:"sx"},{id:"estasi",label:"Estasi ed Anedonie",ax:50.7,ay:20.3,lato:"dx"}],
  druido:[{id:"talenti",label:"Talenti",ax:11.8,ay:60.1,lato:"sx"},{id:"razza",label:"Tratti di Razza",ax:47.8,ay:34.3,lato:"sx"},{id:"classe",label:"Classe",label2:"Sottoclasse",ax:83.1,ay:13.4,lato:"dx"},{id:"estasi",label:"Estasi ed Anedonie",ax:50.5,ay:17,lato:"dx"}],
  guerriero:[{id:"talenti",label:"Talenti",ax:27.2,ay:26.5,lato:"sx"},{id:"razza",label:"Tratti di Razza",ax:47.3,ay:64.2,lato:"sx"},{id:"classe",label:"Classe",label2:"Sottoclasse",ax:49.3,ay:47.9,lato:"sx"},{id:"estasi",label:"Estasi ed Anedonie",ax:51.2,ay:33.8,lato:"dx"}],
  ladro:[{id:"talenti",label:"Talenti",ax:52,ay:50.8,lato:"dx"},{id:"razza",label:"Tratti di Razza",ax:45.1,ay:39.4,lato:"sx"},{id:"classe",label:"Classe",label2:"Sottoclasse",ax:80.4,ay:63.7,lato:"dx"},{id:"estasi",label:"Estasi ed Anedonie",ax:35,ay:16.7,lato:"sx"}],
  mago:[{id:"talenti",label:"Talenti",ax:22.3,ay:24.7,lato:"sx"},{id:"razza",label:"Tratti di Razza",ax:65,ay:40.8,lato:"dx"},{id:"classe",label:"Classe",label2:"Sottoclasse",ax:81.1,ay:52.8,lato:"dx"},{id:"estasi",label:"Estasi ed Anedonie",ax:60.5,ay:13.1,lato:"dx"}],
  monaco:[{id:"talenti",label:"Talenti",ax:37.3,ay:38.4,lato:"sx"},{id:"razza",label:"Tratti di Razza",ax:61.5,ay:24.3,lato:"dx"},{id:"classe",label:"Classe",label2:"Sottoclasse",ax:77.9,ay:20.6,lato:"dx"},{id:"estasi",label:"Estasi ed Anedonie",ax:54.9,ay:4.7,lato:"dx"}],
  paladino:[{id:"talenti",label:"Talenti",ax:71.8,ay:19.1,lato:"dx"},{id:"razza",label:"Tratti di Razza",ax:37.3,ay:32.5,lato:"sx"},{id:"classe",label:"Classe",label2:"Sottoclasse",ax:11,ay:46.9,lato:"sx"},{id:"estasi",label:"Estasi ed Anedonie",ax:38.7,ay:8.8,lato:"sx"}],
  ranger:[{id:"talenti",label:"Talenti",ax:61,ay:52.5,lato:"dx"},{id:"razza",label:"Tratti di Razza",ax:59.1,ay:35.5,lato:"dx"},{id:"classe",label:"Classe",label2:"Sottoclasse",ax:38,ay:14.7,lato:"sx"},{id:"estasi",label:"Estasi ed Anedonie",ax:70.1,ay:10.1,lato:"dx"}],
  stregone:[{id:"talenti",label:"Talenti",ax:82.9,ay:39.7,lato:"dx"},{id:"razza",label:"Tratti di Razza",ax:57.8,ay:28.9,lato:"dx"},{id:"classe",label:"Classe",label2:"Sottoclasse",ax:28,ay:28.2,lato:"sx"},{id:"estasi",label:"Estasi ed Anedonie",ax:58.8,ay:14,lato:"dx"}],
  warlock:[{id:"talenti",label:"Talenti",ax:76.9,ay:16.4,lato:"dx"},{id:"razza",label:"Tratti di Razza",ax:50.8,ay:43.5,lato:"dx"},{id:"classe",label:"Classe",label2:"Sottoclasse",ax:34.5,ay:33.1,lato:"sx"},{id:"estasi",label:"Estasi ed Anedonie",ax:48.4,ay:25.7,lato:"sx"}]
};
function puntiHub(){ var c=classePrimaria(); return (c && HUB_PUNTI_CLASSE[c]) || HUB_PUNTI_DEFAULT; }

var retroAnimando=false;   // è in corso l'animazione di passaggio tra le due viste?
/* accende il bottone giusto dell'interruttore in alto a sinistra */
function aggiornaBtnRetro(){
  var modo=document.getElementById("retroModo"); if(!modo) return;
  Array.prototype.forEach.call(modo.querySelectorAll(".rm-btn"), function(b){
    var on = b.getAttribute("data-retrovista")===state.retroVista;
    b.classList.toggle("on", on); b.setAttribute("aria-pressed", on?"true":"false");
  });
}
function renderRetro(){
  aggiornaBtnRetro();
  // durante l'animazione NON tocco il layout (la sequenza lo gestisce da sé)
  if(retroAnimando){ renderTaltab(); return; }
  var hub=document.getElementById("retroHub");
  var elenco = (state.retroVista==="elenco");
  if(hub) hub.classList.toggle("modo-elenco", elenco);
  renderRetroHub();                 // l'immagine serve in entrambe le viste
  var box=document.getElementById("hubElenco");
  if(box){ box.hidden=!elenco; if(elenco) box.innerHTML=elencoRetroHtml(); else box.innerHTML=""; }
  renderTaltab();   // se il pop-up Talenti è aperto, ne aggiorno il contenuto
}
/* cambia la vista della pagina Retro (illustrazione ⇄ elenco), ANIMATA, e la salva */
function cambiaRetroVista(v){
  v = (v==="elenco") ? "elenco" : "hub";
  if(state.retroVista===v || retroAnimando) return;
  state.retroVista=v; aggiornaBtnRetro();
  var hub=document.getElementById("retroHub");
  if(!hub){ renderRetro(); aggiornaSalva(); return; }
  retroAnimando=true;
  animaRetro(hub, v, function(){ retroAnimando=false; renderRetro(); });
  aggiornaSalva();
}
/* ===== ANIMAZIONE del passaggio tra illustrazione ed elenco =====
   Verso elenco: i richiami (linee/scritte/punti) si RITIRANO e spariscono
   coordinati; poi l'immagine SCIVOLA a sinistra rimpicciolendosi (tecnica FLIP);
   infine l'elenco compare a CASCATA. Verso hub: il contrario. */
function animaRetro(hub, verso, done){
  var img=document.getElementById("hubImg"), box=document.getElementById("hubElenco");
  var haImg = !!(img && !img.hidden && img.getBoundingClientRect().width>2);
  if(verso==="elenco"){
    ritiraRichiami("out", function(){
      var first = haImg ? img.getBoundingClientRect() : null;   // immagine grande (layout hub)
      hub.classList.add("modo-elenco");
      if(box){ box.hidden=false; box.innerHTML=elencoRetroHtml(); }
      if(haImg){ flipImg(img, first, img.getBoundingClientRect()); }  // scivola+rimpicciolisce
      var casc = box ? cascataElenco(box) : 0;                   // le voci compaiono a cascata
      setTimeout(done, Math.max(560, casc+60));                  // fine dopo la cascata (per non tagliarla)
    });
  } else {
    var first = haImg ? img.getBoundingClientRect() : null;     // immagine piccola (layout elenco)
    if(box) box.classList.add("he-uscita");                     // la lista sfuma via
    setTimeout(function(){
      hub.classList.remove("modo-elenco");
      if(box){ box.hidden=true; box.classList.remove("he-uscita"); box.innerHTML=""; }
      renderRetroHub();                                         // ridisegna immagine + richiami (nella posa finale)
      if(haImg){ flipImg(img, first, img.getBoundingClientRect()); }  // scivola a destra ingrandendosi
      ritiraRichiami("set-out");                                // parto coi richiami ritirati…
      setTimeout(function(){ ritiraRichiami("in"); }, 300);     // …e li disegno quando l'immagine è quasi arrivata
      setTimeout(done, 800);                                    // dopo che i richiami si sono ridisegnati
    }, 200);
  }
}
/* FLIP: fa apparire l'immagine dov'era (first) e la anima fino a dov'è ora (last) */
function flipImg(img, first, last){
  if(!first || !last || !last.width) return;
  var dx=first.left-last.left, dy=first.top-last.top, sx=first.width/last.width, sy=first.height/last.height;
  img.style.transformOrigin="top left";
  img.style.transition="none";
  img.style.transform="translate("+dx+"px,"+dy+"px) scale("+sx+","+sy+")";
  void img.offsetWidth;                                        // fisso la partenza
  img.style.transition="transform .5s cubic-bezier(.22,.61,.36,1)";
  img.style.transform="none";
  setTimeout(function(){ img.style.transition=""; img.style.transform=""; img.style.transformOrigin=""; }, 540);
}
/* le voci dell'elenco entrano una dopo l'altra (cascata). Torna la durata totale. */
function cascataElenco(box){
  var els=box.querySelectorAll(".he-tit, .acc-riga, .acc-vuoto");
  var step=34, dur=340, n=els.length;
  Array.prototype.forEach.call(els, function(el,i){
    el.style.animation="none"; el.style.opacity="0";
    void el.offsetWidth;
    el.style.animation="heCad "+dur+"ms ease "+(i*step)+"ms both";
  });
  return (n>0 ? (n-1)*step : 0) + dur;
}
/* ritira/disegna i richiami dell'hub (linee, scritte, punti), coordinati.
   "out" = si ritirano e spariscono; "set-out" = stato ritirato istantaneo;
   "in" = si ridisegnano. */
function ritiraRichiami(mode, cb){
  var svg=document.getElementById("hubLines"), punti=document.getElementById("hubPunti");
  var linee = svg ? svg.querySelectorAll(".hub-linea") : [];
  var ets   = punti ? punti.querySelectorAll(".hub-et") : [];
  var dots  = punti ? punti.querySelectorAll(".hp-dot") : [];
  var DUR=300;
  function lung(l){ var v; try{ v=l.getTotalLength(); }catch(e){ v=500; } return v||500; }
  function slitta(e){ return e.classList.contains("lato-sx") ? 18 : -18; }   // verso il pallino (centro)
  if(mode==="out"){
    Array.prototype.forEach.call(linee, function(l,i){ var L=lung(l); l.style.strokeDasharray=L; l.style.strokeDashoffset="0"; void l.getBoundingClientRect();
      l.style.transition="stroke-dashoffset "+DUR+"ms ease "+(i*10)+"ms"; l.style.strokeDashoffset=L; });
    Array.prototype.forEach.call(ets, function(e){ e.style.transition="opacity "+DUR+"ms ease, transform "+DUR+"ms ease";
      e.style.opacity="0"; e.style.transform="translateX("+slitta(e)+"px)"; });
    Array.prototype.forEach.call(dots, function(d,i){ d.style.animation="none";
      d.style.transition="transform "+DUR+"ms ease "+(i*10)+"ms, opacity "+DUR+"ms ease "+(i*10)+"ms";
      d.style.transform="scale(0)"; d.style.opacity="0"; });
    if(cb) setTimeout(cb, DUR+50);
  } else if(mode==="set-out"){
    Array.prototype.forEach.call(linee, function(l){ var L=lung(l); l.style.transition="none"; l.style.strokeDasharray=L; l.style.strokeDashoffset=L; });
    Array.prototype.forEach.call(ets, function(e){ e.style.transition="none"; e.style.opacity="0"; e.style.transform="translateX("+slitta(e)+"px)"; });
    Array.prototype.forEach.call(dots, function(d){ d.style.transition="none"; d.style.animation="none"; d.style.transform="scale(0)"; d.style.opacity="0"; });
  } else if(mode==="in"){
    Array.prototype.forEach.call(linee, function(l,i){ var L=lung(l); l.style.strokeDasharray=L; l.style.strokeDashoffset=L; void l.getBoundingClientRect();
      l.style.transition="stroke-dashoffset "+DUR+"ms ease "+(i*12)+"ms"; l.style.strokeDashoffset="0"; });
    Array.prototype.forEach.call(ets, function(e,i){ void e.getBoundingClientRect();
      e.style.transition="opacity "+DUR+"ms ease "+(80+i*12)+"ms, transform "+DUR+"ms ease "+(80+i*12)+"ms"; e.style.opacity="1"; e.style.transform="none"; });
    Array.prototype.forEach.call(dots, function(d,i){ d.style.transition="transform "+DUR+"ms ease "+(i*12)+"ms, opacity "+DUR+"ms ease "+(i*12)+"ms"; d.style.transform="scale(1)"; d.style.opacity="1"; });
    setTimeout(function(){   // ripulisco gli inline: tornano hover e pulsazione normali
      Array.prototype.forEach.call(linee, function(l){ l.style.transition=""; l.style.strokeDasharray=""; l.style.strokeDashoffset=""; });
      Array.prototype.forEach.call(ets,   function(e){ e.style.transition=""; e.style.opacity=""; e.style.transform=""; });
      Array.prototype.forEach.call(dots,  function(d){ d.style.transition=""; d.style.transform=""; d.style.opacity=""; d.style.animation=""; });
      if(cb) cb();
    }, DUR+140);
  }
}
/* le voci dei talenti scelti (origine + normali, in ordine): solo nome + benefici,
   per l'elenco rapido della pagina Retro */
function vociTalenti(){
  var out=[], t=state.talenti||{};
  (t.origine||[]).concat(t.normali||[]).forEach(function(id){
    var x=talentoById(id); if(!x) return;
    out.push({ nome:x.nome||"Senza nome", desc:x.benefici||"" });
  });
  return out;
}
/* l'ELENCO a tendina della pagina Retro: tutte le voci scelte, divise per fonte
   (Razza, Talenti, Classe, Sottoclasse, Estasi). Riusa la fisarmonica dei pop-up. */
function elencoRetroHtml(){
  function gruppo(tit, voci, vuoto){
    var n = voci ? voci.length : 0;
    var corpo = n ? fisarmonicaHtml(voci) : '<div class="acc-vuoto">'+esc(vuoto)+'</div>';
    return '<section class="he-gruppo"><h3 class="he-tit">'+esc(tit)+' <span class="he-cont">'+n+'</span></h3>'+corpo+'</section>';
  }
  var cls=vociClasse();
  var base=cls.filter(function(v){ return !v.sub; });
  var sub=cls.filter(function(v){ return v.sub; });
  return gruppo("Tratti di Razza", vociRazza(), "Nessun tratto: scegli una razza nel Grimorio.")
    + gruppo("Talenti", vociTalenti(), "Nessun talento scelto.")
    + gruppo("Classe", base, "Scegli una classe nella scheda.")
    + gruppo("Sottoclasse", sub, "Nessuna sottoclasse scelta (o non ancora al livello giusto).")
    + gruppo("Estasi ed Anedonie", [], "In arrivo.");
}

function renderRetroHub(){
  var img=document.getElementById("hubImg"), vuoto=document.getElementById("hubVuoto"),
      punti=document.getElementById("hubPunti"), mob=document.getElementById("hubMobile");
  if(!img||!punti) return;
  var src=immagineClasse();   // l'immagine segue la classe scelta in pagina 1
  if(!src){
    // niente classe (o classe senza immagine): mostro il messaggio, niente richiami
    img.hidden=true; img.removeAttribute("src");
    if(vuoto){ vuoto.hidden=false; vuoto.textContent = (state.classes && state.classes.length)
      ? "Immagine in arrivo per questa classe." : "Scegli una classe nella scheda per vederne l’illustrazione e i privilegi."; }
    punti.style.display="none"; if(mob) mob.style.display="none";
    var svg=document.getElementById("hubLines"); if(svg) svg.innerHTML="";
    return;
  }
  if(img.getAttribute("src")!==src){
    img.setAttribute("src", src);
    img.onload=posizionaHub;
    img.onerror=function(){ img.hidden=true; if(vuoto){ vuoto.hidden=false; vuoto.textContent="Immagine della classe non trovata ("+src+")."; } };
  }
  img.hidden=false; if(vuoto) vuoto.hidden=true;
  punti.style.display=""; if(mob) mob.style.display="";
  var pts=puntiHub(), sub=sottoclasseVisibile();
  var h="";
  pts.forEach(function(a,i){
    h += '<button class="hub-punto" type="button" data-fonte="'+a.id+'" data-pt="'+i+'" aria-label="'+esc(a.label)+'"><span class="hp-dot"></span></button>';
    if(a.id==="classe" && a.label2 && sub){
      // dal livello 3: due etichette separate (la linea si biforca)
      h += '<button class="hub-et lato-'+a.lato+'" type="button" data-fonte="classe" data-pt="'+i+'" data-sub="0">'+esc(a.label)+'</button>';
      h += '<button class="hub-et lato-'+a.lato+'" type="button" data-fonte="classe" data-pt="'+i+'" data-sub="1">'+esc(a.label2)+'</button>';
    } else {
      h += '<button class="hub-et lato-'+a.lato+'" type="button" data-fonte="'+a.id+'" data-pt="'+i+'">'+esc(a.label)+'</button>';
    }
  });
  punti.innerHTML=h;
  if(mob) mob.innerHTML = pts.map(function(a){
    var t = (a.id==="classe" && a.label2) ? (sub ? esc(a.label)+" / "+esc(a.label2) : esc(a.label)) : esc(a.label);
    return '<button class="hub-mbtn" type="button" data-fonte="'+a.id+'">'+t+'</button>';
  }).join("");
  posizionaHub();
}
/* la Sottoclasse compare solo dal livello 3 (della classe primaria) */
function sottoclasseVisibile(){ var c=state.classes && state.classes[0]; return !!(c && (c.level||0)>=3); }
/* un richiamo a GOMITO: dal pallino un tratto verticale fino all'altezza della
   parola, poi orizzontale fino alla parola */
function gomitoHtml(px,py,ex,ey,id){
  return '<polyline points="'+px.toFixed(1)+','+py.toFixed(1)+' '+px.toFixed(1)+','+ey.toFixed(1)+' '+ex.toFixed(1)+','+ey.toFixed(1)+'" class="hub-linea" data-fonte="'+id+'"/>';
}
/* colloca pallini, parole e linee in base a dove sta DAVVERO l'immagine, così
   restano incollati ai punti a qualsiasi dimensione (richiamato anche al resize).
   La classe dal liv.3 ha DUE parole (Classe/Sottoclasse) e la linea si BIFORCA. */
function posizionaHub(){
  var stage=document.getElementById("hubStage"), img=document.getElementById("hubImg"),
      svg=document.getElementById("hubLines"), punti=document.getElementById("hubPunti");
  if(!stage||!img||!svg||!punti || img.hidden){ if(svg) svg.innerHTML=""; return; }
  var sr=stage.getBoundingClientRect(), ir=img.getBoundingClientRect();
  if(!ir.width || !ir.height) return;   // immagine non ancora misurabile
  var ox=ir.left-sr.left, oy=ir.top-sr.top;
  svg.setAttribute("viewBox","0 0 "+Math.round(sr.width)+" "+Math.round(sr.height));
  var pts=puntiHub(), dots=punti.querySelectorAll(".hub-punto");
  // pallini per punto
  var dp=pts.map(function(a,i){
    var px=ox+(a.ax/100)*ir.width, py=oy+(a.ay/100)*ir.height;
    var dot=dots[i]; if(dot){ dot.style.left=px+"px"; dot.style.top=py+"px"; }
    return { a:a, px:px, py:py };
  });
  // voci-etichetta (la classe dal liv.3 = due voci sullo stesso pallino)
  var items=[];
  pts.forEach(function(a,i){
    if(a.id==="classe" && a.label2 && sottoclasseVisibile()){
      var e0=punti.querySelector('.hub-et[data-pt="'+i+'"][data-sub="0"]');
      var e1=punti.querySelector('.hub-et[data-pt="'+i+'"][data-sub="1"]');
      var hh=(e0&&e0.offsetHeight)||30;
      items.push({el:e0, side:a.lato, dp:dp[i], dy:dp[i].py-hh/2-3, fork:"top"});
      items.push({el:e1, side:a.lato, dp:dp[i], dy:dp[i].py+hh/2+3, fork:"bot"});
    } else {
      items.push({el:punti.querySelector('.hub-et[data-pt="'+i+'"]'), side:a.lato, dp:dp[i], dy:dp[i].py, fork:null});
    }
  });
  // diradamento per lato (le due della classe stanno vicine tra loro)
  ["sx","dx"].forEach(function(lato){
    var grp=items.filter(function(o){ return o.side===lato; });
    grp.sort(function(A,B){ return A.dy-B.dy; });
    var prevB=-1e9;
    grp.forEach(function(o){
      var h=(o.el&&o.el.offsetHeight)||30, gap=(o.fork==="bot"?4:16), y=o.dy;
      if(y-h/2 < prevB+gap) y=prevB+gap+h/2;
      y=Math.max(h/2+2, Math.min(sr.height-h/2-2, y));
      o.ly=y; prevB=y+h/2;
    });
  });
  // colloco le parole
  items.forEach(function(o){ var e=o.el; if(!e) return; e.style.top=o.ly+"px";
    if(o.side==="sx"){ e.style.left="0px"; e.style.right="auto"; } else { e.style.right="0px"; e.style.left="auto"; }
  });
  // disegno le linee (rileggo i rect dopo il collocamento)
  var linee="", pair=[];
  items.forEach(function(o){
    if(o.fork){ pair.push(o); return; }
    var e=o.el; if(!e) return; var er=e.getBoundingClientRect();
    var ex=(o.side==="sx")?(er.right-sr.left):(er.left-sr.left);
    var ey=(er.top-sr.top)+er.height/2;
    linee += gomitoHtml(o.dp.px, o.dp.py, ex, ey, o.dp.a.id);
  });
  if(pair.length===2){
    var T=pair[0].fork==="top"?pair[0]:pair[1], B=pair[0].fork==="bot"?pair[0]:pair[1];
    var side=T.side, P=T.dp, rT=T.el.getBoundingClientRect(), rB=B.el.getBoundingClientRect();
    var LX=(side==="sx")?(rT.right-sr.left):(rT.left-sr.left);
    var y1=(rT.top-sr.top)+rT.height/2, y2=(rB.top-sr.top)+rB.height/2, midY=(y1+y2)/2;
    var jx=LX+(side==="sx"?22:-22);   // giunzione della biforcazione, verso il pallino
    function L(x1,yy1,x2,yy2){ return '<line x1="'+x1.toFixed(1)+'" y1="'+yy1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+yy2.toFixed(1)+'" class="hub-linea" data-fonte="classe"/>'; }
    linee += L(jx,y1,jx,y2) + L(jx,y1,LX,y1) + L(jx,y2,LX,y2);           // graffa verticale + due stub
    linee += '<polyline points="'+P.px.toFixed(1)+','+P.py.toFixed(1)+' '+P.px.toFixed(1)+','+midY.toFixed(1)+' '+jx.toFixed(1)+','+midY.toFixed(1)+'" class="hub-linea" data-fonte="classe"/>';
  }
  svg.innerHTML=linee;
}
function evidenziaFonte(id, on){
  var punti=document.getElementById("hubPunti"), svg=document.getElementById("hubLines");
  if(punti) punti.querySelectorAll('[data-fonte="'+id+'"]').forEach(function(el){ el.classList.toggle("acceso", on); });
  if(svg) svg.querySelectorAll('[data-fonte="'+id+'"]').forEach(function(l){ l.classList.toggle("acceso", on); });
}

/* --- il pop-up di una fonte --- */
var privFonte=null;
function apriPriv(fonte){
  var m=document.getElementById("modalPriv"), tit=document.getElementById("privTit"), body=document.getElementById("privBody");
  if(!m||!body) return;
  privFonte=fonte;
  var titoli={ talenti:"Talenti", classe:"Classe e Sottoclasse", razza:"Tratti di Razza", estasi:"Estasi ed Anedonie" };
  if(tit) tit.textContent=titoli[fonte]||"Privilegi";
  if(fonte==="talenti"){
    body.innerHTML='<div class="taltab" id="taltab"></div>';
    renderTaltab();
  } else {
    body.innerHTML=fisarmonicaHtml(vociFonte(fonte), messaggioVuoto(fonte));
  }
  m.hidden=false;
}
function messaggioVuoto(fonte){
  if(fonte==="classe"){
    if(!(state.classes||[]).length) return "Scegli una classe per vederne i privilegi.";
    // se ci sono già privilegi da mostrare NON metto nessuna nota (sarebbe sopra
    // la fisarmonica); il messaggio serve solo quando la lista è vuota
    if(vociClasse().length) return "";
    return privilegiCaricati
      ? "I privilegi di questa classe non sono ancora stati inseriti dallo staff."
      : "Carico i privilegi…";
  }
  if(fonte==="razza")  return state.razza ? "" : "Scegli una razza per vederne i tratti.";
  if(fonte==="estasi") return "Estasi e Anedonie sono 4 slot legati ai lobi (frontale, parietale, temporale, occipitale). Le impostano solo i master.";
  return "";
}
/* le voci della fisarmonica per ogni fonte. La RAZZA legge i tratti veri dal
   grimorio (razza scelta); CLASSE/SOTTOCLASSE aspettano ancora la loro tabella
   dati dello staff; le ESTASI le mettono solo i master. */
function vociFonte(fonte){
  if(fonte==="razza")  return vociRazza();
  if(fonte==="classe") return vociClasse();
  return [];   // estasi: solo master → mostro il messaggio
}
/* I privilegi delle classi del personaggio, presi dalla tabella staff, fino al
   livello raggiunto in ciascuna classe. Per ora solo la classe base (le capacità
   di sottoclasse arrivano col prossimo mattone). Nel multiclasse prefisso il nome
   della classe così si capisce da dove viene ogni voce. */
function vociClasse(){
  var cls = state.classes||[];
  if(!cls.length) return [];
  var multi = cls.length>1;
  var voci=[];
  cls.forEach(function(c){
    var liv = c.level||1;
    var subId = state.sottoclassi && state.sottoclassi[c.key];
    var priv = PRIVILEGI.filter(function(p){
      if(p.classe!==c.key || (p.livello||1)>liv) return false;
      if(!p.sottoclasse_id) return true;                 // privilegio di classe base
      return subId && p.sottoclasse_id===subId;          // privilegio della sottoclasse scelta
    }).sort(function(a,b){
      return (a.livello||1)-(b.livello||1)
        || ((a.sottoclasse_id?1:0)-(b.sottoclasse_id?1:0))   // a parità di livello, prima la base
        || (a.ordine||0)-(b.ordine||0);
    });
    var nomeCl = (BY_KEY[c.key] && BY_KEY[c.key].name) || c.key;
    priv.forEach(function(p){
      voci.push({ liv:p.livello, nome:(multi ? nomeCl+" — " : "")+(p.nome||""), desc:p.descrizione||"", sub:!!p.sottoclasse_id });
    });
  });
  return voci;
}
/* le sottoclassi di una classe (dalla tabella staff), ordinate */
function sottoclassiClasse(key){
  return SOTTOCLASSI.filter(function(s){ return s.classe===key; })
    .sort(function(a,b){ return (a.ordine||0)-(b.ordine||0) || String(a.nome||"").localeCompare(String(b.nome||"")); });
}
/* a che livello questa classe sceglie la sottoclasse (dal dato; default 3) */
function livelloScelta(key){
  var s=sottoclassiClasse(key)[0];
  return (s && s.livello_scelta) ? s.livello_scelta : 3;
}
/* una classe del personaggio può scegliere la sottoclasse ora? (livello raggiunto
   e almeno una sottoclasse esiste nella tabella) */
function classeEleggibileSott(key){
  var c=(state.classes||[]).filter(function(x){ return x.key===key; })[0];
  if(!c) return false;
  return (c.level||0) >= livelloScelta(key) && sottoclassiClasse(key).length>0;
}
/* I tratti della razza scelta, presi dal grimorio: un pannello a fisarmonica per
   ogni campo meccanico compilato. Niente livello (i tratti di razza non scalano). */
function vociRazza(){
  var r = state.razza ? razzaById(state.razza) : null;
  if(!r) return [];
  function pieno(v){ return (v!=null && String(v).trim()!==""); }
  var voci=[];
  if(pieno(r.velocita))     voci.push({ nome:"Velocità di movimento", desc:String(r.velocita) });
  if(pieno(r.scurovisione)) voci.push({ nome:"Scurovisione",          desc:String(r.scurovisione) });
  if(pieno(r.abilita))      voci.push({ nome:"Abilità di razza",       desc:String(r.abilita) });
  if(pieno(r.incantesimi))  voci.push({ nome:"Incantesimi di razza",   desc:String(r.incantesimi) });
  if(pieno(r.dimensioni))   voci.push({ nome:"Dimensioni",             desc:String(r.dimensioni) });
  if(pieno(r.tipologia))    voci.push({ nome:"Tipologia",              desc:String(r.tipologia) });
  if(pieno(r.lingue))       voci.push({ nome:"Lingue",                 desc:String(r.lingue) });
  return voci;
}
function fisarmonicaHtml(voci, vuoto){
  if(!voci || !voci.length) return '<div class="acc-vuoto">'+esc(vuoto||"Ancora niente qui.")+'</div>';
  var testa = vuoto ? '<div class="acc-nota">'+esc(vuoto)+'</div>' : '';
  return testa+'<div class="acc">'+voci.map(function(v){
    var liv=v.liv?'<span class="acc-liv">'+esc(String(v.liv))+'&deg;</span> ':'';
    return '<div class="acc-riga">'
      + '<button class="acc-cap" type="button">'+liv+'<span class="acc-nome">'+esc(v.nome||"")+'</span><span class="acc-frec" aria-hidden="true">&rsaquo;</span></button>'
      + '<div class="acc-corpo"><div class="acc-testo">'+esc(v.desc||"")+'</div></div>'
      + '</div>';
  }).join("")+'</div>';
}

/* --- la tabella dei talenti (aggiungi/togli/+1), ora DENTRO il pop-up Talenti --- */
function taltabHtml(){
  var orig=state.talenti.origine, norm=state.talenti.normali, maxO=slotOrigine(), html="";
  html += '<div class="tt-sechead">Talento Origine</div>';
  if(orig.length>maxO && (razzeCaricate || !state.razza))
    html += '<div class="tt-avviso">Hai pi&ugrave; talenti d&rsquo;origine di quanti la tua razza ne consenta ('+maxO+'). Togline '+(orig.length-maxO)+'.</div>';
  for(var i=0;i<orig.length;i++) html += rigaTalentoRetro(orig[i],"origine",i);
  if(!soloLettura && orig.length<maxO)
    html += rigaAggiungi("origine", orig.length ? "Aggiungi un altro talento d&rsquo;origine" : "Scegli il talento d&rsquo;origine");
  else if(soloLettura && !orig.length) html += '<div class="tt-row tt-empty">Nessun talento d&rsquo;origine.</div>';
  html += '<div class="tt-sechead">Talento</div>';
  for(var j=0;j<norm.length;j++) html += rigaTalentoRetro(norm[j],"normali",j);
  // i talenti normali (ASI compreso) si prendono dal livello 4; lo staff può forzare
  if(!soloLettura){
    if(totalLevel()>=4 || puoToccareSchede()) html += rigaAggiungi("normale", "Aggiungi un talento");
    else html += '<div class="tt-row tt-empty">I talenti si prendono dal livello 4.</div>';
  }
  else if(!norm.length) html += '<div class="tt-row tt-empty">Nessun talento.</div>';
  html += '<div class="tt-foot"><button class="tt-sfoglia" type="button" data-talbrowse>Sfoglia tutto il mazzo &rsaquo;</button></div>';
  return html;
}
function renderTaltab(){ var b=document.getElementById("taltab"); if(b) b.innerHTML=taltabHtml(); }

/* agganci: clic sui richiami dell'hub → apre la fonte; dentro il pop-up la
   fisarmonica e la gestione dei talenti */
(function(){
  var retro=document.getElementById("pagRetro");
  if(retro){
    retro.addEventListener("click", function(e){
      // l'interruttore Illustrazione/Elenco
      var sw=e.target.closest("[data-retrovista]"); if(sw){ cambiaRetroVista(sw.getAttribute("data-retrovista")); return; }
      // una tendina dell'elenco si apre/chiude
      var cap=e.target.closest(".acc-cap"); if(cap && e.target.closest("#hubElenco")){ cap.parentNode.classList.toggle("aperta"); return; }
      var f=e.target.closest(".hub-punto,.hub-et,.hub-mbtn"); if(f){ apriPriv(f.getAttribute("data-fonte")); }
    });
    retro.addEventListener("mouseover", function(e){ var f=e.target.closest(".hub-punto,.hub-et"); if(f) evidenziaFonte(f.getAttribute("data-fonte"), true); });
    retro.addEventListener("mouseout",  function(e){ var f=e.target.closest(".hub-punto,.hub-et"); if(f) evidenziaFonte(f.getAttribute("data-fonte"), false); });
  }
  var m=document.getElementById("modalPriv");
  if(m){
    m.addEventListener("click", function(e){
      var cap=e.target.closest(".acc-cap"); if(cap){ cap.parentNode.classList.toggle("aperta"); return; }
      var add=e.target.closest("[data-taladdsez]"); if(add){ apriAggiuntaTalento(add.getAttribute("data-taladdsez")); return; }
      var rem=e.target.closest("[data-talrem]"); if(rem){ togliTalento(rem.getAttribute("data-talsez"), rem.getAttribute("data-talrem")); return; }
      if(e.target.closest("[data-talbrowse]")){ openTalenti(); return; }
      var vw=e.target.closest("[data-talview]"); if(vw && !e.target.closest("[data-talasi]")){ apriCartaTalento(vw.getAttribute("data-talview")); }
    });
    m.addEventListener("change", function(e){
      var sl=e.target.closest("select[data-talasi-sez]");
      if(sl){
        var slot=sl.getAttribute("data-talasi-slot");
        if(slot) scegliAsiDistr(sl.getAttribute("data-talasi-sez"), sl.getAttribute("data-talasi-idx"), slot, sl.value);
        else scegliAsiTalento(sl.getAttribute("data-talasi-sez"), sl.getAttribute("data-talasi-idx"), sl.value);
      }
    });
  }
  window.addEventListener("resize", posizionaHub);
})();


/* apre il mazzo in sola consultazione, fermo sulla carta scelta */
function apriCartaTalento(id){
  openTalenti();   // sfoglio (nessuno scopo)
  var lista=talentiFiltrati();
  for(var i=0;i<lista.length;i++){ if(lista[i].id===id){ talIdx=i; break; } }
  disegnaCarta();
}

/* ===== Il pannello nuovo della Classe =====
   Si sceglie l'elemento toccandolo nell'anteprima, e sotto compaiono solo i
   comandi che servono a quell'elemento. */
var sel={};   // sel[dove] = target scelto in quella sezione
var ASP_CONT={
  name: { ant:"antsel_name",  com:"com_name" },
  xp:   { ant:"antsel_xp",    com:"com_xp" },
  class:{ ant:"antep_classe", com:"comandi_classe" },
  razza:{ ant:"antsel_razza", com:"com_razza" },
  stats:{ ant:"antsel_stats", com:"com_stats" },
  prof: { ant:"antsel_prof",  com:"com_prof" },
  ts:   { ant:"antsel_ts",    com:"com_ts" },
  abil: { ant:"antsel_abil",  com:"com_abil" },
  hp:   { ant:"antsel_hp",    com:"com_hp" },
  dif:  { ant:"antsel_dif",   com:"com_dif" },
  align:{ ant:"antsel_align", com:"com_align" }
};
/* Testo e dimensione con cui mostrare ogni scritta nell'anteprima */
var CAMPIONI={
  etNome:{t:"ETICHETTA",cls:"apmid"},
  etLivello:{t:"LIVELLO",cls:"apmid"}, numLv:{t:"7",cls:"apbig"}, txtPE:{t:"prossimo livello",cls:"apsmall"}, numPE:{t:"2.500",cls:"apmid"},
  siglaCar:{t:"FOR",cls:"apmid"}, valCar:{t:"15",cls:"apbig"}, modiCar:{t:"+2",cls:"apmid"},
  etProf:{t:"COMPETENZA",cls:"apmid"}, valProf:{t:"+3",cls:"apbig"},
  siglaTs:{t:"DES",cls:"apmid"}, valTs:{t:"+5",cls:"apbig"},
  nomeAbil:{t:"Furtivit\u00E0",cls:"apmid"}, valAbil:{t:"+7",cls:"apbig"},
  etPP:{t:"PERCEZIONE PASSIVA",cls:"apsmall"}, valPP:{t:"14",cls:"apbig"},
  etPf:{t:"PUNTI FERITA",cls:"apsmall"}, numPf:{t:"27",cls:"apbig"}, maxPf:{t:"31",cls:"apmid"}, tempPf:{t:"+5",cls:"apmid"},
  etDif:{t:"CLASSE ARMATURA",cls:"apsmall"}, valDif:{t:"14",cls:"apbig"},
  etRazza:{t:"RAZZA",cls:"apsmall"}, nomeRazza:{t:"Umano",cls:"apbig"}, tipoRazza:{t:"Umanoide",cls:"apmid"},
  etAlign:{t:"ALLINEAMENTO",cls:"apsmall"}, nomeAlign:{t:"Legale Buono",cls:"apbig"}
};

function targetValido(dove,key){
  if(!key) return false;
  if(dove==="class"){
    if(key==="etClasse"||key==="lvCl") return true;
    if(key.indexOf("sotto:")===0){ var ks=key.slice(6); return state.classes.some(function(c){ return c.key===ks; }) && !!nomeSottoclasse(ks); }
    var k=key.slice(5);
    if(key.indexOf("nome:")===0||key.indexOf("simb:")===0) return state.classes.some(function(c){ return c.key===k; });
    return false;
  }
  return !!(TESTO[key] && TESTO[key].dove===dove);
}
function primoTarget(dove){
  if(dove==="class") return state.classes.length ? "nome:"+state.classes[0].key : "etClasse";
  var f=TESTI.filter(function(x){ return x.dove===dove; })[0];
  return f ? f.id : "";
}
function stileTarget(key){
  if(key.indexOf("nome:")===0) return stileNome(key.slice(5));
  if(key.indexOf("sotto:")===0) return stileSotto(key.slice(6));
  if(key.indexOf("simb:")===0) return simboloDi(key.slice(5));
  return state.testi[key];
}
function kindTarget(key){ return key.indexOf("simb:")===0 ? "symbol" : "text"; }
function metaTarget(dove,key){
  if(dove==="class"){
    if(key==="etClasse") return {nome:"Etichetta"};
    if(key==="lvCl") return {nome:"Livello", sub:"vale per tutte le classi"};
    if(key.indexOf("nome:")===0) return {nome:"Nome", sub:BY_KEY[key.slice(5)].name};
    if(key.indexOf("sotto:")===0) return {nome:"Sottoclasse", sub:nomeSottoclasse(key.slice(6))};
    return {nome:"Simbolo", sub:BY_KEY[key.slice(5)].name, symkey:key.slice(5)};
  }
  return {nome: TESTO[key] ? TESTO[key].nome : key};
}
function stileInline(s){
  var r=risolviTesto(s);
  var st=(r.font?'font-family:'+FONTS[r.font]+';':'')+'color:'+r.colore+';';
  if(r.bold) st+='font-weight:700;';
  if(r.italic) st+='font-style:italic;';
  if(r.underline) st+='text-decoration:underline;';
  if(r.smallcaps) st+='font-variant:small-caps;';
  if(r.neon) st+='text-shadow:0 0 4px '+r.colore+',0 0 9px '+r.colore+',0 0 18px '+r.colore+';';
  return st;
}
/* Ridipinge il foglio in base al tipo di scritta toccata */
function applicaModifiche(key){
  if(key.indexOf("nome:")===0 || key.indexOf("sotto:")===0 || key.indexOf("simb:")===0) applicaClassi(); else applicaTesti();
}
function disegnaAntepSel(dove){
  var host=document.getElementById(ASP_CONT[dove].ant); if(!host) return;
  if(!targetValido(dove, sel[dove])) sel[dove]=primoTarget(dove);
  if(dove==="class"){
    var html='<span class="apet apcls'+(sel.class==="etClasse"?" sel":"")+'" data-ctarget="etClasse" style="'+stileInline(state.testi.etClasse)+'">CLASSE</span>';
    html+='<div class="aprowcls">';
    if(!state.classes.length){
      html+='<span class="apnone">Scegli una classe dalla ruota per poterla stilizzare.</span>';
    } else {
      state.classes.forEach(function(c,i){
        if(i) html+='<span class="apdiv"></span>';
        var sy=simboloDi(c.key);
        var sub=nomeSottoclasse(c.key);
        var nomeBlocco='<span class="apcnwrap">'
          +'<span class="apcn apcls'+(sel.class==="nome:"+c.key?" sel":"")+'" data-ctarget="nome:'+c.key+'" style="'+stileInline(stileNome(c.key))+'">'+esc(BY_KEY[c.key].name)+'</span>'
          +(sub?'<span class="apcsub apcls'+(sel.class==="sotto:"+c.key?" sel":"")+'" data-ctarget="sotto:'+c.key+'" style="'+stileInline(stileSotto(c.key))+'">'+esc(sub)+'</span>':'')
          +'</span>';
        html+='<span class="apone">'
          +'<span class="apce apcls'+(sel.class==="simb:"+c.key?" sel":"")+'" data-ctarget="simb:'+c.key+'" style="color:'+sy.colore+';'+(sy.neon?"filter:drop-shadow(0 0 3px "+sy.colore+") drop-shadow(0 0 7px "+sy.colore+");":"")+'">'+emblemSVG(c.key)+'</span>'
          +nomeBlocco
          +'<span class="apcl apcls'+(sel.class==="lvCl"?" sel":"")+'" data-ctarget="lvCl" style="'+stileInline(state.testi.lvCl)+'">'+c.level+'</span>'
          +'</span>';
      });
    }
    html+='</div>';
    host.innerHTML=html;
    return;
  }
  // sezioni a sole scritte: fila di campioni toccabili
  var quali=TESTI.filter(function(x){ return x.dove===dove; });
  var inner=quali.map(function(t){
    var camp=CAMPIONI[t.id]||{t:t.nome,cls:"apmid"};
    return '<span class="apcls '+camp.cls+(sel[dove]===t.id?" sel":"")+'" data-ctarget="'+t.id+'" style="'+stileInline(state.testi[t.id])+'">'+esc(camp.t)+'</span>';
  }).join("");
  host.innerHTML='<div class="aprowsel">'+inner+'</div>';
}
function lockBtn(quale, on){
  return '<button type="button" class="clock'+(on?" on":"")+'" data-clock="'+quale+'">'
    +'<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11 V8 a4 4 0 0 1 8 0 v3"/></svg>'
    +(on?"segue il nome":"nome")+'</button>';
}
function costruisciComandi(dove){
  var host=document.getElementById(ASP_CONT[dove].com); if(!host) return;
  if(!targetValido(dove, sel[dove])) sel[dove]=primoTarget(dove);
  var key=sel[dove], kind=kindTarget(key), meta=metaTarget(dove,key), s=stileTarget(key);
  host.innerHTML="";
  if(!key){ host.innerHTML='<p class="csub">Niente da personalizzare qui.</p>'; return; }

  var head=document.createElement("div"); head.className="editnow";
  var badge = kind==="symbol" ? '<span class="cbadge">'+emblemSVG(meta.symkey)+'</span>' : '';
  head.innerHTML='<div class="editlab">Stai modificando</div><div class="editrow">'+badge
    +'<div><div class="cwhat">'+meta.nome+'</div>'+(meta.sub?'<div class="csub">'+esc(meta.sub)+'</div>':'')+'</div></div>';
  host.appendChild(head);

  if(kind==="symbol"){
    var c1=document.createElement("div"); c1.className="cctl"; c1.innerHTML='<span class="clab">Colore</span><div class="picker cpk"></div>'; host.appendChild(c1);
    var c2=document.createElement("div"); c2.className="cctl"; c2.innerHTML='<span class="clab">Neon</span><span class="ctoggle"><button type="button" data-cneon="off">Spento</button><button type="button" data-cneon="on">Acceso</button></span>'; host.appendChild(c2);
    var c3=document.createElement("div"); c3.innerHTML='<button type="button" class="cbig" id="cUnifSimb">Uniforma tutti i simboli a questo</button>'; host.appendChild(c3);
    makePicker(c1.querySelector(".cpk"), s.colore, function(hex){ s.colore=hex; applicaClassi(); disegnaAntepSel(dove); aggiornaSalva(); });
    c2.querySelectorAll("[data-cneon]").forEach(function(b){
      b.classList.toggle("on",(b.getAttribute("data-cneon")==="on")===s.neon);
      b.onclick=function(){ s.neon=b.getAttribute("data-cneon")==="on"; applicaClassi(); disegnaAntepSel(dove); costruisciComandi(dove); aggiornaSalva(); };
    });
    document.getElementById("cUnifSimb").onclick=function(){ state.classes.forEach(function(c){ var t=simboloDi(c.key); t.colore=s.colore; t.neon=s.neon; }); applicaClassi(); disegnaAntepSel(dove); aggiornaSalva(); };
    return;
  }

  var perNome = key.indexOf("nome:")===0, perSotto = key.indexOf("sotto:")===0;
  var rF=document.createElement("div"); rF.className="cctl"+(s.legaFont?" locked":"");
  rF.innerHTML='<span class="clab">Font</span><select class="cfont"></select>'+lockBtn("font",s.legaFont); host.appendChild(rF);
  var fsel=rF.querySelector(".cfont");
  var o0=document.createElement("option"); o0.value=""; o0.textContent="Come adesso"; fsel.appendChild(o0);
  FONT_GROUPS.forEach(function(g){ var og=document.createElement("optgroup"); og.label=g[0];
    g[1].forEach(function(f){ var x=document.createElement("option"); x.value=f[0]; x.textContent=f[1]; x.style.fontFamily=f[2]; og.appendChild(x); }); fsel.appendChild(og); });
  fsel.value=s.font; fsel.disabled=s.legaFont;
  fsel.onchange=function(){ s.font=fsel.value; applicaModifiche(key); disegnaAntepSel(dove); aggiornaSalva(); };

  var rC=document.createElement("div"); rC.className="cctl"+(s.legaColore?" locked":"");
  rC.innerHTML='<span class="clab">Colore</span><div class="picker cpk"></div>'+lockBtn("colore",s.legaColore); host.appendChild(rC);
  makePicker(rC.querySelector(".cpk"), s.legaColore?state.nameColor:s.colore, function(hex){ if(s.legaColore) return; s.colore=hex; applicaModifiche(key); disegnaAntepSel(dove); aggiornaSalva(); });

  var eff=risolviTesto(s);
  var fmts=[["bold","G"],["italic","C"],["underline","S"],["smallcaps","ab"],["neon","\u2726"]];
  var rM=document.createElement("div"); rM.className="cctl"+(s.legaFmt?" locked":"");
  rM.innerHTML='<span class="clab">Formato</span><span class="cfmt">'
    +fmts.map(function(f){ return '<button type="button" data-cf="'+f[0]+'"'+(eff[f[0]]?' class="on"':'')+'>'+f[1]+'</button>'; }).join("")
    +'</span>'+lockBtn("fmt",s.legaFmt); host.appendChild(rM);

  if(perNome){
    var rU=document.createElement("div"); rU.innerHTML='<button type="button" class="cbig" id="cUnifNomi">Uniforma tutti i nomi a questo</button>'; host.appendChild(rU);
    document.getElementById("cUnifNomi").onclick=function(){ state.classes.forEach(function(c){ var t=stileNome(c.key); for(var kk in DEF_NOMECL) t[kk]=s[kk]; }); applicaClassi(); disegnaAntepSel(dove); aggiornaSalva(); };
  } else if(perSotto){
    var rUs=document.createElement("div"); rUs.innerHTML='<button type="button" class="cbig" id="cUnifSotto">Uniforma tutte le sottoclassi a questa</button>'; host.appendChild(rUs);
    document.getElementById("cUnifSotto").onclick=function(){ state.classes.forEach(function(c){ if(!nomeSottoclasse(c.key)) return; var t=stileSotto(c.key); for(var kk in DEF_NOMECL) t[kk]=s[kk]; }); applicaClassi(); disegnaAntepSel(dove); aggiornaSalva(); };
  }

  rM.querySelectorAll(".cfmt [data-cf]").forEach(function(b){
    b.onclick=function(){ if(s.legaFmt) return; var k=b.getAttribute("data-cf"); s[k]=!s[k]; applicaModifiche(key); disegnaAntepSel(dove); costruisciComandi(dove); aggiornaSalva(); };
  });
  host.querySelectorAll("[data-clock]").forEach(function(b){
    b.onclick=function(){ var q=b.getAttribute("data-clock");
      if(q==="font") s.legaFont=!s.legaFont; else if(q==="colore") s.legaColore=!s.legaColore; else s.legaFmt=!s.legaFmt;
      applicaModifiche(key); disegnaAntepSel(dove); costruisciComandi(dove); aggiornaSalva(); };
  });
}
/* Le parti proprie di una finestra (grafico + illumina delle caratteristiche) */
function sincronizzaExtra(dove){
  if(dove==="stats"){
    setActive("data-evid", state.statsEvid?"on":"off");
    setActive("data-transiz", state.transizione);
    if(typeof statsPicker!=="undefined" && statsPicker){ statsFermo=true; try{ statsPicker.setHex(state.statsColor); } finally{ statsFermo=false; } }
  }
  if(dove==="ts"){
    if(typeof tsCompPicker!=="undefined" && tsCompPicker){
      tsFermo=true;
      try{ tsCompPicker.setHex(coloreTsComp()); tsDadoPicker.setHex(coloreTsDado()); }
      finally{ tsFermo=false; }
    }
  }
  if(dove==="abil"){
    if(typeof abilCarPicker!=="undefined" && abilCarPicker){
      var menuCar=document.getElementById("abilCarSel");
      abilFermo=true;
      try{ abilCarPicker.setHex(colCar((menuCar&&menuCar.value)||"for")); } finally{ abilFermo=false; }
    }
  }
  if(dove==="hp"){
    if(typeof hpPienoPicker!=="undefined" && hpPienoPicker){
      hpFermo=true;
      try{ hpPienoPicker.setHex(state.hpColorPieno); hpFeritoPicker.setHex(state.hpColorFerito); hpCriticoPicker.setHex(state.hpColorCritico); }
      finally{ hpFermo=false; }
    }
  }
  if(dove==="dif"){
    if(typeof difIcoPicker!=="undefined" && difIcoPicker){
      difFermo=true;
      try{ difIcoPicker.setHex(state.difIcoColor); } finally{ difFermo=false; }
    }
  }
}
function sincronizzaSel(dove){ disegnaAntepSel(dove); costruisciComandi(dove); sincronizzaExtra(dove); }
function sincronizzaClasse(){ sincronizzaSel("class"); }   // alias, la finestra Classe lo chiama ancora
/* Quale finestra estetica e' aperta ora (o null) */
function apertaAspetto(){
  if(!personalizza) return null;
  if(typeof modalName!=="undefined"  && modalName  && !modalName.hidden)  return "name";
  if(typeof modalXp!=="undefined"    && modalXp    && !modalXp.hidden)    return "xp";
  if(typeof modalClass!=="undefined" && modalClass && !modalClass.hidden) return "class";
  var mrza=document.getElementById("modalRazzaAsp"); if(mrza && !mrza.hidden) return "razza";
  var ms=document.getElementById("modalStats"); if(ms && !ms.hidden) return "stats";
  if(typeof modalProf!=="undefined" && modalProf && !modalProf.hidden) return "prof";
  var mt=document.getElementById("modalTs"); if(mt && !mt.hidden) return "ts";
  var ma=document.getElementById("modalAbil"); if(ma && !ma.hidden) return "abil";
  var mh=document.getElementById("modalHp"); if(mh && !mh.hidden) return "hp";
  var md=document.getElementById("modalDif"); if(md && !md.hidden) return "dif";
  var mal=document.getElementById("modalAlign"); if(mal && !mal.hidden) return "align";
  return null;
}
(function(){
  ["name","xp","class","razza","stats","prof","ts","abil","hp","dif","align"].forEach(function(dove){
    var ap=document.getElementById(ASP_CONT[dove].ant);
    if(ap) ap.addEventListener("click", function(e){
      var t=e.target.closest("[data-ctarget]"); if(!t) return;
      sel[dove]=t.getAttribute("data-ctarget"); disegnaAntepSel(dove); costruisciComandi(dove);
    });
  });
})();
/* Prende il font e il colore buoni per una scritta: i suoi, oppure quelli
   del nome se l'aggancio e' acceso. */
function fontDi(id){ var s=state.testi[id]; var k = s.legaFont ? state.font : s.font; return k ? FONTS[k] : ""; }
function coloreDi(id){ var s=state.testi[id]; return s.legaColore ? state.nameColor : s.colore; }

/* Dipinge tutte le scritte. Va richiamata ogni volta che una parte della
   scheda viene ridisegnata, perche' i pezzi nuovi nascono senza stile. */
function applicaTesti(){
  TESTI.forEach(function(t){
    var f=fontDi(t.id), c=coloreDi(t.id), fm=fmtDi(t.id);
    var lista=document.querySelectorAll(t.sel);
    for(var i=0;i<lista.length;i++){
      var el=lista[i], svg=(el.namespaceURI==="http://www.w3.org/2000/svg");
      el.style.fontFamily=f;   // vuoto = torna quello del foglio di stile
      // le scritte SVG colorano con "fill", quelle HTML con "color"
      el.style.color=c; el.style.fill=c;
      el.style.fontWeight = fm.bold ? "700" : "";
      el.style.fontStyle  = fm.italic ? "italic" : "";
      el.style.fontVariant= fm.smallcaps ? "small-caps" : "";
      // il sottolineato: in SVG e' text-decoration sul testo, funziona uguale
      el.style.textDecoration = fm.underline ? "underline" : "";
      // il neon: un alone dello stesso colore. Sull'SVG con drop-shadow, sull'HTML con text-shadow.
      if(fm.neon){
        if(svg) el.style.filter = "drop-shadow(0 0 3px "+c+") drop-shadow(0 0 7px "+c+")";
        else el.style.textShadow = "0 0 4px "+c+",0 0 9px "+c+",0 0 18px "+c;
      } else {
        el.style.filter=""; el.style.textShadow="";
      }
    }
  });
  dipingiSaluteHp();     // barra e numero PF secondo la salute
  aggiornaMortalita();   // e la sbiadita/il banner/il teschio se sei a terra
}

function renderAll(){ markWheel(); renderChosen(); renderPanel(); renderAlign(); renderAlignDialog(); renderRazzaPanel(); renderRetro(); renderLevel(); renderXpDialog();
  renderProfDialog(); renderStats(); renderStatsDialog(); renderTs(); renderTsDialog(); renderAbil(); renderAbilDialog();
  renderHp(); renderHpDialog(); renderDif(); renderDifDialog(); apply(); setHub(null);
  var _dr=apertaAspetto(); if(_dr) sincronizzaSel(_dr); }

FONT_GROUPS.forEach(function(g){
  var og=document.createElement("optgroup"); og.label=g[0];
  g[1].forEach(function(f){ var o=document.createElement("option"); o.value=f[0]; o.textContent=f[1]; o.style.fontFamily=f[2]; og.appendChild(o); });
  elFont.appendChild(og);
});
(function(){
  var o1=document.createElement("option"); o1.value="auto"; o1.textContent="Automatico (segue la classe)"; elEmblem.appendChild(o1);
  var o2=document.createElement("option"); o2.value="none"; o2.textContent="Nessuno"; elEmblem.appendChild(o2);
  var og=document.createElement("optgroup"); og.label="Scelta manuale";
  CLASSES.forEach(function(c){ var o=document.createElement("option"); o.value=c.key; o.textContent=c.name; og.appendChild(o); });
  elEmblem.appendChild(og);
})();

function disegnaAntepBar(){
  var host=document.getElementById("antepBar"); if(!host) return;
  host.innerHTML =
    '<div class="aplab">Anteprima della barra</div>'
    + '<div class="apbarwrap"><div class="apbarfill" style="width:64%;background:'+xpFillStyle()+'"></div></div>';
}

function uniforma(cosa, acceso){
  TESTI.forEach(function(t){
    if(cosa==="tutto"||cosa==="font") state.testi[t.id].legaFont=acceso;
    if(cosa==="tutto"||cosa==="colore") state.testi[t.id].legaColore=acceso;
    if(cosa==="tutto"||cosa==="fmt") state.testi[t.id].legaFmt=acceso;
  });
  for(var key in state.nomiClasse){ var n=state.nomiClasse[key];
    if(cosa==="tutto"||cosa==="font") n.legaFont=acceso;
    if(cosa==="tutto"||cosa==="colore") n.legaColore=acceso;
    if(cosa==="tutto"||cosa==="fmt") n.legaFmt=acceso;
  }
  applicaTesti(); applicaClassi();
  var _du=apertaAspetto(); if(_du) sincronizzaSel(_du);
  aggiornaSalva();
}

var modalName=document.getElementById("modalName"), modalClass=document.getElementById("modalClass"),
    modalXp=document.getElementById("modalXp"), modalProf=document.getElementById("modalProf");
function positionDialog(dlg){
  var b=elHeader.getBoundingClientRect().bottom;
  dlg.style.top=Math.round(b+16)+"px";
  dlg.style.maxHeight="calc(100dvh - "+Math.round(b+36)+"px)";
}
function openName(){
  if(!personalizza) return;   // e' tutta estetica: esiste solo in quella fase
  modalName.hidden=false; elHeader.classList.add("raised"); positionDialog(document.getElementById("dialogName"));
  sincronizzaSel("name");
}
/* Solo la finestra del Nome tiene la barra del nome nitida sopra la sfocatura:
   lì serve vedere le modifiche mentre si fanno. Le altre la lasciano sotto. */
function openClass(){ modalClass.hidden=false; chiudiSottoclassi(true); setHub(null); if(personalizza) sincronizzaClasse(); }

/* ===== SCELTA DELLA SOTTOCLASSE — la ruota dentro la finestra della classe =====
   Si entra cliccando la propria classe quando ha raggiunto il livello. La ruota
   delle classi resta "parcheggiata" a sinistra (mini, classe scelta in evidenza);
   al centro una ruota che gira con le sottoclassi (solo la in-primo-piano ha il
   nome, al centro: niente sovrapposizioni); a destra i dettagli e "Scegli". */
var subKey=null, subList=[], subFocus=0;
var SUB_CX=200, SUB_CY=200, SUB_RO=180, SUB_RI=64;
function subPolar(r,deg){ var a=deg*Math.PI/180; return [SUB_CX+r*Math.cos(a), SUB_CY+r*Math.sin(a)]; }
function subSector(a0,a1){
  var p0=subPolar(SUB_RO,a0), p1=subPolar(SUB_RO,a1), p2=subPolar(SUB_RI,a1), p3=subPolar(SUB_RI,a0);
  var large=(a1-a0)>180?1:0;
  return "M"+p0[0].toFixed(1)+" "+p0[1].toFixed(1)
    +"A"+SUB_RO+" "+SUB_RO+" 0 "+large+" 1 "+p1[0].toFixed(1)+" "+p1[1].toFixed(1)
    +"L"+p2[0].toFixed(1)+" "+p2[1].toFixed(1)
    +"A"+SUB_RI+" "+SUB_RI+" 0 "+large+" 0 "+p3[0].toFixed(1)+" "+p3[1].toFixed(1)+"Z";
}
function livelliSott(id){
  var lv={}; PRIVILEGI.forEach(function(p){ if(p.sottoclasse_id===id) lv[p.livello||0]=1; });
  return Object.keys(lv).map(Number).sort(function(a,b){return a-b;});
}
function apriSottoclassi(key){
  if(!classeEleggibileSott(key)) return;
  subKey=key; subList=sottoclassiClasse(key);
  var scelto=state.sottoclassi[key];
  subFocus=0;
  for(var i=0;i<subList.length;i++){ if(subList[i].id===scelto){ subFocus=i; break; } }
  // sfondo illustrato della classe (idea 1)
  var illo=document.getElementById("svIllo"), img=immagineClasseKey(key);
  illo.style.backgroundImage = img ? ("url('"+img+"')") : "";
  // ruota delle classi parcheggiata: copia della ruota vera, classe scelta in evidenza (idea 4)
  var park=document.getElementById("svPark");
  park.innerHTML=document.getElementById("wheel").innerHTML;
  park.querySelectorAll(".slice").forEach(function(sl){
    if(sl.getAttribute("data-key")===key) sl.classList.add("parkhi"); else sl.classList.add("parkdim");
  });
  document.getElementById("svParkLab").innerHTML='<b>'+esc((BY_KEY[key]&&BY_KEY[key].name)||key)+'</b>la tua classe';
  buildSubWheel();
  renderSub();
  document.getElementById("subView").hidden=false;
}
function chiudiSottoclassi(subito){
  var sv=document.getElementById("subView"); if(!sv) return;
  if(subito || sv.hidden){ sv.hidden=true; sv.classList.remove("chiudo"); subKey=null; return; }
  sv.classList.add("chiudo");
  setTimeout(function(){ sv.hidden=true; sv.classList.remove("chiudo"); subKey=null; }, 250);
}
function buildSubWheel(){
  var n=subList.length, step=360/n, gap=n>1?1.2:0, out="";
  var ico=ICONS[subKey]||"";   // l'emblema della classe: un simbolo in ogni cella (niente puntino)
  out+='<g class="subspin" id="subspin">';
  for(var i=0;i<n;i++){
    var mid=-90+i*step, a0=mid-step/2+gap, a1=mid+step/2-gap;
    var tk=subPolar((SUB_RO+SUB_RI)/2, mid), tx=tk[0].toFixed(1), ty=tk[1].toFixed(1);
    out+='<g class="swslice" data-i="'+i+'">'
      +'<path class="subwedge" d="'+subSector(a0,a1)+'"/>'
      +'<g class="swem" data-i="'+i+'" style="transform-box:view-box;transform-origin:'+tx+'px '+ty+'px;">'
      +'<g class="emico" transform="translate('+tx+','+ty+') scale(1.15) translate(-12,-12)">'+ico+'</g>'
      +'</g>'
      +'</g>';
  }
  out+='</g>';
  // puntatore fisso in cima: indica lo slot "in primo piano"
  out+='<path d="M200 8 L211 26 L189 26 Z" fill="var(--gold)"/>';
  document.getElementById("subwheel").innerHTML=out;
  document.getElementById("subwheel").querySelectorAll(".swslice").forEach(function(g){
    g.addEventListener("click", function(){ subFocus=+g.getAttribute("data-i"); renderSub(); });
  });
}
function renderSub(){
  var n=subList.length; if(!n) return;
  var step=360/n, s=subList[subFocus], chosen=state.sottoclassi[subKey];
  var spin=document.getElementById("subspin");
  if(spin) spin.style.transform="rotate("+(-subFocus*step)+"deg)";
  var wh=document.getElementById("subwheel");
  // contro-rotazione degli emblemi: la ruota gira, i simboli restano dritti
  wh.querySelectorAll(".swem").forEach(function(e){ e.style.transform="rotate("+(subFocus*step)+"deg)"; });
  var slices=wh.querySelectorAll(".swslice");
  slices.forEach(function(g,i){
    g.classList.toggle("foc", i===subFocus);
    g.classList.toggle("chosen", subList[i].id===chosen);
  });
  // centro: nome in primo piano (sempre orizzontale e leggibile)
  var lvls=livelliSott(s.id);
  document.getElementById("svHub").innerHTML='<div class="svh-name">'+esc(s.nome||"")+'</div>'
    +'<div class="svh-lv">'+(lvls.length?("liv. "+lvls.join(" · ")):"—")+'</div>'
    +'<div class="svh-count">'+(subFocus+1)+" / "+n+'</div>';
  // frecce coi nomi dei vicini
  var prev=subList[(subFocus-1+n)%n], next=subList[(subFocus+1)%n];
  document.getElementById("svPrevN").textContent = n>1 ? (prev.nome||"") : "";
  document.getElementById("svNextN").textContent = n>1 ? (next.nome||"") : "";
  // dettaglio
  var gia = chosen===s.id;
  document.getElementById("svDetail").innerHTML=
     '<h3>'+esc(s.nome||"")+'</h3>'
    +'<p class="svd-lv">'+(lvls.length?("Privilegi ai livelli "+lvls.join(" · ")):"Privilegi in arrivo")+'</p>'
    +'<div class="svd-lore">'+esc(s.descrizione||"Nessuna descrizione.")+'</div>'
    +'<button class="svd-choose'+(gia?' gia':'')+'" data-subchoose>'+(gia?'&#10003; &Egrave; la tua sottoclasse — togli':'Scegli questa sottoclasse')+'</button>'
    +'<div class="svd-done" id="svDone">Sottoclasse impostata: appare nel pop-up Classe del Retro.</div>';
  // briciole
  var cr=chosen ? (function(){ for(var i=0;i<subList.length;i++) if(subList[i].id===chosen) return subList[i].nome; return ""; })() : "";
  document.getElementById("svCrumb").innerHTML='<b>'+esc((BY_KEY[subKey]&&BY_KEY[subKey].name)||subKey)+'</b> &rsaquo; '+(cr?esc(cr):'<i>scegli una sottoclasse</i>');
}
function scegliSottoclasse(){
  if(!subKey || !subList.length) return;
  var id=subList[subFocus].id;
  if(state.sottoclassi[subKey]===id) delete state.sottoclassi[subKey];   // ri-clic = togli
  else state.sottoclassi[subKey]=id;
  renderAll();          // aggiorna ruota (segni), Retro, salvataggio
  renderSub();          // riflette la scelta
  if(state.sottoclassi[subKey]===id){ var d=document.getElementById("svDone"); if(d){ d.classList.add("on"); } }
}
(function(){
  var sv=document.getElementById("subView"); if(!sv) return;
  document.getElementById("svPrev").addEventListener("click", function(){ var n=subList.length; if(n){ subFocus=(subFocus-1+n)%n; renderSub(); } });
  document.getElementById("svNext").addEventListener("click", function(){ var n=subList.length; if(n){ subFocus=(subFocus+1)%n; renderSub(); } });
  document.getElementById("svBack").addEventListener("click", chiudiSottoclassi);
  document.getElementById("svClose").addEventListener("click", function(){ closeAll(); });
  document.getElementById("svDetail").addEventListener("click", function(e){ if(e.target.closest("[data-subchoose]")) scegliSottoclasse(); });
})();
function openStats(){ document.getElementById("modalStats").hidden=false; renderStatsDialog(); if(personalizza) sincronizzaSel("stats"); }
function openXp(){ modalXp.hidden=false; renderXpDialog(); if(personalizza) sincronizzaSel("xp"); }
function openProf(){ modalProf.hidden=false; renderProfDialog(); if(personalizza) sincronizzaSel("prof"); }
function openTs(){ document.getElementById("modalTs").hidden=false; renderTsDialog(); if(personalizza) sincronizzaSel("ts"); }
function openAbil(){ document.getElementById("modalAbil").hidden=false; renderAbilDialog(); if(personalizza) sincronizzaSel("abil"); }
function openHp(){ document.getElementById("modalHp").hidden=false; renderHpDialog(); if(personalizza) sincronizzaSel("hp"); }
function closeAll(){ modalName.hidden=true; modalClass.hidden=true; modalXp.hidden=true; modalProf.hidden=true;
  chiudiSottoclassi(true);
  document.getElementById("modalStats").hidden=true;
  document.getElementById("modalTs").hidden=true;
  document.getElementById("modalAbil").hidden=true;
  var mh=document.getElementById("modalHp"); if(mh) mh.hidden=true;
  var md=document.getElementById("modalDif"); if(md) md.hidden=true;
  var mal=document.getElementById("modalAlign"); if(mal) mal.hidden=true;
  var mrz=document.getElementById("modalRazze"); if(mrz) mrz.hidden=true;
  var mrza=document.getElementById("modalRazzaAsp"); if(mrza) mrza.hidden=true;
  var mtl=document.getElementById("modalTalenti"); if(mtl) mtl.hidden=true;
  var mpv=document.getElementById("modalPriv"); if(mpv) mpv.hidden=true;
  document.getElementById("modalEsci").hidden=true; elHeader.classList.remove("raised"); }
document.getElementById("gearName").addEventListener("click", openName);
document.getElementById("gearClass").addEventListener("click", openClass);
document.getElementById("gearXp").addEventListener("click", openXp);
document.getElementById("gearProf").addEventListener("click", openProf);
document.getElementById("gearAlign").addEventListener("click", openAlign);

// Il pannello Razza e' tutto un pulsante: toccarlo (o Invio/Spazio) apre il grimorio.
(function(){
  var rp=document.getElementById("razzaPanel"); if(!rp) return;
  rp.addEventListener("click", function(){ apriRazzaPanel(); });
  rp.addEventListener("keydown", function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); apriRazzaPanel(); } });
  rp.addEventListener("mouseenter", rzEnter);
  rp.addEventListener("mouseleave", rzLeave);
})();
// Dentro il grimorio: si sfoglia (data-razza) e si sceglie/toglie la razza (data-assegna).
// La chiusura (data-close) la gestisce gia' il click globale piu' in basso.
(function(){
  var mr=document.getElementById("modalRazze"); if(!mr) return;
  mr.addEventListener("click", function(e){
    // copertina: volta pagina per aprire il libro
    if(e.target.closest("[data-volta]")){ voltaPagina(); return; }
    // comandi staff sulla pagina di una razza
    var ed=e.target.closest("[data-edit]");
    if(ed){ apriFormRazza(ed.getAttribute("data-edit")); return; }
    var del=e.target.closest("[data-del]");
    if(del){ grimDelId=del.getAttribute("data-del"); renderGrimorio(); return; }
    if(e.target.closest("[data-delno]")){ grimDelId=null; renderGrimorio(); return; }
    var dy=e.target.closest("[data-delyes]");
    if(dy){ eliminaRazza(dy.getAttribute("data-delyes")); return; }
    // comandi del modulo
    if(e.target.closest("[data-grimadd]")){ apriFormRazza(); return; }
    if(e.target.closest("[data-grimcancel]")){ grimMode="view"; grimFile=null; grimEditId=null; grimImgRemoved=false; renderGrimorio(); return; }
    if(e.target.closest("[data-grimsave]")){ salvaRazza(); return; }
    if(e.target.closest("[data-imgremove]")){
      if(grimFile){ grimFile=null; var inp=document.getElementById("frz_img"); if(inp) inp.value=""; }
      else { grimImgRemoved=true; }   // in modifica: segno che l'immagine esistente va tolta
      aggiornaAnteprimaImg(); return;
    }
    var it=e.target.closest("[data-razza]");
    if(it){
      grimFile=null; grimEditId=null; grimDelId=null; grimMode="view";
      mostraRazza(it.getAttribute("data-razza"));   // assorbimento + rivelazione a inchiostro
      return;
    }
    var as=e.target.closest("[data-assegna]");
    if(as){
      if(soloLettura) return;
      var id=as.getAttribute("data-assegna");
      state.razza = (state.razza===id) ? "" : id;
      renderRazzaPanel(); renderRetro(); renderGrimorio(); aggiornaSalva();   // Umano cambia le caselle Origine
      return;
    }
  });
  // la scelta del file immagine: aggiorno solo l'anteprima
  mr.addEventListener("change", function(e){
    if(e.target && e.target.id==="frz_img"){
      grimFile = (e.target.files && e.target.files[0]) ? e.target.files[0] : null;
      if(grimFile) grimImgRemoved=false;   // ho scelto una nuova immagine
      aggiornaAnteprimaImg();
    }
  });
  // la ricerca nell'indice: filtra le voci mentre si scrive
  mr.addEventListener("input", function(e){
    if(e.target && e.target.id==="grimCerca"){ grimFiltro=e.target.value; applicaFiltroGrimorio(); }
  });
})();

// Il Retro: la tabella dei talenti scelti. Aggiungi (apre il mazzo per scegliere),
// togli, apri la carta di un talento scelto, o sfoglia tutto il mazzo.
(function(){
  var pr=document.getElementById("pagRetro"); if(!pr) return;
  pr.addEventListener("click", function(e){
    if(e.target.closest("[data-talasi]")) return;   // il menù del +1: non aprire la carta
    var add=e.target.closest("[data-taladdsez]");
    if(add){ apriAggiuntaTalento(add.getAttribute("data-taladdsez")); return; }
    var rem=e.target.closest("[data-talrem]");
    if(rem){ togliTalento(rem.getAttribute("data-talsez"), rem.getAttribute("data-talrem")); return; }
    if(e.target.closest("[data-talbrowse]")){ openTalenti(); return; }
    var vw=e.target.closest("[data-talview]");
    if(vw){ apriCartaTalento(vw.getAttribute("data-talview")); return; }
  });
  pr.addEventListener("change", function(e){
    var sl=e.target.closest("select[data-talasi-sez]");
    if(sl){
      var slot=sl.getAttribute("data-talasi-slot");
      if(slot) scegliAsiDistr(sl.getAttribute("data-talasi-sez"), sl.getAttribute("data-talasi-idx"), slot, sl.value);
      else scegliAsiTalento(sl.getAttribute("data-talasi-sez"), sl.getAttribute("data-talasi-idx"), sl.value);
    }
  });
  pr.addEventListener("keydown", function(e){
    if(e.target.closest("[data-talasi]")) return;   // dentro il menù del +1: lascio fare al menù
    if(e.key!=="Enter" && e.key!==" ") return;
    var vw=e.target.closest && e.target.closest("[data-talview]");
    if(vw){ e.preventDefault(); apriCartaTalento(vw.getAttribute("data-talview")); }
  });
})();
// Dentro il mazzo: sfoglio (frecce), gestione staff (aggiungi/modifica/elimina),
// modulo. La chiusura (data-close) la gestisce il click globale piu' in basso.
(function(){
  var mt=document.getElementById("modalTalenti"); if(!mt) return;
  // tieni premuta una freccia per scorrere RAPIDAMENTE le carte
  var holdTimer=null, holdInt=null, holdOn=false;
  function stopHold(){ if(holdTimer){clearTimeout(holdTimer);holdTimer=null;} if(holdInt){clearInterval(holdInt);holdInt=null;} }
  function avanzaVeloce(dir){
    var lista=talentiFiltrati(); if(!lista.length){ stopHold(); return; }
    var n=talIdx+dir; if(n<0 || n>lista.length-1){ stopHold(); return; }
    talIdx=n; talDelId=null; disegnaCarta();   // cambio secco = veloce
  }
  mt.addEventListener("mousedown", function(e){
    var fr=e.target.closest("[data-talprev],[data-talnext]"); if(!fr || fr.disabled) return;
    var dir = fr.hasAttribute("data-talnext") ? 1 : -1;
    holdOn=false;
    holdTimer=setTimeout(function(){ holdOn=true; holdInt=setInterval(function(){ avanzaVeloce(dir); }, 90); }, 320);
  });
  mt.addEventListener("mouseup", stopHold);
  mt.addEventListener("mouseleave", stopHold);
  document.addEventListener("mouseup", stopHold);
  mt.addEventListener("click", function(e){
    if(e.target.closest("[data-talprev]")){ if(holdOn){ holdOn=false; return; } talVai(-1); return; }
    if(e.target.closest("[data-talnext]")){ if(holdOn){ holdOn=false; return; } talVai(1); return; }
    var pick=e.target.closest("[data-talpick]");
    if(pick){ scegliTalento(pick.getAttribute("data-talpick")); return; }
    // elenco rapido: apri/chiudi, e salta alla carta scelta
    if(e.target.closest("[data-talindice]")){ talElenco=!talElenco; var bi=e.target.closest("[data-talindice]"); bi.classList.toggle("on",talElenco); renderElenco(); return; }
    var jp=e.target.closest("[data-taljump]");
    if(jp){ vaiATalento(jp.getAttribute("data-taljump")); return; }
    // comandi staff sulla carta
    var ed=e.target.closest("[data-taledit]");
    if(ed){ apriFormTalento(ed.getAttribute("data-taledit")); return; }
    var del=e.target.closest("[data-taldel]");
    if(del){ talDelId=del.getAttribute("data-taldel"); disegnaCarta(); return; }
    if(e.target.closest("[data-taldelno]")){ talDelId=null; disegnaCarta(); return; }
    var dy=e.target.closest("[data-taldelyes]");
    if(dy){ eliminaTalento(dy.getAttribute("data-taldelyes")); return; }
    // comandi del modulo
    if(e.target.closest("[data-taladd]")){ apriFormTalento(); return; }
    if(e.target.closest("[data-talcancel]")){ talMode="view"; talFile=null; talEditId=null; talImgRemoved=false; renderTalenti(); return; }
    if(e.target.closest("[data-talsave]")){ salvaTalento(); return; }
    if(e.target.closest("[data-talimgremove]")){
      if(talFile){ talFile=null; var inp=document.getElementById("tf_img"); if(inp) inp.value=""; }
      else { talImgRemoved=true; }
      aggiornaAnteprimaImgTal(); return;
    }
  });
  // la scelta del file immagine: aggiorno solo l'anteprima
  mt.addEventListener("change", function(e){
    if(e.target && e.target.id==="tf_img"){
      talFile = (e.target.files && e.target.files[0]) ? e.target.files[0] : null;
      if(talFile) talImgRemoved=false;
      aggiornaAnteprimaImgTal();
    }
    // il tipo di +1: mostro/nascondo la scelta della caratteristica (senza ridisegnare)
    if(e.target && e.target.id==="tf_tipoasi"){
      var row=document.getElementById("tf_carrow"); if(row) row.hidden = (e.target.value!=="fisso");
    }
  });
  // la ricerca: filtra il mazzo mentre si scrive (riparte dalla prima carta)
  mt.addEventListener("input", function(e){
    if(e.target && e.target.id==="talCerca"){ talFiltro=e.target.value; talIdx=0; talAnimDir=0; talDelId=null; disegnaCarta(); if(talElenco) renderElenco(); }
  });
  // le frecce della tastiera sfogliano, quando la finestra e' aperta e non sei nel modulo
  document.addEventListener("keydown", function(e){
    if(mt.hidden || talMode==="form") return;
    if(e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if(e.key==="ArrowLeft"){ talVai(-1); }
    else if(e.key==="ArrowRight"){ talVai(1); }
  });
})();
// I Tiri salvezza ora sono la terza linguetta: la loro rotellina e' quella
// unica del riquadro (gearCore), che apre openTs quando la vista attiva e' TS.

/* Caratteristiche e Abilita' stanno nello stesso riquadro, come Scheda e
   Controllo: l'interruttore in alto cambia la faccia mostrata. Non si salva,
   e' solo quale vista stai guardando. La rotellina apre la finestra della
   vista attiva, e la "i" compare solo sulle Abilita'. */
var vistaCore="stats";
var animandoCore=false;   // un cambio di vista alla volta, non si accavallano
var vistaHp="dadi";       // linguetta attiva nel riquadro Punti ferita (non si salva): "temp"|"dadi"|"morte"

/* MORPH (transizione "smontaggio") — tappa 1.
   Il ragno delle Caratteristiche si smonta: gli esagoni interni e il poligono
   svaniscono in sequenza, le linee si ritirano, i numeri spariscono e le sigle
   viaggiano fino ai vertici dell'esagono (dove stanno nelle Abilita'). Alla
   fine resta il solo esagono esterno con le sei sigle ai vertici, poi chiama
   fine(). Usa la Web Animations API: tempi e ritardi controllati, niente
   librerie. */
function morphSmontaRagno(fine){
  var svg=document.querySelector("#statsLine svg");
  if(!svg){ fine(); return; }
  var NS="http://www.w3.org/2000/svg";
  var q=function(s){ return Array.prototype.slice.call(svg.querySelectorAll(s)); };
  var grids=q(".slgrid");             // [esterno (f=1), medio, interno]
  var hexChar=svg.querySelector(".slhex");
  var wires=q(".slwire");
  var vals=q(".slval").concat(q(".slmod"));
  var sigs=q(".slsig");
  var E="ease", EIO="ease-in-out";
  // offset delle sigle fuori dal vertice, preso da Abilita' (15 su R=72) e
  // scalato al raggio del ragno (84): stessa posizione relativa.
  var OFF=15*84/72, R_DOT=3.4*84/72;

  // 1) esagoni interni + poligono del personaggio svaniscono in sequenza rapida
  if(grids[2]) grids[2].animate([{opacity:1},{opacity:0}], {duration:180, delay:0,  fill:"forwards", easing:E});
  if(grids[1]) grids[1].animate([{opacity:1},{opacity:0}], {duration:180, delay:95, fill:"forwards", easing:E});
  if(hexChar)  hexChar.animate([{opacity:1},{opacity:0}],  {duration:240, delay:48, fill:"forwards", easing:E});

  // 2) le linee di richiamo si ritirano indietro (dal numero verso il vertice)
  wires.forEach(function(w,i){
    var L; try{ L=w.getTotalLength(); }catch(e){ L=600; }
    w.style.strokeDasharray=L;
    w.animate([{strokeDashoffset:0},{strokeDashoffset:L}], {duration:310, delay:72+i*10, fill:"forwards", easing:E});
  });

  // 3) i numeri (valore e modificatore) svaniscono
  vals.forEach(function(t){ t.animate([{opacity:1},{opacity:0}], {duration:170, delay:85, fill:"forwards", easing:E}); });

  // 4) le sigle viaggiano dai lati fino appena fuori dal vertice, centrate come
  //    in Abilita', e si tingono del colore della caratteristica arrivando.
  sigs.forEach(function(t,idx){
    var v=slVertice(idx,1), ang=(-90+idx*60)*Math.PI/180;
    var tx=v[0]+Math.cos(ang)*OFF, ty=v[1]+Math.sin(ang)*OFF;
    var bb=t.getBBox(), cx0=bb.x+bb.width/2, cy0=bb.y+bb.height/2;   // centro visivo attuale
    t.animate([{transform:"translate(0px,0px)"},
               {transform:"translate("+(tx-cx0).toFixed(1)+"px,"+(ty-cy0).toFixed(1)+"px)", fill:colCar(CARATT[idx].k)}],
              {duration:400, delay:180, fill:"forwards", easing:EIO});
  });

  // 5) i pallini colorati compaiono sui vertici (come nell'esagono Abilita')
  var dg=document.createElementNS(NS,"g");
  CARATT.forEach(function(c,idx){
    var v=slVertice(idx,1);
    var dot=document.createElementNS(NS,"circle");
    dot.setAttribute("cx", v[0].toFixed(1)); dot.setAttribute("cy", v[1].toFixed(1));
    dot.setAttribute("r", R_DOT.toFixed(1)); dot.setAttribute("fill", colCar(c.k));
    dot.style.opacity="0";
    dg.appendChild(dot);
    dot.animate([{opacity:0},{opacity:1}], {duration:260, delay:230, fill:"forwards", easing:E});
  });
  svg.appendChild(dg);

  setTimeout(fine, 640);
}

/* MORPH — tappa 2: l'esagono nudo scivola a sinistra e si rimpicciolisce fino a
   sovrapporsi a quello di Abilita', le abilita' entrano a cascata, e in chiusura
   un cross-fade passa dal morph alla vera vista Abilita' (che porta pallini,
   sigle e percezione passiva definitivi: atterraggio al pixel). */
function morphScivolaVersoAbil(vs, va, fine){
  var slEl=document.getElementById("statsLine");
  var svg=slEl?slEl.querySelector("svg"):null;
  var outerHex=svg?svg.querySelector(".slgrid"):null;   // esagono esterno (f=1), quello rimasto

  // 1) congelo la vista Caratteristiche in posizione assoluta: cosi' portare in
  //    scena Abilita' non la fa saltare, e posso farla scivolare sopra.
  var oT=vs.offsetTop, oL=vs.offsetLeft, oW=vs.offsetWidth;
  vs.style.position="absolute"; vs.style.top=oT+"px"; vs.style.left=oL+"px";
  vs.style.width=oW+"px"; vs.style.margin="0"; vs.style.zIndex="2";

  // 2) porto in flusso la vera vista Abilita', con esagono invisibile (niente
  //    doppione) e i gruppi pronti a comparire. Metto le opacita' a 0 PRIMA di
  //    mostrarla, cosi' esagono e gruppi non lampeggiano per un frame.
  var mapEl=document.getElementById("abilMap");
  var grps=Array.prototype.slice.call(document.querySelectorAll("#abilGrid .abgrp"));
  if(mapEl) mapEl.style.opacity="0";
  grps.forEach(function(g){ g.style.opacity="0"; });
  va.hidden=false;

  var anims=[];
  // 3) misuro esagono di partenza (ragno) e di arrivo (Abilita') e faccio
  //    scivolare+scalare tutto il disegno cosi' i due esagoni coincidono.
  var sr=outerHex?outerHex.getBoundingClientRect():null;
  var abHex=mapEl?mapEl.querySelector(".abhex"):null;
  var tr=abHex?abHex.getBoundingClientRect():null;
  if(slEl && sr && tr && sr.width){
    var s=tr.width/sr.width;
    var scx=sr.left+sr.width/2, scy=sr.top+sr.height/2;
    var tcx=tr.left+tr.width/2, tcy=tr.top+tr.height/2;
    var slr=slEl.getBoundingClientRect();
    slEl.style.transformOrigin=(scx-slr.left).toFixed(1)+"px "+(scy-slr.top).toFixed(1)+"px";
    anims.push(slEl.animate([
      {transform:"translate(0px,0px) scale(1)"},
      {transform:"translate("+(tcx-scx).toFixed(1)+"px,"+(tcy-scy).toFixed(1)+"px) scale("+s.toFixed(3)+")"}
    ], {duration:440, fill:"forwards", easing:"ease-in-out"}));
  }

  // 4) i gruppi delle abilita' compaiono a cascata mentre l'esagono scivola
  grps.forEach(function(g,i){
    anims.push(g.animate([{opacity:0, transform:"translateY(-10px)"},{opacity:1, transform:"translateY(0px)"}],
      {duration:300, delay:170+i*45, fill:"forwards", easing:"ease"}));
  });

  // 5) chiusura: cross-fade dal ragno-morph all'esagono vero di Abilita'
  setTimeout(function(){
    if(mapEl){ mapEl.style.transition="opacity .24s ease"; mapEl.style.opacity="1"; }
    if(slEl){ slEl.style.transition="opacity .24s ease"; slEl.style.opacity="0"; }
    setTimeout(function(){
      // reset totale: annulla ogni animazione, pulisce gli inline e ridisegna
      // entrambe le viste da zero, cosi' non resta mai nulla di appeso.
      azzeraTransizione();
      vs.hidden=true; va.hidden=false;
      fine();
    }, 280);
  }, 430);
}

/* MORPH — ri-assemblaggio del ragno (usato nel ritorno). Presuppone lo
   #statsLine appena ridisegnato (ragno intero); lo porta prima allo stato
   "smontato" statico e restituisce un oggetto con .anima(fine) che lo anima
   all'indietro fino al ragno intero (anelli, linee, numeri, sigle che
   rientrano ai lati, pallini che svaniscono). */
function morphMontaRagno(){
  var svg=document.querySelector("#statsLine svg");
  if(!svg) return { anima:function(f){ f(); } };
  var NS="http://www.w3.org/2000/svg";
  var q=function(s){ return Array.prototype.slice.call(svg.querySelectorAll(s)); };
  var grids=q(".slgrid"), hexChar=svg.querySelector(".slhex");
  var wires=q(".slwire"), vals=q(".slval").concat(q(".slmod")), sigs=q(".slsig");
  var E="ease", EIO="ease-in-out";
  var OFF=15*84/72, R_DOT=3.4*84/72;

  // --- stato "smontato" statico (punto di partenza del ritorno) ---
  if(grids[1]) grids[1].style.opacity="0";
  if(grids[2]) grids[2].style.opacity="0";
  if(hexChar) hexChar.style.opacity="0";
  vals.forEach(function(t){ t.style.opacity="0"; });
  var wireLen=[];
  wires.forEach(function(w,i){ var L; try{L=w.getTotalLength();}catch(e){L=600;} wireLen[i]=L; w.style.strokeDasharray=L; w.style.strokeDashoffset=L; });
  var sigInfo=[];
  sigs.forEach(function(t,idx){
    var v=slVertice(idx,1), ang=(-90+idx*60)*Math.PI/180;
    var tx=v[0]+Math.cos(ang)*OFF, ty=v[1]+Math.sin(ang)*OFF;
    var bb=t.getBBox(), cx0=bb.x+bb.width/2, cy0=bb.y+bb.height/2;
    var inf={ dx:(tx-cx0), dy:(ty-cy0), natFill:getComputedStyle(t).fill };
    sigInfo[idx]=inf;
    t.style.transform="translate("+inf.dx.toFixed(1)+"px,"+inf.dy.toFixed(1)+"px)";
    t.style.fill=colCar(CARATT[idx].k);
  });
  var dg=document.createElementNS(NS,"g"), dots=[];
  CARATT.forEach(function(c,idx){
    var v=slVertice(idx,1), dot=document.createElementNS(NS,"circle");
    dot.setAttribute("cx",v[0].toFixed(1)); dot.setAttribute("cy",v[1].toFixed(1));
    dot.setAttribute("r",R_DOT.toFixed(1)); dot.setAttribute("fill",colCar(c.k));
    dg.appendChild(dot); dots.push(dot);
  });
  svg.appendChild(dg);
  void svg.getBoundingClientRect();   // applico lo stato statico prima di animare

  return { anima:function(fine){
    // sigle rientrano ai lati e riprendono il colore neutro di partenza
    sigs.forEach(function(t,idx){
      var inf=sigInfo[idx];
      var a=t.animate([{transform:"translate("+inf.dx.toFixed(1)+"px,"+inf.dy.toFixed(1)+"px)", fill:colCar(CARATT[idx].k)},
                       {transform:"translate(0px,0px)", fill:inf.natFill}], {duration:440, delay:150, fill:"forwards", easing:EIO});
      a.addEventListener("finish", function(){ t.style.transform=""; t.style.fill=""; });
    });
    // pallini svaniscono
    dots.forEach(function(d){ d.animate([{opacity:1},{opacity:0}], {duration:240, delay:70, fill:"forwards", easing:E}); });
    // le linee si riallungano verso le stat
    wires.forEach(function(w,i){
      var a=w.animate([{strokeDashoffset:wireLen[i]},{strokeDashoffset:0}], {duration:400, delay:270, fill:"forwards", easing:E});
      a.addEventListener("finish", function(){ w.style.strokeDasharray=""; w.style.strokeDashoffset=""; });
    });
    // numeri ricompaiono
    vals.forEach(function(t){ var a=t.animate([{opacity:0},{opacity:1}], {duration:220, delay:380, fill:"forwards", easing:E}); a.addEventListener("finish", function(){ t.style.opacity=""; }); });
    // esagoni interni + poligono ricompaiono
    [[grids[2],0],[grids[1],95],[hexChar,70]].forEach(function(p){
      if(!p[0]) return;
      var a=p[0].animate([{opacity:0},{opacity:1}], {duration:240, delay:430+p[1], fill:"forwards", easing:E});
      a.addEventListener("finish", function(){ p[0].style.opacity=""; });
    });
    setTimeout(function(){ if(dg.parentNode) dg.parentNode.removeChild(dg); fine(); }, 860);
  }};
}

/* MORPH — ritorno Abilita' -> Caratteristiche (speculare all'andata): le
   abilita' si ritirano, l'esagono di Abilita' scivola al centro e cresce, e il
   ragno si ri-assembla sopra. Parte da un cross-fade dall'esagono vero allo
   stage Caratteristiche (in stato smontato) sovrapposto. */
function morphRitornoVersoStats(vs, va, fine){
  var slEl=document.getElementById("statsLine");
  var mapEl=document.getElementById("abilMap");
  var grps=Array.prototype.slice.call(document.querySelectorAll("#abilGrid .abgrp"));

  // 1) le abilita' si ritirano
  grps.forEach(function(g,i){
    g.animate([{opacity:1,transform:"translateY(0px)"},{opacity:0,transform:"translateY(10px)"}],
      {duration:220, delay:i*28, fill:"forwards", easing:"ease"});
  });

  // 2) misuro l'esagono di Abilita' (sorgente)
  var abHex=mapEl?mapEl.querySelector(".abhex"):null;
  var srcR=abHex?abHex.getBoundingClientRect():null;

  // 3) preparo lo stage Caratteristiche: swap sincrono (nessun frame dipinto)
  //    per ridisegnarlo e misurarne la posizione naturale, poi lo congelo sopra
  //    l'esagono di Abilita', invisibile. Opacita' a 0 PRIMA di mostrarlo, cosi'
  //    il ragno pieno non puo' lampeggiare per un frame.
  vs.style.opacity="0";
  va.hidden=true; vs.hidden=false;
  renderStats();
  var oT=vs.offsetTop, oL=vs.offsetLeft, oW=vs.offsetWidth;
  var oh=document.querySelector("#statsLine svg .slgrid");
  var natHex=oh?oh.getBoundingClientRect():null;
  var slNat=slEl.getBoundingClientRect();
  va.hidden=false;
  vs.style.position="absolute"; vs.style.top=oT+"px"; vs.style.left=oL+"px"; vs.style.width=oW+"px"; vs.style.margin="0"; vs.style.zIndex="2"; vs.style.opacity="0";
  var initialT="";
  if(natHex && srcR && natHex.width){
    var s=srcR.width/natHex.width;
    var ncx=natHex.left+natHex.width/2, ncy=natHex.top+natHex.height/2;
    var scx=srcR.left+srcR.width/2, scy=srcR.top+srcR.height/2;
    slEl.style.transformOrigin=(ncx-slNat.left).toFixed(1)+"px "+(ncy-slNat.top).toFixed(1)+"px";
    initialT="translate("+(scx-ncx).toFixed(1)+"px,"+(scy-ncy).toFixed(1)+"px) scale("+s.toFixed(3)+")";
    slEl.style.transform=initialT;
  }

  // 4) stato smontato statico dello stage, pronto per il montaggio
  var montatore=morphMontaRagno();
  void slEl.getBoundingClientRect();

  // 5) cross-fade: l'esagono vero di Abilita' esce, lo stage entra
  vs.style.transition="opacity .24s ease"; vs.style.opacity="1";
  if(mapEl){ mapEl.style.transition="opacity .24s ease"; mapEl.style.opacity="0"; }

  // 6) dopo il cross-fade: scivola al centro (transform->identita') e ri-assembla
  setTimeout(function(){
    vs.style.transition="";
    if(initialT){
      var slide=slEl.animate([{transform:initialT},{transform:"translate(0px,0px) scale(1)"}],
        {duration:440, fill:"forwards", easing:"ease-in-out"});
      slide.addEventListener("finish", function(){ slEl.style.transform=""; slEl.style.transformOrigin=""; });
    }
    montatore.anima(function(){
      // reset totale (come nell'andata): niente residui appesi.
      azzeraTransizione();
      vs.hidden=false; va.hidden=true;
      fine();
    });
  }, 170);
}

/* MORPH — Abilita' -> Tiri salvezza. Prima le scritte si ritirano verso l'alto
   (a tendina) e spariscono, restando il solo esagono sottile. Poi un esagono
   "clone" ASSOLUTO dentro il riquadro (scrolla con la pagina, immune ai reflow,
   e non tocca mai l'esagono vero) rimpicciolisce ruotando fino al centro, dove
   sboccia il favo. Le linee restano sottili anche mentre rimpicciolisce. */
function morphAbilVersoTs(va, vt, fine){
  var NS="http://www.w3.org/2000/svg";
  var pan=document.getElementById("corePanel");
  var mapEl=document.getElementById("abilMap");
  var abHex=mapEl?mapEl.querySelector(".abhex"):null;
  var vsEl=document.getElementById("viewStats");
  var grps=Array.prototype.slice.call(document.querySelectorAll("#abilGrid .abgrp"));

  // 1) le scritte si ritirano verso l'alto (tendina) e spariscono; l'esagono
  //    (linee) resta.
  grps.forEach(function(g,i){ g.animate([{opacity:1,transform:"translateY(0px)"},{opacity:0,transform:"translateY(-14px)"}],{duration:240,delay:i*18,fill:"forwards",easing:"ease-in"}); });
  // le scritte attorno all'esagono (sigle, puntini, PP) svaniscono in dissolvenza
  // secca e rapida (niente scivolamento: si sovrapponeva e stava male).
  if(mapEl) mapEl.querySelectorAll(".abvtx,.ppet,.ppval").forEach(function(e){ e.animate([{opacity:1},{opacity:0}],{duration:150,fill:"forwards",easing:"ease"}); });

  // misuro (relative al riquadro, cosi' e' immune ai cambi d'altezza e allo
  // scroll): esagono di Abilita' e centrale del favo (swap sincrono). Preservo
  // lo scroll: lo swap accorcia un attimo la pagina e il browser lo sposterebbe.
  var syScroll=window.scrollY, sxScroll=window.scrollX;
  var panR=pan.getBoundingClientRect();
  var sr=abHex?abHex.getBoundingClientRect():null;
  va.hidden=true; vt.hidden=false;
  var favo=document.querySelector("#tsGrid svg");
  var centrale=favo?favo.querySelector(".tsdadohex"):null;
  var tr=centrale?centrale.getBoundingClientRect():null;
  var panR2=pan.getBoundingClientRect();
  va.hidden=false; vt.hidden=true;
  window.scrollTo(sxScroll, syScroll);

  // favo "chiuso"
  var dadoParti=favo?Array.prototype.slice.call(favo.querySelectorAll(".tsemb")):[];
  var celle=favo?Array.prototype.slice.call(favo.querySelectorAll(".tscell")):[];
  if(centrale) centrale.style.opacity="0";
  dadoParti.forEach(function(e){ e.style.opacity="0"; });
  celle.forEach(function(c){ c.style.opacity="0"; c.style.transformBox="fill-box"; c.style.transformOrigin="center"; });

  if(!sr || !tr || !sr.width){   // misura fallita: ripiego sulla dissolvenza
    azzeraTransizione(); vt.hidden=false; va.hidden=true; if(vsEl) vsEl.hidden=true; setTimeout(fine,10); return;
  }

  // Clone ASSOLUTO dentro il riquadro (top-left stabile: immune ai cambi
  // d'altezza e allo scroll). Per essere IDENTICO all'esagono di Abilita'
  // (stessa dimensione/forma/colore/spessore) clono la vera SVG e le tolgo
  // sigle, pallini e passiva: resta solo l'esagono.
  var mapR=mapEl.getBoundingClientRect();
  var scx=(mapR.left-panR.left)+mapR.width/2, scy=(mapR.top-panR.top)+mapR.height/2;  // centro sorgente (= centro esagono)
  var tx=(tr.left-panR2.left)+tr.width/2, ty=(tr.top-panR2.top)+tr.height/2;          // centro bersaglio
  var clone=document.createElement("div");
  clone.setAttribute("data-morphclone","1");
  clone.style.cssText="position:absolute;left:"+(mapR.left-panR.left).toFixed(1)+"px;top:"+(mapR.top-panR.top).toFixed(1)+"px;width:"+mapR.width.toFixed(1)+"px;height:"+mapR.height.toFixed(1)+"px;overflow:visible;z-index:5;pointer-events:none;transform-origin:center;";
  var cloneSvg=mapEl.querySelector("svg").cloneNode(true);
  cloneSvg.querySelectorAll(".abvtx,.ppet,.ppval").forEach(function(e){ e.parentNode.removeChild(e); });
  cloneSvg.querySelectorAll(".abhex").forEach(function(h){ h.setAttribute("vector-effect","non-scaling-stroke"); });  // linee sottili anche da piccolo
  cloneSvg.style.width="100%"; cloneSvg.style.height="100%"; cloneSvg.style.display="block"; cloneSvg.style.overflow="visible";
  clone.appendChild(cloneSvg); pan.appendChild(clone);
  // nascondo SOLO l'esagono vero (rimpiazzato dal clone): sigle, puntini e PP
  // restano e si dissolvono con la loro animazione, come le abilita'.
  if(abHex) abHex.style.opacity="0";

  // 2) dopo la dissolvenza: passo ai TS, il clone rimpicciolisce ruotando fino
  //    al centro, e il favo sboccia. Preservo lo scroll cosi' il riquadro resta
  //    ancorato dov'e' e la pagina non "salta in su".
  setTimeout(function(){
    var sy2=window.scrollY, sx2=window.scrollX;
    va.hidden=true; vt.hidden=false; if(vsEl) vsEl.hidden=true;
    window.scrollTo(sx2, sy2);
    var s=tr.width/sr.width, dx=tx-scx, dy=ty-scy;
    clone.animate([
      {transform:"translate(0px,0px) rotate(0deg) scale(1)"},
      {transform:"translate("+dx.toFixed(1)+"px,"+dy.toFixed(1)+"px) rotate(450deg) scale("+s.toFixed(3)+")"}
    ], {duration:680, fill:"forwards", easing:"ease-in-out"});

    // i sei esagoni sbocciano in orario (portano sigle+valori), poi il dado
    celle.forEach(function(c,i){ c.animate([{opacity:0,transform:"scale(.35)"},{opacity:1,transform:"scale(1)"}],{duration:260,delay:340+i*70,fill:"forwards",easing:"ease"}); });
    if(centrale) centrale.animate([{opacity:0},{opacity:1}],{duration:220,delay:640,fill:"forwards",easing:"ease"});
    dadoParti.forEach(function(e,i){ e.animate([{opacity:0},{opacity:1}],{duration:320,delay:820+i*35,fill:"forwards",easing:"ease"}); });

    setTimeout(function(){
      if(clone.parentNode) clone.parentNode.removeChild(clone);
      pan.style.transition=""; pan.style.height="";   // libero l'altezza
      azzeraTransizione();
      vt.hidden=false; va.hidden=true; if(vsEl) vsEl.hidden=true;
      fine();
    }, 1220);
  }, 280);
}

/* MORPH — Tiri salvezza -> Abilita'. L'inverso del favo che sboccia: prima il
   favo si RICHIUDE (il dado al centro svanisce, i sei esagoni collassano verso
   il centro rimpicciolendo, in ordine inverso all'apertura). Poi un esagono
   "clone" ASSOLUTO dentro il riquadro (scrolla con la pagina, non tocca mai
   l'esagono vero) parte piccolo e ruotato al centro del favo e CRESCE ruotando
   all'indietro fino a combaciare con l'esagono di Abilita', dove rientrano
   sigle, puntini, passiva e i sei gruppi. Linee sottili con non-scaling-stroke. */
function morphTsVersoAbil(vt, va, fine){
  var pan=document.getElementById("corePanel");
  var mapEl=document.getElementById("abilMap");            // bersaglio (Abilita')
  var abHex=mapEl?mapEl.querySelector(".abhex"):null;
  var vsEl=document.getElementById("viewStats");
  var favo=document.querySelector("#tsGrid svg");          // sorgente (favo)
  var centrale=favo?favo.querySelector(".tsdadohex"):null;
  var dadoParti=favo?Array.prototype.slice.call(favo.querySelectorAll(".tsemb")):[];
  var celle=favo?Array.prototype.slice.call(favo.querySelectorAll(".tscell")):[];
  var grps=Array.prototype.slice.call(document.querySelectorAll("#abilGrid .abgrp"));

  // 1) il favo si richiude: il dado (tratti + centrale) svanisce, i sei esagoni
  //    collassano verso il centro rimpicciolendo, in ordine inverso all'apertura.
  dadoParti.forEach(function(e){ e.animate([{opacity:1},{opacity:0}],{duration:180,fill:"forwards",easing:"ease-in"}); });
  if(centrale) centrale.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease-in"});
  celle.forEach(function(c){ c.style.transformBox="fill-box"; c.style.transformOrigin="center"; });
  celle.forEach(function(c,i){ c.animate([{opacity:1,transform:"scale(1)"},{opacity:0,transform:"scale(.35)"}],{duration:240,delay:(celle.length-1-i)*40,fill:"forwards",easing:"ease-in"}); });

  // 2) misuro (relative al riquadro): centro del favo (sorgente, dove parte il
  //    clone piccolo), poi con uno swap sincrono l'esagono di Abilita' (bersaglio,
  //    dove arriva a grandezza piena). Preservo lo scroll: lo swap accorcia o
  //    allunga un attimo la pagina e il browser lo sposterebbe.
  var syScroll=window.scrollY, sxScroll=window.scrollX;
  var panR=pan.getBoundingClientRect();
  var tr=centrale?centrale.getBoundingClientRect():null;   // sorgente (favo)
  vt.hidden=true; va.hidden=false;
  var panR2=pan.getBoundingClientRect();
  var sr=abHex?abHex.getBoundingClientRect():null;          // bersaglio (esagono)
  var mapR=mapEl.getBoundingClientRect();
  vt.hidden=false; va.hidden=true;
  window.scrollTo(sxScroll, syScroll);

  if(!sr || !tr || !sr.width){   // misura fallita: ripiego sulla dissolvenza
    azzeraTransizione(); va.hidden=false; vt.hidden=true; if(vsEl) vsEl.hidden=true; setTimeout(fine,10); return;
  }

  var tx=(tr.left-panR.left)+tr.width/2, ty=(tr.top-panR.top)+tr.height/2;               // centro sorgente (favo)
  var scx=(mapR.left-panR2.left)+mapR.width/2, scy=(mapR.top-panR2.top)+mapR.height/2;   // centro bersaglio (esagono)

  // Clone ASSOLUTO dell'esagono di Abilita', posato nella sua posizione naturale
  // (identita'), ma con un transform iniziale che lo porta piccolo e ruotato al
  // centro del favo. Clono la SVG vera e le tolgo sigle/puntini/passiva: resta
  // solo l'esagono, identico a quello reale.
  var clone=document.createElement("div");
  clone.setAttribute("data-morphclone","1");
  clone.style.cssText="position:absolute;left:"+(mapR.left-panR2.left).toFixed(1)+"px;top:"+(mapR.top-panR2.top).toFixed(1)+"px;width:"+mapR.width.toFixed(1)+"px;height:"+mapR.height.toFixed(1)+"px;overflow:visible;z-index:5;pointer-events:none;transform-origin:center;";
  var cloneSvg=mapEl.querySelector("svg").cloneNode(true);
  cloneSvg.querySelectorAll(".abvtx,.ppet,.ppval").forEach(function(e){ e.parentNode.removeChild(e); });
  cloneSvg.querySelectorAll(".abhex").forEach(function(h){ h.setAttribute("vector-effect","non-scaling-stroke"); });  // linee sottili anche da piccolo
  cloneSvg.style.width="100%"; cloneSvg.style.height="100%"; cloneSvg.style.display="block"; cloneSvg.style.overflow="visible";
  clone.appendChild(cloneSvg);
  var s=tr.width/sr.width, dx=tx-scx, dy=ty-scy;
  var initT="translate("+dx.toFixed(1)+"px,"+dy.toFixed(1)+"px) rotate(450deg) scale("+s.toFixed(3)+")";
  clone.style.transform=initT;   // parte piccolo e ruotato al centro del favo
  pan.appendChild(clone);

  // 3) dopo che il favo si e' richiuso, passo alla vista Abilita' (esagono vero e
  //    scritte nascosti: li rivelo io) e faccio crescere il clone all'indietro.
  //    Preservo lo scroll cosi' il riquadro resta ancorato dov'e'.
  setTimeout(function(){
    var sy2=window.scrollY, sx2=window.scrollX;
    va.hidden=false; vt.hidden=true; if(vsEl) vsEl.hidden=true;
    if(abHex) abHex.style.opacity="0";
    mapEl.querySelectorAll(".abvtx,.ppet,.ppval").forEach(function(e){ e.style.opacity="0"; });
    grps.forEach(function(g){ g.style.opacity="0"; });
    window.scrollTo(sx2, sy2);

    var slide=clone.animate([
      {transform:initT},
      {transform:"translate(0px,0px) rotate(0deg) scale(1)"}
    ], {duration:640, fill:"forwards", easing:"ease-in-out"});

    // sigle/puntini/passiva e i sei gruppi rientrano in modo da posarsi INSIEME
    // al clone che arriva (niente cascata lunga): cosi' non resta il tempo morto
    // in cui l'esagono e' gia' fermo ma la vista non e' ancora a posto.
    mapEl.querySelectorAll(".abvtx,.ppet,.ppval").forEach(function(e){ e.animate([{opacity:0},{opacity:1}],{duration:200,delay:340,fill:"forwards",easing:"ease"}); });
    grps.forEach(function(g,i){ g.animate([{opacity:0,transform:"translateY(-14px)"},{opacity:1,transform:"translateY(0px)"}],{duration:240,delay:380+i*28,fill:"forwards",easing:"ease-out"}); });

    // appena il clone e' arrivato a grandezza piena, rivelo l'esagono VERO (che
    // gli sta esattamente sotto, identico) e tolgo subito il clone: il passaggio
    // e' invisibile e non c'e' piu' lo scatto del ridisegno tardivo.
    slide.addEventListener("finish", function(){
      if(abHex) abHex.style.opacity="";
      if(clone.parentNode) clone.parentNode.removeChild(clone);
    });

    setTimeout(function(){
      if(clone.parentNode) clone.parentNode.removeChild(clone);   // sicurezza, se "finish" non fosse scattato
      azzeraTransizione();   // a cose gia' ferme: pulisce i residui senza spostare nulla
      va.hidden=false; vt.hidden=true; if(vsEl) vsEl.hidden=true;
      fine();
    }, 780);
  }, 300);
}

/* MORPH — Caratteristiche -> Tiri salvezza (seconda tappa; la prima e' lo
   smontaggio del ragno, gia' fatto da morphSmontaRagno). L'esagono esterno del
   ragno diventa un clone volante e, mentre le sigle e i pallini rimasti
   svaniscono, rimpicciolisce ruotando fino al centro, dove sboccia il favo.
   Stesse regole del favo che sboccia: clone ASSOLUTO dentro il riquadro, mai
   fixed, linee sottili con non-scaling-stroke, scroll preservato. */
function morphStatsVersoTs(vs, vt, fine){
  var NS="http://www.w3.org/2000/svg";
  var pan=document.getElementById("corePanel");
  var slEl=document.getElementById("statsLine");
  var svg=slEl?slEl.querySelector("svg"):null;
  var outerHex=svg?svg.querySelector(".slgrid"):null;   // esagono esterno rimasto dopo lo smontaggio
  var favo=document.querySelector("#tsGrid svg");
  var centrale=favo?favo.querySelector(".tsdadohex"):null;
  var dadoParti=favo?Array.prototype.slice.call(favo.querySelectorAll(".tsemb")):[];
  var celle=favo?Array.prototype.slice.call(favo.querySelectorAll(".tscell")):[];

  // 1) misuro (relative al riquadro): esagono esterno del ragno (sorgente) e
  //    centrale del favo (bersaglio). Swap sincrono, scroll preservato: lo swap
  //    accorcia/allunga un attimo la pagina e il browser la sposterebbe.
  var syScroll=window.scrollY, sxScroll=window.scrollX;
  var panR=pan.getBoundingClientRect();
  var sr=outerHex?outerHex.getBoundingClientRect():null;
  var svgR=svg?svg.getBoundingClientRect():null;
  vs.hidden=true; vt.hidden=false;
  var panR2=pan.getBoundingClientRect();
  var tr=centrale?centrale.getBoundingClientRect():null;
  vs.hidden=false; vt.hidden=true;
  window.scrollTo(sxScroll, syScroll);

  // favo "chiuso": lo faro' sbocciare io
  if(centrale) centrale.style.opacity="0";
  dadoParti.forEach(function(e){ e.style.opacity="0"; });
  celle.forEach(function(c){ c.style.opacity="0"; c.style.transformBox="fill-box"; c.style.transformOrigin="center"; });

  if(!sr || !tr || !sr.width || !svgR){   // misura fallita: ripiego sulla dissolvenza
    azzeraTransizione(); vt.hidden=false; vs.hidden=true; setTimeout(fine,10); return;
  }

  // Clone ASSOLUTO: SVG nuova con la stessa viewBox del ragno, dentro il solo
  // esagono esterno (cosi' e' identico per forma/posizione). Il div e' grande
  // come tutta la SVG del ragno, cosi' l'esagono ci cade nel punto giusto.
  var clone=document.createElement("div");
  clone.setAttribute("data-morphclone","1");
  clone.style.cssText="position:absolute;left:"+(svgR.left-panR.left).toFixed(1)+"px;top:"+(svgR.top-panR.top).toFixed(1)+"px;width:"+svgR.width.toFixed(1)+"px;height:"+svgR.height.toFixed(1)+"px;overflow:visible;z-index:5;pointer-events:none;";
  var cloneSvg=document.createElementNS(NS,"svg");
  cloneSvg.setAttribute("viewBox", svg.getAttribute("viewBox"));
  cloneSvg.style.width="100%"; cloneSvg.style.height="100%"; cloneSvg.style.display="block"; cloneSvg.style.overflow="visible";
  var hx=outerHex.cloneNode(true);
  hx.setAttribute("vector-effect","non-scaling-stroke");   // linea sottile anche da piccolo
  cloneSvg.appendChild(hx); clone.appendChild(cloneSvg); pan.appendChild(clone);

  // il pivot di scala/rotazione e' il CENTRO dell'esagono (non della SVG, che e'
  // larga per far posto alle scritte laterali).
  var hcxDiv=(sr.left-svgR.left)+sr.width/2, hcyDiv=(sr.top-svgR.top)+sr.height/2;
  clone.style.transformOrigin=hcxDiv.toFixed(1)+"px "+hcyDiv.toFixed(1)+"px";
  var hcx=(sr.left-panR.left)+sr.width/2, hcy=(sr.top-panR.top)+sr.height/2;          // centro esagono
  var tx=(tr.left-panR2.left)+tr.width/2, ty=(tr.top-panR2.top)+tr.height/2;          // centro favo
  var s=tr.width/sr.width, dx=tx-hcx, dy=ty-hcy;

  // le sigle e i pallini rimasti dallo smontaggio svaniscono (l'esagono resta,
  // e' il clone). Sfumo l'intera SVG del ragno: l'esagono vero sotto sparisce
  // ma il clone lo rimpiazza, quindi non si nota.
  svg.animate([{opacity:1},{opacity:0}], {duration:200, fill:"forwards", easing:"ease"});

  // 2) dopo la dissolvenza: passo ai TS, il clone rimpicciolisce ruotando fino al
  //    centro e il favo sboccia. Scroll preservato: il riquadro resta ancorato.
  setTimeout(function(){
    var sy2=window.scrollY, sx2=window.scrollX;
    vs.hidden=true; vt.hidden=false;
    window.scrollTo(sx2, sy2);
    clone.animate([
      {transform:"translate(0px,0px) rotate(0deg) scale(1)"},
      {transform:"translate("+dx.toFixed(1)+"px,"+dy.toFixed(1)+"px) rotate(450deg) scale("+s.toFixed(3)+")"}
    ], {duration:680, fill:"forwards", easing:"ease-in-out"});

    // i sei esagoni sbocciano in orario (portano sigle+valori), poi il dado
    celle.forEach(function(c,i){ c.animate([{opacity:0,transform:"scale(.35)"},{opacity:1,transform:"scale(1)"}],{duration:260,delay:340+i*70,fill:"forwards",easing:"ease"}); });
    if(centrale) centrale.animate([{opacity:0},{opacity:1}],{duration:220,delay:640,fill:"forwards",easing:"ease"});
    dadoParti.forEach(function(e,i){ e.animate([{opacity:0},{opacity:1}],{duration:320,delay:820+i*35,fill:"forwards",easing:"ease"}); });

    setTimeout(function(){
      if(clone.parentNode) clone.parentNode.removeChild(clone);
      azzeraTransizione();
      vt.hidden=false; vs.hidden=true;
      fine();
    }, 1220);
  }, 260);
}

/* MORPH — Tiri salvezza -> Caratteristiche (l'inverso dell'andata). Il favo si
   richiude (il dado svanisce, i sei esagoni collassano verso il centro), poi
   l'esagono esterno del ragno cresce dal centro del favo ruotando all'indietro
   fino alla sua posizione, e infine il ragno si ri-assembla (morphMontaRagno,
   lo stesso del ritorno da Abilita'). Clone ASSOLUTO, mai fixed, scroll salvo. */
function morphTsVersoStats(vt, vs, fine){
  var NS="http://www.w3.org/2000/svg";
  var pan=document.getElementById("corePanel");
  var slEl=document.getElementById("statsLine");
  var favo=document.querySelector("#tsGrid svg");
  var centrale=favo?favo.querySelector(".tsdadohex"):null;
  var dadoParti=favo?Array.prototype.slice.call(favo.querySelectorAll(".tsemb")):[];
  var celle=favo?Array.prototype.slice.call(favo.querySelectorAll(".tscell")):[];

  // 1) il favo si richiude: il dado svanisce, i sei esagoni collassano verso il
  //    centro rimpicciolendo, in ordine inverso all'apertura.
  dadoParti.forEach(function(e){ e.animate([{opacity:1},{opacity:0}],{duration:180,fill:"forwards",easing:"ease-in"}); });
  if(centrale) centrale.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease-in"});
  celle.forEach(function(c){ c.style.transformBox="fill-box"; c.style.transformOrigin="center"; });
  celle.forEach(function(c,i){ c.animate([{opacity:1,transform:"scale(1)"},{opacity:0,transform:"scale(.35)"}],{duration:240,delay:(celle.length-1-i)*40,fill:"forwards",easing:"ease-in"}); });

  // 2) misuro (relative al riquadro): centro del favo (sorgente) e l'esagono
  //    esterno del ragno (bersaglio) via swap sincrono. Scroll preservato.
  var syScroll=window.scrollY, sxScroll=window.scrollX;
  var panR=pan.getBoundingClientRect();
  var tr=centrale?centrale.getBoundingClientRect():null;   // sorgente (favo)
  vt.hidden=true; vs.hidden=false;
  var svg=slEl?slEl.querySelector("svg"):null;
  var outerHex=svg?svg.querySelector(".slgrid"):null;
  var panR2=pan.getBoundingClientRect();
  var sr=outerHex?outerHex.getBoundingClientRect():null;   // bersaglio (esagono esterno)
  var svgR=svg?svg.getBoundingClientRect():null;
  vt.hidden=false; vs.hidden=true;
  window.scrollTo(sxScroll, syScroll);

  if(!sr || !tr || !sr.width || !svgR){   // misura fallita: ripiego sulla dissolvenza
    azzeraTransizione(); vs.hidden=false; vt.hidden=true; setTimeout(fine,10); return;
  }

  // Clone ASSOLUTO del solo esagono esterno, posato nella posizione naturale del
  // ragno (identita'), con transform iniziale che lo porta piccolo e ruotato al
  // centro del favo. Cresce ruotando all'indietro fino a combaciare.
  var clone=document.createElement("div");
  clone.setAttribute("data-morphclone","1");
  clone.style.cssText="position:absolute;left:"+(svgR.left-panR2.left).toFixed(1)+"px;top:"+(svgR.top-panR2.top).toFixed(1)+"px;width:"+svgR.width.toFixed(1)+"px;height:"+svgR.height.toFixed(1)+"px;overflow:visible;z-index:5;pointer-events:none;";
  var cloneSvg=document.createElementNS(NS,"svg");
  cloneSvg.setAttribute("viewBox", svg.getAttribute("viewBox"));
  cloneSvg.style.width="100%"; cloneSvg.style.height="100%"; cloneSvg.style.display="block"; cloneSvg.style.overflow="visible";
  var hx=outerHex.cloneNode(true);
  hx.setAttribute("vector-effect","non-scaling-stroke");
  cloneSvg.appendChild(hx); clone.appendChild(cloneSvg); pan.appendChild(clone);

  var hcxDiv=(sr.left-svgR.left)+sr.width/2, hcyDiv=(sr.top-svgR.top)+sr.height/2;
  clone.style.transformOrigin=hcxDiv.toFixed(1)+"px "+hcyDiv.toFixed(1)+"px";
  var hcx=(sr.left-panR2.left)+sr.width/2, hcy=(sr.top-panR2.top)+sr.height/2;   // centro esagono (arrivo)
  var tx=(tr.left-panR.left)+tr.width/2, ty=(tr.top-panR.top)+tr.height/2;       // centro favo (partenza)
  var s=tr.width/sr.width, dx=tx-hcx, dy=ty-hcy;
  var initT="translate("+dx.toFixed(1)+"px,"+dy.toFixed(1)+"px) rotate(450deg) scale("+s.toFixed(3)+")";
  clone.style.transform=initT;   // parte piccolo e ruotato al centro del favo

  // 3) dopo che il favo si e' richiuso: passo alle Caratteristiche, preparo il
  //    ragno in stato SMONTATO ma invisibile (si vede solo il clone che cresce),
  //    poi appena il clone arriva rivelo lo stage smontato e ri-assemblo.
  var avviato=false;
  function riassembla(){
    if(avviato) return; avviato=true;
    if(clone.parentNode) clone.parentNode.removeChild(clone);
    svg.style.transition=""; svg.style.opacity="";
    montatore.anima(function(){
      azzeraTransizione();
      vs.hidden=false; vt.hidden=true;
      fine();
    });
  }
  var montatore;
  setTimeout(function(){
    var sy2=window.scrollY, sx2=window.scrollX;
    vt.hidden=true; vs.hidden=false;
    window.scrollTo(sx2, sy2);
    svg.style.opacity="0";              // nascondo lo stage: durante la crescita si vede solo il clone
    montatore=morphMontaRagno();        // stato smontato statico pronto (esagono + sigle ai vertici + pallini)
    void svg.getBoundingClientRect();

    var grow=clone.animate([
      {transform:initT},
      {transform:"translate(0px,0px) rotate(0deg) scale(1)"}
    ], {duration:640, fill:"forwards", easing:"ease-in-out"});

    // arrivato l'esagono: lo stage smontato appare (identico, dov'e' il clone),
    // poi tolgo il clone e parte il ri-assemblaggio del ragno.
    grow.addEventListener("finish", function(){
      svg.style.transition="opacity .18s ease"; svg.style.opacity="1";
      setTimeout(riassembla, 180);
    });
    setTimeout(function(){ svg.style.opacity="1"; riassembla(); }, 1000);   // sicurezza se "finish" non scatta
  }, 300);
}

/* Azzera ogni residuo di una transizione precedente: annulla le animazioni
   ancora "appese" (la Web Animations API con fill:"forwards" tiene attaccato lo
   stato finale finche' non la si annulla, e quello poteva sovrascrivere le
   posizioni/opacita' nuove: era la causa sia del lampo del grafico sia delle
   abilita' che restavano invisibili) e ripulisce gli stili inline usati dai
   morph. Da chiamare all'inizio di ogni cambio di vista. */
var VISTE=["stats","abil","ts"];
var VISTA_EL={ stats:"viewStats", abil:"viewAbil", ts:"viewTs" };
function elVista(k){ return document.getElementById(VISTA_EL[k]); }

function azzeraTransizione(){
  VISTE.forEach(function(k){
    var el=elVista(k);
    if(el && el.getAnimations) el.getAnimations({subtree:true}).forEach(function(a){ try{ a.cancel(); }catch(e){} });
  });
  var slEl=document.getElementById("statsLine"), vsEl=elVista("stats"), vaEl=elVista("abil"), mapEl=document.getElementById("abilMap"), vtEl=elVista("ts");
  if(slEl){ slEl.style.transform=""; slEl.style.transformOrigin=""; slEl.style.opacity=""; slEl.style.transition=""; }
  [vsEl,vaEl].forEach(function(el){ if(el){ el.style.position=""; el.style.top=""; el.style.left=""; el.style.width=""; el.style.margin=""; el.style.zIndex=""; el.style.opacity=""; el.style.transition=""; } });
  if(mapEl){ mapEl.style.opacity=""; mapEl.style.transition=""; mapEl.style.transform=""; mapEl.style.transformOrigin=""; }
  if(vtEl){ vtEl.style.opacity=""; vtEl.style.transition=""; vtEl.style.transform=""; }
  var panEl=document.getElementById("corePanel"); if(panEl){ panEl.style.height=""; panEl.style.transition=""; }   // altezza sbloccata
  document.querySelectorAll("#abilGrid .abgrp").forEach(function(g){ g.style.opacity=""; g.style.transform=""; });
  document.querySelectorAll("[data-morphclone]").forEach(function(c){ if(c.parentNode) c.parentNode.removeChild(c); });   // cloni volanti rimasti appesi
  // Ridisegno pulito delle tre viste: qualunque residuo di una transizione
  // interrotta sparisce, perche' si riparte sempre dal disegno intero.
  if(typeof renderStats==="function") renderStats();
  if(typeof renderAbil==="function") renderAbil();
  if(typeof renderTs==="function") renderTs();
}

/* Cambia la faccia del riquadro unito (Caratteristiche | Abilita' | Tiri
   salvezza). Con animato=true fa la transizione; senza, cambio secco per
   l'avvio e le ricariche. Col morph sono coperte tutte e sei le direzioni tra le
   tre viste (Caratteristiche/Abilita'/Tiri salvezza); con la dissolvenza il
   passaggio e' invece un cambio morbido e piu' sobrio. */
function mostraVista(v, animato){
  var nuova = (v==="abil"||v==="ts") ? v : "stats";
  var vs=elVista("stats"), va=elVista("abil");   // servono ai morph
  var vecchia = vistaCore;

  function contorno(){
    var tab={ stats:"tabStats", abil:"tabAbil", ts:"tabTs" };
    VISTE.forEach(function(k){ var t=document.getElementById(tab[k]); if(t) t.classList.toggle("on", k===nuova); });
    var ia=document.getElementById("abilInfoBtn"); if(ia) ia.hidden = (nuova!=="abil") || soloLettura;
    var it=document.getElementById("tsInfoBtn");   if(it) it.hidden = (nuova!=="ts")   || soloLettura;
    var pa=document.getElementById("abilHint"); if(pa && nuova!=="abil") pa.hidden=true;
    var pt=document.getElementById("tsHint");   if(pt && nuova!=="ts")   pt.hidden=true;
  }

  function mostraSolo(k){
    VISTE.forEach(function(x){ var el=elVista(x); if(el){ el.hidden = x!==k; el.classList.remove("esce","entra"); } });
  }

  function secco(){
    azzeraTransizione();   // annulla animazioni appese e ridisegna pulito
    vistaCore=nuova;
    mostraSolo(nuova);
    contorno();
  }

  // Avvio, ricariche, chiamate interne: sempre istantaneo.
  if(!animato){ secco(); return; }
  // Durante un'animazione ogni clic sulle linguette viene ignorato.
  if(animandoCore) return;
  // Gia' su quella vista: mostrala e basta.
  if(vistaCore===nuova){ secco(); return; }

  animandoCore=true;
  vistaCore=nuova;
  azzeraTransizione();   // parto da uno stato pulito
  contorno();

  // Quali coppie hanno gia' il morph pronto (le altre usano la dissolvenza).
  var fine0=function(){ animandoCore=false; };
  if(state.transizione==="morph"){
    if(vecchia==="stats" && nuova==="abil"){ morphSmontaRagno(function(){ morphScivolaVersoAbil(vs, va, fine0); }); return; }
    if(vecchia==="abil" && nuova==="stats"){ morphRitornoVersoStats(vs, va, fine0); return; }
    if(vecchia==="abil" && nuova==="ts"){ morphAbilVersoTs(va, elVista("ts"), fine0); return; }
    if(vecchia==="ts" && nuova==="abil"){ morphTsVersoAbil(elVista("ts"), va, fine0); return; }
    if(vecchia==="stats" && nuova==="ts"){ morphSmontaRagno(function(){ morphStatsVersoTs(vs, elVista("ts"), fine0); }); return; }
    if(vecchia==="ts" && nuova==="stats"){ morphTsVersoStats(elVista("ts"), vs, fine0); return; }
  }

  // Dissolvenza generica: la vista attuale si ritira, la nuova entra.
  var usc=elVista(vecchia), ent=elVista(nuova);
  if(usc){ usc.classList.remove("entra"); usc.classList.add("esce"); }
  setTimeout(function(){
    VISTE.forEach(function(x){ if(x!==nuova){ var el=elVista(x); if(el){ el.hidden=true; el.classList.remove("esce","entra"); } } });
    if(ent){ ent.hidden=false; void ent.offsetWidth; ent.classList.add("entra"); }
    setTimeout(function(){ if(ent) ent.classList.remove("entra"); animandoCore=false; }, 360);
  }, 200);
}
document.getElementById("tabStats").addEventListener("click", function(){ mostraVista("stats", true); });
document.getElementById("tabAbil").addEventListener("click", function(){ mostraVista("abil", true); });
document.getElementById("tabTs").addEventListener("click", function(){ mostraVista("ts", true); });
document.getElementById("gearCore").addEventListener("click", function(){
  if(vistaCore==="abil") openAbil(); else if(vistaCore==="ts") openTs(); else openStats();
});
mostraVista("stats");   // si parte dalle Caratteristiche

/* Le abilita' si scelgono qui: un clic gira fra Nessuna, Competenza e
   Maestria. Ridisegno tutto perche' il numero cambia anche in scheda, e la
   percezione passiva si muove insieme alla Percezione. */
document.getElementById("abilSel").addEventListener("click", function(e){
  var b = e.target && e.target.closest ? e.target.closest("[data-abilsel]") : null;
  if(!b || soloLettura) return;
  giraAbil(b.getAttribute("data-abilsel"));
  renderAll();
  aggiornaSalva();
});
/* Cambiare la classe iniziale sposta le competenze: si ridisegna tutto e il
   tasto Salva si accende da solo, perche' questa scelta finisce nella scheda. */
document.getElementById("tsIni").addEventListener("change", function(){
  var v=this.value;
  if(state.classes.some(function(c){ return c.key===v; })){ state.classeIniziale=v; renderAll(); aggiornaSalva(); }
});

/* Tasto informazioni col fumetto. Col mouse compare dopo mezzo secondo di
   sosta, cosi' non lampeggia se ci si passa sopra per caso, e sparisce appena
   ci si allontana. Col dito si apre e si chiude toccando, perche' sul telefono
   il passaggio del mouse non esiste.
   Vale per ogni riquadro che ne ha bisogno: si passa la coppia tasto/fumetto. */
function collegaInfo(idBtn, idPop){
  var btn=document.getElementById(idBtn), pop=document.getElementById(idPop);
  if(!btn || !pop) return;
  var attesa=null;
  function mostraInfo(){ clearTimeout(attesa); attesa=null; pop.hidden=false; btn.classList.add("on"); }
  function nascondiInfo(){ clearTimeout(attesa); attesa=null; pop.hidden=true; btn.classList.remove("on"); }
  btn.addEventListener("mouseenter", function(){ clearTimeout(attesa); attesa=setTimeout(mostraInfo, 500); });
  btn.addEventListener("mouseleave", nascondiInfo);
  btn.addEventListener("focus", mostraInfo);
  btn.addEventListener("blur", nascondiInfo);
  btn.addEventListener("click", function(e){
    e.stopPropagation();
    if(pop.hidden) mostraInfo(); else nascondiInfo();
  });
  // toccando altrove il fumetto si chiude
  document.addEventListener("click", function(e){
    if(!pop.hidden && !btn.contains(e.target) && !pop.contains(e.target)) nascondiInfo();
  });
}
collegaInfo("tsInfoBtn", "tsHint");
collegaInfo("abilInfoBtn", "abilHint");
collegaInfo("dif_ca_i", "dif_ca_pop");
collegaInfo("dif_iniz_i", "dif_iniz_pop");
collegaInfo("dif_vel_i", "dif_vel_pop");

/* Luce su richiesta: passando il mouse su una caratteristica - il suo vertice
   nell'esagono o il suo gruppo di abilita' - si accendono insieme. Delega sul
   riquadro, cosi' regge i ridisegni; e' solo un effetto, non tocca i dati. */
(function(){
  var pan=document.getElementById("corePanel"); if(!pan) return;
  var acceso=null;
  function illumina(car){
    if(acceso===car) return;
    if(acceso) pan.querySelectorAll('[data-car="'+acceso+'"]').forEach(function(e){ e.classList.remove("acceso"); });
    acceso=car;
    if(car) pan.querySelectorAll('[data-car="'+car+'"]').forEach(function(e){ e.classList.add("acceso"); });
  }
  pan.addEventListener("mouseover", function(e){
    var t=e.target.closest ? e.target.closest("[data-car]") : null;
    illumina(t ? t.getAttribute("data-car") : null);
  });
  pan.addEventListener("mouseleave", function(){ illumina(null); });
})();
document.addEventListener("keydown", function(e){
  if(e.key!=="Escape") return;
  // Esc chiude una finestra alla volta: se il mazzo è aperto, chiude solo quello
  var mt=document.getElementById("modalTalenti");
  if(mt && !mt.hidden){ chiudiTalenti(); return; }
  closeAll();
});
window.addEventListener("resize", function(){
  apply();
  if(!modalName.hidden) positionDialog(document.getElementById("dialogName"));
});

document.getElementById("xpInput").addEventListener("input", function(e){ setXP(e.target.value); });
document.getElementById("modalXp").addEventListener("click", function(e){
  var q=e.target.closest("[data-xp]"); if(!q) return;
  setXP(state.xp + parseInt(q.getAttribute("data-xp"),10));
  document.getElementById("xpInput").value=state.xp;
});

elName.addEventListener("input", function(){ apply(); });
elName.addEventListener("keydown", function(e){ if(e.key==="Enter"){ e.preventDefault(); elName.blur(); } });
elFont.addEventListener("change", function(e){ state.font=e.target.value; apply(); });
elEmblem.addEventListener("change", function(e){ state.emblemMode=e.target.value; apply(); });
document.getElementById("size").addEventListener("input", function(e){ state.size=parseInt(e.target.value,10); apply(); });

document.addEventListener("click", function(e){
  // Solo i veri pulsanti del point-buy (hanno data-car E data-verso). Senza il
  // secondo attributo qui finivano anche i nomi e i vertici della vista
  // Abilita' (data-car per l'effetto luce): cliccarli mandava un "verso" NaN
  // dentro cambiaPb e azzerava la caratteristica a NaN.
  var pb=e.target.closest("[data-car][data-verso]");
  if(pb && !pb.disabled){ statAtt=pb.getAttribute("data-car"); cambiaPb(pb.getAttribute("data-car"), parseInt(pb.getAttribute("data-verso"),10)); return; }
  var pk=e.target.closest("[data-pick]");
  if(pk){ statAtt=pk.getAttribute("data-pick"); renderStatsDialog(); return; }
  var ev=e.target.closest("[data-evid]");
  if(ev){ state.statsEvid=(ev.getAttribute("data-evid")==="on"); renderStats(); sincronizzaExtra("stats"); aggiornaSalva(); return; }
  var trz=e.target.closest("[data-transiz]");
  if(trz){ state.transizione=(trz.getAttribute("data-transiz")==="dissolvenza")?"dissolvenza":"morph"; setActive("data-transiz", state.transizione); aggiornaSalva(); return; }
  var r=e.target.closest("[data-reset]"); if(r){ askReset(r.getAttribute("data-reset")); return; }
  var no=e.target.closest("[data-cancel]"); if(no){ cancelReset(no.getAttribute("data-cancel")); return; }
  var yes=e.target.closest("[data-yes]"); if(yes){ doReset(yes.getAttribute("data-yes")); return; }
  var xs=e.target.closest("[data-xpstyle]"); if(xs){ state.xpStyle=xs.getAttribute("data-xpstyle"); renderAll(); return; }
  var cl=e.target.closest("[data-close]");
  if(cl){
    // il mazzo si chiude da solo (una finestra alla volta): si torna alla lista
    if(cl.getAttribute("data-close")==="talenti"){ chiudiTalenti(); return; }
    closeAll(); return;
  }
  var sg=e.target.closest(".sugsw"); if(sg){ capPicker.setHex(sg.getAttribute("data-hex")); return; }
  var el=e.target.closest("[data-align],[data-fmt],[data-upper],[data-label]"); if(!el) return;
  if(el.hasAttribute("data-align")) state.align=el.getAttribute("data-align");
  if(el.hasAttribute("data-fmt")){ var k=el.getAttribute("data-fmt"); state[k]=!state[k]; }
  if(el.hasAttribute("data-upper")) state.upper=el.getAttribute("data-upper")==="on";
  if(el.hasAttribute("data-label")) state.label=el.getAttribute("data-label")==="on";
  apply();
});

var wheel=document.getElementById("wheel");
wheel.addEventListener("click", function(e){
  var s=e.target.closest(".slice"); if(!s) return;
  var key=s.getAttribute("data-key");
  // classe già scelta che ha raggiunto il livello della sottoclasse → entra nella scelta
  if(!soloLettura && classeEleggibileSott(key)){ apriSottoclassi(key); return; }
  addClass(key);
});
wheel.addEventListener("mouseover", function(e){ var s=e.target.closest(".slice"); if(s) setHub(s.getAttribute("data-key")); });
wheel.addEventListener("mouseleave", function(){ setHub(null); });

document.getElementById("chosen").addEventListener("click", function(e){
  var b=e.target.closest("[data-act]"); if(!b) return;
  var act=b.getAttribute("data-act"), key=b.getAttribute("data-key");
  if(act==="del") removeClass(key);
  else if(act==="lvlinc") changeLevel(key,+1);
  else if(act==="lvldec") changeLevel(key,-1);
});

/* ================= AVVIO ================= */
document.getElementById("unifFont").addEventListener("click", function(){ uniforma("font", true); });
document.getElementById("unifColore").addEventListener("click", function(){ uniforma("colore", true); });
document.getElementById("unifFmt").addEventListener("click", function(){ uniforma("fmt", true); });
document.getElementById("unifVia").addEventListener("click", function(){ uniforma("tutto", false); });

var namePicker=makePicker(document.getElementById("namePicker"), state.nameColor, function(hex){ state.nameColor=hex; apply(); renderLevel(); renderCapSuggestions(); });
var statsFermo=false;
var statsPicker=makePicker(document.getElementById("statsPicker"), state.statsColor, function(hex){ if(statsFermo) return; state.statsColor=hex; renderStats(); aggiornaSalva(); });
/* I due colori dei tiri salvezza. Il "fermo" serve a non far scattare il
   salvataggio quando siamo noi a rimettere il selettore sul valore giusto. */
var tsFermo=false;
var tsCompPicker=makePicker(document.getElementById("tsCompPicker"), state.tsCompColor, function(hex){ if(tsFermo) return; state.tsCompColor=hex; renderTs(); aggiornaSalva(); });
var tsDadoPicker=makePicker(document.getElementById("tsDadoPicker"), state.tsDadoColor, function(hex){ if(tsFermo) return; state.tsDadoColor=hex; renderTs(); aggiornaSalva(); });

/* Colore delle caratteristiche: il menu' a tendina sceglie quale, la tavolozza
   le da' il colore. Esagono e gruppo si aggiornano insieme perche' leggono da
   colCar. Il "fermo" evita di accendere il Salva quando siamo noi a rimettere
   la tavolozza sul valore giusto scegliendo dal menu'. */
var abilFermo=false;
(function(){
  var menuCar=document.getElementById("abilCarSel");
  if(menuCar){
    menuCar.innerHTML=CARATT.map(function(c){ return '<option value="'+c.k+'">'+c.nome+'</option>'; }).join("");
    menuCar.addEventListener("change", function(){
      abilFermo=true;
      try{ abilCarPicker.setHex(colCar(this.value)); } finally{ abilFermo=false; }
    });
  }
})();
var abilCarPicker=makePicker(document.getElementById("abilCarPicker"), colCar("for"), function(hex){
  if(abilFermo) return;
  var k=(document.getElementById("abilCarSel")||{}).value || "for";
  state.abilCarColore[k]=hex; renderAbil(); aggiornaSalva();
});
var capPicker=makePicker(document.getElementById("capPicker"), state.capColor, function(hex){ state.capColor=hex; apply(); });
var xpPicker1=makePicker(document.getElementById("xpPicker1"), state.xpColor1, function(hex){ state.xpColor1=hex; renderLevel(); });
var xpPicker2=makePicker(document.getElementById("xpPicker2"), state.xpColor2, function(hex){ state.xpColor2=hex; renderLevel(); });
var hpFermo=false;
var hpPienoPicker=makePicker(document.getElementById("hpPienoPicker"), state.hpColorPieno, function(hex){ if(hpFermo) return; state.hpColorPieno=hex; dipingiSaluteHp(); aggiornaSalva(); });
var hpFeritoPicker=makePicker(document.getElementById("hpFeritoPicker"), state.hpColorFerito, function(hex){ if(hpFermo) return; state.hpColorFerito=hex; dipingiSaluteHp(); aggiornaSalva(); });
var hpCriticoPicker=makePicker(document.getElementById("hpCriticoPicker"), state.hpColorCritico, function(hex){ if(hpFermo) return; state.hpColorCritico=hex; dipingiSaluteHp(); aggiornaSalva(); });
var difFermo=false;
var difIcoPicker=makePicker(document.getElementById("difIcoPicker"), state.difIcoColor, function(hex){ if(difFermo) return; state.difIcoColor=hex; renderDif(); aggiornaSalva(); });
buildWheel();

/* Riallinea tutti i comandi allo stato appena caricato */
function sincronizzaComandi(){
  elFont.value=state.font;
  elEmblem.value=state.emblemMode;
  document.getElementById("size").value=state.size;
  document.getElementById("xpInput").value=state.xp;
  namePicker.setHex(state.nameColor);
  capPicker.setHex(state.capColor);
  xpPicker1.setHex(state.xpColor1);
  xpPicker2.setHex(state.xpColor2);
  sincronizzaExtra("stats");
  var _dc=apertaAspetto(); if(_dc) sincronizzaSel(_dc);
  renderCapSuggestions();
  renderAll();
}

var TESTO_PAUSA  = "La tua scheda \u00E8 stata messa momentaneamente in pausa, per sapere perch\u00E9 apri ticket e chiedi informazioni allo staff.";
var TESTO_ATTESA = "Il tuo accesso \u00E8 stato inviato, rimani in attesa di un'approvazione.";
var TESTO_TOLTO  = "Il tuo accesso \u00E8 stato momentaneamente rimosso. I tempi di attesa saranno lunghi\u2026 speriamo di no.";

var statoOra="", uscitaForzata=false;

/* Una sola regola per decidere cosa vede la persona, usata sia all'avvio sia
   quando arriva un cambiamento in diretta. La pausa viene prima dell'accesso:
   se uno e' in pausa non importa che sia approvato. */
function decidiSchermata(dati){
  var dev = ruoli.indexOf("sviluppatore")>=0;
  if(dati.in_pausa && !dev) return "pausa";
  if(!dati.approvato && !dev) return "attesa";
  return "sheet";
}

function mostraBlocco(quale, dati){
  statoOra = quale;
  closeAll();
  var chi = (dati.nome || dati.username) || "";
  if(quale==="pausa"){
    document.getElementById("pausaChi").textContent = chi ? "Sei entrato come " + chi + "." : "";
    document.getElementById("pausaTesto").textContent = TESTO_PAUSA;
  } else {
    document.getElementById("attesaChi").textContent = chi ? "Sei entrato come " + chi + "." : "";
    document.getElementById("attesaTesto").textContent = dati.accesso_tolto_il ? TESTO_TOLTO : TESTO_ATTESA;
  }
  mostra(quale);
}

/* Arriva un cambiamento mentre la persona sta usando il sito: si chiude
   subito, senza aspettare che ricarichi. Quello che non aveva salvato lo
   perde: e' esattamente il senso della pausa. */
function cambioStato(dati){
  if(!dati) return;
  var vuole = decidiSchermata(dati);
  if(vuole===statoOra) return;
  if(vuole==="sheet"){ uscitaForzata=true; location.reload(); return; }  // riammesso: riparto pulito
  mostraBlocco(vuole, dati);
}

var CAMPI_MIEI = "username,nome,approvato,in_pausa,accesso_tolto_il";

/* Le posizioni cambiano mentre uno sta usando il sito: il potere gliel'ha
   gia' tolto il database, ma il sito continuerebbe a disegnargli i pulsanti
   di prima finche' non ricarica. Qui si riconfigura da solo. */
/* Il nav è visibile a tutti (serve il menù a tendina Scheda/Tratti/Equip. per
   saltare tra le pagine); "Controllo" invece solo per lo staff. */
function aggiornaNav(){
  var nav=document.getElementById("nav"); if(nav) nav.hidden=false;
  var tc=document.getElementById("tabControllo"); if(tc) tc.hidden=!ruoli.length;
}
function applicaRuoli(){
  aggiornaNav();

  // l'elenco del Controllo va riletto: con le posizioni nuove il database
  // risponde in modo diverso, e alcune colonne potrebbero non spettargli piu'
  ctrlCaricato=false;
  document.getElementById("ruoliBlock").hidden = !puoStaff();
  preparaOrdini();   // "livello" e "XP" spariscono a chi le schede non spettano piu'

  var suControllo = !document.getElementById("paneControllo").hidden;
  if(suControllo && !ruoli.length){ mostraPane("scheda"); }
  else if(suControllo){ caricaControllo(); }

  if(bersaglio){
    if(!puoVedereSchede()){
      // non gli spetta piu' vederla: si torna alla sua senza chiedere niente,
      // perche' non ha piu' il diritto di salvare quello che ha cambiato
      salvato=foto();
      caricaLaMia();
    } else {
      modoScheda();   // magari da qui in poi la puo' solo guardare
    }
  }
}

/* Una sola funzione che rilegge chi sei e cosa puoi: la chiamano sia la
   diretta sia la rete di sicurezza. */
function ricontrolla(){
  if(!utente) return;
  Promise.all([
    sb.from("ruoli").select("ruolo").eq("user_id", utente.id),
    sb.from("profili").select(CAMPI_MIEI).eq("user_id", utente.id).maybeSingle()
  ]).then(function(r){
    // rete ballerina: si riprova al giro dopo, senza combinare guai
    if(r[0].error || r[1].error) return;
    var nuovi = (r[0].data||[]).map(function(x){ return x.ruolo; });
    var cambiati = nuovi.slice().sort().join(",") !== ruoli.slice().sort().join(",");
    ruoli = nuovi;
    if(cambiati){
      disegnaAuthbar();   // le etichette accanto al nome
      applicaRuoli();
    }
    cambioStato(r[1].data);   // pausa e accesso: possono chiudere tutto
  }).catch(function(){});
}

function ascoltaProfilo(){
  try{
    sb.channel("mio-stato-"+utente.id)
      .on("postgres_changes",
          { event:"UPDATE", schema:"public", table:"profili", filter:"user_id=eq."+utente.id },
          function(msg){ cambioStato(msg && msg.new); })
      .on("postgres_changes",
          { event:"*", schema:"public", table:"ruoli", filter:"user_id=eq."+utente.id },
          function(){ ricontrolla(); })   // arriva la notizia, ma la verita' si richiede al database
      .subscribe();
  }catch(e){
    // se la diretta non parte il sito funziona lo stesso: il database rifiuta
    // comunque, e al rientro sulla scheda del browser si ricontrolla
    console.warn("la diretta non e' partita:", e);
  }
}

// rete di sicurezza: tornando sulla scheda del browser si ricontrolla comunque
document.addEventListener("visibilitychange", function(){
  if(document.visibilityState!=="visible") return;
  ricontrolla();
});

function mostra(quale){
  document.getElementById("boot").hidden = quale!=="boot";
  document.getElementById("loginScreen").hidden = quale!=="login";
  document.getElementById("attesaScreen").hidden = quale!=="attesa";
  document.getElementById("pausaScreen").hidden = quale!=="pausa";
  document.getElementById("sheet").hidden = quale!=="sheet";
}

/* ================= SEZIONE CONTROLLO ================= */

function mostraPane(quale){
  var sched = quale!=="controllo";
  document.getElementById("paneScheda").hidden = !sched;
  document.getElementById("paneControllo").hidden = sched;
  document.getElementById("tabScheda").classList.toggle("on", sched);
  document.getElementById("tabControllo").classList.toggle("on", !sched);
  if(sched){ apply(); }        // tornando sulla scheda il nome va rimisurato
  else { caricaControllo(); }
}

var ctrlCaricato=false, profiliCache=[], ruoliDi={};

/* Chi puo' cosa. Le stesse regole stanno anche nel database, che e' quello
   che decide davvero: qui servono solo a non mostrare tasti che verrebbero
   rifiutati. Il fondatore non compare negli accessi: assegna le posizioni. */
function puoAssegnare(){ return haRuolo("fondatore") || haRuolo("sviluppatore"); }
function puoDareAccesso(){ return haRuolo("sviluppatore") || haRuolo("stella") || haRuolo("supporto"); }
function puoTogliereAccesso(){ return haRuolo("sviluppatore") || haRuolo("stella") || haRuolo("moderazione"); }
function puoPausare(){ return haRuolo("sviluppatore") || haRuolo("stella") || haRuolo("moderazione"); }
function puoStaff(){ return puoAssegnare() || puoDareAccesso() || puoTogliereAccesso() || puoPausare(); }
/* Le schede: il master guarda, il supporto mette le mani, lo sviluppatore fa
   tutto. Moderazione, fondatore e stella non le vedono proprio: il database
   non gliele darebbe comunque, qui si evita solo di chiedergliele. */
function puoVedereSchede(){ return haRuolo("master") || haRuolo("supporto") || haRuolo("sviluppatore"); }
function puoToccareSchede(){ return haRuolo("supporto") || haRuolo("sviluppatore"); }

function nickCell(p){
  var disp = p.nome && p.nome!==p.username ? ' <small>('+esc(p.nome)+')</small>' : '';
  return '<span class="nick">' + (p.avatar_url ? '<img src="'+esc(p.avatar_url)+'" alt="">' : '')
       + '<span>'+esc(p.username||"?")+disp+'</span></span>';
}

function caricaControllo(){
  if(ctrlCaricato) return;
  ctrlCaricato=true;
  var body=document.getElementById("tblBody");
  body.innerHTML='<tr><td colspan="5" class="ctrlmsg">Carico l\'elenco\u2026</td></tr>';

  var richieste=[
    sb.from("profili").select("user_id,discord_id,username,nome,avatar_url,approvato,in_pausa,ultimo_accesso"),
    puoVedereSchede() ? sb.from("schede").select("user_id,dati,origine_sbloccata") : Promise.resolve({ data:[], error:null }),
    sb.from("ruoli").select("user_id,ruolo")
  ];

  Promise.all(richieste).then(function(r){
    var err = r[0].error || r[1].error || (r[2] && r[2].error);
    if(err){
      ctrlCaricato=false;
      body.innerHTML='<tr><td colspan="4" class="ctrlmsg">Non riesco a leggere l\'elenco: '+esc(err.message)+'</td></tr>';
      console.error(err);
      return;
    }
    profiliCache = (r[0].data||[]).slice().sort(function(a,b){
      return String(a.username||"").localeCompare(String(b.username||""));
    });
    mappaRuoli(r[2] ? (r[2].data||[]) : []);
    schedeCache={}; sbloccoCache={};
    (r[1].data||[]).forEach(function(x){ schedeCache[x.user_id]=x.dati||{}; sbloccoCache[x.user_id]=!!x.origine_sbloccata; });
    preparaOrdini();
    disegnaPersonaggi();
    if(puoStaff()){
      disegnaRuoli();
      document.getElementById("ruoliBlock").hidden=false;
    }
    initPrivBlock();   // gestione privilegi di classe (solo supporto/sviluppatore)
  }).catch(function(e){
    ctrlCaricato=false;
    body.innerHTML='<tr><td colspan="4" class="ctrlmsg">Qualcosa non ha risposto: riprova con Aggiorna.</td></tr>';
    console.error(e);
  });
}

function inAttesa(p){
  // una posizione non vale piu' come accesso: il via libera lo deve avere
  // chiunque. L'unico che entra sempre e' lo sviluppatore.
  return !p.approvato && (ruoliDi[p.user_id]||[]).indexOf("sviluppatore")<0;
}

var schedeCache={}, sbloccoCache={}, cerca="", ordine="nick";

/* Le voci dell'ordinamento dipendono da cosa uno puo' vedere: a chi le schede
   sono chiuse non ha senso proporre "livello" o "XP", che non gli arrivano. */
function ORDINI(){
  var v=[["nick","Nick Discord (A-Z)"]];
  if(puoVedereSchede()) v=v.concat([
    ["pg",   "Nome del personaggio (A-Z)"],
    ["lv",   "Livello (dal piu' alto)"],
    ["xp",   "XP (dal piu' alto)"]
  ]);
  v.push(["accesso","Ultimo accesso (dal piu' recente)"]);
  return v;
}
function preparaOrdini(){
  var menuOrd=document.getElementById("ordinePg"), v=ORDINI();
  if(!v.some(function(x){ return x[0]===ordine; })) ordine="nick";
  menuOrd.innerHTML = v.map(function(x){
    return '<option value="'+x[0]+'">'+esc(x[1])+'</option>';
  }).join("");
  menuOrd.value=ordine;
}

/* Data leggibile invece di un timbro del database. */
function quando(iso){
  if(!iso) return '<span class="vuoto">mai</span>';
  var d=new Date(iso); if(isNaN(d)) return '<span class="vuoto">&mdash;</span>';
  var ora=d.toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"});
  var oggi=new Date(), ieri=new Date(); ieri.setDate(oggi.getDate()-1);
  function stessoGiorno(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
  if(stessoGiorno(d,oggi)) return '<span class="quando">oggi alle '+ora+'</span>';
  if(stessoGiorno(d,ieri)) return '<span class="quando">ieri alle '+ora+'</span>';
  return '<span class="quando">'+d.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"2-digit"})+'</span>';
}

function nomePg(id){
  var d=schedeCache[id]||{};
  return (typeof d.name==="string" && d.name.trim()) ? d.name.trim() : "";
}
function xpDi(id){
  var d=schedeCache[id]||{};
  return (typeof d.xp==="number" && isFinite(d.xp) && d.xp>=0) ? d.xp : 0;
}

function filtraOrdina(){
  var q = cerca.trim().toLowerCase();
  var v = profiliCache.filter(function(p){
    if(!q) return true;
    var dove = [p.username||"", p.nome||""];
    if(puoVedereSchede()) dove.push(nomePg(p.user_id));
    return dove.join(" \u00B7 ").toLowerCase().indexOf(q)>=0;
  });
  function testo(a){ return String(a||"").toLowerCase(); }
  return v.sort(function(a,b){
    if(ordine==="pg"){
      var na=nomePg(a.user_id), nb=nomePg(b.user_id);
      // chi non ha ancora un personaggio va in fondo, non in cima all'ordine
      if(!na !== !nb) return na ? -1 : 1;
      if(na!==nb) return testo(na).localeCompare(testo(nb));
    }
    else if(ordine==="lv" || ordine==="xp"){
      var xa=xpDi(a.user_id), xb=xpDi(b.user_id);
      var ha=Object.prototype.hasOwnProperty.call(schedeCache,a.user_id);
      var hb=Object.prototype.hasOwnProperty.call(schedeCache,b.user_id);
      if(ha!==hb) return ha ? -1 : 1;   // senza scheda, in fondo
      if(xa!==xb) return xb-xa;
    }
    else if(ordine==="accesso"){
      var ta=a.ultimo_accesso ? Date.parse(a.ultimo_accesso) : -1;
      var tb=b.ultimo_accesso ? Date.parse(b.ultimo_accesso) : -1;
      if(ta!==tb) return tb-ta;
    }
    return testo(a.username).localeCompare(testo(b.username));   // a parita', il nick
  });
}

function disegnaPersonaggi(){
  var body=document.getElementById("tblBody");
  var vede=puoVedereSchede();

  // Chi le schede non le vede si ferma al nick e allo stato: le colonne del
  // personaggio resterebbero vuote e farebbero solo credere che manchi qualcosa.
  document.getElementById("tblHead").innerHTML = vede
    ? '<th>Nick Discord</th><th>Personaggio</th><th>Livello</th><th>XP totale</th><th>Ultimo accesso</th><th></th>'
    : '<th>Nick Discord</th><th>Ultimo accesso</th>';
  var quante = vede ? 6 : 2;

  var lista = filtraOrdina();
  var attesa = profiliCache.filter(inAttesa).length;
  var q = cerca.trim();
  document.getElementById("btnCercaVia").hidden = !q;
  document.getElementById("ctrlNote").textContent = q
    ? lista.length + (lista.length===1 ? " persona trovata" : " persone trovate") + " su " + profiliCache.length
    : profiliCache.length + (profiliCache.length===1 ? " persona registrata" : " persone registrate")
      + (attesa ? " \u00B7 " + attesa + " in attesa di via libera" : "");

  if(!profiliCache.length){
    body.innerHTML='<tr><td colspan="'+quante+'" class="ctrlmsg">Non risulta registrato nessuno.</td></tr>';
    return;
  }
  if(!lista.length){
    body.innerHTML='<tr><td colspan="'+quante+'" class="ctrlmsg">Nessuno corrisponde a \u201C'+esc(q)+'\u201D.</td></tr>';
    return;
  }
  body.innerHTML = lista.map(function(p){
    var marchio = inAttesa(p) ? '<span class="attesa">in attesa</span>' : '';
    if(p.in_pausa) marchio += ' <span class="tag-pausa">in pausa</span>';
    var prima = '<td>'+nickCell(p)+marchio+'</td>';
    if(!vede) return '<tr>'+prima+'<td>'+quando(p.ultimo_accesso)+'</td></tr>';

    var haScheda = Object.prototype.hasOwnProperty.call(schedeCache, p.user_id);
    var nm = nomePg(p.user_id);
    var pg = nm ? esc(nm) : '<span class="vuoto">senza nome</span>';
    var lv = haScheda ? levelFromXP(xpDi(p.user_id)) : '<span class="vuoto">&mdash;</span>';
    var xt = haScheda ? numIt(xpDi(p.user_id)) : '<span class="vuoto">nessuna scheda</span>';
    var apri = (p.user_id===utente.id)
      ? '<span class="vuoto">la tua</span>'
      : '<button class="btn-apri" data-apri="'+esc(p.user_id)+'">'+(puoToccareSchede()?"Apri":"Guarda")+'</button>';
    // l'interruttore dello sblocco del +1 d'origine: solo staff che tocca le
    // schede, per chi ha un talento d'origine col +1. Sulla PROPRIA riga il
    // supporto non ce l'ha (deve sempre essere un'altra persona ad approvare e
    // sbloccare); lo SVILUPPATORE invece può fare tutto, anche la propria.
    var sblocco = '';
    var suDiMe = (p.user_id===utente.id);
    if(puoToccareSchede() && (!suDiMe || haRuolo("sviluppatore")) && origineHaPiuUno(p.user_id)){
      var sbl = !!sbloccoCache[p.user_id];
      sblocco = '<button class="chip c-sblocco'+(sbl?' on':'')+'" data-sblocca="'+esc(p.user_id)
        + '" title="'+(sbl?'Il +1 del talento d’origine è sbloccato — clic per ri-bloccarlo'
                          :'Sblocca il +1 del talento d’origine (missione di lore fatta)')+'">'
        + (sbl?'🔓 +1 sbloccato':'🔒 +1 origine')+'</button>';
    }
    return '<tr>'+prima+'<td class="pgname">'+pg+'</td>'
         + '<td class="lv">'+lv+'</td><td class="xp">'+xt+'</td>'
         + '<td>'+quando(p.ultimo_accesso)+'</td>'
         + '<td><div class="ctrl-azioni">'+apri+sblocco+'</div></td></tr>';
  }).join("");
}

/* la scheda ha un talento d'origine che porta un +1 (fisso o a scelta)? Per la
   MIA scheda aperta uso lo stato vivo (vale anche se non l'ho ancora salvata,
   utile allo sviluppatore sulla propria riga); per gli altri l'elenco dal
   database. Se i talenti non sono ancora caricati mostro comunque il comando. */
function origineHaPiuUno(id){
  var o;
  if(id===utente.id && !bersaglio) o = state.talenti.origine;
  else { var d=schedeCache[id]; o = d && d.talenti && d.talenti.origine; }
  if(!Array.isArray(o) || !o.length) return false;
  var t=talentoById(o[0]);
  if(!t) return true;
  return t.tipo_asi==="fisso" || t.tipo_asi==="scelta";
}

/* accende/spegne lo sblocco del +1 d'origine, scrivendo la colonna
   schede.origine_sbloccata (non tocca il blob dati del personaggio) */
function toggleSbloccoOrigine(id, btn){
  if(!puoToccareSchede()) return;
  var msg=document.getElementById("ctrlMsg"); if(msg) msg.textContent="";
  btn.disabled=true;
  var nuovo = !sbloccoCache[id];
  sb.from("schede").update({ origine_sbloccata: nuovo }).eq("user_id", id).then(function(res){
    if(res && res.error){
      if(msg) msg.textContent="Non sono riuscito a cambiare lo sblocco: "+res.error.message;
      btn.disabled=false; console.error(res.error); return;
    }
    sbloccoCache[id]=nuovo;
    // se è la scheda aperta in questo momento (la mia o quella che sto guardando),
    // aggiorno subito lo stato vivo e ridisegno: il +1 si vede senza ricaricare
    if(id===(bersaglio||utente.id)){ state.talenti.sbloccoOrigine=nuovo; renderAll(); }
    disegnaPersonaggi();
  }).catch(function(e){
    btn.disabled=false; if(msg) msg.textContent="Qualcosa non ha risposto: riprova.";
    console.error(e);
  });
}


/* ---- pannello dello staff ---- */
var ASSEGNABILI=[
  { k:"fondatore",   soloDev:true  },
  { k:"stella",      soloDev:true  },
  { k:"master",      soloDev:false },
  { k:"supporto",    soloDev:false },
  { k:"moderazione", soloDev:false }
];

function mappaRuoli(righe){
  ruoliDi={};
  righe.forEach(function(x){
    (ruoliDi[x.user_id]=ruoliDi[x.user_id]||[]).push(x.ruolo);
  });
}
function msgRuoli(t){ document.getElementById("ruoliErr").textContent=t||""; }

function noteStaff(){
  var v=[];
  if(puoDareAccesso() && puoTogliereAccesso()) v.push("dai e togli l'accesso");
  else if(puoDareAccesso()) v.push("dai l'accesso");
  else if(puoTogliereAccesso()) v.push("togli l'accesso");
  if(puoPausare()) v.push("metti in pausa");
  if(haRuolo("sviluppatore")) v.push("assegni tutte le posizioni tranne sviluppatore");
  else if(haRuolo("fondatore")) v.push("assegni master, supporto e moderazione");
  return v.join(" \u00B7 ");
}

function disegnaRuoli(){
  var dev = haRuolo("sviluppatore");
  var body = document.getElementById("ruoliBody");
  document.getElementById("ruoliNote").textContent = noteStaff();

  if(!profiliCache.length){
    body.innerHTML='<tr><td colspan="2" class="ctrlmsg">Non risulta registrato nessuno.</td></tr>';
    return;
  }
  body.innerHTML = profiliCache.map(function(p){
    var suoi = ruoliDi[p.user_id]||[];
    var sonoIo = (p.user_id===utente.id);
    var loroDev = suoi.indexOf("sviluppatore")>=0;
    var pezzi = [];

    // 1. l'accesso: e' quello che decide se la persona entra o resta fuori
    var acceso = p.approvato || loroDev;
    var possoAccesso = !sonoIo && !loroDev && (acceso ? puoTogliereAccesso() : puoDareAccesso());
    var perche = sonoIo ? "non puoi cambiare il tuo accesso"
               : loroDev ? "lo sviluppatore non si chiude fuori"
               : acceso ? "non hai il permesso di togliere l'accesso"
               : "non hai il permesso di dare l'accesso";
    pezzi.push('<button class="chip c-accesso'+(acceso?' on':'')+'" data-user="'+esc(p.user_id)
             + '" data-azione="accesso"'+(possoAccesso?'':' disabled title="'+perche+'"')+'>accesso</button>');

    // 2. la pausa: congela la scheda mentre la moderazione decide
    var possoPausa = !sonoIo && !loroDev && puoPausare();
    var perchePausa = sonoIo ? "non puoi mettere in pausa te stesso"
                    : loroDev ? "lo sviluppatore non si mette in pausa"
                    : "non hai il permesso di mettere in pausa";
    pezzi.push('<button class="chip c-pausa'+(p.in_pausa?' on':'')+'" data-user="'+esc(p.user_id)
             + '" data-azione="pausa"'+(possoPausa?'':' disabled title="'+perchePausa+'"')+'>pausa</button>');

    // 3. le posizioni, solo per chi le assegna
    if(puoAssegnare()){
      pezzi.push('<span class="sep"></span>');
      // quelle che questa persona ha ma che io non posso toccare: le mostro e basta
      if(loroDev) pezzi.push('<span class="tag-sviluppatore">sviluppatore</span>');
      if(!dev && suoi.indexOf("fondatore")>=0) pezzi.push('<span class="tag-fondatore">fondatore</span>');
      if(!dev && suoi.indexOf("stella")>=0) pezzi.push('<span class="tag-stella">stella</span>');
      ASSEGNABILI.forEach(function(a){
        if(a.soloDev && !dev) return;
        var on = suoi.indexOf(a.k)>=0;
        pezzi.push('<button class="chip c-'+a.k+(on?' on':'')+'" data-user="'+esc(p.user_id)
                 + '" data-ruolo="'+a.k+'">'+a.k+'</button>');
      });
    } else {
      // non le assegno, ma vedere chi e' chi serve per decidere
      suoi.forEach(function(k){ pezzi.push('<span class="tag-'+k+'">'+k+'</span>'); });
    }
    return '<tr><td>'+nickCell(p)+'</td><td><div class="chiprow">'+pezzi.join(" ")+'</div></td></tr>';
  }).join("");
}

/* Dopo ogni modifica si rilegge la verità dal database invece di fidarsi:
   se una regola rifiuta in silenzio, il pannello lo mostra lo stesso. */
function rileggiRuoli(){
  return sb.from("ruoli").select("user_id,ruolo").then(function(res){
    if(res.error){ msgRuoli("Non riesco a rileggere le posizioni: "+res.error.message); return; }
    mappaRuoli(res.data||[]);
    disegnaRuoli();
    ruoli = (ruoliDi[utente.id]||[]).slice();   // se ho cambiato qualcosa a me stesso
    disegnaAuthbar();
    aggiornaNav();
  });
}

function toggleAccesso(userId, btn){
  msgRuoli("");
  btn.disabled=true;
  var p = profiliCache.filter(function(x){ return x.user_id===userId; })[0];
  var nuovo = !(p && p.approvato);
  sb.rpc("approva", { p_user:userId, p_valore:nuovo }).then(function(res){
    if(res && res.error){ msgRuoli("Il database ha rifiutato: "+res.error.message); }
    ctrlCaricato=false; caricaControllo();   // si rilegge tutto: la verità sta lì
  }).catch(function(e){
    btn.disabled=false;
    msgRuoli("Qualcosa non ha risposto: riprova.");
    console.error(e);
  });
}

function togglePausa(userId, btn){
  msgRuoli("");
  btn.disabled=true;
  var p = profiliCache.filter(function(x){ return x.user_id===userId; })[0];
  var nuovo = !(p && p.in_pausa);
  sb.rpc("pausa", { p_user:userId, p_valore:nuovo }).then(function(res){
    if(res && res.error){ msgRuoli("Il database ha rifiutato: "+res.error.message); }
    ctrlCaricato=false; caricaControllo();   // si rilegge tutto: la verita' sta li'
  }).catch(function(e){
    btn.disabled=false;
    msgRuoli("Qualcosa non ha risposto: riprova.");
    console.error(e);
  });
}

function toggleRuolo(userId, ruolo, btn){
  msgRuoli("");
  btn.disabled=true;
  var ha = (ruoliDi[userId]||[]).indexOf(ruolo)>=0;
  var p = profiliCache.filter(function(x){ return x.user_id===userId; })[0];
  var op = ha
    ? sb.from("ruoli").delete().eq("user_id",userId).eq("ruolo",ruolo)
    : sb.from("ruoli").insert({ user_id:userId, ruolo:ruolo, nota:(p && p.username) || null });
  op.then(function(res){
    if(res && res.error) msgRuoli("Il database ha rifiutato: "+res.error.message);
    return rileggiRuoli();
  }).catch(function(e){
    btn.disabled=false;
    msgRuoli("Qualcosa non ha risposto: riprova.");
    console.error(e);
  });
}

function disegnaAuthbar(){
  var m=utente.user_metadata||{};
  var nome=m.full_name||m.name||m.user_name||m.preferred_username||"Giocatore";
  var av=m.avatar_url||m.picture||"";
  var tag="";
  if(haRuolo("sviluppatore")) tag+=' <span class="tag-sviluppatore">sviluppatore</span>';
  if(haRuolo("fondatore")) tag+=' <span class="tag-fondatore">fondatore</span>';
  if(haRuolo("stella")) tag+=' <span class="tag-stella">stella</span>';
  if(haRuolo("master")) tag+=' <span class="tag-master">master</span>';
  if(haRuolo("supporto")) tag+=' <span class="tag-supporto">supporto</span>';
  if(haRuolo("moderazione")) tag+=' <span class="tag-moderazione">moderazione</span>';
  document.getElementById("authbar").innerHTML=
    '<span class="who">'+(av?'<img src="'+av+'" alt="">':'')+'<b>'+nome+'</b>'+tag+'</span>'
    +'<span class="salvamsg" id="salvaMsg"></span>'
    +'<button class="btn-este" id="btnEste">Personalizza</button>'
    +'<button class="btn-salva" id="btnSalva" disabled>Salvato</button>'
    +'<button class="btn-out" id="btnOut">Esci</button>';
  document.getElementById("btnEste").addEventListener("click", function(){ closeAll(); modoEstetica(!personalizza); });
  document.getElementById("btnSalva").addEventListener("click", function(){ if(sporco()) saveState(); });
  document.getElementById("btnOut").addEventListener("click", chiediUscita);
  aggiornaSalva();      // la barra si ridisegna: i tasti vanno rimessi com'erano
  modoEstetica(personalizza);
}

function login(){
  document.getElementById("loginErr").textContent="";
  sb.auth.signInWithOAuth({
    provider:"discord",
    options:{ redirectTo: window.location.origin + window.location.pathname }
  }).then(function(res){
    if(res.error){ document.getElementById("loginErr").textContent="Non riesco ad aprire Discord: "+res.error.message; }
  });
}
document.getElementById("btnLogin").addEventListener("click", login);

document.getElementById("tabScheda").addEventListener("click", function(){ mostraPane("scheda"); });
document.getElementById("tabControllo").addEventListener("click", function(){ mostraPane("controllo"); });

// Menù a tendina su "Scheda": compare passandoci sopra (con un attimo di sosta) e
// salta alla pagina scelta del foglio (Fronte / Retro / Terza). Comodo per non
// cercare le freccette d'angolo.
(function(){
  var drop=document.getElementById("navScheda"), menu=document.getElementById("navMenu"),
      tab=document.getElementById("tabScheda");
  if(!drop||!menu) return;
  var apriT=null, chiudiT=null;
  function apri(){ clearTimeout(chiudiT); menu.hidden=false; if(tab) tab.setAttribute("aria-expanded","true"); }
  function chiudi(){ menu.hidden=true; if(tab) tab.setAttribute("aria-expanded","false"); }
  drop.addEventListener("mouseenter", function(){ clearTimeout(chiudiT); apriT=setTimeout(apri, 260); });
  drop.addEventListener("mouseleave", function(){ clearTimeout(apriT); chiudiT=setTimeout(chiudi, 180); });
  // click sul tab: mostra la scheda e apre/chiude subito il menù (per il tocco)
  if(tab) tab.addEventListener("click", function(){ if(menu.hidden) apri(); else chiudi(); });
  menu.addEventListener("click", function(e){
    var b=e.target.closest("[data-pagina]"); if(!b) return;
    mostraPane("scheda");
    vaiAPagina(parseInt(b.getAttribute("data-pagina"),10)||0);
    chiudi();
  });
})();
document.getElementById("btnCtrlReload").addEventListener("click", function(){
  ctrlCaricato=false; caricaControllo();
});

document.getElementById("cercaPg").addEventListener("input", function(e){
  cerca=e.target.value; disegnaPersonaggi();
});
document.getElementById("ordinePg").addEventListener("change", function(e){
  ordine=e.target.value; disegnaPersonaggi();
});
document.getElementById("btnCercaVia").addEventListener("click", function(){
  cerca=""; document.getElementById("cercaPg").value=""; disegnaPersonaggi();
});

document.getElementById("tblBody").addEventListener("click", function(e){
  var b = e.target && e.target.closest ? e.target.closest("[data-apri]") : null;
  if(b){ apriScheda(b.getAttribute("data-apri")); return; }
  var s = e.target && e.target.closest ? e.target.closest("[data-sblocca]") : null;
  if(s && !s.disabled){ toggleSbloccoOrigine(s.getAttribute("data-sblocca"), s); }
});
document.getElementById("ruoliBody").addEventListener("click", function(e){
  var b = e.target && e.target.closest ? e.target.closest(".chip") : null;
  if(!b || b.disabled) return;
  var azione = b.getAttribute("data-azione");
  if(azione==="accesso") toggleAccesso(b.getAttribute("data-user"), b);
  else if(azione==="pausa") togglePausa(b.getAttribute("data-user"), b);
  else toggleRuolo(b.getAttribute("data-user"), b.getAttribute("data-ruolo"), b);
});

document.getElementById("btnEsciSenza").addEventListener("click", function(){
  closeAll(); var a=inSospeso; inSospeso=null; if(a) a();
});
document.getElementById("btnSalvaEsci").addEventListener("click", function(){
  saveState(function(){ closeAll(); var a=inSospeso; inSospeso=null; if(a) a(); });
});
document.getElementById("btnTornaMia").addEventListener("click", tornaAllaMia);
document.getElementById("btnEsteVia").addEventListener("click", function(){ closeAll(); modoEstetica(false); });

document.getElementById("btnRicontrolla").addEventListener("click", function(){ location.reload(); });
document.getElementById("btnRicontrollaPausa").addEventListener("click", function(){ location.reload(); });
document.getElementById("btnEsciPausa").addEventListener("click", function(){
  sb.auth.signOut().then(function(){ location.reload(); });
});
document.getElementById("btnEsciAttesa").addEventListener("click", function(){
  sb.auth.signOut().then(function(){ location.reload(); });
});

function bloccoAvvio(txt){
  document.getElementById("boot").textContent = txt;
  mostra("boot");
}

function avvia(){
  sb.auth.getSession().then(function(res){
    var sess=res.data && res.data.session;
    if(!sess){ mostra("login"); return; }
    utente=sess.user;

    // Prima si sincronizza il profilo, poi lo si legge. Partivano insieme, e
    // al primo accesso di una persona nuova la lettura poteva arrivare un
    // istante prima che il profilo esistesse: risultato, sala d'attesa dal nulla.
    return sb.rpc("sync_profilo").then(function(prof){
      // se il profilo non si aggiorna la scheda deve funzionare lo stesso:
      // lo segnalo solo nella console, senza fermare niente
      if(prof && prof.error) console.warn("sync_profilo non ha risposto:", prof.error.message);
      return Promise.all([
        sb.from("schede").select("dati,origine_sbloccata").eq("user_id", utente.id).maybeSingle(),
        sb.from("ruoli").select("ruolo").eq("user_id", utente.id),
        sb.from("profili").select(CAMPI_MIEI).eq("user_id", utente.id).maybeSingle()
      ]);
    }).then(function(r){
      var scheda=r[0], rr=r[1], mio=r[2];

      // Se le posizioni non si leggono, uno sviluppatore risulterebbe uno
      // qualunque e si chiuderebbe fuori da solo: meglio fermarsi e dirlo.
      if(rr.error){ bloccoAvvio("Non riesco a leggere le tue posizioni: "+rr.error.message); return; }
      ruoli = (rr.data||[]).map(function(x){ return x.ruolo; });

      // Un errore qui non vuol dire "non sei approvato". Prima finivano nello
      // stesso posto: la persona vedeva la sala d'attesa e nessuno capiva
      // perche', perche' lo sviluppatore salta il controllo e non se ne accorge.
      if(mio.error){
        bloccoAvvio("Non riesco a leggere il tuo profilo: "+mio.error.message
          +" \u2014 non e' un problema di permessi, e' il sito che non riesce a chiedere. Fallo sapere allo staff.");
        return;
      }
      if(!mio.data){
        bloccoAvvio("Il tuo profilo non risulta ancora registrato. Ricarica la pagina tra qualche secondo: se continua, fallo sapere allo staff.");
        return;
      }
      var dati = mio.data;

      // In pausa la scheda non si apre proprio; senza via libera nemmeno,
      // tanto il database non farebbe salvare niente. Lo sviluppatore entra
      // sempre: il database non lo lascia chiudere fuori.
      var quale = decidiSchermata(dati);
      if(quale!=="sheet"){ mostraBlocco(quale, dati); ascoltaProfilo(); return; }
      statoOra="sheet";

      if(scheda.error){
        bloccoAvvio("Non riesco a leggere la scheda: "+scheda.error.message);
        return;
      }
      // il nav è per tutti (menù pagine); "Controllo" solo per lo staff
      aggiornaNav();
      if(scheda.data && scheda.data.dati) applicaDati(scheda.data.dati);
      applicaSbloccoOrigine(scheda.data);
      disegnaAuthbar();
      mostra("sheet");          // prima si mostra: così la barra ha una larghezza vera
      sincronizzaComandi();     // e solo dopo si misura il nome
      salvato=foto();           // fotografia a comandi fermi: da qui ogni differenza accende il tasto
      aggiornaSalva();
      caricaRazze();            // l'indice delle razze dal database, per il pannello e il grimorio
      caricaTalenti();          // il mazzo dei talenti dal database (pronto per il Retro)
      caricaSottoclassi();      // le sottoclassi (tabella staff), per il pop-up Classe del Retro
      caricaPrivilegi();        // i privilegi di classe/sottoclasse (tabella staff)
      ascoltaProfilo();         // da qui in poi pausa e accesso fanno effetto subito
      // i font decorativi arrivano da internet: quando sono pronti rimisuro
      if(document.fonts && document.fonts.ready){ document.fonts.ready.then(function(){ apply(); }); }
    });
  }).catch(function(e){
    bloccoAvvio("Qualcosa non ha risposto: ricarica la pagina.");
    console.error(e);
  });
}

/* ================= PUNTI FERITA — disegno e comandi =================
   Il riquadro sta sopra Caratteristiche. A sinistra, sempre in vista,
   attuali/massimo, la barra e i pulsanti Danno/Cura (le cose più usate). A
   destra tre linguette che cambiano la vista dentro il riquadro (come
   Caratteristiche|Abilità): Temporanei, Dadi vita, Tiri morte; a 0 punti salta
   da sola su Tiri morte. Il Riposo lungo è un pulsante sul riquadro, a portata
   di mano; la rotella tiene solo il ritocco del massimo. Tutto passa da
   renderAll + aggiornaSalva. */
function pipsMorteTipo(tipo){
  var n = tipo==="s" ? (state.morteS||0) : (state.morteF||0), cls=tipo==="s"?"succ":"fail", out="";
  for(var i=0;i<3;i++){
    out+='<button class="dpip '+cls+(i<n?' on':'')+'" type="button" data-death="'+tipo+'" data-i="'+i+'"'
       + (soloLettura?' disabled':'')+' aria-label="'+(tipo==="s"?"Successo":"Fallimento")+' '+(i+1)+'"></button>';
  }
  return out;
}

function leggiAmt(){ var el=document.getElementById("hpAmt"); var n=Math.abs(parseInt(el&&el.value,10)); return (isFinite(n)&&n>0)?n:0; }
function dopoModificaPf(){ var el=document.getElementById("hpAmt"); if(el) el.value=""; renderAll(); aggiornaSalva(); }
function applicaDanno(n){
  if(!n) return;
  var t=pfTempVal(), tolt=Math.min(t,n);
  if(tolt) state.pfTemp=t-tolt;                       // il danno mangia prima i temporanei
  state.pfAttuali=Math.max(0, pfAttualiVal()-(n-tolt));
  if(state.pfAttuali===0) vistaHp="morte";            // a terra: mostra subito i tiri contro la morte
  dopoModificaPf();
}
function applicaCura(n){
  if(!n) return;
  state.pfAttuali=Math.min(pfMax(), pfAttualiVal()+n);
  if(state.pfAttuali>0){ state.morteS=0; state.morteF=0; }   // sopra 0 sei stabile: i tiri si azzerano
  dopoModificaPf();
}
function impostaMax(v){
  if(!isFinite(v)) { renderHpDialog(); return; }
  state.pfScostamento = Math.max(1,Math.round(v)) - pfMedia();   // si salva solo la differenza dal calcolo
  if(typeof state.pfAttuali==="number" && state.pfAttuali>pfMax()) state.pfAttuali=pfMax();
  renderAll(); aggiornaSalva();
}
function setMorte(tipo,i){
  var key = tipo==="s" ? "morteS" : "morteF", cur=state[key]||0;
  state[key] = (cur===i+1) ? i : i+1;    // clic sull'ultimo pieno lo svuota
  renderAll(); aggiornaSalva();
}
function spendiDado(die){
  var p=dadiVitaPool().filter(function(x){ return x.die===die; })[0];
  if(!p || p.liberi<=0) return;
  state.dvSpesi[die]=Math.round(state.dvSpesi[die]||0)+1;
  renderAll(); aggiornaSalva();
}
function recuperaDado(die){
  var sp=Math.round((state.dvSpesi&&state.dvSpesi[die])||0);
  if(sp<=0) return;
  if(sp-1<=0) delete state.dvSpesi[die]; else state.dvSpesi[die]=sp-1;
  renderAll(); aggiornaSalva();
}
/* Riposo lungo (dal manuale): punti al massimo, via i temporanei e i tiri
   contro la morte, e si recupera metà dei dadi vita totali (minimo 1), a
   partire dai dadi più grossi. */
function riposoLungo(){
  if(!state.classes.length) return;
  state.pfAttuali=pfMax(); state.pfTemp=0; state.morteS=0; state.morteF=0;
  var pool=dadiVitaPool(), tot=pool.reduce(function(s,p){ return s+p.tot; },0);
  var recup=Math.max(1, Math.floor(tot/2));
  pool.slice().sort(function(a,b){ return b.die-a.die; }).forEach(function(p){
    if(recup<=0) return;
    var giu=Math.min(recup, p.spesi);
    if(giu>0){ var n=p.spesi-giu; if(n<=0) delete state.dvSpesi[p.die]; else state.dvSpesi[p.die]=n; recup-=giu; }
  });
  renderAll(); aggiornaSalva();
}
function mostraVistaHp(v){ if(v==="temp"||v==="dadi"||v==="morte"){ vistaHp=v; renderHp(); } }

/* Il tracciato del battito (una riga da elettrocardiogramma): otto cicli
   identici disegnati largo il doppio del riquadro, cosi' scorrendo verso
   sinistra (in CSS) il ritmo sembra continuo. Si disegna una volta sola. */
function disegnaEcg(){
  var pl=document.querySelector("#hpEcg .hpecg-line"); if(!pl) return;
  var base=20, cyc=60, n=8, pts=[];
  for(var i=0;i<n;i++){
    var x=i*cyc;
    // tratto piatto, piccola onda P, piatto, il picco QRS, piatto
    [[0,0],[12,0],[16,-4],[20,0],[30,0],[33,-14],[36,14],[39,-8],[42,0],[60,0]]
      .forEach(function(p){ pts.push((x+p[0])+","+(base+p[1])); });
  }
  pl.setAttribute("points", pts.join(" "));
}

/* Le tre sotto-viste del riquadro (dentro #hpSub). */
function subTemp(){
  var ro=soloLettura?" disabled":"";
  return '<div class="hpsublab">Temporanei</div>'
    +'<div class="hpsubrow"><input class="hpin" type="number" id="hpTempIn" min="0" step="1" value="'+pfTempVal()+'"'+ro+' aria-label="Punti ferita temporanei" />'
    +'<button class="hpbtn" type="button" data-hptemp="zero"'+ro+'>Azzera</button></div>'
    +'<div class="hpsubnote">Riserva a parte: si consuma prima dei punti veri e non si cura. Non si somma: si tiene la più alta.</div>';
}
function subDadi(){
  var h='<div class="hpsublab">Dadi vita</div><div class="dvlist">';
  dadiVitaPool().forEach(function(p){
    h+='<div class="dvrow"><span class="dvname">'+p.tot+'d'+p.die+'</span>'
      +'<button class="dvbtn" type="button" data-dv="spend" data-die="'+p.die+'"'+((soloLettura||p.liberi<=0)?' disabled':'')+' aria-label="Spendi un d'+p.die+'">−</button>'
      +'<span class="dvcount"><b>'+p.liberi+'</b> / '+p.tot+'</span>'
      +'<button class="dvbtn" type="button" data-dv="recover" data-die="'+p.die+'"'+((soloLettura||p.spesi<=0)?' disabled':'')+' aria-label="Recupera un d'+p.die+'">+</button></div>';
  });
  h+='</div><div class="hpsubnote">Spendine con un riposo breve per curarti (poi applichi la cura col pulsante Cura), recuperali col riposo lungo.</div>';
  return h;
}
function subMorte(){
  var ro=soloLettura?" disabled":"", st=statoMortale(), testa="";
  if(st==="morto") testa='<div class="hpstato morto">☠ Il personaggio è morto.'+(soloLettura?'':' <button class="hplink" type="button" data-hprianima>Riporta in vita</button>')+'</div>';
  else if(st==="stabile") testa='<div class="hpstato stabile">Stabile: privo di sensi ma fuori pericolo. Ti riprendi con una cura o un riposo.</div>';
  return '<div class="hpsublab">Tiri contro la morte</div>'
    + testa
    +'<div class="hpdeath"><span class="dlab succ">Successi</span><span class="dpips">'+pipsMorteTipo("s")+'</span></div>'
    +'<div class="hpdeath"><span class="dlab fail">Fallimenti</span><span class="dpips">'+pipsMorteTipo("f")+'</span></div>'
    +'<div class="hpsubnote">Si tirano a 0 punti: tre successi e sei stabile, tre fallimenti e muori. Curarti sopra 0 li azzera.'
    +((state.morteS||state.morteF)?' <button class="hplink" type="button" data-hpreset="morte"'+ro+'>Azzera</button>':'')+'</div>';
}

function renderHp(){
  var host=document.getElementById("hpPanel"); if(!host) return;
  var noCl=!state.classes.length, max=pfMax(), cur=pfAttualiVal(), temp=pfTempVal();
  var g=function(id){ return document.getElementById(id); };
  var elCur=g("hpCur"), elMax=g("hpMax"), elTemp=g("hpTemp"), elFill=g("hpFill"),
      elHint=g("hpHint"), elAmt=g("hpAmt"), elDmg=g("hpDmg"), elHeal=g("hpHeal"), elSub=g("hpSub");
  if(elCur) elCur.textContent = noCl?"—":cur;
  if(elMax) elMax.textContent = noCl?"—":max;
  if(elTemp){ elTemp.hidden = temp<=0; elTemp.innerHTML = "+"+temp+' <i>tmp</i>'; }
  if(elFill) elFill.style.width = (max>0? Math.round(cur/max*100):0)+"%";
  // il colore di barra e numero lo mette dipingiSaluteHp (in coda ad applicaTesti)
  var bloc = noCl || soloLettura;
  [elAmt,elDmg,elHeal].forEach(function(e){ if(e) e.disabled=bloc; });
  var elRest=g("hpRestBtn"); if(elRest) elRest.disabled=bloc;
  if(elHint){ elHint.hidden=!noCl; if(noCl) elHint.textContent="Scegli una classe: i punti ferita nascono dai suoi dadi vita."; }

  // il battito: compare quando sei a terra e cambia col tuo stato (morente
  // debole e rosso, stabile calmo e verde, morto piatto)
  var ecg=g("hpEcg");
  if(ecg){
    var mst=statoMortale();
    ecg.hidden = (mst==="vivo");
    ecg.classList.toggle("morente", mst==="morente");
    ecg.classList.toggle("stabile", mst==="stabile");
    ecg.classList.toggle("morto",   mst==="morto");
  }

  // linguette: attiva quella giusta; "Tiri morte" si segnala quando sei a 0
  var giu = !noCl && cur===0;
  host.querySelectorAll("[data-hpview]").forEach(function(t){
    var v=t.getAttribute("data-hpview");
    t.classList.toggle("on", v===vistaHp);
    t.classList.toggle("urge", v==="morte" && giu);
  });
  if(elSub){
    if(noCl) elSub.innerHTML="";
    else if(vistaHp==="temp") elSub.innerHTML=subTemp();
    else if(vistaHp==="morte") elSub.innerHTML=subMorte();
    else elSub.innerHTML=subDadi();
    montaSpinner(elSub);   // il campo dei temporanei nasce qui
  }
}

function renderHpDialog(){
  var host=document.getElementById("hpDlgBody"); if(!host) return;
  if(!state.classes.length){
    host.innerHTML='<p class="hint">Per i punti ferita serve almeno una classe: il massimo nasce dai suoi dadi vita e dalla Costituzione. Aggiungi una classe nel riquadro Classe, poi torna qui.</p>';
    return;
  }
  var media=pfMedia(), max=pfMax(), scost=state.pfScostamento||0, ro=soloLettura?" disabled":"", h="";
  h+='<p class="hint">Il massimo dei punti ferita nasce dai dadi vita delle tue classi più la Costituzione (metodo “media” del manuale: il primo livello prende il dado pieno). Puoi ritoccarlo a mano: si salva solo la differenza dal calcolo, così segue comunque i cambi di livello e Costituzione.</p>';
  h+='<div class="row"><span class="rowlab">Massimo</span>'
    +'<input class="hpin" type="number" id="hpMaxIn" min="1" step="1" value="'+max+'"'+ro+' />'
    +'<span class="subval">calcolato: <b>'+media+'</b>'+(scost?(' · ritocco '+(scost>0?'+':'')+scost):'')+'</span>'
    +(scost?('<button class="opt" data-hpreset="max"'+ro+'>Torna al calcolato</button>'):'')
    +'</div>';
  host.innerHTML=h;
  montaSpinner(host);   // il campo del massimo nasce qui
}

disegnaEcg();
document.getElementById("gearHp").addEventListener("click", openHp);
document.getElementById("hpRevive").addEventListener("click", rianima);
document.getElementById("hpPanel").addEventListener("click", function(e){
  var tv=e.target.closest("[data-hpview]");
  if(tv){ mostraVistaHp(tv.getAttribute("data-hpview")); return; }   // le linguette funzionano anche in sola lettura
  if(soloLettura) return;
  var dp=e.target.closest("[data-death]");
  if(dp){ setMorte(dp.getAttribute("data-death"), parseInt(dp.getAttribute("data-i"),10)); return; }
  var dv=e.target.closest("[data-dv]");
  if(dv){ var die=parseInt(dv.getAttribute("data-die"),10); if(dv.getAttribute("data-dv")==="spend") spendiDado(die); else recuperaDado(die); return; }
  if(e.target.closest("[data-hprianima]")){ rianima(); return; }
  if(e.target.closest("[data-hprest]")){ riposoLungo(); return; }
  var mz=e.target.closest("[data-hpreset]");
  if(mz && mz.getAttribute("data-hpreset")==="morte"){ state.morteS=0; state.morteF=0; renderAll(); aggiornaSalva(); return; }
  var tz=e.target.closest("[data-hptemp]");
  if(tz){ state.pfTemp=0; renderAll(); aggiornaSalva(); return; }
  if(e.target.id==="hpDmg"){ applicaDanno(leggiAmt()); return; }
  if(e.target.id==="hpHeal"){ applicaCura(leggiAmt()); return; }
});
document.getElementById("hpPanel").addEventListener("change", function(e){
  if(soloLettura) return;
  if(e.target.id==="hpTempIn"){ var v=parseInt(e.target.value,10); state.pfTemp=(isFinite(v)&&v>0)?v:0; renderAll(); aggiornaSalva(); }
});
document.getElementById("modalHp").addEventListener("click", function(e){
  if(e.target.closest("[data-close]")){ closeAll(); return; }
  if(soloLettura) return;
  var rs=e.target.closest("[data-hpreset]");
  if(rs && rs.getAttribute("data-hpreset")==="max"){ state.pfScostamento=0; if(typeof state.pfAttuali==="number"&&state.pfAttuali>pfMax()) state.pfAttuali=pfMax(); renderAll(); aggiornaSalva(); return; }
});
document.getElementById("modalHp").addEventListener("change", function(e){
  if(soloLettura) return;
  if(e.target.id==="hpMaxIn"){ impostaMax(parseInt(e.target.value,10)); }
});

/* ============ CA / INIZIATIVA / VELOCITÀ — disegno e comandi ============
   Tre valori a "strati": ognuno mostra il totale, e la "i" ne spiega la
   scomposizione (base + Destrezza + ... + ritocco), elencando anche i cassetti
   futuri ancora vuoti. La rotella apre il ritocco a mano (rete di sicurezza). */
function scomposizioneHtml(k){
  if(k==="vel" && velRazzaPiedi()==null){
    return '<div class="scbd"><div class="scrow tot"><span>Velocità</span><b>—</b></div></div>'
         + '<div class="scfut">Scegli una razza: la velocità arriva da lì.</div>';
  }
  var d=DIF_VOCI[k], voci=d.fn(), rit=ritoccoDif(k), tot=valoreDif(k);
  var righe=voci.filter(function(v){ return v.val!==0 || v.fonte==="regola"; }).map(function(v){
    return '<div class="scrow"><span>'+esc(v.et)+'</span><b>'+(d.segno?segno(v.val):v.val)+'</b></div>';
  });
  if(rit) righe.push('<div class="scrow rit"><span>Ritocco a mano</span><b>'+segno(rit)+'</b></div>');
  var futuri = k==="ca" ? "armatura, scudo, specie, talenti"
            : (k==="vel" ? "tratti, talenti" : "talenti, tratti");
  return '<div class="scbd">'+righe.join("")
    + '<div class="scrow tot"><span>Totale</span><b>'+mostraDif(k,tot)+'</b></div></div>'
    + '<div class="scfut">In arrivo: '+futuri+'. Si aggiungeranno da soli.</div>';
}
function renderDif(){
  var host=document.getElementById("difPanel"); if(!host) return;
  DIF_ORD.forEach(function(k){
    var el=document.getElementById("dif_"+k+"_val"); if(el) el.textContent=mostraDif(k, valoreDif(k));
    var pop=document.getElementById("dif_"+k+"_pop"); if(pop) pop.innerHTML=scomposizioneHtml(k);
  });
  var col=/^#[0-9a-fA-F]{6}$/.test(state.difIcoColor||"")?state.difIcoColor:"#E0B15E";
  host.querySelectorAll(".difico").forEach(function(e){ e.style.color=col; });   // colore dei simboli
}
function renderDifDialog(){
  var host=document.getElementById("difDlgBody"); if(!host) return;
  var ro=soloLettura?" disabled":"", h="";
  h+='<p class="hint">Iniziativa e Velocità si calcolano da sole (dalla Destrezza e dalla specie) e non si impostano a mano. La Classe Armatura per ora si può ritoccare qui — è solo quella “senza armatura” finché non arriverà l’equipaggiamento a calcolarla da solo — e si salva soltanto la differenza dal calcolo, così segue comunque i cambiamenti futuri.</p>';
  DIF_ORD.filter(function(k){ return DIF_MANUALE[k]; }).forEach(function(k){
    var d=DIF_VOCI[k], base=baseDif(k), val=valoreDif(k), rit=ritoccoDif(k);
    h+='<div class="row"><span class="rowlab">'+d.nome+'</span>'
      +'<input class="hpin" type="number" id="dif_'+k+'_in" step="1" value="'+val+'"'+ro+' />'
      +'<span class="subval">calcolato: <b>'+mostraDif(k,base)+'</b>'+(rit?(' · ritocco '+segno(rit)):'')+'</span>'
      +(rit?('<button class="opt" data-difreset="'+k+'"'+ro+'>Torna al calcolato</button>'):'')
      +'</div>';
  });
  host.innerHTML=h;
  montaSpinner(host);
}
function impostaDif(k, v){
  if(!DIF_MANUALE[k]) return;   // Iniziativa e Velocità sono automatiche
  if(!isFinite(v)){ renderDifDialog(); return; }
  if(!state.difScost) state.difScost={};
  var s=Math.round(v)-baseDif(k);
  if(s===0) delete state.difScost[k]; else state.difScost[k]=s;
  renderAll(); aggiornaSalva();
}
function openDif(){ document.getElementById("modalDif").hidden=false; renderDifDialog(); if(personalizza) sincronizzaSel("dif"); }
document.getElementById("gearDif").addEventListener("click", openDif);
document.getElementById("modalDif").addEventListener("click", function(e){
  if(e.target.closest("[data-close]")){ closeAll(); return; }
  if(soloLettura) return;
  var r=e.target.closest("[data-difreset]");
  if(r){ var k=r.getAttribute("data-difreset"); if(state.difScost) delete state.difScost[k]; renderAll(); aggiornaSalva(); return; }
});
document.getElementById("modalDif").addEventListener("change", function(e){
  if(soloLettura) return;
  var m=e.target.id && e.target.id.match(/^dif_(ca|iniz|vel)_in$/);
  if(m){ impostaDif(m[1], parseInt(e.target.value,10)); }
});

/* ================= FOGLIO GIRABILE (pagine con flip) =================
   La scheda è un foglio a più pagine: 0 Fronte (la scheda), 1 Retro (tratti e
   talenti), 2 Terza (equipaggiamento). Si gira dagli ANGOLI in basso: destra =
   avanti, sinistra = indietro. La pagina attiva NON si salva (è come la vista
   del riquadro unito). Una guardia impedisce di girare mentre gira. */
var PAGINE_FOGLIO=["pagFronte","pagRetro","pagTerza"];
var paginaScheda=0, flipInCorso=false;
function aggiornaAngoli(){
  var sx=document.getElementById("angoloSx"), dx=document.getElementById("angoloDx");
  if(sx) sx.hidden = (paginaScheda<=0) || flipInCorso;
  if(dx) dx.hidden = (paginaScheda>=PAGINE_FOGLIO.length-1) || flipInCorso;
}
function resetPagine(){
  flipInCorso=false; paginaScheda=0;
  PAGINE_FOGLIO.forEach(function(id,i){
    var el=document.getElementById(id); if(!el) return;
    el.hidden=(i!==0);
    el.classList.remove("via-avanti","entra-avanti","via-indietro","entra-indietro");
  });
  aggiornaAngoli();
}
/* vai DIRETTAMENTE a una pagina del foglio (per il menù a tendina): salto secco
   e istantaneo — semplice e veloce. L'animazione resta sulle freccette d'angolo. */
function vaiAPagina(n){
  if(flipInCorso) return;
  n=Math.max(0, Math.min(PAGINE_FOGLIO.length-1, n));
  if(n===paginaScheda) return;
  PAGINE_FOGLIO.forEach(function(id,i){
    var el=document.getElementById(id); if(!el) return;
    el.hidden=(i!==n); el.classList.remove("via-avanti","entra-avanti","via-indietro","entra-indietro");
  });
  paginaScheda=n; aggiornaAngoli();
  if(PAGINE_FOGLIO[n]==="pagRetro" && typeof posizionaHub==="function") setTimeout(posizionaHub, 60);
}
function giraPagina(dir){
  if(flipInCorso) return;
  var t=paginaScheda+dir;
  if(t<0 || t>=PAGINE_FOGLIO.length) return;
  var oldEl=document.getElementById(PAGINE_FOGLIO[paginaScheda]);
  var newEl=document.getElementById(PAGINE_FOGLIO[t]);
  if(!oldEl || !newEl) return;
  flipInCorso=true; aggiornaAngoli();   // gli angoli spariscono durante il giro
  var suf = dir>0 ? "avanti" : "indietro";
  oldEl.classList.add("via-"+suf);
  setTimeout(function(){
    oldEl.hidden=true; oldEl.classList.remove("via-"+suf);
    newEl.hidden=false; newEl.classList.add("entra-"+suf);
    paginaScheda=t;
    setTimeout(function(){
      newEl.classList.remove("entra-"+suf);
      flipInCorso=false; aggiornaAngoli();
      if(PAGINE_FOGLIO[t]==="pagRetro" && typeof posizionaHub==="function") posizionaHub();
    }, 340);
  }, 300);
}
(function(){
  var dx=document.getElementById("angoloDx"), sx=document.getElementById("angoloSx");
  if(dx) dx.addEventListener("click", function(){ giraPagina(1); });
  if(sx) sx.addEventListener("click", function(){ giraPagina(-1); });
  resetPagine();
})();

/* ============ CAMPI NUMERICI: freccette su misura e clic che seleziona ============
   Le freccette bianche native stanno appiccicate al numero e stonano: le
   nascondo (nel CSS) e ne metto due chevron tenui, intonati alla scheda, con lo
   spazio giusto. Inoltre il PRIMO fuoco (clic o Tab) seleziona tutto - cosi'
   scrivi e sostituisci - mentre un SECONDO clic posiziona il cursore, per
   modificare senza dover cancellare. Vale per ogni <input type="number">, anche
   quelli creati al volo, perche' montaSpinner si richiama dopo i ridisegni. */
function montaSpinner(root){
  var lista=(root||document).querySelectorAll('input[type="number"]');
  for(var i=0;i<lista.length;i++){
    var inp=lista[i];
    if(inp.parentNode && inp.parentNode.classList && inp.parentNode.classList.contains("numwrap")) continue;   // gia' fatto
    var wrap=document.createElement("span"); wrap.className="numwrap";
    inp.parentNode.insertBefore(wrap, inp); wrap.appendChild(inp); inp.classList.add("hasspin");
    var spin=document.createElement("span"); spin.className="numspin";
    spin.innerHTML='<button type="button" tabindex="-1" data-step="up" aria-label="Aumenta"><svg viewBox="0 0 10 7"><path d="M1 5.5 L5 2 L9 5.5"/></svg></button>'
                  +'<button type="button" tabindex="-1" data-step="down" aria-label="Diminuisci"><svg viewBox="0 0 10 7"><path d="M1 1.5 L5 5 L9 1.5"/></svg></button>';
    wrap.appendChild(spin);
  }
}
document.addEventListener("click", function(e){
  var b=e.target.closest ? e.target.closest(".numspin [data-step]") : null; if(!b) return;
  var w=b.closest(".numwrap"), inp=w&&w.querySelector("input"); if(!inp || inp.disabled) return;
  if(b.getAttribute("data-step")==="up") inp.stepUp(); else inp.stepDown();
  inp.dispatchEvent(new Event("change", {bubbles:true}));
});
/* primo fuoco: seleziona tutto. Il clic che da' il fuoco altrimenti
   deselezionerebbe subito, quindi quella prima volta annullo il mouseup. */
document.addEventListener("focusin", function(e){
  var t=e.target; if(t && t.matches && t.matches('input[type="number"]')){ t._selTutto=true; try{ t.select(); }catch(_){} }
});
document.addEventListener("mouseup", function(e){
  var t=e.target; if(t && t._selTutto){ t._selTutto=false; e.preventDefault(); }
});
montaSpinner(document);

avvia();
