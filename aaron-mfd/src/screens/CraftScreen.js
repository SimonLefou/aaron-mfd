'use client';
import { useMemo, useState } from 'react';
import { blueprints, items, myStock } from '@/data/sample';
import { craftability, craftStatus, closeness } from '@/lib/craftability';
import { useToast } from '@/components/Toast';

const ACQ_TAG = { Mission: 't-b', Vendeur: 't-a', Loot: 't-r', Événement: 't-g' };
const itemName = (id) => items.find((i) => i.id === id)?.name ?? `#${id}`;
const uniq = (arr) => ['toutes', ...new Set(arr)];

export default function CraftScreen() {
  const toast = useToast();
  const stock = useMemo(() => new Map(myStock.map((s) => [s.itemId, s.quantity])), []);
  const rows = useMemo(
    () => blueprints
      .map((bp) => {
        const c = craftability(bp, stock);
        return { ...bp, ...c, status: craftStatus({ owned: bp.owned, ...c }) };
      })
      .sort((a, b) => closeness(a) - closeness(b)),
    [stock],
  );

  const [q, setQ] = useState('');
  const [flt, setFlt] = useState(null); // g | a | b | r
  const [cat, setCat] = useState('toutes');
  const [size, setSize] = useState('toutes');
  const [acqType, setAcqType] = useState('toutes');
  const [view, setView] = useState('moi');
  const [selId, setSelId] = useState(rows[0].id);
  const [qty, setQty] = useState(1);

  const counts = {
    g: rows.filter((r) => r.status.key === 'g').length,
    a: rows.filter((r) => r.status.key === 'a').length,
    b: rows.filter((r) => r.owned).length,
    r: rows.filter((r) => !r.owned).length,
  };

  const visible = rows.filter((r) => {
    const text = `${r.name} ${r.category} ${r.acquisitions.map((a) => a.title).join(' ')} ${r.ingredients.map((i) => itemName(i.itemId)).join(' ')}`.toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (cat !== 'toutes' && r.category !== cat) return false;
    if (size !== 'toutes' && r.size !== size) return false;
    if (acqType !== 'toutes' && !r.acquisitions.some((a) => a.type === acqType)) return false;
    if (flt === 'g' || flt === 'a') return r.status.key === flt;
    if (flt === 'b') return r.owned;
    if (flt === 'r') return !r.owned;
    return true;
  });

  const sel = rows.find((r) => r.id === selId) ?? rows[0];
  const Chip = ({ k, cls, label }) => (
    <span className={`tag ${cls} chipf${flt === k ? ' sel' : ''}`} onClick={() => setFlt(flt === k ? null : k)}>{label} {counts[k]}</span>
  );
  const Select = ({ label, value, onChange, options }) => (
    <select className="btn ghost" style={{ padding: '7px 12px' }} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o} value={o} style={{ background: '#0b1320' }}>{label} : {o}</option>)}
    </select>
  );

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Craft &amp; blueprints</h1>
          <div className="sub">Catalogue : {rows.length} blueprints · possédés {counts.b} · craftables maintenant {counts.g} · données d&apos;exemple</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['moi', 'guilde'].map((v) => (
            <span key={v} className={`btn${view === v ? '' : ' ghost'}`} onClick={() => setView(v)}>Vue : {v}</span>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input className="search" placeholder="🔍 Rechercher un blueprint, un ingrédient, un lieu…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select label="Catégorie" value={cat} onChange={setCat} options={uniq(rows.map((r) => r.category))} />
        <Select label="Taille" value={size} onChange={setSize} options={uniq(rows.map((r) => r.size).filter((s) => s !== '—'))} />
        <Select label="Acquisition" value={acqType} onChange={setAcqType} options={uniq(rows.flatMap((r) => r.acquisitions.map((a) => a.type)))} />
        <Chip k="g" cls="t-g" label="Craftable" />
        <Chip k="a" cls="t-a" label="Il manque" />
        <Chip k="b" cls="t-b" label="Possédé" />
        <Chip k="r" cls="t-r" label="Non possédé" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.55fr 1fr' }}>
        <div className="card">
          <h3>Résultats · triés par « proche du craft »</h3>
          <table>
            <tbody>
              <tr><th>Blueprint</th><th>Catégorie</th><th>Taille</th><th>Comment l&apos;obtenir</th><th>Possession</th><th>Craft</th><th>Manquant</th></tr>
              {visible.map((r) => (
                <tr key={r.id} className={`row${r.id === sel.id ? ' sel' : ''}`} onClick={() => { setSelId(r.id); setQty(1); }}>
                  <td><b>{r.name}</b></td>
                  <td>{r.category}</td>
                  <td>{r.size}</td>
                  <td>{r.acquisitions[0].type} · {r.acquisitions[0].title}{r.acquisitions.length > 1 ? ` (+${r.acquisitions.length - 1})` : ''}</td>
                  <td><span className={`tag ${r.owned ? 't-b' : 't-r'}`}>{r.owned ? 'Possédé' : 'Non possédé'}</span></td>
                  <td><span className={`tag t-${r.status.key}`}>{r.status.label}</span></td>
                  <td className="muted">{r.owned ? r.missing.map((m) => itemName(m.itemId)).join(', ') : ''}</td>
                </tr>
              ))}
              {visible.length === 0 && <tr><td colSpan={7} className="muted">Aucun blueprint ne correspond aux filtres.</td></tr>}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{sel.name}</div>
                <div className="muted">{sel.category} {sel.size !== '—' ? sel.size : ''} · {sel.craftMinutes} min</div>
              </div>
              <span className={`tag t-${sel.status.key}`}>{sel.owned ? (sel.maxQty > 0 ? `Craftable ×${sel.maxQty}` : sel.status.label) : 'Non possédé'}</span>
            </div>

            <h3 style={{ marginTop: 14 }}>Comment l&apos;acquérir · {sel.acquisitions.length} méthode{sel.acquisitions.length > 1 ? 's' : ''}</h3>
            <table><tbody>
              {sel.acquisitions.map((a, i) => (
                <tr key={i}>
                  <td><span className={`tag ${ACQ_TAG[a.type] ?? 't-b'}`}>{a.type}</span></td>
                  <td>{a.title}{a.price ? ` · ${a.price.toLocaleString('fr-FR')} aUEC` : ''}{a.dropRatePct ? ` · drop ~${a.dropRatePct} %` : ''}</td>
                </tr>
              ))}
            </tbody></table>
            {sel.status && typeof sel.status === 'object' && blueprints.find((b) => b.id === sel.id).status && (
              <div className="muted" style={{ marginTop: 6 }}>{blueprints.find((b) => b.id === sel.id).status}</div>
            )}

            <h3 style={{ marginTop: 14 }}>Ingrédients</h3>
            <table><tbody>
              <tr><th>Matériau</th><th>Requis</th><th>En stock</th><th /></tr>
              {sel.ingredients.map((ing) => {
                const have = stock.get(ing.itemId) ?? 0;
                return (
                  <tr key={ing.itemId}>
                    <td>{itemName(ing.itemId)}</td><td>{ing.quantity}</td><td>{have}</td>
                    <td className={have >= ing.quantity ? 'green' : 'red'}>●</td>
                  </tr>
                );
              })}
            </tbody></table>

            <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              {sel.owned && sel.maxQty > 0 ? (
                <>
                  <span className="btn" onClick={() => toast(`Craft lancé : ${qty} × ${sel.name} · prêt dans ${sel.craftMinutes * qty} min`)}>⚒ Crafter ×{qty}</span>
                  <span className="btn ghost" style={{ padding: '6px 10px' }} onClick={() => setQty(Math.max(1, qty - 1))}>−</span>
                  <span className="btn ghost" style={{ padding: '6px 10px' }} onClick={() => setQty(Math.min(sel.maxQty, qty + 1))}>+</span>
                  <span className="muted">max {sel.maxQty}</span>
                </>
              ) : sel.owned ? (
                <span className="btn ghost" onClick={() => toast('Liste de courses créée pour les ingrédients manquants')}>🛒 Où trouver ce qui manque</span>
              ) : (
                <span className="btn ghost" onClick={() => toast(`${sel.name} ajouté à ta liste de recherche`)}>★ Je le cherche</span>
              )}
            </div>
          </div>

          <div className="card">
            <h3>Dans la guilde</h3>
            <div style={{ fontSize: 13, lineHeight: 1.9 }}>
              Possédé par <b>{sel.guild.owners} membre{sel.guild.owners > 1 ? 's' : ''}</b> · craftable par <b>{sel.guild.crafters.length}</b>
              {sel.guild.crafters.length > 0 && ` (${sel.guild.crafters.join(', ')})`}
              <br />
              {sel.guild.crafters.length > 0 && (
                <span className="btn ghost" style={{ padding: '6px 10px', marginTop: 6 }} onClick={() => toast(`Demande de craft envoyée à ${sel.guild.crafters[0]}`)}>Demander un craft</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
