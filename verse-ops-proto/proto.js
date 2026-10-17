(function(){
const css=document.createElement('style');css.textContent=`
.btn,.tag,.nav,tr{transition:.15s}.btn{cursor:pointer;user-select:none}.btn:hover{filter:brightness(1.25)}
table tr:not(:first-child):hover{background:#0f2a44;cursor:pointer}
#toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(30px);background:#0d2a40;border:1px solid #4fd1ff;color:#e6f3ff;padding:10px 18px;border-radius:10px;font-size:14px;opacity:0;pointer-events:none;transition:.25s;z-index:99}
#toast.on{opacity:1;transform:translateX(-50%)}
.modal-bg{position:fixed;inset:0;background:#000a;display:flex;align-items:center;justify-content:center;z-index:98}
.modal{background:#0b1320;border:1px solid #2a5a8a;border-radius:14px;padding:22px 26px;min-width:420px;max-width:560px;color:#e6f3ff}
.modal h2{margin:0 0 10px;font-size:18px}.modal .row{display:flex;gap:10px;justify-content:flex-end;margin-top:18px}
input.proto{width:100%;background:transparent;border:none;outline:none;color:#e6f3ff;font-size:13px}
.chipf{cursor:pointer}.chipf.sel{outline:2px solid #4fd1ff}`;document.head.appendChild(css);
const T=document.getElementById('toast');let tt;
window.toast=m=>{T.textContent=m;T.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>T.classList.remove('on'),2200)};
window.modal=(title,html,ok,cb)=>{const b=document.createElement('div');b.className='modal-bg';
b.innerHTML=`<div class="modal"><h2>${title}</h2><div>${html}</div><div class="row"><span class="btn ghost" data-x>Annuler</span><span class="btn" data-ok>${ok||'OK'}</span></div></div>`;
document.body.appendChild(b);b.onclick=e=>{if(e.target===b||e.target.dataset.x!==undefined)b.remove();if(e.target.dataset.ok!==undefined){b.remove();cb&&cb()}}};
const page=location.pathname.split('/').pop();
const go={'Scanner un rocher':'minage.html','Trouver une route':'commerce.html','Ajouter à la session de fleet':'session-live.html','OCR scanner':'inventaire.html','+ Créer une opération':'session-live.html'};
document.querySelectorAll('.btn').forEach(b=>{
 const t=b.textContent.replace(/^[^\wÀ-ÿ+]+/,'').trim();
 b.addEventListener('click',e=>{e.stopPropagation();
  for(const k in go) if(t.startsWith(k.replace(/^[^\wÀ-ÿ+]+/,''))){location.href=go[k];return}
  if(b.textContent.trim()==='✓'){const r=b.closest('tr');toast('Membre accepté : '+r.querySelector('b').textContent);r.style.opacity=0;setTimeout(()=>r.remove(),200);return}
  if(b.textContent.trim()==='✕'){const r=b.closest('tr');toast('Candidature refusée');r.style.opacity=0;setTimeout(()=>r.remove(),200);return}
  if(t.startsWith('Crafter')){modal('Confirmer le craft',`<p class="muted">Les ingrédients seront retirés de l'inventaire et l'objet crafté y sera ajouté.</p><p>Quantité : <b id="q">1</b> <span class="btn ghost" style="padding:3px 9px" onclick="q.textContent=Math.min(3,+q.textContent+1)">+</span> <span class="btn ghost" style="padding:3px 9px" onclick="q.textContent=Math.max(1,+q.textContent-1)">−</span></p>`,'Lancer le craft',()=>toast('Craft lancé · prêt dans 25 min'));return}
  if(t.startsWith('Clôturer')){modal('Clôturer la session','<p>Répartir les gains selon les parts définies et générer les paiements ?</p>','Clôturer & payer',()=>toast('Session clôturée · paiements générés'));return}
  if(t.startsWith('Vue')){b.parentElement.querySelectorAll('.btn').forEach(x=>x.classList.add('ghost'));b.classList.remove('ghost');toast(t);return}
  toast(t+' ✓');
 });
});
// flotte: lignes -> loadout
if(page==='flotte.html')document.querySelectorAll('table tr:not(:first-child)').forEach(r=>r.onclick=()=>location.href='loadout.html');
if(page==='dashboard.html')document.querySelectorAll('.card').forEach(c=>{const h=c.querySelector('h3');if(!h)return;const m=h.textContent.toLowerCase();
 const d=m.includes('minage')?'minage.html':m.includes('flotte')||m.includes('vaisseau')?'flotte.html':m.includes('inventaire')?'inventaire.html':m.includes('guilde')?'guilde.html':m.includes('fleet')?'session-live.html':m.includes('route')||m.includes('commerce')?'commerce.html':null;
 if(d){c.style.cursor='pointer';c.onclick=()=>location.href=d}});
// craft: recherche + filtres + détail
if(page==='craft.html'){
 const box=[...document.querySelectorAll('div')].find(d=>d.textContent.trim().startsWith('🔍')&&d.children.length===0);
 const rows=[...document.querySelectorAll('table')][0].querySelectorAll('tr:not(:first-child)');
 let f=null,q='';
 const apply=()=>rows.forEach(r=>{const tx=r.textContent.toLowerCase();let ok=!q||tx.includes(q);
  if(f==='g')ok=ok&&tx.includes('craftable');if(f==='a')ok=ok&&tx.includes('manque');if(f==='b')ok=ok&&tx.includes('possédé')&&!tx.includes('non possédé');if(f==='r')ok=ok&&tx.includes('non possédé');
  r.style.display=ok?'':'none'});
 if(box){box.innerHTML='🔍 <input class="proto" placeholder="Rechercher un blueprint, un ingrédient…" style="width:85%">';box.querySelector('input').oninput=e=>{q=e.target.value.toLowerCase();apply()}}
 document.querySelectorAll('.card .tag').forEach(t=>{if(!/\d/.test(t.textContent)||t.closest('table')||!box||!t.closest('.card').contains(box))return;t.classList.add('chipf');
  const k=['t-g','t-a','t-b','t-r'].find(c=>t.classList.contains(c)).slice(2);
  t.onclick=()=>{f=f===k?null:k;document.querySelectorAll('.chipf').forEach(x=>x.classList.remove('sel'));if(f)t.classList.add('sel');apply()}});
 const title=[...document.querySelectorAll('div')].find(d=>d.textContent.trim()==='Hofstede S1'&&d.children.length===0);
 rows.forEach(r=>r.onclick=()=>{rows.forEach(x=>x.style.background='');r.style.background='#123a5c';
  const c=r.querySelectorAll('td');if(title){title.textContent=c[0].textContent;title.nextElementSibling.textContent=c[1].textContent+(c[2].textContent!=='—'?' '+c[2].textContent:'')}
  const badge=title&&title.parentElement.nextElementSibling;if(badge){badge.textContent=c[5].textContent==='—'?'Non possédé':c[5].textContent;badge.className='tag '+c[5].querySelector('.tag').className.split(' ')[1]}
  toast('Fiche : '+c[0].textContent+' · '+c[3].textContent)});
 document.querySelectorAll('.btn.ghost').forEach(b=>{if(b.textContent.includes('Taille')||b.textContent.includes('Catégorie')||b.textContent.includes('Acquisition')||b.textContent.includes('Lieu')){
  const opts={Catégorie:['toutes','Tête minage','Arme vaisseau','Bouclier','Munitions','Module minage'],Taille:['toutes','S1','S2','S3'],Acquisition:['toutes','Mission','Vendeur','Loot','Événement']}[b.textContent.split(/[ :▾]/)[0]];
  if(!opts)return;let i=0;const base=b.textContent.split(/[:▾]/)[0].trim();
  b.onclick=e=>{e.stopPropagation();i=(i+1)%opts.length;b.textContent=base+' : '+opts[i]+' ▾';const v=opts[i].toLowerCase();
   rows.forEach(r=>{r.style.display=(v==='toutes'||r.textContent.toLowerCase().includes(v.toLowerCase()))?'':'none'})}}});
}
// inventaire OCR
if(page==='inventaire.html'){document.querySelectorAll('.btn').forEach(b=>{if(b.textContent.includes('Valider'))b.onclick=e=>{e.stopPropagation();toast('Lignes OCR ajoutées à l\'inventaire')}})}
})();
