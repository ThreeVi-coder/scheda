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
  abilita:{},          // abilita' -> 1 competenza, 2 maestria (le altre non ci sono)
  abilCarColore:{},    // colore scelto per ogni caratteristica (vuoto = base)
  xp:0,
  xpStyle:"grad", xpColor1:"#7C5CFF", xpColor2:"#E0B15E",
  statsEvid:true,   // illumina la stat piu' alta sul grafico
  statsColor:"#7C5CFF",   // colore del poligono e della linea illuminata
  classSymColor:"#a78bfa",   // colore di partenza dei simboli (seme per i nuovi)
  tsCompColor:"#E0B15E",     // colore degli esagoni accesi dei tiri salvezza
  tsDadoColor:"#A78BFA",     // colore del dado disegnato al centro del favo
  nomiClasse:{},   // stile del nome, per ogni classe (chiave = classe)
  simboli:{},      // colore e neon del simbolo, per ogni classe
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
  var o={ modo:"pointbuy", base:{}, bonus:{} };   // "modo" resta per compatibilita' con le schede gia' salvate
  CARATT.forEach(function(c){ o.base[c.k]=PB_MIN; o.bonus[c.k]=0; });
  return o;
}
function totaleCar(k){
  var v=state.stats.base[k]+state.stats.bonus[k];
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
function pbValido(){
  return CARATT.every(function(c){ var v=state.stats.base[c.k]; return v>=PB_MIN && v<=PB_MAX; })
      && pbUsati()<=PB_TOTALE;
}


function statsWarn(t){
  var el=document.getElementById("statsWarn"); if(!el) return;
  el.textContent=t||""; el.classList.toggle("on", !!t);
}

function cambiaPb(k, verso){
  var v=state.stats.base[k], n=v+verso;
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
function slLato(){ return "sx"; }   // le stat stanno sui due lati: il parametro non serve piu\u0027

function slVertice(idx, frazione){
  // l'esagono sta al centro; le etichette lo circondano su entrambi i lati
  var cx = SL_W/2;
  var ang=(-90+idx*60)*Math.PI/180, r=84*frazione;
  return [cx + r*Math.cos(ang), SL_CY + r*Math.sin(ang)];
}

function renderStats(){
  var host=document.getElementById("statsLine");
  var lato=slLato(), out="", wires="", lbls="";
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

  document.getElementById("statsNota").textContent =
    "Sali e scendi con i pulsanti: la forma dell'esagono \u00E8 il tuo personaggio. Da 14 in su costa di pi\u00F9.";

  disegnaEsagono();
  disegnaFila();
}

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
  var bonus=conBonus();
  document.getElementById("stFila").innerHTML = CARATT.map(function(c){
    var v=state.stats.base[c.k];
    var giu = v<=PB_MIN;
    var su  = v>=PB_MAX || (pbCosto(v+1)-pbCosto(v))>pbLiberi();
    var comando = '<span class="pb">'
      + '<button class="pbtn" data-car="'+c.k+'" data-verso="-1"'+(giu?' disabled':'')+'>&minus;</button>'
      + '<span class="pbv">'+v+'</span>'
      + '<button class="pbtn" data-car="'+c.k+'" data-verso="1"'+(su?' disabled':'')+'>+</button>'
      + '</span>';
    var calc = bonus
      ? '<div class="bcalc">'+v+' '+segno(state.stats.bonus[c.k])+' = '+totaleCar(c.k)+' <i>'+segno(modCar(c.k))+'</i></div>'
      : '';
    var cls="stbox"+(c.k===statAtt?" att":"")+(state.stats.bonus[c.k]!==0?" conbonus":"");
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
  { id:"siglaCar",  dove:"stats", nome:"Sigla",                sel:".slsig, .scrow .ss, .hexsig", font:"", colore:"#9A97AD" },
  { id:"valCar",    dove:"stats", nome:"Valore",               sel:".slval, .scrow .sv, .hexval", font:"cinzel", colore:"#E8E6F0" },
  { id:"modiCar",   dove:"stats", nome:"Modificatore",         sel:".slmod, .scrow .sm, .hexmod", font:"", colore:"#E0B15E" },
  { id:"etProf",    dove:"prof",  nome:"Etichetta",            sel:"#profPanel .eyebrow",  font:"",       colore:"#9A97AD" },
  { id:"valProf",   dove:"prof",  nome:"Bonus",                sel:"#profVal",             font:"cinzel", colore:"#E0B15E" },
  { id:"etTs",      dove:"ts",    nome:"Etichetta",            sel:"#tsPanel .eyebrow",    font:"",       colore:"#9A97AD" },
  { id:"siglaTs",   dove:"ts",    nome:"Sigla",                sel:".tssig",               font:"",       colore:"#9A97AD" },
  { id:"valTs",     dove:"ts",    nome:"Valore",               sel:".tsval",               font:"cinzel", colore:"#E8E6F0" },
  { id:"nomeAbil",  dove:"abil",  nome:"Nome dell'abilit\u00E0",    sel:".abnome",              font:"",       colore:"#E8E6F0" },
  { id:"valAbil",   dove:"abil",  nome:"Valore",               sel:".abval",               font:"cinzel", colore:"#E0B15E" },
  { id:"etPP",      dove:"abil",  nome:"Etichetta passiva",    sel:".ppet",                font:"",       colore:"#9A97AD" },
  { id:"valPP",     dove:"abil",  nome:"Valore passivo",       sel:".ppval",               font:"cinzel", colore:"#E8E6F0" }
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

state.testi = testiDiPartenza();
state.stats = statsDiPartenza();

var elName=document.getElementById("name"), elHeader=document.getElementById("header"),
    elEyebrow=document.getElementById("eyebrow"), elReadout=document.getElementById("readout"),
    elFont=document.getElementById("font"), elCapSection=document.getElementById("capSection"),
    elEmblem=document.getElementById("emblem"), emLeft=document.getElementById("emLeft"), emRight=document.getElementById("emRight");

var SAVE_FIELDS=["font","size","align","bold","italic","underline","smallcaps","neon","dropcap","upper","label","nameColor","capColor","emblemMode","xpStyle","xpColor1","xpColor2","statsEvid","statsColor","classSymColor","tsCompColor","tsDadoColor","abilCarColore"];
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
      var x = o.stats.bonus && o.stats.bonus[c.k];
      if(typeof x==="number" && isFinite(x)) state.stats.bonus[c.k]=Math.max(-10, Math.min(10, Math.round(x)));
    });
  }
  state.statsEvid = (o.statsEvid!==false);   // acceso di default
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
  state.nomiClasse={}; state.simboli={};
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
    var sv = o.simboli && o.simboli[c.key];
    if(sv && typeof sv==="object"){
      var col = (typeof sv.colore==="string" && /^#[0-9a-fA-F]{6}$/.test(sv.colore)) ? sv.colore : state.classSymColor;
      state.simboli[c.key]={ colore:col, neon:!!sv.neon };
    } else {
      state.simboli[c.key]={ colore:state.classSymColor, neon:false };
    }
  });
  sel.class=null;
  if(typeof o.xp==="number" && isFinite(o.xp) && o.xp>=0) state.xp=o.xp;
  elName.textContent = (typeof o.name==="string") ? o.name : "";
}
/* Impacchetta lo stato per il database */
function datiDaSalvare(){
  var o={}; SAVE_FIELDS.forEach(function(k){ o[k]=state[k]; });
  o.classes=state.classes; o.classeIniziale=classeTs(); o.xp=state.xp; o.name=elName.textContent.trim();
  o.abilita=abilitaDaSalvare();
  o.testi=state.testi; o.stats=state.stats;
  o.nomiClasse=state.nomiClasse; o.simboli=state.simboli;
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
  ["gearXp","gearClass","gearCore","gearProf","gearTs"].forEach(function(id){
    var x=document.getElementById(id); if(x) x.hidden = soloLettura;
  });
  // la "i" delle abilita' non si mostra a chi guarda soltanto
  var info=document.getElementById("abilInfoBtn");
  if(info) info.hidden = soloLettura || vistaCore!=="abil";
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
  state.nomiClasse={}; state.simboli={}; state.classSymColor="#a78bfa"; sel.class=null;
  elName.textContent="";
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
  sb.from("schede").select("dati").eq("user_id", id).maybeSingle().then(function(r){
    if(r && r.error){ if(msg) msg.textContent="Non riesco ad aprirla: "+r.error.message; return; }
    if(msg) msg.textContent="";
    bersaglio=id;
    schedaVuota();
    if(r && r.data && r.data.dati) applicaDati(r.data.dati);
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
  sb.from("schede").select("dati").eq("user_id", utente.id).maybeSingle().then(function(r){
    bersaglio=null;
    schedaVuota();
    if(r && r.data && r.data.dati) applicaDati(r.data.dati);
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
  var em=Math.round(px*1.45)+"px", sep=Math.round(px*1.05)+"px";
  var embs=document.querySelectorAll(".emb");
  for(var i=0;i<embs.length;i++){ embs[i].style.width=em; embs[i].style.height=em; }
  var seps=document.querySelectorAll(".embsep");
  for(var j=0;j<seps.length;j++){ seps[j].style.height=sep; }
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
  for(var i=0;i<sl.length;i++) sl[i].classList.toggle("sel", has(sl[i].getAttribute("data-key")));
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

function renderPanel(){
  var line=document.getElementById("classLine");
  if(!state.classes.length){
    line.innerHTML='<span class="cempty">Nessuna classe scelta \u2014 apri la rotellina</span>';
    return;
  }
  // il livello totale non si ripete qui: lo mostra gia' il riquadro Livello
  line.innerHTML=state.classes.map(function(c){
    return '<span class="cls"><span class="ce" data-clskey="'+c.key+'">'+emblemSVG(c.key)+'</span>'
      +'<span class="cn" data-clskey="'+c.key+'">'+BY_KEY[c.key].name+'</span><span class="cl">'+c.level+'</span></span>';
  }).join('<span class="cdiv"></span>');
  applicaTesti();     // etichetta e livello (condivisi)
  applicaClassi();    // nomi e simboli, uno per classe
}

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
  var simb=document.querySelectorAll("#classLine .ce");
  for(var j=0;j<simb.length;j++){ var q=simb[j].getAttribute("data-clskey"); if(q) pitturaSimbolo(simb[j], simboloDi(q)); }
}

/* ===== Il pannello nuovo della Classe =====
   Si sceglie l'elemento toccandolo nell'anteprima, e sotto compaiono solo i
   comandi che servono a quell'elemento. */
var sel={};   // sel[dove] = target scelto in quella sezione
var ASP_CONT={
  name: { ant:"antsel_name",  com:"com_name" },
  xp:   { ant:"antsel_xp",    com:"com_xp" },
  class:{ ant:"antep_classe", com:"comandi_classe" },
  stats:{ ant:"antsel_stats", com:"com_stats" },
  prof: { ant:"antsel_prof",  com:"com_prof" },
  ts:   { ant:"antsel_ts",    com:"com_ts" },
  abil: { ant:"antsel_abil",  com:"com_abil" }
};
/* Testo e dimensione con cui mostrare ogni scritta nell'anteprima */
var CAMPIONI={
  etNome:{t:"ETICHETTA",cls:"apmid"},
  etLivello:{t:"LIVELLO",cls:"apmid"}, numLv:{t:"7",cls:"apbig"}, txtPE:{t:"prossimo livello",cls:"apsmall"}, numPE:{t:"2.500",cls:"apmid"},
  siglaCar:{t:"FOR",cls:"apmid"}, valCar:{t:"15",cls:"apbig"}, modiCar:{t:"+2",cls:"apmid"},
  etProf:{t:"COMPETENZA",cls:"apmid"}, valProf:{t:"+3",cls:"apbig"},
  etTs:{t:"TIRI SALVEZZA",cls:"apmid"}, siglaTs:{t:"DES",cls:"apmid"}, valTs:{t:"+5",cls:"apbig"},
  nomeAbil:{t:"Furtivit\u00E0",cls:"apmid"}, valAbil:{t:"+7",cls:"apbig"},
  etPP:{t:"PERCEZIONE PASSIVA",cls:"apsmall"}, valPP:{t:"14",cls:"apbig"}
};

function targetValido(dove,key){
  if(!key) return false;
  if(dove==="class"){
    if(key==="etClasse"||key==="lvCl") return true;
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
  if(key.indexOf("simb:")===0) return simboloDi(key.slice(5));
  return state.testi[key];
}
function kindTarget(key){ return key.indexOf("simb:")===0 ? "symbol" : "text"; }
function metaTarget(dove,key){
  if(dove==="class"){
    if(key==="etClasse") return {nome:"Etichetta"};
    if(key==="lvCl") return {nome:"Livello", sub:"vale per tutte le classi"};
    if(key.indexOf("nome:")===0) return {nome:"Nome", sub:BY_KEY[key.slice(5)].name};
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
  if(key.indexOf("nome:")===0 || key.indexOf("simb:")===0) applicaClassi(); else applicaTesti();
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
        html+='<span class="apone">'
          +'<span class="apce apcls'+(sel.class==="simb:"+c.key?" sel":"")+'" data-ctarget="simb:'+c.key+'" style="color:'+sy.colore+';'+(sy.neon?"filter:drop-shadow(0 0 3px "+sy.colore+") drop-shadow(0 0 7px "+sy.colore+");":"")+'">'+emblemSVG(c.key)+'</span>'
          +'<span class="apcn apcls'+(sel.class==="nome:"+c.key?" sel":"")+'" data-ctarget="nome:'+c.key+'" style="'+stileInline(stileNome(c.key))+'">'+esc(BY_KEY[c.key].name)+'</span>'
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

  var perClasse = key.indexOf("nome:")===0;
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

  if(perClasse){
    var rU=document.createElement("div"); rU.innerHTML='<button type="button" class="cbig" id="cUnifNomi">Uniforma tutti i nomi a questo</button>'; host.appendChild(rU);
    document.getElementById("cUnifNomi").onclick=function(){ state.classes.forEach(function(c){ var t=stileNome(c.key); for(var kk in DEF_NOMECL) t[kk]=s[kk]; }); applicaClassi(); disegnaAntepSel(dove); aggiornaSalva(); };
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
      var sel=document.getElementById("abilCarSel");
      abilFermo=true;
      try{ abilCarPicker.setHex(colCar((sel&&sel.value)||"for")); } finally{ abilFermo=false; }
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
  var ms=document.getElementById("modalStats"); if(ms && !ms.hidden) return "stats";
  if(typeof modalProf!=="undefined" && modalProf && !modalProf.hidden) return "prof";
  var mt=document.getElementById("modalTs"); if(mt && !mt.hidden) return "ts";
  var ma=document.getElementById("modalAbil"); if(ma && !ma.hidden) return "abil";
  return null;
}
(function(){
  ["name","xp","class","stats","prof","ts","abil"].forEach(function(dove){
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
}

function renderAll(){ markWheel(); renderChosen(); renderPanel(); renderLevel(); renderXpDialog();
  renderProfDialog(); renderStats(); renderStatsDialog(); renderTs(); renderTsDialog(); renderAbil(); renderAbilDialog(); apply(); setHub(null);
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
function openClass(){ modalClass.hidden=false; setHub(null); if(personalizza) sincronizzaClasse(); }
function openStats(){ document.getElementById("modalStats").hidden=false; renderStatsDialog(); if(personalizza) sincronizzaSel("stats"); }
function openXp(){ modalXp.hidden=false; renderXpDialog(); if(personalizza) sincronizzaSel("xp"); }
function openProf(){ modalProf.hidden=false; renderProfDialog(); if(personalizza) sincronizzaSel("prof"); }
function openTs(){ document.getElementById("modalTs").hidden=false; renderTsDialog(); if(personalizza) sincronizzaSel("ts"); }
function openAbil(){ document.getElementById("modalAbil").hidden=false; renderAbilDialog(); if(personalizza) sincronizzaSel("abil"); }
function closeAll(){ modalName.hidden=true; modalClass.hidden=true; modalXp.hidden=true; modalProf.hidden=true;
  document.getElementById("modalStats").hidden=true;
  document.getElementById("modalTs").hidden=true;
  document.getElementById("modalAbil").hidden=true;
  document.getElementById("modalEsci").hidden=true; elHeader.classList.remove("raised"); }
document.getElementById("gearName").addEventListener("click", openName);
document.getElementById("gearClass").addEventListener("click", openClass);
document.getElementById("gearXp").addEventListener("click", openXp);
document.getElementById("gearProf").addEventListener("click", openProf);
document.getElementById("gearTs").addEventListener("click", openTs);

/* Caratteristiche e Abilita' stanno nello stesso riquadro, come Scheda e
   Controllo: l'interruttore in alto cambia la faccia mostrata. Non si salva,
   e' solo quale vista stai guardando. La rotellina apre la finestra della
   vista attiva, e la "i" compare solo sulle Abilita'. */
var vistaCore="stats";
var animandoCore=false;   // un cambio di vista alla volta, non si accavallano
/* Cambia la faccia del riquadro unito. Con animato=true fa la transizione
   (la vista attuale si ritira, la nuova entra a cascata); senza, cambio secco
   per l'avvio, le ricariche e chi ha "riduci animazioni" acceso. */
function mostraVista(v, animato){
  var nuova = (v==="abil") ? "abil" : "stats";
  var vs=document.getElementById("viewStats"), va=document.getElementById("viewAbil");
  var entrante = nuova==="abil" ? va : vs;
  var uscente  = nuova==="abil" ? vs : va;

  function contorno(){
    var ts=document.getElementById("tabStats"), ta=document.getElementById("tabAbil");
    if(ts) ts.classList.toggle("on", nuova==="stats");
    if(ta) ta.classList.toggle("on", nuova==="abil");
    var info=document.getElementById("abilInfoBtn");
    if(info) info.hidden = (nuova!=="abil") || soloLettura;
    var pop=document.getElementById("abilHint"); if(pop && nuova!=="abil") pop.hidden=true;
  }

  // Cambio secco solo all'avvio o se la vista e' gia' quella: l'animazione,
  // per scelta, parte sempre (anche con "riduci animazioni" di sistema).
  if(!animato || vistaCore===nuova){
    vistaCore=nuova;
    if(vs){ vs.hidden = nuova!=="stats"; vs.classList.remove("esce","entra"); }
    if(va){ va.hidden = nuova!=="abil"; va.classList.remove("esce","entra"); }
    contorno();
    return;
  }
  if(animandoCore) return;
  animandoCore=true;
  vistaCore=nuova;
  contorno();

  // 1) la vista attuale si ritira verso il centro
  uscente.classList.remove("entra");
  uscente.classList.add("esce");
  setTimeout(function(){
    uscente.hidden=true;
    uscente.classList.remove("esce");
    // 2) la nuova entra dal centro (e, se Abilita', i gruppi a cascata)
    entrante.hidden=false;
    void entrante.offsetWidth;   // forzo il ridisegno cosi' l'animazione riparte
    entrante.classList.add("entra");
    setTimeout(function(){
      entrante.classList.remove("entra");
      animandoCore=false;
    }, 360);
  }, 200);
}
document.getElementById("tabStats").addEventListener("click", function(){ mostraVista("stats", true); });
document.getElementById("tabAbil").addEventListener("click", function(){ mostraVista("abil", true); });
document.getElementById("gearCore").addEventListener("click", function(){
  if(vistaCore==="abil") openAbil(); else openStats();
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
document.addEventListener("keydown", function(e){ if(e.key==="Escape") closeAll(); });
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
  var pb=e.target.closest("[data-car]");
  if(pb && !pb.disabled){ statAtt=pb.getAttribute("data-car"); cambiaPb(pb.getAttribute("data-car"), parseInt(pb.getAttribute("data-verso"),10)); return; }
  var pk=e.target.closest("[data-pick]");
  if(pk){ statAtt=pk.getAttribute("data-pick"); renderStatsDialog(); return; }
  var ev=e.target.closest("[data-evid]");
  if(ev){ state.statsEvid=(ev.getAttribute("data-evid")==="on"); renderStats(); sincronizzaExtra("stats"); aggiornaSalva(); return; }
  var r=e.target.closest("[data-reset]"); if(r){ askReset(r.getAttribute("data-reset")); return; }
  var no=e.target.closest("[data-cancel]"); if(no){ cancelReset(no.getAttribute("data-cancel")); return; }
  var yes=e.target.closest("[data-yes]"); if(yes){ doReset(yes.getAttribute("data-yes")); return; }
  var xs=e.target.closest("[data-xpstyle]"); if(xs){ state.xpStyle=xs.getAttribute("data-xpstyle"); renderAll(); return; }
  var cl=e.target.closest("[data-close]"); if(cl){ closeAll(); return; }
  var sg=e.target.closest(".sugsw"); if(sg){ capPicker.setHex(sg.getAttribute("data-hex")); return; }
  var el=e.target.closest("[data-align],[data-fmt],[data-upper],[data-label]"); if(!el) return;
  if(el.hasAttribute("data-align")) state.align=el.getAttribute("data-align");
  if(el.hasAttribute("data-fmt")){ var k=el.getAttribute("data-fmt"); state[k]=!state[k]; }
  if(el.hasAttribute("data-upper")) state.upper=el.getAttribute("data-upper")==="on";
  if(el.hasAttribute("data-label")) state.label=el.getAttribute("data-label")==="on";
  apply();
});

var wheel=document.getElementById("wheel");
wheel.addEventListener("click", function(e){ var s=e.target.closest(".slice"); if(s) addClass(s.getAttribute("data-key")); });
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
  var sel=document.getElementById("abilCarSel");
  if(sel){
    sel.innerHTML=CARATT.map(function(c){ return '<option value="'+c.k+'">'+c.nome+'</option>'; }).join("");
    sel.addEventListener("change", function(){
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
function applicaRuoli(){
  document.getElementById("nav").hidden = !ruoli.length;

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

/* I nomi dei personaggi li scrivono i giocatori: prima di metterli
   dentro la pagina vanno disinnescati, altrimenti uno che chiama il
   personaggio con del codice lo farebbe girare nel browser dei master. */
function esc(s){
  return String(s==null?"":s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

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
    puoVedereSchede() ? sb.from("schede").select("user_id,dati") : Promise.resolve({ data:[], error:null }),
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
    schedeCache={};
    (r[1].data||[]).forEach(function(x){ schedeCache[x.user_id]=x.dati||{}; });
    preparaOrdini();
    disegnaPersonaggi();
    if(puoStaff()){
      disegnaRuoli();
      document.getElementById("ruoliBlock").hidden=false;
    }
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

var schedeCache={}, cerca="", ordine="nick";

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
  var sel=document.getElementById("ordinePg"), v=ORDINI();
  if(!v.some(function(x){ return x[0]===ordine; })) ordine="nick";
  sel.innerHTML = v.map(function(x){
    return '<option value="'+x[0]+'">'+esc(x[1])+'</option>';
  }).join("");
  sel.value=ordine;
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
    return '<tr>'+prima+'<td class="pgname">'+pg+'</td>'
         + '<td class="lv">'+lv+'</td><td class="xp">'+xt+'</td>'
         + '<td>'+quando(p.ultimo_accesso)+'</td><td>'+apri+'</td></tr>';
  }).join("");
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
    document.getElementById("nav").hidden = !ruoli.length;
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
  if(b) apriScheda(b.getAttribute("data-apri"));
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
        sb.from("schede").select("dati").eq("user_id", utente.id).maybeSingle(),
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
      // la navigazione (e quindi la sezione Controllo) esiste solo per chi e' nello staff
      if(ruoli.length) document.getElementById("nav").hidden = false;
      if(scheda.data && scheda.data.dati) applicaDati(scheda.data.dati);
      disegnaAuthbar();
      mostra("sheet");          // prima si mostra: così la barra ha una larghezza vera
      sincronizzaComandi();     // e solo dopo si misura il nome
      salvato=foto();           // fotografia a comandi fermi: da qui ogni differenza accende il tasto
      aggiornaSalva();
      ascoltaProfilo();         // da qui in poi pausa e accesso fanno effetto subito
      // i font decorativi arrivano da internet: quando sono pronti rimisuro
      if(document.fonts && document.fonts.ready){ document.fonts.ready.then(function(){ apply(); }); }
    });
  }).catch(function(e){
    bloccoAvvio("Qualcosa non ha risposto: ricarica la pagina.");
    console.error(e);
  });
}
avvia();
