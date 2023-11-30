import{a1 as jt,a2 as wt,a3 as kt,c as Et,j as t,a4 as Ct,r as d,a5 as B,a6 as Fe,a0 as u,V as Mt,a7 as Ne,a8 as Le,a9 as G,W as $,aa as Q,ab as Re,ac as Pt,ad as Be,ae as ge,af as De,ag as _e,ah as Oe,ai as Tt,aj as zt,ak as $e,E as qe,al as Ge,am as te,an as At,ao as ve,ap as N,aq as K,ar as It,as as X,at as Ve,au as He,av as he,K as Ft,L as Nt,aw as je,ax as Ke,ay as ne,az as I,aA as Ue,aB as Lt,aC as R,z as V,aD as We,aE as L,aF as Rt,aG as Bt,aH as Dt,aI as Ye,aJ as Xe,aK as me,aL as _t,aM as Ot,aN as D,aO as $t,aP as qt,aQ as Je,aR as Qe,aS as Gt,aT as Vt,aU as Ze,aV as fe,aW as Ht,aX as Kt,aY as Z,aZ as et,S as pe,a_ as Ut,U as tt,a$ as nt,b0 as Wt,b1 as Yt,b2 as st,b3 as Xt,b4 as ee,b5 as Jt,b6 as at,b7 as rt,b8 as Qt,b9 as xe,ba as Zt,bb as en,bc as tn,bd as nn,be as sn,bf as an,bg as J,bh as rn}from"./index-MkpMYrVH.js";import{u as on,a as H,b as cn,P as ln,S as dn,c as un,f as gn,d as hn,e as mn}from"./Player-M1bZQu_m.js";function fn(e){var n=jt(e),s=n%1;return n===n?s?n-s:n:0}var pn=Math.ceil,xn=Math.max;function we(e,n,s){(s?wt(e,n,s):n===void 0)?n=1:n=xn(fn(n),0);var r=e==null?0:e.length;if(!r||n<1)return[];for(var a=0,i=0,o=Array(pn(r/n));a<r;)o[i++]=kt(e,a,a+=n);return o}const bn=Et(t.jsx("path",{d:"M16.59 7.58 10 14.17l-3.59-3.58L5 12l5 5 8-8zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"}),"CheckCircleOutline");function it({videoId:e,...n}){return t.jsx(jn,{src:`https://img.youtube.com/vi/${e}/default.jpg`,alt:`Thumbnail image for YouTube video ${e}`,...n})}function Sn({videoId:e,...n}){const s=Ct(e)??e,[r,a]=d.useState(!0);d.useLayoutEffect(()=>{a(o=>!o)},[e]);const[i]=B(Fe);return i==="low"?null:t.jsxs(yn,{...n,children:[t.jsx(ke,{videoId:r?e:s,visible:r}),t.jsx(ke,{videoId:r?s:e,visible:!r}),t.jsx(vn,{videoId:s})]})}const yn=u("div",{target:"e1x06a543"})({name:"k44s62",styles:"position:relative;overflow:hidden;background:black"}),vn=u(it,{target:"e1x06a542"})({name:"6dhm9o",styles:"visibility:hidden"}),ke=u(it,{target:"e1x06a541"})("position:absolute;transition:opacity 300ms;opacity:",e=>e.visible?1:0,";"),jn=u("img",{target:"e1x06a540"})({name:"4uwt2b",styles:"width:100%;height:100%;object-fit:cover"}),ie={language:(e,n)=>n===""?e:e.filter(s=>(Array.isArray(s.language)?s.language:[s.language]).includes(n)),excludeLanguages:(e,n=[])=>n.length===0?e:e.filter(s=>!(Array.isArray(s.language)?s.language:[s.language]).every(a=>n.includes(a))),search:(e,n)=>{const s=G(n);return s.length?e.filter(r=>r.search.includes(s)):e},duet:(e,n)=>n===null?e:e.filter(s=>n?s.tracksCount>1:s.tracksCount===1),yearBefore:(e,n)=>n?e.filter(s=>Number(s.year)<n):e,yearAfter:(e,n)=>n?e.filter(s=>Number(s.year)>=n):e,genre:(e,n)=>G(n).length?e.filter(r=>G(r.genre??"").includes(n)):e,updatedAfter:(e,n)=>{if(!n)return e;const s=$(n);return e.filter(r=>r.lastUpdate&&$(r.lastUpdate).isAfter(s))}},Ee=(e,n)=>G((n==null?void 0:n.search)??"").length?ie.search(e,n.search):Object.entries(n).filter(s=>s[0]in ie).reduce((s,[r,a])=>ie[r](s,a),e),wn=e=>d.useMemo(()=>on(["",...e.map(n=>n.language??"Unknown")].flat()),[e]),kn=e=>{const n=wn(e),[s]=B(Le),[r,a]=d.useState({excludeLanguages:s??[]}),i=d.useDeferredValue(r),o=d.useMemo(()=>Ee(e,{excludeLanguages:s??[]}),[e,s]),l=d.useMemo(()=>Ee(e,{...i,excludeLanguages:s??[]}),[e,i,s]),c={language:{current:r.language??"",available:n},status:{allSongs:e.length,visible:l.length}};return{filters:r,filteredList:l,filtersData:c,prefilteredList:o,setFilters:a}};function En(){const e=Mt(),{filters:n,filtersData:s,filteredList:r,prefilteredList:a,setFilters:i}=kn(e.data),o=d.useMemo(()=>{if(r.length===0)return[];const l=[];if(!n.search){const g=r.filter(h=>h.isNew);g.length&&l.push({letter:"New",isNew:!0,songs:g.map(h=>({song:h,index:r.indexOf(h)}))})}const c=/[^a-zA-Z]/;return r.forEach((g,h)=>{try{const m=isFinite(+g.artist[0])||c.test(g.artist[0])?"0-9":g.artist[0].toUpperCase();let f=l.find(p=>p.letter===m);f||(f={letter:m,songs:[]},l.push(f)),f.songs.push({index:h,song:g})}catch(m){console.error(m),Ne(m)}}),l},[r,n.search]);return{prefilteredList:a,groupedSongList:o,songList:r,filtersData:s,filters:n,setFilters:i,isLoading:e.isLoading}}const Cn=30;function Mn(e,n,s=Cn){let r;if(n.length<e){const a=[...Array(e).keys()].filter(i=>!n.includes(i));r=a[Q(0,a.length-1)]}else r=Q(0,e-1),n.length=0;return n.length>=s&&n.shift(),n.push(r),r}const Pn=(e=[],n)=>{var k;const[s,r]=d.useState([0,0]),a=d.useMemo(()=>e.map(({songs:S})=>we(S.map(y=>y.index),n)).flat(),[e]),i=d.useMemo(()=>e.map(({songs:S,letter:y})=>we(S.map(()=>y),n)).flat(),[e]),o=H(a??[]),l=s[0]===((k=a[s[1]])==null?void 0:k.length)-1,c=d.useCallback(S=>{var v;const y=a.findIndex(j=>j.includes(S)),w=(v=a[y])==null?void 0:v.indexOf(S);w>=0&&y>=0?r([w??0,y??0]):r([0,0])},[a]),g=([S,y],w,v)=>{var b;if(e.length===0)return v;const j=w[y];return(j==null?void 0:j[S])??(j==null?void 0:j.at(-1))??((b=w==null?void 0:w[0])==null?void 0:b[0])??v},h=([S,y],w=a)=>g([S,y],w,0),m=([S,y],w=i)=>g([S,y],w,"A");d.useEffect(()=>{const S=h(s,o),y=h(s,a);o.length&&S!==y&&c(S)},[s,a,o,l]);const f=(S,y)=>{Be.play(),r(([w,v])=>{let j=w,b=v;if(S==="y")b=v+y;else{if(a[v]===void 0)debugger;const M=a[v].length-1;j=Math.min(w,M)+y,j<0?(b=(a.length+v-1)%a.length,j=a[b].length-1):j>M&&(b=v+1,j=0)}return[j%n,(a.length+b)%a.length]})},p=h(s),x=m(s);return Oe([p,x,s,f,c,l])},Tn=(e,n=[],s,r,a,i)=>{const o=Re(),[l,c]=d.useState([!1,null]),g=H(l),[h,m]=l,[f,p,x,k,S,y]=Pn(n,i),w=x[0]===0,v=()=>{Tt.play(),s()},[j,b]=d.useState(!1),M=H(a.search);d.useLayoutEffect(()=>{if(M&&!a.search){b(!0);const E=setTimeout(()=>b(!1),2e3);return()=>{clearTimeout(E),b(!1)}}},[a.search]);const P=()=>{!j&&!a.search&&(zt.play(),o("/"))},A=d.useCallback(Pt((E,C)=>{const O=(n.length+C+E)%n.length;S(n[O].songs[0].index),Be.play()},700,{trailing:!1}),[n]),T=(E,C)=>{if(!(E!=null&&E.repeat))k("y",C);else{const O=n.findIndex(U=>!!U.songs.find(W=>W.index===f));A(C,O)}},F=(E,C=!1)=>{!C&&E===-1&&w&&!h?c([!0,"left"]):k("x",E)},_=d.useRef([]),ae=()=>{const E=Mn(r,_.current);S(E)};ge({accept:v,down:E=>T(E,1),up:E=>T(E,-1),left:()=>F(-1),right:()=>F(1),back:P,random:()=>{ae(),De.capture("selectRandom")}},e&&!h,[n,x,h,a,j]);const re=d.useMemo(()=>({"horizontal-vertical":null,accept:null,back:null,shiftR:null,remote:["search"]}),[]);_e(re,e);const z=d.useCallback(E=>{c([!1,E])},[c,F,n,x]);return d.useLayoutEffect(()=>{const[E,C]=g;E&&!h&&C===m&&F(m==="right"?1:-1,!0)},[h,m,w,y,...x]),Oe([f,p,S,h,z])};function zn(e,n){const{songList:s,prefilteredList:r,groupedSongList:a,filtersData:i,setFilters:o,filters:l,isLoading:c}=En(),g=Re(),[h,m]=d.useState(!0),f=b=>{$e(()=>{qe.flushSync(()=>{m(b)})}),Ge.play()},[p,x,k,S,y]=Tn(h,a,()=>f(!1),s.length,l,n),[w,v]=d.useState(!1);d.useEffect(()=>{if(!w&&s.length){const b=s.findIndex(A=>A.id===e),M=s.findIndex(A=>A.isNew);let P=Q(0,s.length-1);(b>-1||M>-1)&&(P=b),k(P),v(!0)}},[s,k,e]),d.useEffect(()=>{w&&s.length&&s[p]&&g(`/game/${encodeURIComponent(s[p].id)}`,{replace:!0,smooth:!1})},[w,p,s]);const j=s==null?void 0:s[p];return{prefilteredList:r,groupedSongList:a,focusedSong:p,focusedGroup:x,moveToSong:k,setKeyboardControl:f,keyboardControl:h,songPreview:j,songList:s??[],filtersData:i,filters:l,setFilters:o,showFilters:S,setShowFilters:y,isLoading:c}}const An=e=>{const n=At(e);return d.useMemo(()=>[{name:"All",filters:{}},{name:"Christmas",display:t.jsxs(t.Fragment,{children:[t.jsx("span",{style:{color:ve.christmasRed.text},children:"Chris"}),t.jsx("span",{style:{color:ve.christmasGreen.text},children:"tmas"})," 🎄"]}),filters:{genre:"christmas"}},{name:n[0].name,filters:{language:n[0].name}},n[1]?{name:n[1].name,filters:{language:n[1].name}}:null,{name:"Duets",filters:{duet:!0}},{name:"New",filters:{updatedAfter:$().subtract(31,"days").toISOString()}}].filter(s=>s!==null),[n])};function In({setFilters:e,active:n,closePlaylist:s,prefilteredList:r}){const a=An(r),{register:i,focused:o,focusElement:l}=te({enabled:n,additionalHelp:{vertical:void 0,"horizontal-vertical":null}});return d.useEffect(()=>{if(o){const c=a.find(g=>`playlist-${g.name}`===o);c&&e(c.filters)}},[o,a]),ge({left:()=>s("left"),right:()=>s("right")},n),t.jsx(Fn,{"data-test":"song-list-playlists",active:n,children:a.map(c=>t.jsx(Nn,{active:n,...i(`playlist-${c.name}`,()=>l(`playlist-${c.name}`)),...n?{}:{selected:`playlist-${c.name}`===o},children:c.display??c.name},c.name))})}const Fn=u("div",{target:"e1amx3cg1"})("background:rgba(0, 0, 0, ",e=>e.active?.75:.5,");width:100vh;transform-origin:top right;transform:rotate(-90deg);position:absolute;left:-100vh;top:0;font-size:3.6rem;box-sizing:border-box;display:flex;flex-direction:row-reverse;gap:0;h2{",N,";margin:0;}"),Nn=u(K,{target:"e1amx3cg0"})("font-size:3rem;justify-self:stretch;flex-grow:1;",e=>!e.focused&&e.active&&"background-color: transparent;",";padding:1.5rem;",e=>e.selected?It:!e.active&&"opacity: .75;",";");function Ln({onSongFiltered:e,filters:n}){const s=d.useRef(null),[r,a]=d.useState(!1);X("down",()=>{var c;(c=s.current)==null||c.blur()},{enabled:r,enableOnTags:["INPUT"]});const o=c=>{var h,m;const g=((h=n.search)==null?void 0:h.length)??0;g>1?e({...n,search:" "}):g===0&&c&&e({...n,search:c}),(m=s.current)==null||m.focus()};X(Ve,c=>{o(c.key)},{enabled:!r}),X("Backspace",c=>{o()},{enabled:!r});const l=c=>{e({...n,search:c.trim()})};return d.useEffect(()=>{var c;(c=s.current)==null||c.focus()},[s]),t.jsx(Rn,{"data-test":"song-list-search",children:t.jsx(Bn,{large:!0,children:t.jsx("form",{"data-test":"filters-search-form",onSubmit:c=>{var g;c.preventDefault(),(g=s.current)==null||g.blur()},children:t.jsx(He,{onFocus:()=>a(!0),onBlur:()=>a(!1),focused:r,label:"Search",value:n.search??"",onChange:l,ref:s,"data-test":"filters-search"})})})})}const Rn=u("div",{target:"e1vw0lol1"})({name:"t46wvs",styles:"background:rgba(0, 0, 0, 0.7);padding:2rem;font-size:3rem;box-sizing:border-box;display:flex;flex-direction:row;gap:2rem;position:fixed;z-index:200;top:4.5rem;left:30rem;right:30rem"}),Bn=u("div",{target:"e1vw0lol0"})("flex:",e=>e.large?1.5:1,";"),Dn=1e4;function _n({keyboardControl:e}){const[n,s]=d.useState(!1);d.useEffect(()=>{if(!e)s(!1);else{const a=setTimeout(()=>s(!0),Dn);return()=>clearTimeout(a)}},[e]);const[r]=B(he);return r?null:t.jsxs(On,{visible:n,children:["Can't decide? Click ",t.jsx(Ce,{children:"Shift"})," + ",t.jsx(Ce,{children:"R"})," to pick random song"]})}const On=u("div",{target:"e5qasxu1"})("@keyframes shake{2.5%,22.5%{transform:translate3d(-0.1rem, 0, 0);}5%,20%{transform:translate3d(0.2rem, 0, 0);}7.5%,12.5%,17.5%{transform:translate3d(-0.4rem, 0, 0);}10%,15%{transform:translate3d(0.4rem, 0, 0);}}animation:shake 5s both infinite;",N,";pointer-events:none;position:fixed;transform:scale(",e=>e.visible?1:0,");opacity:",e=>e.visible?1:0,";text-align:center;font-size:4.8rem;text-shadow:0 0 3.5rem black,0 0 3.5rem black,0 0 3.5rem black,0 0 3.5rem black,0 0 3.5rem black,0 0 3.5rem black,0 0 3.5rem black;width:100%;z-index:4;padding:2.5rem;transition:ease 500ms;"),Ce=u("kbd",{target:"e5qasxu0"})("margin:0.1rem;padding:0.2rem 2rem;border-radius:1.5rem;border:0.6rem solid rgb(204, 204, 204);border-bottom-color:rgb(150, 150, 150);border-right-color:rgb(150, 150, 150);line-height:1.4;display:inline-block;background-color:rgb(247, 247, 247);text-shadow:0 0.5rem 0 #fff;opacity:",e=>e.disabled?.25:1,";");var be={},$n=Nt;Object.defineProperty(be,"__esModule",{value:!0});var ot=be.default=void 0,qn=$n(Ft()),oe=t,Gn=(0,qn.default)([(0,oe.jsx)("path",{fillRule:"evenodd",d:"M16.67 13.13C18.04 14.06 19 15.32 19 17v3h4v-3c0-2.18-3.57-3.47-6.33-3.87z"},"0"),(0,oe.jsx)("circle",{cx:"9",cy:"8",r:"4",fillRule:"evenodd"},"1"),(0,oe.jsx)("path",{fillRule:"evenodd",d:"M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4c-.47 0-.91.1-1.33.24C14.5 5.27 15 6.58 15 8s-.5 2.73-1.33 3.76c.42.14.86.24 1.33.24zm-6 1c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"},"2")],"PeopleAlt");ot=be.default=Gn;const Vn=JSON.parse(`{
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
}`),Hn=["US","GB"];function Kn({song:e,...n}){const s=Array.isArray(e.language)?e.language[0]:e.language,r=d.useMemo(()=>{var a;return e.artistOrigin?((a=Vn[e.artistOrigin.toLowerCase()])==null?void 0:a.includes(s))??!1:!1},[e.artistOrigin,s]);return t.jsx(t.Fragment,{children:r&&!Hn.includes(e.artistOrigin)?t.jsx(je,{isocode:e.artistOrigin,...n}):e.language!=="English"?t.jsx(je,{language:e.language,...n}):null})}const Se=e=>{const[n,s]=d.useState(null),r=Ke(e),a=async()=>{s(await Ue(e))};return d.useEffect(()=>{a()},[r]),ne(I.songStatStored,a),n},Un=e=>async(n,s,r,a)=>{const i=Ke(e),o=await Ue(e),l=o.scores.map(g=>{if(g.setup.id!==n)return g;const h=g.scores.map(m=>m.name!==r||m.score!==s?m:{name:a.trim(),score:s});return{...g,scores:h}}),c={...o,scores:l};await Lt(e,c),I.songScoreUpdated.dispatch(i,c,a.trim())},ct=({song:e,focused:n,video:s,children:r,index:a,handleClick:i,background:o=!0,expanded:l=!1,...c})=>{const g=d.useCallback(()=>i?i(a):void 0,[i,a]);return t.jsxs(Jn,{...c,onClick:i?g:void 0,children:[o&&t.jsx(Qn,{style:{backgroundImage:`url('https://i3.ytimg.com/vi/${e.video}/hqdefault.jpg')`},focused:n,expanded:l}),t.jsxs(Xn,{expanded:l,children:[!l&&t.jsx(Zn,{song:e}),e.tracksCount>1&&!l&&t.jsxs(es,{"data-test":"multitrack-indicator",children:[t.jsx(ot,{}),"  Duet"]}),t.jsx(ye,{expanded:l,children:e.artist}),t.jsx(se,{expanded:l,children:e.title}),t.jsxs(lt,{expanded:l,children:[l&&t.jsxs(t.Fragment,{children:[e.author&&t.jsxs(ut,{expanded:l,children:["by ",e.authorUrl?t.jsx("a",{href:e.authorUrl,target:"_blank",rel:"noreferrer",children:e.author}):e.author]}),t.jsx(ts,{song:e})]}),!l&&t.jsx(Wn,{song:e})]})]}),r,s]})},Wn=u(Kn,{target:"eqdpxtq10"})({name:"1w2zyc9",styles:"height:2.75rem;object-fit:cover;border-top-right-radius:1rem;position:absolute;z-index:-1;left:0rem;bottom:0rem;opacity:0.95"}),lt=u("div",{target:"eqdpxtq9"})({name:"1dgv8bf",styles:"display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start"});var Yn={name:"1u0tp1t",styles:"align-items:flex-start;justify-content:flex-start"};const Xn=u("div",{target:"eqdpxtq8"})("width:100%;height:100%;display:flex;align-items:flex-end;justify-content:flex-end;z-index:1;box-sizing:border-box;flex-direction:column;",e=>e.expanded&&Yn,";"),Jn=u("div",{target:"eqdpxtq7"})({name:"1s4n252",styles:"font-size:4.5rem;display:flex;align-items:flex-end;justify-content:flex-end;flex-direction:column;box-sizing:border-box;position:relative;padding:0.5rem;border:0.1rem black solid;border-radius:1rem"}),Qn=u("div",{target:"eqdpxtq6"})("background-color:",R.colors.text.inactive,";position:absolute;z-index:-1;inset:0;",e=>e.theme.graphicSetting==="high"?V("background-size:",e.focused?100:110,"%;",e.focused?"":"filter: grayscale(90%);"," ",e.expanded?"filter: blur(10px);":""," transition:300ms;opacity:",e.focused?1:.8,";",""):V("background-size:100%;opacity:",e.focused?1:.6,";","")," background-position:center center;"),dt=u("span",{target:"eqdpxtq5"})("background:rgba(0, 0, 0, 0.7);width:auto;display:inline-block;padding:0.5rem;",N,";text-align:right;font-size:",({expanded:e})=>e?"6rem":"2.7rem",";"),ye=u(dt,{target:"eqdpxtq4"})("color:",R.colors.text.active,";"),se=u(dt,{target:"eqdpxtq3"})("margin-top:",e=>e.expanded?"1.5rem":"0.5rem",";color:white;"),ut=u(se,{target:"eqdpxtq2"})({name:"5twmqz",styles:"font-size:3rem;margin-top:3rem"}),Zn=({song:e})=>{var a,i;const n=Se(e),s=((i=(a=n==null?void 0:n.scores)==null?void 0:a.at(-1))==null?void 0:i.date)??!1,r=s&&$(s).isAfter($().subtract(1,"days"));return n!=null&&n.plays?t.jsx(gt,{"data-test":"song-stat-indicator",children:r?"Played today":n.plays}):null},gt=u("div",{target:"eqdpxtq1"})({name:"ohpsts",styles:"position:absolute;top:0.5rem;right:0.5rem;padding:0 1rem;height:2.75rem;min-width:2.75rem;box-sizing:border-box;border-radius:5rem;color:white;background:rgba(0, 0, 0, 0.75);font-size:1.4rem;display:flex;align-items:center;justify-content:center;text-transform:uppercase"}),es=u(gt,{target:"eqdpxtq0"})({name:"sq8m9a",styles:"left:0.5rem;right:auto;svg{width:1.75rem;height:1.75rem;}"}),ts=({song:e})=>{const n=Se(e);return t.jsx(ut,{children:n!=null&&n.plays?`Played ${n.plays} time${n.plays>1?"s":""}`:"Never played yet"})},Me={[L.DUEL]:"Duel",[L.PASS_THE_MIC]:"Pass The Mic",[L.CO_OP]:"Cooperation"},ce=["Hard","Medium","Easy"],ns=We("song_settings-game_mode-v3"),ss=We("song_settings-tolerance-v2");function as({songPreview:e,onNextStep:n,keyboardControl:s,onExitKeyboardControl:r}){const[a,i]=ns(null),o=a??(e.tracksCount>1?L.CO_OP:L.DUEL),[l,c]=ss(1),g=()=>{const p={id:Bt(),players:[],mode:o,tolerance:l+1};n(p)},h=()=>{i(Dt(Object.values(L),o))},m=()=>c(p=>Ye(ce,p,-1)),{register:f}=te({enabled:s,onBackspace:r});return t.jsxs(t.Fragment,{children:[t.jsx(Pe,{...f("difficulty-setting",m,"Change difficulty"),label:"Difficulty",value:ce[l],"data-test-value":ce[l]}),t.jsx(Pe,{...f("game-mode-setting",h,"Change mode"),label:"Mode",value:Me[o],"data-test-value":Me[o]}),t.jsxs(is,{children:[o===L.DUEL&&"Face off against each other - person that earns more points wins.",o===L.CO_OP&&"Join forces and sing together - your points will be added up to a single pool.",o===L.PASS_THE_MIC&&t.jsxs(t.Fragment,{children:["For more than 2 players - split into groups and pass the microphone within the group when prompted with"," ",t.jsx(Rt,{})," symbol."]})]}),t.jsx(rs,{...f("next-step-button",g,void 0,!0),children:"Next ➤"})]})}const rs=u(K,{target:"e1xayinb2"})({name:"sr8dp2",styles:"padding:0.5rem 9rem;font-size:4.3rem;width:50rem"}),is=u("h3",{target:"e1xayinb1"})({name:"rdh6te",styles:"max-width:50rem;margin:-1rem 0 1rem!important;padding:1.5rem;background:rgba(0, 0, 0, 0.7);box-sizing:border-box"}),Pe=u(Xe,{target:"e1xayinb0"})({name:"1tcj19k",styles:"font-size:4.3rem;padding:1rem;min-width:50rem;box-sizing:border-box"});function os(){const n=me(I.playerInputChanged,()=>D.getInputs()).some(o=>o.source==="Microphone"),s=d.useRef([]),r=d.useCallback(o=>{s.current.push(o)},[]);_t(0,50,r);const[a,i]=d.useState(!1);return d.useEffect(()=>{const o=setInterval(()=>{const l=s.current.filter(([,f])=>f===0),c=s.current.filter(([,f])=>f>0),g=l.reduce((f,[p])=>f+p,0)/(l.length+1),h=c.reduce((f,[p])=>f+p,0)/(c.length+1),m=c.length>l.length*.1&&h>.01&&g>.01&&h-g<g/2;i(m),s.current.length=0},a?5e3:2500);return()=>clearInterval(o)},[a]),t.jsxs(cs,{visible:a,children:[t.jsxs("h2",{children:[t.jsx("strong",{children:t.jsx(Ot,{})})," ","Noise detected"]}),t.jsx("hr",{}),t.jsxs("h4",{children:["This might make singing inaccurate. Make sure your microphone doesn't pick up the music."," ",n&&t.jsxs(t.Fragment,{children:["Alternatively, use your ",t.jsx("strong",{children:"smartphone as a microphone"})," instead."]})]})]})}const cs=u("div",{target:"elv6o00"})("opacity:",e=>e.visible?1:0,";transition:300ms;background:rgba(0, 0, 0, 0.75);padding:1rem;max-width:50rem;position:relative;top:-1rem;left:-0.5rem;");function ht({player:e}){const n=cn(e.number);return t.jsxs(ls,{"data-test":`indicator-player-${e.number}`,children:[t.jsx($t,{playerNumber:e.number}),t.jsx(ln,{status:n}),n!=="unavailable"&&t.jsx(qt,{playerNumber:e.number}),t.jsx(ds,{className:"ph-no-capture",children:e.getName()})]},e.number)}const ls=u("div",{target:"ey5ojlp1"})({name:"1gmoqr1",styles:"position:relative;border:0.1rem solid white;padding:1rem 3rem;background:black;width:80%;text-align:center;gap:1.25rem;font-size:2.3rem;color:white;-webkit-text-stroke:1px black"}),ds=u("span",{target:"ey5ojlp0"})({name:"179t5g5",styles:"position:relative;z-index:1"});function us(e){Je(I.playerNameChanged),d.useEffect(()=>{Qe.startMonitoring()},[]);const s=me(I.playerInputChanged,()=>D.getInputs()).some(r=>r.source!=="Dummy");return t.jsxs(gs,{...e,children:[t.jsxs(hs,{children:["Microphone Check",s?D.getPlayers().map(r=>t.jsx(ht,{player:r},r.number)):t.jsxs(t.Fragment,{children:[t.jsx(ms,{children:"Mic not setup"}),t.jsx("h4",{children:"Singing will be emulated"}),t.jsx("h5",{children:"You can setup in the Next step"})]})]}),t.jsx(os,{})]})}const gs=u("div",{target:"e1b6ju672"})("display:flex;font-size:3rem;",N,";margin-bottom:8.6rem;gap:3.5rem;"),hs=u("div",{target:"e1b6ju671"})({name:"fmwdml",styles:"gap:1.25rem;display:flex;flex-direction:column;align-items:center"}),ms=u("div",{target:"e1b6ju670"})({name:"1x5xnlp",styles:"position:relative;border:0.1rem solid white;padding:1rem 3rem;background:black;width:80%;text-align:center;gap:1.25rem;font-size:2.3rem;color:white"}),mt=d.forwardRef(({options:e,focused:n,label:s,value:r,onChange:a,disabled:i,placeholder:o,keyboardNavigationChangeFocus:l,onBlur:c,className:g,...h},m)=>{const f=d.useRef(null);d.useImperativeHandle(m,()=>f.current);const p=d.useRef(null),[x,k]=d.useState(!1),[S,y]=d.useState(-1),w=d.useMemo(()=>e.filter(b=>b.toLowerCase().trim().includes(r.toLowerCase().trim())&&b!==r),[e,r]),v=b=>{var M,P,A;if(b.code==="ArrowUp"||b.code==="ArrowDown")if(w.length){b.preventDefault();const T=Ye(w,S,b.code==="ArrowUp"?-1:1);y(T);const F=(M=p.current)==null?void 0:M.querySelector(`[data-index="${T}"]`);F==null||F.scrollIntoView({behavior:"smooth",block:"center"})}else(P=f.current)==null||P.blur(),l==null||l(b.code==="ArrowUp"?-1:1);else if(b.code==="Enter"){const T=w[S];T?(y(-1),a(T)):(A=f.current)==null||A.blur()}},j=()=>{setTimeout(()=>{k(!1),c==null||c()},300)};return t.jsxs(fs,{className:g,children:[t.jsx(He,{onFocus:()=>k(!0),onBlur:j,onKeyDown:v,onChange:a,value:r,focused:n,label:s,disabled:i,ref:f,placeholder:o,...h}),x&&!!w.length&&t.jsx(ps,{ref:p,role:"listbox",children:w.map((b,M)=>t.jsx(xs,{role:"listitem","data-index":M,"data-focused":M===S,focused:M===S,onClick:()=>{var P;a(b),y(-1),(P=f.current)==null||P.blur()},children:b},b))})]})}),fs=u("div",{target:"e1olyu0z2"})({name:"bjn8wh",styles:"position:relative"}),ps=u("div",{target:"e1olyu0z1"})("margin-top:0.1em;position:absolute;width:100%;background:black;max-height:",(1+2*.3)*4,"em;overflow-y:auto;z-index:2;"),xs=u("div",{target:"e1olyu0z0"})(N,";padding:0.3em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:",e=>e.focused?R.colors.text.active:"white",";cursor:pointer;"),bs=(e,n)=>{var s;return((s=e[n])==null?void 0:s.name)??`Track ${n+1}`};function Ss({multipleTracks:e,player:n,songPreview:s,playerNames:r,register:a,onChange:i,setup:o}){const[l,c]=d.useState(!1),g=d.useRef(null);if(Je(I.playerNameChanged),n===void 0)return null;const h=()=>i({number:n.number,track:(o.track+1)%s.tracksCount}),m=x=>{c(!0),n.setName(x)},f=!l,p=n.getName();return t.jsxs(t.Fragment,{children:[t.jsx(ys,{maxLength:Gt,className:"ph-no-capture",value:f?"":p,placeholder:f?p:void 0,options:r,onChange:m,label:"Name:",ref:g,...a(`player-${n.number}-name`,()=>{var x;return(x=g.current)==null?void 0:x.focus()})}),e&&t.jsx(vs,{...a(`player-${n.number}-track-setting`,h,"Change track"),label:"Track",value:bs(s.tracks,o.track),"data-test-value":o.track+1})]})}const ys=u(mt,{target:"eilnc831"})("input{font-size:4.5rem;}[role='listbox']{max-height:",6*(4.5+.3),"rem;}"),vs=u(Xe,{target:"eilnc830"})({name:"1bwrnjg",styles:"font-size:4.5rem;padding:1.1rem"});function js({songPreview:e,onNextStep:n,keyboardControl:s,onExitKeyboardControl:r}){const[a]=B(he),[i]=B(Vt),o=D.getPlayers(),l=!a&&o.length===2&&e.tracksCount>1,c=()=>o.map((j,b)=>({number:j.number,track:l?Math.min(b,e.tracksCount-1):0})),[g,h]=d.useState(c());ne([I.playerAdded,I.playerRemoved],()=>h(c()));const m=o.map((j,b)=>g.find(M=>M.number===j.number)??c()[b]),f=d.useMemo(()=>JSON.parse(sessionStorage.getItem(Ze))??[],[]),p=j=>b=>{h(M=>M.map(P=>P.number===j?b:P))},[x,k]=d.useState(!1);d.useEffect(()=>{x||Qe.startMonitoring()},[x]);const{register:S,focusElement:y}=te({enabled:s&&!x,onBackspace:r}),w=()=>{n(m)},v=!!i&&i!=="skip";return t.jsxs(t.Fragment,{children:[x&&t.jsx(dn,{closeButtonText:v?"Continue to the song":"Continue to player setup",onClose:()=>{k(!1),v&&y("play")}}),m.map((j,b)=>t.jsxs(ws,{children:[t.jsxs(ks,{children:["Player ",b+1]}),t.jsx("div",{children:t.jsx(Ss,{multipleTracks:l,player:D.getPlayer(j.number),setup:j,onChange:p(j.number),playerNames:f,register:S,songPreview:e})})]},j.number)),v&&t.jsx(Te,{...S("play-song-button",w,void 0,!0),children:"Play"}),t.jsx(Te,{...S("select-inputs-button",()=>k(!0),void 0,!1),children:"Setup mics"})]})}const ws=u("div",{target:"ee5oup2"})({name:"ho1qnd",styles:"display:flex;flex-direction:row"}),Te=u(K,{target:"ee5oup1"})({name:"afgxf2",styles:"padding:0.5rem 9rem;font-size:4.3rem"}),ks=u("span",{target:"ee5oup0"})(N,";padding:1.3rem;font-size:4.5rem;");function Es({songPreview:e,onPlay:n,keyboardControl:s,onExitKeyboardControl:r}){const[a,i]=d.useState(null),[o,l]=d.useState("song"),c=h=>{i(h),l("players")},g=h=>{if(!a)return;const m={...a,players:h};I.songStarted.dispatch(e,m),n({song:e,...m})};return t.jsxs(Cs,{children:[t.jsx(us,{style:o==="players"?{viewTransitionName:"player-mic-check-container"}:void 0}),t.jsxs(Ms,{children:[o==="song"&&t.jsx(as,{songPreview:e,onNextStep:c,keyboardControl:s,onExitKeyboardControl:r}),o==="players"&&t.jsx(js,{songPreview:e,onNextStep:g,keyboardControl:s,onExitKeyboardControl:()=>l("song")})]})]})}const Cs=u("div",{target:"e1of12hx1"})({name:"k6gb66",styles:"display:flex;flex-direction:row;align-items:flex-end;justify-content:space-between;width:100%;hr{margin:1rem;opacity:0.25;}"}),Ms=u("div",{target:"e1of12hx0"})({name:"115sh08",styles:"width:auto;display:flex;flex-direction:column;align-items:flex-end;gap:1.25rem"});function Ps(e){return G(e.genre??"")==="christmas"}const Ts=30,zs=e=>{const[n,s]=B(et),r=Ps(e);pe(!0,r),d.useEffect(()=>{r&&s(!0)},[]),d.useEffect(()=>{!n&&r?s(!0):n&&!r&&s(!1)},[e])};function As({songPreview:e,top:n,left:s,width:r,height:a,keyboardControl:i,onExitKeyboardControl:o,onPlay:l,focusEffect:c}){const[g,h]=d.useState(!1),m=d.useRef(null),{width:f,height:p}=fe();zs(e);const x=i;d.useLayoutEffect(()=>{h(!1)},[e.video]);const k=e.previewStart??(e.videoGap??0)+60,S=e.previewEnd??k+Ts,y=d.useMemo(()=>[e.video,k,S,e.volume],[e.video,k,S,e.volume]),[w,v,j,b]=Ht(y,350);d.useEffect(()=>{var T;(T=m.current)==null||T.loadVideoById({videoId:w,startSeconds:v,endSeconds:j})},[w,m,v,j]);const M=x?f:r,P=x?p:a,A=x?Math.min(f/20*9,p*(4/5)):a;return d.useEffect(()=>{var T;(T=m.current)==null||T.setSize(M,P)},[M,P,i]),t.jsxs(t.Fragment,{children:[x&&t.jsx(Ls,{onClick:o}),!x&&g&&t.jsx(Os,{width:M,height:P,left:s,top:n,song:e}),t.jsx(Ns,{background:x||g,video:t.jsx(Bs,{show:g,expanded:x,height:A,id:"preview-video-container",children:t.jsx(Kt,{width:0,height:0,disablekb:!0,ref:m,video:"",volume:b,onStateChange:T=>{var F,_;T===Z.ENDED?((F=m.current)==null||F.seekTo(k),(_=m.current)==null||_.playVideo()):T===Z.PLAYING&&h(!0)}})}),focused:!0,song:e,top:n,left:s,width:M,height:A,showVideo:g,expanded:x,"data-test":"song-preview","data-song":e.id,children:t.jsx(Ds,{expanded:x,children:x&&t.jsx(Es,{songPreview:e,onPlay:l,keyboardControl:i,onExitKeyboardControl:o})})})]})}var Is={name:"17gota2",styles:"border:0;border-radius:0;position:fixed;padding:var(--preview-padding)"};const Fs=u(ct,{target:"evapa6h4"})("--preview-padding:5rem;width:",e=>e.width,"px;height:",e=>e.height,"px;position:absolute;z-index:",e=>e.expanded?201:3,";overflow:hidden;visibility:",e=>e.expanded||e.showVideo?"visible":"hidden",";",e=>e.expanded?Is:V("pointer-events:none;",e.showVideo&&e.theme.graphicSetting==="high"?"animation: rhythmPulse 1s infinite":"scale: 1.2",";",""),";@keyframes rhythmPulse{0%{transform:scale(1.2);}15%{transform:scale(1.25);}100%{transform:scale(1.2);}}view-transition-name:song-preview;",ye,"{view-transition-name:song-preview-artist;}",se,"{view-transition-name:song-preview-title;}",lt,"{view-transition-name:song-preview-expanded-data;}"),Ns=e=>{const n=e.song.realBpm??(e.song.bpm>300?e.song.bpm/4:e.song.bpm/2);return t.jsx(Fs,{style:{top:e.expanded?`calc(50vh - ${e.height}px / 2)`:e.top,left:e.expanded?0:e.left,animationDuration:`${60/n}s`},...e})},Ls=u("div",{target:"evapa6h3"})({name:"1iz7jdz",styles:"position:fixed;top:0;left:0;background:rgba(0, 0, 0, 0.8);width:100vw;height:100vh;z-index:201"});var Rs={name:"pfrwim",styles:"position:absolute;top:0;left:0;background-image:none!important;border-radius:0.5rem"};const Bs=u("div",{target:"evapa6h2"})(e=>e.expanded?V("position:fixed;inset:0;clip-path:inset(calc((100vh - ",e.height,"px) / 2) 0);",""):Rs," div{opacity:",({show:e})=>e?1:0,";transition:",({show:e,expanded:n})=>e||n?1e3:0,"ms;}"),Ds=u("div",{target:"evapa6h1"})("inset:auto var(--preview-padding);position:fixed;z-index:100;",e=>!e.expanded&&"transform: scale(0.1);"," border-radius:0.5rem;view-transition-name:song-preview-content;"),_s=u("div",{target:"evapa6h0"})("background:white;width:",e=>e.width,"px;height:",e=>e.height,"px;z-index:2;top:0;left:0;position:absolute;animation:bpm 1s infinite;border-radius:0.5rem;pointer-events:none;@keyframes bpm{0%{transform:scale(1.15);opacity:1;}100%{transform:scale(1.45);opacity:0;}}"),Os=e=>{const[n]=B(Fe);if(n==="low")return null;const s=e.song.realBpm??(e.song.bpm>300?e.song.bpm/4:e.song.bpm/2);return t.jsx(_s,{width:e.width,height:e.height,style:{left:e.left,top:e.top,animationDuration:`${60/s}s`}})};let le=0;function ft(){d.useEffect(()=>(document.body.classList.add("blockOverflow"),document.documentElement.classList.add("blockOverflow"),le++,()=>{le--,le===0&&(document.body.classList.remove("blockOverflow"),document.documentElement.classList.remove("blockOverflow"))}),[])}const $s=1.2,ze=4;function qs({onSongSelected:e,preselectedSong:n}){const[s]=B(he),r=s?ze-1:ze;tt(!1),pe(!0),ft();const[{previewTop:a,previewLeft:i,previewWidth:o,previewHeight:l},c]=d.useState({previewTop:0,previewLeft:0,previewWidth:0,previewHeight:0}),{focusedGroup:g,focusedSong:h,moveToSong:m,groupedSongList:f,keyboardControl:p,songPreview:x,setKeyboardControl:k,setFilters:S,filters:y,setShowFilters:w,showFilters:v,prefilteredList:j,isLoading:b}=zn(n,r);X(Ve,z=>{z.stopPropagation(),z.preventDefault(),S({search:z.key})},{enabled:!y.search&&p});const P=d.useCallback(z=>{p&&S({search:z})},[p]);ne(I.remoteSongSearch,P);const A=d.useRef(null),{width:T,handleResize:F}=fe(),_=H(g),ae=H(h);d.useEffect(()=>{var O,U,W;const z=(yt,vt)=>`[data-group-letter="${yt}"] [data-index="${vt}"]`;F();const E=(O=A.current)==null?void 0:O.querySelector(z(_,ae)),C=(U=A.current)==null?void 0:U.querySelector(z(g,h));C&&((!E||E.offsetTop!==C.offsetTop)&&((W=C.scrollIntoView)==null||W.call(C,{behavior:"smooth",inline:"center",block:"center"})),c({previewLeft:C.offsetLeft,previewTop:C.offsetTop,previewWidth:C.offsetWidth,previewHeight:C.offsetHeight}))},[T,A,h,g,f]);const re=d.useCallback(()=>k(!1),[k]);return!f||!T?t.jsx(t.Fragment,{children:"Loading"}):b?t.jsx(Qs,{children:t.jsx(nt,{size:"15em",color:"secondary"})}):t.jsxs(Vs,{songsPerRow:r,children:[x&&t.jsx(Hs,{videoId:x.video}),y.search?t.jsx(Ln,{showFilters:v,onSongFiltered:S,filters:y}):t.jsx(_n,{keyboardControl:p}),t.jsxs(Ws,{ref:A,active:p,"data-test":"song-list-container",dim:v,children:[f.length===0&&t.jsx(Us,{children:"No songs found"}),x&&t.jsx(As,{songPreview:x,onPlay:e,keyboardControl:!p,onExitKeyboardControl:()=>k(!0),top:a,left:i,width:o,height:l,focusEffect:!v}),f.map(z=>d.createElement(Ks,{...v||!p?{"data-unfocusable":!0}:{},key:z.letter,"data-group-letter":z.letter,highlight:z.letter==="New"},t.jsx(pt,{children:z.letter}),t.jsx(Ys,{children:z.songs.map(({song:E,index:C})=>t.jsx(Js,{song:E,handleClick:h===C?re:m,focused:!v&&p&&C===h,index:C,"data-index":C,"data-focused":!v&&p&&C===h,"data-test":`song-${E.id}${z.isNew?"-new-group":""}`},E.id))}))),t.jsxs(Gs,{children:["Missing a song? Try ",t.jsx("a",{href:"/convert",children:"adding one"})," yourself!"]})]}),t.jsx(In,{setFilters:S,active:v,closePlaylist:w,prefilteredList:j})]})}const Gs=u("span",{target:"ef4zhl29"})(N,";text-align:center;font-size:5rem;margin-top:10rem;"),Vs=u("div",{target:"ef4zhl28"})("display:flex;flex-direction:row;max-height:100vh;--song-list-gap:3.5rem;--song-item-width:",e=>`calc(${100/e.songsPerRow}% - ((${e.songsPerRow-1} / ${e.songsPerRow}) * var(--song-list-gap)))`,";--song-item-ratio:calc(16 / 9 * (4 / ",e=>e.songsPerRow,"));"),Hs=u(Sn,{target:"ef4zhl27"})({name:"1i2rgvj",styles:"position:fixed;inset:0;width:100%;height:100%;filter:blur(5px) grayscale(90%);opacity:0.25;object-fit:cover"}),Ks=u("div",{target:"ef4zhl26"})("padding:0 4.5rem 0 11rem;",e=>e.highlight&&V("background:rgba(0, 0, 0, 0.5);padding-bottom:3rem;border-bottom:0.2rem solid black;",pt,"{animation:new-song-group-header 600ms ease-in-out infinite both;background:#ffffff;@keyframes new-song-group-header{0%,100%{transform:scale(1);}50%{transform:scale(1.1);}}}",""),";"),Us=u("div",{target:"ef4zhl25"})(N,";display:flex;align-items:center;justify-content:center;flex:1;font-size:10rem;"),pt=u("div",{target:"ef4zhl24"})(N,";display:inline-block;padding:0.5rem 1rem;margin-bottom:2rem;font-size:3.5rem;position:sticky;z-index:1;top:calc(-1 * var(--song-list-gap));color:",R.colors.text.active,";background:rgba(0, 0, 0, 0.7);"),Ws=u("div",{target:"ef4zhl23"})("position:relative;flex:1 1 auto;display:flex;flex-direction:column;gap:var(--song-list-gap);padding:4.5rem 0;overflow-y:auto;overflow-x:clip;box-sizing:border-box;min-height:100vh;max-height:100vh;::-webkit-scrollbar{display:none;}transition:opacity 500ms;opacity:",e=>e.dim?.5:1,";"),Ys=u("div",{target:"ef4zhl22"})({name:"bviq7b",styles:"display:flex;flex-direction:row;flex-wrap:wrap;gap:var(--song-list-gap)"});var Xs={name:"1jwmbuq",styles:"transition:300ms"};const Js=d.memo(u(ct,{target:"ef4zhl21"})("cursor:pointer;flex-basis:var(--song-item-width);aspect-ratio:var(--song-item-ratio);",e=>e.theme.graphicSetting==="high"&&Xs," transform:scale(",e=>e.focused?$s:1,");",e=>e.focused&&"z-index: 2;"," ",e=>e.focused&&Ut," content-visibility:auto;contain-intrinsic-size:calc(var(--song-item-width) * (1 / var(--song-item-ratio)));")),Qs=u("div",{target:"ef4zhl20"})({name:"101j4br",styles:"display:flex;align-items:center;justify-content:center;height:100vh"});function Zs(e){const[n,s]=B(Le),[r,a]=d.useState(n===null),i=()=>{s(n??[]),a(!1)};return r?t.jsx(Wt,{onClose:i,closeText:"Continue to Song Selection"}):t.jsx(qs,{...e})}function xt(){d.useEffect(()=>{try{document.body.requestFullscreen().catch(console.info)}catch{}},[])}const ea="/christmas/assets/459342__papaninkasettratat__cinematic-music-short-RLBkkUq3.mp3",q=e=>new Promise(n=>setTimeout(n,e)),de=15;function ta({onFinish:e}){const n=d.useRef(null),[s,r]=d.useState(!1),[a,i]=d.useState([]);ne(I.readinessConfirmed,c=>{i(g=>[...g,c])});const o=me([I.inputListChanged,I.readinessConfirmed],()=>D.getPlayers().map((c,g)=>[c.input.deviceId,c.getName(),c]));d.useEffect(()=>{(async()=>{var f,p,x;let c=!1;const g=D.requestReadiness().then(()=>{c=!0,r(!0)}),h=q(1500),m=q(de*1e3);await q(250),c||await((f=n==null?void 0:n.current)==null?void 0:f.play()),await Promise.race([Promise.all([g,h]),m]),(p=n==null?void 0:n.current)!=null&&p.paused||Yt.play(),await q(500),(x=n==null?void 0:n.current)==null||x.pause(),await q(1e3),e()})()},[]);const l=o.map(([c,g,h])=>({confirmed:a.includes(c),name:g,player:h}));return t.jsxs(t.Fragment,{children:[t.jsxs(na,{children:[!s&&t.jsxs("span",{children:["Waiting for all players to click ",t.jsx("strong",{children:'"Ready"'})]}),t.jsx(aa,{children:l.map(({confirmed:c,name:g,player:h},m)=>t.jsxs(ra,{className:"ph-no-capture","data-test":"player-confirm-status","data-name":g,"data-confirmed":c,children:[!s&&t.jsx(ia,{children:c?t.jsx(bn,{}):t.jsx(nt,{color:"info",size:"1em"})})," ",t.jsx(ht,{player:h})]},m))}),!s&&t.jsxs(sa,{children:["The song will start automatically in"," ",t.jsx("strong",{children:t.jsx(st,{end:0,start:de,duration:de,useEasing:!1})})]})]}),t.jsx("audio",{src:ea,ref:n,hidden:!0,autoPlay:!1,onPlay:c=>{c.currentTarget.volume=.8}})]})}const na=u("div",{target:"e1sds9f4"})("top:0;left:0;z-index:1000;display:flex;align-items:center;justify-content:center;flex-direction:column;position:absolute;width:100%;height:100%;gap:5rem;font-size:5rem;",N,";"),sa=u("span",{target:"e1sds9f3"})({name:"1umnjfm",styles:"font-size:5rem"}),aa=u("div",{target:"e1sds9f2"})({name:"1uxgijs",styles:"display:flex;flex-direction:column;gap:5rem;width:50rem;view-transition-name:player-mic-check-container"}),ra=u("div",{target:"e1sds9f1"})({name:"174652e",styles:"display:flex;align-items:center;gap:2rem;transform:scale(1.5)"}),ia=u("span",{target:"e1sds9f0"})({name:"1l5xwqu",styles:"svg{width:5rem;height:5rem;stroke:black;}"}),oa=250,ue=(e,n=0,s=1/0)=>e.filter(at).filter(r=>rt([r])>=n).filter(r=>ee([r])<=s).reduce((r,a)=>r+a.notes.reduce((i,o)=>i+o.length,0),0),ca=(e,n)=>{const[s,...r]=e.filter(at),a=[[s]];return r.forEach(i=>{const o=a.at(-1),l=ee(o);(rt([i])-l)*n>oa?a.push([i]):o.push(i)}),a},bt=(e,n)=>e+n,Ae=e=>{const n=e.map(s=>s.reduce(bt,0));return Math.max(...n)-Math.min(...n)},la=(e,n)=>{const s=un(e),r=i=>{if(s[i-1].length<2)return;const o=s[i-1].pop();s[i].push(o)},a=i=>{var c;if(((c=s[i+1])==null?void 0:c.length)<2)return;const[o,...l]=s[i+1];s[i].push(o),s[i+1]=l};return n%2===1?r(Math.ceil(n/2)):a(Math.ceil(n/2)),s},da=e=>e.reduce(bt,0);function ua(e){const s=Xt(e);return e.tracks.map(r=>{if(r.sections.length<3)return[];const a=ca(r.sections,s);let i=[],o=[ue(a[0])];for(let l=0;l<a.length-2;l++){const c=a[i.flat().length-1]??[],h=ue(r.sections,ee(c)??0)/(1+9-i.length),m=ue(a[l+1]),f=da(o);f+m<h?o=[...o,m]:h-f<f+m-h?(i.push(o),o=[m]):(i.push([...o,m]),o=[])}for(let l=0;l<100;l++){const c=Ae(i),g=Jt((i.length-2)*2+2).map(p=>la(i,p)),h=g.map(Ae),m=Math.min(...h);if(c<=m)break;const f=h.indexOf(m);i=g[f]}return i.map(l=>l.length).reduce((l,c)=>[...l,(l.at(-1)??0)+c],[]).map(l=>ee(a[l-1]))})}const Ie=[t.jsxs(t.Fragment,{children:["You can follow the updates and give feedback on the game through the Facebook Page:"," ",t.jsx("a",{href:"https://www.facebook.com/allkaraoke.party",target:"_blank",rel:"noreferrer",children:t.jsx("strong",{children:"fb.com/AllKaraoke.Party"})})]}),t.jsxs(t.Fragment,{children:["Start typing a name of a song in ",t.jsx("strong",{children:"Song Selection"})," to active Search feature"]}),t.jsxs(t.Fragment,{children:["Narrow down songs through ",t.jsx("strong",{children:"playlists"})," on the right in Song Selection"]}),t.jsxs(t.Fragment,{children:["Select ",t.jsx("strong",{children:"Pass The Mic"})," Game Mode to share the microphones and sing in a team"]}),t.jsxs(t.Fragment,{children:["Your scores and ",t.jsx("strong",{children:"stats are saved"})," in this browser - they will be available for the next party!"]}),t.jsxs(t.Fragment,{children:["You can remove irrelevant songs from the Song Selection in ",t.jsx("strong",{children:"Edit Songs"})," page"]}),t.jsxs(t.Fragment,{children:["If the game feels a bit jaggy with low FPS, check out ",t.jsx("strong",{children:"Settings"})," page"]}),t.jsxs(t.Fragment,{children:["Party is only getting started? Play ",t.jsx("strong",{children:"Jukebox"})," for the music and to see what songs are available"]}),t.jsxs(t.Fragment,{children:["Research shows that ",t.jsx("strong",{children:"duet songs"})," are that bit more fun than simple one-track ones"]}),t.jsxs(t.Fragment,{children:["Want to sing a ",t.jsx("strong",{children:"new song"}),"? Find UltraStar version of it and import it with",t.jsx("br",{}),t.jsx("strong",{children:"Convert Ultrastar .txt"})]}),t.jsxs(t.Fragment,{children:["The ",t.jsx("strong",{children:"white pulse"})," around selected song in Song Selection tries to match song's tempo"]}),t.jsxs(t.Fragment,{children:["Entire game (besides add/edit song) is navigable with ",t.jsx("strong",{children:"Keyboard"})]}),t.jsxs(t.Fragment,{children:["You can hide or show keyboard navigation help with ",t.jsx("kbd",{children:"H"})," key"]}),t.jsxs(t.Fragment,{children:["In Song Selection, hold ",t.jsx("kbd",{children:"↑"})," or ",t.jsx("kbd",{children:"↓"})," to jump to the next letter"]}),t.jsxs(t.Fragment,{children:["Add ",t.jsx("strong",{children:"vibrato"})," to the notes you sing to get additional ",t.jsx("strong",{children:"bonus points"})]}),t.jsxs(t.Fragment,{children:["You can control the game with your phone - click on the"," ",t.jsxs("strong",{children:[t.jsx(Qt,{}),"QR Code Icon"]})," ","on the top right and follow the instructions"]})],ga=({as:e="h4",...n})=>{const s=d.useRef(Q(0,Ie.length-1)),r=e;return t.jsx(r,{...n,children:Ie[s.current]})};function ha({...e}){const[n,s]=d.useState(""),r=d.useRef(null);return d.useEffect(()=>{const a=setTimeout(()=>{s(xe.getVideo())},1e3);return()=>{clearTimeout(a)}},[]),d.useEffect(()=>{try{r.current&&(r.current.playbackRate=16)}catch(a){Ne(a)}},[n]),t.jsx(ma,{...e,children:t.jsx(fa,{src:n,ref:r,loop:!0,autoPlay:!0,className:"ph-no-capture"})})}const ma=u("div",{target:"egk8upf1"})({name:"1g34f1k",styles:"width:80rem;height:60rem"}),fa=u("video",{target:"egk8upf0"})({name:"idj2s4",styles:"object-fit:cover;width:100%;height:100%"});function pa(e){return 1-Math.pow(1-e,3)}function xa(e){return pa(e)}function Y({color:e,maxScore:n,score:s}){return t.jsx(ba,{style:{border:s===0?0:void 0,width:`${xa(s/n)*24}%`,backgroundColor:e}})}const ba=u("div",{target:"epk9dli0"})({name:"1vc31u",styles:`background-image:linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.17) 0%,
    rgba(0, 0, 0, 0.03) 50%,
    rgba(0, 0, 0, 0.18) 51%,
    rgba(0, 0, 0, 0.18) 100%
  );transition:1s;border-radius:0.5rem;height:100%;border:solid 0.1rem black;box-sizing:border-box`});function Sa({playerNumber:e,player:n,segment:s}){const[r,a]=n.detailedScore;return t.jsxs(ya,{children:[t.jsx(Y,{score:s>-1?r.rap+r.freestyle+r.normal:0,maxScore:a.rap+a.freestyle+a.normal,color:R.colors.players[e].perfect.fill}),t.jsx(Y,{score:s>0?r.perfect:0,maxScore:a.perfect,color:R.colors.players[e].stroke}),t.jsx(Y,{score:s>1?r.star:0,maxScore:a.star,color:R.colors.players[e].starPerfect.stroke}),t.jsx(Y,{score:s>2?r.vibrato:0,maxScore:a.vibrato,color:R.colors.players[e].perfect.stroke}),t.jsx(va,{children:s<5&&t.jsx(Zt,{options:{strings:["Regular notes","Perfect notes","Star notes","Vibrato"],pauseFor:1e3,autoStart:!0,delay:15,deleteSpeed:15,cursor:""}})})]})}const ya=u("div",{target:"e10trgut1"})({name:"yex4ym",styles:"position:relative;height:4rem;width:100rem;background:rgba(0, 0, 0, 0.5);display:flex;flex-direction:row;padding:0.5rem;border-radius:1rem;gap:0.5rem"}),va=u("span",{target:"e10trgut0"})("position:absolute;",N,";font-size:3rem;text-align:right;white-space:nowrap;top:5rem;left:1rem;display:block;");function ja({playerNumber:e,player:n,highestScore:s,highScores:r,singSetup:a,useColors:i=!0,revealHighScore:o,segment:l}){const[c]=n.detailedScore;let g=0;l>-1&&(g=c.normal+c.rap+c.freestyle),l>0&&(g=g+c.perfect),l>1&&(g=g+c.star),l>2&&(g=g+c.vibrato);const h=m=>r.some(f=>f.singSetupId===a.id&&f.name===m);return t.jsxs(wa,{children:[t.jsx(St,{color:i?R.colors.players[e].text:"","data-test":`player-${e}-name`,className:"ph-no-capture",children:n.name}),t.jsx(Ea,{children:t.jsxs(ka,{highscore:o&&h(n.name),color:i?R.colors.players[e].text:"",win:o&&g===s,"data-test":`player-${e}-score`,"data-score":g,children:[t.jsx(st,{preserveValue:!0,end:g,formattingFn:gn.format,duration:l<5?1:.5}),t.jsx(Ca,{highscore:o&&h(n.name),children:"High score!"})]})}),t.jsx(Sa,{playerNumber:e,player:n,segment:l})]})}const wa=u("div",{target:"e1hn1x414"})({name:"1kdaoj4",styles:"display:flex;flex-direction:column;align-items:center;gap:1.5rem"}),St=u(en,{target:"e1hn1x413"})("padding-left:10rem;padding-right:10rem;font-size:3.5rem;color:",e=>e.color,";"),ka=u(St,{target:"e1hn1x412"})("font-size:",e=>e.win?"8.5rem":"5.5rem",";color:",e=>e.win?R.colors.text.active:"white",";transition:400ms ease-in-out;position:relative;"),Ea=u("div",{target:"e1hn1x411"})({name:"f9rldz",styles:"height:8.5rem"}),Ca=u(tn,{target:"e1hn1x410"})("top:-1.5rem;right:-10rem;font-size:3rem;",e=>e.highscore&&nn,";opacity:",e=>e.highscore?"1":"0",";transition:400ms;");function Ma({onNextStep:e,players:n,highScores:s,singSetup:r}){const[a,i]=d.useState(-1);d.useEffect(()=>{if(a<0)i(0);else if(a<4){const p=setInterval(()=>{i(x=>x+1)},1500);return()=>{clearInterval(p)}}},[a]);const o=a>3,l=()=>{o?e():(De.capture("animation_skipped"),i(5))};ge({accept:l},!0,[a]);const c=d.useMemo(()=>({accept:"Next"}),[]);_e(c,!0);const g=r.mode===L.CO_OP,h=g?[{...n[0],name:n.map(p=>p.name).join(", ")}]:n,m=h.map(p=>sn(p.detailedScore[0])),f=Math.max(...m);return t.jsxs(t.Fragment,{children:[t.jsx(Pa,{children:h.map((p,x)=>t.jsx(ja,{playerNumber:p.playerNumber,useColors:!g,revealHighScore:a>3,segment:a,player:p,highScores:s,highestScore:f,singSetup:r},x))}),t.jsx(Ta,{onClick:l,focused:!0,"data-test":o?"highscores-button":"skip-animation-button",children:o?"Next":"Skip"}),xe.getPermissionStatus()&&t.jsx(za,{})]})}const Pa=u("div",{target:"ez8rfb42"})({name:"nvdiyi",styles:"position:absolute;top:20rem;width:100%;text-align:center;display:flex;flex-direction:column;gap:2rem"}),Ta=u(K,{target:"ez8rfb41"})({name:"dmbiod",styles:"position:absolute;bottom:4rem;right:2rem;width:40rem;font-size:1.9vw"}),za=u(ha,{target:"ez8rfb40"})({name:"1c3jvq",styles:"position:absolute;top:calc(50% - 30rem);left:95rem;transform:scale(0.75)"});function Aa(){return d.useMemo(()=>JSON.parse(sessionStorage.getItem(Ze))??[],[])}function Ia({score:e,register:n,singSetupId:s,onSave:r,index:a}){const i=d.useRef(null),[o,l]=d.useState(""),c=Aa(),g=()=>{o.trim().length&&o.trim()!==e.name&&r(s,e.score,e.name,o)};return t.jsx(mt,{className:"ph-no-capture",options:c,onChange:l,onBlur:g,value:o,label:"",ref:i,...n(`highscore-rename-${a}`,()=>{var h;return(h=i.current)==null?void 0:h.focus()}),placeholder:e.name,"data-test":"input-edit-highscore","data-original-name":e.name})}function Fa({onNextStep:e,highScores:n,singSetup:s,song:r}){const{register:a}=te(),i=Un(r);return t.jsxs(t.Fragment,{children:[t.jsx(Na,{"data-test":"highscores-container",children:n.map((o,l)=>t.jsxs(La,{isCurrentSing:o.singSetupId===s.id,children:[t.jsx(Ra,{children:l+1}),t.jsx(Ba,{className:"ph-no-capture",children:o.singSetupId===s.id?t.jsx(Ia,{index:l,score:o,register:a,singSetupId:s.id,onSave:i}):o.name}),t.jsx(Da,{children:t.jsx(hn,{score:o.score})}),t.jsx(_a,{children:$(o.date).format("MMMM DD, YYYY")})]},l))}),t.jsx(Oa,{...a("play-next-song-button",e,void 0,!0),children:"Select song"})]})}const Na=u("div",{target:"e161j45v6"})({name:"9gtmjg",styles:"position:absolute;top:20rem;width:100%;text-align:center;padding:0 16rem;box-sizing:border-box"}),La=u("div",{target:"e161j45v5"})("position:relative;",N,";font-size:3.2rem;display:flex;background:",e=>e.isCurrentSing?"rgba(0,0,0,.9)":"rgba(0,0,0,.5)",";margin-bottom:2rem;padding:",e=>e.isCurrentSing?"0 1.5rem":"1rem 3.2rem",";align-items:center;"),Ra=u("div",{target:"e161j45v4"})("padding:0 1.6rem;color:",R.colors.text.active,";"),Ba=u("div",{target:"e161j45v3"})({name:"1mbe2e5",styles:"text-align:left;flex:1;padding:1.6rem"}),Da=u("div",{target:"e161j45v2"})({name:"2ycp6t",styles:"padding:0 1rem"}),_a=u("div",{target:"e161j45v1"})({name:"1gbnj87",styles:"position:absolute;font-size:2rem;bottom:-1rem;right:-1.6rem;background:black;padding:0.5rem"}),Oa=u(K,{target:"e161j45v0"})({name:"dmbiod",styles:"position:absolute;bottom:4rem;right:2rem;width:40rem;font-size:1.9vw"});function $a({song:e,width:n,height:s,onClickSongSelection:r,players:a,highScores:i,singSetup:o}){const[l]=B(et);tt(!0);const[c,g]=d.useState("results");return t.jsxs(an,{songData:e,width:n,height:s,children:[t.jsxs(qa,{children:[c==="results"&&t.jsx(Ma,{onNextStep:()=>g("highscores"),players:a,singSetup:o,highScores:i}),c==="highscores"&&t.jsx(Fa,{onNextStep:r,singSetup:o,highScores:i,song:e}),t.jsx(Ga,{$active:!0})]}),l&&t.jsxs(Va,{children:["Credit to ",t.jsx("a",{href:"https://www.FesliyanStudios.com",children:"https://www.FesliyanStudios.com"})," for the background music."]})]})}const qa=u("div",{target:"ehc5trj2"})({name:"1quw0ni",styles:"pointer-events:auto"}),Ga=u(ga,{shouldForwardProp:e=>!e.startsWith("$"),target:"ehc5trj1"})("transition:300ms;transform:scale(",({$active:e})=>e?1:0,");position:absolute;bottom:20rem;font-size:3.2rem;line-height:1.25;color:white;text-align:center;background:rgba(0, 0, 0, 0.75);width:100%;box-sizing:border-box;padding:2rem 10rem;kbd{padding:0.12rem 0.9rem;border-radius:1rem;border:0.5rem solid rgb(204, 204, 204);border-bottom-color:rgb(150, 150, 150);border-right-color:rgb(150, 150, 150);color:rgb(51, 51, 51);line-height:1.4;display:inline-block;box-shadow:0 0.1rem 0 rgba(0, 0, 0, 0.2),inset 0 0 0 0.2rem #ffffff;background-color:rgb(247, 247, 247);text-shadow:0 0.1rem 0 #fff;font-weight:normal;}"),Va=u("span",{target:"ehc5trj0"})("position:fixed;bottom:2rem;left:2rem;font-size:1.5rem;",N,";");function Ha(e,n){const s=Se(e);return d.useMemo(()=>s==null?void 0:s.scores.filter(({setup:a})=>a.mode===n.mode&&a.tolerance===n.tolerance).map(a=>a.scores.map(i=>({...i,date:a.date,singSetupId:a.setup.id}))).flat().sort((a,i)=>i.score-a.score).slice(0,5),[s,n])??[]}function Ka({song:e,width:n,height:s,onClickSongSelection:r,singSetup:a}){const i=Ha(e,a),o=d.useMemo(()=>D.getPlayers().map(l=>({name:l.getName(),playerNumber:l.number,detailedScore:J.getPlayerDetailedScore(l.number)})),[]);return t.jsx($a,{singSetup:a,song:e,width:n,height:s,onClickSongSelection:r,players:o,highScores:i})}function Ua({songPreview:e,singSetup:n,returnToSongSelection:s,restartSong:r}){xt(),ft();const a=d.useRef(null),i=rn(e.id),{width:o,height:l}=fe(),[c,g]=d.useState(!1),[h,m]=d.useState(!0),[f,p]=d.useState(Z.UNSTARTED),x=d.useMemo(()=>i.data?n.mode!==L.PASS_THE_MIC?i.data.tracks.map(()=>[]):ua(i.data):[],[i.data,n]),[k,S]=d.useState(!1);return pe(!k),d.useEffect(()=>{h&&i.data&&(k||f!==Z.UNSTARTED)&&m(!1)},[i.data,k,f,h]),c&&i.data?t.jsx(Ka,{width:o,height:l,song:i.data,onClickSongSelection:s,singSetup:n}):t.jsxs(Wa,{children:[t.jsxs(Ya,{visible:h,children:[t.jsx(Ja,{video:e.video,width:o,height:l}),t.jsx(Qa,{children:e.artist}),t.jsx(Za,{children:e.title}),t.jsx(ta,{onFinish:()=>{var y;S(!0),(y=a.current)==null||y.play()}})]}),i.data&&t.jsx(mn,{ref:a,onStatusChange:p,playerChanges:x,players:n.players,song:i.data,width:o,height:l,autoplay:!1,onSongEnd:()=>{var w;const y=((w=J.getSingSetup())==null?void 0:w.mode)===L.CO_OP?[{name:D.getPlayers().map(v=>v.getName()).join(", "),score:J.getPlayerScore(0)}]:D.getPlayers().map(v=>({name:v.getName(),score:J.getPlayerScore(v.number)}));I.songEnded.dispatch(i.data,n,y),g(!0)},singSetup:n,restartSong:r})]})}const Wa=u("div",{target:"e1pnu1v94"})({name:"bjn8wh",styles:"position:relative"}),Ya=u("div",{target:"e1pnu1v93"})("position:fixed;top:0;left:0;z-index:10;pointer-events:none;background-color:black;view-transition-name:song-preview;opacity:",e=>e.visible?1:0,";transition:500ms;"),Xa=u("div",{target:"e1pnu1v92"})({name:"oux8x1",styles:"background-size:cover;background-position:center center;filter:blur(10px)"}),Ja=e=>t.jsx(Xa,{style:{backgroundImage:`url('https://i3.ytimg.com/vi/${e.video}/hqdefault.jpg')`,width:`${e.width}px`,height:`${e.height}px`}}),Qa=u(ye,{target:"e1pnu1v91"})({name:"oyknw4",styles:"view-transition-name:song-preview-artist;position:absolute;top:10rem;left:10rem;font-size:7rem"}),Za=u(se,{target:"e1pnu1v90"})({name:"1l9juvo",styles:"view-transition-name:song-preview-title;position:absolute;font-size:8rem;top:19rem;left:10rem"});function nr(e){const[n,s]=d.useState(null),[r,a]=d.useState(e.songId??null),[i,o]=d.useState(0),l=c=>{document.getElementById("preview-video-container").style.viewTransitionName="song-preview-video",$e(()=>{document.getElementById("preview-video-container").style.viewTransitionName="",qe.flushSync(()=>{s(c)})}),Ge.play()};return xt(),t.jsx(t.Fragment,{children:n?t.jsx(Ua,{restartSong:()=>{xe.restartRecord(),o(c=>c+1)},songPreview:n.song,singSetup:n,returnToSongSelection:()=>{a(n.song.id),s(null)}},i):t.jsx(Zs,{onSongSelected:l,preselectedSong:r})})}export{nr as default};
