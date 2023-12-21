import{a3 as Et,a4 as Ct,a5 as Pt,c as Re,j as t,r as d,a6 as W,a7 as ye,a8 as te,a9 as F,aa as Le,a2 as u,ab as ve,ac as Mt,ad as G,ae as I,af as zt,ag as D,ah as Be,ai as Tt,aj as je,Y as _,X as At,ak as De,al as $e,am as V,an as Q,ao as Oe,ap as Ft,aq as _e,ar as ue,as as Ge,at as qe,au as It,av as Nt,aw as Ve,G as He,ax as Ue,ay as ne,az as R,aA as Rt,N as Lt,O as Bt,aB as we,aC as Ke,aD as Ye,aE as Dt,C as H,aF as We,aG as N,aH as $t,aI as Ot,aJ as _t,aK as Xe,aL as Je,aM as ge,aN as Gt,aO as qt,aP as $,aQ as Vt,aR as Ht,aS as Qe,aT as Ze,aU as Ut,aV as et,aW as Kt,aX as tt,aY as he,aZ as Yt,a_ as Wt,a$ as Z,b0 as nt,V as st,b1 as Xt,W as at,b2 as rt,b3 as Jt,b4 as Qt,b5 as Zt,b6 as it,b7 as en,b8 as ee,b9 as tn,ba as ot,bb as ct,bc as nn,bd as me,be as sn,bf as an,bg as rn,bh as on,bi as cn,bj as ln,bk as dn,bl as J,bm as un}from"./index-MAFKMMbI.js";import{u as U,a as gn,P as hn,S as mn,c as fn,f as pn,b as xn,d as bn}from"./Player-B6cr4MgK.js";function Sn(e){var n=Et(e),s=n%1;return n===n?s?n-s:n:0}var yn=Math.ceil,vn=Math.max;function ke(e,n,s){(s?Ct(e,n,s):n===void 0)?n=1:n=vn(Sn(n),0);var r=e==null?0:e.length;if(!r||n<1)return[];for(var a=0,i=0,o=Array(yn(r/n));a<r;)o[i++]=Pt(e,a,a+=n);return o}const jn=Re(t.jsx("path",{d:"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm0-9C6.67 9 6 8.33 6 7.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-9c-.83 0-1.5-.67-1.5-1.5S15.67 6 16.5 6s1.5.67 1.5 1.5S17.33 9 16.5 9z"}),"Casino"),wn=Re(t.jsx("path",{d:"M16.59 7.58 10 14.17l-3.59-3.58L5 12l5 5 8-8zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"}),"CheckCircleOutline");function kn({setFilters:e,filters:n,keyboardControl:s,visible:r,setVisible:a}){const i=d.useRef(null),[o,l]=d.useState(!1),c=h=>{e(f=>({...f,search:h}))};W("down",()=>{var h;(h=i.current)==null||h.blur()},{enabled:o,enableOnTags:["INPUT"]});const m=h=>{h.stopPropagation(),h.preventDefault(),c(h.key)};W(ye,h=>{m(h),a(!0)},{enabled:!n.search&&s});const p=d.useCallback(h=>{s&&c(h)},[s]);return te(F.remoteSongSearch,p),W(ye,h=>{var f;m(h),(f=i.current)==null||f.focus()},{enabled:!o&&s},[n.search]),W("Backspace",h=>{var f;(f=i.current)==null||f.focus()},{enabled:!o&&s},[n.search]),d.useEffect(()=>{o||a(!!n.search)},[o,n.search,a]),!n.search&&!r?null:t.jsx(En,{"data-test":"song-list-search",children:t.jsx(Cn,{large:!0,children:t.jsx("form",{"data-test":"filters-search-form",onSubmit:h=>{var f;h.preventDefault(),(f=i.current)==null||f.blur()},children:t.jsx(Le,{onFocus:()=>l(!0),onBlur:()=>l(!1),onKeyDown:h=>{var f;h.key==="Backspace"&&((f=n.search)==null?void 0:f.length)===0&&a(!1)},focused:o,autoFocus:!0,label:"Search",value:n.search??"",onChange:c,ref:i,"data-test":"filters-search"})})})})}const En=u("div",{target:"e1vw0lol1"})({name:"t46wvs",styles:"background:rgba(0, 0, 0, 0.7);padding:2rem;font-size:3rem;box-sizing:border-box;display:flex;flex-direction:row;gap:2rem;position:fixed;z-index:200;top:4.5rem;left:30rem;right:30rem"}),Cn=u("div",{target:"e1vw0lol0"})("flex:",e=>e.large?1.5:1,";");function Pn({onRandom:e,setFilters:n,filters:s,keyboardControl:r}){const[a,i]=d.useState(!1),o=()=>{n(l=>({...l,search:""}))};return t.jsxs(t.Fragment,{children:[t.jsxs(Mn,{children:[t.jsx(ve,{title:"Search",placement:"left",children:t.jsx(Ee,{onClick:()=>a?o():i(!0),"data-test":"search-song-button",children:t.jsx(Mt,{})})}),t.jsx(ve,{title:"Pick random",placement:"left",children:t.jsx(Ee,{onClick:e,"data-test":"random-song-button",children:t.jsx(jn,{})})})]}),t.jsx(kn,{setFilters:n,filters:s,visible:a,setVisible:i,keyboardControl:r})]})}const Ee=u(G,{target:"excrh4t1"})("box-shadow:inset 0 0 2px 2px ",I.colors.text.active,";background:black;width:7.5rem;height:7.5rem;border-radius:50%;display:flex;align-items:center;justify-content:center;svg{width:4.5rem;height:4.5rem;}"),Mn=u("div",{target:"excrh4t0"})({name:"1x0sh4s",styles:"pointer-events:none;position:fixed;display:flex;flex-direction:column;align-items:center;justify-content:center;bottom:2.5rem;right:2.5rem;z-index:100;gap:2rem"});function lt({videoId:e,...n}){return t.jsx(Fn,{src:`https://img.youtube.com/vi/${e}/default.jpg`,alt:`Thumbnail image for YouTube video ${e}`,...n})}function zn({videoId:e,...n}){const s=zt(e)??e,[r,a]=d.useState(!0);d.useLayoutEffect(()=>{a(o=>!o)},[e]);const[i]=D(Be);return i==="low"?null:t.jsxs(Tn,{...n,children:[t.jsx(Ce,{videoId:r?e:s,visible:r}),t.jsx(Ce,{videoId:r?s:e,visible:!r}),t.jsx(An,{videoId:s})]})}const Tn=u("div",{target:"e1x06a543"})({name:"k44s62",styles:"position:relative;overflow:hidden;background:black"}),An=u(lt,{target:"e1x06a542"})({name:"6dhm9o",styles:"visibility:hidden"}),Ce=u(lt,{target:"e1x06a541"})("position:absolute;transition:opacity 300ms;opacity:",e=>e.visible?1:0,";"),Fn=u("img",{target:"e1x06a540"})({name:"4uwt2b",styles:"width:100%;height:100%;object-fit:cover"}),In=e=>{const n=Tt(e);return d.useMemo(()=>[{name:"All",filters:{}},{name:"Christmas",display:t.jsxs(t.Fragment,{children:[t.jsx("span",{style:{color:je.christmasRed.text},children:"Chris"}),t.jsx("span",{style:{color:je.christmasGreen.text},children:"tmas"})," 🎄"]}),filters:{edition:"christmas"}},n[0]?{name:n[0].name,filters:{language:n[0].name}}:null,n[1]?{name:n[1].name,filters:{language:n[1].name}}:null,{name:"Duets",filters:{duet:!0}},{name:"New",filters:{updatedAfter:_().subtract(31,"days").toISOString()}}].filter(s=>s!==null),[n])},Pe={language:(e,n)=>n===""?e:e.filter(s=>(Array.isArray(s.language)?s.language:[s.language]).includes(n)),excludeLanguages:(e,n=[],s)=>n.length===0||V((s==null?void 0:s.search)??"").length>2?e:e.filter(r=>!(Array.isArray(r.language)?r.language:[r.language]).every(i=>n.includes(i))),search:(e,n)=>{const s=V(n);return s.length>2?e.filter(r=>r.search.includes(s)):e},duet:(e,n)=>n===null?e:e.filter(s=>n?s.tracksCount>1:s.tracksCount===1),yearBefore:(e,n)=>n?e.filter(s=>Number(s.year)<n):e,yearAfter:(e,n)=>n?e.filter(s=>Number(s.year)>=n):e,edition:(e,n)=>V(n).length?e.filter(r=>V(r.edition??"")===n):e,updatedAfter:(e,n)=>{if(!n)return e;const s=_(n);return e.filter(r=>r.lastUpdate&&_(r.lastUpdate).isAfter(s))}},Me=(e,n)=>Object.entries(n).filter(s=>s[0]in Pe).reduce((s,[r,a])=>Pe[r](s,a,n),e),Nn=e=>{var p;const[n]=D($e),s=d.useMemo(()=>Me(e,{excludeLanguages:n??[]}),[e,n]),r=In(s),[a,i]=d.useState(new URLSearchParams(window.location.search).get("playlist")??null),[o,l]=d.useState({});d.useEffect(()=>{l({})},[a]);const c=d.useDeferredValue(o),g=((p=r.find(h=>h.name===a))==null?void 0:p.filters)??null,m=d.useMemo(()=>Me(e,{...g,...c,excludeLanguages:n??[]}),[e,c,n,g]);return{filters:o,filteredList:m,setFilters:l,selectedPlaylist:a,setSelectedPlaylist:i,playlists:r}};function Rn(){const e=At(),{filters:n,filteredList:s,setFilters:r,selectedPlaylist:a,setSelectedPlaylist:i,playlists:o}=Nn(e.data);return{groupedSongList:d.useMemo(()=>{if(s.length===0)return[];const c=[];if(!n.search&&!n.edition){const m=s.filter(p=>p.isNew);m.length&&c.push({letter:"New",isNew:!0,songs:m.map(p=>({song:p,index:s.indexOf(p)}))})}const g=/[^a-zA-Z]/;return s.forEach((m,p)=>{try{const h=isFinite(+m.artist[0])||g.test(m.artist[0])?"0-9":m.artist[0].toUpperCase();let f=c.find(x=>x.letter===h);f||(f={letter:h,songs:[]},c.push(f)),f.songs.push({index:p,song:m})}catch(h){console.error(h),De(h)}}),c},[s,n.search]),songList:s,filters:n,setFilters:r,isLoading:e.isLoading,selectedPlaylist:a,setSelectedPlaylist:i,playlists:o}}const Ln=30;function Bn(e,n,s=Ln){let r;if(n.length<e){const a=[...Array(e).keys()].filter(i=>!n.includes(i));r=a[Q(0,a.length-1)]}else r=Q(0,e-1),n.length=0;return n.length>=s&&n.shift(),n.push(r),r}const Dn=(e=[],n)=>{var k;const[s,r]=d.useState([0,0]),a=d.useMemo(()=>e.map(({songs:b})=>ke(b.map(v=>v.index),n)).flat(),[e]),i=d.useMemo(()=>e.map(({songs:b,letter:v})=>ke(b.map(()=>v),n)).flat(),[e]),o=U(a??[]),l=s[0]===((k=a[s[1]])==null?void 0:k.length)-1,c=d.useCallback(b=>{var j;const v=a.findIndex(S=>S.includes(b)),w=(j=a[v])==null?void 0:j.indexOf(b);w>=0&&v>=0?r([w??0,v??0]):r([0,0])},[a]),g=([b,v],w,j)=>{var y;if(e.length===0)return j;const S=w[v];return(S==null?void 0:S[b])??(S==null?void 0:S.at(-1))??((y=w==null?void 0:w[0])==null?void 0:y[0])??j},m=([b,v],w=a)=>g([b,v],w,0),p=([b,v],w=i)=>g([b,v],w,"A");d.useEffect(()=>{const b=m(s,o),v=m(s,a);o.length&&b!==v&&c(b)},[s,a,o,l]);const h=(b,v)=>{_e.play(),r(([w,j])=>{let S=w,y=j;if(b==="y")y=j+v;else{if(a[j]===void 0)debugger;const C=a[j].length-1;S=Math.min(w,C)+v,S<0?(y=(a.length+j-1)%a.length,S=a[y].length-1):S>C&&(y=j+1,S=0)}return[S%n,(a.length+y)%a.length]})},f=m(s),x=p(s);return qe([f,x,s,h,c,l])},$n=(e,n=[],s,r,a,i)=>{const o=Oe(),[l,c]=d.useState([!1,null]),g=U(l),[m,p]=l,[h,f,x,k,b,v]=Dn(n,i),w=x[0]===0,j=()=>{It.play(),s()},[S,y]=d.useState(!1),C=U(a.search);d.useLayoutEffect(()=>{if(C&&!a.search){y(!0);const M=setTimeout(()=>y(!1),2e3);return()=>{clearTimeout(M),y(!1)}}},[a.search]);const P=()=>{!S&&!a.search&&(Nt.play(),o(""))},L=d.useCallback(Ft((M,T)=>{const B=(n.length+T+M)%n.length;b(n[B].songs[0].index),_e.play()},700,{trailing:!1}),[n]),E=(M,T)=>{if(!(M!=null&&M.repeat))k("y",T);else{const B=n.findIndex(A=>!!A.songs.find(Y=>Y.index===h));L(T,B)}},z=(M,T=!1)=>{!T&&M===-1&&w&&!m?c([!0,"left"]):k("x",M)},O=d.useRef([]),K=()=>{const M=Bn(r,O.current);b(M)};ue({accept:j,down:M=>E(M,1),up:M=>E(M,-1),left:()=>z(-1),right:()=>z(1),back:P,random:K},e&&!m,[n,x,m,a,S]);const ae=d.useMemo(()=>({"horizontal-vertical":null,accept:null,back:null,shiftR:null,alphanumeric:null,remote:["search"]}),[]);Ge(ae,e);const re=d.useCallback(M=>{c([!1,M])},[c,z,n,x]);return d.useLayoutEffect(()=>{const[M,T]=g;M&&!m&&T===p&&z(p==="right"?1:-1,!0)},[m,p,w,v,...x]),qe([h,f,b,m,re,K])};function On(e,n){const{songList:s,groupedSongList:r,setFilters:a,filters:i,isLoading:o,selectedPlaylist:l,setSelectedPlaylist:c,playlists:g}=Rn(),m=Oe(),[p,h]=d.useState(!0),f=P=>{Ve(()=>{He.flushSync(()=>{h(P)})}),Ue.play()},[x,k,b,v,w,j]=$n(p,r,()=>f(!1),s.length,i,n),[S,y]=d.useState(!1);d.useEffect(()=>{if(!S&&s.length){const P=s.findIndex(z=>z.id===e),L=s.findIndex(z=>z.isNew);let E=Q(0,s.length-1);(P>-1||L>-1)&&(E=P),b(E),y(!0)}},[s,b,e]),d.useEffect(()=>{S&&s.length&&s[x]&&m(`game/${encodeURIComponent(s[x].id)}${window.location.search}`,{replace:!0,smooth:!1})},[S,x,s]);const C=s==null?void 0:s[x];return{groupedSongList:r,focusedSong:x,focusedGroup:k,moveToSong:b,setKeyboardControl:f,keyboardControl:p,songPreview:C,songList:s??[],filters:i,setFilters:a,showFilters:v,setShowFilters:w,isLoading:o,randomSong:j,selectedPlaylist:l,setSelectedPlaylist:c,playlists:g}}function _n({active:e,closePlaylist:n,playlists:s,selectedPlaylist:r,setSelectedPlaylist:a}){const{register:i,focused:o,focusElement:l}=ne({enabled:e,additionalHelp:{vertical:void 0,"horizontal-vertical":null}});return ue({left:()=>n("left"),right:()=>n("right")},e),d.useEffect(()=>{const c=new URLSearchParams(window.location.search).get("playlist");c&&l(`playlist-${c}`)},[]),d.useEffect(()=>{if(o){const c=s.find(g=>`playlist-${g.name}`===o);if(c){const g=new URL(window.location.href);g.searchParams.set("playlist",c.name),window.history.pushState(null,"",g.toString()),a(c.name)}}},[o,s]),t.jsx(Gn,{"data-test":"song-list-playlists",active:e,children:s.map(c=>t.jsx(qn,{"data-selected":`playlist-${c.name}`===o,active:e,...i(`playlist-${c.name}`,()=>l(`playlist-${c.name}`),void 0,c.name===r),...e?{}:{selected:`playlist-${c.name}`===o},children:c.display??c.name},c.name))})}const Gn=u("div",{target:"e1amx3cg1"})("background:rgba(0, 0, 0, ",e=>e.active?.75:.5,");width:100vh;transform-origin:top right;transform:rotate(-90deg);position:absolute;left:-100vh;top:0;font-size:3.6rem;box-sizing:border-box;display:flex;flex-direction:row-reverse;gap:0;h2{",R,";margin:0;}"),qn=u(G,{target:"e1amx3cg0"})("font-size:3rem;justify-self:stretch;flex-grow:1;",e=>!e.focused&&e.active&&"background-color: transparent;",";padding:1.5rem;",e=>e.selected?Rt:!e.active&&"opacity: .75;",";");var fe={},Vn=Bt;Object.defineProperty(fe,"__esModule",{value:!0});var dt=fe.default=void 0,Hn=Vn(Lt()),ie=t,Un=(0,Hn.default)([(0,ie.jsx)("path",{fillRule:"evenodd",d:"M16.67 13.13C18.04 14.06 19 15.32 19 17v3h4v-3c0-2.18-3.57-3.47-6.33-3.87z"},"0"),(0,ie.jsx)("circle",{cx:"9",cy:"8",r:"4",fillRule:"evenodd"},"1"),(0,ie.jsx)("path",{fillRule:"evenodd",d:"M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4c-.47 0-.91.1-1.33.24C14.5 5.27 15 6.58 15 8s-.5 2.73-1.33 3.76c.42.14.86.24 1.33.24zm-6 1c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"},"2")],"PeopleAlt");dt=fe.default=Un;const Kn=JSON.parse(`{
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
}`),Yn=["US","GB"];function Wn({song:e,...n}){const s=Array.isArray(e.language)?e.language[0]:e.language,r=d.useMemo(()=>{var a;return e.artistOrigin?((a=Kn[e.artistOrigin.toLowerCase()])==null?void 0:a.includes(s))??!1:!1},[e.artistOrigin,s]);return t.jsx(t.Fragment,{children:r&&!Yn.includes(e.artistOrigin)?t.jsx(we,{isocode:e.artistOrigin,...n}):e.language!=="English"?t.jsx(we,{language:e.language,...n}):null})}const pe=e=>{const[n,s]=d.useState(null),r=Ke(e),a=async()=>{s(await Ye(e))};return d.useEffect(()=>{a()},[r]),te(F.songStatStored,a),n},Xn=e=>async(n,s,r,a)=>{const i=Ke(e),o=await Ye(e),l=o.scores.map(g=>{if(g.setup.id!==n)return g;const m=g.scores.map(p=>p.name!==r||p.score!==s?p:{name:a.trim(),score:s});return{...g,scores:m}}),c={...o,scores:l};await Dt(e,c),F.songScoreUpdated.dispatch(i,c,a.trim())},ut=({song:e,focused:n,video:s,children:r,index:a,handleClick:i,background:o=!0,expanded:l=!1,...c})=>{const g=d.useCallback(()=>i?i(a):void 0,[i,a]);return t.jsxs(es,{...c,onClick:i?g:void 0,children:[o&&t.jsx(ts,{style:{backgroundImage:`url('https://i3.ytimg.com/vi/${e.video}/hqdefault.jpg')`},focused:n,expanded:l}),t.jsxs(Zn,{expanded:l,children:[!l&&t.jsx(ns,{song:e}),e.tracksCount>1&&!l&&t.jsxs(ss,{"data-test":"multitrack-indicator",children:[t.jsx(dt,{}),"  Duet"]}),t.jsx(xe,{expanded:l,children:e.artist}),t.jsx(se,{expanded:l,children:e.title}),t.jsxs(gt,{expanded:l,children:[l&&t.jsxs(t.Fragment,{children:[e.author&&t.jsxs(mt,{expanded:l,children:["by ",e.authorUrl?t.jsx("a",{href:e.authorUrl,target:"_blank",rel:"noreferrer",children:e.author}):e.author]}),t.jsx(as,{song:e})]}),!l&&t.jsx(Jn,{song:e})]})]}),r,s]})},Jn=u(Wn,{target:"eqdpxtq10"})({name:"1w2zyc9",styles:"height:2.75rem;object-fit:cover;border-top-right-radius:1rem;position:absolute;z-index:-1;left:0rem;bottom:0rem;opacity:0.95"}),gt=u("div",{target:"eqdpxtq9"})({name:"1dgv8bf",styles:"display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start"});var Qn={name:"1u0tp1t",styles:"align-items:flex-start;justify-content:flex-start"};const Zn=u("div",{target:"eqdpxtq8"})("width:100%;height:100%;display:flex;align-items:flex-end;justify-content:flex-end;z-index:1;box-sizing:border-box;flex-direction:column;",e=>e.expanded&&Qn,";"),es=u("div",{target:"eqdpxtq7"})({name:"1s4n252",styles:"font-size:4.5rem;display:flex;align-items:flex-end;justify-content:flex-end;flex-direction:column;box-sizing:border-box;position:relative;padding:0.5rem;border:0.1rem black solid;border-radius:1rem"}),ts=u("div",{target:"eqdpxtq6"})("background-color:",I.colors.text.inactive,";position:absolute;z-index:-1;inset:0;",e=>e.theme.graphicSetting==="high"?H("background-size:",e.focused?100:110,"%;",e.focused?"":"filter: grayscale(90%);"," ",e.expanded?"filter: blur(10px);":""," transition:300ms;opacity:",e.focused?1:.8,";",""):H("background-size:100%;opacity:",e.focused?1:.6,";","")," background-position:center center;"),ht=u("span",{target:"eqdpxtq5"})("background:rgba(0, 0, 0, 0.7);width:auto;display:inline-block;padding:0.5rem;",R,";text-align:right;font-size:",({expanded:e})=>e?"6rem":"2.7rem",";"),xe=u(ht,{target:"eqdpxtq4"})("color:",I.colors.text.active,";"),se=u(ht,{target:"eqdpxtq3"})("margin-top:",e=>e.expanded?"1.5rem":"0.5rem",";color:white;"),mt=u(se,{target:"eqdpxtq2"})({name:"5twmqz",styles:"font-size:3rem;margin-top:3rem"}),ns=({song:e})=>{var a,i;const n=pe(e),s=((i=(a=n==null?void 0:n.scores)==null?void 0:a.at(-1))==null?void 0:i.date)??!1,r=s&&_(s).isAfter(_().subtract(1,"days"));return n!=null&&n.plays?t.jsx(ft,{"data-test":"song-stat-indicator",children:r?"Played today":n.plays}):null},ft=u("div",{target:"eqdpxtq1"})({name:"ohpsts",styles:"position:absolute;top:0.5rem;right:0.5rem;padding:0 1rem;height:2.75rem;min-width:2.75rem;box-sizing:border-box;border-radius:5rem;color:white;background:rgba(0, 0, 0, 0.75);font-size:1.4rem;display:flex;align-items:center;justify-content:center;text-transform:uppercase"}),ss=u(ft,{target:"eqdpxtq0"})({name:"sq8m9a",styles:"left:0.5rem;right:auto;svg{width:1.75rem;height:1.75rem;}"}),as=({song:e})=>{const n=pe(e);return t.jsx(mt,{children:n!=null&&n.plays?`Played ${n.plays} time${n.plays>1?"s":""}`:"Never played yet"})},ze={[N.DUEL]:"Duel",[N.PASS_THE_MIC]:"Pass The Mic",[N.CO_OP]:"Cooperation"},oe=["Hard","Medium","Easy"],rs=We("song_settings-game_mode-v3"),is=We("song_settings-tolerance-v2");function os({songPreview:e,onNextStep:n,keyboardControl:s,onExitKeyboardControl:r}){const[a,i]=rs(null),o=a??(e.tracksCount>1?N.CO_OP:N.DUEL),[l,c]=is(1),g=()=>{const f={id:Ot(),players:[],mode:o,tolerance:l+1};n(f)},m=()=>{i(_t(Object.values(N),o))},p=()=>c(f=>Xe(oe,f,-1)),{register:h}=ne({enabled:s,onBackspace:r});return t.jsxs(t.Fragment,{children:[t.jsx(Te,{...h("difficulty-setting",p,"Change difficulty"),label:"Difficulty",value:oe[l],"data-test-value":oe[l]}),t.jsx(Te,{...h("game-mode-setting",m,"Change mode"),label:"Mode",value:ze[o],"data-test-value":ze[o]}),t.jsxs(ls,{children:[o===N.DUEL&&"Face off against each other - person that earns more points wins.",o===N.CO_OP&&"Join forces and sing together - your points will be added up to a single pool.",o===N.PASS_THE_MIC&&t.jsxs(t.Fragment,{children:["For more than 2 players - split into groups and pass the microphone within the group when prompted with"," ",t.jsx($t,{})," symbol."]})]}),t.jsx(cs,{...h("next-step-button",g,void 0,!0),children:"Next ➤"})]})}const cs=u(G,{target:"e1xayinb2"})({name:"sr8dp2",styles:"padding:0.5rem 9rem;font-size:4.3rem;width:50rem"}),ls=u("h3",{target:"e1xayinb1"})({name:"rdh6te",styles:"max-width:50rem;margin:-1rem 0 1rem!important;padding:1.5rem;background:rgba(0, 0, 0, 0.7);box-sizing:border-box"}),Te=u(Je,{target:"e1xayinb0"})({name:"1tcj19k",styles:"font-size:4.3rem;padding:1rem;min-width:50rem;box-sizing:border-box"});function ds(){const n=ge(F.playerInputChanged,()=>$.getInputs()).some(o=>o.source==="Microphone"),s=d.useRef([]),r=d.useCallback(o=>{s.current.push(o)},[]);Gt(0,50,r);const[a,i]=d.useState(!1);return d.useEffect(()=>{const o=setInterval(()=>{const l=s.current.filter(([,h])=>h===0),c=s.current.filter(([,h])=>h>0),g=l.reduce((h,[f])=>h+f,0)/(l.length+1),m=c.reduce((h,[f])=>h+f,0)/(c.length+1),p=c.length>l.length*.1&&m>.01&&g>.01&&m-g<g/2;i(p),s.current.length=0},a?5e3:2500);return()=>clearInterval(o)},[a]),t.jsxs(us,{visible:a,children:[t.jsxs("h2",{children:[t.jsx("strong",{children:t.jsx(qt,{})})," ","Noise detected"]}),t.jsx("hr",{}),t.jsxs("h4",{children:["This might make singing inaccurate. Make sure your microphone doesn't pick up the music."," ",n&&t.jsxs(t.Fragment,{children:["Alternatively, use your ",t.jsx("strong",{children:"smartphone as a microphone"})," instead."]})]})]})}const us=u("div",{target:"elv6o00"})("opacity:",e=>e.visible?1:0,";transition:300ms;background:rgba(0, 0, 0, 0.75);padding:1rem;max-width:50rem;position:relative;top:-1rem;left:-0.5rem;");function pt({player:e}){const n=gn(e.number);return t.jsxs(gs,{"data-test":`indicator-player-${e.number}`,children:[t.jsx(Vt,{playerNumber:e.number}),t.jsx(hn,{status:n}),n!=="unavailable"&&t.jsx(Ht,{playerNumber:e.number}),t.jsx(hs,{className:"ph-no-capture",children:e.getName()})]},e.number)}const gs=u("div",{target:"ey5ojlp1"})({name:"1gmoqr1",styles:"position:relative;border:0.1rem solid white;padding:1rem 3rem;background:black;width:80%;text-align:center;gap:1.25rem;font-size:2.3rem;color:white;-webkit-text-stroke:1px black"}),hs=u("span",{target:"ey5ojlp0"})({name:"179t5g5",styles:"position:relative;z-index:1"});function ms(e){Qe(F.playerNameChanged),d.useEffect(()=>{Ze.startMonitoring()},[]);const s=ge(F.playerInputChanged,()=>$.getInputs()).some(r=>r.source!=="Dummy");return t.jsxs(fs,{...e,children:[t.jsxs(ps,{children:["Microphone Check",s?$.getPlayers().map(r=>t.jsx(pt,{player:r},r.number)):t.jsxs(t.Fragment,{children:[t.jsx(xs,{children:"Mic not setup"}),t.jsx("h4",{children:"Singing will be emulated"}),t.jsx("h5",{children:"You can setup in the Next step"})]})]}),t.jsx(ds,{})]})}const fs=u("div",{target:"e1b6ju672"})("display:flex;font-size:3rem;",R,";margin-bottom:8.6rem;gap:3.5rem;"),ps=u("div",{target:"e1b6ju671"})({name:"fmwdml",styles:"gap:1.25rem;display:flex;flex-direction:column;align-items:center"}),xs=u("div",{target:"e1b6ju670"})({name:"1x5xnlp",styles:"position:relative;border:0.1rem solid white;padding:1rem 3rem;background:black;width:80%;text-align:center;gap:1.25rem;font-size:2.3rem;color:white"}),xt=d.forwardRef(({options:e,focused:n,label:s,value:r,onChange:a,disabled:i,placeholder:o,keyboardNavigationChangeFocus:l,onBlur:c,className:g,...m},p)=>{const h=d.useRef(null);d.useImperativeHandle(p,()=>h.current);const f=d.useRef(null),[x,k]=d.useState(!1),[b,v]=d.useState(-1),w=d.useMemo(()=>e.filter(y=>y.toLowerCase().trim().includes(r.toLowerCase().trim())&&y!==r),[e,r]),j=y=>{var C,P,L;if(y.code==="ArrowUp"||y.code==="ArrowDown")if(w.length){y.preventDefault();const E=Xe(w,b,y.code==="ArrowUp"?-1:1);v(E);const z=(C=f.current)==null?void 0:C.querySelector(`[data-index="${E}"]`);z==null||z.scrollIntoView({behavior:"smooth",block:"center"})}else(P=h.current)==null||P.blur(),l==null||l(y.code==="ArrowUp"?-1:1);else if(y.code==="Enter"){const E=w[b];E?(v(-1),a(E)):(L=h.current)==null||L.blur()}},S=()=>{setTimeout(()=>{k(!1),c==null||c()},300)};return t.jsxs(bs,{className:g,children:[t.jsx(Le,{onFocus:()=>k(!0),onBlur:S,onKeyDown:j,onChange:a,value:r,focused:n,label:s,disabled:i,ref:h,placeholder:o,...m}),x&&!!w.length&&t.jsx(Ss,{ref:f,role:"listbox",children:w.map((y,C)=>t.jsx(ys,{role:"listitem","data-index":C,"data-focused":C===b,focused:C===b,onClick:()=>{var P;a(y),v(-1),(P=h.current)==null||P.blur()},children:y},y))})]})}),bs=u("div",{target:"e1olyu0z2"})({name:"bjn8wh",styles:"position:relative"}),Ss=u("div",{target:"e1olyu0z1"})("margin-top:0.1em;position:absolute;width:100%;background:black;max-height:",(1+2*.3)*4,"em;overflow-y:auto;z-index:2;"),ys=u("div",{target:"e1olyu0z0"})(R,";padding:0.3em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:",e=>e.focused?I.colors.text.active:"white",";cursor:pointer;"),vs=(e,n)=>{var s;return((s=e[n])==null?void 0:s.name)??`Track ${n+1}`};function js({multipleTracks:e,player:n,songPreview:s,playerNames:r,register:a,onChange:i,setup:o}){const[l,c]=d.useState(!1),g=d.useRef(null);if(Qe(F.playerNameChanged),n===void 0)return null;const m=()=>i({number:n.number,track:(o.track+1)%s.tracksCount}),p=x=>{c(!0),n.setName(x)},h=!l,f=n.getName();return t.jsxs(t.Fragment,{children:[t.jsx(ws,{maxLength:Ut,className:"ph-no-capture",value:h?"":f,placeholder:h?f:void 0,options:r,onChange:p,label:"Name:",ref:g,...a(`player-${n.number}-name`,()=>{var x;return(x=g.current)==null?void 0:x.focus()})}),e&&t.jsx(ks,{...a(`player-${n.number}-track-setting`,m,"Change track"),label:"Track",value:vs(s.tracks,o.track),"data-test-value":o.track+1})]})}const ws=u(xt,{target:"eilnc831"})("input{font-size:4.5rem;}[role='listbox']{max-height:",6*(4.5+.3),"rem;}"),ks=u(Je,{target:"eilnc830"})({name:"1bwrnjg",styles:"font-size:4.5rem;padding:1.1rem"});function Es({songPreview:e,onNextStep:n,keyboardControl:s,onExitKeyboardControl:r}){const[a]=D(et),[i]=D(Kt),o=$.getPlayers(),l=!a&&o.length===2&&e.tracksCount>1,c=()=>o.map((S,y)=>({number:S.number,track:l?Math.min(y,e.tracksCount-1):0})),[g,m]=d.useState(c());te([F.playerAdded,F.playerRemoved],()=>m(c()));const p=o.map((S,y)=>g.find(C=>C.number===S.number)??c()[y]),h=d.useMemo(()=>JSON.parse(sessionStorage.getItem(tt))??[],[]),f=S=>y=>{m(C=>C.map(P=>P.number===S?y:P))},[x,k]=d.useState(!1);d.useEffect(()=>{x||Ze.startMonitoring()},[x]);const{register:b,focusElement:v}=ne({enabled:s&&!x,onBackspace:r}),w=()=>{n(p)},j=!!i&&i!=="skip";return t.jsxs(t.Fragment,{children:[x&&t.jsx(mn,{closeButtonText:j?"Continue to the song":"Continue to player setup",onClose:()=>{k(!1),j&&v("play")}}),p.map((S,y)=>t.jsxs(Cs,{children:[t.jsxs(Ps,{children:["Player ",y+1]}),t.jsx("div",{children:t.jsx(js,{multipleTracks:l,player:$.getPlayer(S.number),setup:S,onChange:f(S.number),playerNames:h,register:b,songPreview:e})})]},S.number)),j&&t.jsx(Ae,{...b("play-song-button",w,void 0,!0),children:"Play"}),t.jsx(Ae,{...b("select-inputs-button",()=>k(!0),void 0,!1),children:"Setup mics"})]})}const Cs=u("div",{target:"ee5oup2"})({name:"ho1qnd",styles:"display:flex;flex-direction:row"}),Ae=u(G,{target:"ee5oup1"})({name:"afgxf2",styles:"padding:0.5rem 9rem;font-size:4.3rem"}),Ps=u("span",{target:"ee5oup0"})(R,";padding:1.3rem;font-size:4.5rem;");function Ms({songPreview:e,onPlay:n,keyboardControl:s,onExitKeyboardControl:r}){const[a,i]=d.useState(null),[o,l]=d.useState("song"),c=m=>{i(m),l("players")},g=m=>{if(!a)return;const p={...a,players:m};F.songStarted.dispatch(e,p),n({song:e,...p})};return t.jsxs(zs,{children:[t.jsx(ms,{style:o==="players"?{viewTransitionName:"player-mic-check-container"}:void 0}),t.jsxs(Ts,{children:[o==="song"&&t.jsx(os,{songPreview:e,onNextStep:c,keyboardControl:s,onExitKeyboardControl:r}),o==="players"&&t.jsx(Es,{songPreview:e,onNextStep:g,keyboardControl:s,onExitKeyboardControl:()=>l("song")})]})]})}const zs=u("div",{target:"e1of12hx1"})({name:"k6gb66",styles:"display:flex;flex-direction:row;align-items:flex-end;justify-content:space-between;width:100%;hr{margin:1rem;opacity:0.25;}"}),Ts=u("div",{target:"e1of12hx0"})({name:"115sh08",styles:"width:auto;display:flex;flex-direction:column;align-items:flex-end;gap:1.25rem"});function As(e){return V(e.edition??"")==="christmas"}const Fs=30,Is=e=>{const[n,s]=D(nt),r=As(e);st(!0,r),d.useEffect(()=>{r&&s(!0)},[]),d.useEffect(()=>{!n&&r?s(!0):n&&!r&&s(!1)},[n,e])};function Ns({songPreview:e,top:n,left:s,width:r,height:a,keyboardControl:i,onExitKeyboardControl:o,onPlay:l,focusEffect:c}){const[g,m]=d.useState(!1),p=d.useRef(null),{width:h,height:f}=he();Is(e);const x=i;d.useLayoutEffect(()=>{m(!1)},[e.video]);const k=e.previewStart??(e.videoGap??0)+60,b=e.previewEnd??k+Fs,v=d.useMemo(()=>[e.video,k,b,e.volume],[e.video,k,b,e.volume]),[w,j,S,y]=Yt(v,350);d.useEffect(()=>{var E;(E=p.current)==null||E.loadVideoById({videoId:w,startSeconds:j,endSeconds:S})},[w,p,j,S]);const C=x?h:r,P=x?f:a,L=x?Math.min(h/20*9,f*(4/5)):a;return d.useEffect(()=>{var E;(E=p.current)==null||E.setSize(C,P)},[C,P,i]),t.jsxs(t.Fragment,{children:[x&&t.jsx(Ds,{onClick:o}),!x&&g&&t.jsx(qs,{width:C,height:P,left:s,top:n,song:e}),t.jsx(Bs,{background:x||g,video:t.jsx(Os,{show:g,expanded:x,height:L,id:"preview-video-container",children:t.jsx(Wt,{width:0,height:0,disablekb:!0,ref:p,video:"",volume:y,onStateChange:E=>{var z,O;E===Z.ENDED?((z=p.current)==null||z.seekTo(k),(O=p.current)==null||O.playVideo()):E===Z.PLAYING&&m(!0)}})}),focused:!0,song:e,top:n,left:s,width:C,height:L,showVideo:g,expanded:x,"data-test":"song-preview","data-song":e.id,children:t.jsx(_s,{expanded:x,children:x&&t.jsx(Ms,{songPreview:e,onPlay:l,keyboardControl:i,onExitKeyboardControl:o})})})]})}var Rs={name:"17gota2",styles:"border:0;border-radius:0;position:fixed;padding:var(--preview-padding)"};const Ls=u(ut,{target:"evapa6h4"})("--preview-padding:5rem;width:",e=>e.width,"px;height:",e=>e.height,"px;position:absolute;z-index:",e=>e.expanded?201:3,";overflow:hidden;visibility:",e=>e.expanded||e.showVideo?"visible":"hidden",";",e=>e.expanded?Rs:H("pointer-events:none;",e.showVideo&&e.theme.graphicSetting==="high"?"animation: rhythmPulse 1s infinite":"scale: 1.2",";",""),";@keyframes rhythmPulse{0%{transform:scale(1.2);}15%{transform:scale(1.25);}100%{transform:scale(1.2);}}view-transition-name:song-preview;",xe,"{view-transition-name:song-preview-artist;}",se,"{view-transition-name:song-preview-title;}",gt,"{view-transition-name:song-preview-expanded-data;}"),Bs=e=>{const n=e.song.realBpm??(e.song.bpm>300?e.song.bpm/4:e.song.bpm/2);return t.jsx(Ls,{style:{top:e.expanded?`calc(50vh - ${e.height}px / 2)`:e.top,left:e.expanded?0:e.left,animationDuration:`${60/n}s`},...e})},Ds=u("div",{target:"evapa6h3"})({name:"1iz7jdz",styles:"position:fixed;top:0;left:0;background:rgba(0, 0, 0, 0.8);width:100vw;height:100vh;z-index:201"});var $s={name:"pfrwim",styles:"position:absolute;top:0;left:0;background-image:none!important;border-radius:0.5rem"};const Os=u("div",{target:"evapa6h2"})(e=>e.expanded?H("position:fixed;inset:0;clip-path:inset(calc((100vh - ",e.height,"px) / 2) 0);",""):$s," div{opacity:",({show:e})=>e?1:0,";transition:",({show:e,expanded:n})=>e||n?1e3:0,"ms;}"),_s=u("div",{target:"evapa6h1"})("inset:auto var(--preview-padding);position:fixed;z-index:100;",e=>!e.expanded&&"transform: scale(0.1);"," border-radius:0.5rem;view-transition-name:song-preview-content;"),Gs=u("div",{target:"evapa6h0"})("background:white;width:",e=>e.width,"px;height:",e=>e.height,"px;z-index:2;top:0;left:0;position:absolute;animation:bpm 1s infinite;border-radius:0.5rem;pointer-events:none;@keyframes bpm{0%{transform:scale(1.15);opacity:1;}100%{transform:scale(1.45);opacity:0;}}"),qs=e=>{const[n]=D(Be);if(n==="low")return null;const s=e.song.realBpm??(e.song.bpm>300?e.song.bpm/4:e.song.bpm/2);return t.jsx(Gs,{width:e.width,height:e.height,style:{left:e.left,top:e.top,animationDuration:`${60/s}s`}})};let ce=0;function bt(){d.useEffect(()=>(document.body.classList.add("blockOverflow"),document.documentElement.classList.add("blockOverflow"),ce++,()=>{ce--,ce===0&&(document.body.classList.remove("blockOverflow"),document.documentElement.classList.remove("blockOverflow"))}),[])}const Vs=1.2,Fe=4;function Hs({onSongSelected:e,preselectedSong:n}){const[s]=D(et),r=s?Fe-1:Fe;at(!1),bt();const[{previewTop:a,previewLeft:i,previewWidth:o,previewHeight:l},c]=d.useState({previewTop:0,previewLeft:0,previewWidth:0,previewHeight:0}),{focusedGroup:g,focusedSong:m,moveToSong:p,groupedSongList:h,keyboardControl:f,songPreview:x,setKeyboardControl:k,setFilters:b,filters:v,setShowFilters:w,showFilters:j,isLoading:S,randomSong:y,selectedPlaylist:C,setSelectedPlaylist:P,playlists:L}=On(n,r),E=d.useRef(null),{width:z,handleResize:O}=he(),K=U(g),ae=U(m);d.useEffect(()=>{var Y,be,Se;const T=(wt,kt)=>`[data-group-letter="${wt}"] [data-index="${kt}"]`;O();const B=(Y=E.current)==null?void 0:Y.querySelector(T(K,ae)),A=(be=E.current)==null?void 0:be.querySelector(T(g,m));A&&((!B||B.offsetTop!==A.offsetTop)&&((Se=A.scrollIntoView)==null||Se.call(A,{behavior:"smooth",inline:"center",block:"center"})),c({previewLeft:A.offsetLeft,previewTop:A.offsetTop,previewWidth:A.offsetWidth,previewHeight:A.offsetHeight}))},[z,E,m,g,h]);const re=d.useCallback(()=>k(!1),[k]),M=S||!h||!z;return t.jsxs(Ks,{songsPerRow:r,children:[M?t.jsx(ta,{children:t.jsx(rt,{size:"15em",color:"secondary"})}):t.jsxs(t.Fragment,{children:[x&&t.jsx(Ys,{videoId:x.video}),t.jsx(Pn,{setFilters:b,filters:v,onRandom:y,keyboardControl:f}),t.jsxs(Js,{ref:E,active:f,"data-test":"song-list-container",dim:j,children:[h.length===0&&t.jsx(Xs,{children:"No songs found"}),x&&t.jsx(Ns,{songPreview:x,onPlay:e,keyboardControl:!f,onExitKeyboardControl:()=>k(!0),top:a,left:i,width:o,height:l,focusEffect:!j}),h.map(T=>d.createElement(Ws,{...j||!f?{"data-unfocusable":!0}:{},key:T.letter,"data-group-letter":T.letter,highlight:T.letter==="New"},t.jsx(St,{children:T.letter}),t.jsx(Qs,{children:T.songs.map(({song:B,index:A})=>t.jsx(ea,{song:B,handleClick:m===A?re:p,focused:!j&&f&&A===m,index:A,"data-index":A,"data-focused":!j&&f&&A===m,"data-test":`song-${B.id}${T.isNew?"-new-group":""}`},B.id))}))),t.jsxs(Us,{children:["Missing a song? Try ",t.jsx("a",{href:"convert",children:"adding one"})," yourself!"]})]})]}),t.jsx(_n,{selectedPlaylist:C,setSelectedPlaylist:P,playlists:L,active:j,closePlaylist:w})]})}const Us=u("span",{target:"ef4zhl29"})(R,";text-align:center;font-size:5rem;margin-top:10rem;"),Ks=u("div",{target:"ef4zhl28"})("display:flex;flex-direction:row;max-height:100vh;--song-list-gap:3.5rem;--song-item-width:",e=>`calc(${100/e.songsPerRow}% - ((${e.songsPerRow-1} / ${e.songsPerRow}) * var(--song-list-gap)))`,";--song-item-ratio:calc(16 / 9 * (4 / ",e=>e.songsPerRow,"));"),Ys=u(zn,{target:"ef4zhl27"})({name:"1i2rgvj",styles:"position:fixed;inset:0;width:100%;height:100%;filter:blur(5px) grayscale(90%);opacity:0.25;object-fit:cover"}),Ws=u("div",{target:"ef4zhl26"})("padding:0 4.5rem 0 11rem;",e=>e.highlight&&H("background:rgba(0, 0, 0, 0.5);padding-bottom:3rem;border-bottom:0.2rem solid black;",St,"{animation:new-song-group-header 600ms ease-in-out infinite both;background:#ffffff;@keyframes new-song-group-header{0%,100%{transform:scale(1);}50%{transform:scale(1.1);}}}",""),";"),Xs=u("div",{target:"ef4zhl25"})(R,";display:flex;align-items:center;justify-content:center;flex:1;font-size:10rem;"),St=u("div",{target:"ef4zhl24"})(R,";display:inline-block;padding:0.5rem 1rem;margin-bottom:2rem;font-size:3.5rem;position:sticky;z-index:1;top:calc(-1 * var(--song-list-gap));color:",I.colors.text.active,";background:rgba(0, 0, 0, 0.7);"),Js=u("div",{target:"ef4zhl23"})("position:relative;flex:1 1 auto;display:flex;flex-direction:column;gap:var(--song-list-gap);padding:4.5rem 0;overflow-y:auto;overflow-x:clip;box-sizing:border-box;min-height:100vh;max-height:100vh;::-webkit-scrollbar{display:none;}transition:opacity 500ms;opacity:",e=>e.dim?.5:1,";"),Qs=u("div",{target:"ef4zhl22"})({name:"bviq7b",styles:"display:flex;flex-direction:row;flex-wrap:wrap;gap:var(--song-list-gap)"});var Zs={name:"1jwmbuq",styles:"transition:300ms"};const ea=d.memo(u(ut,{target:"ef4zhl21"})("cursor:pointer;flex-basis:var(--song-item-width);aspect-ratio:var(--song-item-ratio);",e=>e.theme.graphicSetting==="high"&&Zs," transform:scale(",e=>e.focused?Vs:1,");",e=>e.focused&&"z-index: 2;"," ",e=>e.focused&&Xt," content-visibility:auto;contain-intrinsic-size:calc(var(--song-item-width) * (1 / var(--song-item-ratio)));")),ta=u("div",{target:"ef4zhl20"})({name:"101j4br",styles:"display:flex;align-items:center;justify-content:center;height:100vh"});function na(e){const[n,s]=D($e),[r,a]=d.useState(n===null),i=()=>{s(n??[]),a(!1)};return r?t.jsx(Jt,{onClose:i,closeText:"Continue to Song Selection"}):t.jsx(Hs,{...e})}function yt(){const[e]=D(Qt);d.useEffect(()=>{try{e&&document.body.requestFullscreen().catch(console.info)}catch{}},[])}const sa="/assets/459342__papaninkasettratat__cinematic-music-short-RLBkkUq3.mp3",q=e=>new Promise(n=>setTimeout(n,e)),le=15;function aa({onFinish:e}){const n=d.useRef(null),[s,r]=d.useState(!1),[a,i]=d.useState([]);te(F.readinessConfirmed,c=>{i(g=>[...g,c])});const o=ge([F.inputListChanged,F.readinessConfirmed],()=>$.getPlayers().map((c,g)=>[c.input.deviceId,c.getName(),c]));d.useEffect(()=>{(async()=>{var h,f,x;let c=!1;const g=$.requestReadiness().then(()=>{c=!0,r(!0)}),m=q(1500),p=q(le*1e3);await q(250),c||await((h=n==null?void 0:n.current)==null?void 0:h.play()),await Promise.race([Promise.all([g,m]),p]),(f=n==null?void 0:n.current)!=null&&f.paused||Zt.play(),await q(500),(x=n==null?void 0:n.current)==null||x.pause(),await q(1e3),e()})()},[]);const l=o.map(([c,g,m])=>({confirmed:a.includes(c),name:g,player:m}));return t.jsxs(t.Fragment,{children:[t.jsxs(ra,{children:[!s&&t.jsxs("span",{children:["Waiting for all players to click ",t.jsx("strong",{children:'"Ready"'})]}),t.jsx(oa,{children:l.map(({confirmed:c,name:g,player:m},p)=>t.jsxs(ca,{className:"ph-no-capture","data-test":"player-confirm-status","data-name":g,"data-confirmed":c,children:[!s&&t.jsx(la,{children:c?t.jsx(wn,{}):t.jsx(rt,{color:"info",size:"1em"})})," ",t.jsx(pt,{player:m})]},p))}),!s&&t.jsxs(ia,{children:["The song will start automatically in"," ",t.jsx("strong",{children:t.jsx(it,{end:0,start:le,duration:le,useEasing:!1})})]})]}),t.jsx("audio",{src:sa,ref:n,hidden:!0,autoPlay:!1,onPlay:c=>{c.currentTarget.volume=.8}})]})}const ra=u("div",{target:"e1sds9f4"})("top:0;left:0;z-index:1000;display:flex;align-items:center;justify-content:center;flex-direction:column;position:absolute;width:100%;height:100%;gap:5rem;font-size:5rem;",R,";"),ia=u("span",{target:"e1sds9f3"})({name:"1umnjfm",styles:"font-size:5rem"}),oa=u("div",{target:"e1sds9f2"})({name:"1uxgijs",styles:"display:flex;flex-direction:column;gap:5rem;width:50rem;view-transition-name:player-mic-check-container"}),ca=u("div",{target:"e1sds9f1"})({name:"174652e",styles:"display:flex;align-items:center;gap:2rem;transform:scale(1.5)"}),la=u("span",{target:"e1sds9f0"})({name:"1l5xwqu",styles:"svg{width:5rem;height:5rem;stroke:black;}"}),da=250,de=(e,n=0,s=1/0)=>e.filter(ot).filter(r=>ct([r])>=n).filter(r=>ee([r])<=s).reduce((r,a)=>r+a.notes.reduce((i,o)=>i+o.length,0),0),ua=(e,n)=>{const[s,...r]=e.filter(ot),a=[[s]];return r.forEach(i=>{const o=a.at(-1),l=ee(o);(ct([i])-l)*n>da?a.push([i]):o.push(i)}),a},vt=(e,n)=>e+n,Ie=e=>{const n=e.map(s=>s.reduce(vt,0));return Math.max(...n)-Math.min(...n)},ga=(e,n)=>{const s=fn(e),r=i=>{if(s[i-1].length<2)return;const o=s[i-1].pop();s[i].push(o)},a=i=>{var c;if(((c=s[i+1])==null?void 0:c.length)<2)return;const[o,...l]=s[i+1];s[i].push(o),s[i+1]=l};return n%2===1?r(Math.ceil(n/2)):a(Math.ceil(n/2)),s},ha=e=>e.reduce(vt,0);function ma(e){const s=en(e);return e.tracks.map(r=>{if(r.sections.length<3)return[];const a=ua(r.sections,s);let i=[],o=[de(a[0])];for(let l=0;l<a.length-2;l++){const c=a[i.flat().length-1]??[],m=de(r.sections,ee(c)??0)/(1+9-i.length),p=de(a[l+1]),h=ha(o);h+p<m?o=[...o,p]:m-h<h+p-m?(i.push(o),o=[p]):(i.push([...o,p]),o=[])}for(let l=0;l<100;l++){const c=Ie(i),g=tn((i.length-2)*2+2).map(f=>ga(i,f)),m=g.map(Ie),p=Math.min(...m);if(c<=p)break;const h=m.indexOf(p);i=g[h]}return i.map(l=>l.length).reduce((l,c)=>[...l,(l.at(-1)??0)+c],[]).map(l=>ee(a[l-1]))})}const Ne=[t.jsxs(t.Fragment,{children:["You can follow the updates and give feedback on the game through the Facebook Page:"," ",t.jsx("a",{href:"https://www.facebook.com/allkaraoke.party",target:"_blank",rel:"noreferrer",children:t.jsx("strong",{children:"fb.com/AllKaraoke.Party"})})]}),t.jsxs(t.Fragment,{children:["Start typing a name of a song in ",t.jsx("strong",{children:"Song Selection"})," to active Search feature"]}),t.jsxs(t.Fragment,{children:["Narrow down songs through ",t.jsx("strong",{children:"playlists"})," on the right in Song Selection"]}),t.jsxs(t.Fragment,{children:["Select ",t.jsx("strong",{children:"Pass The Mic"})," Game Mode to share the microphones and sing in a team"]}),t.jsxs(t.Fragment,{children:["Your scores and ",t.jsx("strong",{children:"stats are saved"})," in this browser - they will be available for the next party!"]}),t.jsxs(t.Fragment,{children:["You can remove irrelevant songs from the Song Selection in ",t.jsx("strong",{children:"Edit Songs"})," page"]}),t.jsxs(t.Fragment,{children:["If the game feels a bit jaggy with low FPS, check out ",t.jsx("strong",{children:"Settings"})," page"]}),t.jsxs(t.Fragment,{children:["Party is only getting started? Play ",t.jsx("strong",{children:"Jukebox"})," for the music and to see what songs are available"]}),t.jsxs(t.Fragment,{children:["Research shows that ",t.jsx("strong",{children:"duet songs"})," are that bit more fun than simple one-track ones"]}),t.jsxs(t.Fragment,{children:["Want to sing a ",t.jsx("strong",{children:"new song"}),"? Find UltraStar version of it and import it with",t.jsx("br",{}),t.jsx("strong",{children:"Convert Ultrastar .txt"})]}),t.jsxs(t.Fragment,{children:["The ",t.jsx("strong",{children:"white pulse"})," around selected song in Song Selection tries to match song's tempo"]}),t.jsxs(t.Fragment,{children:["Entire game (besides add/edit song) is navigable with ",t.jsx("strong",{children:"Keyboard"})]}),t.jsxs(t.Fragment,{children:["You can hide or show keyboard navigation help with ",t.jsx("kbd",{children:"H"})," key"]}),t.jsxs(t.Fragment,{children:["In Song Selection, hold ",t.jsx("kbd",{children:"↑"})," or ",t.jsx("kbd",{children:"↓"})," to jump to the next letter"]}),t.jsxs(t.Fragment,{children:["Add ",t.jsx("strong",{children:"vibrato"})," to the notes you sing to get additional ",t.jsx("strong",{children:"bonus points"})]}),t.jsxs(t.Fragment,{children:["You can control the game with your phone - click on the"," ",t.jsxs("strong",{children:[t.jsx(nn,{}),"QR Code Icon"]})," ","on the top right and follow the instructions"]})],fa=({as:e="h4",...n})=>{const s=d.useRef(Q(0,Ne.length-1)),r=e;return t.jsx(r,{...n,children:Ne[s.current]})};function pa({...e}){const[n,s]=d.useState(""),r=d.useRef(null);return d.useEffect(()=>{const a=setTimeout(()=>{s(me.getVideo())},1e3);return()=>{clearTimeout(a)}},[]),d.useEffect(()=>{try{r.current&&(r.current.playbackRate=16)}catch(a){De(a)}},[n]),t.jsx(xa,{...e,children:t.jsx(ba,{src:n,ref:r,loop:!0,autoPlay:!0,className:"ph-no-capture"})})}const xa=u("div",{target:"egk8upf1"})({name:"1g34f1k",styles:"width:80rem;height:60rem"}),ba=u("video",{target:"egk8upf0"})({name:"idj2s4",styles:"object-fit:cover;width:100%;height:100%"});function Sa(e){return 1-Math.pow(1-e,3)}function ya(e){return Sa(e)}function X({color:e,maxScore:n,score:s}){return t.jsx(va,{style:{border:s===0?0:void 0,width:`${ya(s/n)*24}%`,backgroundColor:e}})}const va=u("div",{target:"epk9dli0"})({name:"1vc31u",styles:`background-image:linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.17) 0%,
    rgba(0, 0, 0, 0.03) 50%,
    rgba(0, 0, 0, 0.18) 51%,
    rgba(0, 0, 0, 0.18) 100%
  );transition:1s;border-radius:0.5rem;height:100%;border:solid 0.1rem black;box-sizing:border-box`});function ja({playerNumber:e,player:n,segment:s}){const[r,a]=n.detailedScore;return t.jsxs(wa,{children:[t.jsx(X,{score:s>-1?r.rap+r.freestyle+r.normal:0,maxScore:a.rap+a.freestyle+a.normal,color:I.colors.players[e].perfect.fill}),t.jsx(X,{score:s>0?r.perfect:0,maxScore:a.perfect,color:I.colors.players[e].stroke}),t.jsx(X,{score:s>1?r.star:0,maxScore:a.star,color:I.colors.players[e].starPerfect.stroke}),t.jsx(X,{score:s>2?r.vibrato:0,maxScore:a.vibrato,color:I.colors.players[e].perfect.stroke}),t.jsx(ka,{children:s<5&&t.jsx(sn,{options:{strings:["Regular notes","Perfect notes","Star notes","Vibrato"],pauseFor:1e3,autoStart:!0,delay:15,deleteSpeed:15,cursor:""}})})]})}const wa=u("div",{target:"e10trgut1"})({name:"yex4ym",styles:"position:relative;height:4rem;width:100rem;background:rgba(0, 0, 0, 0.5);display:flex;flex-direction:row;padding:0.5rem;border-radius:1rem;gap:0.5rem"}),ka=u("span",{target:"e10trgut0"})("position:absolute;",R,";font-size:3rem;text-align:right;white-space:nowrap;top:5rem;left:1rem;display:block;");function Ea({playerNumber:e,player:n,highestScore:s,highScores:r,singSetup:a,useColors:i=!0,revealHighScore:o,segment:l}){const[c]=n.detailedScore;let g=0;l>-1&&(g=c.normal+c.rap+c.freestyle),l>0&&(g=g+c.perfect),l>1&&(g=g+c.star),l>2&&(g=g+c.vibrato);const m=p=>r.some(h=>h.singSetupId===a.id&&h.name===p);return t.jsxs(Ca,{children:[t.jsx(jt,{color:i?I.colors.players[e].text:"","data-test":`player-${e}-name`,className:"ph-no-capture",children:n.name}),t.jsx(Ma,{children:t.jsxs(Pa,{highscore:o&&m(n.name),color:i?I.colors.players[e].text:"",win:o&&g===s,"data-test":`player-${e}-score`,"data-score":g,children:[t.jsx(it,{preserveValue:!0,end:g,formattingFn:pn.format,duration:l<5?1:.5}),t.jsx(za,{highscore:o&&m(n.name),children:"High score!"})]})}),t.jsx(ja,{playerNumber:e,player:n,segment:l})]})}const Ca=u("div",{target:"e1hn1x414"})({name:"1kdaoj4",styles:"display:flex;flex-direction:column;align-items:center;gap:1.5rem"}),jt=u(an,{target:"e1hn1x413"})("padding-left:10rem;padding-right:10rem;font-size:3.5rem;color:",e=>e.color,";"),Pa=u(jt,{target:"e1hn1x412"})("font-size:",e=>e.win?"8.5rem":"5.5rem",";color:",e=>e.win?I.colors.text.active:"white",";transition:400ms ease-in-out;position:relative;"),Ma=u("div",{target:"e1hn1x411"})({name:"f9rldz",styles:"height:8.5rem"}),za=u(rn,{target:"e1hn1x410"})("top:-1.5rem;right:-10rem;font-size:3rem;",e=>e.highscore&&on,";opacity:",e=>e.highscore?"1":"0",";transition:400ms;");function Ta({onNextStep:e,players:n,highScores:s,singSetup:r}){const[a,i]=d.useState(-1);d.useEffect(()=>{if(a<0)i(0);else if(a<4){const f=setInterval(()=>{i(x=>x+1)},1500);return()=>{clearInterval(f)}}},[a]);const o=a>3,l=()=>{o?e():(ln.capture("animation_skipped"),i(5))};ue({accept:l},!0,[a]);const c=d.useMemo(()=>({accept:"Next"}),[]);Ge(c,!0);const g=r.mode===N.CO_OP,m=g?[{...n[0],name:n.map(f=>f.name).join(", ")}]:n,p=m.map(f=>cn(f.detailedScore[0])),h=Math.max(...p);return t.jsxs(t.Fragment,{children:[t.jsx(Aa,{children:m.map((f,x)=>t.jsx(Ea,{playerNumber:f.playerNumber,useColors:!g,revealHighScore:a>3,segment:a,player:f,highScores:s,highestScore:h,singSetup:r},x))}),t.jsx(Fa,{onClick:l,focused:!0,"data-test":o?"highscores-button":"skip-animation-button",children:o?"Next":"Skip"}),me.getPermissionStatus()&&t.jsx(Ia,{})]})}const Aa=u("div",{target:"ez8rfb42"})({name:"nvdiyi",styles:"position:absolute;top:20rem;width:100%;text-align:center;display:flex;flex-direction:column;gap:2rem"}),Fa=u(G,{target:"ez8rfb41"})({name:"dmbiod",styles:"position:absolute;bottom:4rem;right:2rem;width:40rem;font-size:1.9vw"}),Ia=u(pa,{target:"ez8rfb40"})({name:"1c3jvq",styles:"position:absolute;top:calc(50% - 30rem);left:95rem;transform:scale(0.75)"});function Na(){return d.useMemo(()=>JSON.parse(sessionStorage.getItem(tt))??[],[])}function Ra({score:e,register:n,singSetupId:s,onSave:r,index:a}){const i=d.useRef(null),[o,l]=d.useState(""),c=Na(),g=()=>{o.trim().length&&o.trim()!==e.name&&r(s,e.score,e.name,o)};return t.jsx(xt,{className:"ph-no-capture",options:c,onChange:l,onBlur:g,value:o,label:"",ref:i,...n(`highscore-rename-${a}`,()=>{var m;return(m=i.current)==null?void 0:m.focus()}),placeholder:e.name,"data-test":"input-edit-highscore","data-original-name":e.name})}function La({onNextStep:e,highScores:n,singSetup:s,song:r}){const{register:a}=ne(),i=Xn(r);return t.jsxs(t.Fragment,{children:[t.jsx(Ba,{"data-test":"highscores-container",children:n.map((o,l)=>t.jsxs(Da,{isCurrentSing:o.singSetupId===s.id,children:[t.jsx($a,{children:l+1}),t.jsx(Oa,{className:"ph-no-capture",children:o.singSetupId===s.id?t.jsx(Ra,{index:l,score:o,register:a,singSetupId:s.id,onSave:i}):o.name}),t.jsx(_a,{children:t.jsx(xn,{score:o.score})}),t.jsx(Ga,{children:_(o.date).format("MMMM DD, YYYY")})]},l))}),t.jsx(qa,{...a("play-next-song-button",e,void 0,!0),children:"Select song"})]})}const Ba=u("div",{target:"e161j45v6"})({name:"9gtmjg",styles:"position:absolute;top:20rem;width:100%;text-align:center;padding:0 16rem;box-sizing:border-box"}),Da=u("div",{target:"e161j45v5"})("position:relative;",R,";font-size:3.2rem;display:flex;background:",e=>e.isCurrentSing?"rgba(0,0,0,.9)":"rgba(0,0,0,.5)",";margin-bottom:2rem;padding:",e=>e.isCurrentSing?"0 1.5rem":"1rem 3.2rem",";align-items:center;"),$a=u("div",{target:"e161j45v4"})("padding:0 1.6rem;color:",I.colors.text.active,";"),Oa=u("div",{target:"e161j45v3"})({name:"1mbe2e5",styles:"text-align:left;flex:1;padding:1.6rem"}),_a=u("div",{target:"e161j45v2"})({name:"2ycp6t",styles:"padding:0 1rem"}),Ga=u("div",{target:"e161j45v1"})({name:"1gbnj87",styles:"position:absolute;font-size:2rem;bottom:-1rem;right:-1.6rem;background:black;padding:0.5rem"}),qa=u(G,{target:"e161j45v0"})({name:"dmbiod",styles:"position:absolute;bottom:4rem;right:2rem;width:40rem;font-size:1.9vw"});function Va({song:e,width:n,height:s,onClickSongSelection:r,players:a,highScores:i,singSetup:o}){const[l]=D(nt);at(!0);const[c,g]=d.useState("results");return t.jsxs(dn,{songData:e,width:n,height:s,children:[t.jsxs(Ha,{children:[c==="results"&&t.jsx(Ta,{onNextStep:()=>g("highscores"),players:a,singSetup:o,highScores:i}),c==="highscores"&&t.jsx(La,{onNextStep:r,singSetup:o,highScores:i,song:e}),t.jsx(Ua,{$active:!0})]}),l&&t.jsxs(Ka,{children:["Credit to ",t.jsx("a",{href:"https://www.FesliyanStudios.com",children:"https://www.FesliyanStudios.com"})," for the background music."]})]})}const Ha=u("div",{target:"ehc5trj2"})({name:"1quw0ni",styles:"pointer-events:auto"}),Ua=u(fa,{shouldForwardProp:e=>!e.startsWith("$"),target:"ehc5trj1"})("transition:300ms;transform:scale(",({$active:e})=>e?1:0,");position:absolute;bottom:20rem;font-size:3.2rem;line-height:1.25;color:white;text-align:center;background:rgba(0, 0, 0, 0.75);width:100%;box-sizing:border-box;padding:2rem 10rem;kbd{padding:0.12rem 0.9rem;border-radius:1rem;border:0.5rem solid rgb(204, 204, 204);border-bottom-color:rgb(150, 150, 150);border-right-color:rgb(150, 150, 150);color:rgb(51, 51, 51);line-height:1.4;display:inline-block;box-shadow:0 0.1rem 0 rgba(0, 0, 0, 0.2),inset 0 0 0 0.2rem #ffffff;background-color:rgb(247, 247, 247);text-shadow:0 0.1rem 0 #fff;font-weight:normal;}"),Ka=u("span",{target:"ehc5trj0"})("position:fixed;bottom:2rem;left:2rem;font-size:1.5rem;",R,";");function Ya(e,n){const s=pe(e);return d.useMemo(()=>s==null?void 0:s.scores.filter(({setup:a})=>a.mode===n.mode&&a.tolerance===n.tolerance).map(a=>a.scores.map(i=>({...i,date:a.date,singSetupId:a.setup.id}))).flat().sort((a,i)=>i.score-a.score).slice(0,5),[s,n])??[]}function Wa({song:e,width:n,height:s,onClickSongSelection:r,singSetup:a}){const i=Ya(e,a),o=d.useMemo(()=>$.getPlayers().map(l=>({name:l.getName(),playerNumber:l.number,detailedScore:J.getPlayerDetailedScore(l.number)})),[]);return t.jsx(Va,{singSetup:a,song:e,width:n,height:s,onClickSongSelection:r,players:o,highScores:i})}function Xa({songPreview:e,singSetup:n,returnToSongSelection:s,restartSong:r}){yt(),bt();const a=d.useRef(null),i=un(e.id),{width:o,height:l}=he(),[c,g]=d.useState(!1),[m,p]=d.useState(!0),[h,f]=d.useState(Z.UNSTARTED),x=d.useMemo(()=>i.data?n.mode!==N.PASS_THE_MIC?i.data.tracks.map(()=>[]):ma(i.data):[],[i.data,n]),[k,b]=d.useState(!1);return st(!k),d.useEffect(()=>{m&&i.data&&(k||h!==Z.UNSTARTED)&&p(!1)},[i.data,k,h,m]),c&&i.data?t.jsx(Wa,{width:o,height:l,song:i.data,onClickSongSelection:s,singSetup:n}):t.jsxs(Ja,{children:[t.jsxs(Qa,{visible:m,children:[t.jsx(er,{video:e.video,width:o,height:l}),t.jsx(tr,{children:e.artist}),t.jsx(nr,{children:e.title}),t.jsx(aa,{onFinish:()=>{var v;b(!0),(v=a.current)==null||v.play()}})]}),i.data&&t.jsx(bn,{ref:a,onStatusChange:f,playerChanges:x,players:n.players,song:i.data,width:o,height:l,autoplay:!1,onSongEnd:()=>{var w;const v=((w=J.getSingSetup())==null?void 0:w.mode)===N.CO_OP?[{name:$.getPlayers().map(j=>j.getName()).join(", "),score:J.getPlayerScore(0)}]:$.getPlayers().map(j=>({name:j.getName(),score:J.getPlayerScore(j.number)}));F.songEnded.dispatch(i.data,n,v),g(!0)},singSetup:n,restartSong:r})]})}const Ja=u("div",{target:"e1pnu1v94"})({name:"bjn8wh",styles:"position:relative"}),Qa=u("div",{target:"e1pnu1v93"})("position:fixed;top:0;left:0;z-index:10;pointer-events:none;background-color:black;view-transition-name:song-preview;opacity:",e=>e.visible?1:0,";transition:500ms;"),Za=u("div",{target:"e1pnu1v92"})({name:"oux8x1",styles:"background-size:cover;background-position:center center;filter:blur(10px)"}),er=e=>t.jsx(Za,{style:{backgroundImage:`url('https://i3.ytimg.com/vi/${e.video}/hqdefault.jpg')`,width:`${e.width}px`,height:`${e.height}px`}}),tr=u(xe,{target:"e1pnu1v91"})({name:"oyknw4",styles:"view-transition-name:song-preview-artist;position:absolute;top:10rem;left:10rem;font-size:7rem"}),nr=u(se,{target:"e1pnu1v90"})({name:"1l9juvo",styles:"view-transition-name:song-preview-title;position:absolute;font-size:8rem;top:19rem;left:10rem"});function rr(e){const[n,s]=d.useState(null),[r,a]=d.useState(e.songId??null),[i,o]=d.useState(0),l=c=>{document.getElementById("preview-video-container").style.viewTransitionName="song-preview-video",Ve(()=>{document.getElementById("preview-video-container").style.viewTransitionName="",He.flushSync(()=>{s(c)})}),Ue.play()};return yt(),t.jsx(t.Fragment,{children:n?t.jsx(Xa,{restartSong:()=>{me.restartRecord(),o(c=>c+1)},songPreview:n.song,singSetup:n,returnToSongSelection:()=>{a(n.song.id),s(null)}},i):t.jsx(na,{onSongSelected:l,preselectedSong:r})})}export{rr as default};
//# sourceMappingURL=Game-5Ct1QTWN.js.map
