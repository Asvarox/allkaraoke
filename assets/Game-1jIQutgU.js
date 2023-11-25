import{a1 as yt,a2 as vt,a3 as jt,c as wt,j as t,a4 as kt,r as d,a5 as D,a6 as ze,a0 as u,V as Et,a7 as Ae,a8 as Ie,a9 as Fe,W as $,aa as J,ab as Ne,ac as Ct,ad as Le,ae as ue,af as Re,ag as Be,ah as De,ai as Mt,aj as Pt,ak as _e,E as Oe,al as $e,am as ee,an as Tt,ao as R,ap as H,aq as N,ar as Y,as as qe,at as Ge,au as ge,K as zt,L as At,av as Se,aw as Ve,ax as te,ay as I,az as He,aA as It,z as G,aB as Ue,aC as L,aD as Ft,aE as Nt,aF as Lt,aG as Ke,aH as We,aI as he,aJ as Rt,aK as Bt,aL as B,aM as Dt,aN as _t,aO as Ye,aP as Xe,aQ as Ot,aR as $t,aS as Je,aT as me,aU as qt,aV as Gt,aW as Q,aX as Vt,U as Qe,S as Ze,aY as et,aZ as Ht,a_ as Ut,a$ as tt,b0 as Kt,b1 as Z,b2 as Wt,b3 as nt,b4 as st,b5 as Yt,b6 as fe,b7 as Xt,b8 as Jt,b9 as Qt,ba as Zt,bb as en,bc as tn,bd as X,be as nn}from"./index-0mTVJ_Ep.js";import{u as sn,a as V,b as an,P as rn,S as on,c as cn,f as ln,d as dn,e as un}from"./Player-HxntiOVj.js";function gn(e){var n=yt(e),s=n%1;return n===n?s?n-s:n:0}var hn=Math.ceil,mn=Math.max;function ye(e,n,s){(s?vt(e,n,s):n===void 0)?n=1:n=mn(gn(n),0);var r=e==null?0:e.length;if(!r||n<1)return[];for(var a=0,o=0,c=Array(hn(r/n));a<r;)c[o++]=jt(e,a,a+=n);return c}const fn=wt(t.jsx("path",{d:"M16.59 7.58 10 14.17l-3.59-3.58L5 12l5 5 8-8zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"}),"CheckCircleOutline");function at({videoId:e,...n}){return t.jsx(Sn,{src:`https://img.youtube.com/vi/${e}/default.jpg`,alt:`Thumbnail image for YouTube video ${e}`,...n})}function pn({videoId:e,...n}){const s=kt(e)??e,[r,a]=d.useState(!0);d.useLayoutEffect(()=>{a(c=>!c)},[e]);const[o]=D(ze);return o==="low"?null:t.jsxs(xn,{...n,children:[t.jsx(ve,{videoId:r?e:s,visible:r}),t.jsx(ve,{videoId:r?s:e,visible:!r}),t.jsx(bn,{videoId:s})]})}const xn=u("div",{target:"e1x06a543"})({name:"k44s62",styles:"position:relative;overflow:hidden;background:black"}),bn=u(at,{target:"e1x06a542"})({name:"6dhm9o",styles:"visibility:hidden"}),ve=u(at,{target:"e1x06a541"})("position:absolute;transition:opacity 300ms;opacity:",e=>e.visible?1:0,";"),Sn=u("img",{target:"e1x06a540"})({name:"4uwt2b",styles:"width:100%;height:100%;object-fit:cover"}),re={language:(e,n)=>n===""?e:e.filter(s=>(Array.isArray(s.language)?s.language:[s.language]).includes(n)),excludeLanguages:(e,n=[])=>n.length===0?e:e.filter(s=>!(Array.isArray(s.language)?s.language:[s.language]).every(a=>n.includes(a))),search:(e,n)=>{const s=Fe(n);return s.length?e.filter(r=>r.search.includes(s)):e},duet:(e,n)=>n===null?e:e.filter(s=>n?s.tracksCount>1:s.tracksCount===1),yearBefore:(e,n)=>n?e.filter(s=>Number(s.year)<n):e,yearAfter:(e,n)=>n?e.filter(s=>Number(s.year)>=n):e,updatedAfter:(e,n)=>{if(!n)return e;const s=$(n);return e.filter(r=>r.lastUpdate&&$(r.lastUpdate).isAfter(s))}},je=(e,n)=>Fe((n==null?void 0:n.search)??"").length?re.search(e,n.search):Object.entries(n).filter(s=>s[0]in re).reduce((s,[r,a])=>re[r](s,a),e),yn=e=>d.useMemo(()=>sn(["",...e.map(n=>n.language??"Unknown")].flat()),[e]),vn=e=>{const n=yn(e),[s]=D(Ie),[r,a]=d.useState({excludeLanguages:s??[]}),o=d.useDeferredValue(r),c=d.useMemo(()=>je(e,{excludeLanguages:s??[]}),[e,s]),l=d.useMemo(()=>je(e,{...o,excludeLanguages:s??[]}),[e,o,s]),i={language:{current:r.language??"",available:n},status:{allSongs:e.length,visible:l.length}};return{filters:r,filteredList:l,filtersData:i,prefilteredList:c,setFilters:a}};function jn(){const e=Et(),{filters:n,filtersData:s,filteredList:r,prefilteredList:a,setFilters:o}=vn(e.data),c=d.useMemo(()=>{if(r.length===0)return[];const l=[];if(!n.search){const i=r.filter(g=>g.isNew);i.length&&l.push({letter:"New",isNew:!0,songs:i.map(g=>({song:g,index:r.indexOf(g)}))})}return r.forEach((i,g)=>{try{const h=isFinite(+i.artist[0])?"0-9":i.artist[0].toUpperCase();let m=l.find(f=>f.letter===h);m||(m={letter:h,songs:[]},l.push(m)),m.songs.push({index:g,song:i})}catch(h){console.error(h),Ae(h)}}),l},[r,n.search]);return{prefilteredList:a,groupedSongList:c,songList:r,filtersData:s,filters:n,setFilters:o,isLoading:e.isLoading}}const wn=30;function kn(e,n,s=wn){let r;if(n.length<e){const a=[...Array(e).keys()].filter(o=>!n.includes(o));r=a[J(0,a.length-1)]}else r=J(0,e-1),n.length=0;return n.length>=s&&n.shift(),n.push(r),r}const En=(e=[],n)=>{var k;const[s,r]=d.useState([0,0]),a=d.useMemo(()=>e.map(({songs:S})=>ye(S.map(y=>y.index),n)).flat(),[e]),o=d.useMemo(()=>e.map(({songs:S,letter:y})=>ye(S.map(()=>y),n)).flat(),[e]),c=V(a??[]),l=s[0]===((k=a[s[1]])==null?void 0:k.length)-1,i=d.useCallback(S=>{var v;const y=a.findIndex(j=>j.includes(S)),w=(v=a[y])==null?void 0:v.indexOf(S);w>=0&&y>=0?r([w??0,y??0]):r([0,0])},[a]),g=([S,y],w,v)=>{var b;if(e.length===0)return v;const j=w[y];return(j==null?void 0:j[S])??(j==null?void 0:j.at(-1))??((b=w==null?void 0:w[0])==null?void 0:b[0])??v},h=([S,y],w=a)=>g([S,y],w,0),m=([S,y],w=o)=>g([S,y],w,"A");d.useEffect(()=>{const S=h(s,c),y=h(s,a);c.length&&S!==y&&i(S)},[s,a,c,l]);const f=(S,y)=>{Le.play(),r(([w,v])=>{let j=w,b=v;if(S==="y")b=v+y;else{if(a[v]===void 0)debugger;const M=a[v].length-1;j=Math.min(w,M)+y,j<0?(b=(a.length+v-1)%a.length,j=a[b].length-1):j>M&&(b=v+1,j=0)}return[j%n,(a.length+b)%a.length]})},p=h(s),x=m(s);return De([p,x,s,f,i,l])},Cn=(e,n=[],s,r,a,o)=>{const c=Ne(),[l,i]=d.useState([!1,null]),g=V(l),[h,m]=l,[f,p,x,k,S,y]=En(n,o),w=x[0]===0,v=()=>{Mt.play(),s()},[j,b]=d.useState(!1),M=V(a.search);d.useLayoutEffect(()=>{if(M&&!a.search){b(!0);const E=setTimeout(()=>b(!1),2e3);return()=>{clearTimeout(E),b(!1)}}},[a.search]);const P=()=>{!j&&!a.search&&(Pt.play(),c("/"))},A=d.useCallback(Ct((E,C)=>{const O=(n.length+C+E)%n.length;S(n[O].songs[0].index),Le.play()},700,{trailing:!1}),[n]),T=(E,C)=>{if(!(E!=null&&E.repeat))k("y",C);else{const O=n.findIndex(U=>!!U.songs.find(K=>K.index===f));A(C,O)}},F=(E,C=!1)=>{!C&&E===-1&&w&&!h?i([!0,"left"]):k("x",E)},_=d.useRef([]),se=()=>{const E=kn(r,_.current);S(E)};ue({accept:v,down:E=>T(E,1),up:E=>T(E,-1),left:()=>F(-1),right:()=>F(1),back:P,random:()=>{se(),Re.capture("selectRandom")}},e&&!h,[n,x,h,a,j]);const ae=d.useMemo(()=>({"horizontal-vertical":null,accept:null,back:null,shiftR:null,remote:["search"]}),[]);Be(ae,e);const z=d.useCallback(E=>{i([!1,E])},[i,F,n,x]);return d.useLayoutEffect(()=>{const[E,C]=g;E&&!h&&C===m&&F(m==="right"?1:-1,!0)},[h,m,w,y,...x]),De([f,p,S,h,z])};function Mn(e,n){const{songList:s,prefilteredList:r,groupedSongList:a,filtersData:o,setFilters:c,filters:l,isLoading:i}=jn(),g=Ne(),[h,m]=d.useState(!0),f=b=>{_e(()=>{Oe.flushSync(()=>{m(b)})}),$e.play()},[p,x,k,S,y]=Cn(h,a,()=>f(!1),s.length,l,n),[w,v]=d.useState(!1);d.useEffect(()=>{if(!w&&s.length){const b=s.findIndex(A=>A.id===e),M=s.findIndex(A=>A.isNew);let P=J(0,s.length-1);(b>-1||M>-1)&&(P=b),k(P),v(!0)}},[s,k,e]),d.useEffect(()=>{w&&s.length&&s[p]&&g(`/game/${encodeURIComponent(s[p].id)}`,{replace:!0,smooth:!1})},[w,p,s]);const j=s==null?void 0:s[p];return{prefilteredList:r,groupedSongList:a,focusedSong:p,focusedGroup:x,moveToSong:k,setKeyboardControl:f,keyboardControl:h,songPreview:j,songList:s??[],filtersData:o,filters:l,setFilters:c,showFilters:S,setShowFilters:y,isLoading:i}}const Pn=e=>{const n=Tt(e);return d.useMemo(()=>[{name:"All",filters:{}},{name:n[0].name,filters:{language:n[0].name}},n[1]?{name:n[1].name,filters:{language:n[1].name}}:null,{name:"Classics",filters:{yearBefore:1995}},{name:"Modern",filters:{yearAfter:1995}},{name:"Duets",filters:{duet:!0}},{name:"New",filters:{updatedAfter:$().subtract(31,"days").toISOString()}}].filter(s=>s!==null),[n])};function Tn({setFilters:e,active:n,closePlaylist:s,prefilteredList:r}){const a=Pn(r),{register:o,focused:c,focusElement:l}=ee({enabled:n,additionalHelp:{vertical:void 0,"horizontal-vertical":null}});return d.useEffect(()=>{if(c){const i=a.find(g=>`playlist-${g.name}`===c);i&&e(i.filters)}},[c,a]),ue({left:()=>s("left"),right:()=>s("right")},n),t.jsx(zn,{"data-test":"song-list-playlists",active:n,children:a.map(i=>t.jsx(An,{active:n,...o(`playlist-${i.name}`,()=>l(`playlist-${i.name}`)),...n?{}:{selected:`playlist-${i.name}`===c},children:i.name},i.name))})}const zn=u("div",{target:"e1amx3cg1"})("background:rgba(0, 0, 0, ",e=>e.active?.75:.5,");width:100vh;transform-origin:top right;transform:rotate(-90deg);position:absolute;left:-100vh;top:0;font-size:3.6rem;box-sizing:border-box;display:flex;flex-direction:row-reverse;h2{",R,";margin:0;}"),An=u(H,{target:"e1amx3cg0"})("font-size:3rem;flex:1;",e=>!e.focused&&e.active&&"background-color: transparent;",";padding:1.5rem;",e=>e.selected?`box-shadow: inset 0px 0px 0px 4px ${N.colors.text.active};`:!e.active&&"opacity: .5;",";");function In({onSongFiltered:e,filters:n}){const s=d.useRef(null),[r,a]=d.useState(!1);Y("down",()=>{var i;(i=s.current)==null||i.blur()},{enabled:r,enableOnTags:["INPUT"]});const c=i=>{var h,m;const g=((h=n.search)==null?void 0:h.length)??0;g>1?e({...n,search:" "}):g===0&&i&&e({...n,search:i}),(m=s.current)==null||m.focus()};Y(qe,i=>{c(i.key)},{enabled:!r}),Y("Backspace",i=>{c()},{enabled:!r});const l=i=>{e({...n,search:i.trim()})};return d.useEffect(()=>{var i;(i=s.current)==null||i.focus()},[s]),t.jsx(Fn,{"data-test":"song-list-search",children:t.jsx(Nn,{large:!0,children:t.jsx("form",{"data-test":"filters-search-form",onSubmit:i=>{var g;i.preventDefault(),(g=s.current)==null||g.blur()},children:t.jsx(Ge,{onFocus:()=>a(!0),onBlur:()=>a(!1),focused:r,label:"Search",value:n.search??"",onChange:l,ref:s,"data-test":"filters-search"})})})})}const Fn=u("div",{target:"e1vw0lol1"})({name:"t46wvs",styles:"background:rgba(0, 0, 0, 0.7);padding:2rem;font-size:3rem;box-sizing:border-box;display:flex;flex-direction:row;gap:2rem;position:fixed;z-index:200;top:4.5rem;left:30rem;right:30rem"}),Nn=u("div",{target:"e1vw0lol0"})("flex:",e=>e.large?1.5:1,";"),Ln=1e4;function Rn({keyboardControl:e}){const[n,s]=d.useState(!1);d.useEffect(()=>{if(!e)s(!1);else{const a=setTimeout(()=>s(!0),Ln);return()=>clearTimeout(a)}},[e]);const[r]=D(ge);return r?null:t.jsxs(Bn,{visible:n,children:["Can't decide? Click ",t.jsx(we,{children:"Shift"})," + ",t.jsx(we,{children:"R"})," to pick random song"]})}const Bn=u("div",{target:"e5qasxu1"})("@keyframes shake{2.5%,22.5%{transform:translate3d(-0.1rem, 0, 0);}5%,20%{transform:translate3d(0.2rem, 0, 0);}7.5%,12.5%,17.5%{transform:translate3d(-0.4rem, 0, 0);}10%,15%{transform:translate3d(0.4rem, 0, 0);}}animation:shake 5s both infinite;",R,";pointer-events:none;position:fixed;transform:scale(",e=>e.visible?1:0,");opacity:",e=>e.visible?1:0,";text-align:center;font-size:4.8rem;text-shadow:0 0 3.5rem black,0 0 3.5rem black,0 0 3.5rem black,0 0 3.5rem black,0 0 3.5rem black,0 0 3.5rem black,0 0 3.5rem black;width:100%;z-index:4;padding:2.5rem;transition:ease 500ms;"),we=u("kbd",{target:"e5qasxu0"})("margin:0.1rem;padding:0.2rem 2rem;border-radius:1.5rem;border:0.6rem solid rgb(204, 204, 204);border-bottom-color:rgb(150, 150, 150);border-right-color:rgb(150, 150, 150);line-height:1.4;display:inline-block;background-color:rgb(247, 247, 247);text-shadow:0 0.5rem 0 #fff;opacity:",e=>e.disabled?.25:1,";");var pe={},Dn=At;Object.defineProperty(pe,"__esModule",{value:!0});var rt=pe.default=void 0,_n=Dn(zt()),ie=t,On=(0,_n.default)([(0,ie.jsx)("path",{fillRule:"evenodd",d:"M16.67 13.13C18.04 14.06 19 15.32 19 17v3h4v-3c0-2.18-3.57-3.47-6.33-3.87z"},"0"),(0,ie.jsx)("circle",{cx:"9",cy:"8",r:"4",fillRule:"evenodd"},"1"),(0,ie.jsx)("path",{fillRule:"evenodd",d:"M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4c-.47 0-.91.1-1.33.24C14.5 5.27 15 6.58 15 8s-.5 2.73-1.33 3.76c.42.14.86.24 1.33.24zm-6 1c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"},"2")],"PeopleAlt");rt=pe.default=On;const $n=JSON.parse(`{
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
}`),qn=["US","GB"];function Gn({song:e,...n}){const s=Array.isArray(e.language)?e.language[0]:e.language,r=d.useMemo(()=>{var a;return e.artistOrigin?((a=$n[e.artistOrigin.toLowerCase()])==null?void 0:a.includes(s))??!1:!1},[e.artistOrigin,s]);return t.jsx(t.Fragment,{children:r&&!qn.includes(e.artistOrigin)?t.jsx(Se,{isocode:e.artistOrigin,...n}):e.language!=="English"?t.jsx(Se,{language:e.language,...n}):null})}const xe=e=>{const[n,s]=d.useState(null),r=Ve(e),a=async()=>{s(await He(e))};return d.useEffect(()=>{a()},[r]),te(I.songStatStored,a),n},Vn=e=>async(n,s,r,a)=>{const o=Ve(e),c=await He(e),l=c.scores.map(g=>{if(g.setup.id!==n)return g;const h=g.scores.map(m=>m.name!==r||m.score!==s?m:{name:a.trim(),score:s});return{...g,scores:h}}),i={...c,scores:l};await It(e,i),I.songScoreUpdated.dispatch(o,i,a.trim())},it=({song:e,focused:n,video:s,children:r,index:a,handleClick:o,background:c=!0,expanded:l=!1,...i})=>{const g=d.useCallback(()=>o?o(a):void 0,[o,a]);return t.jsxs(Wn,{...i,onClick:o?g:void 0,children:[c&&t.jsx(Yn,{style:{backgroundImage:`url('https://i3.ytimg.com/vi/${e.video}/hqdefault.jpg')`},focused:n,expanded:l}),t.jsxs(Kn,{expanded:l,children:[!l&&t.jsx(Xn,{song:e}),e.tracksCount>1&&!l&&t.jsxs(Jn,{"data-test":"multitrack-indicator",children:[t.jsx(rt,{}),"  Duet"]}),t.jsx(be,{expanded:l,children:e.artist}),t.jsx(ne,{expanded:l,children:e.title}),t.jsxs(ot,{expanded:l,children:[l&&t.jsxs(t.Fragment,{children:[e.author&&t.jsxs(lt,{expanded:l,children:["by ",e.authorUrl?t.jsx("a",{href:e.authorUrl,target:"_blank",rel:"noreferrer",children:e.author}):e.author]}),t.jsx(Qn,{song:e})]}),!l&&t.jsx(Hn,{song:e})]})]}),r,s]})},Hn=u(Gn,{target:"eqdpxtq10"})({name:"1w2zyc9",styles:"height:2.75rem;object-fit:cover;border-top-right-radius:1rem;position:absolute;z-index:-1;left:0rem;bottom:0rem;opacity:0.95"}),ot=u("div",{target:"eqdpxtq9"})({name:"1dgv8bf",styles:"display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start"});var Un={name:"1u0tp1t",styles:"align-items:flex-start;justify-content:flex-start"};const Kn=u("div",{target:"eqdpxtq8"})("width:100%;height:100%;display:flex;align-items:flex-end;justify-content:flex-end;z-index:1;box-sizing:border-box;flex-direction:column;",e=>e.expanded&&Un,";"),Wn=u("div",{target:"eqdpxtq7"})({name:"1s4n252",styles:"font-size:4.5rem;display:flex;align-items:flex-end;justify-content:flex-end;flex-direction:column;box-sizing:border-box;position:relative;padding:0.5rem;border:0.1rem black solid;border-radius:1rem"}),Yn=u("div",{target:"eqdpxtq6"})("background-color:",N.colors.text.inactive,";position:absolute;z-index:-1;inset:0;",e=>e.theme.graphicSetting==="high"?G("background-size:",e.focused?100:110,"%;",e.focused?"":"filter: grayscale(90%);"," ",e.expanded?"filter: blur(10px);":""," transition:300ms;opacity:",e.focused?1:.8,";",""):G("background-size:100%;opacity:",e.focused?1:.6,";","")," background-position:center center;"),ct=u("span",{target:"eqdpxtq5"})("background:rgba(0, 0, 0, 0.7);width:auto;display:inline-block;padding:0.5rem;",R,";text-align:right;font-size:",({expanded:e})=>e?"6rem":"2.7rem",";"),be=u(ct,{target:"eqdpxtq4"})("color:",N.colors.text.active,";"),ne=u(ct,{target:"eqdpxtq3"})("margin-top:",e=>e.expanded?"1.5rem":"0.5rem",";color:white;"),lt=u(ne,{target:"eqdpxtq2"})({name:"5twmqz",styles:"font-size:3rem;margin-top:3rem"}),Xn=({song:e})=>{var a,o;const n=xe(e),s=((o=(a=n==null?void 0:n.scores)==null?void 0:a.at(-1))==null?void 0:o.date)??!1,r=s&&$(s).isAfter($().subtract(1,"days"));return n!=null&&n.plays?t.jsx(dt,{"data-test":"song-stat-indicator",children:r?"Played today":n.plays}):null},dt=u("div",{target:"eqdpxtq1"})({name:"ohpsts",styles:"position:absolute;top:0.5rem;right:0.5rem;padding:0 1rem;height:2.75rem;min-width:2.75rem;box-sizing:border-box;border-radius:5rem;color:white;background:rgba(0, 0, 0, 0.75);font-size:1.4rem;display:flex;align-items:center;justify-content:center;text-transform:uppercase"}),Jn=u(dt,{target:"eqdpxtq0"})({name:"sq8m9a",styles:"left:0.5rem;right:auto;svg{width:1.75rem;height:1.75rem;}"}),Qn=({song:e})=>{const n=xe(e);return t.jsx(lt,{children:n!=null&&n.plays?`Played ${n.plays} time${n.plays>1?"s":""}`:"Never played yet"})},ke={[L.DUEL]:"Duel",[L.PASS_THE_MIC]:"Pass The Mic",[L.CO_OP]:"Cooperation"},oe=["Hard","Medium","Easy"],Zn=Ue("song_settings-game_mode-v3"),es=Ue("song_settings-tolerance-v2");function ts({songPreview:e,onNextStep:n,keyboardControl:s,onExitKeyboardControl:r}){const[a,o]=Zn(null),c=a??(e.tracksCount>1?L.CO_OP:L.DUEL),[l,i]=es(1),g=()=>{const p={id:Nt(),players:[],mode:c,tolerance:l+1};n(p)},h=()=>{o(Lt(Object.values(L),c))},m=()=>i(p=>Ke(oe,p,-1)),{register:f}=ee({enabled:s,onBackspace:r});return t.jsxs(t.Fragment,{children:[t.jsx(Ee,{...f("difficulty-setting",m,"Change difficulty"),label:"Difficulty",value:oe[l],"data-test-value":oe[l]}),t.jsx(Ee,{...f("game-mode-setting",h,"Change mode"),label:"Mode",value:ke[c],"data-test-value":ke[c]}),t.jsxs(ss,{children:[c===L.DUEL&&"Face off against each other - person that earns more points wins.",c===L.CO_OP&&"Join forces and sing together - your points will be added up to a single pool.",c===L.PASS_THE_MIC&&t.jsxs(t.Fragment,{children:["For more than 2 players - split into groups and pass the microphone within the group when prompted with"," ",t.jsx(Ft,{})," symbol."]})]}),t.jsx(ns,{...f("next-step-button",g,void 0,!0),children:"Next ➤"})]})}const ns=u(H,{target:"e1xayinb2"})({name:"sr8dp2",styles:"padding:0.5rem 9rem;font-size:4.3rem;width:50rem"}),ss=u("h3",{target:"e1xayinb1"})({name:"rdh6te",styles:"max-width:50rem;margin:-1rem 0 1rem!important;padding:1.5rem;background:rgba(0, 0, 0, 0.7);box-sizing:border-box"}),Ee=u(We,{target:"e1xayinb0"})({name:"1tcj19k",styles:"font-size:4.3rem;padding:1rem;min-width:50rem;box-sizing:border-box"});function as(){const n=he(I.playerInputChanged,()=>B.getInputs()).some(c=>c.source==="Microphone"),s=d.useRef([]),r=d.useCallback(c=>{s.current.push(c)},[]);Rt(0,50,r);const[a,o]=d.useState(!1);return d.useEffect(()=>{const c=setInterval(()=>{const l=s.current.filter(([,f])=>f===0),i=s.current.filter(([,f])=>f>0),g=l.reduce((f,[p])=>f+p,0)/(l.length+1),h=i.reduce((f,[p])=>f+p,0)/(i.length+1),m=i.length>l.length*.1&&h>.01&&g>.01&&h-g<g/2;o(m),s.current.length=0},a?5e3:2500);return()=>clearInterval(c)},[a]),t.jsxs(rs,{visible:a,children:[t.jsxs("h2",{children:[t.jsx("strong",{children:t.jsx(Bt,{})})," ","Noise detected"]}),t.jsx("hr",{}),t.jsxs("h4",{children:["This might make singing inaccurate. Make sure your microphone doesn't pick up the music."," ",n&&t.jsxs(t.Fragment,{children:["Alternatively, use your ",t.jsx("strong",{children:"smartphone as a microphone"})," instead."]})]})]})}const rs=u("div",{target:"elv6o00"})("opacity:",e=>e.visible?1:0,";transition:300ms;background:rgba(0, 0, 0, 0.75);padding:1rem;max-width:50rem;position:relative;top:-1rem;left:-0.5rem;");function ut({player:e}){const n=an(e.number);return t.jsxs(is,{"data-test":`indicator-player-${e.number}`,children:[t.jsx(Dt,{playerNumber:e.number}),t.jsx(rn,{status:n}),n!=="unavailable"&&t.jsx(_t,{playerNumber:e.number}),t.jsx(os,{className:"ph-no-capture",children:e.getName()})]},e.number)}const is=u("div",{target:"ey5ojlp1"})({name:"1gmoqr1",styles:"position:relative;border:0.1rem solid white;padding:1rem 3rem;background:black;width:80%;text-align:center;gap:1.25rem;font-size:2.3rem;color:white;-webkit-text-stroke:1px black"}),os=u("span",{target:"ey5ojlp0"})({name:"179t5g5",styles:"position:relative;z-index:1"});function cs(e){Ye(I.playerNameChanged),d.useEffect(()=>{Xe.startMonitoring()},[]);const s=he(I.playerInputChanged,()=>B.getInputs()).some(r=>r.source!=="Dummy");return t.jsxs(ls,{...e,children:[t.jsxs(ds,{children:["Microphone Check",s?B.getPlayers().map(r=>t.jsx(ut,{player:r},r.number)):t.jsxs(t.Fragment,{children:[t.jsx(us,{children:"Mic not setup"}),t.jsx("h4",{children:"Singing will be emulated"}),t.jsx("h5",{children:"You can setup in the Next step"})]})]}),t.jsx(as,{})]})}const ls=u("div",{target:"e1b6ju672"})("display:flex;font-size:3rem;",R,";margin-bottom:8.6rem;gap:3.5rem;"),ds=u("div",{target:"e1b6ju671"})({name:"fmwdml",styles:"gap:1.25rem;display:flex;flex-direction:column;align-items:center"}),us=u("div",{target:"e1b6ju670"})({name:"1x5xnlp",styles:"position:relative;border:0.1rem solid white;padding:1rem 3rem;background:black;width:80%;text-align:center;gap:1.25rem;font-size:2.3rem;color:white"}),gt=d.forwardRef(({options:e,focused:n,label:s,value:r,onChange:a,disabled:o,placeholder:c,keyboardNavigationChangeFocus:l,onBlur:i,className:g,...h},m)=>{const f=d.useRef(null);d.useImperativeHandle(m,()=>f.current);const p=d.useRef(null),[x,k]=d.useState(!1),[S,y]=d.useState(-1),w=d.useMemo(()=>e.filter(b=>b.toLowerCase().trim().includes(r.toLowerCase().trim())&&b!==r),[e,r]),v=b=>{var M,P,A;if(b.code==="ArrowUp"||b.code==="ArrowDown")if(w.length){b.preventDefault();const T=Ke(w,S,b.code==="ArrowUp"?-1:1);y(T);const F=(M=p.current)==null?void 0:M.querySelector(`[data-index="${T}"]`);F==null||F.scrollIntoView({behavior:"smooth",block:"center"})}else(P=f.current)==null||P.blur(),l==null||l(b.code==="ArrowUp"?-1:1);else if(b.code==="Enter"){const T=w[S];T?(y(-1),a(T)):(A=f.current)==null||A.blur()}},j=()=>{setTimeout(()=>{k(!1),i==null||i()},300)};return t.jsxs(gs,{className:g,children:[t.jsx(Ge,{onFocus:()=>k(!0),onBlur:j,onKeyDown:v,onChange:a,value:r,focused:n,label:s,disabled:o,ref:f,placeholder:c,...h}),x&&!!w.length&&t.jsx(hs,{ref:p,role:"listbox",children:w.map((b,M)=>t.jsx(ms,{role:"listitem","data-index":M,"data-focused":M===S,focused:M===S,onClick:()=>{var P;a(b),y(-1),(P=f.current)==null||P.blur()},children:b},b))})]})}),gs=u("div",{target:"e1olyu0z2"})({name:"bjn8wh",styles:"position:relative"}),hs=u("div",{target:"e1olyu0z1"})("margin-top:0.1em;position:absolute;width:100%;background:black;max-height:",(1+2*.3)*4,"em;overflow-y:auto;z-index:2;"),ms=u("div",{target:"e1olyu0z0"})(R,";padding:0.3em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:",e=>e.focused?N.colors.text.active:"white",";cursor:pointer;"),fs=(e,n)=>{var s;return((s=e[n])==null?void 0:s.name)??`Track ${n+1}`};function ps({multipleTracks:e,player:n,songPreview:s,playerNames:r,register:a,onChange:o,setup:c}){const[l,i]=d.useState(!1),g=d.useRef(null);if(Ye(I.playerNameChanged),n===void 0)return null;const h=()=>o({number:n.number,track:(c.track+1)%s.tracksCount}),m=x=>{i(!0),n.setName(x)},f=!l,p=n.getName();return t.jsxs(t.Fragment,{children:[t.jsx(xs,{maxLength:Ot,className:"ph-no-capture",value:f?"":p,placeholder:f?p:void 0,options:r,onChange:m,label:"Name:",ref:g,...a(`player-${n.number}-name`,()=>{var x;return(x=g.current)==null?void 0:x.focus()})}),e&&t.jsx(bs,{...a(`player-${n.number}-track-setting`,h,"Change track"),label:"Track",value:fs(s.tracks,c.track),"data-test-value":c.track+1})]})}const xs=u(gt,{target:"eilnc831"})("input{font-size:4.5rem;}[role='listbox']{max-height:",6*(4.5+.3),"rem;}"),bs=u(We,{target:"eilnc830"})({name:"1bwrnjg",styles:"font-size:4.5rem;padding:1.1rem"});function Ss({songPreview:e,onNextStep:n,keyboardControl:s,onExitKeyboardControl:r}){const[a]=D(ge),[o]=D($t),c=B.getPlayers(),l=!a&&c.length===2&&e.tracksCount>1,i=()=>c.map((j,b)=>({number:j.number,track:l?Math.min(b,e.tracksCount-1):0})),[g,h]=d.useState(i());te([I.playerAdded,I.playerRemoved],()=>h(i()));const m=c.map((j,b)=>g.find(M=>M.number===j.number)??i()[b]),f=d.useMemo(()=>JSON.parse(sessionStorage.getItem(Je))??[],[]),p=j=>b=>{h(M=>M.map(P=>P.number===j?b:P))},[x,k]=d.useState(!1);d.useEffect(()=>{x||Xe.startMonitoring()},[x]);const{register:S,focusElement:y}=ee({enabled:s&&!x,onBackspace:r}),w=()=>{n(m)},v=!!o&&o!=="skip";return t.jsxs(t.Fragment,{children:[x&&t.jsx(on,{closeButtonText:v?"Continue to the song":"Continue to player setup",onClose:()=>{k(!1),v&&y("play")}}),m.map((j,b)=>t.jsxs(ys,{children:[t.jsxs(vs,{children:["Player ",b+1]}),t.jsx("div",{children:t.jsx(ps,{multipleTracks:l,player:B.getPlayer(j.number),setup:j,onChange:p(j.number),playerNames:f,register:S,songPreview:e})})]},j.number)),v&&t.jsx(Ce,{...S("play-song-button",w,void 0,!0),children:"Play"}),t.jsx(Ce,{...S("select-inputs-button",()=>k(!0),void 0,!1),children:"Setup mics"})]})}const ys=u("div",{target:"ee5oup2"})({name:"ho1qnd",styles:"display:flex;flex-direction:row"}),Ce=u(H,{target:"ee5oup1"})({name:"afgxf2",styles:"padding:0.5rem 9rem;font-size:4.3rem"}),vs=u("span",{target:"ee5oup0"})(R,";padding:1.3rem;font-size:4.5rem;");function js({songPreview:e,onPlay:n,keyboardControl:s,onExitKeyboardControl:r}){const[a,o]=d.useState(null),[c,l]=d.useState("song"),i=h=>{o(h),l("players")},g=h=>{if(!a)return;const m={...a,players:h};I.songStarted.dispatch(e,m),n({song:e,...m})};return t.jsxs(ws,{children:[t.jsx(cs,{style:c==="players"?{viewTransitionName:"player-mic-check-container"}:void 0}),t.jsxs(ks,{children:[c==="song"&&t.jsx(ts,{songPreview:e,onNextStep:i,keyboardControl:s,onExitKeyboardControl:r}),c==="players"&&t.jsx(Ss,{songPreview:e,onNextStep:g,keyboardControl:s,onExitKeyboardControl:()=>l("song")})]})]})}const ws=u("div",{target:"e1of12hx1"})({name:"k6gb66",styles:"display:flex;flex-direction:row;align-items:flex-end;justify-content:space-between;width:100%;hr{margin:1rem;opacity:0.25;}"}),ks=u("div",{target:"e1of12hx0"})({name:"115sh08",styles:"width:auto;display:flex;flex-direction:column;align-items:flex-end;gap:1.25rem"}),Es=30;function Cs({songPreview:e,top:n,left:s,width:r,height:a,keyboardControl:o,onExitKeyboardControl:c,onPlay:l,focusEffect:i}){const[g,h]=d.useState(!1),m=d.useRef(null),{width:f,height:p}=me(),x=o;d.useLayoutEffect(()=>{h(!1)},[e.video]);const k=e.previewStart??(e.videoGap??0)+60,S=e.previewEnd??k+Es,y=d.useMemo(()=>[e.video,k,S,e.volume],[e.video,k,S,e.volume]),[w,v,j,b]=qt(y,350);d.useEffect(()=>{var T;(T=m.current)==null||T.loadVideoById({videoId:w,startSeconds:v,endSeconds:j})},[w,m,v,j]);const M=x?f:r,P=x?p:a,A=x?Math.min(f/20*9,p*(4/5)):a;return d.useEffect(()=>{var T;(T=m.current)==null||T.setSize(M,P)},[M,P,o]),t.jsxs(t.Fragment,{children:[x&&t.jsx(zs,{onClick:c}),!x&&g&&t.jsx(Ls,{width:M,height:P,left:s,top:n,song:e}),t.jsx(Ts,{background:x||g,video:t.jsx(Is,{show:g,expanded:x,height:A,id:"preview-video-container",children:t.jsx(Gt,{width:0,height:0,disablekb:!0,ref:m,video:"",volume:b,onStateChange:T=>{var F,_;T===Q.ENDED?((F=m.current)==null||F.seekTo(k),(_=m.current)==null||_.playVideo()):T===Q.PLAYING&&h(!0)}})}),focused:!0,song:e,top:n,left:s,width:M,height:A,showVideo:g,expanded:x,"data-test":"song-preview","data-song":e.id,children:t.jsx(Fs,{expanded:x,children:x&&t.jsx(js,{songPreview:e,onPlay:l,keyboardControl:o,onExitKeyboardControl:c})})})]})}var Ms={name:"17gota2",styles:"border:0;border-radius:0;position:fixed;padding:var(--preview-padding)"};const Ps=u(it,{target:"evapa6h4"})("--preview-padding:5rem;width:",e=>e.width,"px;height:",e=>e.height,"px;position:absolute;z-index:",e=>e.expanded?201:3,";overflow:hidden;visibility:",e=>e.expanded||e.showVideo?"visible":"hidden",";",e=>e.expanded?Ms:G("pointer-events:none;",e.showVideo&&e.theme.graphicSetting==="high"?"animation: rhythmPulse 1s infinite":"scale: 1.2",";",""),";@keyframes rhythmPulse{0%{transform:scale(1.2);}15%{transform:scale(1.25);}100%{transform:scale(1.2);}}view-transition-name:song-preview;",be,"{view-transition-name:song-preview-artist;}",ne,"{view-transition-name:song-preview-title;}",ot,"{view-transition-name:song-preview-expanded-data;}"),Ts=e=>{const n=e.song.realBpm??(e.song.bpm>300?e.song.bpm/4:e.song.bpm/2);return t.jsx(Ps,{style:{top:e.expanded?`calc(50vh - ${e.height}px / 2)`:e.top,left:e.expanded?0:e.left,animationDuration:`${60/n}s`},...e})},zs=u("div",{target:"evapa6h3"})({name:"1iz7jdz",styles:"position:fixed;top:0;left:0;background:rgba(0, 0, 0, 0.8);width:100vw;height:100vh;z-index:201"});var As={name:"pfrwim",styles:"position:absolute;top:0;left:0;background-image:none!important;border-radius:0.5rem"};const Is=u("div",{target:"evapa6h2"})(e=>e.expanded?G("position:fixed;inset:0;clip-path:inset(calc((100vh - ",e.height,"px) / 2) 0);",""):As," div{opacity:",({show:e})=>e?1:0,";transition:",({show:e,expanded:n})=>e||n?1e3:0,"ms;}"),Fs=u("div",{target:"evapa6h1"})("inset:auto var(--preview-padding);position:fixed;z-index:100;",e=>!e.expanded&&"transform: scale(0.1);"," border-radius:0.5rem;view-transition-name:song-preview-content;"),Ns=u("div",{target:"evapa6h0"})("background:white;width:",e=>e.width,"px;height:",e=>e.height,"px;z-index:2;top:0;left:0;position:absolute;animation:bpm 1s infinite;border-radius:0.5rem;pointer-events:none;@keyframes bpm{0%{transform:scale(1.15);opacity:1;}100%{transform:scale(1.45);opacity:0;}}"),Ls=e=>{const[n]=D(ze);if(n==="low")return null;const s=e.song.realBpm??(e.song.bpm>300?e.song.bpm/4:e.song.bpm/2);return t.jsx(Ns,{width:e.width,height:e.height,style:{left:e.left,top:e.top,animationDuration:`${60/s}s`}})};let ce=0;function ht(){d.useEffect(()=>(document.body.classList.add("blockOverflow"),document.documentElement.classList.add("blockOverflow"),ce++,()=>{ce--,ce===0&&(document.body.classList.remove("blockOverflow"),document.documentElement.classList.remove("blockOverflow"))}),[])}const Rs=1.2,Me=4;function Bs({onSongSelected:e,preselectedSong:n}){const[s]=D(ge),r=s?Me-1:Me;Qe(!1),Ze(!0),ht();const[{previewTop:a,previewLeft:o,previewWidth:c,previewHeight:l},i]=d.useState({previewTop:0,previewLeft:0,previewWidth:0,previewHeight:0}),{focusedGroup:g,focusedSong:h,moveToSong:m,groupedSongList:f,keyboardControl:p,songPreview:x,setKeyboardControl:k,setFilters:S,filters:y,setShowFilters:w,showFilters:v,prefilteredList:j,isLoading:b}=Mn(n,r);Y(qe,z=>{z.stopPropagation(),z.preventDefault(),S({search:z.key})},{enabled:!y.search&&p});const P=d.useCallback(z=>{p&&S({search:z})},[p]);te(I.remoteSongSearch,P);const A=d.useRef(null),{width:T,handleResize:F}=me(),_=V(g),se=V(h);d.useEffect(()=>{var O,U,K;const z=(bt,St)=>`[data-group-letter="${bt}"] [data-index="${St}"]`;F();const E=(O=A.current)==null?void 0:O.querySelector(z(_,se)),C=(U=A.current)==null?void 0:U.querySelector(z(g,h));C&&((!E||E.offsetTop!==C.offsetTop)&&((K=C.scrollIntoView)==null||K.call(C,{behavior:"smooth",inline:"center",block:"center"})),i({previewLeft:C.offsetLeft,previewTop:C.offsetTop,previewWidth:C.offsetWidth,previewHeight:C.offsetHeight}))},[T,A,h,g,f]);const ae=d.useCallback(()=>k(!1),[k]);return!f||!T?t.jsx(t.Fragment,{children:"Loading"}):b?t.jsx(Ks,{children:t.jsx(et,{size:"15em",color:"secondary"})}):t.jsxs(_s,{songsPerRow:r,children:[x&&t.jsx(Os,{videoId:x.video}),y.search?t.jsx(In,{showFilters:v,onSongFiltered:S,filters:y}):t.jsx(Rn,{keyboardControl:p}),t.jsxs(Gs,{ref:A,active:p,"data-test":"song-list-container",dim:v,children:[f.length===0&&t.jsx(qs,{children:"No songs found"}),x&&t.jsx(Cs,{songPreview:x,onPlay:e,keyboardControl:!p,onExitKeyboardControl:()=>k(!0),top:a,left:o,width:c,height:l,focusEffect:!v}),f.map(z=>d.createElement($s,{...v||!p?{"data-unfocusable":!0}:{},key:z.letter,"data-group-letter":z.letter,highlight:z.letter==="New"},t.jsx(mt,{children:z.letter}),t.jsx(Vs,{children:z.songs.map(({song:E,index:C})=>t.jsx(Us,{song:E,handleClick:h===C?ae:m,focused:!v&&p&&C===h,index:C,"data-index":C,"data-focused":!v&&p&&C===h,"data-test":`song-${E.id}${z.isNew?"-new-group":""}`},E.id))}))),t.jsxs(Ds,{children:["Missing a song? Try ",t.jsx("a",{href:"/convert",children:"adding one"})," yourself!"]})]}),t.jsx(Tn,{setFilters:S,active:v,closePlaylist:w,prefilteredList:j})]})}const Ds=u("span",{target:"ef4zhl29"})(R,";text-align:center;font-size:5rem;margin-top:10rem;"),_s=u("div",{target:"ef4zhl28"})("display:flex;flex-direction:row;max-height:100vh;--song-list-gap:3.5rem;--song-item-width:",e=>`calc(${100/e.songsPerRow}% - ((${e.songsPerRow-1} / ${e.songsPerRow}) * var(--song-list-gap)))`,";--song-item-ratio:calc(16 / 9 * (4 / ",e=>e.songsPerRow,"));"),Os=u(pn,{target:"ef4zhl27"})({name:"1i2rgvj",styles:"position:fixed;inset:0;width:100%;height:100%;filter:blur(5px) grayscale(90%);opacity:0.25;object-fit:cover"}),$s=u("div",{target:"ef4zhl26"})("padding:0 4.5rem 0 11rem;",e=>e.highlight&&G("background:rgba(0, 0, 0, 0.5);padding-bottom:3rem;border-bottom:0.2rem solid black;",mt,"{animation:new-song-group-header 600ms ease-in-out infinite both;background:#ffffff;@keyframes new-song-group-header{0%,100%{transform:scale(1);}50%{transform:scale(1.1);}}}",""),";"),qs=u("div",{target:"ef4zhl25"})(R,";display:flex;align-items:center;justify-content:center;flex:1;font-size:10rem;"),mt=u("div",{target:"ef4zhl24"})(R,";display:inline-block;padding:0.5rem 1rem;margin-bottom:2rem;font-size:3.5rem;position:sticky;z-index:1;top:calc(-1 * var(--song-list-gap));color:",N.colors.text.active,";background:rgba(0, 0, 0, 0.7);"),Gs=u("div",{target:"ef4zhl23"})("position:relative;flex:1 1 auto;display:flex;flex-direction:column;gap:var(--song-list-gap);padding:4.5rem 0;overflow-y:auto;overflow-x:clip;box-sizing:border-box;min-height:100vh;max-height:100vh;::-webkit-scrollbar{display:none;}transition:opacity 500ms;opacity:",e=>e.dim?.5:1,";"),Vs=u("div",{target:"ef4zhl22"})({name:"bviq7b",styles:"display:flex;flex-direction:row;flex-wrap:wrap;gap:var(--song-list-gap)"});var Hs={name:"1jwmbuq",styles:"transition:300ms"};const Us=d.memo(u(it,{target:"ef4zhl21"})("cursor:pointer;flex-basis:var(--song-item-width);aspect-ratio:var(--song-item-ratio);",e=>e.theme.graphicSetting==="high"&&Hs," transform:scale(",e=>e.focused?Rs:1,");",e=>e.focused&&"z-index: 2;"," ",e=>e.focused&&Vt," content-visibility:auto;contain-intrinsic-size:calc(var(--song-item-width) * (1 / var(--song-item-ratio)));")),Ks=u("div",{target:"ef4zhl20"})({name:"101j4br",styles:"display:flex;align-items:center;justify-content:center;height:100vh"});function Ws(e){const[n,s]=D(Ie),[r,a]=d.useState(n===null),o=()=>{s(n??[]),a(!1)};return r?t.jsx(Ht,{onClose:o,closeText:"Continue to Song Selection"}):t.jsx(Bs,{...e})}function ft(){d.useEffect(()=>{try{document.body.requestFullscreen().catch(console.info)}catch{}},[])}const Ys=""+new URL("459342__papaninkasettratat__cinematic-music-short-RLBkkUq3.mp3",import.meta.url).href,q=e=>new Promise(n=>setTimeout(n,e)),le=15;function Xs({onFinish:e}){const n=d.useRef(null),[s,r]=d.useState(!1),[a,o]=d.useState([]);te(I.readinessConfirmed,i=>{o(g=>[...g,i])});const c=he([I.inputListChanged,I.readinessConfirmed],()=>B.getPlayers().map((i,g)=>[i.input.deviceId,i.getName(),i]));d.useEffect(()=>{(async()=>{var f,p,x;let i=!1;const g=B.requestReadiness().then(()=>{i=!0,r(!0)}),h=q(1500),m=q(le*1e3);await q(250),i||await((f=n==null?void 0:n.current)==null?void 0:f.play()),await Promise.race([Promise.all([g,h]),m]),(p=n==null?void 0:n.current)!=null&&p.paused||Ut.play(),await q(500),(x=n==null?void 0:n.current)==null||x.pause(),await q(1e3),e()})()},[]);const l=c.map(([i,g,h])=>({confirmed:a.includes(i),name:g,player:h}));return t.jsxs(t.Fragment,{children:[t.jsxs(Js,{children:[!s&&t.jsxs("span",{children:["Waiting for all players to click ",t.jsx("strong",{children:'"Ready"'})]}),t.jsx(Zs,{children:l.map(({confirmed:i,name:g,player:h},m)=>t.jsxs(ea,{className:"ph-no-capture","data-test":"player-confirm-status","data-name":g,"data-confirmed":i,children:[!s&&t.jsx(ta,{children:i?t.jsx(fn,{}):t.jsx(et,{color:"info",size:"1em"})})," ",t.jsx(ut,{player:h})]},m))}),!s&&t.jsxs(Qs,{children:["The song will start automatically in"," ",t.jsx("strong",{children:t.jsx(tt,{end:0,start:le,duration:le,useEasing:!1})})]})]}),t.jsx("audio",{src:Ys,ref:n,hidden:!0,autoPlay:!1,onPlay:i=>{i.currentTarget.volume=.8}})]})}const Js=u("div",{target:"e1sds9f4"})("top:0;left:0;z-index:1000;display:flex;align-items:center;justify-content:center;flex-direction:column;position:absolute;width:100%;height:100%;gap:5rem;font-size:5rem;",R,";"),Qs=u("span",{target:"e1sds9f3"})({name:"1umnjfm",styles:"font-size:5rem"}),Zs=u("div",{target:"e1sds9f2"})({name:"1uxgijs",styles:"display:flex;flex-direction:column;gap:5rem;width:50rem;view-transition-name:player-mic-check-container"}),ea=u("div",{target:"e1sds9f1"})({name:"174652e",styles:"display:flex;align-items:center;gap:2rem;transform:scale(1.5)"}),ta=u("span",{target:"e1sds9f0"})({name:"1l5xwqu",styles:"svg{width:5rem;height:5rem;stroke:black;}"}),na=250,de=(e,n=0,s=1/0)=>e.filter(nt).filter(r=>st([r])>=n).filter(r=>Z([r])<=s).reduce((r,a)=>r+a.notes.reduce((o,c)=>o+c.length,0),0),sa=(e,n)=>{const[s,...r]=e.filter(nt),a=[[s]];return r.forEach(o=>{const c=a.at(-1),l=Z(c);(st([o])-l)*n>na?a.push([o]):c.push(o)}),a},pt=(e,n)=>e+n,Pe=e=>{const n=e.map(s=>s.reduce(pt,0));return Math.max(...n)-Math.min(...n)},aa=(e,n)=>{const s=cn(e),r=o=>{if(s[o-1].length<2)return;const c=s[o-1].pop();s[o].push(c)},a=o=>{var i;if(((i=s[o+1])==null?void 0:i.length)<2)return;const[c,...l]=s[o+1];s[o].push(c),s[o+1]=l};return n%2===1?r(Math.ceil(n/2)):a(Math.ceil(n/2)),s},ra=e=>e.reduce(pt,0);function ia(e){const s=Kt(e);return e.tracks.map(r=>{if(r.sections.length<3)return[];const a=sa(r.sections,s);let o=[],c=[de(a[0])];for(let l=0;l<a.length-2;l++){const i=a[o.flat().length-1]??[],h=de(r.sections,Z(i)??0)/(1+9-o.length),m=de(a[l+1]),f=ra(c);f+m<h?c=[...c,m]:h-f<f+m-h?(o.push(c),c=[m]):(o.push([...c,m]),c=[])}for(let l=0;l<100;l++){const i=Pe(o),g=Wt((o.length-2)*2+2).map(p=>aa(o,p)),h=g.map(Pe),m=Math.min(...h);if(i<=m)break;const f=h.indexOf(m);o=g[f]}return o.map(l=>l.length).reduce((l,i)=>[...l,(l.at(-1)??0)+i],[]).map(l=>Z(a[l-1]))})}const Te=[t.jsxs(t.Fragment,{children:["You can follow the updates and give feedback on the game through the Facebook Page:"," ",t.jsx("a",{href:"https://www.facebook.com/allkaraoke.party",target:"_blank",rel:"noreferrer",children:t.jsx("strong",{children:"fb.com/AllKaraoke.Party"})})]}),t.jsxs(t.Fragment,{children:["Start typing a name of a song in ",t.jsx("strong",{children:"Song Selection"})," to active Search feature"]}),t.jsxs(t.Fragment,{children:["Narrow down songs through ",t.jsx("strong",{children:"playlists"})," on the right in Song Selection"]}),t.jsxs(t.Fragment,{children:["Select ",t.jsx("strong",{children:"Pass The Mic"})," Game Mode to share the microphones and sing in a team"]}),t.jsxs(t.Fragment,{children:["Your scores and ",t.jsx("strong",{children:"stats are saved"})," in this browser - they will be available for the next party!"]}),t.jsxs(t.Fragment,{children:["You can remove irrelevant songs from the Song Selection in ",t.jsx("strong",{children:"Edit Songs"})," page"]}),t.jsxs(t.Fragment,{children:["If the game feels a bit jaggy with low FPS, check out ",t.jsx("strong",{children:"Settings"})," page"]}),t.jsxs(t.Fragment,{children:["Party is only getting started? Play ",t.jsx("strong",{children:"Jukebox"})," for the music and to see what songs are available"]}),t.jsxs(t.Fragment,{children:["Research shows that ",t.jsx("strong",{children:"duet songs"})," are that bit more fun than simple one-track ones"]}),t.jsxs(t.Fragment,{children:["Want to sing a ",t.jsx("strong",{children:"new song"}),"? Find UltraStar version of it and import it with",t.jsx("br",{}),t.jsx("strong",{children:"Convert Ultrastar .txt"})]}),t.jsxs(t.Fragment,{children:["The ",t.jsx("strong",{children:"white pulse"})," around selected song in Song Selection tries to match song's tempo"]}),t.jsxs(t.Fragment,{children:["Entire game (besides add/edit song) is navigable with ",t.jsx("strong",{children:"Keyboard"})]}),t.jsxs(t.Fragment,{children:["You can hide or show keyboard navigation help with ",t.jsx("kbd",{children:"H"})," key"]}),t.jsxs(t.Fragment,{children:["In Song Selection, hold ",t.jsx("kbd",{children:"↑"})," or ",t.jsx("kbd",{children:"↓"})," to jump to the next letter"]}),t.jsxs(t.Fragment,{children:["Add ",t.jsx("strong",{children:"vibrato"})," to the notes you sing to get additional ",t.jsx("strong",{children:"bonus points"})]}),t.jsxs(t.Fragment,{children:["You can control the game with your phone - click on the"," ",t.jsxs("strong",{children:[t.jsx(Yt,{}),"QR Code Icon"]})," ","on the top right and follow the instructions"]})],oa=({as:e="h4",...n})=>{const s=d.useRef(J(0,Te.length-1)),r=e;return t.jsx(r,{...n,children:Te[s.current]})};function ca({...e}){const[n,s]=d.useState(""),r=d.useRef(null);return d.useEffect(()=>{const a=setTimeout(()=>{s(fe.getVideo())},1e3);return()=>{clearTimeout(a)}},[]),d.useEffect(()=>{try{r.current&&(r.current.playbackRate=16)}catch(a){Ae(a)}},[n]),t.jsx(la,{...e,children:t.jsx(da,{src:n,ref:r,loop:!0,autoPlay:!0,className:"ph-no-capture"})})}const la=u("div",{target:"egk8upf1"})({name:"1g34f1k",styles:"width:80rem;height:60rem"}),da=u("video",{target:"egk8upf0"})({name:"idj2s4",styles:"object-fit:cover;width:100%;height:100%"});function ua(e){return 1-Math.pow(1-e,3)}function ga(e){return ua(e)}function W({color:e,maxScore:n,score:s}){return t.jsx(ha,{style:{border:s===0?0:void 0,width:`${ga(s/n)*24}%`,backgroundColor:e}})}const ha=u("div",{target:"epk9dli0"})({name:"1vc31u",styles:`background-image:linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.17) 0%,
    rgba(0, 0, 0, 0.03) 50%,
    rgba(0, 0, 0, 0.18) 51%,
    rgba(0, 0, 0, 0.18) 100%
  );transition:1s;border-radius:0.5rem;height:100%;border:solid 0.1rem black;box-sizing:border-box`});function ma({playerNumber:e,player:n,segment:s}){const[r,a]=n.detailedScore;return t.jsxs(fa,{children:[t.jsx(W,{score:s>-1?r.rap+r.freestyle+r.normal:0,maxScore:a.rap+a.freestyle+a.normal,color:N.colors.players[e].perfect.fill}),t.jsx(W,{score:s>0?r.perfect:0,maxScore:a.perfect,color:N.colors.players[e].stroke}),t.jsx(W,{score:s>1?r.star:0,maxScore:a.star,color:N.colors.players[e].starPerfect.stroke}),t.jsx(W,{score:s>2?r.vibrato:0,maxScore:a.vibrato,color:N.colors.players[e].perfect.stroke}),t.jsx(pa,{children:s<5&&t.jsx(Xt,{options:{strings:["Regular notes","Perfect notes","Star notes","Vibrato"],pauseFor:1e3,autoStart:!0,delay:15,deleteSpeed:15,cursor:""}})})]})}const fa=u("div",{target:"e10trgut1"})({name:"yex4ym",styles:"position:relative;height:4rem;width:100rem;background:rgba(0, 0, 0, 0.5);display:flex;flex-direction:row;padding:0.5rem;border-radius:1rem;gap:0.5rem"}),pa=u("span",{target:"e10trgut0"})("position:absolute;",R,";font-size:3rem;text-align:right;white-space:nowrap;top:5rem;left:1rem;display:block;");function xa({playerNumber:e,player:n,highestScore:s,highScores:r,singSetup:a,useColors:o=!0,revealHighScore:c,segment:l}){const[i]=n.detailedScore;let g=0;l>-1&&(g=i.normal+i.rap+i.freestyle),l>0&&(g=g+i.perfect),l>1&&(g=g+i.star),l>2&&(g=g+i.vibrato);const h=m=>r.some(f=>f.singSetupId===a.id&&f.name===m);return t.jsxs(ba,{children:[t.jsx(xt,{color:o?N.colors.players[e].text:"","data-test":`player-${e}-name`,className:"ph-no-capture",children:n.name}),t.jsx(ya,{children:t.jsxs(Sa,{highscore:c&&h(n.name),color:o?N.colors.players[e].text:"",win:c&&g===s,"data-test":`player-${e}-score`,"data-score":g,children:[t.jsx(tt,{preserveValue:!0,end:g,formattingFn:ln.format,duration:l<5?1:.5}),t.jsx(va,{highscore:c&&h(n.name),children:"High score!"})]})}),t.jsx(ma,{playerNumber:e,player:n,segment:l})]})}const ba=u("div",{target:"e1hn1x414"})({name:"1kdaoj4",styles:"display:flex;flex-direction:column;align-items:center;gap:1.5rem"}),xt=u(Jt,{target:"e1hn1x413"})("padding-left:10rem;padding-right:10rem;font-size:3.5rem;color:",e=>e.color,";"),Sa=u(xt,{target:"e1hn1x412"})("font-size:",e=>e.win?"8.5rem":"5.5rem",";color:",e=>e.win?N.colors.text.active:"white",";transition:400ms ease-in-out;position:relative;"),ya=u("div",{target:"e1hn1x411"})({name:"f9rldz",styles:"height:8.5rem"}),va=u(Qt,{target:"e1hn1x410"})("top:-1.5rem;right:-10rem;font-size:3rem;",e=>e.highscore&&Zt,";opacity:",e=>e.highscore?"1":"0",";transition:400ms;");function ja({onNextStep:e,players:n,highScores:s,singSetup:r}){const[a,o]=d.useState(-1);d.useEffect(()=>{if(a<0)o(0);else if(a<4){const p=setInterval(()=>{o(x=>x+1)},1500);return()=>{clearInterval(p)}}},[a]);const c=a>3,l=()=>{c?e():(Re.capture("animation_skipped"),o(5))};ue({accept:l},!0,[a]);const i=d.useMemo(()=>({accept:"Next"}),[]);Be(i,!0);const g=r.mode===L.CO_OP,h=g?[{...n[0],name:n.map(p=>p.name).join(", ")}]:n,m=h.map(p=>en(p.detailedScore[0])),f=Math.max(...m);return t.jsxs(t.Fragment,{children:[t.jsx(wa,{children:h.map((p,x)=>t.jsx(xa,{playerNumber:p.playerNumber,useColors:!g,revealHighScore:a>3,segment:a,player:p,highScores:s,highestScore:f,singSetup:r},x))}),t.jsx(ka,{onClick:l,focused:!0,"data-test":c?"highscores-button":"skip-animation-button",children:c?"Next":"Skip"}),fe.getPermissionStatus()&&t.jsx(Ea,{})]})}const wa=u("div",{target:"ez8rfb42"})({name:"nvdiyi",styles:"position:absolute;top:20rem;width:100%;text-align:center;display:flex;flex-direction:column;gap:2rem"}),ka=u(H,{target:"ez8rfb41"})({name:"dmbiod",styles:"position:absolute;bottom:4rem;right:2rem;width:40rem;font-size:1.9vw"}),Ea=u(ca,{target:"ez8rfb40"})({name:"1c3jvq",styles:"position:absolute;top:calc(50% - 30rem);left:95rem;transform:scale(0.75)"});function Ca(){return d.useMemo(()=>JSON.parse(sessionStorage.getItem(Je))??[],[])}function Ma({score:e,register:n,singSetupId:s,onSave:r,index:a}){const o=d.useRef(null),[c,l]=d.useState(""),i=Ca(),g=()=>{c.trim().length&&c.trim()!==e.name&&r(s,e.score,e.name,c)};return t.jsx(gt,{className:"ph-no-capture",options:i,onChange:l,onBlur:g,value:c,label:"",ref:o,...n(`highscore-rename-${a}`,()=>{var h;return(h=o.current)==null?void 0:h.focus()}),placeholder:e.name,"data-test":"input-edit-highscore","data-original-name":e.name})}function Pa({onNextStep:e,highScores:n,singSetup:s,song:r}){const{register:a}=ee(),o=Vn(r);return t.jsxs(t.Fragment,{children:[t.jsx(Ta,{"data-test":"highscores-container",children:n.map((c,l)=>t.jsxs(za,{isCurrentSing:c.singSetupId===s.id,children:[t.jsx(Aa,{children:l+1}),t.jsx(Ia,{className:"ph-no-capture",children:c.singSetupId===s.id?t.jsx(Ma,{index:l,score:c,register:a,singSetupId:s.id,onSave:o}):c.name}),t.jsx(Fa,{children:t.jsx(dn,{score:c.score})}),t.jsx(Na,{children:$(c.date).format("MMMM DD, YYYY")})]},l))}),t.jsx(La,{...a("play-next-song-button",e,void 0,!0),children:"Select song"})]})}const Ta=u("div",{target:"e161j45v6"})({name:"9gtmjg",styles:"position:absolute;top:20rem;width:100%;text-align:center;padding:0 16rem;box-sizing:border-box"}),za=u("div",{target:"e161j45v5"})("position:relative;",R,";font-size:3.2rem;display:flex;background:",e=>e.isCurrentSing?"rgba(0,0,0,.9)":"rgba(0,0,0,.5)",";margin-bottom:2rem;padding:",e=>e.isCurrentSing?"0 1.5rem":"1rem 3.2rem",";align-items:center;"),Aa=u("div",{target:"e161j45v4"})("padding:0 1.6rem;color:",N.colors.text.active,";"),Ia=u("div",{target:"e161j45v3"})({name:"1mbe2e5",styles:"text-align:left;flex:1;padding:1.6rem"}),Fa=u("div",{target:"e161j45v2"})({name:"2ycp6t",styles:"padding:0 1rem"}),Na=u("div",{target:"e161j45v1"})({name:"1gbnj87",styles:"position:absolute;font-size:2rem;bottom:-1rem;right:-1.6rem;background:black;padding:0.5rem"}),La=u(H,{target:"e161j45v0"})({name:"dmbiod",styles:"position:absolute;bottom:4rem;right:2rem;width:40rem;font-size:1.9vw"});function Ra({song:e,width:n,height:s,onClickSongSelection:r,players:a,highScores:o,singSetup:c}){Qe(!0);const[l,i]=d.useState("results");return t.jsx(tn,{songData:e,width:n,height:s,children:t.jsxs(Ba,{children:[l==="results"&&t.jsx(ja,{onNextStep:()=>i("highscores"),players:a,singSetup:c,highScores:o}),l==="highscores"&&t.jsx(Pa,{onNextStep:r,singSetup:c,highScores:o,song:e}),t.jsx(Da,{$active:!0})]})})}const Ba=u("div",{target:"ehc5trj1"})({name:"1quw0ni",styles:"pointer-events:auto"}),Da=u(oa,{shouldForwardProp:e=>!e.startsWith("$"),target:"ehc5trj0"})("transition:300ms;transform:scale(",({$active:e})=>e?1:0,");position:absolute;bottom:20rem;font-size:3.2rem;line-height:1.25;color:white;text-align:center;background:rgba(0, 0, 0, 0.75);width:100%;box-sizing:border-box;padding:2rem 10rem;kbd{padding:0.12rem 0.9rem;border-radius:1rem;border:0.5rem solid rgb(204, 204, 204);border-bottom-color:rgb(150, 150, 150);border-right-color:rgb(150, 150, 150);color:rgb(51, 51, 51);line-height:1.4;display:inline-block;box-shadow:0 0.1rem 0 rgba(0, 0, 0, 0.2),inset 0 0 0 0.2rem #ffffff;background-color:rgb(247, 247, 247);text-shadow:0 0.1rem 0 #fff;font-weight:normal;}");function _a(e,n){const s=xe(e);return d.useMemo(()=>s==null?void 0:s.scores.filter(({setup:a})=>a.mode===n.mode&&a.tolerance===n.tolerance).map(a=>a.scores.map(o=>({...o,date:a.date,singSetupId:a.setup.id}))).flat().sort((a,o)=>o.score-a.score).slice(0,5),[s,n])??[]}function Oa({song:e,width:n,height:s,onClickSongSelection:r,singSetup:a}){const o=_a(e,a),c=d.useMemo(()=>B.getPlayers().map(l=>({name:l.getName(),playerNumber:l.number,detailedScore:X.getPlayerDetailedScore(l.number)})),[]);return t.jsx(Ra,{singSetup:a,song:e,width:n,height:s,onClickSongSelection:r,players:c,highScores:o})}function $a({songPreview:e,singSetup:n,returnToSongSelection:s,restartSong:r}){ft(),ht();const a=d.useRef(null),o=nn(e.id),{width:c,height:l}=me(),[i,g]=d.useState(!1),[h,m]=d.useState(!0),[f,p]=d.useState(Q.UNSTARTED),x=d.useMemo(()=>o.data?n.mode!==L.PASS_THE_MIC?o.data.tracks.map(()=>[]):ia(o.data):[],[o.data,n]),[k,S]=d.useState(!1);return Ze(!k),d.useEffect(()=>{h&&o.data&&(k||f!==Q.UNSTARTED)&&m(!1)},[o.data,k,f,h]),i&&o.data?t.jsx(Oa,{width:c,height:l,song:o.data,onClickSongSelection:s,singSetup:n}):t.jsxs(qa,{children:[t.jsxs(Ga,{visible:h,children:[t.jsx(Ha,{video:e.video,width:c,height:l}),t.jsx(Ua,{children:e.artist}),t.jsx(Ka,{children:e.title}),t.jsx(Xs,{onFinish:()=>{var y;S(!0),(y=a.current)==null||y.play()}})]}),o.data&&t.jsx(un,{ref:a,onStatusChange:p,playerChanges:x,players:n.players,song:o.data,width:c,height:l,autoplay:!1,onSongEnd:()=>{var w;const y=((w=X.getSingSetup())==null?void 0:w.mode)===L.CO_OP?[{name:B.getPlayers().map(v=>v.getName()).join(", "),score:X.getPlayerScore(0)}]:B.getPlayers().map(v=>({name:v.getName(),score:X.getPlayerScore(v.number)}));I.songEnded.dispatch(o.data,n,y),g(!0)},singSetup:n,restartSong:r})]})}const qa=u("div",{target:"e1pnu1v94"})({name:"bjn8wh",styles:"position:relative"}),Ga=u("div",{target:"e1pnu1v93"})("position:fixed;top:0;left:0;z-index:10;pointer-events:none;background-color:black;view-transition-name:song-preview;opacity:",e=>e.visible?1:0,";transition:500ms;"),Va=u("div",{target:"e1pnu1v92"})({name:"oux8x1",styles:"background-size:cover;background-position:center center;filter:blur(10px)"}),Ha=e=>t.jsx(Va,{style:{backgroundImage:`url('https://i3.ytimg.com/vi/${e.video}/hqdefault.jpg')`,width:`${e.width}px`,height:`${e.height}px`}}),Ua=u(be,{target:"e1pnu1v91"})({name:"oyknw4",styles:"view-transition-name:song-preview-artist;position:absolute;top:10rem;left:10rem;font-size:7rem"}),Ka=u(ne,{target:"e1pnu1v90"})({name:"1l9juvo",styles:"view-transition-name:song-preview-title;position:absolute;font-size:8rem;top:19rem;left:10rem"});function Xa(e){const[n,s]=d.useState(null),[r,a]=d.useState(e.songId??null),[o,c]=d.useState(0),l=i=>{document.getElementById("preview-video-container").style.viewTransitionName="song-preview-video",_e(()=>{document.getElementById("preview-video-container").style.viewTransitionName="",Oe.flushSync(()=>{s(i)})}),$e.play()};return ft(),t.jsx(t.Fragment,{children:n?t.jsx($a,{restartSong:()=>{fe.restartRecord(),c(i=>i+1)},songPreview:n.song,singSetup:n,returnToSongSelection:()=>{a(n.song.id),s(null)}},o):t.jsx(Ws,{onSongSelected:l,preselectedSong:r})})}export{Xa as default};
//# sourceMappingURL=Game-1jIQutgU.js.map
