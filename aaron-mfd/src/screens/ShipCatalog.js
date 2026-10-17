'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ALL_SHIPS, totalScu } from '@/lib/ships';

const fmt = (v) => (v === null || v === undefined ? '—' : typeof v === 'number' ? v.toLocaleString('fr-FR') : v);

export default function ShipCatalog() {
  const [role, setRole] = useState('tous');
  const [q, setQ] = useState('');
  const list = ALL_SHIPS.filter((s) => (role === 'tous' || s.role === role) && `${s.name} ${s.manufacturer}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="card" style={{ marginTop: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 10 }}>
        <h3 style={{ margin: 0 }}>Catalogue des vaisseaux · ships.js ({ALL_SHIPS.length})</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="search" style={{ minWidth: 220 }} placeholder="🔍 Nom, constructeur…" value={q} onChange={(e) => setQ(e.target.value)} />
          {['tous', 'mining', 'cargo'].map((r) => (
            <span key={r} className={`btn${role === r ? '' : ' ghost'}`} onClick={() => setRole(r)}>
              {r === 'tous' ? 'Tous' : r === 'mining' ? 'Minage' : 'Support'}
            </span>
          ))}
        </div>
      </div>
      <table>
        <tbody>
          <tr><th>Vaisseau</th><th>Type</th><th>SCU</th><th>SCU + sacoches</th><th>Lasers</th><th>Modules</th><th>Puissance</th><th>Boucliers</th><th>QT</th><th>Réservoir QF</th><th /></tr>
          {list.map((s) => (
            <tr key={s.id} className="row">
              <td><b>{s.name}</b><br /><span className="muted">{s.manufacturer}</span></td>
              <td className="muted">{s.type_fr}</td>
              <td>{fmt(s.scu)}</td>
              <td>{fmt(totalScu(s))}</td>
              <td>{s.laserSlots ? (s.laserSize ? `${s.laserSlots} × S${s.laserSize}` : `${s.laserSlots} · intégré`) : "—"}</td>
              <td>{fmt(s.moduleSlots)}</td>
              <td>{fmt(s.basePower)}</td>
              <td>{s.shieldCount ? `${s.shieldCount} × S${s.shieldSize}` : '—'}</td>
              <td>{s.qdSize ? `S${s.qdSize}` : '—'}</td>
              <td>{fmt(s.qfTank)}</td>
              <td>
                {s.incomplete
                  ? <span className="tag t-a" title={s.incomplete}>Incomplet</span>
                  : <Link href={`/vaisseaux/${s.id}`} className="btn ghost" style={{ padding: '5px 10px', textDecoration: 'none' }}>Emplacements →</Link>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
