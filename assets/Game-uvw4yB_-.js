import{a3 as jt,a4 as kt,a5 as Et,c as Ne,j as t,r as d,a6 as Y,a7 as ye,a8 as te,a9 as I,aa as Re,a2 as u,ab as ve,ac as Ct,ad as O,ae as F,af as zt,ag as D,ah as Le,ai as ne,aj as ue,ak as N,al as Pt,N as Mt,O as Tt,am as we,an as Be,ao as $e,ap as At,C as H,Y as G,aq as De,ar as R,as as Ft,at as It,au as Nt,av as Oe,aw as _e,ax as ge,ay as Rt,az as Lt,aA as $,aB as Bt,aC as Ge,aD as Ve,aE as $t,aF as He,aG as Dt,aH as Ue,aI as he,aJ as Ot,aK as _t,aL as Q,aM as Gt,X as Vt,aN as qe,aO as Ke,aP as W,aQ as Z,aR as Ye,aS as Ht,aT as We,aU as Xe,aV as Je,aW as Ut,aX as qt,aY as Qe,G as Ze,aZ as et,a_ as Kt,W as tt,V as nt,a$ as st,b0 as Yt,b1 as Wt,b2 as Xt,b3 as at,b4 as Jt,b5 as ee,b6 as Qt,b7 as rt,b8 as it,b9 as Zt,ba as me,bb as en,bc as tn,bd as nn,be as sn,bf as an,bg as rn,bh as on,bi as cn,bj as J,bk as ln}from"./index-1hHnJqnz.js";import{u as dn,P as un,a as gn,S as hn,b as U,c as mn,f as fn,d as pn,e as xn}from"./Player-yCSiLZjf.js";function bn(e){var n=jt(e),s=n%1;return n===n?s?n-s:n:0}var Sn=Math.ceil,yn=Math.max;function je(e,n,s){(s?kt(e,n,s):n===void 0)?n=1:n=yn(bn(n),0);var r=e==null?0:e.length;if(!r||n<1)return[];for(var a=0,o=0,i=Array(Sn(r/n));a<r;)i[o++]=Et(e,a,a+=n);return i}const vn=Ne(t.jsx("path",{d:"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm0-9C6.67 9 6 8.33 6 7.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-9c-.83 0-1.5-.67-1.5-1.5S15.67 6 16.5 6s1.5.67 1.5 1.5S17.33 9 16.5 9z"}),"Casino"),wn=Ne(t.jsx("path",{d:"M16.59 7.58 10 14.17l-3.59-3.58L5 12l5 5 8-8zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"}),"CheckCircleOutline");function jn({setFilters:e,filters:n,keyboardControl:s,visible:r,setVisible:a}){const o=d.useRef(null),[i,l]=d.useState(!1),c=m=>{e(p=>({...p,search:m}))};Y("down",()=>{var m;(m=o.current)==null||m.blur()},{enabled:i,enableOnTags:["INPUT"]});const h=m=>{m.stopPropagation(),m.preventDefault(),c(m.key)};Y(ye,m=>{h(m),a(!0)},{enabled:!n.search&&s});const f=d.useCallback(m=>{s&&c(m)},[s]);return te(I.remoteSongSearch,f),Y(ye,m=>{var p;h(m),(p=o.current)==null||p.focus()},{enabled:!i&&s},[n.search]),Y("Backspace",m=>{var p;(p=o.current)==null||p.focus()},{enabled:!i&&s},[n.search]),d.useEffect(()=>{i||a(!!n.search)},[i,n.search,a]),!n.search&&!r?null:t.jsx(kn,{"data-test":"song-list-search",children:t.jsx(En,{large:!0,children:t.jsx("form",{"data-test":"filters-search-form",onSubmit:m=>{var p;m.preventDefault(),(p=o.current)==null||p.blur()},children:t.jsx(Re,{onFocus:()=>l(!0),onBlur:()=>l(!1),onKeyDown:m=>{var p;m.key==="Backspace"&&((p=n.search)==null?void 0:p.length)===0&&a(!1)},focused:i,autoFocus:!0,label:"Search",value:n.search??"",onChange:c,ref:o,"data-test":"filters-search"})})})})}const kn=u("div",{target:"e1elgrzq1"})({name:"t46wvs",styles:"background:rgba(0, 0, 0, 0.7);padding:2rem;font-size:3rem;box-sizing:border-box;display:flex;flex-direction:row;gap:2rem;position:fixed;z-index:200;top:4.5rem;left:30rem;right:30rem"}),En=u("div",{target:"e1elgrzq0"})("flex:",e=>e.large?1.5:1,";");function Cn({onRandom:e,setFilters:n,filters:s,keyboardControl:r}){const[a,o]=d.useState(!1),i=()=>{n(l=>({...l,search:""}))};return t.jsxs(t.Fragment,{children:[t.jsxs(zn,{children:[t.jsx(ve,{title:"Search",placement:"left",children:t.jsx(ke,{onClick:()=>a?i():o(!0),"data-test":"search-song-button",children:t.jsx(Ct,{})})}),t.jsx(ve,{title:"Pick random",placement:"left",children:t.jsx(ke,{onClick:e,"data-test":"random-song-button",children:t.jsx(vn,{})})})]}),t.jsx(jn,{setFilters:n,filters:s,visible:a,setVisible:o,keyboardControl:r})]})}const ke=u(O,{target:"e12uvlok1"})("box-shadow:inset 0 0 2px 2px ",F.colors.text.active,";background:black;width:7.5rem;height:7.5rem;border-radius:50%;display:flex;align-items:center;justify-content:center;svg{width:4.5rem;height:4.5rem;}"),zn=u("div",{target:"e12uvlok0"})({name:"1x0sh4s",styles:"pointer-events:none;position:fixed;display:flex;flex-direction:column;align-items:center;justify-content:center;bottom:2.5rem;right:2.5rem;z-index:100;gap:2rem"});function ot({videoId:e,...n}){return t.jsx(An,{src:`https://img.youtube.com/vi/${e}/default.jpg`,alt:`Thumbnail image for YouTube video ${e}`,...n})}function Pn({videoId:e,...n}){const s=zt(e)??e,[r,a]=d.useState(!0);d.useLayoutEffect(()=>{a(i=>!i)},[e]);const[o]=D(Le);return o==="low"?null:t.jsxs(Mn,{...n,children:[t.jsx(Ee,{videoId:r?e:s,visible:r}),t.jsx(Ee,{videoId:r?s:e,visible:!r}),t.jsx(Tn,{videoId:s})]})}const Mn=u("div",{target:"elot36a3"})({name:"k44s62",styles:"position:relative;overflow:hidden;background:black"}),Tn=u(ot,{target:"elot36a2"})({name:"6dhm9o",styles:"visibility:hidden"}),Ee=u(ot,{target:"elot36a1"})("position:absolute;transition:opacity 300ms;opacity:",e=>e.visible?1:0,";"),An=u("img",{target:"elot36a0"})({name:"4uwt2b",styles:"width:100%;height:100%;object-fit:cover"});function Fn({active:e,closePlaylist:n,playlists:s,selectedPlaylist:r,setSelectedPlaylist:a}){const{register:o,focused:i,focusElement:l}=ne({enabled:e,additionalHelp:{vertical:void 0,"horizontal-vertical":null}});return ue({left:()=>n("left"),right:()=>n("right")},e),d.useEffect(()=>{const c=new URLSearchParams(window.location.search).get("playlist");c&&l(`playlist-${c}`)},[]),d.useEffect(()=>{if(i){const c=s.find(g=>`playlist-${g.name}`===i);if(c){const g=new URL(window.location.href);g.searchParams.set("playlist",c.name),window.history.pushState(null,"",g.toString()),a(c.name)}}},[i,s]),t.jsx(In,{"data-test":"song-list-playlists",active:e,children:s.map(c=>t.jsx(Nn,{"data-selected":`playlist-${c.name}`===i,active:e,...o(`playlist-${c.name}`,()=>l(`playlist-${c.name}`),void 0,c.name===r),...e?{}:{selected:`playlist-${c.name}`===i},children:c.display??c.name},c.name))})}const In=u("div",{target:"eemp7f41"})("background:rgba(0, 0, 0, ",e=>e.active?.75:.5,");width:100vh;transform-origin:top right;transform:rotate(-90deg);position:absolute;z-index:200;left:-100vh;top:0;font-size:3.6rem;box-sizing:border-box;display:flex;flex-direction:row-reverse;gap:0;h2{",N,";margin:0;}"),Nn=u(O,{target:"eemp7f40"})("font-size:3rem;justify-self:stretch;flex-grow:1;",e=>!e.focused&&e.active&&"background-color: transparent;",";padding:1.5rem;",e=>e.selected?Pt:!e.active&&"opacity: .75;",";");var fe={},Rn=Tt;Object.defineProperty(fe,"__esModule",{value:!0});var ct=fe.default=void 0,Ln=Rn(Mt()),ie=t,Bn=(0,Ln.default)([(0,ie.jsx)("path",{fillRule:"evenodd",d:"M16.67 13.13C18.04 14.06 19 15.32 19 17v3h4v-3c0-2.18-3.57-3.47-6.33-3.87z"},"0"),(0,ie.jsx)("circle",{cx:"9",cy:"8",r:"4",fillRule:"evenodd"},"1"),(0,ie.jsx)("path",{fillRule:"evenodd",d:"M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4c-.47 0-.91.1-1.33.24C14.5 5.27 15 6.58 15 8s-.5 2.73-1.33 3.76c.42.14.86.24 1.33.24zm-6 1c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"},"2")],"PeopleAlt");ct=fe.default=Bn;const $n=JSON.parse(`{
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
}`),Dn=["US","GB"];function On({song:e,...n}){const s=Array.isArray(e.language)?e.language[0]:e.language,r=d.useMemo(()=>{var a;return e.artistOrigin?((a=$n[e.artistOrigin.toLowerCase()])==null?void 0:a.includes(s))??!1:!1},[e.artistOrigin,s]);return t.jsx(t.Fragment,{children:r&&!Dn.includes(e.artistOrigin)?t.jsx(we,{isocode:e.artistOrigin,...n}):e.language!=="English"?t.jsx(we,{language:e.language,...n}):null})}const pe=e=>{const[n,s]=d.useState(null),r=Be(e),a=async()=>{s(await $e(e))};return d.useEffect(()=>{a()},[r]),te(I.songStatStored,a),n},_n=e=>async(n,s,r,a)=>{const o=Be(e),i=await $e(e),l=i.scores.map(g=>{if(g.setup.id!==n)return g;const h=g.scores.map(f=>f.name!==r||f.score!==s?f:{name:a.trim(),score:s});return{...g,scores:h}}),c={...i,scores:l};await At(e,c),I.songScoreUpdated.dispatch(o,c,a.trim())},lt=({song:e,focused:n,video:s,children:r,index:a,handleClick:o,background:i=!0,expanded:l=!1,...c})=>{const g=d.useCallback(()=>o?o(a):void 0,[o,a]);return t.jsxs(Un,{...c,onClick:o?g:void 0,children:[i&&t.jsx(qn,{style:{backgroundImage:`url('https://i3.ytimg.com/vi/${e.video}/hqdefault.jpg')`},focused:n,expanded:l}),t.jsxs(Hn,{expanded:l,children:[!l&&t.jsx(Kn,{song:e}),e.tracksCount>1&&!l&&t.jsxs(Yn,{"data-test":"multitrack-indicator",children:[t.jsx(ct,{}),"  Duet"]}),t.jsx(xe,{expanded:l,children:e.artist}),t.jsx(se,{expanded:l,children:e.title}),t.jsxs(dt,{expanded:l,children:[l&&t.jsxs(t.Fragment,{children:[e.author&&t.jsxs(gt,{expanded:l,children:["by ",e.authorUrl?t.jsx("a",{href:e.authorUrl,target:"_blank",rel:"noreferrer",children:e.author}):e.author]}),t.jsx(Wn,{song:e})]}),!l&&t.jsx(Gn,{song:e})]})]}),r,s]})},Gn=u(On,{target:"ez73e2r10"})({name:"1w2zyc9",styles:"height:2.75rem;object-fit:cover;border-top-right-radius:1rem;position:absolute;z-index:-1;left:0rem;bottom:0rem;opacity:0.95"}),dt=u("div",{target:"ez73e2r9"})({name:"1dgv8bf",styles:"display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start"});var Vn={name:"1u0tp1t",styles:"align-items:flex-start;justify-content:flex-start"};const Hn=u("div",{target:"ez73e2r8"})("width:100%;height:100%;display:flex;align-items:flex-end;justify-content:flex-end;z-index:1;box-sizing:border-box;flex-direction:column;",e=>e.expanded&&Vn,";"),Un=u("div",{target:"ez73e2r7"})({name:"1s4n252",styles:"font-size:4.5rem;display:flex;align-items:flex-end;justify-content:flex-end;flex-direction:column;box-sizing:border-box;position:relative;padding:0.5rem;border:0.1rem black solid;border-radius:1rem"}),qn=u("div",{target:"ez73e2r6"})("background-color:",F.colors.text.inactive,";position:absolute;z-index:-1;inset:0;",e=>e.theme.graphicSetting==="high"?H("background-size:",e.focused?100:110,"%;",e.focused?"":"filter: grayscale(90%);"," ",e.expanded?"filter: blur(10px);":""," transition:300ms;opacity:",e.focused?1:.8,";",""):H("background-size:100%;opacity:",e.focused?1:.6,";","")," background-position:center center;"),ut=u("span",{target:"ez73e2r5"})("background:rgba(0, 0, 0, 0.7);width:auto;display:inline-block;padding:0.5rem;",N,";text-align:right;font-size:",({expanded:e})=>e?"6rem":"2.7rem",";"),xe=u(ut,{target:"ez73e2r4"})("color:",F.colors.text.active,";"),se=u(ut,{target:"ez73e2r3"})("margin-top:",e=>e.expanded?"1.5rem":"0.5rem",";color:white;"),gt=u(se,{target:"ez73e2r2"})({name:"5twmqz",styles:"font-size:3rem;margin-top:3rem"}),Kn=({song:e})=>{var a,o;const n=pe(e),s=((o=(a=n==null?void 0:n.scores)==null?void 0:a.at(-1))==null?void 0:o.date)??!1,r=s&&G(s).isAfter(G().subtract(1,"days"));return n!=null&&n.plays?t.jsx(ht,{"data-test":"song-stat-indicator",children:r?"Played today":n.plays}):null},ht=u("div",{target:"ez73e2r1"})({name:"ohpsts",styles:"position:absolute;top:0.5rem;right:0.5rem;padding:0 1rem;height:2.75rem;min-width:2.75rem;box-sizing:border-box;border-radius:5rem;color:white;background:rgba(0, 0, 0, 0.75);font-size:1.4rem;display:flex;align-items:center;justify-content:center;text-transform:uppercase"}),Yn=u(ht,{target:"ez73e2r0"})({name:"sq8m9a",styles:"left:0.5rem;right:auto;svg{width:1.75rem;height:1.75rem;}"}),Wn=({song:e})=>{const n=pe(e);return t.jsx(gt,{children:n!=null&&n.plays?`Played ${n.plays} time${n.plays>1?"s":""}`:"Never played yet"})};function Xn({groupedSongList:e,containerRef:n,selectSong:s}){const[r,a]=d.useState([]);d.useEffect(()=>{const i=new IntersectionObserver(l=>{l.forEach(c=>{const g=c.target.getAttribute("data-group-letter");c.isIntersecting?a(h=>[...h,g]):a(h=>h.filter(f=>f!==g))})},{threshold:.05});return e.forEach(l=>{const c=document.querySelector(`[data-group-letter="${l.letter}"]`);c&&i.observe(c)}),()=>{i.disconnect(),a([])}},[e]);const o=i=>{s(i.songs[0].index),setTimeout(()=>{const l=document.querySelector(`[data-group-letter="${i.letter}"]`);if(l&&n.current){const c=10*parseFloat(getComputedStyle(document.documentElement).fontSize),g=l.getBoundingClientRect().top+n.current.scrollTop-c;n.current.scrollTo({top:g,behavior:"smooth"})}},20)};return t.jsx(t.Fragment,{children:t.jsx(Jn,{children:e.map(i=>{const l=r.includes(i.letter);return t.jsx(Qn,{active:l,onClick:()=>o(i),"data-active":l,"data-test":`group-navigation-${i.letter}`,children:i.letter},i.letter)})})})}const Jn=u("div",{target:"e1xsv3er1"})({name:"1lpq7pk",styles:"position:fixed;display:flex;flex-direction:row;align-items:center;justify-content:flex-start;top:0;left:6.5rem;padding:1rem 0 1.5rem 2rem;width:100%;z-index:100;gap:1rem;background:rgba(0, 0, 0, 0.8)"}),Qn=u(O,{target:"e1xsv3er0"})("border:none;cursor:pointer;",N,";display:inline-block;padding:0.5rem 1.25rem;font-size:3.5rem;z-index:1;color:",F.colors.text.default,";background:",e=>e.active?F.colors.lines.star.stroke:"rgba(0, 0, 0, 0.7)",";"),Ce={[R.DUEL]:"Duel",[R.PASS_THE_MIC]:"Pass The Mic",[R.CO_OP]:"Cooperation"},oe=["Hard","Medium","Easy"],Zn=De("song_settings-game_mode-v3"),es=De("song_settings-tolerance-v2");function ts({songPreview:e,onNextStep:n,keyboardControl:s,onExitKeyboardControl:r}){const[a,o]=Zn(null),i=a??(e.tracksCount>1?R.CO_OP:R.DUEL),[l,c]=es(1),g=()=>{const p={id:It(),players:[],mode:i,tolerance:l+1};n(p)},h=()=>{o(Nt(Object.values(R),i))},f=()=>c(p=>Oe(oe,p,-1)),{register:m}=ne({enabled:s,onBackspace:r});return t.jsxs(t.Fragment,{children:[t.jsx(ze,{...m("difficulty-setting",f,"Change difficulty"),label:"Difficulty",value:oe[l],"data-test-value":oe[l]}),t.jsx(ze,{...m("game-mode-setting",h,"Change mode"),label:"Mode",value:Ce[i],"data-test-value":Ce[i]}),t.jsxs(ss,{children:[i===R.DUEL&&"Face off against each other - person that earns more points wins.",i===R.CO_OP&&"Join forces and sing together - your points will be added up to a single pool.",i===R.PASS_THE_MIC&&t.jsxs(t.Fragment,{children:["For more than 2 players - split into groups and pass the microphone within the group when prompted with"," ",t.jsx(Ft,{})," symbol."]})]}),t.jsx(ns,{...m("next-step-button",g,void 0,!0),children:"Next ➤"})]})}const ns=u(O,{target:"ec10mev2"})({name:"sr8dp2",styles:"padding:0.5rem 9rem;font-size:4.3rem;width:50rem"}),ss=u("h3",{target:"ec10mev1"})({name:"rdh6te",styles:"max-width:50rem;margin:-1rem 0 1rem!important;padding:1.5rem;background:rgba(0, 0, 0, 0.7);box-sizing:border-box"}),ze=u(_e,{target:"ec10mev0"})({name:"1tcj19k",styles:"font-size:4.3rem;padding:1rem;min-width:50rem;box-sizing:border-box"});function as(){const n=ge(I.playerInputChanged,()=>$.getInputs()).some(i=>i.source==="Microphone"),s=d.useRef([]),r=d.useCallback(i=>{s.current.push(i)},[]);Rt(0,50,r);const[a,o]=d.useState(!1);return d.useEffect(()=>{const i=setInterval(()=>{const l=s.current.filter(([,m])=>m===0),c=s.current.filter(([,m])=>m>0),g=l.reduce((m,[p])=>m+p,0)/(l.length+1),h=c.reduce((m,[p])=>m+p,0)/(c.length+1),f=c.length>l.length*.1&&h>.01&&g>.01&&h-g<g/2;o(f),s.current.length=0},a?5e3:2500);return()=>clearInterval(i)},[a]),t.jsxs(rs,{visible:a,children:[t.jsxs("h2",{children:[t.jsx("strong",{children:t.jsx(Lt,{})})," ","Noise detected"]}),t.jsx("hr",{}),t.jsxs("h4",{children:["This might make singing inaccurate. Make sure your microphone doesn't pick up the music."," ",n&&t.jsxs(t.Fragment,{children:["Alternatively, use your ",t.jsx("strong",{children:"smartphone as a microphone"})," instead."]})]})]})}const rs=u("div",{target:"e1n2pbib0"})("opacity:",e=>e.visible?1:0,";transition:300ms;background:rgba(0, 0, 0, 0.75);padding:1rem;max-width:50rem;position:relative;top:-1rem;left:-0.5rem;");function mt({player:e}){const n=dn(e.number);return t.jsxs(is,{"data-test":`indicator-player-${e.number}`,children:[t.jsx(un,{playerNumber:e.number}),t.jsx(gn,{status:n}),n!=="unavailable"&&t.jsx(Bt,{playerNumber:e.number}),t.jsx(os,{className:"ph-no-capture",children:e.getName()})]},e.number)}const is=u("div",{target:"ekzbtn1"})({name:"1gmoqr1",styles:"position:relative;border:0.1rem solid white;padding:1rem 3rem;background:black;width:80%;text-align:center;gap:1.25rem;font-size:2.3rem;color:white;-webkit-text-stroke:1px black"}),os=u("span",{target:"ekzbtn0"})({name:"179t5g5",styles:"position:relative;z-index:1"});function cs(e){Ge(I.playerNameChanged),d.useEffect(()=>{Ve.startMonitoring()},[]);const s=ge(I.playerInputChanged,()=>$.getInputs()).some(r=>r.source!=="Dummy");return t.jsxs(ls,{...e,children:[t.jsxs(ds,{children:["Microphone Check",s?$.getPlayers().map(r=>t.jsx(mt,{player:r},r.number)):t.jsxs(t.Fragment,{children:[t.jsx(us,{children:"Mic not setup"}),t.jsx("h4",{children:"Singing will be emulated"}),t.jsx("h5",{children:"You can setup in the Next step"})]})]}),t.jsx(as,{})]})}const ls=u("div",{target:"en3dwuv2"})("display:flex;font-size:3rem;",N,";margin-bottom:8.6rem;gap:3.5rem;"),ds=u("div",{target:"en3dwuv1"})({name:"fmwdml",styles:"gap:1.25rem;display:flex;flex-direction:column;align-items:center"}),us=u("div",{target:"en3dwuv0"})({name:"1x5xnlp",styles:"position:relative;border:0.1rem solid white;padding:1rem 3rem;background:black;width:80%;text-align:center;gap:1.25rem;font-size:2.3rem;color:white"}),ft=d.forwardRef(({options:e,focused:n,label:s,value:r,onChange:a,disabled:o,placeholder:i,keyboardNavigationChangeFocus:l,onBlur:c,className:g,...h},f)=>{const m=d.useRef(null);d.useImperativeHandle(f,()=>m.current);const p=d.useRef(null),[x,E]=d.useState(!1),[b,v]=d.useState(-1),j=d.useMemo(()=>e.filter(y=>y.toLowerCase().trim().includes(r.toLowerCase().trim())&&y!==r),[e,r]),w=y=>{var C,z,L;if(y.code==="ArrowUp"||y.code==="ArrowDown")if(j.length){y.preventDefault();const k=Oe(j,b,y.code==="ArrowUp"?-1:1);v(k);const M=(C=p.current)==null?void 0:C.querySelector(`[data-index="${k}"]`);M==null||M.scrollIntoView({behavior:"smooth",block:"center"})}else(z=m.current)==null||z.blur(),l==null||l(y.code==="ArrowUp"?-1:1);else if(y.code==="Enter"){const k=j[b];k?(v(-1),a(k)):(L=m.current)==null||L.blur()}},S=()=>{setTimeout(()=>{E(!1),c==null||c()},300)};return t.jsxs(gs,{className:g,children:[t.jsx(Re,{onFocus:()=>E(!0),onBlur:S,onKeyDown:w,onChange:a,value:r,focused:n,label:s,disabled:o,ref:m,placeholder:i,...h}),x&&!!j.length&&t.jsx(hs,{ref:p,role:"listbox",children:j.map((y,C)=>t.jsx(ms,{role:"listitem","data-index":C,"data-focused":C===b,focused:C===b,onClick:()=>{var z;a(y),v(-1),(z=m.current)==null||z.blur()},children:y},y))})]})}),gs=u("div",{target:"e1olyu0z2"})({name:"bjn8wh",styles:"position:relative"}),hs=u("div",{target:"e1olyu0z1"})("margin-top:0.1em;position:absolute;width:100%;background:black;max-height:",(1+2*.3)*4,"em;overflow-y:auto;z-index:2;"),ms=u("div",{target:"e1olyu0z0"})(N,";padding:0.3em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:",e=>e.focused?F.colors.text.active:"white",";cursor:pointer;"),fs=(e,n)=>{var s;return((s=e[n])==null?void 0:s.name)??`Track ${n+1}`};function ps({multipleTracks:e,player:n,songPreview:s,playerNames:r,register:a,onChange:o,setup:i}){const[l,c]=d.useState(!1),g=d.useRef(null);if(Ge(I.playerNameChanged),n===void 0)return null;const h=()=>o({number:n.number,track:(i.track+1)%s.tracksCount}),f=x=>{c(!0),n.setName(x)},m=!l,p=n.getName();return t.jsxs(t.Fragment,{children:[t.jsx(xs,{maxLength:$t,className:"ph-no-capture",value:m?"":p,placeholder:m?p:void 0,options:r,onChange:f,label:"Name:",ref:g,...a(`player-${n.number}-name`,()=>{var x;return(x=g.current)==null?void 0:x.focus()})}),e&&t.jsx(bs,{...a(`player-${n.number}-track-setting`,h,"Change track"),label:"Track",value:fs(s.tracks,i.track),"data-test-value":i.track+1})]})}const xs=u(ft,{target:"e1xlnoyj1"})("input{font-size:4.5rem;}[role='listbox']{max-height:",6*(4.5+.3),"rem;}"),bs=u(_e,{target:"e1xlnoyj0"})({name:"1bwrnjg",styles:"font-size:4.5rem;padding:1.1rem"});function Ss({songPreview:e,onNextStep:n,keyboardControl:s,onExitKeyboardControl:r}){const[a]=D(He),[o]=D(Dt),i=$.getPlayers(),l=!a&&i.length===2&&e.tracksCount>1,c=()=>i.map((S,y)=>({number:S.number,track:l?Math.min(y,e.tracksCount-1):0})),[g,h]=d.useState(c());te([I.playerAdded,I.playerRemoved],()=>h(c()));const f=i.map((S,y)=>g.find(C=>C.number===S.number)??c()[y]),m=d.useMemo(()=>JSON.parse(sessionStorage.getItem(Ue))??[],[]),p=S=>y=>{h(C=>C.map(z=>z.number===S?y:z))},[x,E]=d.useState(!1);d.useEffect(()=>{x||Ve.startMonitoring()},[x]);const{register:b,focusElement:v}=ne({enabled:s&&!x,onBackspace:r}),j=()=>{n(f)},w=!!o&&o!=="skip";return t.jsxs(t.Fragment,{children:[x&&t.jsx(hn,{closeButtonText:w?"Continue to the song":"Continue to player setup",onClose:()=>{E(!1),w&&v("play")}}),f.map((S,y)=>t.jsxs(ys,{children:[t.jsxs(vs,{children:["Player ",y+1]}),t.jsx("div",{children:t.jsx(ps,{multipleTracks:l,player:$.getPlayer(S.number),setup:S,onChange:p(S.number),playerNames:m,register:b,songPreview:e})})]},S.number)),w&&t.jsx(Pe,{...b("play-song-button",j,void 0,!0),children:"Play"}),t.jsx(Pe,{...b("select-inputs-button",()=>E(!0),void 0,!1),children:"Setup mics"})]})}const ys=u("div",{target:"e195hoqe2"})({name:"ho1qnd",styles:"display:flex;flex-direction:row"}),Pe=u(O,{target:"e195hoqe1"})({name:"afgxf2",styles:"padding:0.5rem 9rem;font-size:4.3rem"}),vs=u("span",{target:"e195hoqe0"})(N,";padding:1.3rem;font-size:4.5rem;");function ws({songPreview:e,onPlay:n,keyboardControl:s,onExitKeyboardControl:r}){const[a,o]=d.useState(null),[i,l]=d.useState("song"),c=h=>{o(h),l("players")},g=h=>{if(!a)return;const f={...a,players:h};I.songStarted.dispatch(e,f),n({song:e,...f})};return t.jsxs(js,{children:[t.jsx(cs,{style:i==="players"?{viewTransitionName:"player-mic-check-container"}:void 0}),t.jsxs(ks,{children:[i==="song"&&t.jsx(ts,{songPreview:e,onNextStep:c,keyboardControl:s,onExitKeyboardControl:r}),i==="players"&&t.jsx(Ss,{songPreview:e,onNextStep:g,keyboardControl:s,onExitKeyboardControl:()=>l("song")})]})]})}const js=u("div",{target:"e1ogycp01"})({name:"k6gb66",styles:"display:flex;flex-direction:row;align-items:flex-end;justify-content:space-between;width:100%;hr{margin:1rem;opacity:0.25;}"}),ks=u("div",{target:"e1ogycp00"})({name:"115sh08",styles:"width:auto;display:flex;flex-direction:column;align-items:flex-end;gap:1.25rem"}),Es=30;function Cs({songPreview:e,top:n,left:s,width:r,height:a,keyboardControl:o,onExitKeyboardControl:i,onPlay:l,focusEffect:c}){const[g,h]=d.useState(!1),f=d.useRef(null),{width:m,height:p}=he(),x=o;d.useLayoutEffect(()=>{h(!1)},[e.video]);const E=e.previewStart??(e.videoGap??0)+60,b=e.previewEnd??E+Es,v=d.useMemo(()=>[e.video,E,b,e.volume],[e.video,E,b,e.volume]),[j,w,S,y]=Ot(v,350);d.useEffect(()=>{var k;(k=f.current)==null||k.loadVideoById({videoId:j,startSeconds:w,endSeconds:S})},[j,f,w,S]);const C=x?m:r,z=x?p:a,L=x?Math.min(m/20*9,p*(4/5)):a;return d.useEffect(()=>{var k;(k=f.current)==null||k.setSize(C,z)},[C,z,o]),t.jsxs(t.Fragment,{children:[x&&t.jsx(Ts,{onClick:i}),!x&&g&&t.jsx(Rs,{width:C,height:z,left:s,top:n,song:e}),t.jsx(Ms,{background:x||g,video:t.jsx(Fs,{show:g,expanded:x,height:L,id:"preview-video-container",children:t.jsx(_t,{width:0,height:0,disablekb:!0,ref:f,video:"",volume:y,onStateChange:k=>{var M,_;k===Q.ENDED?((M=f.current)==null||M.seekTo(E),(_=f.current)==null||_.playVideo()):k===Q.PLAYING&&h(!0)}})}),focused:!0,song:e,top:n,left:s,width:C,height:L,showVideo:g,expanded:x,"data-test":"song-preview","data-song":e.id,children:t.jsx(Is,{expanded:x,children:x&&t.jsx(ws,{songPreview:e,onPlay:l,keyboardControl:o,onExitKeyboardControl:i})})})]})}var zs={name:"17gota2",styles:"border:0;border-radius:0;position:fixed;padding:var(--preview-padding)"};const Ps=u(lt,{target:"e1n04uuw4"})("--preview-padding:5rem;width:",e=>e.width,"px;height:",e=>e.height,"px;position:absolute;z-index:",e=>e.expanded?201:3,";overflow:hidden;visibility:",e=>e.expanded||e.showVideo?"visible":"hidden",";",e=>e.expanded?zs:H("pointer-events:none;",e.showVideo&&e.theme.graphicSetting==="high"?"animation: rhythmPulse 1s infinite":"scale: 1.2",";",""),";@keyframes rhythmPulse{0%{transform:scale(1.2);}15%{transform:scale(1.25);}100%{transform:scale(1.2);}}view-transition-name:song-preview;",xe,"{view-transition-name:song-preview-artist;}",se,"{view-transition-name:song-preview-title;}",dt,"{view-transition-name:song-preview-expanded-data;}"),Ms=e=>{const n=e.song.realBpm??(e.song.bpm>300?e.song.bpm/4:e.song.bpm/2);return t.jsx(Ps,{style:{top:e.expanded?`calc(50vh - ${e.height}px / 2)`:e.top,left:e.expanded?0:e.left,animationDuration:`${60/n}s`},...e})},Ts=u("div",{target:"e1n04uuw3"})({name:"1iz7jdz",styles:"position:fixed;top:0;left:0;background:rgba(0, 0, 0, 0.8);width:100vw;height:100vh;z-index:201"});var As={name:"pfrwim",styles:"position:absolute;top:0;left:0;background-image:none!important;border-radius:0.5rem"};const Fs=u("div",{target:"e1n04uuw2"})(e=>e.expanded?H("position:fixed;inset:0;clip-path:inset(calc((100vh - ",e.height,"px) / 2) 0);",""):As," div{opacity:",({show:e})=>e?1:0,";transition:",({show:e,expanded:n})=>e||n?1e3:0,"ms;}"),Is=u("div",{target:"e1n04uuw1"})("inset:auto var(--preview-padding);position:fixed;z-index:100;",e=>!e.expanded&&"transform: scale(0.1);"," border-radius:0.5rem;view-transition-name:song-preview-content;"),Ns=u("div",{target:"e1n04uuw0"})("background:white;width:",e=>e.width,"px;height:",e=>e.height,"px;z-index:2;top:0;left:0;position:absolute;animation:bpm 1s infinite;border-radius:0.5rem;pointer-events:none;@keyframes bpm{0%{transform:scale(1.15);opacity:1;}100%{transform:scale(1.45);opacity:0;}}"),Rs=e=>{const[n]=D(Le);if(n==="low")return null;const s=e.song.realBpm??(e.song.bpm>300?e.song.bpm/4:e.song.bpm/2);return t.jsx(Ns,{width:e.width,height:e.height,style:{left:e.left,top:e.top,animationDuration:`${60/s}s`}})},Ls=e=>{const n=Gt(e);return d.useMemo(()=>[{name:"All",filters:{}},n[0]?{name:n[0].name,filters:{language:n[0].name}}:null,n[1]?{name:n[1].name,filters:{language:n[1].name}}:null,{name:"Classics",filters:{yearBefore:1995}},{name:"Modern",filters:{yearAfter:1995}},{name:"Duets",filters:{duet:!0}},{name:"New",filters:{updatedAfter:G().subtract(31,"days").toISOString()}}].filter(s=>s!==null),[n])},Me={language:(e,n)=>n===""?e:e.filter(s=>(Array.isArray(s.language)?s.language:[s.language]).includes(n)),excludeLanguages:(e,n=[],s)=>n.length===0||W((s==null?void 0:s.search)??"").length>2?e:e.filter(r=>!(Array.isArray(r.language)?r.language:[r.language]).every(o=>n.includes(o))),search:(e,n)=>{const s=W(n);return s.length>2?e.filter(r=>r.search.includes(s)):e},duet:(e,n)=>n===null?e:e.filter(s=>n?s.tracksCount>1:s.tracksCount===1),yearBefore:(e,n)=>n?e.filter(s=>Number(s.year)<n):e,yearAfter:(e,n)=>n?e.filter(s=>Number(s.year)>=n):e,edition:(e,n)=>W(n).length?e.filter(r=>W(r.edition??"")===n):e,updatedAfter:(e,n)=>{if(!n)return e;const s=G(n);return e.filter(r=>r.lastUpdate&&G(r.lastUpdate).isAfter(s))}},Te=(e,n)=>Object.entries(n).filter(s=>s[0]in Me).reduce((s,[r,a])=>Me[r](s,a,n),e),Bs=e=>{var f;const[n]=D(Ke),s=d.useMemo(()=>Te(e,{excludeLanguages:n??[]}),[e,n]),r=Ls(s),[a,o]=d.useState(new URLSearchParams(window.location.search).get("playlist")??null),[i,l]=d.useState({});d.useEffect(()=>{l({})},[a]);const c=d.useDeferredValue(i),g=((f=r.find(m=>m.name===a))==null?void 0:f.filters)??null,h=d.useMemo(()=>Te(e,{...g,...c,excludeLanguages:n??[]}),[e,c,n,g]);return{filters:i,filteredList:h,setFilters:l,selectedPlaylist:a,setSelectedPlaylist:o,playlists:r}};function $s(){const e=Vt(),{filters:n,filteredList:s,setFilters:r,selectedPlaylist:a,setSelectedPlaylist:o,playlists:i}=Bs(e.data);return{groupedSongList:d.useMemo(()=>{if(s.length===0)return[];const c=[];if(!n.search&&!n.edition){const h=s.filter(f=>f.isNew);h.length&&h.length<50&&c.push({letter:"New",isNew:!0,songs:h.map(f=>({song:f,index:s.indexOf(f)}))})}const g=/[^a-zA-Z]/;return s.forEach((h,f)=>{try{const m=isFinite(+h.artist[0])||g.test(h.artist[0])?"0-9":h.artist[0].toUpperCase();let p=c.find(x=>x.letter===m);p||(p={letter:m,songs:[]},c.push(p)),p.songs.push({index:f,song:h})}catch(m){console.error(m),qe(m)}}),c},[s,n.search]),songList:s,filters:n,setFilters:r,isLoading:e.isLoading,selectedPlaylist:a,setSelectedPlaylist:o,playlists:i}}const Ds=30;function Os(e,n,s=Ds){let r;if(n.length<e){const a=[...Array(e).keys()].filter(o=>!n.includes(o));r=a[Z(0,a.length-1)]}else r=Z(0,e-1),n.length=0;return n.length>=s&&n.shift(),n.push(r),r}const _s=(e=[],n)=>{var E;const[s,r]=d.useState([0,0]),a=d.useMemo(()=>e.map(({songs:b})=>je(b.map(v=>v.index),n)).flat(),[e]),o=d.useMemo(()=>e.map(({songs:b,letter:v})=>je(b.map(()=>v),n)).flat(),[e]),i=U(a??[]),l=s[0]===((E=a[s[1]])==null?void 0:E.length)-1,c=d.useCallback(b=>{var w;const v=a.findIndex(S=>S.includes(b)),j=(w=a[v])==null?void 0:w.indexOf(b);j>=0&&v>=0?r([j??0,v??0]):r([0,0])},[a]),g=([b,v],j,w)=>{var y;if(e.length===0)return w;const S=j[v];return(S==null?void 0:S[b])??(S==null?void 0:S.at(-1))??((y=j==null?void 0:j[0])==null?void 0:y[0])??w},h=([b,v],j=a)=>g([b,v],j,0),f=([b,v],j=o)=>g([b,v],j,"A");d.useEffect(()=>{const b=h(s,i),v=h(s,a);i.length&&b!==v&&c(b)},[s,a,i,l]);const m=(b,v)=>{We.play(),r(([j,w])=>{let S=j,y=w;if(b==="y")y=w+v;else{if(a[w]===void 0)debugger;const C=a[w].length-1;S=Math.min(j,C)+v,S<0?(y=(a.length+w-1)%a.length,S=a[y].length-1):S>C&&(y=w+1,S=0)}return[S%n,(a.length+y)%a.length]})},p=h(s),x=f(s);return Je([p,x,s,m,c,l])},Gs=(e,n=[],s,r,a,o)=>{const i=Ye(),[l,c]=d.useState([!1,null]),g=U(l),[h,f]=l,[m,p,x,E,b,v]=_s(n,o),j=x[0]===0,w=()=>{Ut.play(),s()},[S,y]=d.useState(!1),C=U(a.search);d.useLayoutEffect(()=>{if(C&&!a.search){y(!0);const P=setTimeout(()=>y(!1),2e3);return()=>{clearTimeout(P),y(!1)}}},[a.search]);const z=()=>{!S&&!a.search&&(qt.play(),i(""))},L=d.useCallback(Ht((P,T)=>{const B=(n.length+T+P)%n.length;b(n[B].songs[0].index),We.play()},700,{trailing:!1}),[n]),k=(P,T)=>{if(!(P!=null&&P.repeat))E("y",T);else{const B=n.findIndex(A=>!!A.songs.find(K=>K.index===m));L(T,B)}},M=(P,T=!1)=>{!T&&P===-1&&j&&!h?c([!0,"left"]):E("x",P)},_=d.useRef([]),q=()=>{const P=Os(r,_.current);b(P)};ue({accept:w,down:P=>k(P,1),up:P=>k(P,-1),left:()=>M(-1),right:()=>M(1),back:z,random:q},e&&!h,[n,x,h,a,S]);const ae=d.useMemo(()=>({"horizontal-vertical":null,accept:null,back:null,shiftR:null,alphanumeric:null,remote:["search"]}),[]);Xe(ae,e);const re=d.useCallback(P=>{c([!1,P])},[c,M,n,x]);return d.useLayoutEffect(()=>{const[P,T]=g;P&&!h&&T===f&&M(f==="right"?1:-1,!0)},[h,f,j,v,...x]),Je([m,p,b,h,re,q])};function Vs(e,n){const{songList:s,groupedSongList:r,setFilters:a,filters:o,isLoading:i,selectedPlaylist:l,setSelectedPlaylist:c,playlists:g}=$s(),h=Ye(),[f,m]=d.useState(!0),p=z=>{Qe(()=>{Ze.flushSync(()=>{m(z)})}),et.play()},[x,E,b,v,j,w]=Gs(f,r,()=>p(!1),s.length,o,n),[S,y]=d.useState(!1);d.useEffect(()=>{if(!S&&s.length){const z=s.findIndex(M=>M.id===e),L=s.findIndex(M=>M.isNew);let k=Z(0,s.length-1);(z>-1||L>-1)&&(k=z),b(k),y(!0)}},[s,b,e]),d.useEffect(()=>{S&&s.length&&s[x]&&h(`game/${encodeURIComponent(s[x].id)}${window.location.search}`,{replace:!0,smooth:!1})},[S,x,s]);const C=s==null?void 0:s[x];return{groupedSongList:r,focusedSong:x,focusedGroup:E,moveToSong:b,setKeyboardControl:p,keyboardControl:f,songPreview:C,songList:s??[],filters:o,setFilters:a,showFilters:v,setShowFilters:j,isLoading:i,randomSong:w,selectedPlaylist:l,setSelectedPlaylist:c,playlists:g}}let ce=0;function pt(){d.useEffect(()=>(document.body.classList.add("blockOverflow"),document.documentElement.classList.add("blockOverflow"),ce++,()=>{ce--,ce===0&&(document.body.classList.remove("blockOverflow"),document.documentElement.classList.remove("blockOverflow"))}),[])}const Hs=1.2,Ae=4;function Us({onSongSelected:e,preselectedSong:n}){const[s]=D(He),r=s?Ae-1:Ae;tt(!1),nt(!0),pt();const[{previewTop:a,previewLeft:o,previewWidth:i,previewHeight:l},c]=d.useState({previewTop:0,previewLeft:0,previewWidth:0,previewHeight:0}),{focusedGroup:g,focusedSong:h,moveToSong:f,groupedSongList:m,keyboardControl:p,songPreview:x,setKeyboardControl:E,setFilters:b,filters:v,setShowFilters:j,showFilters:w,isLoading:S,randomSong:y,selectedPlaylist:C,setSelectedPlaylist:z,playlists:L}=Vs(n,r),k=d.useRef(null),{width:M,handleResize:_}=he(),q=U(g),ae=U(h);d.useEffect(()=>{var K,be,Se;const T=(vt,wt)=>`[data-group-letter="${vt}"] [data-index="${wt}"]`;_();const B=(K=k.current)==null?void 0:K.querySelector(T(q,ae)),A=(be=k.current)==null?void 0:be.querySelector(T(g,h));A&&((!B||B.offsetTop!==A.offsetTop)&&((Se=A.scrollIntoView)==null||Se.call(A,{behavior:"smooth",inline:"center",block:"center"})),c({previewLeft:A.offsetLeft,previewTop:A.offsetTop,previewWidth:A.offsetWidth,previewHeight:A.offsetHeight}))},[M,k,h,g,m]);const re=d.useCallback(()=>E(!1),[E]),P=S||!m||!M;return t.jsxs(Ks,{songsPerRow:r,children:[P?t.jsx(ta,{children:t.jsx(st,{size:"15em",color:"secondary"})}):t.jsxs(t.Fragment,{children:[x&&t.jsx(Ys,{videoId:x.video}),t.jsx(Cn,{setFilters:b,filters:v,onRandom:y,keyboardControl:p}),t.jsxs(Js,{ref:k,active:p,"data-test":"song-list-container",dim:w,children:[t.jsx(Xn,{groupedSongList:m,containerRef:k,selectSong:f}),m.length===0&&t.jsx(Xs,{children:"No songs found"}),x&&t.jsx(Cs,{songPreview:x,onPlay:e,keyboardControl:!p,onExitKeyboardControl:()=>E(!0),top:a,left:o,width:i,height:l,focusEffect:!w}),m.map(T=>d.createElement(Ws,{...w||!p?{"data-unfocusable":!0}:{},key:T.letter,"data-group-letter":T.letter,highlight:T.letter==="New"},t.jsx(xt,{children:T.letter}),t.jsx(Qs,{children:T.songs.map(({song:B,index:A})=>t.jsx(ea,{song:B,handleClick:h===A?re:f,focused:!w&&p&&A===h,index:A,"data-index":A,"data-focused":!w&&p&&A===h,"data-test":`song-${B.id}${T.isNew?"-new-group":""}`},B.id))}))),t.jsxs(qs,{children:["Missing a song? Try ",t.jsx("a",{href:"convert",children:"adding one"})," yourself!"]})]})]}),t.jsx(Fn,{selectedPlaylist:C,setSelectedPlaylist:z,playlists:L,active:w,closePlaylist:j})]})}const qs=u("span",{target:"ef4zhl29"})(N,";text-align:center;font-size:5rem;margin-top:10rem;"),Ks=u("div",{target:"ef4zhl28"})("display:flex;flex-direction:row;max-height:100vh;--song-list-gap:3.5rem;--song-item-width:",e=>`calc(${100/e.songsPerRow}% - ((${e.songsPerRow-1} / ${e.songsPerRow}) * var(--song-list-gap)))`,";--song-item-ratio:calc(16 / 9 * (4 / ",e=>e.songsPerRow,"));"),Ys=u(Pn,{target:"ef4zhl27"})({name:"ybgcp",styles:"position:fixed;inset:0;width:100%;height:100%;filter:blur(7px) grayscale(90%);opacity:0.25;object-fit:cover"}),Ws=u("div",{target:"ef4zhl26"})("padding:0 4.5rem 0 11rem;",e=>e.highlight&&H("background:rgba(0, 0, 0, 0.5);padding-bottom:3rem;border-bottom:0.2rem solid black;",xt,"{animation:new-song-group-header 600ms ease-in-out infinite both;background:#ffffff;@keyframes new-song-group-header{0%,100%{transform:scale(1);}50%{transform:scale(1.1);}}}",""),";"),Xs=u("div",{target:"ef4zhl25"})(N,";display:flex;align-items:center;justify-content:center;flex:1;font-size:10rem;"),xt=u("div",{target:"ef4zhl24"})(N,";display:inline-block;padding:0.5rem 1rem;margin-bottom:2rem;font-size:3.5rem;z-index:1;color:",F.colors.text.active,";background:rgba(0, 0, 0, 0.7);"),Js=u("div",{target:"ef4zhl23"})("position:relative;flex:1 1 auto;display:flex;flex-direction:column;gap:var(--song-list-gap);padding:10rem 0;overflow-y:auto;overflow-x:clip;box-sizing:border-box;min-height:100vh;max-height:100vh;::-webkit-scrollbar{display:none;}transition:opacity 500ms;opacity:",e=>e.dim?.5:1,";"),Qs=u("div",{target:"ef4zhl22"})({name:"bviq7b",styles:"display:flex;flex-direction:row;flex-wrap:wrap;gap:var(--song-list-gap)"});var Zs={name:"1jwmbuq",styles:"transition:300ms"};const ea=d.memo(u(lt,{target:"ef4zhl21"})("cursor:pointer;flex-basis:var(--song-item-width);aspect-ratio:var(--song-item-ratio);",e=>e.theme.graphicSetting==="high"&&Zs," transform:scale(",e=>e.focused?Hs:1,");",e=>e.focused&&"z-index: 2;"," ",e=>e.focused&&Kt," content-visibility:auto;contain-intrinsic-size:calc(var(--song-item-width) * (1 / var(--song-item-ratio)));")),ta=u("div",{target:"ef4zhl20"})({name:"101j4br",styles:"display:flex;align-items:center;justify-content:center;height:100vh"});function na(e){const[n,s]=D(Ke),[r,a]=d.useState(n===null),o=()=>{s(n??[]),a(!1)};return r?t.jsx(Yt,{onClose:o,closeText:"Continue to Song Selection"}):t.jsx(Us,{...e})}function bt(){const[e]=D(Wt);d.useEffect(()=>{try{e&&document.body.requestFullscreen().catch(console.info)}catch{}},[])}const sa="/assets/459342__papaninkasettratat__cinematic-music-short-RLBkkUq3.mp3",V=e=>new Promise(n=>setTimeout(n,e)),le=15;function aa({onFinish:e}){const n=d.useRef(null),[s,r]=d.useState(!1),[a,o]=d.useState([]);te(I.readinessConfirmed,c=>{o(g=>[...g,c])});const i=ge([I.inputListChanged,I.readinessConfirmed],()=>$.getPlayers().map((c,g)=>[c.input.deviceId,c.getName(),c]));d.useEffect(()=>{(async()=>{var m,p,x;let c=!1;const g=$.requestReadiness().then(()=>{c=!0,r(!0)}),h=V(1500),f=V(le*1e3);await V(250),c||await((m=n==null?void 0:n.current)==null?void 0:m.play()),await Promise.race([Promise.all([g,h]),f]),(p=n==null?void 0:n.current)!=null&&p.paused||Xt.play(),await V(500),(x=n==null?void 0:n.current)==null||x.pause(),await V(1e3),e()})()},[]);const l=i.map(([c,g,h])=>({confirmed:a.includes(c),name:g,player:h}));return t.jsxs(t.Fragment,{children:[t.jsxs(ra,{children:[!s&&t.jsxs("span",{children:["Waiting for all players to click ",t.jsx("strong",{children:'"Ready"'})]}),t.jsx(oa,{children:l.map(({confirmed:c,name:g,player:h},f)=>t.jsxs(ca,{className:"ph-no-capture","data-test":"player-confirm-status","data-name":g,"data-confirmed":c,children:[!s&&t.jsx(la,{children:c?t.jsx(wn,{}):t.jsx(st,{color:"info",size:"1em"})})," ",t.jsx(mt,{player:h})]},f))}),!s&&t.jsxs(ia,{children:["The song will start automatically in"," ",t.jsx("strong",{children:t.jsx(at,{end:0,start:le,duration:le,useEasing:!1})})]})]}),t.jsx("audio",{src:sa,ref:n,hidden:!0,autoPlay:!1,onPlay:c=>{c.currentTarget.volume=.8}})]})}const ra=u("div",{target:"e1sds9f4"})("top:0;left:0;z-index:1000;display:flex;align-items:center;justify-content:center;flex-direction:column;position:absolute;width:100%;height:100%;gap:5rem;font-size:5rem;",N,";"),ia=u("span",{target:"e1sds9f3"})({name:"1umnjfm",styles:"font-size:5rem"}),oa=u("div",{target:"e1sds9f2"})({name:"1uxgijs",styles:"display:flex;flex-direction:column;gap:5rem;width:50rem;view-transition-name:player-mic-check-container"}),ca=u("div",{target:"e1sds9f1"})({name:"174652e",styles:"display:flex;align-items:center;gap:2rem;transform:scale(1.5)"}),la=u("span",{target:"e1sds9f0"})({name:"1l5xwqu",styles:"svg{width:5rem;height:5rem;stroke:black;}"}),da=250,de=(e,n=0,s=1/0)=>e.filter(rt).filter(r=>it([r])>=n).filter(r=>ee([r])<=s).reduce((r,a)=>r+a.notes.reduce((o,i)=>o+i.length,0),0),ua=(e,n)=>{const[s,...r]=e.filter(rt),a=[[s]];return r.forEach(o=>{const i=a.at(-1),l=ee(i);(it([o])-l)*n>da?a.push([o]):i.push(o)}),a},St=(e,n)=>e+n,Fe=e=>{const n=e.map(s=>s.reduce(St,0));return Math.max(...n)-Math.min(...n)},ga=(e,n)=>{const s=mn(e),r=o=>{if(s[o-1].length<2)return;const i=s[o-1].pop();s[o].push(i)},a=o=>{var c;if(((c=s[o+1])==null?void 0:c.length)<2)return;const[i,...l]=s[o+1];s[o].push(i),s[o+1]=l};return n%2===1?r(Math.ceil(n/2)):a(Math.ceil(n/2)),s},ha=e=>e.reduce(St,0);function ma(e){const s=Jt(e);return e.tracks.map(r=>{if(r.sections.length<3)return[];const a=ua(r.sections,s);let o=[],i=[de(a[0])];for(let l=0;l<a.length-2;l++){const c=a[o.flat().length-1]??[],h=de(r.sections,ee(c)??0)/(1+9-o.length),f=de(a[l+1]),m=ha(i);m+f<h?i=[...i,f]:h-m<m+f-h?(o.push(i),i=[f]):(o.push([...i,f]),i=[])}for(let l=0;l<100;l++){const c=Fe(o),g=Qt((o.length-2)*2+2).map(p=>ga(o,p)),h=g.map(Fe),f=Math.min(...h);if(c<=f)break;const m=h.indexOf(f);o=g[m]}return o.map(l=>l.length).reduce((l,c)=>[...l,(l.at(-1)??0)+c],[]).map(l=>ee(a[l-1]))})}const Ie=[t.jsxs(t.Fragment,{children:["You can follow the updates and give feedback on the game through the Facebook Page:"," ",t.jsx("a",{href:"https://www.facebook.com/allkaraoke.party",target:"_blank",rel:"noreferrer",children:t.jsx("strong",{children:"fb.com/AllKaraoke.Party"})})]}),t.jsxs(t.Fragment,{children:["Start typing a name of a song in ",t.jsx("strong",{children:"Song Selection"})," to active Search feature"]}),t.jsxs(t.Fragment,{children:["Narrow down songs through ",t.jsx("strong",{children:"playlists"})," on the right in Song Selection"]}),t.jsxs(t.Fragment,{children:["Select ",t.jsx("strong",{children:"Pass The Mic"})," Game Mode to share the microphones and sing in a team"]}),t.jsxs(t.Fragment,{children:["Your scores and ",t.jsx("strong",{children:"stats are saved"})," in this browser - they will be available for the next party!"]}),t.jsxs(t.Fragment,{children:["You can remove irrelevant songs from the Song Selection in ",t.jsx("strong",{children:"Edit Songs"})," page"]}),t.jsxs(t.Fragment,{children:["If the game feels a bit jaggy with low FPS, check out ",t.jsx("strong",{children:"Settings"})," page"]}),t.jsxs(t.Fragment,{children:["Party is only getting started? Play ",t.jsx("strong",{children:"Jukebox"})," for the music and to see what songs are available"]}),t.jsxs(t.Fragment,{children:["Research shows that ",t.jsx("strong",{children:"duet songs"})," are that bit more fun than simple one-track ones"]}),t.jsxs(t.Fragment,{children:["Want to sing a ",t.jsx("strong",{children:"new song"}),"? Find UltraStar version of it and import it with",t.jsx("br",{}),t.jsx("strong",{children:"Convert Ultrastar .txt"})]}),t.jsxs(t.Fragment,{children:["The ",t.jsx("strong",{children:"white pulse"})," around selected song in Song Selection tries to match song's tempo"]}),t.jsxs(t.Fragment,{children:["Entire game (besides add/edit song) is navigable with ",t.jsx("strong",{children:"Keyboard"})]}),t.jsxs(t.Fragment,{children:["You can hide or show keyboard navigation help with ",t.jsx("kbd",{children:"H"})," key"]}),t.jsxs(t.Fragment,{children:["In Song Selection, hold ",t.jsx("kbd",{children:"↑"})," or ",t.jsx("kbd",{children:"↓"})," to jump to the next letter"]}),t.jsxs(t.Fragment,{children:["Add ",t.jsx("strong",{children:"vibrato"})," to the notes you sing to get additional ",t.jsx("strong",{children:"bonus points"})]}),t.jsxs(t.Fragment,{children:["You can control the game with your phone - click on the"," ",t.jsxs("strong",{children:[t.jsx(Zt,{}),"QR Code Icon"]})," ","on the top right and follow the instructions"]})],fa=({as:e="h4",...n})=>{const s=d.useRef(Z(0,Ie.length-1)),r=e;return t.jsx(r,{...n,children:Ie[s.current]})};function pa({...e}){const[n,s]=d.useState(""),r=d.useRef(null);return d.useEffect(()=>{const a=setTimeout(()=>{s(me.getVideo())},1e3);return()=>{clearTimeout(a)}},[]),d.useEffect(()=>{try{r.current&&(r.current.playbackRate=16)}catch(a){qe(a)}},[n]),t.jsx(xa,{...e,children:t.jsx(ba,{src:n,ref:r,loop:!0,autoPlay:!0,className:"ph-no-capture"})})}const xa=u("div",{target:"egk8upf1"})({name:"1g34f1k",styles:"width:80rem;height:60rem"}),ba=u("video",{target:"egk8upf0"})({name:"idj2s4",styles:"object-fit:cover;width:100%;height:100%"});function Sa(e){return 1-Math.pow(1-e,3)}function ya(e){return Sa(e)}function X({color:e,maxScore:n,score:s}){return t.jsx(va,{style:{border:s===0?0:void 0,width:`${ya(s/n)*24}%`,backgroundColor:e}})}const va=u("div",{target:"epk9dli0"})({name:"1vc31u",styles:`background-image:linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.17) 0%,
    rgba(0, 0, 0, 0.03) 50%,
    rgba(0, 0, 0, 0.18) 51%,
    rgba(0, 0, 0, 0.18) 100%
  );transition:1s;border-radius:0.5rem;height:100%;border:solid 0.1rem black;box-sizing:border-box`});function wa({playerNumber:e,player:n,segment:s}){const[r,a]=n.detailedScore;return t.jsxs(ja,{children:[t.jsx(X,{score:s>-1?r.rap+r.freestyle+r.normal:0,maxScore:a.rap+a.freestyle+a.normal,color:F.colors.players[e].perfect.fill}),t.jsx(X,{score:s>0?r.perfect:0,maxScore:a.perfect,color:F.colors.players[e].stroke}),t.jsx(X,{score:s>1?r.star:0,maxScore:a.star,color:F.colors.players[e].starPerfect.stroke}),t.jsx(X,{score:s>2?r.vibrato:0,maxScore:a.vibrato,color:F.colors.players[e].perfect.stroke}),t.jsx(ka,{children:s<5&&t.jsx(en,{options:{strings:["Regular notes","Perfect notes","Star notes","Vibrato"],pauseFor:1e3,autoStart:!0,delay:15,deleteSpeed:15,cursor:""}})})]})}const ja=u("div",{target:"e10trgut1"})({name:"yex4ym",styles:"position:relative;height:4rem;width:100rem;background:rgba(0, 0, 0, 0.5);display:flex;flex-direction:row;padding:0.5rem;border-radius:1rem;gap:0.5rem"}),ka=u("span",{target:"e10trgut0"})("position:absolute;",N,";font-size:3rem;text-align:right;white-space:nowrap;top:5rem;left:1rem;display:block;");function Ea({playerNumber:e,player:n,highestScore:s,highScores:r,singSetup:a,useColors:o=!0,revealHighScore:i,segment:l}){const[c]=n.detailedScore;let g=0;l>-1&&(g=c.normal+c.rap+c.freestyle),l>0&&(g=g+c.perfect),l>1&&(g=g+c.star),l>2&&(g=g+c.vibrato);const h=f=>r.some(m=>m.singSetupId===a.id&&m.name===f);return t.jsxs(Ca,{children:[t.jsx(yt,{color:o?F.colors.players[e].text:"","data-test":`player-${e}-name`,className:"ph-no-capture",children:n.name}),t.jsx(Pa,{children:t.jsxs(za,{highscore:i&&h(n.name),color:o?F.colors.players[e].text:"",win:i&&g===s,"data-test":`player-${e}-score`,"data-score":g,children:[t.jsx(at,{preserveValue:!0,end:g,formattingFn:fn.format,duration:l<5?1:.5}),t.jsx(Ma,{highscore:i&&h(n.name),children:"High score!"})]})}),t.jsx(wa,{playerNumber:e,player:n,segment:l})]})}const Ca=u("div",{target:"e1hn1x414"})({name:"1kdaoj4",styles:"display:flex;flex-direction:column;align-items:center;gap:1.5rem"}),yt=u(tn,{target:"e1hn1x413"})("padding-left:10rem;padding-right:10rem;font-size:3.5rem;color:",e=>e.color,";"),za=u(yt,{target:"e1hn1x412"})("font-size:",e=>e.win?"8.5rem":"5.5rem",";color:",e=>e.win?F.colors.text.active:"white",";transition:400ms ease-in-out;position:relative;"),Pa=u("div",{target:"e1hn1x411"})({name:"f9rldz",styles:"height:8.5rem"}),Ma=u(nn,{target:"e1hn1x410"})("top:-1.5rem;right:-10rem;font-size:3rem;",e=>e.highscore&&sn,";opacity:",e=>e.highscore?"1":"0",";transition:400ms;");function Ta({onNextStep:e,players:n,highScores:s,singSetup:r}){const[a,o]=d.useState(-1);d.useEffect(()=>{if(a<0)o(0);else if(a<4){const p=setInterval(()=>{o(x=>x+1)},1500);return()=>{clearInterval(p)}}},[a]);const i=a>3,l=()=>{i?e():(rn.capture("animation_skipped"),o(5))};ue({accept:l},!0,[a]);const c=d.useMemo(()=>({accept:"Next"}),[]);Xe(c,!0);const g=r.mode===R.CO_OP,h=g?[{...n[0],name:n.map(p=>p.name).join(", ")}]:n,f=h.map(p=>an(p.detailedScore[0])),m=Math.max(...f);return t.jsxs(t.Fragment,{children:[t.jsx(Aa,{children:h.map((p,x)=>t.jsx(Ea,{playerNumber:p.playerNumber,useColors:!g,revealHighScore:a>3,segment:a,player:p,highScores:s,highestScore:m,singSetup:r},x))}),t.jsx(Fa,{onClick:l,focused:!0,"data-test":i?"highscores-button":"skip-animation-button",children:i?"Next":"Skip"}),me.getPermissionStatus()&&t.jsx(Ia,{})]})}const Aa=u("div",{target:"ez8rfb42"})({name:"nvdiyi",styles:"position:absolute;top:20rem;width:100%;text-align:center;display:flex;flex-direction:column;gap:2rem"}),Fa=u(O,{target:"ez8rfb41"})({name:"dmbiod",styles:"position:absolute;bottom:4rem;right:2rem;width:40rem;font-size:1.9vw"}),Ia=u(pa,{target:"ez8rfb40"})({name:"1c3jvq",styles:"position:absolute;top:calc(50% - 30rem);left:95rem;transform:scale(0.75)"});function Na(){return d.useMemo(()=>JSON.parse(sessionStorage.getItem(Ue))??[],[])}function Ra({score:e,register:n,singSetupId:s,onSave:r,index:a}){const o=d.useRef(null),[i,l]=d.useState(""),c=Na(),g=()=>{i.trim().length&&i.trim()!==e.name&&r(s,e.score,e.name,i)};return t.jsx(ft,{className:"ph-no-capture",options:c,onChange:l,onBlur:g,value:i,label:"",ref:o,...n(`highscore-rename-${a}`,()=>{var h;return(h=o.current)==null?void 0:h.focus()}),placeholder:e.name,"data-test":"input-edit-highscore","data-original-name":e.name})}function La({onNextStep:e,highScores:n,singSetup:s,song:r}){const{register:a}=ne(),o=_n(r);return t.jsxs(t.Fragment,{children:[t.jsx(Ba,{"data-test":"highscores-container",children:n.map((i,l)=>t.jsxs($a,{isCurrentSing:i.singSetupId===s.id,children:[t.jsx(Da,{children:l+1}),t.jsx(Oa,{className:"ph-no-capture",children:i.singSetupId===s.id?t.jsx(Ra,{index:l,score:i,register:a,singSetupId:s.id,onSave:o}):i.name}),t.jsx(_a,{children:t.jsx(pn,{score:i.score})}),t.jsx(Ga,{children:G(i.date).format("MMMM DD, YYYY")})]},l))}),t.jsx(Va,{...a("play-next-song-button",e,void 0,!0),children:"Select song"})]})}const Ba=u("div",{target:"e161j45v6"})({name:"9gtmjg",styles:"position:absolute;top:20rem;width:100%;text-align:center;padding:0 16rem;box-sizing:border-box"}),$a=u("div",{target:"e161j45v5"})("position:relative;",N,";font-size:3.2rem;display:flex;background:",e=>e.isCurrentSing?"rgba(0,0,0,.9)":"rgba(0,0,0,.5)",";margin-bottom:2rem;padding:",e=>e.isCurrentSing?"0 1.5rem":"1rem 3.2rem",";align-items:center;"),Da=u("div",{target:"e161j45v4"})("padding:0 1.6rem;color:",F.colors.text.active,";"),Oa=u("div",{target:"e161j45v3"})({name:"1mbe2e5",styles:"text-align:left;flex:1;padding:1.6rem"}),_a=u("div",{target:"e161j45v2"})({name:"2ycp6t",styles:"padding:0 1rem"}),Ga=u("div",{target:"e161j45v1"})({name:"1gbnj87",styles:"position:absolute;font-size:2rem;bottom:-1rem;right:-1.6rem;background:black;padding:0.5rem"}),Va=u(O,{target:"e161j45v0"})({name:"dmbiod",styles:"position:absolute;bottom:4rem;right:2rem;width:40rem;font-size:1.9vw"});function Ha({song:e,width:n,height:s,onClickSongSelection:r,players:a,highScores:o,singSetup:i}){const[l]=D(on);tt(!0);const[c,g]=d.useState("results");return t.jsxs(cn,{songData:e,width:n,height:s,children:[t.jsxs(Ua,{children:[c==="results"&&t.jsx(Ta,{onNextStep:()=>g("highscores"),players:a,singSetup:i,highScores:o}),c==="highscores"&&t.jsx(La,{onNextStep:r,singSetup:i,highScores:o,song:e}),t.jsx(qa,{$active:!0})]}),l&&t.jsxs(Ka,{children:["Credit to ",t.jsx("a",{href:"https://www.FesliyanStudios.com",children:"https://www.FesliyanStudios.com"})," for the background music."]})]})}const Ua=u("div",{target:"ehc5trj2"})({name:"1quw0ni",styles:"pointer-events:auto"}),qa=u(fa,{shouldForwardProp:e=>!e.startsWith("$"),target:"ehc5trj1"})("transition:300ms;transform:scale(",({$active:e})=>e?1:0,");position:absolute;bottom:20rem;font-size:3.2rem;line-height:1.25;color:white;text-align:center;background:rgba(0, 0, 0, 0.75);width:100%;box-sizing:border-box;padding:2rem 10rem;kbd{padding:0.12rem 0.9rem;border-radius:1rem;border:0.5rem solid rgb(204, 204, 204);border-bottom-color:rgb(150, 150, 150);border-right-color:rgb(150, 150, 150);color:rgb(51, 51, 51);line-height:1.4;display:inline-block;box-shadow:0 0.1rem 0 rgba(0, 0, 0, 0.2),inset 0 0 0 0.2rem #ffffff;background-color:rgb(247, 247, 247);text-shadow:0 0.1rem 0 #fff;font-weight:normal;}"),Ka=u("span",{target:"ehc5trj0"})("position:fixed;bottom:2rem;left:2rem;font-size:1.5rem;",N,";");function Ya(e,n){const s=pe(e);return d.useMemo(()=>s==null?void 0:s.scores.filter(({setup:a})=>a.mode===n.mode&&a.tolerance===n.tolerance).map(a=>a.scores.map(o=>({...o,date:a.date,singSetupId:a.setup.id}))).flat().sort((a,o)=>o.score-a.score).slice(0,5),[s,n])??[]}function Wa({song:e,width:n,height:s,onClickSongSelection:r,singSetup:a}){const o=Ya(e,a),i=d.useMemo(()=>$.getPlayers().map(l=>({name:l.getName(),playerNumber:l.number,detailedScore:J.getPlayerDetailedScore(l.number)})),[]);return t.jsx(Ha,{singSetup:a,song:e,width:n,height:s,onClickSongSelection:r,players:i,highScores:o})}function Xa({songPreview:e,singSetup:n,returnToSongSelection:s,restartSong:r}){bt(),pt();const a=d.useRef(null),o=ln(e.id),{width:i,height:l}=he(),[c,g]=d.useState(!1),[h,f]=d.useState(!0),[m,p]=d.useState(Q.UNSTARTED),x=d.useMemo(()=>o.data?n.mode!==R.PASS_THE_MIC?o.data.tracks.map(()=>[]):ma(o.data):[],[o.data,n]),[E,b]=d.useState(!1);return nt(!E),d.useEffect(()=>{h&&o.data&&(E||m!==Q.UNSTARTED)&&f(!1)},[o.data,E,m,h]),c&&o.data?t.jsx(Wa,{width:i,height:l,song:o.data,onClickSongSelection:s,singSetup:n}):t.jsxs(Ja,{children:[t.jsxs(Qa,{visible:h,children:[t.jsx(er,{video:e.video,width:i,height:l}),t.jsx(tr,{children:e.artist}),t.jsx(nr,{children:e.title}),t.jsx(aa,{onFinish:()=>{var v;b(!0),(v=a.current)==null||v.play()}})]}),o.data&&t.jsx(xn,{ref:a,onStatusChange:p,playerChanges:x,players:n.players,song:o.data,width:i,height:l,autoplay:!1,onSongEnd:()=>{var j;const v=((j=J.getSingSetup())==null?void 0:j.mode)===R.CO_OP?[{name:$.getPlayers().map(w=>w.getName()).join(", "),score:J.getPlayerScore(0)}]:$.getPlayers().map(w=>({name:w.getName(),score:J.getPlayerScore(w.number)}));I.songEnded.dispatch(o.data,n,v),g(!0)},singSetup:n,restartSong:r})]})}const Ja=u("div",{target:"e1pnu1v94"})({name:"bjn8wh",styles:"position:relative"}),Qa=u("div",{target:"e1pnu1v93"})("position:fixed;top:0;left:0;z-index:10;pointer-events:none;background-color:black;view-transition-name:song-preview;opacity:",e=>e.visible?1:0,";transition:500ms;"),Za=u("div",{target:"e1pnu1v92"})({name:"oux8x1",styles:"background-size:cover;background-position:center center;filter:blur(10px)"}),er=e=>t.jsx(Za,{style:{backgroundImage:`url('https://i3.ytimg.com/vi/${e.video}/hqdefault.jpg')`,width:`${e.width}px`,height:`${e.height}px`}}),tr=u(xe,{target:"e1pnu1v91"})({name:"oyknw4",styles:"view-transition-name:song-preview-artist;position:absolute;top:10rem;left:10rem;font-size:7rem"}),nr=u(se,{target:"e1pnu1v90"})({name:"1l9juvo",styles:"view-transition-name:song-preview-title;position:absolute;font-size:8rem;top:19rem;left:10rem"});function rr(e){const[n,s]=d.useState(null),[r,a]=d.useState(e.songId??null),[o,i]=d.useState(0),l=c=>{document.getElementById("preview-video-container").style.viewTransitionName="song-preview-video",Qe(()=>{document.getElementById("preview-video-container").style.viewTransitionName="",Ze.flushSync(()=>{s(c)})}),et.play()};return bt(),t.jsx(t.Fragment,{children:n?t.jsx(Xa,{restartSong:()=>{me.restartRecord(),i(c=>c+1)},songPreview:n.song,singSetup:n,returnToSongSelection:()=>{a(n.song.id),s(null)}},o):t.jsx(na,{onSongSelected:l,preselectedSong:r})})}export{rr as default};
//# sourceMappingURL=Game-uvw4yB_-.js.map
