const products = [
  {id:'SM-101',brand:'Velora',name:'Cloud Matte Lip Colour',shade:'Rosewood Tea',hex:'#A1495E',price:179,mrp:299,rating:4.3,reviews:1842,finish:'Soft matte',coverage:'Medium, buildable',seller:'Niva Beauty House',verified:true,creator:'Riya · Jaipur'},
  {id:'SM-102',brand:'Mellow Muse',name:'Comfort Crème Lipstick',shade:'Muted Berry',hex:'#963F5A',price:149,mrp:249,rating:4.2,reviews:935,finish:'Cream satin',coverage:'Full',seller:'Mellow Cosmetics',verified:true,creator:'Anu · Indore'},
  {id:'SM-103',brand:'Tinge',name:'Everyday Velvet Lip',shade:'Dusty Mauve',hex:'#98566D',price:129,mrp:219,rating:4.1,reviews:2208,finish:'Velvet matte',coverage:'Medium',seller:'Tinge Retail',verified:true,creator:'Sana · Lucknow'},
  {id:'SM-104',brand:'Hue Habit',name:'Stay Soft Liquid Lip',shade:'Brick Bloom',hex:'#853743',price:199,mrp:349,rating:4.4,reviews:761,finish:'Liquid matte',coverage:'Full',seller:'Hue Habit India',verified:true,creator:'Mehak · Bhopal'},
  {id:'SM-105',brand:'Poppy Lane',name:'Satin Swipe Lipstick',shade:'Warm Terracotta',hex:'#B85A45',price:119,mrp:199,rating:4.0,reviews:3180,finish:'Satin',coverage:'Sheer, buildable',seller:'Poppy Lane Traders',verified:false,creator:'Diya · Surat'},
  {id:'SM-106',brand:'Nudestory',name:'Soft Blur Lip Mousse',shade:'Cocoa Plum',hex:'#6C3549',price:189,mrp:299,rating:4.3,reviews:612,finish:'Powder matte',coverage:'Medium',seller:'Nudestory Labs',verified:true,creator:'Farah · Nagpur'},
  {id:'SM-107',brand:'Tint Room',name:'Weightless Lip Tint',shade:'Berry Pink',hex:'#B54E72',price:99,mrp:179,rating:4.1,reviews:4290,finish:'Natural tint',coverage:'Sheer',seller:'Tint Room',verified:true,creator:'Kriti · Patna'},
  {id:'SM-108',brand:'Velora',name:'Cloud Matte Lip Colour',shade:'Deep Wine',hex:'#73263D',price:179,mrp:299,rating:4.5,reviews:1291,finish:'Soft matte',coverage:'Full',seller:'Niva Beauty House',verified:true,creator:'Riya · Jaipur'},
  {id:'SM-109',brand:'Mellow Muse',name:'Comfort Crème Lipstick',shade:'Peach Chai',hex:'#C57768',price:149,mrp:249,rating:4.2,reviews:807,finish:'Cream satin',coverage:'Medium',seller:'Mellow Cosmetics',verified:true,creator:'Anu · Indore'},
  {id:'SM-110',brand:'Hue Habit',name:'Stay Soft Liquid Lip',shade:'Cool Mulberry',hex:'#7E3659',price:199,mrp:349,rating:4.4,reviews:583,finish:'Liquid matte',coverage:'Full',seller:'Hue Habit India',verified:true,creator:'Mehak · Bhopal'},
  {id:'SM-111',brand:'Poppy Lane',name:'Satin Swipe Lipstick',shade:'Coral Haze',hex:'#C9615B',price:119,mrp:199,rating:3.9,reviews:1760,finish:'Satin',coverage:'Medium',seller:'Poppy Lane Traders',verified:false,creator:'Diya · Surat'},
  {id:'SM-112',brand:'Nudestory',name:'Soft Blur Lip Mousse',shade:'Brown Rose',hex:'#87534E',price:189,mrp:299,rating:4.3,reviews:949,finish:'Powder matte',coverage:'Medium',seller:'Nudestory Labs',verified:true,creator:'Farah · Nagpur'}
];

const $ = (selector, scope=document) => scope.querySelector(selector);
const $$ = (selector, scope=document) => [...scope.querySelectorAll(selector)];
const state = {
  mode:'camera', stream:null, currentHex:'#9B435C', baseLab:null, targetLab:null,
  refine:'exact', query:'', compare:[], selectedProduct:null,
  saved:JSON.parse(localStorage.getItem('shadeMatchSaved') || '[]'),
  bag:JSON.parse(localStorage.getItem('shadeMatchBag') || '[]'),
  profile:JSON.parse(localStorage.getItem('shadeMatchProfile') || 'null')
};

const els = {
  stage:$('#captureStage'), empty:$('#stageEmpty'), video:$('#cameraVideo'), canvas:$('#imageCanvas'), badge:$('#stageBadge'),
  primary:$('#primaryCapture'), upload:$('#uploadButton'), input:$('#imageInput'), sampleRow:$('#sampleRow'), grid:$('#productGrid'),
  swatch:$('#detectedSwatch'), detectedName:$('#detectedName'), hex:$('#hexValue'), rgb:$('#rgbValue'), lab:$('#labValue'),
  quality:$('#qualityLabel'), qualityCopy:$('#qualityCopy'), confidence:$('#confidenceValue'), activeRef:$('#activeReference'),
  resultCount:$('#resultCount'), toast:$('#toast'), drawer:$('#productDrawer'), backdrop:$('#drawerBackdrop'), drawerContent:$('#drawerContent'),
  compareTray:$('#compareTray'), compareNames:$('#compareNames'), compareSwatches:$('#compareSwatches'), compareButton:$('#compareButton'),
  savedCount:$('#savedCount'), bagCount:$('#bagCount')
};

function clamp(v,min,max){return Math.min(max,Math.max(min,v));}
function hexToRgb(hex){const h=hex.replace('#','');return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)};}
function rgbToHex(r,g,b){return '#'+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('').toUpperCase();}
function rgbToLab(r,g,b){
  let [R,G,B]=[r,g,b].map(v=>{v/=255;return v>.04045?Math.pow((v+.055)/1.055,2.4):v/12.92;});
  let x=(R*.4124564+G*.3575761+B*.1804375)/.95047;
  let y=(R*.2126729+G*.7151522+B*.0721750);
  let z=(R*.0193339+G*.1191920+B*.9503041)/1.08883;
  [x,y,z]=[x,y,z].map(v=>v>.008856?Math.cbrt(v):(7.787*v)+(16/116));
  return {L:(116*y)-16,a:500*(x-y),b:200*(y-z)};
}
function hexToLab(hex){const c=hexToRgb(hex);return rgbToLab(c.r,c.g,c.b);}
function deltaE(l1,l2){
  const rad=Math.PI/180,deg=180/Math.PI;
  const C1=Math.hypot(l1.a,l1.b),C2=Math.hypot(l2.a,l2.b),Cbar=(C1+C2)/2;
  const G=.5*(1-Math.sqrt(Math.pow(Cbar,7)/(Math.pow(Cbar,7)+Math.pow(25,7))));
  const a1=(1+G)*l1.a,a2=(1+G)*l2.a,c1=Math.hypot(a1,l1.b),c2=Math.hypot(a2,l2.b);
  const hp=(a,b)=>{let h=Math.atan2(b,a)*deg;return h<0?h+360:h;};
  const h1=hp(a1,l1.b),h2=hp(a2,l2.b),dL=l2.L-l1.L,dC=c2-c1;
  let dh=h2-h1;if(c1*c2===0)dh=0;else if(dh>180)dh-=360;else if(dh<-180)dh+=360;
  const dH=2*Math.sqrt(c1*c2)*Math.sin((dh/2)*rad),Lbar=(l1.L+l2.L)/2,cbar=(c1+c2)/2;
  let hbar;if(c1*c2===0)hbar=h1+h2;else if(Math.abs(h1-h2)<=180)hbar=(h1+h2)/2;else hbar=(h1+h2+360)/2;if(hbar>=360)hbar-=360;
  const T=1-.17*Math.cos((hbar-30)*rad)+.24*Math.cos(2*hbar*rad)+.32*Math.cos((3*hbar+6)*rad)-.20*Math.cos((4*hbar-63)*rad);
  const dTheta=30*Math.exp(-Math.pow((hbar-275)/25,2)),Rc=2*Math.sqrt(Math.pow(cbar,7)/(Math.pow(cbar,7)+Math.pow(25,7)));
  const Sl=1+(.015*Math.pow(Lbar-50,2))/Math.sqrt(20+Math.pow(Lbar-50,2)),Sc=1+.045*cbar,Sh=1+.015*cbar*T,Rt=-Math.sin(2*dTheta*rad)*Rc;
  return Math.sqrt(Math.pow(dL/Sl,2)+Math.pow(dC/Sc,2)+Math.pow(dH/Sh,2)+Rt*(dC/Sc)*(dH/Sh));
}
function shadeDescriptor(lab){
  const chroma=Math.hypot(lab.a,lab.b); let tone=lab.L<35?'deep':lab.L>62?'light':'muted';
  let family=lab.a>35&&lab.b<0?'berry':lab.a>30&&lab.b>20?'coral':lab.b>18?'terracotta':lab.a>20?'rose':'nude';
  if(chroma>55&&tone==='muted')tone='rich'; return `${tone} ${family}`;
}
function refinedLab(){
  const b={...state.baseLab};
  if(state.refine==='muted'){b.a*=.72;b.b*=.72;}
  if(state.refine==='lighter')b.L=clamp(b.L+9,0,100);
  if(state.refine==='deeper')b.L=clamp(b.L-9,0,100);
  if(state.refine==='warmer'){b.b+=10;b.a+=2;}
  if(state.refine==='cooler'){b.b-=10;b.a+=2;}
  return b;
}
function rankedProducts(){
  state.targetLab=refinedLab();
  return products.map(p=>({...p,distance:deltaE(state.targetLab,hexToLab(p.hex))})).filter(p=>{
    const q=state.query.trim().toLowerCase(); if(!q||/^#?[0-9a-f]{6}$/i.test(q))return true;
    return `${p.brand} ${p.name} ${p.shade} ${p.seller} ${p.finish}`.toLowerCase().includes(q);
  }).sort((a,b)=>{
    const finishBonus=state.profile&&a.finish.toLowerCase().includes(state.profile.finish)?-1.2:0;
    const finishBonusB=state.profile&&b.finish.toLowerCase().includes(state.profile.finish)?-1.2:0;
    return (a.distance+finishBonus)-(b.distance+finishBonusB);
  });
}
function lipstickMarkup(product){return `<div class="lipstick" style="--shade:${product.hex}"><span class="tube"></span><span class="collar"></span><span class="bullet"></span></div>`;}
function productCard(p,index){
  const close=Math.round(clamp(100-p.distance*2.2,68,98));
  return `<article class="product-card" data-id="${p.id}">
    <div class="product-visual"><span class="match-pill">${index===0?'Closest · ':''}${close}% colour fit</span><span class="shade-drop" style="--shade:${p.hex}"></span>${lipstickMarkup(p)}<button class="compare-toggle ${state.compare.includes(p.id)?'is-selected':''}" data-compare="${p.id}">${state.compare.includes(p.id)?'Selected':'Compare'}</button></div>
    <div class="product-copy"><span class="product-brand">${p.brand}</span><h3>${p.name}</h3><div class="shade-line"><i style="--shade:${p.hex}"></i>${p.shade} · ${p.hex}</div><div class="price-line"><strong>₹${p.price}</strong><del>₹${p.mrp}</del><span class="rating">${p.rating} ★</span></div><div class="proof-line"><span>${p.reviews.toLocaleString('en-IN')} reviews</span><b>${p.verified?'✓ Shade verified':'Seller reference'}</b></div></div>
  </article>`;
}
function renderProducts(){
  const ranked=rankedProducts(); els.resultCount.textContent=ranked.length;
  els.grid.innerHTML=ranked.length?ranked.map(productCard).join(''):'<p class="empty-message">No demo products match that search.</p>';
  const swatch=$('span',els.activeRef);swatch.style.setProperty('--active',state.currentHex);$('b',els.activeRef).textContent=state.currentHex;
  $$('.product-card').forEach(card=>card.addEventListener('click',e=>{if(e.target.closest('[data-compare]'))return;openProduct(card.dataset.id);}));
  $$('[data-compare]').forEach(btn=>btn.addEventListener('click',()=>toggleCompare(btn.dataset.compare)));
}
function updateShade(hex, meta={label:'Camera estimate',copy:'Tap again to retake',confidence:78}){
  state.currentHex=hex.toUpperCase();state.baseLab=hexToLab(state.currentHex);state.refine='exact';
  const rgb=hexToRgb(state.currentHex),lab=state.baseLab;
  els.swatch.style.background=state.currentHex;els.detectedName.textContent=shadeDescriptor(lab);els.hex.textContent=state.currentHex;
  els.rgb.textContent=`${rgb.r}, ${rgb.g}, ${rgb.b}`;els.lab.textContent=`${Math.round(lab.L)}, ${Math.round(lab.a)}, ${Math.round(lab.b)}`;
  els.quality.textContent=meta.label;els.qualityCopy.textContent=meta.copy;els.confidence.textContent=`${meta.confidence}%`;
  $$('.refine-chip').forEach(b=>b.classList.toggle('is-active',b.dataset.refine==='exact'));renderProducts();
}
function toast(message){els.toast.textContent=message;els.toast.classList.add('is-visible');clearTimeout(toast.t);toast.t=setTimeout(()=>els.toast.classList.remove('is-visible'),2400);}

async function startCamera(){
  if(!navigator.mediaDevices?.getUserMedia){toast('Camera needs HTTPS or localhost. Try image upload.');setMode('upload');return;}
  try{
    state.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false});
    els.video.srcObject=state.stream;await els.video.play();els.stage.className='capture-stage has-video';els.badge.textContent='Live · keep lighting even';
    els.primary.querySelector('span').textContent='Capture shade';els.primary.dataset.action='capture';
  }catch(err){toast(err.name==='NotAllowedError'?'Camera permission was not granted. Upload a photo instead.':'Camera unavailable. Upload a photo instead.');setMode('upload');}
}
function stopCamera(){if(state.stream){state.stream.getTracks().forEach(t=>t.stop());state.stream=null;}els.video.srcObject=null;}
function samplePixels(ctx,x,y,size){
  const sx=clamp(Math.round(x-size/2),0,ctx.canvas.width-size),sy=clamp(Math.round(y-size/2),0,ctx.canvas.height-size);
  const data=ctx.getImageData(sx,sy,size,size).data;let r=0,g=0,b=0,n=0,lumas=[];
  for(let i=0;i<data.length;i+=4){const R=data[i],G=data[i+1],B=data[i+2],mx=Math.max(R,G,B),mn=Math.min(R,G,B);if(mx>247||mx<12||mx-mn<3)continue;r+=R;g+=G;b+=B;n++;lumas.push(.2126*R+.7152*G+.0722*B);}
  if(!n)return {hex:'#9B435C',confidence:35,spread:0};r/=n;g/=n;b/=n;const mean=lumas.reduce((a,v)=>a+v,0)/lumas.length;const variance=lumas.reduce((a,v)=>a+Math.pow(v-mean,2),0)/lumas.length;
  const exposure=mean<45||mean>225?-.25:0,stability=Math.sqrt(variance)>58?-.2:0;return {hex:rgbToHex(r,g,b),confidence:Math.round(clamp(82+(exposure+stability)*100,42,88)),spread:Math.sqrt(variance)};
}
function captureVideo(){
  if(!els.video.videoWidth)return;const c=document.createElement('canvas');c.width=els.video.videoWidth;c.height=els.video.videoHeight;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(els.video,0,0,c.width,c.height);
  const result=samplePixels(ctx,c.width/2,c.height/2,Math.max(20,Math.round(Math.min(c.width,c.height)*.12)));
  updateShade(result.hex,{label:result.confidence>70?'Lighting looks usable':'Low capture confidence',copy:result.confidence>70?'Closest catalog references updated':'Try softer, brighter light and rescan',confidence:result.confidence});toast('Shade captured and catalog re-ranked');
}
function drawUploaded(file){
  if(!file)return;const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const max=1100,scale=Math.min(max/img.width,800/img.height,1);els.canvas.width=Math.round(img.width*scale);els.canvas.height=Math.round(img.height*scale);const ctx=els.canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,els.canvas.width,els.canvas.height);els.stage.className='capture-stage has-image';els.badge.textContent='Tap the colour you want to match';els.primary.querySelector('span').textContent='Pick centre shade';els.primary.dataset.action='sample-image';sampleCanvasAt(els.canvas.width/2,els.canvas.height/2);};img.src=reader.result;};reader.readAsDataURL(file);
}
function sampleCanvasAt(x,y){const ctx=els.canvas.getContext('2d',{willReadFrequently:true});const result=samplePixels(ctx,x,y,Math.max(16,Math.round(Math.min(els.canvas.width,els.canvas.height)*.06)));updateShade(result.hex,{label:'Photo estimate',copy:'Tap elsewhere to sample another area',confidence:result.confidence});}
function setMode(mode){
  state.mode=mode;stopCamera();$$('.mode-tab').forEach(b=>{const on=b.dataset.mode===mode;b.classList.toggle('is-active',on);b.setAttribute('aria-selected',String(on));});
  els.stage.className='capture-stage';els.sampleRow.hidden=mode!=='demo';els.upload.hidden=mode==='demo';els.primary.dataset.action='';
  if(mode==='camera'){els.badge.textContent='Camera is off';els.primary.querySelector('span').textContent='Start camera';els.upload.textContent='Choose a photo';}
  if(mode==='upload'){els.badge.textContent='Upload a clear, unfiltered photo';els.primary.querySelector('span').textContent='Choose a photo';els.upload.textContent='Use demo shade';}
  if(mode==='demo'){els.badge.textContent='Choose a sample below';els.primary.querySelector('span').textContent='Use current sample';}
}

function openProduct(id){
  const p=products.find(x=>x.id===id);if(!p)return;state.selectedProduct=p;const d=deltaE(state.targetLab||state.baseLab,hexToLab(p.hex)),close=Math.round(clamp(100-d*2.2,68,98));
  els.drawerContent.innerHTML=`<div class="drawer-hero" style="--shade:${p.hex}"><span class="drawer-match">${close}% colour fit · ΔE ${d.toFixed(1)}</span>${lipstickMarkup(p)}</div><div class="drawer-info"><span class="product-brand">${p.brand} · ${p.seller}</span><h2>${p.name}</h2><div class="drawer-shade"><i style="--shade:${p.hex}"></i><b>${p.shade}</b> ${p.hex} · ${p.id}</div><div class="drawer-price">₹${p.price} <del>₹${p.mrp}</del></div><div class="drawer-actions"><button class="button button-secondary" id="saveProduct">♡ Save shade</button><button class="button button-primary" id="addBag">Add to bag</button></div><div class="mini-passport"><h3>Shade Passport</h3><div class="mini-specs"><div><span>Reference</span><b>${p.hex} · Lab ${Object.values(hexToLab(p.hex)).map(Math.round).join(', ')}</b></div><div><span>Finish</span><b>${p.finish}</b></div><div><span>Coverage</span><b>${p.coverage}</b></div><div><span>Seller capture</span><b>${p.verified?'QC verified':'Pending full QC'}</b></div></div><div class="drawer-creator"><img src="assets/creator-proof.png" alt="Demo creator"><div><span>CREATOR PROOF · EXACT SHADE</span><strong>${p.creator}</strong><span>Window daylight · no colour filter</span><button type="button" id="drawerCreator">View application notes →</button></div></div></div><p class="fine-print">Reference colour supports comparison. Applied appearance changes with lip pigmentation, coat count, finish, lighting and screen settings.</p></div>`;
  els.backdrop.hidden=false;els.drawer.classList.add('is-open');els.drawer.setAttribute('aria-hidden','false');
  $('#saveProduct').addEventListener('click',()=>saveProduct(p));$('#addBag').addEventListener('click',()=>addToBag(p));$('#drawerCreator').addEventListener('click',()=>toast('Creator used one coat, then layered the lower lip. No colour filter declared.'));
}
function closeDrawer(){els.drawer.classList.remove('is-open');els.drawer.setAttribute('aria-hidden','true');setTimeout(()=>els.backdrop.hidden=true,260);}
function saveProduct(p){if(!state.saved.some(x=>x.id===p.id))state.saved.push({id:p.id,name:`${p.brand} · ${p.shade}`,hex:p.hex,type:'product'});localStorage.setItem('shadeMatchSaved',JSON.stringify(state.saved));updateCounts();toast(`${p.shade} saved on this device`);}
function saveCurrentScan(){const id=`scan-${state.currentHex}`;if(!state.saved.some(x=>x.id===id))state.saved.unshift({id,name:`Scanned ${shadeDescriptor(state.baseLab)}`,hex:state.currentHex,type:'scan'});localStorage.setItem('shadeMatchSaved',JSON.stringify(state.saved));updateCounts();}
function addToBag(p){state.bag.push({id:p.id,name:`${p.brand} · ${p.shade}`,hex:p.hex,price:p.price});localStorage.setItem('shadeMatchBag',JSON.stringify(state.bag));updateCounts();toast(`${p.shade} added to your demo bag`);}
function updateCounts(){els.savedCount.textContent=state.saved.length;els.bagCount.textContent=state.bag.length;}
function toggleCompare(id){state.compare=state.compare.includes(id)?state.compare.filter(x=>x!==id):state.compare.length<2?[...state.compare,id]:[state.compare[1],id];renderProducts();renderCompare();}
function renderCompare(){const ps=state.compare.map(id=>products.find(p=>p.id===id)).filter(Boolean);els.compareTray.hidden=!ps.length;els.compareNames.textContent=ps.map(p=>p.shade).join(' vs ')||'Select up to 2 products';els.compareSwatches.innerHTML=ps.map(p=>`<i style="background:${p.hex}"></i>`).join('');els.compareButton.disabled=ps.length!==2;}
function openComparison(){const [a,b]=state.compare.map(id=>products.find(p=>p.id===id));if(!a||!b)return;const between=deltaE(hexToLab(a.hex),hexToLab(b.hex));els.drawerContent.innerHTML=`<div class="drawer-info"><span class="step-label">SIDE-BY-SIDE SHADE CHECK</span><h2>${a.shade} vs ${b.shade}</h2><p class="fine-print">Their catalog references are ΔE ${between.toFixed(1)} apart. Lower values are closer, but applied finish still matters.</p><div class="mini-passport"><div class="passport-body"><div class="passport-swatch" style="background:${a.hex}"></div><div><span>${a.brand}</span><h3>${a.shade}</h3><p>${a.hex} · ${a.finish}</p></div></div></div><div class="mini-passport"><div class="passport-body"><div class="passport-swatch" style="background:${b.hex}"></div><div><span>${b.brand}</span><h3>${b.shade}</h3><p>${b.hex} · ${b.finish}</p></div></div></div><button class="button button-primary button-wide" id="closeCompareDrawer">Return to results</button></div>`;els.backdrop.hidden=false;els.drawer.classList.add('is-open');els.drawer.setAttribute('aria-hidden','false');$('#closeCompareDrawer').addEventListener('click',closeDrawer);}
function renderSaved(){const list=$('#savedList');list.innerHTML=state.saved.length?state.saved.map(x=>`<div class="saved-item" data-saved="${x.id}"><i style="--saved:${x.hex}"></i><div><strong>${x.name}</strong><span>${x.hex} · ${x.type==='scan'?'camera reference':'catalog shade'}</span></div><button data-remove-saved="${x.id}">Remove</button></div>`).join(''):'<p class="empty-message">No shades saved yet. Open a product or save your current scan.</p>';$$('[data-remove-saved]',list).forEach(b=>b.onclick=()=>{state.saved=state.saved.filter(x=>x.id!==b.dataset.removeSaved);localStorage.setItem('shadeMatchSaved',JSON.stringify(state.saved));updateCounts();renderSaved();});}
function renderBag(){const list=$('#bagList');list.innerHTML=state.bag.length?state.bag.map((x,i)=>`<div class="saved-item"><i style="--saved:${x.hex}"></i><div><strong>${x.name}</strong><span>${x.hex}</span></div><b>₹${x.price}</b><button data-remove-bag="${i}">Remove</button></div>`).join(''):'<p class="empty-message">Your demo bag is empty.</p>';$('#bagTotal').textContent=`₹${state.bag.reduce((n,x)=>n+x.price,0)}`;$$('[data-remove-bag]',list).forEach(b=>b.onclick=()=>{state.bag.splice(Number(b.dataset.removeBag),1);localStorage.setItem('shadeMatchBag',JSON.stringify(state.bag));updateCounts();renderBag();});}

$$('.mode-tab').forEach(btn=>btn.addEventListener('click',()=>setMode(btn.dataset.mode)));
els.primary.addEventListener('click',()=>{if(state.mode==='camera'){els.primary.dataset.action==='capture'?captureVideo():startCamera();}else if(state.mode==='upload'){els.input.click();}else{saveCurrentScan();toast('Sample saved as a shade reference');}});
els.upload.addEventListener('click',()=>state.mode==='upload'?setMode('demo'):els.input.click());els.input.addEventListener('change',e=>drawUploaded(e.target.files[0]));
els.canvas.addEventListener('click',e=>{const r=els.canvas.getBoundingClientRect();sampleCanvasAt((e.clientX-r.left)*els.canvas.width/r.width,(e.clientY-r.top)*els.canvas.height/r.height);});
$$('#sampleRow button').forEach(b=>b.addEventListener('click',()=>{updateShade(b.dataset.color,{label:'Demo reference',copy:'Choose another sample or scan your own',confidence:84});$$('#sampleRow button').forEach(x=>x.style.outline='');b.style.outline='3px solid #f43397';}));
$$('.refine-chip').forEach(btn=>btn.addEventListener('click',()=>{state.refine=btn.dataset.refine;$$('.refine-chip').forEach(b=>b.classList.toggle('is-active',b===btn));renderProducts();}));
$('#globalSearch').addEventListener('input',e=>{state.query=e.target.value;const raw=state.query.trim().replace('#','');if(/^[0-9a-fA-F]{6}$/.test(raw))updateShade(`#${raw}`,{label:'Typed colour reference',copy:'Catalog ranked from your HEX value',confidence:90});else renderProducts();});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#globalSearch').focus();}if(e.key==='Escape')closeDrawer();});
$('#copyColor').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(state.currentHex);toast(`${state.currentHex} copied`);}catch{toast(`Colour code: ${state.currentHex}`);}});
$('#drawerClose').addEventListener('click',closeDrawer);els.backdrop.addEventListener('click',closeDrawer);$('#compareButton').addEventListener('click',openComparison);$('#clearCompare').addEventListener('click',()=>{state.compare=[];renderProducts();renderCompare();});
$('#profileButton').addEventListener('click',()=>$('#profileDialog').showModal());$('#savedButton').addEventListener('click',()=>{renderSaved();$('#savedDialog').showModal();});$('#bagButton').addEventListener('click',()=>{renderBag();$('#bagDialog').showModal();});
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.close).close()));
$('#profileForm').addEventListener('submit',e=>{e.preventDefault();state.profile=Object.fromEntries(new FormData(e.currentTarget));localStorage.setItem('shadeMatchProfile',JSON.stringify(state.profile));$('#profileDialog').close();renderProducts();toast(`Profile saved · prioritising ${state.profile.finish} finishes`);});
$('#checkoutButton').addEventListener('click',()=>toast('Demo checkout reached. No order was placed.'));$('#playCreator').addEventListener('click',e=>{e.currentTarget.textContent=e.currentTarget.textContent==='▶'?'Ⅱ':'▶';toast('Creator proof: exact shade, daylight, one coat, no colour filter');});
window.addEventListener('pagehide',stopCamera);

products.forEach(p=>p.lab=hexToLab(p.hex));state.baseLab=hexToLab(state.currentHex);updateCounts();renderProducts();

// Optional WebMCP surface. Browsers without the proposed API ignore this block.
if(document.modelContext?.registerTool){
  const directions=['exact','muted','lighter','deeper','warmer','cooler'];
  const register=tool=>{try{void Promise.resolve(document.modelContext.registerTool(tool)).catch(()=>{});}catch{}}
  register({name:'set_shade_reference',title:'Set shade reference',description:'Set a six-digit HEX colour as the active ShadeMatch reference and update the visible product ranking.',inputSchema:{type:'object',properties:{hex:{type:'string',pattern:'^#?[0-9A-Fa-f]{6}$'}},required:['hex'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute({hex}){if(!/^#?[0-9A-Fa-f]{6}$/.test(hex))throw new Error('Enter a six-digit HEX colour.');const value=`#${hex.replace('#','').toUpperCase()}`;updateShade(value,{label:'Tool-set colour reference',copy:'Catalog ranked from the supplied HEX value',confidence:90});return {hex:value,topMatches:rankedProducts().slice(0,3).map(p=>({id:p.id,shade:p.shade,hex:p.hex}))};}});
  register({name:'refine_shade_results',title:'Refine shade results',description:'Change the visible ShadeMatch result direction to closest, more muted, lighter, deeper, warmer or cooler.',inputSchema:{type:'object',properties:{direction:{type:'string',enum:directions}},required:['direction'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute({direction}){if(!directions.includes(direction))throw new Error('Unsupported refinement direction.');state.refine=direction;$$('.refine-chip').forEach(b=>b.classList.toggle('is-active',b.dataset.refine===direction));renderProducts();return {direction,topMatches:rankedProducts().slice(0,3).map(p=>({id:p.id,shade:p.shade,hex:p.hex}))};}});
  register({name:'get_top_shade_matches',title:'Get top shade matches',description:'Read the current colour reference and the highest-ranked catalog shades without changing the page.',inputSchema:{type:'object',properties:{limit:{type:'integer',minimum:1,maximum:6}},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute({limit=3}={}){return {reference:state.currentHex,refinement:state.refine,matches:rankedProducts().slice(0,limit).map(p=>({id:p.id,brand:p.brand,shade:p.shade,hex:p.hex,price:p.price,distance:Number(p.distance.toFixed(2))}))};}});
}
