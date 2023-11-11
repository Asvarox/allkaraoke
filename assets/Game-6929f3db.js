import{V as pt,W as xt,X as bt,c as St,j as t,M as yt,r as d,Y as Pe,Z as D,$ as Te,a0 as Ae,N as G,a1 as X,a2 as ze,a3 as vt,a4 as Ie,a5 as de,a6 as jt,a7 as Ne,a8 as Fe,a9 as wt,aa as kt,ab as Le,ac as Re,ad as _e,ae as Z,af as Et,U as u,ag as L,ah as H,ai as Y,aj as De,ak as Oe,al as ue,E as Ct,F as Mt,am as be,an as Be,ao as ee,ap as I,aq as Ge,ar as Pt,x as $,as as _,at as qe,au as F,av as Tt,aw as At,ax as zt,ay as $e,az as Ve,aA as ge,aB as It,aC as Nt,aD as R,aE as Ft,aF as Lt,aG as He,aH as Ke,aI as Rt,aJ as _t,aK as Ue,aL as he,aM as Dt,aN as Ot,aO as J,aP as Bt,aQ as Gt,L as Ye,K as We,aR as Xe,aS as qt,aT as $t,aU as Je,aV as Vt,aW as Q,aX as Ht,aY as Qe,aZ as Ze,a_ as Kt,a$ as me,b0 as et,b1 as Ut,b2 as Yt,b3 as Wt,b4 as Xt,b5 as W,b6 as Jt}from"./index-5c8e3516.js";import{u as Qt,a as V,b as Zt,P as en,S as tn,c as nn,f as sn,d as an,e as rn}from"./Player-e03cfda1.js";function on(e){var n=pt(e),s=n%1;return n===n?s?n-s:n:0}var ln=Math.ceil,cn=Math.max;function Se(e,n,s){(s?xt(e,n,s):n===void 0)?n=1:n=cn(on(n),0);var r=e==null?0:e.length;if(!r||n<1)return[];for(var a=0,l=0,o=Array(ln(r/n));a<r;)o[l++]=bt(e,a,a+=n);return o}const dn=St(t.jsx("path",{d:"M16.59 7.58 10 14.17l-3.59-3.58L5 12l5 5 8-8zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"}),"CheckCircleOutline"),ae={language:(e,n)=>n===""?e:e.filter(s=>(Array.isArray(s.language)?s.language:[s.language]).includes(n)),excludeLanguages:(e,n=[])=>n.length===0?e:e.filter(s=>!(Array.isArray(s.language)?s.language:[s.language]).every(a=>n.includes(a))),search:(e,n)=>{const s=Ae(n);return s.length?e.filter(r=>r.search.includes(s)):e},duet:(e,n)=>n===null?e:e.filter(s=>n?s.tracksCount>1:s.tracksCount===1),yearBefore:(e,n)=>n?e.filter(s=>Number(s.year)<n):e,yearAfter:(e,n)=>n?e.filter(s=>Number(s.year)>=n):e,updatedAfter:(e,n)=>{if(!n)return e;const s=G(n);return e.filter(r=>r.lastUpdate&&G(r.lastUpdate).isAfter(s))}},ye=(e,n)=>Ae((n==null?void 0:n.search)??"").length?ae.search(e,n.search):Object.entries(n).filter(s=>s[0]in ae).reduce((s,[r,a])=>ae[r](s,a),e),un=e=>d.useMemo(()=>Qt(["",...e.map(n=>n.language??"Unknown")].flat()),[e]),gn=e=>{const n=un(e),[s]=D(Te),[r,a]=d.useState({excludeLanguages:s??[]}),l=d.useDeferredValue(r),o=d.useMemo(()=>ye(e,{excludeLanguages:s??[]}),[e,s]),c=d.useMemo(()=>ye(e,{...l,excludeLanguages:s??[]}),[e,l,s]),i={language:{current:r.language??"",available:n},status:{allSongs:e.length,visible:c.length}};return{filters:r,filteredList:c,filtersData:i,prefilteredList:o,setFilters:a}};function hn(){const e=yt(),{filters:n,filtersData:s,filteredList:r,prefilteredList:a,setFilters:l}=gn(e.data),o=d.useMemo(()=>{if(r.length===0)return[];const c=[];if(!n.search){const i=r.filter(g=>g.isNew);i.length&&c.push({letter:"New",isNew:!0,songs:i.map(g=>({song:g,index:r.indexOf(g)}))})}return r.forEach((i,g)=>{try{const h=isFinite(+i.artist[0])?"0-9":i.artist[0].toUpperCase();let m=c.find(f=>f.letter===h);m||(m={letter:h,songs:[]},c.push(m)),m.songs.push({index:g,song:i})}catch(h){console.error(h),Pe(h)}}),c},[r,n.search]);return{prefilteredList:a,groupedSongList:o,songList:r,filtersData:s,filters:n,setFilters:l,isLoading:e.isLoading}}const mn=30;function fn(e,n,s=mn){let r;if(n.length<e){const a=[...Array(e).keys()].filter(l=>!n.includes(l));r=a[X(0,a.length-1)]}else r=X(0,e-1),n.length=0;return n.length>=s&&n.shift(),n.push(r),r}const pn=(e=[],n)=>{var k;const[s,r]=d.useState([0,0]),a=d.useMemo(()=>e.map(({songs:b})=>Se(b.map(y=>y.index),n)).flat(),[e]),l=d.useMemo(()=>e.map(({songs:b,letter:y})=>Se(b.map(()=>y),n)).flat(),[e]),o=V(a??[]),c=s[0]===((k=a[s[1]])==null?void 0:k.length)-1,i=d.useCallback(b=>{var v;const y=a.findIndex(j=>j.includes(b)),w=(v=a[y])==null?void 0:v.indexOf(b);w>=0&&y>=0?r([w??0,y??0]):r([0,0])},[a]),g=([b,y],w,v)=>{var x;if(e.length===0)return v;const j=w[y];return(j==null?void 0:j[b])??(j==null?void 0:j.at(-1))??((x=w==null?void 0:w[0])==null?void 0:x[0])??v},h=([b,y],w=a)=>g([b,y],w,0),m=([b,y],w=l)=>g([b,y],w,"A");d.useEffect(()=>{const b=h(s,o),y=h(s,a);o.length&&b!==y&&i(b)},[s,a,o,c]);const f=(b,y)=>{Ie.play(),r(([w,v])=>{let j=w,x=v;if(b==="y")x=v+y;else{if(a[v]===void 0)debugger;const M=a[v].length-1;j=Math.min(w,M)+y,j<0?(x=(a.length+v-1)%a.length,j=a[x].length-1):j>M&&(x=v+1,j=0)}return[j%n,(a.length+x)%a.length]})},p=h(s),S=m(s);return Fe([p,S,s,f,i,c])},xn=(e,n=[],s,r,a,l)=>{const o=ze(),[c,i]=d.useState([!1,null]),g=V(c),[h,m]=c,[f,p,S,k,b,y]=pn(n,l),w=S[0]===0,v=()=>{wt.play(),s()},[j,x]=d.useState(!1),M=V(a.search);d.useLayoutEffect(()=>{if(M&&!a.search){x(!0);const E=setTimeout(()=>x(!1),2e3);return()=>{clearTimeout(E),x(!1)}}},[a.search]);const P=()=>{!j&&!a.search&&(kt.play(),o("/"))},z=d.useCallback(vt((E,C)=>{const B=(n.length+C+E)%n.length;b(n[B].songs[0].index),Ie.play()},700,{trailing:!1}),[n]),T=(E,C)=>{if(!(E!=null&&E.repeat))k("y",C);else{const B=n.findIndex(K=>!!K.songs.find(U=>U.index===f));z(C,B)}},N=(E,C=!1)=>{!C&&E===1&&y&&!h?i([!0,"right"]):!C&&E===-1&&w&&!h?i([!0,"left"]):k("x",E)},O=d.useRef([]),ne=()=>{const E=fn(r,O.current);b(E)};de({accept:v,down:E=>T(E,1),up:E=>T(E,-1),left:()=>N(-1),right:()=>N(1),back:P,random:()=>{ne(),jt.capture("selectRandom")}},e&&!h,[n,S,h,a,j]);const se=d.useMemo(()=>({"horizontal-vertical":null,accept:null,back:null,shiftR:null,remote:["search"]}),[]);Ne(se,e);const A=d.useCallback(E=>{i([!1,E])},[i,N,n,S]);return d.useLayoutEffect(()=>{const[E,C]=g;E&&!h&&C===m&&N(m==="right"?1:-1,!0)},[h,m,w,y,...S]),Fe([f,p,b,h,A])};function bn(e,n){const{songList:s,prefilteredList:r,groupedSongList:a,filtersData:l,setFilters:o,filters:c,isLoading:i}=hn(),g=ze(),[h,m]=d.useState(!0),f=x=>{Le(()=>{Re.flushSync(()=>{m(x)})}),_e.play()},[p,S,k,b,y]=xn(h,a,()=>f(!1),s.length,c,n),[w,v]=d.useState(!1);d.useEffect(()=>{if(!w&&s.length){const x=s.findIndex(z=>z.id===e),M=s.findIndex(z=>z.isNew);let P=X(0,s.length-1);(x>-1||M>-1)&&(P=x),k(P),v(!0)}},[s,k,e]),d.useEffect(()=>{w&&s.length&&s[p]&&g(`/game/${encodeURIComponent(s[p].id)}`,{replace:!0,smooth:!1})},[w,p,s]);const j=s==null?void 0:s[p];return{prefilteredList:r,groupedSongList:a,focusedSong:p,focusedGroup:S,moveToSong:k,setKeyboardControl:f,keyboardControl:h,songPreview:j,songList:s??[],filtersData:l,filters:c,setFilters:o,showFilters:b,setShowFilters:y,isLoading:i}}const Sn=e=>{const n=Et(e);return d.useMemo(()=>[{name:"All",filters:{}},{name:n[0].name,filters:{language:n[0].name}},n[1]?{name:n[1].name,filters:{language:n[1].name}}:null,{name:"Classics",filters:{yearBefore:1995}},{name:"Modern",filters:{yearAfter:1995}},{name:"Duets",filters:{duet:!0}},{name:"New",filters:{updatedAfter:G().subtract(31,"days").toISOString()}}].filter(s=>s!==null),[n])};function yn({setFilters:e,active:n,closePlaylist:s,prefilteredList:r}){const a=Sn(r),{register:l,focused:o,focusElement:c}=Z({enabled:n,additionalHelp:{vertical:void 0,"horizontal-vertical":null}});return d.useEffect(()=>{if(o){const i=a.find(g=>`playlist-${g.name}`===o);i&&e(i.filters)}},[o,a]),de({left:()=>s("left"),right:()=>s("right")},n),t.jsx(vn,{"data-test":"song-list-playlists",children:a.map(i=>t.jsx(jn,{...l(`playlist-${i.name}`,()=>c(`playlist-${i.name}`)),...n?{}:{focused:!1,active:`playlist-${i.name}`===o},children:i.name},i.name))})}const vn=u("div",{target:"e1amx3cg1"})("background:rgba(0, 0, 0, 0.7);width:100vh;transform-origin:top right;transform:rotate(-90deg);position:absolute;left:-100vh;top:0;font-size:3.6rem;box-sizing:border-box;display:flex;flex-direction:row-reverse;h2{",L,";margin:0;}"),jn=u(H,{target:"e1amx3cg0"})("font-size:3rem;flex:1;padding:1.5rem;",e=>e.active===!1&&"opacity: .5;",";");function wn({onSongFiltered:e,filters:n}){const s=d.useRef(null),[r,a]=d.useState(!1);Y("down",()=>{var i;(i=s.current)==null||i.blur()},{enabled:r,enableOnTags:["INPUT"]});const o=i=>{var h,m;const g=((h=n.search)==null?void 0:h.length)??0;g>1?e({...n,search:" "}):g===0&&i&&e({...n,search:i}),(m=s.current)==null||m.focus()};Y(De,i=>{o(i.key)},{enabled:!r}),Y("Backspace",i=>{o()},{enabled:!r});const c=i=>{e({...n,search:i.trim()})};return d.useEffect(()=>{var i;(i=s.current)==null||i.focus()},[s]),t.jsx(kn,{"data-test":"song-list-search",children:t.jsx(En,{large:!0,children:t.jsx("form",{"data-test":"filters-search-form",onSubmit:i=>{var g;i.preventDefault(),(g=s.current)==null||g.blur()},children:t.jsx(Oe,{onFocus:()=>a(!0),onBlur:()=>a(!1),focused:r,label:"Search",value:n.search??"",onChange:c,ref:s,"data-test":"filters-search"})})})})}const kn=u("div",{target:"e1vw0lol1"})({name:"t46wvs",styles:"background:rgba(0, 0, 0, 0.7);padding:2rem;font-size:3rem;box-sizing:border-box;display:flex;flex-direction:row;gap:2rem;position:fixed;z-index:200;top:4.5rem;left:30rem;right:30rem"}),En=u("div",{target:"e1vw0lol0"})("flex:",e=>e.large?1.5:1,";"),Cn=1e4;function Mn({keyboardControl:e}){const[n,s]=d.useState(!1);d.useEffect(()=>{if(!e)s(!1);else{const a=setTimeout(()=>s(!0),Cn);return()=>clearTimeout(a)}},[e]);const[r]=D(ue);return r?null:t.jsxs(Pn,{visible:n,children:["Can't decide? Click ",t.jsx(ve,{children:"Shift"})," + ",t.jsx(ve,{children:"R"})," to pick random song"]})}const Pn=u("div",{target:"e5qasxu1"})("@keyframes shake{2.5%,22.5%{transform:translate3d(-0.1rem, 0, 0);}5%,20%{transform:translate3d(0.2rem, 0, 0);}7.5%,12.5%,17.5%{transform:translate3d(-0.4rem, 0, 0);}10%,15%{transform:translate3d(0.4rem, 0, 0);}}animation:shake 5s both infinite;",L,";pointer-events:none;position:fixed;transform:scale(",e=>e.visible?1:0,");opacity:",e=>e.visible?1:0,";text-align:center;font-size:4.8rem;text-shadow:0 0 3.5rem black,0 0 3.5rem black,0 0 3.5rem black,0 0 3.5rem black,0 0 3.5rem black,0 0 3.5rem black,0 0 3.5rem black;width:100%;z-index:4;padding:2.5rem;transition:ease 500ms;"),ve=u("kbd",{target:"e5qasxu0"})("margin:0.1rem;padding:0.2rem 2rem;border-radius:1.5rem;border:0.6rem solid rgb(204, 204, 204);border-bottom-color:rgb(150, 150, 150);border-right-color:rgb(150, 150, 150);line-height:1.4;display:inline-block;background-color:rgb(247, 247, 247);text-shadow:0 0.5rem 0 #fff;opacity:",e=>e.disabled?.25:1,";");var fe={},Tn=Mt;Object.defineProperty(fe,"__esModule",{value:!0});var tt=fe.default=void 0,An=Tn(Ct()),re=t,zn=(0,An.default)([(0,re.jsx)("path",{fillRule:"evenodd",d:"M16.67 13.13C18.04 14.06 19 15.32 19 17v3h4v-3c0-2.18-3.57-3.47-6.33-3.87z"},"0"),(0,re.jsx)("circle",{cx:"9",cy:"8",r:"4",fillRule:"evenodd"},"1"),(0,re.jsx)("path",{fillRule:"evenodd",d:"M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4c-.47 0-.91.1-1.33.24C14.5 5.27 15 6.58 15 8s-.5 2.73-1.33 3.76c.42.14.86.24 1.33.24zm-6 1c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"},"2")],"PeopleAlt");tt=fe.default=zn;const In=JSON.parse(`{
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
}`),Nn=["US","GB"];function Fn({song:e,...n}){const s=Array.isArray(e.language)?e.language[0]:e.language,r=d.useMemo(()=>{var a;return e.artistOrigin?((a=In[e.artistOrigin.toLowerCase()])==null?void 0:a.includes(s))??!1:!1},[e.artistOrigin,s]);return t.jsx(t.Fragment,{children:r&&!Nn.includes(e.artistOrigin)?t.jsx(be,{isocode:e.artistOrigin,...n}):e.language!=="English"?t.jsx(be,{language:e.language,...n}):null})}const pe=e=>{const[n,s]=d.useState(null),r=Be(e),a=async()=>{s(await Ge(e))};return d.useEffect(()=>{a()},[r]),ee(I.songStatStored,a),n},Ln=e=>async(n,s,r,a)=>{const l=Be(e),o=await Ge(e),c=o.scores.map(g=>{if(g.setup.id!==n)return g;const h=g.scores.map(m=>m.name!==r||m.score!==s?m:{name:a.trim(),score:s});return{...g,scores:h}}),i={...o,scores:c};await Pt(e,i),I.songScoreUpdated.dispatch(l,i,a.trim())},nt=({song:e,focused:n,video:s,children:r,index:a,handleClick:l,background:o=!0,expanded:c=!1,...i})=>{const g=d.useCallback(()=>l?l(a):void 0,[l,a]);return t.jsxs(On,{...i,onClick:l?g:void 0,children:[o&&t.jsx(Bn,{style:{backgroundImage:`url('https://i3.ytimg.com/vi/${e.video}/hqdefault.jpg')`},focused:n,expanded:c}),t.jsxs(Dn,{expanded:c,children:[!c&&t.jsx(Gn,{song:e}),e.tracksCount>1&&!c&&t.jsxs(qn,{"data-test":"multitrack-indicator",children:[t.jsx(tt,{}),"  Duet"]}),t.jsx(xe,{expanded:c,children:e.artist}),t.jsx(te,{expanded:c,children:e.title}),t.jsxs(st,{expanded:c,children:[c&&t.jsxs(t.Fragment,{children:[e.author&&t.jsxs(rt,{expanded:c,children:["by ",e.authorUrl?t.jsx("a",{href:e.authorUrl,target:"_blank",rel:"noreferrer",children:e.author}):e.author]}),t.jsx($n,{song:e})]}),!c&&t.jsx(Rn,{song:e})]})]}),r,s]})},Rn=u(Fn,{target:"eqdpxtq10"})({name:"1w2zyc9",styles:"height:2.75rem;object-fit:cover;border-top-right-radius:1rem;position:absolute;z-index:-1;left:0rem;bottom:0rem;opacity:0.95"}),st=u("div",{target:"eqdpxtq9"})({name:"1dgv8bf",styles:"display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start"});var _n={name:"1u0tp1t",styles:"align-items:flex-start;justify-content:flex-start"};const Dn=u("div",{target:"eqdpxtq8"})("width:100%;height:100%;display:flex;align-items:flex-end;justify-content:flex-end;z-index:1;box-sizing:border-box;flex-direction:column;",e=>e.expanded&&_n,";"),On=u("div",{target:"eqdpxtq7"})({name:"1s4n252",styles:"font-size:4.5rem;display:flex;align-items:flex-end;justify-content:flex-end;flex-direction:column;box-sizing:border-box;position:relative;padding:0.5rem;border:0.1rem black solid;border-radius:1rem"}),Bn=u("div",{target:"eqdpxtq6"})("position:absolute;z-index:-1;inset:0;",e=>e.theme.graphicSetting==="high"?$("background-size:",e.focused?100:110,"%;",e.focused?"":"filter: grayscale(90%);"," ",e.expanded?"filter: blur(10px);":""," transition:300ms;opacity:",e.focused?1:.8,";",""):$("background-size:100%;opacity:",e.focused?1:.6,";","")," background-position:center center;"),at=u("span",{target:"eqdpxtq5"})("background:rgba(0, 0, 0, 0.7);width:auto;display:inline-block;padding:0.5rem;",L,";text-align:right;font-size:",({expanded:e})=>e?"6rem":"2.7rem",";"),xe=u(at,{target:"eqdpxtq4"})("color:",_.colors.text.active,";"),te=u(at,{target:"eqdpxtq3"})("margin-top:",e=>e.expanded?"1.5rem":"0.5rem",";color:white;"),rt=u(te,{target:"eqdpxtq2"})({name:"5twmqz",styles:"font-size:3rem;margin-top:3rem"}),Gn=({song:e})=>{var a,l;const n=pe(e),s=((l=(a=n==null?void 0:n.scores)==null?void 0:a.at(-1))==null?void 0:l.date)??!1,r=s&&G(s).isAfter(G().subtract(1,"days"));return n!=null&&n.plays?t.jsx(it,{"data-test":"song-stat-indicator",children:r?"Played today":n.plays}):null},it=u("div",{target:"eqdpxtq1"})({name:"ohpsts",styles:"position:absolute;top:0.5rem;right:0.5rem;padding:0 1rem;height:2.75rem;min-width:2.75rem;box-sizing:border-box;border-radius:5rem;color:white;background:rgba(0, 0, 0, 0.75);font-size:1.4rem;display:flex;align-items:center;justify-content:center;text-transform:uppercase"}),qn=u(it,{target:"eqdpxtq0"})({name:"sq8m9a",styles:"left:0.5rem;right:auto;svg{width:1.75rem;height:1.75rem;}"}),$n=({song:e})=>{const n=pe(e);return t.jsx(rt,{children:n!=null&&n.plays?`Played ${n.plays} time${n.plays>1?"s":""}`:"Never played yet"})},je={[F.DUEL]:"Duel",[F.PASS_THE_MIC]:"Pass The Mic",[F.CO_OP]:"Cooperation"},ie=["Hard","Medium","Easy"],Vn=qe("song_settings-game_mode-v3"),Hn=qe("song_settings-tolerance-v2");function Kn({songPreview:e,onNextStep:n,keyboardControl:s,onExitKeyboardControl:r}){const[a,l]=Vn(null),o=a??(e.tracksCount>1?F.CO_OP:F.DUEL),[c,i]=Hn(1),g=()=>{const p={id:At(),players:[],mode:o,tolerance:c+1};n(p)},h=()=>{l(zt(Object.values(F),o))},m=()=>i(p=>$e(ie,p,-1)),{register:f}=Z({enabled:s,onBackspace:r});return t.jsxs(t.Fragment,{children:[t.jsx(we,{...f("difficulty-setting",m,"Change difficulty"),label:"Difficulty",value:ie[c],"data-test-value":ie[c]}),t.jsx(we,{...f("game-mode-setting",h,"Change mode"),label:"Mode",value:je[o],"data-test-value":je[o]}),t.jsxs(Yn,{children:[o===F.DUEL&&"Face off against each other - person that earns more points wins.",o===F.CO_OP&&"Join forces and sing together - your points will be added up to a single pool.",o===F.PASS_THE_MIC&&t.jsxs(t.Fragment,{children:["For more than 2 players - split into groups and pass the microphone within the group when prompted with"," ",t.jsx(Tt,{})," symbol."]})]}),t.jsx(Un,{...f("next-step-button",g,void 0,!0),children:"Next ➤"})]})}const Un=u(H,{target:"e1xayinb2"})({name:"sr8dp2",styles:"padding:0.5rem 9rem;font-size:4.3rem;width:50rem"}),Yn=u("h3",{target:"e1xayinb1"})({name:"rdh6te",styles:"max-width:50rem;margin:-1rem 0 1rem!important;padding:1.5rem;background:rgba(0, 0, 0, 0.7);box-sizing:border-box"}),we=u(Ve,{target:"e1xayinb0"})({name:"1tcj19k",styles:"font-size:4.3rem;padding:1rem;min-width:50rem;box-sizing:border-box"});function Wn(){const n=ge(I.playerInputChanged,()=>R.getInputs()).some(o=>o.source==="Microphone"),s=d.useRef([]),r=d.useCallback(o=>{s.current.push(o)},[]);It(0,50,r);const[a,l]=d.useState(!1);return d.useEffect(()=>{const o=setInterval(()=>{const c=s.current.filter(([,f])=>f===0),i=s.current.filter(([,f])=>f>0),g=c.reduce((f,[p])=>f+p,0)/(c.length+1),h=i.reduce((f,[p])=>f+p,0)/(i.length+1),m=i.length>c.length*.1&&h>.01&&g>.01&&h-g<g/2;l(m),s.current.length=0},a?5e3:2500);return()=>clearInterval(o)},[a]),t.jsxs(Xn,{visible:a,children:[t.jsxs("h2",{children:[t.jsx("strong",{children:t.jsx(Nt,{})})," ","Noise detected"]}),t.jsx("hr",{}),t.jsxs("h4",{children:["This might make singing inaccurate. Make sure your microphone doesn't pick up the music."," ",n&&t.jsxs(t.Fragment,{children:["Alternatively, use your ",t.jsx("strong",{children:"smartphone as a microphone"})," instead."]})]})]})}const Xn=u("div",{target:"elv6o00"})("opacity:",e=>e.visible?1:0,";transition:300ms;background:rgba(0, 0, 0, 0.75);padding:1rem;max-width:50rem;position:relative;top:-1rem;left:-0.5rem;");function ot({player:e}){const n=Zt(e.number);return t.jsxs(Jn,{"data-test":`indicator-player-${e.number}`,children:[t.jsx(Ft,{playerNumber:e.number}),t.jsx(en,{status:n}),n!=="unavailable"&&t.jsx(Lt,{playerNumber:e.number}),t.jsx(Qn,{className:"ph-no-capture",children:e.getName()})]},e.number)}const Jn=u("div",{target:"ey5ojlp1"})({name:"1gmoqr1",styles:"position:relative;border:0.1rem solid white;padding:1rem 3rem;background:black;width:80%;text-align:center;gap:1.25rem;font-size:2.3rem;color:white;-webkit-text-stroke:1px black"}),Qn=u("span",{target:"ey5ojlp0"})({name:"179t5g5",styles:"position:relative;z-index:1"});function Zn(e){He(I.playerNameChanged),d.useEffect(()=>{Ke.startMonitoring()},[]);const s=ge(I.playerInputChanged,()=>R.getInputs()).some(r=>r.source!=="Dummy");return t.jsxs(es,{...e,children:[t.jsxs(ts,{children:["Microphone Check",s?R.getPlayers().map(r=>t.jsx(ot,{player:r},r.number)):t.jsxs(t.Fragment,{children:[t.jsx(ns,{children:"Mic not setup"}),t.jsx("h4",{children:"Singing will be emulated"}),t.jsx("h5",{children:"You can setup in the Next step"})]})]}),t.jsx(Wn,{})]})}const es=u("div",{target:"e1b6ju672"})("display:flex;font-size:3rem;",L,";margin-bottom:8.6rem;gap:3.5rem;"),ts=u("div",{target:"e1b6ju671"})({name:"fmwdml",styles:"gap:1.25rem;display:flex;flex-direction:column;align-items:center"}),ns=u("div",{target:"e1b6ju670"})({name:"1x5xnlp",styles:"position:relative;border:0.1rem solid white;padding:1rem 3rem;background:black;width:80%;text-align:center;gap:1.25rem;font-size:2.3rem;color:white"}),lt=d.forwardRef(({options:e,focused:n,label:s,value:r,onChange:a,disabled:l,placeholder:o,keyboardNavigationChangeFocus:c,onBlur:i,className:g,...h},m)=>{const f=d.useRef(null);d.useImperativeHandle(m,()=>f.current);const p=d.useRef(null),[S,k]=d.useState(!1),[b,y]=d.useState(-1),w=d.useMemo(()=>e.filter(x=>x.toLowerCase().trim().includes(r.toLowerCase().trim())&&x!==r),[e,r]),v=x=>{var M,P,z;if(x.code==="ArrowUp"||x.code==="ArrowDown")if(w.length){x.preventDefault();const T=$e(w,b,x.code==="ArrowUp"?-1:1);y(T);const N=(M=p.current)==null?void 0:M.querySelector(`[data-index="${T}"]`);N==null||N.scrollIntoView({behavior:"smooth",block:"center"})}else(P=f.current)==null||P.blur(),c==null||c(x.code==="ArrowUp"?-1:1);else if(x.code==="Enter"){const T=w[b];T?(y(-1),a(T)):(z=f.current)==null||z.blur()}},j=()=>{setTimeout(()=>{k(!1),i==null||i()},300)};return t.jsxs(ss,{className:g,children:[t.jsx(Oe,{onFocus:()=>k(!0),onBlur:j,onKeyDown:v,onChange:a,value:r,focused:n,label:s,disabled:l,ref:f,placeholder:o,...h}),S&&!!w.length&&t.jsx(as,{ref:p,role:"listbox",children:w.map((x,M)=>t.jsx(rs,{role:"listitem","data-index":M,"data-focused":M===b,focused:M===b,onClick:()=>{var P;a(x),y(-1),(P=f.current)==null||P.blur()},children:x},x))})]})}),ss=u("div",{target:"e1olyu0z2"})({name:"bjn8wh",styles:"position:relative"}),as=u("div",{target:"e1olyu0z1"})("margin-top:0.1em;position:absolute;width:100%;background:black;max-height:",(1+2*.3)*4,"em;overflow-y:auto;z-index:2;"),rs=u("div",{target:"e1olyu0z0"})(L,";padding:0.3em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:",e=>e.focused?_.colors.text.active:"white",";cursor:pointer;"),is=(e,n)=>{var s;return((s=e[n])==null?void 0:s.name)??`Track ${n+1}`};function os({multipleTracks:e,player:n,songPreview:s,playerNames:r,register:a,onChange:l,setup:o}){const[c,i]=d.useState(!1),g=d.useRef(null);if(He(I.playerNameChanged),n===void 0)return null;const h=()=>l({number:n.number,track:(o.track+1)%s.tracksCount}),m=S=>{i(!0),n.setName(S)},f=!c,p=n.getName();return t.jsxs(t.Fragment,{children:[t.jsx(ls,{maxLength:Rt,className:"ph-no-capture",value:f?"":p,placeholder:f?p:void 0,options:r,onChange:m,label:"Name:",ref:g,...a(`player-${n.number}-name`,()=>{var S;return(S=g.current)==null?void 0:S.focus()})}),e&&t.jsx(cs,{...a(`player-${n.number}-track-setting`,h,"Change track"),label:"Track",value:is(s.tracks,o.track),"data-test-value":o.track+1})]})}const ls=u(lt,{target:"eilnc831"})("input{font-size:4.5rem;}[role='listbox']{max-height:",6*(4.5+.3),"rem;}"),cs=u(Ve,{target:"eilnc830"})({name:"1bwrnjg",styles:"font-size:4.5rem;padding:1.1rem"});function ds({songPreview:e,onNextStep:n,keyboardControl:s,onExitKeyboardControl:r}){const[a]=D(ue),[l]=D(_t),o=R.getPlayers(),c=!a&&o.length===2&&e.tracksCount>1,i=()=>o.map((j,x)=>({number:j.number,track:c?Math.min(x,e.tracksCount-1):0})),[g,h]=d.useState(i());ee([I.playerAdded,I.playerRemoved],()=>h(i()));const m=o.map((j,x)=>g.find(M=>M.number===j.number)??i()[x]),f=d.useMemo(()=>JSON.parse(sessionStorage.getItem(Ue))??[],[]),p=j=>x=>{h(M=>M.map(P=>P.number===j?x:P))},[S,k]=d.useState(!1);d.useEffect(()=>{S||Ke.startMonitoring()},[S]);const{register:b,focusElement:y}=Z({enabled:s&&!S,onBackspace:r}),w=()=>{n(m)},v=!!l&&l!=="skip";return t.jsxs(t.Fragment,{children:[S&&t.jsx(tn,{closeButtonText:v?"Continue to the song":"Continue to player setup",onClose:()=>{k(!1),v&&y("play")}}),m.map((j,x)=>t.jsxs(us,{children:[t.jsxs(gs,{children:["Player ",x+1]}),t.jsx("div",{children:t.jsx(os,{multipleTracks:c,player:R.getPlayer(j.number),setup:j,onChange:p(j.number),playerNames:f,register:b,songPreview:e})})]},j.number)),v&&t.jsx(ke,{...b("play-song-button",w,void 0,!0),children:"Play"}),t.jsx(ke,{...b("select-inputs-button",()=>k(!0),void 0,!1),children:"Setup mics"})]})}const us=u("div",{target:"ee5oup2"})({name:"ho1qnd",styles:"display:flex;flex-direction:row"}),ke=u(H,{target:"ee5oup1"})({name:"afgxf2",styles:"padding:0.5rem 9rem;font-size:4.3rem"}),gs=u("span",{target:"ee5oup0"})(L,";padding:1.3rem;font-size:4.5rem;");function hs({songPreview:e,onPlay:n,keyboardControl:s,onExitKeyboardControl:r}){const[a,l]=d.useState(null),[o,c]=d.useState("song"),i=h=>{l(h),c("players")},g=h=>{if(!a)return;const m={...a,players:h};I.songStarted.dispatch(e,m),n({song:e,...m})};return t.jsxs(ms,{children:[t.jsx(Zn,{style:o==="players"?{viewTransitionName:"player-mic-check-container"}:void 0}),t.jsxs(fs,{children:[o==="song"&&t.jsx(Kn,{songPreview:e,onNextStep:i,keyboardControl:s,onExitKeyboardControl:r}),o==="players"&&t.jsx(ds,{songPreview:e,onNextStep:g,keyboardControl:s,onExitKeyboardControl:()=>c("song")})]})]})}const ms=u("div",{target:"e1of12hx1"})({name:"k6gb66",styles:"display:flex;flex-direction:row;align-items:flex-end;justify-content:space-between;width:100%;hr{margin:1rem;opacity:0.25;}"}),fs=u("div",{target:"e1of12hx0"})({name:"115sh08",styles:"width:auto;display:flex;flex-direction:column;align-items:flex-end;gap:1.25rem"}),ps=30;function xs({songPreview:e,top:n,left:s,width:r,height:a,keyboardControl:l,onExitKeyboardControl:o,onPlay:c,focusEffect:i}){const[g,h]=d.useState(!1),m=d.useRef(null),{width:f,height:p}=he(),S=l;d.useLayoutEffect(()=>{h(!1)},[e.video]);const k=e.previewStart??(e.videoGap??0)+60,b=e.previewEnd??k+ps,y=d.useMemo(()=>[e.video,k,b,e.volume],[e.video,k,b,e.volume]),[w,v,j,x]=Dt(y,350);d.useEffect(()=>{var T;(T=m.current)==null||T.loadVideoById({videoId:w,startSeconds:v,endSeconds:j})},[w,m,v,j]);const M=S?f:r,P=S?p:a,z=S?Math.min(f/20*9,p*(4/5)):a;return d.useEffect(()=>{var T;(T=m.current)==null||T.setSize(M,P)},[M,P,l]),t.jsxs(t.Fragment,{children:[S&&t.jsx(vs,{onClick:o}),!S&&g&&t.jsx(Cs,{width:M,height:P,left:s,top:n,song:e}),t.jsx(ys,{background:S||g,video:t.jsx(ws,{show:g,expanded:S,height:z,id:"preview-video-container",children:t.jsx(Ot,{width:0,height:0,disablekb:!0,ref:m,video:"",volume:x,onStateChange:T=>{var N,O;T===J.ENDED?((N=m.current)==null||N.seekTo(k),(O=m.current)==null||O.playVideo()):T===J.PLAYING&&h(!0)}})}),focused:!0,song:e,top:n,left:s,width:M,height:z,showVideo:g,expanded:S,"data-test":"song-preview","data-song":e.id,children:t.jsx(ks,{expanded:S,children:S&&t.jsx(hs,{songPreview:e,onPlay:c,keyboardControl:l,onExitKeyboardControl:o})})})]})}var bs={name:"17gota2",styles:"border:0;border-radius:0;position:fixed;padding:var(--preview-padding)"};const Ss=u(nt,{target:"evapa6h4"})("--preview-padding:5rem;width:",e=>e.width,"px;height:",e=>e.height,"px;position:absolute;z-index:",e=>e.expanded?201:3,";overflow:hidden;visibility:",e=>e.expanded||e.showVideo?"visible":"hidden",";",e=>e.expanded?bs:$("pointer-events:none;",e.showVideo&&e.theme.graphicSetting==="high"?"animation: rhythmPulse 1s infinite":"scale: 1.2",";",""),";@keyframes rhythmPulse{0%{transform:scale(1.2);}15%{transform:scale(1.25);}100%{transform:scale(1.2);}}view-transition-name:song-preview;",xe,"{view-transition-name:song-preview-artist;}",te,"{view-transition-name:song-preview-title;}",st,"{view-transition-name:song-preview-expanded-data;}"),ys=e=>{const n=e.song.realBpm??(e.song.bpm>300?e.song.bpm/4:e.song.bpm/2);return t.jsx(Ss,{style:{top:e.expanded?`calc(50vh - ${e.height}px / 2)`:e.top,left:e.expanded?0:e.left,animationDuration:`${60/n}s`},...e})},vs=u("div",{target:"evapa6h3"})({name:"1iz7jdz",styles:"position:fixed;top:0;left:0;background:rgba(0, 0, 0, 0.8);width:100vw;height:100vh;z-index:201"});var js={name:"pfrwim",styles:"position:absolute;top:0;left:0;background-image:none!important;border-radius:0.5rem"};const ws=u("div",{target:"evapa6h2"})(e=>e.expanded?$("position:fixed;inset:0;clip-path:inset(calc((100vh - ",e.height,"px) / 2) 0);",""):js," div{opacity:",({show:e})=>e?1:0,";transition:",({show:e,expanded:n})=>e||n?1e3:0,"ms;}"),ks=u("div",{target:"evapa6h1"})("inset:auto var(--preview-padding);position:fixed;z-index:100;",e=>!e.expanded&&"transform: scale(0.1);"," border-radius:0.5rem;view-transition-name:song-preview-content;"),Es=u("div",{target:"evapa6h0"})("background:white;width:",e=>e.width,"px;height:",e=>e.height,"px;z-index:2;top:0;left:0;position:absolute;animation:bpm 1s infinite;border-radius:0.5rem;pointer-events:none;@keyframes bpm{0%{transform:scale(1.15);opacity:1;}100%{transform:scale(1.45);opacity:0;}}"),Cs=e=>{const[n]=D(Bt);if(n==="low")return null;const s=e.song.realBpm??(e.song.bpm>300?e.song.bpm/4:e.song.bpm/2);return t.jsx(Es,{width:e.width,height:e.height,style:{left:e.left,top:e.top,animationDuration:`${60/s}s`}})};let oe=0;function ct(){d.useEffect(()=>(document.body.classList.add("blockOverflow"),document.documentElement.classList.add("blockOverflow"),oe++,()=>{oe--,oe===0&&(document.body.classList.remove("blockOverflow"),document.documentElement.classList.remove("blockOverflow"))}),[])}const Ms=1.2,Ee=4;function Ps({onSongSelected:e,preselectedSong:n}){const[s]=D(ue),r=s?Ee-1:Ee;Ye(!1),We(!0),ct();const[{previewTop:a,previewLeft:l,previewWidth:o,previewHeight:c},i]=d.useState({previewTop:0,previewLeft:0,previewWidth:0,previewHeight:0}),{focusedGroup:g,focusedSong:h,moveToSong:m,groupedSongList:f,keyboardControl:p,songPreview:S,setKeyboardControl:k,setFilters:b,filters:y,setShowFilters:w,showFilters:v,prefilteredList:j,isLoading:x}=bn(n,r);Y(De,A=>{A.stopPropagation(),A.preventDefault(),b({search:A.key})},{enabled:!y.search&&p});const P=d.useCallback(A=>{p&&b({search:A})},[p]);ee(I.remoteSongSearch,P);const z=d.useRef(null),{width:T,handleResize:N}=he(),O=V(g),ne=V(h);d.useEffect(()=>{var B,K,U;const A=(mt,ft)=>`[data-group-letter="${mt}"] [data-index="${ft}"]`;N();const E=(B=z.current)==null?void 0:B.querySelector(A(O,ne)),C=(K=z.current)==null?void 0:K.querySelector(A(g,h));C&&((!E||E.offsetTop!==C.offsetTop)&&((U=C.scrollIntoView)==null||U.call(C,{behavior:"smooth",inline:"center",block:"center"})),i({previewLeft:C.offsetLeft,previewTop:C.offsetTop,previewWidth:C.offsetWidth,previewHeight:C.offsetHeight}))},[T,z,h,g,f]);const se=d.useCallback(()=>k(!1),[k]);return!f||!T?t.jsx(t.Fragment,{children:"Loading"}):x?t.jsx(_s,{children:t.jsx(Xe,{size:"15em",color:"secondary"})}):t.jsxs(As,{songsPerRow:r,children:[y.search?t.jsx(wn,{showFilters:v,onSongFiltered:b,filters:y}):t.jsx(Mn,{keyboardControl:p}),t.jsxs(Ns,{ref:z,active:p,"data-test":"song-list-container",dim:v,children:[f.length===0&&t.jsx(Is,{children:"No songs found"}),S&&t.jsx(xs,{songPreview:S,onPlay:e,keyboardControl:!p,onExitKeyboardControl:()=>k(!0),top:a,left:l,width:o,height:c,focusEffect:!v}),f.map(A=>d.createElement(zs,{...v||!p?{"data-unfocusable":!0}:{},key:A.letter,"data-group-letter":A.letter,highlight:A.letter==="New"},t.jsx(dt,{children:A.letter}),t.jsx(Fs,{children:A.songs.map(({song:E,index:C})=>t.jsx(Rs,{song:E,handleClick:h===C?se:m,focused:!v&&p&&C===h,index:C,"data-index":C,"data-focused":!v&&p&&C===h,"data-test":`song-${E.id}${A.isNew?"-new-group":""}`},E.id))}))),t.jsxs(Ts,{children:["Missing a song? Try ",t.jsx("a",{href:"/convert",children:"adding one"})," yourself!"]})]}),t.jsx(yn,{setFilters:b,active:v,closePlaylist:w,prefilteredList:j})]})}const Ts=u("span",{target:"ef4zhl28"})(L,";text-align:center;font-size:5rem;margin-top:10rem;"),As=u("div",{target:"ef4zhl27"})("display:flex;flex-direction:row;max-height:100vh;--song-list-gap:3.5rem;--song-item-width:",e=>`calc(${100/e.songsPerRow}% - ((${e.songsPerRow-1} / ${e.songsPerRow}) * var(--song-list-gap)))`,";--song-item-ratio:calc(16 / 9 * (4 / ",e=>e.songsPerRow,"));"),zs=u("div",{target:"ef4zhl26"})("padding:0 4.5rem 0 11rem;",e=>e.highlight&&$("background:rgba(0, 0, 0, 0.5);padding-bottom:3rem;border-bottom:0.2rem solid black;",dt,"{animation:new-song-group-header 600ms ease-in-out infinite both;background:#ffffff;@keyframes new-song-group-header{0%,100%{transform:scale(1);}50%{transform:scale(1.1);}}}",""),";"),Is=u("div",{target:"ef4zhl25"})(L,";display:flex;align-items:center;justify-content:center;flex:1;font-size:10rem;"),dt=u("div",{target:"ef4zhl24"})(L,";display:inline-block;padding:0.5rem 1rem;margin-bottom:2rem;font-size:3.5rem;position:sticky;z-index:1;top:calc(-1 * var(--song-list-gap));color:",_.colors.text.active,";background:rgba(0, 0, 0, 0.7);"),Ns=u("div",{target:"ef4zhl23"})("position:relative;flex:1 1 auto;display:flex;flex-direction:column;gap:var(--song-list-gap);padding:4.5rem 0;overflow-y:auto;overflow-x:clip;box-sizing:border-box;min-height:100vh;max-height:100vh;::-webkit-scrollbar{display:none;}transition:opacity 500ms;opacity:",e=>e.dim?.5:1,";"),Fs=u("div",{target:"ef4zhl22"})({name:"bviq7b",styles:"display:flex;flex-direction:row;flex-wrap:wrap;gap:var(--song-list-gap)"});var Ls={name:"1jwmbuq",styles:"transition:300ms"};const Rs=d.memo(u(nt,{target:"ef4zhl21"})("cursor:pointer;flex-basis:var(--song-item-width);aspect-ratio:var(--song-item-ratio);",e=>e.theme.graphicSetting==="high"&&Ls," transform:scale(",e=>e.focused?Ms:1,");",e=>e.focused&&"z-index: 2;"," ",e=>e.focused&&Gt," content-visibility:auto;contain-intrinsic-size:calc(var(--song-item-width) * (1 / var(--song-item-ratio)));")),_s=u("div",{target:"ef4zhl20"})({name:"101j4br",styles:"display:flex;align-items:center;justify-content:center;height:100vh"});function Ds(e){const[n,s]=D(Te),[r,a]=d.useState(n===null),l=()=>{s(n??[]),a(!1)};return r?t.jsx(qt,{onClose:l,closeText:"Continue to Song Selection"}):t.jsx(Ps,{...e})}function ut(){d.useEffect(()=>{try{document.body.requestFullscreen().catch(console.info)}catch{}},[])}const Os=""+new URL("459342__papaninkasettratat__cinematic-music-short-4de1542a.mp3",import.meta.url).href,q=e=>new Promise(n=>setTimeout(n,e)),le=15;function Bs({onFinish:e}){const n=d.useRef(null),[s,r]=d.useState(!1),[a,l]=d.useState([]);ee(I.readinessConfirmed,i=>{l(g=>[...g,i])});const o=ge([I.inputListChanged,I.readinessConfirmed],()=>R.getPlayers().map((i,g)=>[i.input.deviceId,i.getName(),i]));d.useEffect(()=>{(async()=>{var f,p,S;let i=!1;const g=R.requestReadiness().then(()=>{i=!0,r(!0)}),h=q(1500),m=q(le*1e3);await q(250),i||await((f=n==null?void 0:n.current)==null?void 0:f.play()),await Promise.race([Promise.all([g,h]),m]),(p=n==null?void 0:n.current)!=null&&p.paused||$t.play(),await q(500),(S=n==null?void 0:n.current)==null||S.pause(),await q(1e3),e()})()},[]);const c=o.map(([i,g,h])=>({confirmed:a.includes(i),name:g,player:h}));return t.jsxs(t.Fragment,{children:[t.jsxs(Gs,{children:[!s&&t.jsxs("span",{children:["Waiting for all players to click ",t.jsx("strong",{children:'"Ready"'})]}),t.jsx($s,{children:c.map(({confirmed:i,name:g,player:h},m)=>t.jsxs(Vs,{className:"ph-no-capture","data-test":"player-confirm-status","data-name":g,"data-confirmed":i,children:[!s&&t.jsx(Hs,{children:i?t.jsx(dn,{}):t.jsx(Xe,{color:"info",size:"1em"})})," ",t.jsx(ot,{player:h})]},m))}),!s&&t.jsxs(qs,{children:["The song will start automatically in"," ",t.jsx("strong",{children:t.jsx(Je,{end:0,start:le,duration:le,useEasing:!1})})]})]}),t.jsx("audio",{src:Os,ref:n,hidden:!0,autoPlay:!1,onPlay:i=>{i.currentTarget.volume=.8}})]})}const Gs=u("div",{target:"e1sds9f4"})("top:0;left:0;z-index:1000;display:flex;align-items:center;justify-content:center;flex-direction:column;position:absolute;width:100%;height:100%;gap:5rem;font-size:5rem;",L,";"),qs=u("span",{target:"e1sds9f3"})({name:"1umnjfm",styles:"font-size:5rem"}),$s=u("div",{target:"e1sds9f2"})({name:"1uxgijs",styles:"display:flex;flex-direction:column;gap:5rem;width:50rem;view-transition-name:player-mic-check-container"}),Vs=u("div",{target:"e1sds9f1"})({name:"174652e",styles:"display:flex;align-items:center;gap:2rem;transform:scale(1.5)"}),Hs=u("span",{target:"e1sds9f0"})({name:"1l5xwqu",styles:"svg{width:5rem;height:5rem;stroke:black;}"}),Ks=250,ce=(e,n=0,s=1/0)=>e.filter(Qe).filter(r=>Ze([r])>=n).filter(r=>Q([r])<=s).reduce((r,a)=>r+a.notes.reduce((l,o)=>l+o.length,0),0),Us=(e,n)=>{const[s,...r]=e.filter(Qe),a=[[s]];return r.forEach(l=>{const o=a.at(-1),c=Q(o);(Ze([l])-c)*n>Ks?a.push([l]):o.push(l)}),a},gt=(e,n)=>e+n,Ce=e=>{const n=e.map(s=>s.reduce(gt,0));return Math.max(...n)-Math.min(...n)},Ys=(e,n)=>{const s=nn(e),r=l=>{if(s[l-1].length<2)return;const o=s[l-1].pop();s[l].push(o)},a=l=>{var i;if(((i=s[l+1])==null?void 0:i.length)<2)return;const[o,...c]=s[l+1];s[l].push(o),s[l+1]=c};return n%2===1?r(Math.ceil(n/2)):a(Math.ceil(n/2)),s},Ws=e=>e.reduce(gt,0);function Xs(e){const s=Vt(e);return e.tracks.map(r=>{if(r.sections.length<3)return[];const a=Us(r.sections,s);let l=[],o=[ce(a[0])];for(let c=0;c<a.length-2;c++){const i=a[l.flat().length-1]??[],h=ce(r.sections,Q(i)??0)/(1+9-l.length),m=ce(a[c+1]),f=Ws(o);f+m<h?o=[...o,m]:h-f<f+m-h?(l.push(o),o=[m]):(l.push([...o,m]),o=[])}for(let c=0;c<100;c++){const i=Ce(l),g=Ht((l.length-2)*2+2).map(p=>Ys(l,p)),h=g.map(Ce),m=Math.min(...h);if(i<=m)break;const f=h.indexOf(m);l=g[f]}return l.map(c=>c.length).reduce((c,i)=>[...c,(c.at(-1)??0)+i],[]).map(c=>Q(a[c-1]))})}const Me=[t.jsxs(t.Fragment,{children:["You can follow the updates and give feedback on the game through the Facebook Page:"," ",t.jsx("a",{href:"https://www.facebook.com/allkaraoke.party",target:"_blank",rel:"noreferrer",children:t.jsx("strong",{children:"fb.com/AllKaraoke.Party"})})]}),t.jsxs(t.Fragment,{children:["Start typing a name of a song in ",t.jsx("strong",{children:"Song Selection"})," to active Search feature"]}),t.jsxs(t.Fragment,{children:["Narrow down songs through ",t.jsx("strong",{children:"playlists"})," on the right in Song Selection"]}),t.jsxs(t.Fragment,{children:["Select ",t.jsx("strong",{children:"Pass The Mic"})," Game Mode to share the microphones and sing in a team"]}),t.jsxs(t.Fragment,{children:["Your scores and ",t.jsx("strong",{children:"stats are saved"})," in this browser - they will be available for the next party!"]}),t.jsxs(t.Fragment,{children:["You can remove irrelevant songs from the Song Selection in ",t.jsx("strong",{children:"Edit Songs"})," page"]}),t.jsxs(t.Fragment,{children:["If the game feels a bit jaggy with low FPS, check out ",t.jsx("strong",{children:"Settings"})," page"]}),t.jsxs(t.Fragment,{children:["Party is only getting started? Play ",t.jsx("strong",{children:"Jukebox"})," for the music and to see what songs are available"]}),t.jsxs(t.Fragment,{children:["Research shows that ",t.jsx("strong",{children:"duet songs"})," are that bit more fun than simple one-track ones"]}),t.jsxs(t.Fragment,{children:["Want to sing a ",t.jsx("strong",{children:"new song"}),"? Find UltraStar version of it and import it with",t.jsx("br",{}),t.jsx("strong",{children:"Convert Ultrastar .txt"})]}),t.jsxs(t.Fragment,{children:["The ",t.jsx("strong",{children:"white pulse"})," around selected song in Song Selection tries to match song's tempo"]}),t.jsxs(t.Fragment,{children:["Entire game (besides add/edit song) is navigable with ",t.jsx("strong",{children:"Keyboard"})]}),t.jsxs(t.Fragment,{children:["You can hide or show keyboard navigation help with ",t.jsx("kbd",{children:"H"})," key"]}),t.jsxs(t.Fragment,{children:["In Song Selection, hold ",t.jsx("kbd",{children:"↑"})," or ",t.jsx("kbd",{children:"↓"})," to jump to the next letter"]}),t.jsxs(t.Fragment,{children:["Add ",t.jsx("strong",{children:"vibrato"})," to the notes you sing to get additional ",t.jsx("strong",{children:"bonus points"})]}),t.jsxs(t.Fragment,{children:["You can control the game with your phone - click on the"," ",t.jsxs("strong",{children:[t.jsx(Kt,{}),"QR Code Icon"]})," ","on the top right and follow the instructions"]})],Js=({as:e="h4",...n})=>{const s=d.useRef(X(0,Me.length-1)),r=e;return t.jsx(r,{...n,children:Me[s.current]})};function Qs({...e}){const[n,s]=d.useState(""),r=d.useRef(null);return d.useEffect(()=>{const a=setTimeout(()=>{s(me.getVideo())},1e3);return()=>{clearTimeout(a)}},[]),d.useEffect(()=>{try{r.current&&(r.current.playbackRate=16)}catch(a){Pe(a)}},[n]),t.jsx(Zs,{...e,children:t.jsx(ea,{src:n,ref:r,loop:!0,autoPlay:!0,className:"ph-no-capture"})})}const Zs=u("div",{target:"egk8upf1"})({name:"1g34f1k",styles:"width:80rem;height:60rem"}),ea=u("video",{target:"egk8upf0"})({name:"idj2s4",styles:"object-fit:cover;width:100%;height:100%"}),ta=6,na=3;function sa({playerNumber:e,player:n,highestScore:s,highScores:r,singSetup:a,useColors:l=!0,revealHighScore:o,setAnimDone:c}){const i=et(n.detailedScore[0]),g=h=>r.some(m=>m.singSetupId===a.id&&m.name===h);return t.jsxs(t.Fragment,{children:[t.jsx(ht,{color:l?_.colors.players[e].text:"","data-test":`player-${e}-name`,className:"ph-no-capture",children:n.name}),t.jsx("br",{}),t.jsxs(aa,{highscore:o&&g(n.name),color:l?_.colors.players[e].text:"",win:o&&i===s,"data-test":`player-${e}-score`,"data-score":i,children:[t.jsx(Je,{end:i,formattingFn:sn.format,onEnd:()=>c(e),duration:Math.max(na,i/Ut*ta)}),t.jsx(ra,{highscore:o&&g(n.name),children:"High score!"})]}),t.jsx("br",{}),t.jsx("br",{})]})}const ht=u(Yt,{target:"e1hn1x412"})("padding-left:10rem;padding-right:10rem;font-size:3.5rem;color:rgb(",e=>e.color,");"),aa=u(ht,{target:"e1hn1x411"})("font-size:",e=>e.win?"10.5rem":"5.5rem",";color:",e=>e.win?_.colors.text.active:"white",";transition:400ms ease-in-out;position:relative;"),ra=u("span",{target:"e1hn1x410"})("position:absolute;top:-1.5rem;right:-10rem;font-size:3rem;-webkit-text-stroke:0.1rem black;color:",_.colors.text.default,";padding:0.5rem 1rem;border-radius:1.5rem;",e=>e.highscore&&Wt,";opacity:",e=>e.highscore?"1":"0",";transition:400ms;");function ia({onNextStep:e,players:n,highScores:s,singSetup:r}){de({accept:e});const a=d.useMemo(()=>({accept:"Next"}),[]);Ne(a,!0);const l=r.mode===F.CO_OP,o=l?[{...n[0],name:n.map(f=>f.name).join(", ")}]:n,[c,i]=d.useState(o.map(()=>!1)),g=c.every(f=>f),h=o.map(f=>et(f.detailedScore[0])),m=Math.max(...h);return t.jsxs(t.Fragment,{children:[t.jsx(oa,{children:o.map((f,p)=>t.jsx(sa,{playerNumber:f.playerNumber,useColors:!l,revealHighScore:g,setAnimDone:S=>i(k=>(k[S]=!0,[...k])),player:f,highScores:s,highestScore:m,singSetup:r},p))}),t.jsx(la,{onClick:e,focused:!0,"data-test":"highscores-button",children:"Next"}),me.getPermissionStatus()&&t.jsx(ca,{})]})}const oa=u("div",{target:"ez8rfb42"})({name:"vqmv26",styles:"position:absolute;top:20rem;width:100%;text-align:center"}),la=u(H,{target:"ez8rfb41"})({name:"dmbiod",styles:"position:absolute;bottom:4rem;right:2rem;width:40rem;font-size:1.9vw"}),ca=u(Qs,{target:"ez8rfb40"})({name:"1c3jvq",styles:"position:absolute;top:calc(50% - 30rem);left:95rem;transform:scale(0.75)"});function da(){return d.useMemo(()=>JSON.parse(sessionStorage.getItem(Ue))??[],[])}function ua({score:e,register:n,singSetupId:s,onSave:r,index:a}){const l=d.useRef(null),[o,c]=d.useState(""),i=da(),g=()=>{o.trim().length&&o.trim()!==e.name&&r(s,e.score,e.name,o)};return t.jsx(lt,{className:"ph-no-capture",options:i,onChange:c,onBlur:g,value:o,label:"",ref:l,...n(`highscore-rename-${a}`,()=>{var h;return(h=l.current)==null?void 0:h.focus()}),placeholder:e.name,"data-test":"input-edit-highscore","data-original-name":e.name})}function ga({onNextStep:e,highScores:n,singSetup:s,song:r}){const{register:a}=Z(),l=Ln(r);return t.jsxs(t.Fragment,{children:[t.jsx(ha,{"data-test":"highscores-container",children:n.map((o,c)=>t.jsxs(ma,{isCurrentSing:o.singSetupId===s.id,children:[t.jsx(fa,{children:c+1}),t.jsx(pa,{className:"ph-no-capture",children:o.singSetupId===s.id?t.jsx(ua,{index:c,score:o,register:a,singSetupId:s.id,onSave:l}):o.name}),t.jsx(xa,{children:t.jsx(an,{score:o.score})}),t.jsx(ba,{children:G(o.date).format("MMMM DD, YYYY")})]},c))}),t.jsx(Sa,{...a("play-next-song-button",e,void 0,!0),children:"Select song"})]})}const ha=u("div",{target:"e161j45v6"})({name:"9gtmjg",styles:"position:absolute;top:20rem;width:100%;text-align:center;padding:0 16rem;box-sizing:border-box"}),ma=u("div",{target:"e161j45v5"})("position:relative;",L,";font-size:3.2rem;display:flex;background:",e=>e.isCurrentSing?"rgba(0,0,0,.9)":"rgba(0,0,0,.5)",";margin-bottom:2rem;padding:",e=>e.isCurrentSing?"0 1.5rem":"1rem 3.2rem",";align-items:center;"),fa=u("div",{target:"e161j45v4"})("padding:0 1.6rem;color:",_.colors.text.active,";"),pa=u("div",{target:"e161j45v3"})({name:"1mbe2e5",styles:"text-align:left;flex:1;padding:1.6rem"}),xa=u("div",{target:"e161j45v2"})({name:"2ycp6t",styles:"padding:0 1rem"}),ba=u("div",{target:"e161j45v1"})({name:"1gbnj87",styles:"position:absolute;font-size:2rem;bottom:-1rem;right:-1.6rem;background:black;padding:0.5rem"}),Sa=u(H,{target:"e161j45v0"})({name:"dmbiod",styles:"position:absolute;bottom:4rem;right:2rem;width:40rem;font-size:1.9vw"});function ya({song:e,width:n,height:s,onClickSongSelection:r,players:a,highScores:l,singSetup:o}){Ye(!0);const[c,i]=d.useState("results");return t.jsx(Xt,{songData:e,width:n,height:s,children:t.jsxs(va,{children:[c==="results"&&t.jsx(ia,{onNextStep:()=>i("highscores"),players:a,singSetup:o,highScores:l}),c==="highscores"&&t.jsx(ga,{onNextStep:r,singSetup:o,highScores:l,song:e}),t.jsx(ja,{active:!0})]})})}const va=u("div",{target:"ehc5trj1"})({name:"1quw0ni",styles:"pointer-events:auto"}),ja=u(Js,{target:"ehc5trj0"})("transition:300ms;transform:scale(",({active:e})=>e?1:0,");position:absolute;bottom:20rem;font-size:3.2rem;line-height:1.25;color:white;text-align:center;background:rgba(0, 0, 0, 0.75);width:100%;box-sizing:border-box;padding:2rem 10rem;kbd{padding:0.12rem 0.9rem;border-radius:1rem;border:0.5rem solid rgb(204, 204, 204);border-bottom-color:rgb(150, 150, 150);border-right-color:rgb(150, 150, 150);color:rgb(51, 51, 51);line-height:1.4;display:inline-block;box-shadow:0 0.1rem 0 rgba(0, 0, 0, 0.2),inset 0 0 0 0.2rem #ffffff;background-color:rgb(247, 247, 247);text-shadow:0 0.1rem 0 #fff;font-weight:normal;}");function wa(e,n){const s=pe(e);return d.useMemo(()=>s==null?void 0:s.scores.filter(({setup:a})=>a.mode===n.mode&&a.tolerance===n.tolerance).map(a=>a.scores.map(l=>({...l,date:a.date,singSetupId:a.setup.id}))).flat().sort((a,l)=>l.score-a.score).slice(0,5),[s,n])??[]}function ka({song:e,width:n,height:s,onClickSongSelection:r,singSetup:a}){const l=wa(e,a),o=d.useMemo(()=>R.getPlayers().map(c=>({name:c.getName(),playerNumber:c.number,detailedScore:W.getPlayerDetailedScore(c.number)})),[]);return t.jsx(ya,{singSetup:a,song:e,width:n,height:s,onClickSongSelection:r,players:o,highScores:l})}function Ea({songPreview:e,singSetup:n,returnToSongSelection:s,restartSong:r}){ut(),ct();const a=d.useRef(null),l=Jt(e.id),{width:o,height:c}=he(),[i,g]=d.useState(!1),[h,m]=d.useState(!0),[f,p]=d.useState(J.UNSTARTED),S=d.useMemo(()=>l.data?n.mode!==F.PASS_THE_MIC?l.data.tracks.map(()=>[]):Xs(l.data):[],[l.data,n]),[k,b]=d.useState(!1);return We(!k),d.useEffect(()=>{h&&l.data&&(k||f!==J.UNSTARTED)&&m(!1)},[l.data,k,f,h]),i&&l.data?t.jsx(ka,{width:o,height:c,song:l.data,onClickSongSelection:s,singSetup:n}):t.jsxs(Ca,{children:[t.jsxs(Ma,{visible:h,children:[t.jsx(Ta,{video:e.video,width:o,height:c}),t.jsx(Aa,{children:e.artist}),t.jsx(za,{children:e.title}),t.jsx(Bs,{onFinish:()=>{var y;b(!0),(y=a.current)==null||y.play()}})]}),l.data&&t.jsx(rn,{ref:a,onStatusChange:p,playerChanges:S,players:n.players,song:l.data,width:o,height:c,autoplay:!1,onSongEnd:()=>{var w;const y=((w=W.getSingSetup())==null?void 0:w.mode)===F.CO_OP?[{name:R.getPlayers().map(v=>v.getName()).join(", "),score:W.getPlayerScore(0)}]:R.getPlayers().map(v=>({name:v.getName(),score:W.getPlayerScore(v.number)}));I.songEnded.dispatch(l.data,n,y),g(!0)},singSetup:n,restartSong:r})]})}const Ca=u("div",{target:"e1pnu1v94"})({name:"bjn8wh",styles:"position:relative"}),Ma=u("div",{target:"e1pnu1v93"})("position:fixed;top:0;left:0;z-index:10;pointer-events:none;background-color:black;view-transition-name:song-preview;opacity:",e=>e.visible?1:0,";transition:500ms;"),Pa=u("div",{target:"e1pnu1v92"})({name:"oux8x1",styles:"background-size:cover;background-position:center center;filter:blur(10px)"}),Ta=e=>t.jsx(Pa,{style:{backgroundImage:`url('https://i3.ytimg.com/vi/${e.video}/hqdefault.jpg')`,width:`${e.width}px`,height:`${e.height}px`}}),Aa=u(xe,{target:"e1pnu1v91"})({name:"oyknw4",styles:"view-transition-name:song-preview-artist;position:absolute;top:10rem;left:10rem;font-size:7rem"}),za=u(te,{target:"e1pnu1v90"})({name:"1l9juvo",styles:"view-transition-name:song-preview-title;position:absolute;font-size:8rem;top:19rem;left:10rem"});function Fa(e){const[n,s]=d.useState(null),[r,a]=d.useState(e.songId??null),[l,o]=d.useState(0),c=i=>{document.getElementById("preview-video-container").style.viewTransitionName="song-preview-video",Le(()=>{document.getElementById("preview-video-container").style.viewTransitionName="",Re.flushSync(()=>{s(i)})}),_e.play()};return ut(),t.jsx(t.Fragment,{children:n?t.jsx(Ea,{restartSong:()=>{me.restartRecord(),o(i=>i+1)},songPreview:n.song,singSetup:n,returnToSongSelection:()=>{a(n.song.id),s(null)}},l):t.jsx(Ds,{onSongSelected:c,preselectedSong:r})})}export{Fa as default};
//# sourceMappingURL=Game-6929f3db.js.map
