'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ALL_SHIPS, getShip, totalScu } from '@/lib/ships';
import { useFleet } from '@/lib/useFleet';
import { MINING_LASERS } from '@/data/mining-gear';
import { useToast } from '@/components/Toast';

const ROLE = { mining: ['Minage', 't-a', '#ffb547'], cargo: ['Support', 't-b', '#4fd1ff'] };
const laserName = (id) => MINING_LASERS.find((l) => l.id === id)?.name;

function configState(entry, ship) {
  const t = entry.config.turrets;
  if (!t.length) return { label: 'Rien à configurer', cls: 't-b' };
  const set = t.filter((x) => x.laserId).length;
  return set === t.length ? { label: 'Configuré', cls: 't-g' } : { label: `${set}/${t.length} ${t.length > 1 ? 'tourelles' : 'tête'}`, cls: 't-a' };
}

export default function FleetScreen() {
  const { fleet, ready, add, remove, setActive, duplicate } = useFleet();
  const toast = useToast();
  const [role, setRole] = useState('tous');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  useEffect(() => { if (location.search.includes('composer')) setOpen(true); }, []);

  const totalCargo = fleet.reduce((s, e) => s + totalScu(getShip(e.shipId)), 0);
  const turrets = fleet.reduce((s, e) => s + e.config.turrets.length, 0);
  const crewNeeded = fleet.reduce((s, e) => s + Math.max(1, e.config.turrets.length), 0);
  const catalog = ALL_SHIPS.filter((s) => (role === 'tous' || s.role === role) && `${s.name} ${s.manufacturer}`.toLowerCase().includes(q.toLowerCase()));

  if (!ready) return null;
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Ma flotte</h1>
          <div className="sub">{fleet.length} vaisseaux · {totalCargo.toLocaleString('fr-FR')} SCU au total · {turrets} têtes/tourelles de minage · {crewNeeded} postes à pourvoir</div>
        </div>
        <span className="btn" onClick={() => setOpen(!open)}>{open ? '✕ Fermer le catalogue' : '+ Composer ma flotte'}</span>
      </div>

      {open && (
        <div className="card" style={{ marginBottom: 18, borderColor: '#4fd1ff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 10 }}>
            <h3 style={{ margin: 0 }}>Ajouter des vaisseaux · catalogue ships.js</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="search" style={{ minWidth: 220 }} placeholder="🔍 Nom, constructeur…" value={q} onChange={(e) => setQ(e.target.value)} />
              {['tous', 'mining', 'cargo'].map((r) => (
                <span key={r} className={`btn${role === r ? '' : ' ghost'}`} onClick={() => setRole(r)}>{r === 'tous' ? 'Tous' : ROLE[r][0]}</span>
              ))}
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {catalog.map((s) => {
              const owned = fleet.filter((e) => e.shipId === s.id).length;
              return (
                <div key={s.id} className="card" style={{ padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <b>{s.name}</b>
                    {owned > 0 && <span className="tag t-g">×{owned}</span>}
                  </div>
                  <div className="muted" style={{ margin: '3px 0 8px' }}>{s.type_fr}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span className={`tag ${ROLE[s.role]?.[1] ?? 't-b'}`}>{ROLE[s.role]?.[0] ?? s.role}</span>
                    <span className="tag t-b">{s.scu} SCU</span>
                    {s.laserSlots > 1 && <span className="tag t-a">{s.laserSlots} tourelles</span>}
                  </div>
                  {s.incomplete
                    ? <span className="tag t-r" title={s.incomplete}>Données incomplètes</span>
                    : <span className="btn ghost" style={{ padding: '6px 12px' }} onClick={() => { add(s.id); toast(`${s.name} ajouté à ta flotte`); }}>+ Ajouter</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {fleet.map((e) => {
          const s = getShip(e.shipId);
          const [rl, rc, color] = ROLE[s.role] ?? ['?', 't-b', '#4fd1ff'];
          const st = configState(e, s);
          return (
            <div key={e.uid} className="card" style={e.active ? { borderColor: '#4fd1ff', boxShadow: '0 0 0 1px #4fd1ff inset' } : {}}>
              <div style={{ height: 80, borderRadius: 8, background: `radial-gradient(circle at 60% 40%,${color}33,#0a1220 70%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color, marginBottom: 10 }}>✈</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b style={{ fontSize: 15 }}>{e.nickname}</b>
                {e.active ? <span className="tag t-g">ACTIF</span> : <span className="tag t-b chipf" onClick={() => { setActive(e.uid); toast(`${e.nickname} est ton vaisseau actif`); }}>Rendre actif</span>}
              </div>
              <div className="muted" style={{ margin: '3px 0 8px' }}>{s.name}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                <span className={`tag ${rc}`}>{rl}</span>
                <span className="tag t-b">{totalScu(s)} SCU</span>
                <span className={`tag ${st.cls}`}>{st.label}</span>
              </div>
              {e.config.turrets.length > 0 && (
                <div className="muted" style={{ marginBottom: 10, lineHeight: 1.6 }}>
                  {e.config.turrets.map((t, i) => (
                    <div key={i}>{e.config.turrets.length > 1 ? `T${i + 1}` : 'Tête'} : <span style={{ color: '#d6e2f0' }}>{laserName(t.laserId) ?? '—'}</span>{t.operator ? ` · ${t.operator}` : ''}</div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 6 }}>
                <Link href={`/flotte/${e.uid}`} className="btn" style={{ padding: '6px 12px', textDecoration: 'none' }}>Configurer</Link>
                <span className="btn ghost" style={{ padding: '6px 10px' }} title="Dupliquer" onClick={() => duplicate(e.uid)}>Dupliquer</span>
                <span className="btn ghost" style={{ padding: '6px 10px' }} title="Retirer" onClick={() => { if (confirm(`Retirer ${e.nickname} de ta flotte ?`)) remove(e.uid); }}>🗑</span>
              </div>
            </div>
          );
        })}
        {fleet.length === 0 && <div className="card muted">Ta flotte est vide. Clique sur « Composer ma flotte ».</div>}
      </div>
    </>
  );
}
