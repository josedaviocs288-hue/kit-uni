const defaultKitnets = [
  {id:1,title:'Studio Benfica Universitário',university:'UFC',neighborhood:'Benfica • Fortaleza, CE',price:850,dayRate:95,nightRate:78,distance:.8,lat:-3.7439,lng:-38.5534,safety:9.1,type:'Mobiliada',shared:true,maxPeople:3,images:['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'],features:['Wi-Fi incluso','Água inclusa','Mesa de estudos','Portaria'],description:'Studio compacto e mobiliado, ideal para estudante que busca praticidade e acesso rápido ao campus.',owner:'Marcos Lima',rating:4.9,verified:true,day:true,night:true,monthly:true},
  {id:2,title:'Kitnet Campus Itaperi',university:'UECE',neighborhood:'Itaperi • Fortaleza, CE',price:720,dayRate:70,nightRate:60,distance:1.2,lat:-3.7872,lng:-38.5531,safety:8.5,type:'Semi-mobiliada',shared:true,maxPeople:2,images:['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'],features:['Ventilador','Cozinha','Área de serviço','Garagem para moto'],description:'Opção econômica próxima à UECE, com espaço funcional e boa mobilidade para o campus.',owner:'Ana Ribeiro',rating:4.7,verified:true,day:true,night:true,monthly:true},
  {id:3,title:'Loft Universitário Premium',university:'UNIFOR',neighborhood:'Edson Queiroz • Fortaleza, CE',price:1450,dayRate:160,nightRate:135,distance:.6,lat:-3.7699,lng:-38.4806,safety:9.4,type:'Mobiliada',shared:false,maxPeople:1,images:['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80'],features:['Ar-condicionado','Academia','Segurança 24h','Internet'],description:'Loft moderno com estrutura completa para quem prioriza conforto e proximidade com a UNIFOR.',owner:'Carlos Menezes',rating:4.9,verified:true,day:true,night:true,monthly:true},
  {id:4,title:'Residencial Jovem IFCE',university:'IFCE',neighborhood:'Benfica • Fortaleza, CE',price:680,dayRate:0,nightRate:0,distance:1.7,lat:-3.7450,lng:-38.5365,safety:8.2,type:'Sem mobília',shared:true,maxPeople:4,images:['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'],features:['Cozinha','Banheiro privativo','Área comum','Bicicletário'],description:'Kitnet simples e acessível para quem quer economizar sem abrir mão de localização prática.',owner:'João Freire',rating:4.5,verified:false,day:false,night:false,monthly:true},
  {id:5,title:'Studio Benfica Compacto',university:'UFC',neighborhood:'Benfica • Fortaleza, CE',price:980,dayRate:110,nightRate:90,distance:.4,lat:-3.7422,lng:-38.5558,safety:8.8,type:'Mobiliada',shared:false,maxPeople:1,images:['https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=1200&q=80'],features:['Mesa de estudos','Geladeira','Cama','Internet'],description:'Studio pensado para rotina universitária, com mesa de estudos e estrutura compacta completa.',owner:'Lúcia Nogueira',rating:4.8,verified:true,day:true,night:true,monthly:true},
  {id:6,title:'Kitnet Itaperi Econômica',university:'UECE',neighborhood:'Itaperi • Fortaleza, CE',price:590,dayRate:55,nightRate:48,distance:2.4,lat:-3.7931,lng:-38.5587,safety:7.9,type:'Sem mobília',shared:true,maxPeople:3,images:['https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1200&q=80'],features:['Ambiente compacto','Cozinha','Área ventilada','Água inclusa'],description:'Alternativa de baixo custo para estudantes, com fácil acesso por transporte local.',owner:'Pedro Alves',rating:4.4,verified:true,day:true,night:true,monthly:true}
];

let kitnets = [...defaultKitnets];
let currentStay = 'monthly';
let showingFavorites = false;
let selectedBookingId = null;
let uploadedImages = [];
let favorites = JSON.parse(localStorage.getItem('kituni-favorites') || '[]');
let profile = JSON.parse(localStorage.getItem('kituni-profile') || 'null');
let userLocation = null;
const campusCoords = {
  UFC:{lat:-3.7447,lng:-38.5747},
  UECE:{lat:-3.7892,lng:-38.5527},
  UNIFOR:{lat:-3.7681,lng:-38.4797},
  IFCE:{lat:-3.7442,lng:-38.5369}
};

const $ = (id)=>document.getElementById(id);
const listingGrid=$('listingGrid'), resultCount=$('resultCount'), emptyState=$('emptyState'), detailsModal=$('detailsModal'), modalContent=$('modalContent'), toast=$('toast');
const publishModal=$('publishModal'), accountModal=$('accountModal'), bookingModal=$('bookingModal'), roommateModal=$('roommateModal');

function money(value){return Number(value||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});}
function showToast(message){toast.textContent=message;toast.classList.remove('hidden');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.add('hidden'),2300);}
function updateFavCount(){$('favCount').textContent=favorites.length;}
function displayPrice(k){if(currentStay==='day')return [k.dayRate,' / dia'];if(currentStay==='night')return [k.nightRate,' / noite'];if(currentStay==='shared')return [Math.ceil(k.price/Math.max(2,k.maxPeople||2)),' / pessoa'];return [k.price,' / mês'];}
function stayAvailable(k){if(currentStay==='day')return k.day&&k.dayRate>0;if(currentStay==='night')return k.night&&k.nightRate>0;if(currentStay==='shared')return k.shared;return k.monthly;}
function stayLabel(){return {monthly:'aluguel mensal',day:'aluguel por dia',night:'uma noite',shared:'dividir aluguel'}[currentStay];}
function haversineKm(lat1,lng1,lat2,lng2){
  const R=6371,toRad=v=>v*Math.PI/180;
  const dLat=toRad(lat2-lat1),dLng=toRad(lng2-lng1);
  const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}
function kmFromUser(k){
  if(!userLocation || typeof k.lat!=='number' || typeof k.lng!=='number')return null;
  return haversineKm(userLocation.lat,userLocation.lng,k.lat,k.lng);
}
function formatKm(value){
  if(value===null || !Number.isFinite(value))return '';
  if(value<1)return `${Math.max(10,Math.round(value*1000/10)*10)} m`;
  return `${value.toFixed(value<10?1:0).replace('.',',')} km`;
}
function updateLocationUi(active,message){
  const btn=$('locationBtn'),clear=$('clearLocationBtn');
  btn.disabled=false;
  btn.classList.toggle('active',active);
  btn.textContent=active?'✓ Localização ativada':'📍 Usar minha localização';
  clear.classList.toggle('hidden',!active);
  $('distanceLabel').textContent=active?'Distância máxima de você':'Distância máxima do campus';
  $('locationStatus').textContent=message || (active?'Moradias ordenadas da mais próxima para a mais distante':'Veja primeiro as moradias mais próximas de você');
}
function requestLocation(){
  if(!navigator.geolocation){updateLocationUi(false,'Seu navegador não oferece acesso à localização.');showToast('Localização indisponível neste navegador.');return;}
  const btn=$('locationBtn');btn.disabled=true;btn.textContent='Obtendo localização…';$('locationStatus').textContent='Autorize o acesso à localização no navegador.';
  navigator.geolocation.getCurrentPosition(pos=>{
    userLocation={lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy};
    updateLocationUi(true,`Localização ativada • precisão aproximada de ${Math.round(pos.coords.accuracy)} m`);
    showingFavorites=false;render();showToast('Moradias ordenadas pela sua localização.');$('kitnets').scrollIntoView({behavior:'smooth'});
  },err=>{
    const msg=err.code===1?'Permissão de localização negada.':err.code===2?'Não foi possível determinar sua localização.':'A localização demorou para responder.';
    updateLocationUi(false,msg);showToast(msg);
  },{enableHighAccuracy:true,timeout:12000,maximumAge:300000});
}
function clearLocation(){userLocation=null;updateLocationUi(false);render();showToast('Localização desativada.');}


function cardTemplate(k){
  const isFav=favorites.includes(k.id), [value,unit]=displayPrice(k),userKm=kmFromUser(k);
  return `<article class="listing-card">
    <div class="card-image"><img src="${k.images[0]}" alt="${k.title}"><div class="card-badges"><span class="card-badge">${k.university} • ${k.distance} km do campus</span>${userKm!==null?`<span class="card-badge nearby">📍 ${formatKm(userKm)} de você</span>`:''}${k.shared?'<span class="card-badge gold">Aceita dividir</span>':''}</div><button class="fav-btn ${isFav?'active':''}" data-fav="${k.id}">${isFav?'♥':'♡'}</button></div>
    <div class="card-body"><div class="card-location">${k.neighborhood}</div><h3 class="card-title">${k.title}</h3>${k.verified?'<div class="verified">✓ Proprietário verificado</div>':'<div class="verified" style="color:#7d8998">Perfil em verificação</div>'}
    ${userKm!==null?`<div class="user-distance-row">${formatKm(userKm)} da sua localização atual</div>`:''}
    <div class="card-meta"><div class="meta-chip">Segurança<strong class="safety-chip">${k.safety}/10</strong></div><div class="meta-chip">Estrutura<strong>${k.type}</strong></div><div class="meta-chip">Avaliação<strong>★ ${k.rating}</strong></div><div class="meta-chip">Campus<strong>${k.university} • ${k.distance} km</strong></div></div>
    ${k.shared?`<div class="share-pill">🤝 Dividindo com ${k.maxPeople} pessoas: aprox. ${money(Math.ceil(k.price/k.maxPeople))}/pessoa</div>`:''}
    <div class="price-row"><div class="price"><strong>${money(value)}</strong><span>${unit}</span></div><button class="details-btn" data-details="${k.id}">Ver detalhes</button></div></div>
  </article>`;
}
function getFiltered(){
  let items=showingFavorites?kitnets.filter(k=>favorites.includes(k.id)):kitnets;
  const u=$('universityFilter').value,p=Number($('priceFilter').value),d=Number($('distanceFilter').value),t=$('typeFilter').value;
  items=items.filter(k=>{
    const [price]=displayPrice(k),userKm=kmFromUser(k),distanceToUse=userLocation?(userKm??Infinity):k.distance;
    return stayAvailable(k)&&(u==='all'||k.university===u)&&price<=p&&distanceToUse<=d&&(t==='all'||k.type===t);
  });
  if(userLocation)items.sort((a,b)=>(kmFromUser(a)??Infinity)-(kmFromUser(b)??Infinity));
  return items;
}function render(items=getFiltered()){
  listingGrid.innerHTML=items.map(cardTemplate).join('');resultCount.textContent=items.length;emptyState.classList.toggle('hidden',items.length!==0);listingGrid.classList.toggle('hidden',items.length===0);
  $('resultsTitle').textContent=userLocation?'Moradias mais próximas de você':currentStay==='shared'?'Kitnets para dividir com outros estudantes':currentStay==='day'?'Kitnets disponíveis por dia':currentStay==='night'?'Kitnets para passar uma noite':'Kitnets perto da universidade';
  $('resultsSubtitle').textContent=userLocation?`Ordenadas pela distância da sua localização atual • opções para ${stayLabel()}.`:`Mostrando opções para ${stayLabel()}.`;
}
function setStay(stay,scroll=false){currentStay=stay;showingFavorites=false;document.querySelectorAll('.stay-tab').forEach(b=>b.classList.toggle('active',b.dataset.stay===stay));render();if(scroll)$('kitnets').scrollIntoView({behavior:'smooth'});}
function toggleFavorite(id){favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];localStorage.setItem('kituni-favorites',JSON.stringify(favorites));updateFavCount();render();showToast(favorites.includes(id)?'Adicionado aos favoritos':'Removido dos favoritos');}

function openDetails(id){
  const k=kitnets.find(x=>x.id===id);if(!k)return;const [value,unit]=displayPrice(k),userKm=kmFromUser(k);
  modalContent.innerHTML=`<div class="modal-hero"><img src="${k.images[0]}" alt="${k.title}"><span class="modal-image-count">📷 ${k.images.length} foto${k.images.length>1?'s':''}</span></div>
  <div class="modal-inner"><span class="section-kicker">${k.university} • ${k.distance} km do campus</span><h2>${k.title}</h2><p>${k.neighborhood}</p>${userKm!==null?`<div class="location-note">📍 Esta moradia está a aproximadamente <strong>${formatKm(userKm)}</strong> da sua localização atual.</div>`:''}
  <div class="owner-row"><div class="owner-profile"><div class="owner-avatar">${k.owner.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div><strong>${k.owner}</strong><small>${k.verified?'✓ Proprietário verificado':'Perfil em verificação'}</small></div></div><div class="rating">★ ${k.rating}</div></div>
  <div class="modal-info-grid"><div class="info-box"><span>Valor atual</span><strong>${money(value)}${unit}</strong></div><div class="info-box"><span>Segurança</span><strong>${k.safety}/10</strong></div><div class="info-box"><span>Estrutura</span><strong>${k.type}</strong></div><div class="info-box"><span>${userKm!==null?'De você':'Do campus'}</span><strong>${userKm!==null?formatKm(userKm):`${k.distance} km`}</strong></div></div>
  <p>${k.description}</p><div class="check-list">${k.features.map(f=>`<span>✓ ${f}</span>`).join('')}</div>
  ${k.shared?`<div class="share-details">🤝 <strong>Esta kitnet aceita divisão.</strong> Em ${k.maxPeople} moradores, o aluguel fica em aproximadamente ${money(Math.ceil(k.price/k.maxPeople))} para cada pessoa, antes das demais despesas.</div>`:''}
  <div class="modal-actions"><button class="btn primary" data-book="${k.id}">${currentStay==='monthly'?'Solicitar aluguel':'Solicitar estadia'}</button><button class="btn account-btn" data-visit="${k.id}">Agendar visita</button><button class="btn ghost" style="color:#17304f;border-color:#dfe6ef;background:#f6f8fb" data-modal-fav="${k.id}">${favorites.includes(k.id)?'♥ Favoritado':'♡ Favoritar'}</button></div></div>`;
  detailsModal.classList.remove('hidden');
  modalContent.querySelector('[data-modal-fav]').onclick=e=>{toggleFavorite(Number(e.currentTarget.dataset.modalFav));openDetails(id)};
  modalContent.querySelector('[data-book]').onclick=()=>openBooking(id);
  modalContent.querySelector('[data-visit]').onclick=()=>showToast('Visita solicitada! O proprietário receberia a solicitação.');
}

function openBooking(id){const k=kitnets.find(x=>x.id===id);selectedBookingId=id;$('bookingTitle').textContent=k.title;const type=currentStay==='shared'?'monthly':currentStay;$('bookingType').value=type;updateBookingPrice();detailsModal.classList.add('hidden');bookingModal.classList.remove('hidden');}
function updateBookingPrice(){const k=kitnets.find(x=>x.id===selectedBookingId);if(!k)return;const t=$('bookingType').value;const price=t==='day'?k.dayRate:t==='night'?k.nightRate:k.price;$('bookingPrice').textContent=money(price);}
function requireOwnerToPublish(){if(profile?.role==='owner'){publishModal.classList.remove('hidden');return;}showToast('Para anunciar, crie um perfil de proprietário.');accountModal.classList.remove('hidden');setRole('owner');}
function setRole(role){$('accountRole').value=role;document.querySelectorAll('.role-btn').forEach(b=>b.classList.toggle('active',b.dataset.role===role));$('universityField').style.display=role==='student'?'grid':'none';}
function updateAccountButton(){if(profile){$('accountBtn').textContent=profile.role==='owner'?`🏠 ${profile.name.split(' ')[0]}`:`🎓 ${profile.name.split(' ')[0]}`;}else $('accountBtn').textContent='Entrar / Cadastrar';}

listingGrid.addEventListener('click',e=>{const fav=e.target.closest('[data-fav]'),details=e.target.closest('[data-details]');if(fav)toggleFavorite(Number(fav.dataset.fav));if(details)openDetails(Number(details.dataset.details));});
document.querySelectorAll('.stay-tab').forEach(b=>b.onclick=()=>setStay(b.dataset.stay));document.querySelectorAll('.quick-card').forEach(b=>b.onclick=()=>setStay(b.dataset.action,true));
$('searchBtn').onclick=()=>{showingFavorites=false;render();$('kitnets').scrollIntoView({behavior:'smooth'});};
$('resetFilters').onclick=()=>{$('universityFilter').value='all';$('priceFilter').value='99999';$('distanceFilter').value='999';$('typeFilter').value='all';setStay('monthly');};
$('favoritesBtn').onclick=()=>{showingFavorites=!showingFavorites;render();$('kitnets').scrollIntoView({behavior:'smooth'});showToast(showingFavorites?'Mostrando favoritos':'Mostrando resultados');};
$('closeModal').onclick=()=>detailsModal.classList.add('hidden');detailsModal.addEventListener('click',e=>{if(e.target===detailsModal)detailsModal.classList.add('hidden')});

$('accountBtn').onclick=()=>accountModal.classList.remove('hidden');document.querySelector('[data-close-account]').onclick=()=>accountModal.classList.add('hidden');accountModal.addEventListener('click',e=>{if(e.target===accountModal)accountModal.classList.add('hidden')});document.querySelectorAll('.role-btn').forEach(b=>b.onclick=()=>setRole(b.dataset.role));
$('accountForm').addEventListener('submit',e=>{e.preventDefault();profile={name:$('accountName').value.trim(),role:$('accountRole').value,university:$('accountRole').value==='student'?$('accountUniversity').value:null};localStorage.setItem('kituni-profile',JSON.stringify(profile));updateAccountButton();accountModal.classList.add('hidden');showToast(`Perfil de ${profile.role==='owner'?'proprietário':'universitário'} criado!`);if(profile.role==='owner')setTimeout(()=>publishModal.classList.remove('hidden'),350);});

$('publishBtn').onclick=requireOwnerToPublish;$('ownerPublishBtn').onclick=requireOwnerToPublish;document.querySelector('[data-close-publish]').onclick=()=>publishModal.classList.add('hidden');publishModal.addEventListener('click',e=>{if(e.target===publishModal)publishModal.classList.add('hidden')});
$('photosInput').addEventListener('change',async e=>{uploadedImages=[];$('photoPreview').innerHTML='';for(const file of [...e.target.files].slice(0,5)){const data=await readFile(file);uploadedImages.push(data);const img=document.createElement('img');img.src=data;$('photoPreview').appendChild(img);}});
function readFile(file){return new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(file);});}
$('publishForm').addEventListener('submit',e=>{e.preventDefault();const id=Math.max(...kitnets.map(k=>k.id))+1;const uni=$('newUniversity').value,base=campusCoords[uni]||campusCoords.UFC,offset=((id%5)-2)*0.0024;const item={id,title:$('newTitle').value,university:uni,neighborhood:$('newNeighborhood').value,price:Number($('newMonthly').value),dayRate:Number($('newDay').value||0),nightRate:Number($('newNight').value||0),distance:Number($('newDistance').value),lat:base.lat+offset,lng:base.lng-offset/2,safety:8.5,type:$('newType').value,shared:$('allowShared').checked,maxPeople:$('allowShared').checked?3:1,images:uploadedImages.length?uploadedImages:['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'],features:['Anúncio recém-cadastrado','Contato pelo perfil','Fotos do proprietário'],description:$('newDescription').value||'Nova kitnet cadastrada no protótipo Kit-Uni.',owner:profile?.name||'Novo proprietário',rating:5,verified:false,day:$('allowDay').checked,night:$('allowNight').checked,monthly:$('allowMonthly').checked};kitnets.unshift(item);publishModal.classList.add('hidden');e.target.reset();uploadedImages=[];$('photoPreview').innerHTML='';setStay(item.shared?'shared':'monthly',true);showToast('Kitnet publicada no protótipo!');});

$('bookingType').addEventListener('change',updateBookingPrice);document.querySelector('[data-close-booking]').onclick=()=>bookingModal.classList.add('hidden');bookingModal.addEventListener('click',e=>{if(e.target===bookingModal)bookingModal.classList.add('hidden')});$('bookingForm').addEventListener('submit',e=>{e.preventDefault();bookingModal.classList.add('hidden');showToast('Solicitação enviada ao proprietário!');});

$('findRoommateBtn').onclick=()=>roommateModal.classList.remove('hidden');document.querySelector('[data-close-roommate]').onclick=()=>roommateModal.classList.add('hidden');roommateModal.addEventListener('click',e=>{if(e.target===roommateModal)roommateModal.classList.add('hidden')});$('roommateForm').addEventListener('submit',e=>{e.preventDefault();roommateModal.classList.add('hidden');showToast('3 matches fictícios encontrados para demonstração!');setStay('shared',true);});

function calcSplit(){const total=Number($('splitRent').value||0)+Number($('splitBills').value||0),people=Number($('splitPeople').value||1);$('splitResult').textContent=money(total/people);}
['splitRent','splitBills','splitPeople'].forEach(id=>$(id).addEventListener('input',calcSplit));

$('locationBtn').addEventListener('click',requestLocation);
$('clearLocationBtn').addEventListener('click',clearLocation);

document.addEventListener('keydown',e=>{if(e.key==='Escape'){[detailsModal,publishModal,accountModal,bookingModal,roommateModal].forEach(m=>m.classList.add('hidden'));}});
updateFavCount();updateAccountButton();calcSplit();render();
