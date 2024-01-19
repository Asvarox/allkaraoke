import{a9 as Pt,aa as Mt,ab as zt,c as $e,j as t,r as d,ac as W,ad as we,ae as te,af as I,ag as _e,a8 as g,ah as je,ai as At,aj as $,ak as F,al as Tt,am as O,an as Ge,ao as ne,ap as he,aq as N,ar as Ft,U as It,V as Nt,as as ke,at as Ve,au as Ke,av as Rt,C as H,a2 as G,aw as He,ax as L,ay as Lt,az as Bt,aA as Dt,aB as Ue,aC as qe,aD as me,aE as Ot,aF as $t,aG as D,aH as _t,aI as Ye,aJ as We,aK as Gt,aL as Xe,aM as Vt,aN as Qe,aO as fe,aP as Kt,aQ as Ht,aR as J,aS as Ut,a0 as qt,aT as Je,aU as Ze,aV as X,aW as Z,aX as et,aY as Yt,aZ as tt,a_ as nt,a$ as st,b0 as Wt,b1 as Xt,b2 as at,K as rt,b3 as ot,b4 as Qt,$ as it,Z as ct,b5 as Jt,b6 as Zt,b7 as en,b8 as tn,b9 as lt,ba as nn,bb as ee,bc as sn,bd as dt,be as ut,bf as an,bg as pe,bh as rn,bi as on,bj as cn,bk as ln,bl as dn,bm as un,bn as gn,bo as hn,bp as mn,bq as K,br as fn,a1 as pn}from"./index-sXw_Ff97.js";import{u as xn,P as bn,a as Sn,S as yn,b as U,c as vn,f as wn,d as jn,e as kn}from"./Player-mMOSwzME.js";function En(e){var n=Pt(e),s=n%1;return n===n?s?n-s:n:0}var Cn=Math.ceil,Pn=Math.max;function Ee(e,n,s){(s?Mt(e,n,s):n===void 0)?n=1:n=Pn(En(n),0);var r=e==null?0:e.length;if(!r||n<1)return[];for(var a=0,i=0,o=Array(Cn(r/n));a<r;)o[i++]=zt(e,a,a+=n);return o}const Mn=$e(t.jsx("path",{d:"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2M7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18m0-9C6.67 9 6 8.33 6 7.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9m4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5m4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5m0-9c-.83 0-1.5-.67-1.5-1.5S15.67 6 16.5 6s1.5.67 1.5 1.5S17.33 9 16.5 9"}),"Casino"),zn=$e(t.jsx("path",{d:"M16.59 7.58 10 14.17l-3.59-3.58L5 12l5 5 8-8zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8"}),"CheckCircleOutline");function An({setFilters:e,filters:n,keyboardControl:s,visible:r,setVisible:a}){const i=d.useRef(null),[o,c]=d.useState(!1),l=m=>{e(p=>({...p,search:m}))};W("down",()=>{var m;(m=i.current)==null||m.blur()},{enabled:o,enableOnTags:["INPUT"]});const h=m=>{m.stopPropagation(),m.preventDefault(),l(m.key)};W(we,m=>{h(m),a(!0)},{enabled:!n.search&&s});const f=d.useCallback(m=>{s&&l(m)},[s]);return te(I.remoteSongSearch,f),W(we,m=>{var p;h(m),(p=i.current)==null||p.focus()},{enabled:!o&&s},[n.search]),W("Backspace",m=>{var p;(p=i.current)==null||p.focus()},{enabled:!o&&s},[n.search]),d.useEffect(()=>{o||a(!!n.search)},[o,n.search,a]),!n.search&&!r?null:t.jsx(Tn,{"data-test":"song-list-search",children:t.jsx(Fn,{large:!0,children:t.jsx("form",{"data-test":"filters-search-form",onSubmit:m=>{var p;m.preventDefault(),(p=i.current)==null||p.blur()},children:t.jsx(_e,{onFocus:()=>c(!0),onBlur:()=>c(!1),onKeyDown:m=>{var p;m.key==="Backspace"&&((p=n.search)==null?void 0:p.length)===0&&a(!1)},focused:o,autoFocus:!0,label:"Search",value:n.search??"",onChange:l,ref:i,"data-test":"filters-search"})})})})}const Tn=g("div",{target:"e1elgrzq1"})({name:"t46wvs",styles:"background:rgba(0, 0, 0, 0.7);padding:2rem;font-size:3rem;box-sizing:border-box;display:flex;flex-direction:row;gap:2rem;position:fixed;z-index:200;top:4.5rem;left:30rem;right:30rem"}),Fn=g("div",{target:"e1elgrzq0"})("flex:",e=>e.large?1.5:1,";");function In({onRandom:e,setFilters:n,filters:s,keyboardControl:r}){const[a,i]=d.useState(!1),o=()=>{n(c=>({...c,search:""}))};return t.jsxs(t.Fragment,{children:[t.jsxs(Nn,{children:[t.jsx(je,{title:"Search",placement:"left",children:t.jsx(Ce,{onClick:()=>a?o():i(!0),"data-test":"search-song-button",children:t.jsx(At,{})})}),t.jsx(je,{title:"Pick random",placement:"left",children:t.jsx(Ce,{onClick:e,"data-test":"random-song-button",children:t.jsx(Mn,{})})})]}),t.jsx(An,{setFilters:n,filters:s,visible:a,setVisible:i,keyboardControl:r})]})}const Ce=g($,{target:"e12uvlok1"})("box-shadow:inset 0 0 2px 2px ",F.colors.text.active,";background:black;width:7.5rem;height:7.5rem;border-radius:50%;display:flex;align-items:center;justify-content:center;svg{width:4.5rem;height:4.5rem;}"),Nn=g("div",{target:"e12uvlok0"})({name:"1x0sh4s",styles:"pointer-events:none;position:fixed;display:flex;flex-direction:column;align-items:center;justify-content:center;bottom:2.5rem;right:2.5rem;z-index:100;gap:2rem"});function gt({videoId:e,...n}){return t.jsx(Dn,{src:`https://img.youtube.com/vi/${e}/default.jpg`,alt:`Thumbnail image for YouTube video ${e}`,...n})}function Rn({videoId:e,...n}){const s=Tt(e)??e,[r,a]=d.useState(!0);d.useLayoutEffect(()=>{a(o=>!o)},[e]);const[i]=O(Ge);return i==="low"?null:t.jsxs(Ln,{...n,children:[t.jsx(Pe,{videoId:r?e:s,visible:r}),t.jsx(Pe,{videoId:r?s:e,visible:!r}),t.jsx(Bn,{videoId:s})]})}const Ln=g("div",{target:"elot36a3"})({name:"k44s62",styles:"position:relative;overflow:hidden;background:black"}),Bn=g(gt,{target:"elot36a2"})({name:"6dhm9o",styles:"visibility:hidden"}),Pe=g(gt,{target:"elot36a1"})("position:absolute;transition:opacity 300ms;opacity:",e=>e.visible?1:0,";"),Dn=g("img",{target:"elot36a0"})({name:"4uwt2b",styles:"width:100%;height:100%;object-fit:cover"});function On({active:e,closePlaylist:n,playlists:s,selectedPlaylist:r,setSelectedPlaylist:a}){const{register:i,focused:o,focusElement:c}=ne({enabled:e,additionalHelp:{vertical:void 0,"horizontal-vertical":null}});return he({left:()=>n("left"),right:()=>n("right")},e),d.useEffect(()=>{const l=new URLSearchParams(window.location.search).get("playlist");l&&c(`playlist-${l}`)},[]),d.useEffect(()=>{if(o){const l=s.find(u=>`playlist-${u.name}`===o);if(l){const u=new URL(window.location.href);u.searchParams.set("playlist",l.name),window.history.pushState(null,"",u.toString()),a(l.name)}}},[o,s]),t.jsx($n,{"data-test":"song-list-playlists",active:e,children:s.map(l=>t.jsx(_n,{"data-selected":`playlist-${l.name}`===o,active:e,...i(`playlist-${l.name}`,()=>c(`playlist-${l.name}`),void 0,l.name===r),...e?{}:{selected:`playlist-${l.name}`===o},children:l.display??l.name},l.name))})}const $n=g("div",{target:"eemp7f41"})("background:rgba(0, 0, 0, ",e=>e.active?.75:.5,");width:100vh;transform-origin:top right;transform:rotate(-90deg);position:absolute;z-index:200;left:-100vh;top:0;font-size:3.6rem;box-sizing:border-box;display:flex;flex-direction:row-reverse;gap:0;h2{",N,";margin:0;}"),_n=g($,{target:"eemp7f40"})("font-size:2.75rem;justify-self:stretch;flex-grow:1;",e=>!e.focused&&e.active&&"background-color: transparent;",";padding:1.5rem;",e=>e.selected?Ft:!e.active&&"opacity: .75;",";");var xe={},Gn=Nt;Object.defineProperty(xe,"__esModule",{value:!0});var ht=xe.default=void 0,Vn=Gn(It()),oe=t;ht=xe.default=(0,Vn.default)([(0,oe.jsx)("path",{fillRule:"evenodd",d:"M16.67 13.13C18.04 14.06 19 15.32 19 17v3h4v-3c0-2.18-3.57-3.47-6.33-3.87"},"0"),(0,oe.jsx)("circle",{cx:"9",cy:"8",r:"4",fillRule:"evenodd"},"1"),(0,oe.jsx)("path",{fillRule:"evenodd",d:"M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4c-.47 0-.91.1-1.33.24C14.5 5.27 15 6.58 15 8s-.5 2.73-1.33 3.76c.42.14.86.24 1.33.24m-6 1c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4"},"2")],"PeopleAlt");const Kn=JSON.parse(`{
  "af": [
    "Persian Dari",
    "Pashto"
  ],
  "al": [
    "Albanian"
  ],
  "dz": [
    "Arabic",
    "Berber"
  ],
  "ad": [
    "Catalan"
  ],
  "ao": [
    "Portuguese"
  ],
  "ag": [
    "English"
  ],
  "ar": [
    "Spanish"
  ],
  "am": [
    "Armenian"
  ],
  "au": [
    "English"
  ],
  "at": [
    "German"
  ],
  "az": [
    "Azerbaijani"
  ],
  "bs": [
    "English"
  ],
  "bh": [
    "Arabic"
  ],
  "bd": [
    "Bengali"
  ],
  "bb": [
    "English"
  ],
  "by": [
    "Belarusian",
    "Russian"
  ],
  "be": [
    "Dutch",
    "French",
    "German"
  ],
  "bz": [
    "English"
  ],
  "dy": [
    "French"
  ],
  "bt": [
    "Dzongkha"
  ],
  "bo": [
    "Spanish",
    "Aymara",
    "Araona",
    "Baure",
    "Bsiro Chiquitano",
    "Canichana",
    "Cavinea",
    "Cayubaba",
    "Chcobo",
    "Chimn",
    "Ese Ejja",
    "Guaran",
    "Guarasuwe",
    "Guarayu",
    "Itonama",
    "Leco",
    "Machajuyai",
    "Machineri",
    "Maropa",
    "Mojeo",
    "Mojeo",
    "Mor",
    "Mosetn",
    "Movima",
    "Pacawara",
    "Puquina",
    "Quechua",
    "Sirion",
    "Tacana",
    "Tapiet",
    "Toromona",
    "Uru-Chipaya",
    "Weenhayek",
    "Yaminawa",
    "Yuki",
    "Yuracar",
    "Zamuco"
  ],
  "ba": [
    "Bosnian",
      "Croatian",
      "Serbian"
  ],
  "bw": [
    "English"
  ],
  "br": [
    "Portuguese"
  ],
  "bn": [
    "Malay"
  ],
  "bg": [
    "Bulgarian"
  ],
  "hv": [
    "French"
  ],
  "bi": [
    "French",
    "Kirundi",
    "English"
  ],
  "kh": [
    "Khmer"
  ],
  "cm": [
    "English",
    "French"
  ],
  "ca": [
    "English",
    "French"
  ],
  "cv": [
    "Portuguese"
  ],
  "cf": [
    "French",
    "Sango"
  ],
  "td": [
    "Arabic",
    "French"
  ],
  "cl": [
    "Spanish"
  ],
  "cn": [
    "Chinese"
  ],
  "cx": [
    "English",
    "Chinese",
    "Malay"
  ],
  "cc": [
    "English",
    "Cocos Malay"
  ],
  "co": [
    "Spanish"
  ],
  "km": [
    "Arabic",
    "Comorian",
    "French"
  ],
  "cd": [
    "French"
  ],
  "cg": [
    "French"
  ],
  "ck": [
    "English",
    "Cook Islands Mori"
  ],
  "cr": [
    "Spanish"
  ],
  "hr": [
    "Croatian"
  ],
  "cu": [
    "Spanish"
  ],
  "cy": [
    "Turkish"
  ],
  "cz": [
    "Czech",
    "Slovak"
  ],
  "dk": [
    "Danish"
  ],
  "dj": [
    "Arabic",
    "French"
  ],
  "dm": [
    "English"
  ],
  "do": [
    "Spanish"
  ],
  "tl": [
    "Portuguese",
    "Tetum"
  ],
  "ec": [
    "Spanish",
    "Quechua"
  ],
  "eg": [
    "Arabic"
  ],
  "sv": [
    "Spanish"
  ],
  "gq": [
    "French",
    "Portuguese",
    "Spanish"
  ],
  "er": [
    "Tigrinya"
  ],
  "ee": [
    "Estonian"
  ],
  "sz": [
    "English",
    "Swazi"
  ],
  "et": [
    "Afar",
    "Amharic",
    "Oromo",
    "Somali",
    "Tigrinya"
  ],
  "fj": [
    "English",
    "Fijian",
    "Fiji Hindi"
  ],
  "fi": [
    "Finnish",
    "Swedish"
  ],
  "fx": [
    "French"
  ],
  "ga": [
    "French"
  ],
  "gm": [
    "English"
  ],
  "ge": [
    "Ossetian",
    "Russian"
  ],
  "de": [
    "German"
  ],
  "gh": [
    "English"
  ],
  "gr": [
    "Greek"
  ],
  "gd": [
    "English"
  ],
  "gt": [
    "Spanish"
  ],
  "gn": [
    "French"
  ],
  "gw": [
    "Portuguese"
  ],
  "gy": [
    "English"
  ],
  "ht": [
    "French",
    "Creole"
  ],
  "hn": [
    "Spanish"
  ],
  "hu": [
    "Hungarian"
  ],
  "is": [
    "Icelandic"
  ],
  "in": [
    "Hindi",
    "English"
  ],
  "id": [
    "Indonesian"
  ],
  "ir": [
    "Persian"
  ],
  "iq": [
    "Arabic",
    "Kurdish"
  ],
  "ie": [
    "Irish",
    "English"
  ],
  "il": [
    "Hebrew"
  ],
  "it": [
    "Italian"
  ],
  "ci": [
    "French"
  ],
  "jm": [
    "English"
  ],
  "jp": [
    "Japanese"
  ],
  "jo": [
    "Arabic"
  ],
  "kz": [
    "Kazakh",
    "Russian"
  ],
  "ke": [
    "English",
    "Swahili"
  ],
  "ki": [
    "English",
    "Gilbertese"
  ],
  "kp": [
    "Korean"
  ],
  "kr": [
    "Korean"
  ],
  "xk": [
    "Albanian",
    "Serbian"
  ],
  "kw": [
    "Arabic"
  ],
  "kg": [
    "Kyrgyz",
    "Russian"
  ],
  "la": [
    "Lao"
  ],
  "lv": [
    "Latvian"
  ],
  "lb": [
    "Arabic"
  ],
  "ls": [
    "Sotho",
    "English"
  ],
  "lr": [
    "English"
  ],
  "ly": [
    "Arabic"
  ],
  "li": [
    "German"
  ],
  "lt": [
    "Lithuanian"
  ],
  "lu": [
    "French",
    "German",
    "Luxembourgish"
  ],
  "mg": [
    "French",
    "Malagasy"
  ],
  "mw": [
    "English",
    "Chichewa"
  ],
  "my": [
    "Malay"
  ],
  "mv": [
    "Dhivehi"
  ],
  "ml": [
    "Bambara",
    "Bobo",
    "Bozo",
    "Dogon",
    "Fula",
    "Hassaniya",
    "Kassonke",
    "Maninke",
    "Minyanka",
    "Senufo",
    "Songhay",
    "Soninke",
    "Tamasheq"
  ],
  "mt": [
    "Italian"
  ],
  "mh": [
    "English",
    "Marshallese"
  ],
  "mr": [
    "Arabic"
  ],
  "mu": [
    "English",
    "Morisien"
  ],
  "mx": [
    "Spanish"
  ],
  "fm": [
    "English"
  ],
  "md": [
    "Moldovan",
    "Russian",
    "Ukrainian"
  ],
  "mc": [
    "French"
  ],
  "mn": [
    "Mongolian"
  ],
  "me": [
    "Montenegrin"
  ],
  "ma": [
    "Arabic",
    "Berber"
  ],
  "mz": [
    "Portuguese"
  ],
  "mm": [
    "Burmese"
  ],
  "na": [
    "English"
  ],
  "nr": [
    "English",
    "Nauruan"
  ],
  "np": [
    "Nepali"
  ],
  "nl": [
    "Dutch"
  ],
  "nz": [
    "English",
    "Maori"
  ],
  "ni": [
    "Spanish"
  ],
  "ne": [
    "French"
  ],
  "ng": [
    "English"
  ],
  "nu": [
    "English",
    "Niuean"
  ],
  "nf": [
    "English",
    "Norfuk"
  ],
  "mk": [
    "Macedonian",
    "Albanian"
  ],
  "no": [
    "Norwegian",
    "Sami"
  ],
  "om": [
    "Arabic"
  ],
  "pk": [
    "Urdu",
    "English"
  ],
  "pw": [
    "English",
    "Palauan"
  ],
  "ps": [
    "Arabic"
  ],
  "pa": [
    "Spanish"
  ],
  "pg": [
    "English",
    "Hiri Motu",
    "Tok Pisin"
  ],
  "py": [
    "Spanish",
    "Guaran"
  ],
  "pe": [
    "Spanish",
    "Quechua",
    "Aymara",
    "Ashninka"
  ],
  "ph": [
    "Filipino",
    "English"
  ],
  "pl": [
    "Polish"
  ],
  "pt": [
    "Portuguese"
  ],
  "qa": [
    "Arabic"
  ],
  "ro": [
    "Romanian"
  ],
  "su": [
    "Russian"
  ],
  "rw": [
    "English",
    "French",
    "Kinyarwanda",
    "Swahili"
  ],
  "eh": [
    "Arabic"
  ],
  "kn": [
    "English"
  ],
  "lc": [
    "English"
  ],
  "vc": [
    "English"
  ],
  "ws": [
    "English",
    "Samoan"
  ],
  "sm": [
    "Italian"
  ],
  "st": [
    "Portuguese"
  ],
  "sa": [
    "Arabic"
  ],
  "sn": [
    "French"
  ],
  "yu": [
    "Serbian"
  ],
  "sc": [
    "English",
    "French",
    "Creole"
  ],
  "sl": [
    "English"
  ],
  "sg": [
    "English",
    "Malay",
    "Chinese",
    "Tamil"
  ],
  "sk": [
    "Slovak"
  ],
  "si": [
    "Slovene"
  ],
  "sb": [
    "English"
  ],
  "so": [
    "Arabic",
    "English",
    "Somali"
  ],
  "za": [
    "Afrikaans",
    "English",
    "Ndebele",
    "Sotho",
    "Swazi",
    "Tsonga",
    "Tswana",
    "Venda",
    "Xhosa",
    "Zulu"
  ],
  "ss": [
    "English"
  ],
  "es": [
    "Spanish"
  ],
  "lk": [
    "Sinhala",
    "Tamil"
  ],
  "sd": [
    "Arabic",
    "English"
  ],
  "sr": [
    "Dutch"
  ],
  "se": [
    "Swedish"
  ],
  "ch": [
    "French",
    "German",
    "Italian",
    "Romansh"
  ],
  "sy": [
    "Arabic"
  ],
  "tw": [
    "Chinese"
  ],
  "tj": [
    "Tajik"
  ],
  "tz": [
    "Swahili",
    "English"
  ],
  "th": [
    "Thai"
  ],
  "tg": [
    "French"
  ],
  "tk": [
    "English",
    "Tokelauan"
  ],
  "to": [
    "English",
    "Tongan"
  ],
  "tt": [
    "English"
  ],
  "tn": [
    "Arabic"
  ],
  "tr": [
    "Turkish"
  ],
  "tm": [
    "Turkmen"
  ],
  "tv": [
    "Tuvaluan",
    "English"
  ],
  "ug": [
    "English",
    "Swahili"
  ],
  "ua": [
    "Ukrainian"
  ],
  "ae": [
    "Arabic"
  ],
  "uk": [
    "English"
  ],
  "us": [
    "English"
  ],
  "uy": [
    "Spanish"
  ],
  "uz": [
    "Uzbek"
  ],
  "vu": [
    "English",
    "French",
    "Bislama"
  ],
  "va": [
    "Italian"
  ],
  "ve": [
    "Spanish"
  ],
  "vn": [
    "Vietnamese"
  ],
  "ye": [
    "Arabic"
  ],
  "zm": [
    "English"
  ],
  "zw": [
    "Chewa",
    "Chibarwe",
    "English",
    "Kalanga",
    "Khoisan",
    "Nambya",
    "Ndau",
    "Ndebele",
    "Shangani",
    "Shona",
    "Sotho",
    "Tonga",
    "Tswana",
    "Venda",
    "Xhosa"
  ]
}`),Hn=["US","GB"];function Un({song:e,...n}){const s=Array.isArray(e.language)?e.language[0]:e.language,r=d.useMemo(()=>{var a;return e.artistOrigin?((a=Kn[e.artistOrigin.toLowerCase()])==null?void 0:a.includes(s))??!1:!1},[e.artistOrigin,s]);return t.jsx(t.Fragment,{children:r&&!Hn.includes(e.artistOrigin)?t.jsx(ke,{isocode:e.artistOrigin,...n}):e.language!=="English"?t.jsx(ke,{language:e.language,...n}):null})}const be=e=>{const[n,s]=d.useState(null),r=Ve(e),a=async()=>{s(await Ke(e))};return d.useEffect(()=>{a()},[r]),te(I.songStatStored,a),n},qn=e=>async(n,s,r,a)=>{const i=Ve(e),o=await Ke(e),c=o.scores.map(u=>{if(u.setup.id!==n)return u;const h=u.scores.map(f=>f.name!==r||f.score!==s?f:{name:a.trim(),score:s});return{...u,scores:h}}),l={...o,scores:c};await Rt(e,l),I.songScoreUpdated.dispatch(i,l,a.trim())},mt=({song:e,focused:n,video:s,children:r,index:a,handleClick:i,background:o=!0,expanded:c=!1,...l})=>{const u=d.useCallback(()=>i?i(a):void 0,[i,a]);return t.jsxs(Qn,{...l,onClick:i?u:void 0,children:[o&&t.jsx(Jn,{style:{backgroundImage:`url('https://i3.ytimg.com/vi/${e.video}/hqdefault.jpg')`},focused:n,expanded:c}),t.jsxs(Xn,{expanded:c,children:[!c&&t.jsx(Zn,{song:e}),e.tracksCount>1&&!c&&t.jsxs(es,{"data-test":"multitrack-indicator",children:[t.jsx(ht,{}),"  Duet"]}),t.jsx(Se,{expanded:c,children:e.artist}),t.jsx(se,{expanded:c,children:e.title}),t.jsxs(ft,{expanded:c,children:[c&&t.jsxs(t.Fragment,{children:[e.author&&t.jsxs(xt,{expanded:c,children:["by ",e.authorUrl?t.jsx("a",{href:e.authorUrl,target:"_blank",rel:"noreferrer",children:e.author}):e.author]}),t.jsx(ts,{song:e})]}),!c&&t.jsx(Yn,{song:e})]})]}),r,s]})},Yn=g(Un,{target:"ez73e2r10"})({name:"1w2zyc9",styles:"height:2.75rem;object-fit:cover;border-top-right-radius:1rem;position:absolute;z-index:-1;left:0rem;bottom:0rem;opacity:0.95"}),ft=g("div",{target:"ez73e2r9"})({name:"1dgv8bf",styles:"display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start"});var Wn={name:"1u0tp1t",styles:"align-items:flex-start;justify-content:flex-start"};const Xn=g("div",{target:"ez73e2r8"})("width:100%;height:100%;display:flex;align-items:flex-end;justify-content:flex-end;z-index:1;box-sizing:border-box;flex-direction:column;",e=>e.expanded&&Wn,";"),Qn=g("div",{target:"ez73e2r7"})({name:"1s4n252",styles:"font-size:4.5rem;display:flex;align-items:flex-end;justify-content:flex-end;flex-direction:column;box-sizing:border-box;position:relative;padding:0.5rem;border:0.1rem black solid;border-radius:1rem"}),Jn=g("div",{target:"ez73e2r6"})("background-color:",F.colors.text.inactive,";position:absolute;z-index:-1;inset:0;",e=>e.theme.graphicSetting==="high"?H("background-size:",e.focused?100:110,"%;",e.focused?"":"filter: grayscale(90%);"," ",e.expanded?"filter: blur(10px);":""," transition:300ms;opacity:",e.focused?1:.8,";",""):H("background-size:100%;opacity:",e.focused?1:.6,";","")," background-position:center center;"),pt=g("span",{target:"ez73e2r5"})("background:rgba(0, 0, 0, 0.7);width:auto;display:inline-block;padding:0.5rem;",N,";text-align:right;font-size:",({expanded:e})=>e?"6rem":"2.7rem",";"),Se=g(pt,{target:"ez73e2r4"})("color:",F.colors.text.active,";"),se=g(pt,{target:"ez73e2r3"})("margin-top:",e=>e.expanded?"1.5rem":"0.5rem",";color:white;"),xt=g(se,{target:"ez73e2r2"})({name:"5twmqz",styles:"font-size:3rem;margin-top:3rem"}),Zn=({song:e})=>{var a,i;const n=be(e),s=((i=(a=n==null?void 0:n.scores)==null?void 0:a.at(-1))==null?void 0:i.date)??!1,r=s&&G(s).isAfter(G().subtract(1,"days"));return n!=null&&n.plays?t.jsx(bt,{"data-test":"song-stat-indicator",children:r?"Played today":n.plays}):null},bt=g("div",{target:"ez73e2r1"})({name:"ohpsts",styles:"position:absolute;top:0.5rem;right:0.5rem;padding:0 1rem;height:2.75rem;min-width:2.75rem;box-sizing:border-box;border-radius:5rem;color:white;background:rgba(0, 0, 0, 0.75);font-size:1.4rem;display:flex;align-items:center;justify-content:center;text-transform:uppercase"}),es=g(bt,{target:"ez73e2r0"})({name:"sq8m9a",styles:"left:0.5rem;right:auto;svg{width:1.75rem;height:1.75rem;}"}),ts=({song:e})=>{const n=be(e);return t.jsx(xt,{children:n!=null&&n.plays?`Played ${n.plays} time${n.plays>1?"s":""}`:"Never played yet"})};function ns({groupedSongList:e,containerRef:n,selectSong:s}){const[r,a]=d.useState([]);d.useEffect(()=>{const o=new IntersectionObserver(c=>{c.forEach(l=>{const u=l.target.getAttribute("data-group-letter");l.isIntersecting?a(h=>[...h,u]):a(h=>h.filter(f=>f!==u))})},{threshold:.05});return e.forEach(c=>{const l=document.querySelector(`[data-group-letter="${c.letter}"]`);l&&o.observe(l)}),()=>{o.disconnect(),a([])}},[e]);const i=o=>{s(o.songs[0].index),setTimeout(()=>{const c=document.querySelector(`[data-group-letter="${o.letter}"]`);if(c&&n.current){const l=10*parseFloat(getComputedStyle(document.documentElement).fontSize),u=c.getBoundingClientRect().top+n.current.scrollTop-l;n.current.scrollTo({top:u,behavior:"smooth"})}},20)};return t.jsx(t.Fragment,{children:t.jsx(ss,{children:e.map(o=>{const c=r.includes(o.letter);return t.jsx(as,{active:c,onClick:()=>i(o),"data-active":c,"data-test":`group-navigation-${o.letter}`,children:o.letter},o.letter)})})})}const ss=g("div",{target:"e1xsv3er1"})({name:"o02w9p",styles:"position:fixed;display:flex;flex-direction:row;align-items:center;justify-content:flex-start;top:0;left:6.2rem;padding:1rem 0 1.5rem 2rem;width:100%;z-index:100;gap:1rem;background:rgba(0, 0, 0, 0.8)"}),as=g($,{target:"e1xsv3er0"})("border:none;cursor:pointer;",N,";display:inline-block;padding:0.5rem 1.25rem;font-size:2.75rem;z-index:1;color:",F.colors.text.default,";background:",e=>e.active?F.colors.lines.star.stroke:"rgba(0, 0, 0, 0.7)",";"),Me={[L.DUEL]:"Duel",[L.PASS_THE_MIC]:"Pass The Mic",[L.CO_OP]:"Cooperation"},ie=["Hard","Medium","Easy"],rs=He("song_settings-game_mode-v3"),os=He("song_settings-tolerance-v2");function is({songPreview:e,onNextStep:n,keyboardControl:s,onExitKeyboardControl:r}){const[a,i]=rs(null),o=a??(e.tracksCount>1?L.CO_OP:L.DUEL),[c,l]=os(1),u=()=>{const p={id:Bt(),players:[],mode:o,tolerance:c+1};n(p)},h=()=>{i(Dt(Object.values(L),o))},f=()=>l(p=>Ue(ie,p,-1)),{register:m}=ne({enabled:s,onBackspace:r});return t.jsxs(t.Fragment,{children:[t.jsx(ze,{...m("difficulty-setting",f,"Change difficulty"),label:"Difficulty",value:ie[c],"data-test-value":ie[c]}),t.jsx(ze,{...m("game-mode-setting",h,"Change mode"),label:"Mode",value:Me[o],"data-test-value":Me[o]}),t.jsxs(ls,{children:[o===L.DUEL&&"Face off against each other - person that earns more points wins.",o===L.CO_OP&&"Join forces and sing together - your points will be added up to a single pool.",o===L.PASS_THE_MIC&&t.jsxs(t.Fragment,{children:["For more than 2 players - split into groups and pass the microphone within the group when prompted with"," ",t.jsx(Lt,{})," symbol."]})]}),t.jsx(cs,{...m("next-step-button",u,void 0,!0),children:"Next ➤"})]})}const cs=g($,{target:"ec10mev2"})({name:"sr8dp2",styles:"padding:0.5rem 9rem;font-size:4.3rem;width:50rem"}),ls=g("h3",{target:"ec10mev1"})({name:"rdh6te",styles:"max-width:50rem;margin:-1rem 0 1rem!important;padding:1.5rem;background:rgba(0, 0, 0, 0.7);box-sizing:border-box"}),ze=g(qe,{target:"ec10mev0"})({name:"1tcj19k",styles:"font-size:4.3rem;padding:1rem;min-width:50rem;box-sizing:border-box"});function ds(){const n=me(I.playerInputChanged,()=>D.getInputs()).some(o=>o.source==="Microphone"),s=d.useRef([]),r=d.useCallback(o=>{s.current.push(o)},[]);Ot(0,50,r);const[a,i]=d.useState(!1);return d.useEffect(()=>{const o=setInterval(()=>{const c=s.current.filter(([,m])=>m===0),l=s.current.filter(([,m])=>m>0),u=c.reduce((m,[p])=>m+p,0)/(c.length+1),h=l.reduce((m,[p])=>m+p,0)/(l.length+1),f=l.length>c.length*.1&&h>.01&&u>.01&&h-u<u/2;i(f),s.current.length=0},a?5e3:2500);return()=>clearInterval(o)},[a]),t.jsxs(us,{visible:a,children:[t.jsxs("h2",{children:[t.jsx("strong",{children:t.jsx($t,{})})," ","Noise detected"]}),t.jsx("hr",{}),t.jsxs("h4",{children:["This might make singing inaccurate. Make sure your microphone doesn't pick up the music."," ",n&&t.jsxs(t.Fragment,{children:["Alternatively, use your ",t.jsx("strong",{children:"smartphone as a microphone"})," instead."]})]})]})}const us=g("div",{target:"e1n2pbib0"})("opacity:",e=>e.visible?1:0,";transition:300ms;background:rgba(0, 0, 0, 0.75);padding:1rem;max-width:50rem;position:relative;top:-1rem;left:-0.5rem;");function St({player:e}){const n=xn(e.number);return t.jsxs(gs,{"data-test":`indicator-player-${e.number}`,children:[t.jsx(bn,{playerNumber:e.number}),t.jsx(Sn,{status:n}),n!=="unavailable"&&t.jsx(_t,{playerNumber:e.number}),t.jsx(hs,{className:"ph-no-capture",children:e.getName()})]},e.number)}const gs=g("div",{target:"ekzbtn1"})({name:"1gmoqr1",styles:"position:relative;border:0.1rem solid white;padding:1rem 3rem;background:black;width:80%;text-align:center;gap:1.25rem;font-size:2.3rem;color:white;-webkit-text-stroke:1px black"}),hs=g("span",{target:"ekzbtn0"})({name:"179t5g5",styles:"position:relative;z-index:1"});function ms(e){Ye(I.playerNameChanged),d.useEffect(()=>{We.startMonitoring()},[]);const s=me(I.playerInputChanged,()=>D.getInputs()).some(r=>r.source!=="Dummy");return t.jsxs(fs,{...e,children:[t.jsxs(ps,{children:["Microphone Check",s?D.getPlayers().map(r=>t.jsx(St,{player:r},r.number)):t.jsxs(t.Fragment,{children:[t.jsx(xs,{children:"Mic not setup"}),t.jsx("h4",{children:"Singing will be emulated"}),t.jsx("h5",{children:"You can setup in the Next step"})]})]}),t.jsx(ds,{})]})}const fs=g("div",{target:"en3dwuv2"})("display:flex;font-size:3rem;",N,";margin-bottom:8.6rem;gap:3.5rem;"),ps=g("div",{target:"en3dwuv1"})({name:"fmwdml",styles:"gap:1.25rem;display:flex;flex-direction:column;align-items:center"}),xs=g("div",{target:"en3dwuv0"})({name:"1x5xnlp",styles:"position:relative;border:0.1rem solid white;padding:1rem 3rem;background:black;width:80%;text-align:center;gap:1.25rem;font-size:2.3rem;color:white"}),yt=d.forwardRef(({options:e,focused:n,label:s,value:r,onChange:a,disabled:i,placeholder:o,keyboardNavigationChangeFocus:c,onBlur:l,className:u,...h},f)=>{const m=d.useRef(null);d.useImperativeHandle(f,()=>m.current);const p=d.useRef(null),[x,E]=d.useState(!1),[S,v]=d.useState(-1),j=d.useMemo(()=>e.filter(y=>y.toLowerCase().trim().includes(r.toLowerCase().trim())&&y!==r),[e,r]),w=y=>{var C,P,B;if(y.code==="ArrowUp"||y.code==="ArrowDown")if(j.length){y.preventDefault();const k=Ue(j,S,y.code==="ArrowUp"?-1:1);v(k);const A=(C=p.current)==null?void 0:C.querySelector(`[data-index="${k}"]`);A==null||A.scrollIntoView({behavior:"smooth",block:"center"})}else(P=m.current)==null||P.blur(),c==null||c(y.code==="ArrowUp"?-1:1);else if(y.code==="Enter"){const k=j[S];k?(v(-1),a(k)):(B=m.current)==null||B.blur()}},b=()=>{setTimeout(()=>{E(!1),l==null||l()},300)};return t.jsxs(bs,{className:u,children:[t.jsx(_e,{onFocus:()=>E(!0),onBlur:b,onKeyDown:w,onChange:a,value:r,focused:n,label:s,disabled:i,ref:m,placeholder:o,...h}),x&&!!j.length&&t.jsx(Ss,{ref:p,role:"listbox",children:j.map((y,C)=>t.jsx(ys,{role:"listitem","data-index":C,"data-focused":C===S,focused:C===S,onClick:()=>{var P;a(y),v(-1),(P=m.current)==null||P.blur()},children:y},y))})]})}),bs=g("div",{target:"e1olyu0z2"})({name:"bjn8wh",styles:"position:relative"}),Ss=g("div",{target:"e1olyu0z1"})("margin-top:0.1em;position:absolute;width:100%;background:black;max-height:",(1+2*.3)*4,"em;overflow-y:auto;z-index:2;"),ys=g("div",{target:"e1olyu0z0"})(N,";padding:0.3em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:",e=>e.focused?F.colors.text.active:"white",";cursor:pointer;"),vs=(e,n)=>{var s;return((s=e[n])==null?void 0:s.name)??`Track ${n+1}`};function ws({multipleTracks:e,player:n,songPreview:s,playerNames:r,register:a,onChange:i,setup:o}){const[c,l]=d.useState(!1),u=d.useRef(null);if(Ye(I.playerNameChanged),n===void 0)return null;const h=()=>i({number:n.number,track:(o.track+1)%s.tracksCount}),f=x=>{l(!0),n.setName(x)},m=!c,p=n.getName();return t.jsxs(t.Fragment,{children:[t.jsx(js,{maxLength:Gt,className:"ph-no-capture",value:m?"":p,placeholder:m?p:void 0,options:r,onChange:f,label:"Name:",ref:u,...a(`player-${n.number}-name`,()=>{var x;return(x=u.current)==null?void 0:x.focus()})}),e&&t.jsx(ks,{...a(`player-${n.number}-track-setting`,h,"Change track"),label:"Track",value:vs(s.tracks,o.track),"data-test-value":o.track+1})]})}const js=g(yt,{target:"e1xlnoyj1"})("input{font-size:4.5rem;}[role='listbox']{max-height:",6*(4.5+.3),"rem;}"),ks=g(qe,{target:"e1xlnoyj0"})({name:"1bwrnjg",styles:"font-size:4.5rem;padding:1.1rem"});function Es({songPreview:e,onNextStep:n,keyboardControl:s,onExitKeyboardControl:r}){const[a]=O(Xe),[i]=O(Vt),o=D.getPlayers(),c=!a&&o.length===2&&e.tracksCount>1,l=()=>o.map((b,y)=>({number:b.number,track:c?Math.min(y,e.tracksCount-1):0})),[u,h]=d.useState(l());te([I.playerAdded,I.playerRemoved],()=>h(l()));const f=o.map((b,y)=>u.find(C=>C.number===b.number)??l()[y]),m=d.useMemo(()=>JSON.parse(sessionStorage.getItem(Qe))??[],[]),p=b=>y=>{h(C=>C.map(P=>P.number===b?y:P))},[x,E]=d.useState(!1);d.useEffect(()=>{x||We.startMonitoring()},[x]);const{register:S,focusElement:v}=ne({enabled:s&&!x,onBackspace:r}),j=()=>{n(f)},w=!!i&&i!=="skip";return t.jsxs(t.Fragment,{children:[x&&t.jsx(yn,{closeButtonText:w?"Continue to the song":"Continue to player setup",onClose:()=>{E(!1),w&&v("play")}}),f.map((b,y)=>t.jsxs(Cs,{children:[t.jsxs(Ps,{children:["Player ",y+1]}),t.jsx("div",{children:t.jsx(ws,{multipleTracks:c,player:D.getPlayer(b.number),setup:b,onChange:p(b.number),playerNames:m,register:S,songPreview:e})})]},b.number)),w&&t.jsx(Ae,{...S("play-song-button",j,void 0,!0),children:"Play"}),t.jsx(Ae,{...S("select-inputs-button",()=>E(!0),void 0,!1),children:"Setup mics"})]})}const Cs=g("div",{target:"e195hoqe2"})({name:"ho1qnd",styles:"display:flex;flex-direction:row"}),Ae=g($,{target:"e195hoqe1"})({name:"afgxf2",styles:"padding:0.5rem 9rem;font-size:4.3rem"}),Ps=g("span",{target:"e195hoqe0"})(N,";padding:1.3rem;font-size:4.5rem;");function Ms({songPreview:e,onPlay:n,keyboardControl:s,onExitKeyboardControl:r}){const[a,i]=d.useState(null),[o,c]=d.useState("song"),l=h=>{i(h),c("players")},u=h=>{if(!a)return;const f={...a,players:h};I.songStarted.dispatch(e,f),n({song:e,...f})};return t.jsxs(zs,{children:[t.jsx(ms,{style:o==="players"?{viewTransitionName:"player-mic-check-container"}:void 0}),t.jsxs(As,{children:[o==="song"&&t.jsx(is,{songPreview:e,onNextStep:l,keyboardControl:s,onExitKeyboardControl:r}),o==="players"&&t.jsx(Es,{songPreview:e,onNextStep:u,keyboardControl:s,onExitKeyboardControl:()=>c("song")})]})]})}const zs=g("div",{target:"e1ogycp01"})({name:"k6gb66",styles:"display:flex;flex-direction:row;align-items:flex-end;justify-content:space-between;width:100%;hr{margin:1rem;opacity:0.25;}"}),As=g("div",{target:"e1ogycp00"})({name:"115sh08",styles:"width:auto;display:flex;flex-direction:column;align-items:flex-end;gap:1.25rem"}),Ts=30;function Fs({songPreview:e,top:n,left:s,width:r,height:a,keyboardControl:i,onExitKeyboardControl:o,onPlay:c,focusEffect:l}){const[u,h]=d.useState(!1),f=d.useRef(null),{width:m,height:p}=fe(),x=i;d.useLayoutEffect(()=>{h(!1)},[e.video]);const E=e.previewStart??(e.videoGap??0)+60,S=e.previewEnd??E+Ts,v=d.useMemo(()=>[e.video,E,S,e.volume],[e.video,E,S,e.volume]),[j,w,b,y]=Kt(v,350);d.useEffect(()=>{var k;(k=f.current)==null||k.loadVideoById({videoId:j,startSeconds:w,endSeconds:b})},[j,f,w,b]);const C=x?m:r,P=x?p:a,B=x?Math.min(m/20*9,p*(4/5)):a;return d.useEffect(()=>{var k;(k=f.current)==null||k.setSize(C,P)},[C,P,i]),t.jsxs(t.Fragment,{children:[x&&t.jsx(Ls,{onClick:o}),!x&&u&&t.jsx(_s,{width:C,height:P,left:s,top:n,song:e}),t.jsx(Rs,{background:x||u,video:t.jsx(Ds,{show:u,expanded:x,height:B,id:"preview-video-container",children:t.jsx(Ht,{width:0,height:0,disablekb:!0,ref:f,video:"",volume:y,onStateChange:k=>{var A,_;k===J.ENDED?((A=f.current)==null||A.seekTo(E),(_=f.current)==null||_.playVideo()):k===J.PLAYING&&h(!0)}})}),focused:!0,song:e,top:n,left:s,width:C,height:B,showVideo:u,expanded:x,"data-test":"song-preview","data-song":e.id,children:t.jsx(Os,{expanded:x,children:x&&t.jsx(Ms,{songPreview:e,onPlay:c,keyboardControl:i,onExitKeyboardControl:o})})})]})}var Is={name:"17gota2",styles:"border:0;border-radius:0;position:fixed;padding:var(--preview-padding)"};const Ns=g(mt,{target:"e1n04uuw4"})("--preview-padding:5rem;width:",e=>e.width,"px;height:",e=>e.height,"px;position:absolute;z-index:",e=>e.expanded?201:3,";overflow:hidden;visibility:",e=>e.expanded||e.showVideo?"visible":"hidden",";",e=>e.expanded?Is:H("pointer-events:none;",e.showVideo&&e.theme.graphicSetting==="high"?"animation: rhythmPulse 1s infinite":"scale: 1.2",";",""),";@keyframes rhythmPulse{0%{transform:scale(1.2);}15%{transform:scale(1.25);}100%{transform:scale(1.2);}}view-transition-name:song-preview;",Se,"{view-transition-name:song-preview-artist;}",se,"{view-transition-name:song-preview-title;}",ft,"{view-transition-name:song-preview-expanded-data;}"),Rs=e=>{const n=e.song.realBpm??(e.song.bpm>300?e.song.bpm/4:e.song.bpm/2);return t.jsx(Ns,{style:{top:e.expanded?`calc(50vh - ${e.height}px / 2)`:e.top,left:e.expanded?0:e.left,animationDuration:`${60/n}s`},...e})},Ls=g("div",{target:"e1n04uuw3"})({name:"1iz7jdz",styles:"position:fixed;top:0;left:0;background:rgba(0, 0, 0, 0.8);width:100vw;height:100vh;z-index:201"});var Bs={name:"pfrwim",styles:"position:absolute;top:0;left:0;background-image:none!important;border-radius:0.5rem"};const Ds=g("div",{target:"e1n04uuw2"})(e=>e.expanded?H("position:fixed;inset:0;clip-path:inset(calc((100vh - ",e.height,"px) / 2) 0);",""):Bs," div{opacity:",({show:e})=>e?1:0,";transition:",({show:e,expanded:n})=>e||n?1e3:0,"ms;}"),Os=g("div",{target:"e1n04uuw1"})("inset:auto var(--preview-padding);position:fixed;z-index:100;",e=>!e.expanded&&"transform: scale(0.1);"," border-radius:0.5rem;view-transition-name:song-preview-content;"),$s=g("div",{target:"e1n04uuw0"})("background:white;width:",e=>e.width,"px;height:",e=>e.height,"px;z-index:2;top:0;left:0;position:absolute;animation:bpm 1s infinite;border-radius:0.5rem;pointer-events:none;@keyframes bpm{0%{transform:scale(1.15);opacity:1;}100%{transform:scale(1.45);opacity:0;}}"),_s=e=>{const[n]=O(Ge);if(n==="low")return null;const s=e.song.realBpm??(e.song.bpm>300?e.song.bpm/4:e.song.bpm/2);return t.jsx($s,{width:e.width,height:e.height,style:{left:e.left,top:e.top,animationDuration:`${60/s}s`}})},Gs=e=>{const n=Ut(e);return d.useMemo(()=>[{name:"All",filters:{}},n[0]?{name:n[0].name,filters:{language:n[0].name}}:null,n[1]?{name:n[1].name,filters:{language:n[1].name}}:null,{name:"Oldies",filters:{yearBefore:1995}},{name:"Modern",filters:{yearAfter:1995}},{name:"Duets",filters:{duet:!0}},{name:"New",filters:{updatedAfter:G().subtract(31,"days").toISOString()}}].filter(s=>s!==null),[n])},Te={language:(e,n)=>n===""?e:e.filter(s=>(Array.isArray(s.language)?s.language:[s.language]).includes(n)),excludeLanguages:(e,n=[],s)=>n.length===0||X((s==null?void 0:s.search)??"").length>2?e:e.filter(r=>!(Array.isArray(r.language)?r.language:[r.language]).every(i=>n.includes(i))),search:(e,n)=>{const s=X(n);return s.length>2?e.filter(r=>r.search.includes(s)):e},duet:(e,n)=>n===null?e:e.filter(s=>n?s.tracksCount>1:s.tracksCount===1),yearBefore:(e,n)=>n?e.filter(s=>Number(s.year)<n):e,yearAfter:(e,n)=>n?e.filter(s=>Number(s.year)>=n):e,edition:(e,n)=>X(n).length?e.filter(r=>X(r.edition??"")===n):e,updatedAfter:(e,n)=>{if(!n)return e;const s=G(n);return e.filter(r=>r.lastUpdate&&G(r.lastUpdate).isAfter(s))}},Fe=(e,n)=>Object.entries(n).filter(s=>s[0]in Te).reduce((s,[r,a])=>Te[r](s,a,n),e),Vs=e=>{var f;const[n]=O(Ze),s=d.useMemo(()=>Fe(e,{excludeLanguages:n??[]}),[e,n]),r=Gs(s),[a,i]=d.useState(new URLSearchParams(window.location.search).get("playlist")??null),[o,c]=d.useState({});d.useEffect(()=>{c({})},[a]);const l=d.useDeferredValue(o),u=((f=r.find(m=>m.name===a))==null?void 0:f.filters)??null,h=d.useMemo(()=>Fe(e,{...u,...l,excludeLanguages:n??[]}),[e,l,n,u]);return{filters:o,filteredList:h,setFilters:c,selectedPlaylist:a,setSelectedPlaylist:i,playlists:r}};function Ks(){const e=qt(),{filters:n,filteredList:s,setFilters:r,selectedPlaylist:a,setSelectedPlaylist:i,playlists:o}=Vs(e.data);return{groupedSongList:d.useMemo(()=>{if(s.length===0)return[];const l=[];if(!n.search&&!n.edition){const h=s.filter(f=>f.isNew);h.length&&h.length<50&&l.push({letter:"New",isNew:!0,songs:h.map(f=>({song:f,index:s.indexOf(f)}))})}const u=/[^a-zA-Z]/;return s.forEach((h,f)=>{try{const m=isFinite(+h.artist[0])||u.test(h.artist[0])?"0-9":h.artist[0].toUpperCase();let p=l.find(x=>x.letter===m);p||(p={letter:m,songs:[]},l.push(p)),p.songs.push({index:f,song:h})}catch(m){console.error(m),Je(m)}}),l},[s,n.search]),songList:s,filters:n,setFilters:r,isLoading:e.isLoading,selectedPlaylist:a,setSelectedPlaylist:i,playlists:o}}const Hs=30;function Us(e,n,s=Hs){let r;if(n.length<e){const a=[...Array(e).keys()].filter(i=>!n.includes(i));r=a[Z(0,a.length-1)]}else r=Z(0,e-1),n.length=0;return n.length>=s&&n.shift(),n.push(r),r}const qs=(e=[],n)=>{var E;const[s,r]=d.useState([0,0]),a=d.useMemo(()=>e.map(({songs:S})=>Ee(S.map(v=>v.index),n)).flat(),[e]),i=d.useMemo(()=>e.map(({songs:S,letter:v})=>Ee(S.map(()=>v),n)).flat(),[e]),o=U(a??[]),c=s[0]===((E=a[s[1]])==null?void 0:E.length)-1,l=d.useCallback(S=>{var w;const v=a.findIndex(b=>b.includes(S)),j=(w=a[v])==null?void 0:w.indexOf(S);j>=0&&v>=0?r([j??0,v??0]):r([0,0])},[a]),u=([S,v],j,w)=>{var y;if(e.length===0)return w;const b=j[v];return(b==null?void 0:b[S])??(b==null?void 0:b.at(-1))??((y=j==null?void 0:j[0])==null?void 0:y[0])??w},h=([S,v],j=a)=>u([S,v],j,0),f=([S,v],j=i)=>u([S,v],j,"A");d.useEffect(()=>{const S=h(s,o),v=h(s,a);o.length&&S!==v&&l(S)},[s,a,o,c]);const m=(S,v)=>{tt.play(),r(([j,w])=>{let b=j,y=w;if(S==="y")y=w+v;else{if(a[w]===void 0)debugger;const C=a[w].length-1;b=Math.min(j,C)+v,b<0?(y=(a.length+w-1)%a.length,b=a[y].length-1):b>C&&(y=w+1,b=0)}return[b%n,(a.length+y)%a.length]})},p=h(s),x=f(s);return st([p,x,s,m,l,c])},Ys=(e,n=[],s,r,a,i)=>{const o=et(),[c,l]=d.useState([!1,null]),u=U(c),[h,f]=c,[m,p,x,E,S,v]=qs(n,i),j=x[0]===0,w=()=>{Wt.play(),s()},[b,y]=d.useState(!1),C=U(a.search);d.useLayoutEffect(()=>{if(C&&!a.search){y(!0);const M=setTimeout(()=>y(!1),2e3);return()=>{clearTimeout(M),y(!1)}}},[a.search]);const P=()=>{!b&&!a.search&&(Xt.play(),o("menu"))},B=d.useCallback(Yt((M,z)=>{const R=(n.length+z+M)%n.length;S(n[R].songs[0].index),tt.play()},700,{trailing:!1}),[n]),k=(M,z)=>{if(!(M!=null&&M.repeat))E("y",z);else{const R=n.findIndex(T=>!!T.songs.find(Y=>Y.index===m));B(z,R)}},A=(M,z=!1)=>{!z&&M===-1&&j&&!h?l([!0,"left"]):E("x",M)},_=d.useRef([]),q=()=>{const M=Us(r,_.current);S(M)};he({accept:w,down:M=>k(M,1),up:M=>k(M,-1),left:()=>A(-1),right:()=>A(1),back:P,random:q},e&&!h,[n,x,h,a,b]);const ae=d.useMemo(()=>({"horizontal-vertical":null,accept:null,back:null,shiftR:null,alphanumeric:null,remote:["search"]}),[]);nt(ae,e);const re=d.useCallback(M=>{l([!1,M])},[l,A,n,x]);return d.useLayoutEffect(()=>{const[M,z]=u;M&&!h&&z===f&&A(f==="right"?1:-1,!0)},[h,f,j,v,...x]),st([m,p,S,h,re,q])};function Ws(e,n){const{songList:s,groupedSongList:r,setFilters:a,filters:i,isLoading:o,selectedPlaylist:c,setSelectedPlaylist:l,playlists:u}=Ks(),h=et(),[f,m]=d.useState(!0),p=P=>{at(()=>{rt.flushSync(()=>{m(P)})}),ot.play()},[x,E,S,v,j,w]=Ys(f,r,()=>p(!1),s.length,i,n),[b,y]=d.useState(!1);d.useEffect(()=>{if(!b&&s.length){const P=s.findIndex(A=>A.id===e),B=s.findIndex(A=>A.isNew);let k=Z(0,s.length-1);(P>-1||B>-1)&&(k=P),S(k),y(!0)}},[s,S,e]),d.useEffect(()=>{b&&s.length&&s[x]&&h("game",{song:s[x].id},{replace:!0})},[b,x,s]);const C=s==null?void 0:s[x];return{groupedSongList:r,focusedSong:x,focusedGroup:E,moveToSong:S,setKeyboardControl:p,keyboardControl:f,songPreview:C,songList:s??[],filters:i,setFilters:a,showFilters:v,setShowFilters:j,isLoading:o,randomSong:w,selectedPlaylist:c,setSelectedPlaylist:l,playlists:u}}let ce=0;function vt(){d.useEffect(()=>(document.body.classList.add("blockOverflow"),document.documentElement.classList.add("blockOverflow"),ce++,()=>{ce--,ce===0&&(document.body.classList.remove("blockOverflow"),document.documentElement.classList.remove("blockOverflow"))}),[])}const Xs=1.2,Ie=4;function Qs({onSongSelected:e,preselectedSong:n}){const[s]=O(Xe),r=s?Ie-1:Ie;it(!1),ct(!0),vt();const[{previewTop:a,previewLeft:i,previewWidth:o,previewHeight:c},l]=d.useState({previewTop:0,previewLeft:0,previewWidth:0,previewHeight:0}),{focusedGroup:u,focusedSong:h,moveToSong:f,groupedSongList:m,keyboardControl:p,songPreview:x,setKeyboardControl:E,setFilters:S,filters:v,setShowFilters:j,showFilters:w,isLoading:b,randomSong:y,selectedPlaylist:C,setSelectedPlaylist:P,playlists:B}=Ws(n,r),k=d.useRef(null),{width:A,handleResize:_}=fe(),q=U(u),ae=U(h);d.useEffect(()=>{var Y,ye,ve;const z=(Et,Ct)=>`[data-group-letter="${Et}"] [data-index="${Ct}"]`;_();const R=(Y=k.current)==null?void 0:Y.querySelector(z(q,ae)),T=(ye=k.current)==null?void 0:ye.querySelector(z(u,h));T&&((!R||R.offsetTop!==T.offsetTop)&&((ve=T.scrollIntoView)==null||ve.call(T,{behavior:"smooth",inline:"center",block:"center"})),l({previewLeft:T.offsetLeft,previewTop:T.offsetTop,previewWidth:T.offsetWidth,previewHeight:T.offsetHeight}))},[A,k,h,u,m]);const re=d.useCallback(()=>E(!1),[E]),M=b||!m||!A;return t.jsxs(Zs,{songsPerRow:r,children:[M?t.jsx(Re,{children:t.jsxs(Ne,{children:[t.jsx(ge,{children:"  "}),t.jsx(Le,{children:new Array(16).fill(0).map((z,R)=>t.jsx(na,{},R))})]})}):t.jsxs(t.Fragment,{children:[x&&t.jsx(ea,{videoId:x.video}),t.jsx(In,{setFilters:S,filters:v,onRandom:y,keyboardControl:p}),t.jsxs(Re,{ref:k,active:p,"data-test":"song-list-container",dim:w,children:[t.jsx(ns,{groupedSongList:m,containerRef:k,selectSong:f}),m.length===0&&t.jsx(ta,{children:"No songs found"}),x&&t.jsx(Fs,{songPreview:x,onPlay:e,keyboardControl:!p,onExitKeyboardControl:()=>E(!0),top:a,left:i,width:o,height:c,focusEffect:!w}),m.map(z=>d.createElement(Ne,{...w||!p?{"data-unfocusable":!0}:{},key:z.letter,"data-group-letter":z.letter,highlight:z.letter==="New"},t.jsx(ge,{children:z.letter}),t.jsx(Le,{children:z.songs.map(({song:R,index:T})=>t.jsx(aa,{song:R,handleClick:h===T?re:f,focused:!w&&p&&T===h,index:T,"data-index":T,"data-focused":!w&&p&&T===h,"data-test":`song-${R.id}${z.isNew?"-new-group":""}`},R.id))}))),t.jsxs(Js,{children:["Missing a song? Try ",t.jsx("a",{href:"convert",children:"adding one"})," yourself!"]})]})]}),t.jsx(On,{selectedPlaylist:C,setSelectedPlaylist:P,playlists:B,active:w,closePlaylist:j})]})}const Js=g("span",{target:"ef4zhl210"})(N,";text-align:center;font-size:5rem;margin-top:10rem;"),Zs=g("div",{target:"ef4zhl29"})("display:flex;flex-direction:row;max-height:100vh;--song-list-gap:3.5rem;--song-item-width:",e=>`calc(${100/e.songsPerRow}% - ((${e.songsPerRow-1} / ${e.songsPerRow}) * var(--song-list-gap)))`,";--song-item-ratio:calc(16 / 9 * (4 / ",e=>e.songsPerRow,"));"),ea=g(Rn,{target:"ef4zhl28"})({name:"ybgcp",styles:"position:fixed;inset:0;width:100%;height:100%;filter:blur(7px) grayscale(90%);opacity:0.25;object-fit:cover"}),Ne=g("div",{target:"ef4zhl27"})("padding:0 4.5rem 0 11rem;",e=>e.highlight&&H("background:rgba(0, 0, 0, 0.5);padding-bottom:3rem;border-bottom:0.2rem solid black;",ge,"{animation:new-song-group-header 600ms ease-in-out infinite both;background:#ffffff;@keyframes new-song-group-header{0%,100%{transform:scale(1);}50%{transform:scale(1.1);}}}",""),";"),ta=g("div",{target:"ef4zhl26"})(N,";display:flex;align-items:center;justify-content:center;flex:1;font-size:10rem;"),ge=g("div",{target:"ef4zhl25"})(N,";display:inline-block;padding:0.5rem 1rem;margin-bottom:2rem;font-size:3.5rem;z-index:1;color:",F.colors.text.active,";background:rgba(0, 0, 0, 0.7);"),Re=g("div",{target:"ef4zhl24"})("position:relative;flex:1 1 auto;display:flex;flex-direction:column;gap:var(--song-list-gap);padding:10rem 0;overflow-y:auto;overflow-x:clip;box-sizing:border-box;min-height:100vh;max-height:100vh;::-webkit-scrollbar{display:none;}transition:opacity 500ms;opacity:",e=>e.dim?.5:1,";"),Le=g("div",{target:"ef4zhl23"})({name:"bviq7b",styles:"display:flex;flex-direction:row;flex-wrap:wrap;gap:var(--song-list-gap)"}),na=g("div",{target:"ef4zhl22"})({name:"excra0",styles:"background:black;flex-basis:var(--song-item-width);aspect-ratio:var(--song-item-ratio);border-radius:1rem;animation:skeleton 1s ease-in-out infinite alternate;@keyframes skeleton{0%{opacity:0.65;}100%{opacity:0.75;}}"});var sa={name:"1jwmbuq",styles:"transition:300ms"};const aa=d.memo(g(mt,{target:"ef4zhl21"})("cursor:pointer;flex-basis:var(--song-item-width);aspect-ratio:var(--song-item-ratio);",e=>e.theme.graphicSetting==="high"&&sa," transform:scale(",e=>e.focused?Xs:1,");",e=>e.focused&&"z-index: 2;"," ",e=>e.focused&&Qt," content-visibility:auto;contain-intrinsic-size:calc(var(--song-item-width) * (1 / var(--song-item-ratio)));"));function ra(e){const[n,s]=O(Ze),[r,a]=d.useState(n===null),i=()=>{s(n??[]),a(!1)};return r?t.jsx(Jt,{onClose:i,closeText:"Continue to Song Selection"}):t.jsx(Qs,{...e})}function wt(){const[e]=O(Zt);d.useEffect(()=>{try{e&&document.body.requestFullscreen().catch(console.info)}catch{}},[])}const oa="/assets/459342__papaninkasettratat__cinematic-music-short-RLBkkUq3.mp3",V=e=>new Promise(n=>setTimeout(n,e)),le=15;function ia({onFinish:e}){const n=d.useRef(null),[s,r]=d.useState(!1),[a,i]=d.useState([]);te(I.readinessConfirmed,l=>{i(u=>[...u,l])});const o=me([I.inputListChanged,I.readinessConfirmed],()=>D.getPlayers().map((l,u)=>[l.input.deviceId,l.getName(),l]));d.useEffect(()=>{(async()=>{var m,p,x;let l=!1;const u=D.requestReadiness().then(()=>{l=!0,r(!0)}),h=V(1500),f=V(le*1e3);await V(250),l||await((m=n==null?void 0:n.current)==null?void 0:m.play()),await Promise.race([Promise.all([u,h]),f]),(p=n==null?void 0:n.current)!=null&&p.paused||en.play(),await V(500),(x=n==null?void 0:n.current)==null||x.pause(),await V(1e3),e()})()},[]);const c=o.map(([l,u,h])=>({confirmed:a.includes(l),name:u,player:h}));return t.jsxs(t.Fragment,{children:[t.jsxs(ca,{children:[!s&&t.jsxs("span",{children:["Waiting for all players to click ",t.jsx("strong",{children:'"Ready"'})]}),t.jsx(da,{children:c.map(({confirmed:l,name:u,player:h},f)=>t.jsxs(ua,{className:"ph-no-capture","data-test":"player-confirm-status","data-name":u,"data-confirmed":l,children:[!s&&t.jsx(ga,{children:l?t.jsx(zn,{}):t.jsx(tn,{color:"info",size:"1em"})})," ",t.jsx(St,{player:h})]},f))}),!s&&t.jsxs(la,{children:["The song will start automatically in"," ",t.jsx("strong",{children:t.jsx(lt,{end:0,start:le,duration:le,useEasing:!1})})]})]}),t.jsx("audio",{src:oa,ref:n,hidden:!0,autoPlay:!1,onPlay:l=>{l.currentTarget.volume=.8}})]})}const ca=g("div",{target:"e1sds9f4"})("top:0;left:0;z-index:1000;display:flex;align-items:center;justify-content:center;flex-direction:column;position:absolute;width:100%;height:100%;gap:5rem;font-size:5rem;",N,";"),la=g("span",{target:"e1sds9f3"})({name:"1umnjfm",styles:"font-size:5rem"}),da=g("div",{target:"e1sds9f2"})({name:"1uxgijs",styles:"display:flex;flex-direction:column;gap:5rem;width:50rem;view-transition-name:player-mic-check-container"}),ua=g("div",{target:"e1sds9f1"})({name:"174652e",styles:"display:flex;align-items:center;gap:2rem;transform:scale(1.5)"}),ga=g("span",{target:"e1sds9f0"})({name:"1l5xwqu",styles:"svg{width:5rem;height:5rem;stroke:black;}"}),ha=250,de=(e,n=0,s=1/0)=>e.filter(dt).filter(r=>ut([r])>=n).filter(r=>ee([r])<=s).reduce((r,a)=>r+a.notes.reduce((i,o)=>i+o.length,0),0),ma=(e,n)=>{const[s,...r]=e.filter(dt),a=[[s]];return r.forEach(i=>{const o=a.at(-1),c=ee(o);(ut([i])-c)*n>ha?a.push([i]):o.push(i)}),a},jt=(e,n)=>e+n,Be=e=>{const n=e.map(s=>s.reduce(jt,0));return Math.max(...n)-Math.min(...n)},fa=(e,n)=>{const s=vn(e),r=i=>{if(s[i-1].length<2)return;const o=s[i-1].pop();s[i].push(o)},a=i=>{var l;if(((l=s[i+1])==null?void 0:l.length)<2)return;const[o,...c]=s[i+1];s[i].push(o),s[i+1]=c};return n%2===1?r(Math.ceil(n/2)):a(Math.ceil(n/2)),s},pa=e=>e.reduce(jt,0);function xa(e){const s=nn(e);return e.tracks.map(r=>{if(r.sections.length<3)return[];const a=ma(r.sections,s);let i=[],o=[de(a[0])];for(let c=0;c<a.length-2;c++){const l=a[i.flat().length-1]??[],h=de(r.sections,ee(l)??0)/(1+9-i.length),f=de(a[c+1]),m=pa(o);m+f<h?o=[...o,f]:h-m<m+f-h?(i.push(o),o=[f]):(i.push([...o,f]),o=[])}for(let c=0;c<100;c++){const l=Be(i),u=sn((i.length-2)*2+2).map(p=>fa(i,p)),h=u.map(Be),f=Math.min(...h);if(l<=f)break;const m=h.indexOf(f);i=u[m]}return i.map(c=>c.length).reduce((c,l)=>[...c,(c.at(-1)??0)+l],[]).map(c=>ee(a[c-1]))})}const De=[t.jsxs(t.Fragment,{children:["You can follow the updates and give feedback on the game through the Facebook Page:"," ",t.jsx("a",{href:"https://www.facebook.com/allkaraoke.party",target:"_blank",rel:"noreferrer",children:t.jsx("strong",{children:"fb.com/AllKaraoke.Party"})})]}),t.jsxs(t.Fragment,{children:["Start typing a name of a song in ",t.jsx("strong",{children:"Song Selection"})," to active Search feature"]}),t.jsxs(t.Fragment,{children:["Narrow down songs through ",t.jsx("strong",{children:"playlists"})," on the right in Song Selection"]}),t.jsxs(t.Fragment,{children:["Select ",t.jsx("strong",{children:"Pass The Mic"})," Game Mode to share the microphones and sing in a team"]}),t.jsxs(t.Fragment,{children:["Your scores and ",t.jsx("strong",{children:"stats are saved"})," in this browser - they will be available for the next party!"]}),t.jsxs(t.Fragment,{children:["You can remove irrelevant songs from the Song Selection in ",t.jsx("strong",{children:"Edit Songs"})," page"]}),t.jsxs(t.Fragment,{children:["If the game feels a bit jaggy with low FPS, check out ",t.jsx("strong",{children:"Settings"})," page"]}),t.jsxs(t.Fragment,{children:["Party is only getting started? Play ",t.jsx("strong",{children:"Jukebox"})," for the music and to see what songs are available"]}),t.jsxs(t.Fragment,{children:["Research shows that ",t.jsx("strong",{children:"duet songs"})," are that bit more fun than simple one-track ones"]}),t.jsxs(t.Fragment,{children:["Want to sing a ",t.jsx("strong",{children:"new song"}),"? Find UltraStar version of it and import it with",t.jsx("br",{}),t.jsx("strong",{children:"Convert Ultrastar .txt"})]}),t.jsxs(t.Fragment,{children:["The ",t.jsx("strong",{children:"white pulse"})," around selected song in Song Selection tries to match song's tempo"]}),t.jsxs(t.Fragment,{children:["Entire game (besides add/edit song) is navigable with ",t.jsx("strong",{children:"Keyboard"})]}),t.jsxs(t.Fragment,{children:["You can hide or show keyboard navigation help with ",t.jsx("kbd",{children:"H"})," key"]}),t.jsxs(t.Fragment,{children:["In Song Selection, hold ",t.jsx("kbd",{children:"↑"})," or ",t.jsx("kbd",{children:"↓"})," to jump to the next letter"]}),t.jsxs(t.Fragment,{children:["Add ",t.jsx("strong",{children:"vibrato"})," to the notes you sing to get additional ",t.jsx("strong",{children:"bonus points"})]}),t.jsxs(t.Fragment,{children:["You can control the game with your phone - click on the"," ",t.jsxs("strong",{children:[t.jsx(an,{}),"QR Code Icon"]})," ","on the top right and follow the instructions"]})],ba=({as:e="h4",...n})=>{const s=d.useRef(Z(0,De.length-1)),r=e;return t.jsx(r,{...n,children:De[s.current]})};function Sa({...e}){const[n,s]=d.useState(""),r=d.useRef(null);return d.useEffect(()=>{const a=setTimeout(()=>{s(pe.getVideo())},1e3);return()=>{clearTimeout(a)}},[]),d.useEffect(()=>{try{r.current&&(r.current.playbackRate=16)}catch(a){Je(a)}},[n]),t.jsx(ya,{...e,children:t.jsx(va,{src:n,ref:r,loop:!0,autoPlay:!0,className:"ph-no-capture"})})}const ya=g("div",{target:"egk8upf1"})({name:"1g34f1k",styles:"width:80rem;height:60rem"}),va=g("video",{target:"egk8upf0"})({name:"idj2s4",styles:"object-fit:cover;width:100%;height:100%"});function wa(e){return 1-Math.pow(1-e,3)}function ja(e){return wa(e)}function Q({color:e,maxScore:n,score:s}){return t.jsx(ka,{style:{border:s===0?0:void 0,width:`${ja(s/n)*24}%`,backgroundColor:e}})}const ka=g("div",{target:"epk9dli0"})({name:"1vc31u",styles:`background-image:linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.17) 0%,
    rgba(0, 0, 0, 0.03) 50%,
    rgba(0, 0, 0, 0.18) 51%,
    rgba(0, 0, 0, 0.18) 100%
  );transition:1s;border-radius:0.5rem;height:100%;border:solid 0.1rem black;box-sizing:border-box`});function Ea({playerNumber:e,player:n,segment:s}){const[r,a]=n.detailedScore;return t.jsxs(Ca,{children:[t.jsx(Q,{score:s>-1?r.rap+r.freestyle+r.normal:0,maxScore:a.rap+a.freestyle+a.normal,color:F.colors.players[e].perfect.fill}),t.jsx(Q,{score:s>0?r.perfect:0,maxScore:a.perfect,color:F.colors.players[e].stroke}),t.jsx(Q,{score:s>1?r.star:0,maxScore:a.star,color:F.colors.players[e].starPerfect.stroke}),t.jsx(Q,{score:s>2?r.vibrato:0,maxScore:a.vibrato,color:F.colors.players[e].perfect.stroke}),t.jsx(Pa,{children:s<5&&t.jsx(rn,{options:{strings:["Regular notes","Perfect notes","Star notes","Vibrato"],pauseFor:1e3,autoStart:!0,delay:15,deleteSpeed:15,cursor:""}})})]})}const Ca=g("div",{target:"e10trgut1"})({name:"yex4ym",styles:"position:relative;height:4rem;width:100rem;background:rgba(0, 0, 0, 0.5);display:flex;flex-direction:row;padding:0.5rem;border-radius:1rem;gap:0.5rem"}),Pa=g("span",{target:"e10trgut0"})("position:absolute;",N,";font-size:3rem;text-align:right;white-space:nowrap;top:5rem;left:1rem;display:block;");function Ma({playerNumber:e,player:n,highestScore:s,highScores:r,singSetup:a,useColors:i=!0,revealHighScore:o,segment:c}){const[l]=n.detailedScore;let u=0;c>-1&&(u=l.normal+l.rap+l.freestyle),c>0&&(u=u+l.perfect),c>1&&(u=u+l.star),c>2&&(u=u+l.vibrato);const h=f=>r.some(m=>m.singSetupId===a.id&&m.name===f);return t.jsxs(za,{children:[t.jsx(kt,{color:i?F.colors.players[e].text:"","data-test":`player-${e}-name`,className:"ph-no-capture",children:n.name}),t.jsx(Ta,{children:t.jsxs(Aa,{highscore:o&&h(n.name),color:i?F.colors.players[e].text:"",win:o&&u===s,"data-test":`player-${e}-score`,"data-score":u,children:[t.jsx(lt,{preserveValue:!0,end:u,formattingFn:wn.format,duration:c<5?1:.5}),t.jsx(Fa,{highscore:o&&h(n.name),children:"High score!"})]})}),t.jsx(Ea,{playerNumber:e,player:n,segment:c})]})}const za=g("div",{target:"e1hn1x414"})({name:"1kdaoj4",styles:"display:flex;flex-direction:column;align-items:center;gap:1.5rem"}),kt=g(on,{target:"e1hn1x413"})("padding-left:10rem;padding-right:10rem;font-size:3.5rem;color:",e=>e.color,";"),Aa=g(kt,{target:"e1hn1x412"})("font-size:",e=>e.win?"8.5rem":"5.5rem",";color:",e=>e.win?F.colors.text.active:"white",";transition:400ms ease-in-out;position:relative;"),Ta=g("div",{target:"e1hn1x411"})({name:"f9rldz",styles:"height:8.5rem"}),Fa=g(cn,{target:"e1hn1x410"})("top:-1.5rem;right:-10rem;font-size:3rem;",e=>e.highscore&&ln,";opacity:",e=>e.highscore?"1":"0",";transition:400ms;");function Ia({onNextStep:e,players:n,highScores:s,singSetup:r}){const[a,i]=d.useState(-1);d.useEffect(()=>{if(a<0)i(0);else if(a<4){const p=setInterval(()=>{i(x=>x+1)},1500);return()=>{clearInterval(p)}}},[a]);const o=a>3,c=()=>{o?e():(un.capture("animation_skipped"),i(5))};he({accept:c},!0,[a]);const l=d.useMemo(()=>({accept:"Next"}),[]);nt(l,!0);const u=r.mode===L.CO_OP,h=u?[{...n[0],name:n.map(p=>p.name).join(", ")}]:n,f=h.map(p=>dn(p.detailedScore[0])),m=Math.max(...f);return t.jsxs(t.Fragment,{children:[t.jsx(Na,{children:h.map((p,x)=>t.jsx(Ma,{playerNumber:p.playerNumber,useColors:!u,revealHighScore:a>3,segment:a,player:p,highScores:s,highestScore:m,singSetup:r},x))}),t.jsx(Ra,{onClick:c,focused:!0,"data-test":o?"highscores-button":"skip-animation-button",children:o?"Next":"Skip"}),pe.getPermissionStatus()&&t.jsx(La,{})]})}const Na=g("div",{target:"ez8rfb42"})({name:"nvdiyi",styles:"position:absolute;top:20rem;width:100%;text-align:center;display:flex;flex-direction:column;gap:2rem"}),Ra=g($,{target:"ez8rfb41"})({name:"dmbiod",styles:"position:absolute;bottom:4rem;right:2rem;width:40rem;font-size:1.9vw"}),La=g(Sa,{target:"ez8rfb40"})({name:"1c3jvq",styles:"position:absolute;top:calc(50% - 30rem);left:95rem;transform:scale(0.75)"});function Ba(){return d.useMemo(()=>JSON.parse(sessionStorage.getItem(Qe))??[],[])}function Da({score:e,register:n,singSetupId:s,onSave:r,index:a}){const i=d.useRef(null),[o,c]=d.useState(""),l=Ba(),u=()=>{o.trim().length&&o.trim()!==e.name&&r(s,e.score,e.name,o)};return t.jsx(yt,{className:"ph-no-capture",options:l,onChange:c,onBlur:u,value:o,label:"",ref:i,...n(`highscore-rename-${a}`,()=>{var h;return(h=i.current)==null?void 0:h.focus()}),placeholder:e.name,"data-test":"input-edit-highscore","data-original-name":e.name})}function Oa({onNextStep:e,highScores:n,singSetup:s,song:r}){const{register:a}=ne(),i=qn(r);return t.jsxs(t.Fragment,{children:[t.jsx($a,{"data-test":"highscores-container",children:n.map((o,c)=>t.jsxs(_a,{isCurrentSing:o.singSetupId===s.id,children:[t.jsx(Ga,{children:c+1}),t.jsx(Va,{className:"ph-no-capture",children:o.singSetupId===s.id?t.jsx(Da,{index:c,score:o,register:a,singSetupId:s.id,onSave:i}):o.name}),t.jsx(Ka,{children:t.jsx(jn,{score:o.score})}),t.jsx(Ha,{children:G(o.date).format("MMMM DD, YYYY")})]},c))}),t.jsx(Ua,{...a("play-next-song-button",e,void 0,!0),children:"Select song"})]})}const $a=g("div",{target:"e161j45v6"})({name:"9gtmjg",styles:"position:absolute;top:20rem;width:100%;text-align:center;padding:0 16rem;box-sizing:border-box"}),_a=g("div",{target:"e161j45v5"})("position:relative;",N,";font-size:3.2rem;display:flex;background:",e=>e.isCurrentSing?"rgba(0,0,0,.9)":"rgba(0,0,0,.5)",";margin-bottom:2rem;padding:",e=>e.isCurrentSing?"0 1.5rem":"1rem 3.2rem",";align-items:center;"),Ga=g("div",{target:"e161j45v4"})("padding:0 1.6rem;color:",F.colors.text.active,";"),Va=g("div",{target:"e161j45v3"})({name:"1mbe2e5",styles:"text-align:left;flex:1;padding:1.6rem"}),Ka=g("div",{target:"e161j45v2"})({name:"2ycp6t",styles:"padding:0 1rem"}),Ha=g("div",{target:"e161j45v1"})({name:"1gbnj87",styles:"position:absolute;font-size:2rem;bottom:-1rem;right:-1.6rem;background:black;padding:0.5rem"}),Ua=g($,{target:"e161j45v0"})({name:"dmbiod",styles:"position:absolute;bottom:4rem;right:2rem;width:40rem;font-size:1.9vw"});function qa({song:e,width:n,height:s,onClickSongSelection:r,players:a,highScores:i,singSetup:o}){const[c]=O(gn);it(!0);const[l,u]=d.useState("results");return t.jsxs(hn,{songData:e,width:n,height:s,children:[t.jsxs(Ya,{children:[l==="results"&&t.jsx(Ia,{onNextStep:()=>u("highscores"),players:a,singSetup:o,highScores:i}),l==="highscores"&&t.jsx(Oa,{onNextStep:r,singSetup:o,highScores:i,song:e}),t.jsx(Wa,{$active:!0})]}),c&&t.jsxs(Xa,{children:["Credit to ",t.jsx("a",{href:"https://www.FesliyanStudios.com",children:"https://www.FesliyanStudios.com"})," for the background music."]})]})}const Ya=g("div",{target:"ehc5trj2"})({name:"1quw0ni",styles:"pointer-events:auto"}),Wa=g(ba,{shouldForwardProp:e=>!e.startsWith("$"),target:"ehc5trj1"})("transition:300ms;transform:scale(",({$active:e})=>e?1:0,");position:absolute;bottom:20rem;font-size:3.2rem;line-height:1.25;color:white;text-align:center;background:rgba(0, 0, 0, 0.75);width:100%;box-sizing:border-box;padding:2rem 10rem;kbd{padding:0.12rem 0.9rem;border-radius:1rem;border:0.5rem solid rgb(204, 204, 204);border-bottom-color:rgb(150, 150, 150);border-right-color:rgb(150, 150, 150);color:rgb(51, 51, 51);line-height:1.4;display:inline-block;box-shadow:0 0.1rem 0 rgba(0, 0, 0, 0.2),inset 0 0 0 0.2rem #ffffff;background-color:rgb(247, 247, 247);text-shadow:0 0.1rem 0 #fff;font-weight:normal;}"),Xa=g("span",{target:"ehc5trj0"})("position:fixed;bottom:2rem;left:2rem;font-size:1.5rem;",N,";");function Qa(e){const[n,s,r,a]=Ja(e);return Za(n,s,r,a)()}function Ja(e){let n=1779033703,s=3144134277,r=1013904242,a=2773480762;for(let i=0,o;i<e.length;i++)o=e.charCodeAt(i),n=s^Math.imul(n^o,597399067),s=r^Math.imul(s^o,2869860233),r=a^Math.imul(r^o,951274213),a=n^Math.imul(a^o,2716044179);return n=Math.imul(r^n>>>18,597399067),s=Math.imul(a^s>>>22,2869860233),r=Math.imul(n^r>>>17,951274213),a=Math.imul(s^a>>>19,2716044179),n^=s^r^a,s^=n,r^=n,a^=n,[n>>>0,s>>>0,r>>>0,a>>>0]}function Za(e,n,s,r){return function(){e|=0,n|=0,s|=0,r|=0;var a=(e+n|0)+r|0;return r=r+1|0,e=n^n>>>9,n=s+(s<<3)|0,s=s<<21|s>>>11,s=s+a|0,(a>>>0)/4294967296}}const er=["Lysa Arryn","Peter Parker","Zordon","Chad Khalimov","Dat Boi","Good Guy Greg","Scumbag Steve","Meme Man","Pepe","Wojak","Ebmarah","Shrek","Vad of ICE Beat","Krasnolud","Mały Aragorn","Morning Breeze","Auytjak Lorav","Smelly Cat","Stinky Foot"],Oe=new Date("2016-01-01").getTime(),tr=new Date("2024-01-07").getTime(),ue=5;function nr(e,n){const s=be(e);return d.useMemo(()=>{const a=[...er];return[...Array.from({length:ue},(o,c)=>{const l=Qa(e.id+c),u=6e5+14e5/(ue-1)*c,h=a.splice(Math.floor(l*a.length),1)[0];return{singSetupId:c.toString(),name:h,score:mn()?u/1e3:u,date:new Date((tr-Oe)*l+Oe).toISOString()}}),...(s==null?void 0:s.scores.filter(({setup:o})=>o.mode===n.mode&&o.tolerance===n.tolerance).map(o=>o.scores.map(c=>({...c,date:o.date,singSetupId:o.setup.id}))).flat())??[]].sort((o,c)=>c.score-o.score).slice(0,ue)},[e.id,s,n])??[]}function sr({song:e,width:n,height:s,onClickSongSelection:r,singSetup:a}){const i=nr(e,a),o=d.useMemo(()=>D.getPlayers().map(c=>({name:c.getName(),playerNumber:c.number,detailedScore:K.getPlayerDetailedScore(c.number)})),[]);return t.jsx(qa,{singSetup:a,song:e,width:n,height:s,onClickSongSelection:r,players:o,highScores:i})}function ar({songPreview:e,singSetup:n,returnToSongSelection:s,restartSong:r}){wt(),vt();const a=d.useRef(null),i=fn(e.id),{width:o,height:c}=fe(),[l,u]=d.useState(!1),[h,f]=d.useState(!0),[m,p]=d.useState(J.UNSTARTED),x=d.useMemo(()=>i.data?n.mode!==L.PASS_THE_MIC?i.data.tracks.map(()=>[]):xa(i.data):[],[i.data,n]),[E,S]=d.useState(!1);return ct(!E),d.useEffect(()=>{h&&i.data&&(E||m!==J.UNSTARTED)&&f(!1)},[i.data,E,m,h]),l&&i.data?t.jsx(sr,{width:o,height:c,song:i.data,onClickSongSelection:s,singSetup:n}):t.jsxs(rr,{children:[t.jsxs(or,{visible:h,children:[t.jsx(cr,{video:e.video,width:o,height:c}),t.jsx(lr,{children:e.artist}),t.jsx(dr,{children:e.title}),t.jsx(ia,{onFinish:()=>{var v;S(!0),(v=a.current)==null||v.play()}})]}),i.data&&t.jsx(kn,{ref:a,onStatusChange:p,playerChanges:x,players:n.players,song:i.data,width:o,height:c,autoplay:!1,onSongEnd:()=>{var w;const v=((w=K.getSingSetup())==null?void 0:w.mode)===L.CO_OP?[{name:D.getPlayers().map(b=>b.getName()).join(", "),score:K.getPlayerScore(0)}]:D.getPlayers().map(b=>({name:b.getName(),score:K.getPlayerScore(b.number)})),j=K.getSongCompletionProgress();I.songEnded.dispatch(i.data,n,v,j),u(!0)},singSetup:n,restartSong:r})]})}const rr=g("div",{target:"e1pnu1v94"})({name:"bjn8wh",styles:"position:relative"}),or=g("div",{target:"e1pnu1v93"})("position:fixed;top:0;left:0;z-index:10;pointer-events:none;background-color:black;view-transition-name:song-preview;opacity:",e=>e.visible?1:0,";transition:500ms;"),ir=g("div",{target:"e1pnu1v92"})({name:"oux8x1",styles:"background-size:cover;background-position:center center;filter:blur(10px)"}),cr=e=>t.jsx(ir,{style:{backgroundImage:`url('https://i3.ytimg.com/vi/${e.video}/hqdefault.jpg')`,width:`${e.width}px`,height:`${e.height}px`}}),lr=g(Se,{target:"e1pnu1v91"})({name:"oyknw4",styles:"view-transition-name:song-preview-artist;position:absolute;top:10rem;left:10rem;font-size:7rem"}),dr=g(se,{target:"e1pnu1v90"})({name:"1l9juvo",styles:"view-transition-name:song-preview-title;position:absolute;font-size:8rem;top:19rem;left:10rem"});function hr(){const e=pn("song"),[n,s]=d.useState(null),[r,a]=d.useState(e??null),[i,o]=d.useState(0),c=l=>{document.getElementById("preview-video-container").style.viewTransitionName="song-preview-video",at(()=>{document.getElementById("preview-video-container").style.viewTransitionName="",rt.flushSync(()=>{s(l)})}),ot.play()};return wt(),t.jsx(t.Fragment,{children:n?t.jsx(ar,{restartSong:()=>{pe.restartRecord(),o(l=>l+1)},songPreview:n.song,singSetup:n,returnToSongSelection:()=>{a(n.song.id),s(null)}},i):t.jsx(ra,{onSongSelected:c,preselectedSong:r})})}export{hr as default};
//# sourceMappingURL=Game-ciPLsPa7.js.map
