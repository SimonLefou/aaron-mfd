'use client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getShip, hardpointsOf, totalScu } from '@/lib/ships';
import { useFleet } from '@/lib/useFleet';
import { MINING_LASERS, MINING_MODULES } from '@/data/mining-gear';
import { useToast } from '@/components/Toast';

const opt = { background: '#0b1320' };

export default function ShipConfigScreen() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const { fleet, ready, update } = useFleet();
  const entry = fleet.find((e) => e.uid === id);
  const [draft, setDraft] = useState(null);
  const [tab, setTab] = useState(0);

  useEffect(() => { if (entry && !draft) setDraft(structuredClone(entry)); }, [entry, draft]);
  if (!ready) return null;
  if (!entry) return <div className="card">Vaisseau introuvable. <Link href="/flotte" className="blue">Retour à la flotte</Link></div>;
  if (!draft) return null;

  const ship = getShip(entry.shipId);
  const turrets = draft.config.turrets;
  const multi = turrets.length > 1;
  const label = (i) => (multi ? `Tourelle ${i + 1}` : 'Tête de minage');
  const components = hardpointsOf(ship).filter((h) => !['MINING_HEAD', 'MINING_MODULE'].includes(h.category));

  const setTurret = (i, patch) => {
    const t = turrets.map((x, j) => (j === i ? { ...x, ...patch } : x));
    setDraft({ ...draft, config: { ...draft.config, turrets: t } });
  };
  // Nombre de slots de modules : celui de la tête laser si connu, sinon celui du vaisseau
  const moduleSlotsFor = (t) => MINING_LASERS.find((l) => l.id === t.laserId)?.moduleSlots ?? ship.moduleSlots ?? 0;
  const copyToAll = (i) => {
    const src = turrets[i];
    setDraft({ ...draft, config: { ...draft.config, turrets: turrets.map((t) => ({ ...t, laserId: src.laserId, modules: [...src.modules] })) } });
    toast(`Configuration de la ${label(i).toLowerCase()} copiée sur toutes les tourelles`);
  };
  const save = () => { update(entry.uid, draft); toast('Configuration enregistrée'); };
  const t = turrets[tab];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link href="/flotte" className="muted" style={{ textDecoration: 'none' }}>← Ma flotte</Link>
          <h1 style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
            <input className="search" style={{ fontSize: 20, fontWeight: 600, padding: '4px 10px', minWidth: 0, width: 260, flex: 'none' }} value={draft.nickname} onChange={(e) => setDraft({ ...draft, nickname: e.target.value })} />
            {entry.active && <span className="tag t-g">ACTIF</span>}
          </h1>
          <div className="sub">{ship.name} · {ship.type_fr}</div>
        </div>
        <div style={{ display: 'flex', gap: 22, textAlign: 'right' }}>
          <div><div className="muted">Capacité</div><div className="big" style={{ fontSize: 20 }}>{totalScu(ship)} SCU</div></div>
          {ship.basePower ? <div><div className="muted">Puissance de base</div><div className="big" style={{ fontSize: 20 }}>{ship.basePower.toLocaleString('fr-FR')}</div></div> : null}
          <div><div className="muted">Équipage</div><div className="big" style={{ fontSize: 20 }}>{turrets.filter((x) => x.operator).length}/{Math.max(1, turrets.length)}</div></div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: turrets.length ? '1.5fr 1fr' : '1fr' }}>
        {turrets.length > 0 && (
          <div className="card">
            <h3>{multi ? `Tourelles de minage (${turrets.length})` : 'Tête de minage'}</h3>
            {multi && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {turrets.map((x, i) => (
                  <span key={i} className={`btn${tab === i ? '' : ' ghost'}`} onClick={() => setTab(i)}>
                    {label(i)} {x.laserId ? '●' : '○'}
                  </span>
                ))}
              </div>
            )}
            <table><tbody>
              <tr>
                <td style={{ width: 170 }}>Tête laser (S{ship.laserSize})</td>
                <td>
                  <select className="btn ghost" style={{ padding: '7px 12px', minWidth: 220 }} value={t.laserId ?? ''} onChange={(e) => {
                    const laserId = e.target.value || null;
                    const n = MINING_LASERS.find((l) => l.id === laserId)?.moduleSlots ?? ship.moduleSlots ?? 0;
                    setTurret(tab, { laserId, modules: t.modules.slice(0, n) });
                  }}>
                    <option value="" style={opt}>— Aucune —</option>
                    {MINING_LASERS.filter((l) => l.size === ship.laserSize).map((l) => <option key={l.id} value={l.id} style={opt}>{l.name}</option>)}
                  </select>
                  {ship.laserSize === 0 && <span className="muted"> · laser intégré au véhicule</span>}
                </td>
              </tr>
              {Array.from({ length: moduleSlotsFor(t) }, (_, k) => (
                <tr key={k}>
                  <td>Module {k + 1}</td>
                  <td>
                    <select className="btn ghost" style={{ padding: '7px 12px', minWidth: 220 }} value={t.modules[k] ?? ''} onChange={(e) => {
                      const m = [...t.modules]; m[k] = e.target.value || null; setTurret(tab, { modules: m });
                    }}>
                      <option value="" style={opt}>— Vide —</option>
                      {MINING_MODULES.map((m) => <option key={m.id} value={m.id} style={opt}>{m.name} ({m.type})</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {multi && (
                <tr>
                  <td>Opérateur</td>
                  <td><input className="search" style={{ minWidth: 0, width: 220, flex: 'none' }} placeholder="Pseudo du joueur" value={t.operator} onChange={(e) => setTurret(tab, { operator: e.target.value })} /></td>
                </tr>
              )}
            </tbody></table>
            {multi && <span className="btn ghost" style={{ marginTop: 12 }} onClick={() => copyToAll(tab)}>Copier sur toutes les tourelles</span>}
            <div className="muted" style={{ marginTop: 12 }}>
              Les stats des têtes et modules ne sont pas encore renseignées (fichier mining-gear.js à compléter).
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {multi && (
            <div className="card">
              <h3>Vue d&apos;ensemble des tourelles</h3>
              <table><tbody>
                <tr><th>Tourelle</th><th>Tête</th><th>Modules</th><th>Opérateur</th></tr>
                {turrets.map((x, i) => (
                  <tr key={i} className="row" onClick={() => setTab(i)}>
                    <td>T{i + 1}</td>
                    <td>{MINING_LASERS.find((l) => l.id === x.laserId)?.name ?? <span className="red">—</span>}</td>
                    <td className="muted">{x.modules.filter(Boolean).map((m) => MINING_MODULES.find((z) => z.id === m)?.name).join(', ') || '—'}</td>
                    <td>{x.operator || <span className="muted">libre</span>}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
          )}
          <div className="card">
            <h3>Composants</h3>
            <table><tbody>
              {components.map((h) => (
                <tr key={h.name}>
                  <td>{h.name}</td>
                  <td className="muted">S{h.size}</td>
                  <td>
                    <input className="search" style={{ minWidth: 0, width: 170, flex: 'none', padding: '5px 8px' }} placeholder="d'origine"
                      value={draft.config.components[h.name] ?? ''} onChange={(e) => setDraft({ ...draft, config: { ...draft.config, components: { ...draft.config.components, [h.name]: e.target.value } } })} />
                  </td>
                </tr>
              ))}
              {components.length === 0 && <tr><td className="muted">Aucun composant configurable.</td></tr>}
            </tbody></table>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="muted">Assurance</div>
            <input className="search" style={{ minWidth: 0 }} placeholder="LTI, 10 ans…" value={draft.insurance ?? ''} onChange={(e) => setDraft({ ...draft, insurance: e.target.value })} />
            <span className="btn" onClick={save}>Enregistrer</span>
            <span className="btn ghost" onClick={() => { save(); router.push('/flotte'); }}>Enregistrer et revenir à la flotte</span>
          </div>
        </div>
      </div>
    </>
  );
}
