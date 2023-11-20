import{a1 as yt,a2 as St,a3 as vt,c as jt,j as t,a4 as wt,r as d,a5 as D,a6 as Te,a0 as u,V as kt,a7 as Ae,a8 as ze,a9 as Ie,W as $,aa as X,ab as Ne,ac as Et,ad as Fe,ae as de,af as Ct,ag as Le,ah as Re,ai as Mt,aj as Pt,ak as _e,E as De,al as Be,am as Z,an as Tt,ao as L,ap as H,aq as R,ar as Y,as as Oe,at as $e,au as ue,K as At,L as zt,av as be,aw as qe,ax as ee,ay as I,az as Ge,aA as It,z as G,aB as Ve,aC as F,aD as Nt,aE as Ft,aF as Lt,aG as He,aH as Ue,aI as ge,aJ as Rt,aK as _t,aL as _,aM as Dt,aN as Bt,aO as Ke,aP as Ye,aQ as Ot,aR as $t,aS as We,aT as he,aU as qt,aV as Gt,aW as J,aX as Vt,U as Xe,S as Je,aY as Qe,aZ as Ht,a_ as Ut,a$ as Ze,b0 as Kt,b1 as Q,b2 as Yt,b3 as et,b4 as tt,b5 as Wt,b6 as me,b7 as nt,b8 as Xt,b9 as Jt,ba as Qt,bb as Zt,bc as W,bd as en}from"./index-Z7GO5p7b.js";import{u as tn,a as V,b as nn,P as sn,S as an,c as rn,f as on,d as cn,e as ln}from"./Player-aZlN2xdV.js";function dn(e){var n=yt(e),s=n%1;return n===n?s?n-s:n:0}var un=Math.ceil,gn=Math.max;function ye(e,n,s){(s?St(e,n,s):n===void 0)?n=1:n=gn(dn(n),0);var r=e==null?0:e.length;if(!r||n<1)return[];for(var a=0,o=0,i=Array(un(r/n));a<r;)i[o++]=vt(e,a,a+=n);return i}const hn=jt(t.jsx("path",{d:"M16.59 7.58 10 14.17l-3.59-3.58L5 12l5 5 8-8zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"}),"CheckCircleOutline");function st({videoId:e,...n}){return t.jsx(xn,{src:`https://img.youtube.com/vi/${e}/default.jpg`,alt:`Thumbnail image for YouTube video ${e}`,...n})}function mn({videoId:e,...n}){const s=wt(e)??e,[r,a]=d.useState(!0);d.useLayoutEffect(()=>{a(i=>!i)},[e]);const[o]=D(Te);return o==="low"?null:t.jsxs(fn,{...n,children:[t.jsx(Se,{videoId:r?e:s,visible:r}),t.jsx(Se,{videoId:r?s:e,visible:!r}),t.jsx(pn,{videoId:s})]})}const fn=u("div",{target:"e1x06a543"})({name:"k44s62",styles:"position:relative;overflow:hidden;background:black"}),pn=u(st,{target:"e1x06a542"})({name:"6dhm9o",styles:"visibility:hidden"}),Se=u(st,{target:"e1x06a541"})("position:absolute;transition:opacity 300ms;opacity:",e=>e.visible?1:0,";"),xn=u("img",{target:"e1x06a540"})({name:"4uwt2b",styles:"width:100%;height:100%;object-fit:cover"}),ae={language:(e,n)=>n===""?e:e.filter(s=>(Array.isArray(s.language)?s.language:[s.language]).includes(n)),excludeLanguages:(e,n=[])=>n.length===0?e:e.filter(s=>!(Array.isArray(s.language)?s.language:[s.language]).every(a=>n.includes(a))),search:(e,n)=>{const s=Ie(n);return s.length?e.filter(r=>r.search.includes(s)):e},duet:(e,n)=>n===null?e:e.filter(s=>n?s.tracksCount>1:s.tracksCount===1),yearBefore:(e,n)=>n?e.filter(s=>Number(s.year)<n):e,yearAfter:(e,n)=>n?e.filter(s=>Number(s.year)>=n):e,updatedAfter:(e,n)=>{if(!n)return e;const s=$(n);return e.filter(r=>r.lastUpdate&&$(r.lastUpdate).isAfter(s))}},ve=(e,n)=>Ie((n==null?void 0:n.search)??"").length?ae.search(e,n.search):Object.entries(n).filter(s=>s[0]in ae).reduce((s,[r,a])=>ae[r](s,a),e),bn=e=>d.useMemo(()=>tn(["",...e.map(n=>n.language??"Unknown")].flat()),[e]),yn=e=>{const n=bn(e),[s]=D(ze),[r,a]=d.useState({excludeLanguages:s??[]}),o=d.useDeferredValue(r),i=d.useMemo(()=>ve(e,{excludeLanguages:s??[]}),[e,s]),l=d.useMemo(()=>ve(e,{...o,excludeLanguages:s??[]}),[e,o,s]),c={language:{current:r.language??"",available:n},status:{allSongs:e.length,visible:l.length}};return{filters:r,filteredList:l,filtersData:c,prefilteredList:i,setFilters:a}};function Sn(){const e=kt(),{filters:n,filtersData:s,filteredList:r,prefilteredList:a,setFilters:o}=yn(e.data),i=d.useMemo(()=>{if(r.length===0)return[];const l=[];if(!n.search){const c=r.filter(g=>g.isNew);c.length&&l.push({letter:"New",isNew:!0,songs:c.map(g=>({song:g,index:r.indexOf(g)}))})}return r.forEach((c,g)=>{try{const h=isFinite(+c.artist[0])?"0-9":c.artist[0].toUpperCase();let m=l.find(f=>f.letter===h);m||(m={letter:h,songs:[]},l.push(m)),m.songs.push({index:g,song:c})}catch(h){console.error(h),Ae(h)}}),l},[r,n.search]);return{prefilteredList:a,groupedSongList:i,songList:r,filtersData:s,filters:n,setFilters:o,isLoading:e.isLoading}}const vn=30;function jn(e,n,s=vn){let r;if(n.length<e){const a=[...Array(e).keys()].filter(o=>!n.includes(o));r=a[X(0,a.length-1)]}else r=X(0,e-1),n.length=0;return n.length>=s&&n.shift(),n.push(r),r}const wn=(e=[],n)=>{var k;const[s,r]=d.useState([0,0]),a=d.useMemo(()=>e.map(({songs:y})=>ye(y.map(S=>S.index),n)).flat(),[e]),o=d.useMemo(()=>e.map(({songs:y,letter:S})=>ye(y.map(()=>S),n)).flat(),[e]),i=V(a??[]),l=s[0]===((k=a[s[1]])==null?void 0:k.length)-1,c=d.useCallback(y=>{var v;const S=a.findIndex(j=>j.includes(y)),w=(v=a[S])==null?void 0:v.indexOf(y);w>=0&&S>=0?r([w??0,S??0]):r([0,0])},[a]),g=([y,S],w,v)=>{var x;if(e.length===0)return v;const j=w[S];return(j==null?void 0:j[y])??(j==null?void 0:j.at(-1))??((x=w==null?void 0:w[0])==null?void 0:x[0])??v},h=([y,S],w=a)=>g([y,S],w,0),m=([y,S],w=o)=>g([y,S],w,"A");d.useEffect(()=>{const y=h(s,i),S=h(s,a);i.length&&y!==S&&c(y)},[s,a,i,l]);const f=(y,S)=>{Fe.play(),r(([w,v])=>{let j=w,x=v;if(y==="y")x=v+S;else{if(a[v]===void 0)debugger;const M=a[v].length-1;j=Math.min(w,M)+S,j<0?(x=(a.length+v-1)%a.length,j=a[x].length-1):j>M&&(x=v+1,j=0)}return[j%n,(a.length+x)%a.length]})},p=h(s),b=m(s);return Re([p,b,s,f,c,l])},kn=(e,n=[],s,r,a,o)=>{const i=Ne(),[l,c]=d.useState([!1,null]),g=V(l),[h,m]=l,[f,p,b,k,y,S]=wn(n,o),w=b[0]===0,v=()=>{Mt.play(),s()},[j,x]=d.useState(!1),M=V(a.search);d.useLayoutEffect(()=>{if(M&&!a.search){x(!0);const E=setTimeout(()=>x(!1),2e3);return()=>{clearTimeout(E),x(!1)}}},[a.search]);const P=()=>{!j&&!a.search&&(Pt.play(),i("/"))},z=d.useCallback(Et((E,C)=>{const O=(n.length+C+E)%n.length;y(n[O].songs[0].index),Fe.play()},700,{trailing:!1}),[n]),T=(E,C)=>{if(!(E!=null&&E.repeat))k("y",C);else{const O=n.findIndex(U=>!!U.songs.find(K=>K.index===f));z(C,O)}},N=(E,C=!1)=>{!C&&E===-1&&w&&!h?c([!0,"left"]):k("x",E)},B=d.useRef([]),ne=()=>{const E=jn(r,B.current);y(E)};de({accept:v,down:E=>T(E,1),up:E=>T(E,-1),left:()=>N(-1),right:()=>N(1),back:P,random:()=>{ne(),Ct.capture("selectRandom")}},e&&!h,[n,b,h,a,j]);const se=d.useMemo(()=>({"horizontal-vertical":null,accept:null,back:null,shiftR:null,remote:["search"]}),[]);Le(se,e);const A=d.useCallback(E=>{c([!1,E])},[c,N,n,b]);return d.useLayoutEffect(()=>{const[E,C]=g;E&&!h&&C===m&&N(m==="right"?1:-1,!0)},[h,m,w,S,...b]),Re([f,p,y,h,A])};function En(e,n){const{songList:s,prefilteredList:r,groupedSongList:a,filtersData:o,setFilters:i,filters:l,isLoading:c}=Sn(),g=Ne(),[h,m]=d.useState(!0),f=x=>{_e(()=>{De.flushSync(()=>{m(x)})}),Be.play()},[p,b,k,y,S]=kn(h,a,()=>f(!1),s.length,l,n),[w,v]=d.useState(!1);d.useEffect(()=>{if(!w&&s.length){const x=s.findIndex(z=>z.id===e),M=s.findIndex(z=>z.isNew);let P=X(0,s.length-1);(x>-1||M>-1)&&(P=x),k(P),v(!0)}},[s,k,e]),d.useEffect(()=>{w&&s.length&&s[p]&&g(`/game/${encodeURIComponent(s[p].id)}`,{replace:!0,smooth:!1})},[w,p,s]);const j=s==null?void 0:s[p];return{prefilteredList:r,groupedSongList:a,focusedSong:p,focusedGroup:b,moveToSong:k,setKeyboardControl:f,keyboardControl:h,songPreview:j,songList:s??[],filtersData:o,filters:l,setFilters:i,showFilters:y,setShowFilters:S,isLoading:c}}const Cn=e=>{const n=Tt(e);return d.useMemo(()=>[{name:"All",filters:{}},{name:n[0].name,filters:{language:n[0].name}},n[1]?{name:n[1].name,filters:{language:n[1].name}}:null,{name:"Classics",filters:{yearBefore:1995}},{name:"Modern",filters:{yearAfter:1995}},{name:"Duets",filters:{duet:!0}},{name:"New",filters:{updatedAfter:$().subtract(31,"days").toISOString()}}].filter(s=>s!==null),[n])};function Mn({setFilters:e,active:n,closePlaylist:s,prefilteredList:r}){const a=Cn(r),{register:o,focused:i,focusElement:l}=Z({enabled:n,additionalHelp:{vertical:void 0,"horizontal-vertical":null}});return d.useEffect(()=>{if(i){const c=a.find(g=>`playlist-${g.name}`===i);c&&e(c.filters)}},[i,a]),de({left:()=>s("left"),right:()=>s("right")},n),t.jsx(Pn,{"data-test":"song-list-playlists",active:n,children:a.map(c=>t.jsx(Tn,{active:n,...o(`playlist-${c.name}`,()=>l(`playlist-${c.name}`)),...n?{}:{selected:`playlist-${c.name}`===i},children:c.name},c.name))})}const Pn=u("div",{target:"e1amx3cg1"})("background:rgba(0, 0, 0, ",e=>e.active?.75:.5,");width:100vh;transform-origin:top right;transform:rotate(-90deg);position:absolute;left:-100vh;top:0;font-size:3.6rem;box-sizing:border-box;display:flex;flex-direction:row-reverse;h2{",L,";margin:0;}"),Tn=u(H,{target:"e1amx3cg0"})("font-size:3rem;flex:1;",e=>!e.focused&&e.active&&"background-color: transparent;",";padding:1.5rem;",e=>e.selected?`box-shadow: inset 0px 0px 0px 4px ${R.colors.text.active};`:!e.active&&"opacity: .5;",";");function An({onSongFiltered:e,filters:n}){const s=d.useRef(null),[r,a]=d.useState(!1);Y("down",()=>{var c;(c=s.current)==null||c.blur()},{enabled:r,enableOnTags:["INPUT"]});const i=c=>{var h,m;const g=((h=n.search)==null?void 0:h.length)??0;g>1?e({...n,search:" "}):g===0&&c&&e({...n,search:c}),(m=s.current)==null||m.focus()};Y(Oe,c=>{i(c.key)},{enabled:!r}),Y("Backspace",c=>{i()},{enabled:!r});const l=c=>{e({...n,search:c.trim()})};return d.useEffect(()=>{var c;(c=s.current)==null||c.focus()},[s]),t.jsx(zn,{"data-test":"song-list-search",children:t.jsx(In,{large:!0,children:t.jsx("form",{"data-test":"filters-search-form",onSubmit:c=>{var g;c.preventDefault(),(g=s.current)==null||g.blur()},children:t.jsx($e,{onFocus:()=>a(!0),onBlur:()=>a(!1),focused:r,label:"Search",value:n.search??"",onChange:l,ref:s,"data-test":"filters-search"})})})})}const zn=u("div",{target:"e1vw0lol1"})({name:"t46wvs",styles:"background:rgba(0, 0, 0, 0.7);padding:2rem;font-size:3rem;box-sizing:border-box;display:flex;flex-direction:row;gap:2rem;position:fixed;z-index:200;top:4.5rem;left:30rem;right:30rem"}),In=u("div",{target:"e1vw0lol0"})("flex:",e=>e.large?1.5:1,";"),Nn=1e4;function Fn({keyboardControl:e}){const[n,s]=d.useState(!1);d.useEffect(()=>{if(!e)s(!1);else{const a=setTimeout(()=>s(!0),Nn);return()=>clearTimeout(a)}},[e]);const[r]=D(ue);return r?null:t.jsxs(Ln,{visible:n,children:["Can't decide? Click ",t.jsx(je,{children:"Shift"})," + ",t.jsx(je,{children:"R"})," to pick random song"]})}const Ln=u("div",{target:"e5qasxu1"})("@keyframes shake{2.5%,22.5%{transform:translate3d(-0.1rem, 0, 0);}5%,20%{transform:translate3d(0.2rem, 0, 0);}7.5%,12.5%,17.5%{transform:translate3d(-0.4rem, 0, 0);}10%,15%{transform:translate3d(0.4rem, 0, 0);}}animation:shake 5s both infinite;",L,";pointer-events:none;position:fixed;transform:scale(",e=>e.visible?1:0,");opacity:",e=>e.visible?1:0,";text-align:center;font-size:4.8rem;text-shadow:0 0 3.5rem black,0 0 3.5rem black,0 0 3.5rem black,0 0 3.5rem black,0 0 3.5rem black,0 0 3.5rem black,0 0 3.5rem black;width:100%;z-index:4;padding:2.5rem;transition:ease 500ms;"),je=u("kbd",{target:"e5qasxu0"})("margin:0.1rem;padding:0.2rem 2rem;border-radius:1.5rem;border:0.6rem solid rgb(204, 204, 204);border-bottom-color:rgb(150, 150, 150);border-right-color:rgb(150, 150, 150);line-height:1.4;display:inline-block;background-color:rgb(247, 247, 247);text-shadow:0 0.5rem 0 #fff;opacity:",e=>e.disabled?.25:1,";");var fe={},Rn=zt;Object.defineProperty(fe,"__esModule",{value:!0});var at=fe.default=void 0,_n=Rn(At()),re=t,Dn=(0,_n.default)([(0,re.jsx)("path",{fillRule:"evenodd",d:"M16.67 13.13C18.04 14.06 19 15.32 19 17v3h4v-3c0-2.18-3.57-3.47-6.33-3.87z"},"0"),(0,re.jsx)("circle",{cx:"9",cy:"8",r:"4",fillRule:"evenodd"},"1"),(0,re.jsx)("path",{fillRule:"evenodd",d:"M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4c-.47 0-.91.1-1.33.24C14.5 5.27 15 6.58 15 8s-.5 2.73-1.33 3.76c.42.14.86.24 1.33.24zm-6 1c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"},"2")],"PeopleAlt");at=fe.default=Dn;const Bn=JSON.parse(`{
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
}`),On=["US","GB"];function $n({song:e,...n}){const s=Array.isArray(e.language)?e.language[0]:e.language,r=d.useMemo(()=>{var a;return e.artistOrigin?((a=Bn[e.artistOrigin.toLowerCase()])==null?void 0:a.includes(s))??!1:!1},[e.artistOrigin,s]);return t.jsx(t.Fragment,{children:r&&!On.includes(e.artistOrigin)?t.jsx(be,{isocode:e.artistOrigin,...n}):e.language!=="English"?t.jsx(be,{language:e.language,...n}):null})}const pe=e=>{const[n,s]=d.useState(null),r=qe(e),a=async()=>{s(await Ge(e))};return d.useEffect(()=>{a()},[r]),ee(I.songStatStored,a),n},qn=e=>async(n,s,r,a)=>{const o=qe(e),i=await Ge(e),l=i.scores.map(g=>{if(g.setup.id!==n)return g;const h=g.scores.map(m=>m.name!==r||m.score!==s?m:{name:a.trim(),score:s});return{...g,scores:h}}),c={...i,scores:l};await It(e,c),I.songScoreUpdated.dispatch(o,c,a.trim())},rt=({song:e,focused:n,video:s,children:r,index:a,handleClick:o,background:i=!0,expanded:l=!1,...c})=>{const g=d.useCallback(()=>o?o(a):void 0,[o,a]);return t.jsxs(Un,{...c,onClick:o?g:void 0,children:[i&&t.jsx(Kn,{style:{backgroundImage:`url('https://i3.ytimg.com/vi/${e.video}/hqdefault.jpg')`},focused:n,expanded:l}),t.jsxs(Hn,{expanded:l,children:[!l&&t.jsx(Yn,{song:e}),e.tracksCount>1&&!l&&t.jsxs(Wn,{"data-test":"multitrack-indicator",children:[t.jsx(at,{}),"  Duet"]}),t.jsx(xe,{expanded:l,children:e.artist}),t.jsx(te,{expanded:l,children:e.title}),t.jsxs(it,{expanded:l,children:[l&&t.jsxs(t.Fragment,{children:[e.author&&t.jsxs(ct,{expanded:l,children:["by ",e.authorUrl?t.jsx("a",{href:e.authorUrl,target:"_blank",rel:"noreferrer",children:e.author}):e.author]}),t.jsx(Xn,{song:e})]}),!l&&t.jsx(Gn,{song:e})]})]}),r,s]})},Gn=u($n,{target:"eqdpxtq10"})({name:"1w2zyc9",styles:"height:2.75rem;object-fit:cover;border-top-right-radius:1rem;position:absolute;z-index:-1;left:0rem;bottom:0rem;opacity:0.95"}),it=u("div",{target:"eqdpxtq9"})({name:"1dgv8bf",styles:"display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start"});var Vn={name:"1u0tp1t",styles:"align-items:flex-start;justify-content:flex-start"};const Hn=u("div",{target:"eqdpxtq8"})("width:100%;height:100%;display:flex;align-items:flex-end;justify-content:flex-end;z-index:1;box-sizing:border-box;flex-direction:column;",e=>e.expanded&&Vn,";"),Un=u("div",{target:"eqdpxtq7"})({name:"1s4n252",styles:"font-size:4.5rem;display:flex;align-items:flex-end;justify-content:flex-end;flex-direction:column;box-sizing:border-box;position:relative;padding:0.5rem;border:0.1rem black solid;border-radius:1rem"}),Kn=u("div",{target:"eqdpxtq6"})("background-color:",R.colors.text.inactive,";position:absolute;z-index:-1;inset:0;",e=>e.theme.graphicSetting==="high"?G("background-size:",e.focused?100:110,"%;",e.focused?"":"filter: grayscale(90%);"," ",e.expanded?"filter: blur(10px);":""," transition:300ms;opacity:",e.focused?1:.8,";",""):G("background-size:100%;opacity:",e.focused?1:.6,";","")," background-position:center center;"),ot=u("span",{target:"eqdpxtq5"})("background:rgba(0, 0, 0, 0.7);width:auto;display:inline-block;padding:0.5rem;",L,";text-align:right;font-size:",({expanded:e})=>e?"6rem":"2.7rem",";"),xe=u(ot,{target:"eqdpxtq4"})("color:",R.colors.text.active,";"),te=u(ot,{target:"eqdpxtq3"})("margin-top:",e=>e.expanded?"1.5rem":"0.5rem",";color:white;"),ct=u(te,{target:"eqdpxtq2"})({name:"5twmqz",styles:"font-size:3rem;margin-top:3rem"}),Yn=({song:e})=>{var a,o;const n=pe(e),s=((o=(a=n==null?void 0:n.scores)==null?void 0:a.at(-1))==null?void 0:o.date)??!1,r=s&&$(s).isAfter($().subtract(1,"days"));return n!=null&&n.plays?t.jsx(lt,{"data-test":"song-stat-indicator",children:r?"Played today":n.plays}):null},lt=u("div",{target:"eqdpxtq1"})({name:"ohpsts",styles:"position:absolute;top:0.5rem;right:0.5rem;padding:0 1rem;height:2.75rem;min-width:2.75rem;box-sizing:border-box;border-radius:5rem;color:white;background:rgba(0, 0, 0, 0.75);font-size:1.4rem;display:flex;align-items:center;justify-content:center;text-transform:uppercase"}),Wn=u(lt,{target:"eqdpxtq0"})({name:"sq8m9a",styles:"left:0.5rem;right:auto;svg{width:1.75rem;height:1.75rem;}"}),Xn=({song:e})=>{const n=pe(e);return t.jsx(ct,{children:n!=null&&n.plays?`Played ${n.plays} time${n.plays>1?"s":""}`:"Never played yet"})},we={[F.DUEL]:"Duel",[F.PASS_THE_MIC]:"Pass The Mic",[F.CO_OP]:"Cooperation"},ie=["Hard","Medium","Easy"],Jn=Ve("song_settings-game_mode-v3"),Qn=Ve("song_settings-tolerance-v2");function Zn({songPreview:e,onNextStep:n,keyboardControl:s,onExitKeyboardControl:r}){const[a,o]=Jn(null),i=a??(e.tracksCount>1?F.CO_OP:F.DUEL),[l,c]=Qn(1),g=()=>{const p={id:Ft(),players:[],mode:i,tolerance:l+1};n(p)},h=()=>{o(Lt(Object.values(F),i))},m=()=>c(p=>He(ie,p,-1)),{register:f}=Z({enabled:s,onBackspace:r});return t.jsxs(t.Fragment,{children:[t.jsx(ke,{...f("difficulty-setting",m,"Change difficulty"),label:"Difficulty",value:ie[l],"data-test-value":ie[l]}),t.jsx(ke,{...f("game-mode-setting",h,"Change mode"),label:"Mode",value:we[i],"data-test-value":we[i]}),t.jsxs(ts,{children:[i===F.DUEL&&"Face off against each other - person that earns more points wins.",i===F.CO_OP&&"Join forces and sing together - your points will be added up to a single pool.",i===F.PASS_THE_MIC&&t.jsxs(t.Fragment,{children:["For more than 2 players - split into groups and pass the microphone within the group when prompted with"," ",t.jsx(Nt,{})," symbol."]})]}),t.jsx(es,{...f("next-step-button",g,void 0,!0),children:"Next ➤"})]})}const es=u(H,{target:"e1xayinb2"})({name:"sr8dp2",styles:"padding:0.5rem 9rem;font-size:4.3rem;width:50rem"}),ts=u("h3",{target:"e1xayinb1"})({name:"rdh6te",styles:"max-width:50rem;margin:-1rem 0 1rem!important;padding:1.5rem;background:rgba(0, 0, 0, 0.7);box-sizing:border-box"}),ke=u(Ue,{target:"e1xayinb0"})({name:"1tcj19k",styles:"font-size:4.3rem;padding:1rem;min-width:50rem;box-sizing:border-box"});function ns(){const n=ge(I.playerInputChanged,()=>_.getInputs()).some(i=>i.source==="Microphone"),s=d.useRef([]),r=d.useCallback(i=>{s.current.push(i)},[]);Rt(0,50,r);const[a,o]=d.useState(!1);return d.useEffect(()=>{const i=setInterval(()=>{const l=s.current.filter(([,f])=>f===0),c=s.current.filter(([,f])=>f>0),g=l.reduce((f,[p])=>f+p,0)/(l.length+1),h=c.reduce((f,[p])=>f+p,0)/(c.length+1),m=c.length>l.length*.1&&h>.01&&g>.01&&h-g<g/2;o(m),s.current.length=0},a?5e3:2500);return()=>clearInterval(i)},[a]),t.jsxs(ss,{visible:a,children:[t.jsxs("h2",{children:[t.jsx("strong",{children:t.jsx(_t,{})})," ","Noise detected"]}),t.jsx("hr",{}),t.jsxs("h4",{children:["This might make singing inaccurate. Make sure your microphone doesn't pick up the music."," ",n&&t.jsxs(t.Fragment,{children:["Alternatively, use your ",t.jsx("strong",{children:"smartphone as a microphone"})," instead."]})]})]})}const ss=u("div",{target:"elv6o00"})("opacity:",e=>e.visible?1:0,";transition:300ms;background:rgba(0, 0, 0, 0.75);padding:1rem;max-width:50rem;position:relative;top:-1rem;left:-0.5rem;");function dt({player:e}){const n=nn(e.number);return t.jsxs(as,{"data-test":`indicator-player-${e.number}`,children:[t.jsx(Dt,{playerNumber:e.number}),t.jsx(sn,{status:n}),n!=="unavailable"&&t.jsx(Bt,{playerNumber:e.number}),t.jsx(rs,{className:"ph-no-capture",children:e.getName()})]},e.number)}const as=u("div",{target:"ey5ojlp1"})({name:"1gmoqr1",styles:"position:relative;border:0.1rem solid white;padding:1rem 3rem;background:black;width:80%;text-align:center;gap:1.25rem;font-size:2.3rem;color:white;-webkit-text-stroke:1px black"}),rs=u("span",{target:"ey5ojlp0"})({name:"179t5g5",styles:"position:relative;z-index:1"});function is(e){Ke(I.playerNameChanged),d.useEffect(()=>{Ye.startMonitoring()},[]);const s=ge(I.playerInputChanged,()=>_.getInputs()).some(r=>r.source!=="Dummy");return t.jsxs(os,{...e,children:[t.jsxs(cs,{children:["Microphone Check",s?_.getPlayers().map(r=>t.jsx(dt,{player:r},r.number)):t.jsxs(t.Fragment,{children:[t.jsx(ls,{children:"Mic not setup"}),t.jsx("h4",{children:"Singing will be emulated"}),t.jsx("h5",{children:"You can setup in the Next step"})]})]}),t.jsx(ns,{})]})}const os=u("div",{target:"e1b6ju672"})("display:flex;font-size:3rem;",L,";margin-bottom:8.6rem;gap:3.5rem;"),cs=u("div",{target:"e1b6ju671"})({name:"fmwdml",styles:"gap:1.25rem;display:flex;flex-direction:column;align-items:center"}),ls=u("div",{target:"e1b6ju670"})({name:"1x5xnlp",styles:"position:relative;border:0.1rem solid white;padding:1rem 3rem;background:black;width:80%;text-align:center;gap:1.25rem;font-size:2.3rem;color:white"}),ut=d.forwardRef(({options:e,focused:n,label:s,value:r,onChange:a,disabled:o,placeholder:i,keyboardNavigationChangeFocus:l,onBlur:c,className:g,...h},m)=>{const f=d.useRef(null);d.useImperativeHandle(m,()=>f.current);const p=d.useRef(null),[b,k]=d.useState(!1),[y,S]=d.useState(-1),w=d.useMemo(()=>e.filter(x=>x.toLowerCase().trim().includes(r.toLowerCase().trim())&&x!==r),[e,r]),v=x=>{var M,P,z;if(x.code==="ArrowUp"||x.code==="ArrowDown")if(w.length){x.preventDefault();const T=He(w,y,x.code==="ArrowUp"?-1:1);S(T);const N=(M=p.current)==null?void 0:M.querySelector(`[data-index="${T}"]`);N==null||N.scrollIntoView({behavior:"smooth",block:"center"})}else(P=f.current)==null||P.blur(),l==null||l(x.code==="ArrowUp"?-1:1);else if(x.code==="Enter"){const T=w[y];T?(S(-1),a(T)):(z=f.current)==null||z.blur()}},j=()=>{setTimeout(()=>{k(!1),c==null||c()},300)};return t.jsxs(ds,{className:g,children:[t.jsx($e,{onFocus:()=>k(!0),onBlur:j,onKeyDown:v,onChange:a,value:r,focused:n,label:s,disabled:o,ref:f,placeholder:i,...h}),b&&!!w.length&&t.jsx(us,{ref:p,role:"listbox",children:w.map((x,M)=>t.jsx(gs,{role:"listitem","data-index":M,"data-focused":M===y,focused:M===y,onClick:()=>{var P;a(x),S(-1),(P=f.current)==null||P.blur()},children:x},x))})]})}),ds=u("div",{target:"e1olyu0z2"})({name:"bjn8wh",styles:"position:relative"}),us=u("div",{target:"e1olyu0z1"})("margin-top:0.1em;position:absolute;width:100%;background:black;max-height:",(1+2*.3)*4,"em;overflow-y:auto;z-index:2;"),gs=u("div",{target:"e1olyu0z0"})(L,";padding:0.3em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:",e=>e.focused?R.colors.text.active:"white",";cursor:pointer;"),hs=(e,n)=>{var s;return((s=e[n])==null?void 0:s.name)??`Track ${n+1}`};function ms({multipleTracks:e,player:n,songPreview:s,playerNames:r,register:a,onChange:o,setup:i}){const[l,c]=d.useState(!1),g=d.useRef(null);if(Ke(I.playerNameChanged),n===void 0)return null;const h=()=>o({number:n.number,track:(i.track+1)%s.tracksCount}),m=b=>{c(!0),n.setName(b)},f=!l,p=n.getName();return t.jsxs(t.Fragment,{children:[t.jsx(fs,{maxLength:Ot,className:"ph-no-capture",value:f?"":p,placeholder:f?p:void 0,options:r,onChange:m,label:"Name:",ref:g,...a(`player-${n.number}-name`,()=>{var b;return(b=g.current)==null?void 0:b.focus()})}),e&&t.jsx(ps,{...a(`player-${n.number}-track-setting`,h,"Change track"),label:"Track",value:hs(s.tracks,i.track),"data-test-value":i.track+1})]})}const fs=u(ut,{target:"eilnc831"})("input{font-size:4.5rem;}[role='listbox']{max-height:",6*(4.5+.3),"rem;}"),ps=u(Ue,{target:"eilnc830"})({name:"1bwrnjg",styles:"font-size:4.5rem;padding:1.1rem"});function xs({songPreview:e,onNextStep:n,keyboardControl:s,onExitKeyboardControl:r}){const[a]=D(ue),[o]=D($t),i=_.getPlayers(),l=!a&&i.length===2&&e.tracksCount>1,c=()=>i.map((j,x)=>({number:j.number,track:l?Math.min(x,e.tracksCount-1):0})),[g,h]=d.useState(c());ee([I.playerAdded,I.playerRemoved],()=>h(c()));const m=i.map((j,x)=>g.find(M=>M.number===j.number)??c()[x]),f=d.useMemo(()=>JSON.parse(sessionStorage.getItem(We))??[],[]),p=j=>x=>{h(M=>M.map(P=>P.number===j?x:P))},[b,k]=d.useState(!1);d.useEffect(()=>{b||Ye.startMonitoring()},[b]);const{register:y,focusElement:S}=Z({enabled:s&&!b,onBackspace:r}),w=()=>{n(m)},v=!!o&&o!=="skip";return t.jsxs(t.Fragment,{children:[b&&t.jsx(an,{closeButtonText:v?"Continue to the song":"Continue to player setup",onClose:()=>{k(!1),v&&S("play")}}),m.map((j,x)=>t.jsxs(bs,{children:[t.jsxs(ys,{children:["Player ",x+1]}),t.jsx("div",{children:t.jsx(ms,{multipleTracks:l,player:_.getPlayer(j.number),setup:j,onChange:p(j.number),playerNames:f,register:y,songPreview:e})})]},j.number)),v&&t.jsx(Ee,{...y("play-song-button",w,void 0,!0),children:"Play"}),t.jsx(Ee,{...y("select-inputs-button",()=>k(!0),void 0,!1),children:"Setup mics"})]})}const bs=u("div",{target:"ee5oup2"})({name:"ho1qnd",styles:"display:flex;flex-direction:row"}),Ee=u(H,{target:"ee5oup1"})({name:"afgxf2",styles:"padding:0.5rem 9rem;font-size:4.3rem"}),ys=u("span",{target:"ee5oup0"})(L,";padding:1.3rem;font-size:4.5rem;");function Ss({songPreview:e,onPlay:n,keyboardControl:s,onExitKeyboardControl:r}){const[a,o]=d.useState(null),[i,l]=d.useState("song"),c=h=>{o(h),l("players")},g=h=>{if(!a)return;const m={...a,players:h};I.songStarted.dispatch(e,m),n({song:e,...m})};return t.jsxs(vs,{children:[t.jsx(is,{style:i==="players"?{viewTransitionName:"player-mic-check-container"}:void 0}),t.jsxs(js,{children:[i==="song"&&t.jsx(Zn,{songPreview:e,onNextStep:c,keyboardControl:s,onExitKeyboardControl:r}),i==="players"&&t.jsx(xs,{songPreview:e,onNextStep:g,keyboardControl:s,onExitKeyboardControl:()=>l("song")})]})]})}const vs=u("div",{target:"e1of12hx1"})({name:"k6gb66",styles:"display:flex;flex-direction:row;align-items:flex-end;justify-content:space-between;width:100%;hr{margin:1rem;opacity:0.25;}"}),js=u("div",{target:"e1of12hx0"})({name:"115sh08",styles:"width:auto;display:flex;flex-direction:column;align-items:flex-end;gap:1.25rem"}),ws=30;function ks({songPreview:e,top:n,left:s,width:r,height:a,keyboardControl:o,onExitKeyboardControl:i,onPlay:l,focusEffect:c}){const[g,h]=d.useState(!1),m=d.useRef(null),{width:f,height:p}=he(),b=o;d.useLayoutEffect(()=>{h(!1)},[e.video]);const k=e.previewStart??(e.videoGap??0)+60,y=e.previewEnd??k+ws,S=d.useMemo(()=>[e.video,k,y,e.volume],[e.video,k,y,e.volume]),[w,v,j,x]=qt(S,350);d.useEffect(()=>{var T;(T=m.current)==null||T.loadVideoById({videoId:w,startSeconds:v,endSeconds:j})},[w,m,v,j]);const M=b?f:r,P=b?p:a,z=b?Math.min(f/20*9,p*(4/5)):a;return d.useEffect(()=>{var T;(T=m.current)==null||T.setSize(M,P)},[M,P,o]),t.jsxs(t.Fragment,{children:[b&&t.jsx(Ps,{onClick:i}),!b&&g&&t.jsx(Ns,{width:M,height:P,left:s,top:n,song:e}),t.jsx(Ms,{background:b||g,video:t.jsx(As,{show:g,expanded:b,height:z,id:"preview-video-container",children:t.jsx(Gt,{width:0,height:0,disablekb:!0,ref:m,video:"",volume:x,onStateChange:T=>{var N,B;T===J.ENDED?((N=m.current)==null||N.seekTo(k),(B=m.current)==null||B.playVideo()):T===J.PLAYING&&h(!0)}})}),focused:!0,song:e,top:n,left:s,width:M,height:z,showVideo:g,expanded:b,"data-test":"song-preview","data-song":e.id,children:t.jsx(zs,{expanded:b,children:b&&t.jsx(Ss,{songPreview:e,onPlay:l,keyboardControl:o,onExitKeyboardControl:i})})})]})}var Es={name:"17gota2",styles:"border:0;border-radius:0;position:fixed;padding:var(--preview-padding)"};const Cs=u(rt,{target:"evapa6h4"})("--preview-padding:5rem;width:",e=>e.width,"px;height:",e=>e.height,"px;position:absolute;z-index:",e=>e.expanded?201:3,";overflow:hidden;visibility:",e=>e.expanded||e.showVideo?"visible":"hidden",";",e=>e.expanded?Es:G("pointer-events:none;",e.showVideo&&e.theme.graphicSetting==="high"?"animation: rhythmPulse 1s infinite":"scale: 1.2",";",""),";@keyframes rhythmPulse{0%{transform:scale(1.2);}15%{transform:scale(1.25);}100%{transform:scale(1.2);}}view-transition-name:song-preview;",xe,"{view-transition-name:song-preview-artist;}",te,"{view-transition-name:song-preview-title;}",it,"{view-transition-name:song-preview-expanded-data;}"),Ms=e=>{const n=e.song.realBpm??(e.song.bpm>300?e.song.bpm/4:e.song.bpm/2);return t.jsx(Cs,{style:{top:e.expanded?`calc(50vh - ${e.height}px / 2)`:e.top,left:e.expanded?0:e.left,animationDuration:`${60/n}s`},...e})},Ps=u("div",{target:"evapa6h3"})({name:"1iz7jdz",styles:"position:fixed;top:0;left:0;background:rgba(0, 0, 0, 0.8);width:100vw;height:100vh;z-index:201"});var Ts={name:"pfrwim",styles:"position:absolute;top:0;left:0;background-image:none!important;border-radius:0.5rem"};const As=u("div",{target:"evapa6h2"})(e=>e.expanded?G("position:fixed;inset:0;clip-path:inset(calc((100vh - ",e.height,"px) / 2) 0);",""):Ts," div{opacity:",({show:e})=>e?1:0,";transition:",({show:e,expanded:n})=>e||n?1e3:0,"ms;}"),zs=u("div",{target:"evapa6h1"})("inset:auto var(--preview-padding);position:fixed;z-index:100;",e=>!e.expanded&&"transform: scale(0.1);"," border-radius:0.5rem;view-transition-name:song-preview-content;"),Is=u("div",{target:"evapa6h0"})("background:white;width:",e=>e.width,"px;height:",e=>e.height,"px;z-index:2;top:0;left:0;position:absolute;animation:bpm 1s infinite;border-radius:0.5rem;pointer-events:none;@keyframes bpm{0%{transform:scale(1.15);opacity:1;}100%{transform:scale(1.45);opacity:0;}}"),Ns=e=>{const[n]=D(Te);if(n==="low")return null;const s=e.song.realBpm??(e.song.bpm>300?e.song.bpm/4:e.song.bpm/2);return t.jsx(Is,{width:e.width,height:e.height,style:{left:e.left,top:e.top,animationDuration:`${60/s}s`}})};let oe=0;function gt(){d.useEffect(()=>(document.body.classList.add("blockOverflow"),document.documentElement.classList.add("blockOverflow"),oe++,()=>{oe--,oe===0&&(document.body.classList.remove("blockOverflow"),document.documentElement.classList.remove("blockOverflow"))}),[])}const Fs=1.2,Ce=4;function Ls({onSongSelected:e,preselectedSong:n}){const[s]=D(ue),r=s?Ce-1:Ce;Xe(!1),Je(!0),gt();const[{previewTop:a,previewLeft:o,previewWidth:i,previewHeight:l},c]=d.useState({previewTop:0,previewLeft:0,previewWidth:0,previewHeight:0}),{focusedGroup:g,focusedSong:h,moveToSong:m,groupedSongList:f,keyboardControl:p,songPreview:b,setKeyboardControl:k,setFilters:y,filters:S,setShowFilters:w,showFilters:v,prefilteredList:j,isLoading:x}=En(n,r);Y(Oe,A=>{A.stopPropagation(),A.preventDefault(),y({search:A.key})},{enabled:!S.search&&p});const P=d.useCallback(A=>{p&&y({search:A})},[p]);ee(I.remoteSongSearch,P);const z=d.useRef(null),{width:T,handleResize:N}=he(),B=V(g),ne=V(h);d.useEffect(()=>{var O,U,K;const A=(xt,bt)=>`[data-group-letter="${xt}"] [data-index="${bt}"]`;N();const E=(O=z.current)==null?void 0:O.querySelector(A(B,ne)),C=(U=z.current)==null?void 0:U.querySelector(A(g,h));C&&((!E||E.offsetTop!==C.offsetTop)&&((K=C.scrollIntoView)==null||K.call(C,{behavior:"smooth",inline:"center",block:"center"})),c({previewLeft:C.offsetLeft,previewTop:C.offsetTop,previewWidth:C.offsetWidth,previewHeight:C.offsetHeight}))},[T,z,h,g,f]);const se=d.useCallback(()=>k(!1),[k]);return!f||!T?t.jsx(t.Fragment,{children:"Loading"}):x?t.jsx(Hs,{children:t.jsx(Qe,{size:"15em",color:"secondary"})}):t.jsxs(_s,{songsPerRow:r,children:[b&&t.jsx(Ds,{videoId:b.video}),S.search?t.jsx(An,{showFilters:v,onSongFiltered:y,filters:S}):t.jsx(Fn,{keyboardControl:p}),t.jsxs($s,{ref:z,active:p,"data-test":"song-list-container",dim:v,children:[f.length===0&&t.jsx(Os,{children:"No songs found"}),b&&t.jsx(ks,{songPreview:b,onPlay:e,keyboardControl:!p,onExitKeyboardControl:()=>k(!0),top:a,left:o,width:i,height:l,focusEffect:!v}),f.map(A=>d.createElement(Bs,{...v||!p?{"data-unfocusable":!0}:{},key:A.letter,"data-group-letter":A.letter,highlight:A.letter==="New"},t.jsx(ht,{children:A.letter}),t.jsx(qs,{children:A.songs.map(({song:E,index:C})=>t.jsx(Vs,{song:E,handleClick:h===C?se:m,focused:!v&&p&&C===h,index:C,"data-index":C,"data-focused":!v&&p&&C===h,"data-test":`song-${E.id}${A.isNew?"-new-group":""}`},E.id))}))),t.jsxs(Rs,{children:["Missing a song? Try ",t.jsx("a",{href:"/convert",children:"adding one"})," yourself!"]})]}),t.jsx(Mn,{setFilters:y,active:v,closePlaylist:w,prefilteredList:j})]})}const Rs=u("span",{target:"ef4zhl29"})(L,";text-align:center;font-size:5rem;margin-top:10rem;"),_s=u("div",{target:"ef4zhl28"})("display:flex;flex-direction:row;max-height:100vh;--song-list-gap:3.5rem;--song-item-width:",e=>`calc(${100/e.songsPerRow}% - ((${e.songsPerRow-1} / ${e.songsPerRow}) * var(--song-list-gap)))`,";--song-item-ratio:calc(16 / 9 * (4 / ",e=>e.songsPerRow,"));"),Ds=u(mn,{target:"ef4zhl27"})({name:"1i2rgvj",styles:"position:fixed;inset:0;width:100%;height:100%;filter:blur(5px) grayscale(90%);opacity:0.25;object-fit:cover"}),Bs=u("div",{target:"ef4zhl26"})("padding:0 4.5rem 0 11rem;",e=>e.highlight&&G("background:rgba(0, 0, 0, 0.5);padding-bottom:3rem;border-bottom:0.2rem solid black;",ht,"{animation:new-song-group-header 600ms ease-in-out infinite both;background:#ffffff;@keyframes new-song-group-header{0%,100%{transform:scale(1);}50%{transform:scale(1.1);}}}",""),";"),Os=u("div",{target:"ef4zhl25"})(L,";display:flex;align-items:center;justify-content:center;flex:1;font-size:10rem;"),ht=u("div",{target:"ef4zhl24"})(L,";display:inline-block;padding:0.5rem 1rem;margin-bottom:2rem;font-size:3.5rem;position:sticky;z-index:1;top:calc(-1 * var(--song-list-gap));color:",R.colors.text.active,";background:rgba(0, 0, 0, 0.7);"),$s=u("div",{target:"ef4zhl23"})("position:relative;flex:1 1 auto;display:flex;flex-direction:column;gap:var(--song-list-gap);padding:4.5rem 0;overflow-y:auto;overflow-x:clip;box-sizing:border-box;min-height:100vh;max-height:100vh;::-webkit-scrollbar{display:none;}transition:opacity 500ms;opacity:",e=>e.dim?.5:1,";"),qs=u("div",{target:"ef4zhl22"})({name:"bviq7b",styles:"display:flex;flex-direction:row;flex-wrap:wrap;gap:var(--song-list-gap)"});var Gs={name:"1jwmbuq",styles:"transition:300ms"};const Vs=d.memo(u(rt,{target:"ef4zhl21"})("cursor:pointer;flex-basis:var(--song-item-width);aspect-ratio:var(--song-item-ratio);",e=>e.theme.graphicSetting==="high"&&Gs," transform:scale(",e=>e.focused?Fs:1,");",e=>e.focused&&"z-index: 2;"," ",e=>e.focused&&Vt," content-visibility:auto;contain-intrinsic-size:calc(var(--song-item-width) * (1 / var(--song-item-ratio)));")),Hs=u("div",{target:"ef4zhl20"})({name:"101j4br",styles:"display:flex;align-items:center;justify-content:center;height:100vh"});function Us(e){const[n,s]=D(ze),[r,a]=d.useState(n===null),o=()=>{s(n??[]),a(!1)};return r?t.jsx(Ht,{onClose:o,closeText:"Continue to Song Selection"}):t.jsx(Ls,{...e})}function mt(){d.useEffect(()=>{try{document.body.requestFullscreen().catch(console.info)}catch{}},[])}const Ks=""+new URL("459342__papaninkasettratat__cinematic-music-short-RLBkkUq3.mp3",import.meta.url).href,q=e=>new Promise(n=>setTimeout(n,e)),ce=15;function Ys({onFinish:e}){const n=d.useRef(null),[s,r]=d.useState(!1),[a,o]=d.useState([]);ee(I.readinessConfirmed,c=>{o(g=>[...g,c])});const i=ge([I.inputListChanged,I.readinessConfirmed],()=>_.getPlayers().map((c,g)=>[c.input.deviceId,c.getName(),c]));d.useEffect(()=>{(async()=>{var f,p,b;let c=!1;const g=_.requestReadiness().then(()=>{c=!0,r(!0)}),h=q(1500),m=q(ce*1e3);await q(250),c||await((f=n==null?void 0:n.current)==null?void 0:f.play()),await Promise.race([Promise.all([g,h]),m]),(p=n==null?void 0:n.current)!=null&&p.paused||Ut.play(),await q(500),(b=n==null?void 0:n.current)==null||b.pause(),await q(1e3),e()})()},[]);const l=i.map(([c,g,h])=>({confirmed:a.includes(c),name:g,player:h}));return t.jsxs(t.Fragment,{children:[t.jsxs(Ws,{children:[!s&&t.jsxs("span",{children:["Waiting for all players to click ",t.jsx("strong",{children:'"Ready"'})]}),t.jsx(Js,{children:l.map(({confirmed:c,name:g,player:h},m)=>t.jsxs(Qs,{className:"ph-no-capture","data-test":"player-confirm-status","data-name":g,"data-confirmed":c,children:[!s&&t.jsx(Zs,{children:c?t.jsx(hn,{}):t.jsx(Qe,{color:"info",size:"1em"})})," ",t.jsx(dt,{player:h})]},m))}),!s&&t.jsxs(Xs,{children:["The song will start automatically in"," ",t.jsx("strong",{children:t.jsx(Ze,{end:0,start:ce,duration:ce,useEasing:!1})})]})]}),t.jsx("audio",{src:Ks,ref:n,hidden:!0,autoPlay:!1,onPlay:c=>{c.currentTarget.volume=.8}})]})}const Ws=u("div",{target:"e1sds9f4"})("top:0;left:0;z-index:1000;display:flex;align-items:center;justify-content:center;flex-direction:column;position:absolute;width:100%;height:100%;gap:5rem;font-size:5rem;",L,";"),Xs=u("span",{target:"e1sds9f3"})({name:"1umnjfm",styles:"font-size:5rem"}),Js=u("div",{target:"e1sds9f2"})({name:"1uxgijs",styles:"display:flex;flex-direction:column;gap:5rem;width:50rem;view-transition-name:player-mic-check-container"}),Qs=u("div",{target:"e1sds9f1"})({name:"174652e",styles:"display:flex;align-items:center;gap:2rem;transform:scale(1.5)"}),Zs=u("span",{target:"e1sds9f0"})({name:"1l5xwqu",styles:"svg{width:5rem;height:5rem;stroke:black;}"}),ea=250,le=(e,n=0,s=1/0)=>e.filter(et).filter(r=>tt([r])>=n).filter(r=>Q([r])<=s).reduce((r,a)=>r+a.notes.reduce((o,i)=>o+i.length,0),0),ta=(e,n)=>{const[s,...r]=e.filter(et),a=[[s]];return r.forEach(o=>{const i=a.at(-1),l=Q(i);(tt([o])-l)*n>ea?a.push([o]):i.push(o)}),a},ft=(e,n)=>e+n,Me=e=>{const n=e.map(s=>s.reduce(ft,0));return Math.max(...n)-Math.min(...n)},na=(e,n)=>{const s=rn(e),r=o=>{if(s[o-1].length<2)return;const i=s[o-1].pop();s[o].push(i)},a=o=>{var c;if(((c=s[o+1])==null?void 0:c.length)<2)return;const[i,...l]=s[o+1];s[o].push(i),s[o+1]=l};return n%2===1?r(Math.ceil(n/2)):a(Math.ceil(n/2)),s},sa=e=>e.reduce(ft,0);function aa(e){const s=Kt(e);return e.tracks.map(r=>{if(r.sections.length<3)return[];const a=ta(r.sections,s);let o=[],i=[le(a[0])];for(let l=0;l<a.length-2;l++){const c=a[o.flat().length-1]??[],h=le(r.sections,Q(c)??0)/(1+9-o.length),m=le(a[l+1]),f=sa(i);f+m<h?i=[...i,m]:h-f<f+m-h?(o.push(i),i=[m]):(o.push([...i,m]),i=[])}for(let l=0;l<100;l++){const c=Me(o),g=Yt((o.length-2)*2+2).map(p=>na(o,p)),h=g.map(Me),m=Math.min(...h);if(c<=m)break;const f=h.indexOf(m);o=g[f]}return o.map(l=>l.length).reduce((l,c)=>[...l,(l.at(-1)??0)+c],[]).map(l=>Q(a[l-1]))})}const Pe=[t.jsxs(t.Fragment,{children:["You can follow the updates and give feedback on the game through the Facebook Page:"," ",t.jsx("a",{href:"https://www.facebook.com/allkaraoke.party",target:"_blank",rel:"noreferrer",children:t.jsx("strong",{children:"fb.com/AllKaraoke.Party"})})]}),t.jsxs(t.Fragment,{children:["Start typing a name of a song in ",t.jsx("strong",{children:"Song Selection"})," to active Search feature"]}),t.jsxs(t.Fragment,{children:["Narrow down songs through ",t.jsx("strong",{children:"playlists"})," on the right in Song Selection"]}),t.jsxs(t.Fragment,{children:["Select ",t.jsx("strong",{children:"Pass The Mic"})," Game Mode to share the microphones and sing in a team"]}),t.jsxs(t.Fragment,{children:["Your scores and ",t.jsx("strong",{children:"stats are saved"})," in this browser - they will be available for the next party!"]}),t.jsxs(t.Fragment,{children:["You can remove irrelevant songs from the Song Selection in ",t.jsx("strong",{children:"Edit Songs"})," page"]}),t.jsxs(t.Fragment,{children:["If the game feels a bit jaggy with low FPS, check out ",t.jsx("strong",{children:"Settings"})," page"]}),t.jsxs(t.Fragment,{children:["Party is only getting started? Play ",t.jsx("strong",{children:"Jukebox"})," for the music and to see what songs are available"]}),t.jsxs(t.Fragment,{children:["Research shows that ",t.jsx("strong",{children:"duet songs"})," are that bit more fun than simple one-track ones"]}),t.jsxs(t.Fragment,{children:["Want to sing a ",t.jsx("strong",{children:"new song"}),"? Find UltraStar version of it and import it with",t.jsx("br",{}),t.jsx("strong",{children:"Convert Ultrastar .txt"})]}),t.jsxs(t.Fragment,{children:["The ",t.jsx("strong",{children:"white pulse"})," around selected song in Song Selection tries to match song's tempo"]}),t.jsxs(t.Fragment,{children:["Entire game (besides add/edit song) is navigable with ",t.jsx("strong",{children:"Keyboard"})]}),t.jsxs(t.Fragment,{children:["You can hide or show keyboard navigation help with ",t.jsx("kbd",{children:"H"})," key"]}),t.jsxs(t.Fragment,{children:["In Song Selection, hold ",t.jsx("kbd",{children:"↑"})," or ",t.jsx("kbd",{children:"↓"})," to jump to the next letter"]}),t.jsxs(t.Fragment,{children:["Add ",t.jsx("strong",{children:"vibrato"})," to the notes you sing to get additional ",t.jsx("strong",{children:"bonus points"})]}),t.jsxs(t.Fragment,{children:["You can control the game with your phone - click on the"," ",t.jsxs("strong",{children:[t.jsx(Wt,{}),"QR Code Icon"]})," ","on the top right and follow the instructions"]})],ra=({as:e="h4",...n})=>{const s=d.useRef(X(0,Pe.length-1)),r=e;return t.jsx(r,{...n,children:Pe[s.current]})};function ia({...e}){const[n,s]=d.useState(""),r=d.useRef(null);return d.useEffect(()=>{const a=setTimeout(()=>{s(me.getVideo())},1e3);return()=>{clearTimeout(a)}},[]),d.useEffect(()=>{try{r.current&&(r.current.playbackRate=16)}catch(a){Ae(a)}},[n]),t.jsx(oa,{...e,children:t.jsx(ca,{src:n,ref:r,loop:!0,autoPlay:!0,className:"ph-no-capture"})})}const oa=u("div",{target:"egk8upf1"})({name:"1g34f1k",styles:"width:80rem;height:60rem"}),ca=u("video",{target:"egk8upf0"})({name:"idj2s4",styles:"object-fit:cover;width:100%;height:100%"}),la=6,da=3;function ua({playerNumber:e,player:n,highestScore:s,highScores:r,singSetup:a,useColors:o=!0,revealHighScore:i,setAnimDone:l}){const c=nt(n.detailedScore[0]),g=h=>r.some(m=>m.singSetupId===a.id&&m.name===h);return t.jsxs(t.Fragment,{children:[t.jsx(pt,{color:o?R.colors.players[e].text:"","data-test":`player-${e}-name`,className:"ph-no-capture",children:n.name}),t.jsx("br",{}),t.jsxs(ga,{highscore:i&&g(n.name),color:o?R.colors.players[e].text:"",win:i&&c===s,"data-test":`player-${e}-score`,"data-score":c,children:[t.jsx(Ze,{end:c,formattingFn:on.format,onEnd:()=>l(e),duration:Math.max(da,c/Xt*la)}),t.jsx(ha,{highscore:i&&g(n.name),children:"High score!"})]}),t.jsx("br",{}),t.jsx("br",{})]})}const pt=u(Jt,{target:"e1hn1x412"})("padding-left:10rem;padding-right:10rem;font-size:3.5rem;color:",e=>e.color,";"),ga=u(pt,{target:"e1hn1x411"})("font-size:",e=>e.win?"10.5rem":"5.5rem",";color:",e=>e.win?R.colors.text.active:"white",";transition:400ms ease-in-out;position:relative;"),ha=u("span",{target:"e1hn1x410"})("position:absolute;top:-1.5rem;right:-10rem;font-size:3rem;-webkit-text-stroke:0.1rem black;color:",R.colors.text.default,";padding:0.5rem 1rem;border-radius:1.5rem;",e=>e.highscore&&Qt,";opacity:",e=>e.highscore?"1":"0",";transition:400ms;");function ma({onNextStep:e,players:n,highScores:s,singSetup:r}){de({accept:e});const a=d.useMemo(()=>({accept:"Next"}),[]);Le(a,!0);const o=r.mode===F.CO_OP,i=o?[{...n[0],name:n.map(f=>f.name).join(", ")}]:n,[l,c]=d.useState(i.map(()=>!1)),g=l.every(f=>f),h=i.map(f=>nt(f.detailedScore[0])),m=Math.max(...h);return t.jsxs(t.Fragment,{children:[t.jsx(fa,{children:i.map((f,p)=>t.jsx(ua,{playerNumber:f.playerNumber,useColors:!o,revealHighScore:g,setAnimDone:b=>c(k=>(k[b]=!0,[...k])),player:f,highScores:s,highestScore:m,singSetup:r},p))}),t.jsx(pa,{onClick:e,focused:!0,"data-test":"highscores-button",children:"Next"}),me.getPermissionStatus()&&t.jsx(xa,{})]})}const fa=u("div",{target:"ez8rfb42"})({name:"vqmv26",styles:"position:absolute;top:20rem;width:100%;text-align:center"}),pa=u(H,{target:"ez8rfb41"})({name:"dmbiod",styles:"position:absolute;bottom:4rem;right:2rem;width:40rem;font-size:1.9vw"}),xa=u(ia,{target:"ez8rfb40"})({name:"1c3jvq",styles:"position:absolute;top:calc(50% - 30rem);left:95rem;transform:scale(0.75)"});function ba(){return d.useMemo(()=>JSON.parse(sessionStorage.getItem(We))??[],[])}function ya({score:e,register:n,singSetupId:s,onSave:r,index:a}){const o=d.useRef(null),[i,l]=d.useState(""),c=ba(),g=()=>{i.trim().length&&i.trim()!==e.name&&r(s,e.score,e.name,i)};return t.jsx(ut,{className:"ph-no-capture",options:c,onChange:l,onBlur:g,value:i,label:"",ref:o,...n(`highscore-rename-${a}`,()=>{var h;return(h=o.current)==null?void 0:h.focus()}),placeholder:e.name,"data-test":"input-edit-highscore","data-original-name":e.name})}function Sa({onNextStep:e,highScores:n,singSetup:s,song:r}){const{register:a}=Z(),o=qn(r);return t.jsxs(t.Fragment,{children:[t.jsx(va,{"data-test":"highscores-container",children:n.map((i,l)=>t.jsxs(ja,{isCurrentSing:i.singSetupId===s.id,children:[t.jsx(wa,{children:l+1}),t.jsx(ka,{className:"ph-no-capture",children:i.singSetupId===s.id?t.jsx(ya,{index:l,score:i,register:a,singSetupId:s.id,onSave:o}):i.name}),t.jsx(Ea,{children:t.jsx(cn,{score:i.score})}),t.jsx(Ca,{children:$(i.date).format("MMMM DD, YYYY")})]},l))}),t.jsx(Ma,{...a("play-next-song-button",e,void 0,!0),children:"Select song"})]})}const va=u("div",{target:"e161j45v6"})({name:"9gtmjg",styles:"position:absolute;top:20rem;width:100%;text-align:center;padding:0 16rem;box-sizing:border-box"}),ja=u("div",{target:"e161j45v5"})("position:relative;",L,";font-size:3.2rem;display:flex;background:",e=>e.isCurrentSing?"rgba(0,0,0,.9)":"rgba(0,0,0,.5)",";margin-bottom:2rem;padding:",e=>e.isCurrentSing?"0 1.5rem":"1rem 3.2rem",";align-items:center;"),wa=u("div",{target:"e161j45v4"})("padding:0 1.6rem;color:",R.colors.text.active,";"),ka=u("div",{target:"e161j45v3"})({name:"1mbe2e5",styles:"text-align:left;flex:1;padding:1.6rem"}),Ea=u("div",{target:"e161j45v2"})({name:"2ycp6t",styles:"padding:0 1rem"}),Ca=u("div",{target:"e161j45v1"})({name:"1gbnj87",styles:"position:absolute;font-size:2rem;bottom:-1rem;right:-1.6rem;background:black;padding:0.5rem"}),Ma=u(H,{target:"e161j45v0"})({name:"dmbiod",styles:"position:absolute;bottom:4rem;right:2rem;width:40rem;font-size:1.9vw"});function Pa({song:e,width:n,height:s,onClickSongSelection:r,players:a,highScores:o,singSetup:i}){Xe(!0);const[l,c]=d.useState("results");return t.jsx(Zt,{songData:e,width:n,height:s,children:t.jsxs(Ta,{children:[l==="results"&&t.jsx(ma,{onNextStep:()=>c("highscores"),players:a,singSetup:i,highScores:o}),l==="highscores"&&t.jsx(Sa,{onNextStep:r,singSetup:i,highScores:o,song:e}),t.jsx(Aa,{active:!0})]})})}const Ta=u("div",{target:"ehc5trj1"})({name:"1quw0ni",styles:"pointer-events:auto"}),Aa=u(ra,{target:"ehc5trj0"})("transition:300ms;transform:scale(",({active:e})=>e?1:0,");position:absolute;bottom:20rem;font-size:3.2rem;line-height:1.25;color:white;text-align:center;background:rgba(0, 0, 0, 0.75);width:100%;box-sizing:border-box;padding:2rem 10rem;kbd{padding:0.12rem 0.9rem;border-radius:1rem;border:0.5rem solid rgb(204, 204, 204);border-bottom-color:rgb(150, 150, 150);border-right-color:rgb(150, 150, 150);color:rgb(51, 51, 51);line-height:1.4;display:inline-block;box-shadow:0 0.1rem 0 rgba(0, 0, 0, 0.2),inset 0 0 0 0.2rem #ffffff;background-color:rgb(247, 247, 247);text-shadow:0 0.1rem 0 #fff;font-weight:normal;}");function za(e,n){const s=pe(e);return d.useMemo(()=>s==null?void 0:s.scores.filter(({setup:a})=>a.mode===n.mode&&a.tolerance===n.tolerance).map(a=>a.scores.map(o=>({...o,date:a.date,singSetupId:a.setup.id}))).flat().sort((a,o)=>o.score-a.score).slice(0,5),[s,n])??[]}function Ia({song:e,width:n,height:s,onClickSongSelection:r,singSetup:a}){const o=za(e,a),i=d.useMemo(()=>_.getPlayers().map(l=>({name:l.getName(),playerNumber:l.number,detailedScore:W.getPlayerDetailedScore(l.number)})),[]);return t.jsx(Pa,{singSetup:a,song:e,width:n,height:s,onClickSongSelection:r,players:i,highScores:o})}function Na({songPreview:e,singSetup:n,returnToSongSelection:s,restartSong:r}){mt(),gt();const a=d.useRef(null),o=en(e.id),{width:i,height:l}=he(),[c,g]=d.useState(!1),[h,m]=d.useState(!0),[f,p]=d.useState(J.UNSTARTED),b=d.useMemo(()=>o.data?n.mode!==F.PASS_THE_MIC?o.data.tracks.map(()=>[]):aa(o.data):[],[o.data,n]),[k,y]=d.useState(!1);return Je(!k),d.useEffect(()=>{h&&o.data&&(k||f!==J.UNSTARTED)&&m(!1)},[o.data,k,f,h]),c&&o.data?t.jsx(Ia,{width:i,height:l,song:o.data,onClickSongSelection:s,singSetup:n}):t.jsxs(Fa,{children:[t.jsxs(La,{visible:h,children:[t.jsx(_a,{video:e.video,width:i,height:l}),t.jsx(Da,{children:e.artist}),t.jsx(Ba,{children:e.title}),t.jsx(Ys,{onFinish:()=>{var S;y(!0),(S=a.current)==null||S.play()}})]}),o.data&&t.jsx(ln,{ref:a,onStatusChange:p,playerChanges:b,players:n.players,song:o.data,width:i,height:l,autoplay:!1,onSongEnd:()=>{var w;const S=((w=W.getSingSetup())==null?void 0:w.mode)===F.CO_OP?[{name:_.getPlayers().map(v=>v.getName()).join(", "),score:W.getPlayerScore(0)}]:_.getPlayers().map(v=>({name:v.getName(),score:W.getPlayerScore(v.number)}));I.songEnded.dispatch(o.data,n,S),g(!0)},singSetup:n,restartSong:r})]})}const Fa=u("div",{target:"e1pnu1v94"})({name:"bjn8wh",styles:"position:relative"}),La=u("div",{target:"e1pnu1v93"})("position:fixed;top:0;left:0;z-index:10;pointer-events:none;background-color:black;view-transition-name:song-preview;opacity:",e=>e.visible?1:0,";transition:500ms;"),Ra=u("div",{target:"e1pnu1v92"})({name:"oux8x1",styles:"background-size:cover;background-position:center center;filter:blur(10px)"}),_a=e=>t.jsx(Ra,{style:{backgroundImage:`url('https://i3.ytimg.com/vi/${e.video}/hqdefault.jpg')`,width:`${e.width}px`,height:`${e.height}px`}}),Da=u(xe,{target:"e1pnu1v91"})({name:"oyknw4",styles:"view-transition-name:song-preview-artist;position:absolute;top:10rem;left:10rem;font-size:7rem"}),Ba=u(te,{target:"e1pnu1v90"})({name:"1l9juvo",styles:"view-transition-name:song-preview-title;position:absolute;font-size:8rem;top:19rem;left:10rem"});function qa(e){const[n,s]=d.useState(null),[r,a]=d.useState(e.songId??null),[o,i]=d.useState(0),l=c=>{document.getElementById("preview-video-container").style.viewTransitionName="song-preview-video",_e(()=>{document.getElementById("preview-video-container").style.viewTransitionName="",De.flushSync(()=>{s(c)})}),Be.play()};return mt(),t.jsx(t.Fragment,{children:n?t.jsx(Na,{restartSong:()=>{me.restartRecord(),i(c=>c+1)},songPreview:n.song,singSetup:n,returnToSongSelection:()=>{a(n.song.id),s(null)}},o):t.jsx(Us,{onSongSelected:l,preselectedSong:r})})}export{qa as default};
//# sourceMappingURL=Game-DSG9Zd4u.js.map
