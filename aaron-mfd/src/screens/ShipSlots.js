import Link from 'next/link';
import { hardpointsOf, totalScu } from '@/lib/ships';

const LABEL = { MINING_HEAD: 't-a', MINING_MODULE: 't-a', SHIELD: 't-b', POWER_PLANT: 't-g', COOLER: 't-b', QUANTUM_DRIVE: 't-g' };

export default function ShipSlots({ ship }) {
  const hp = hardpointsOf(ship);
  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link href="/flotte" className="muted" style={{ textDecoration: "none" }}>← Flotte</Link>
          <h1 style={{ marginTop: 6 }}>{ship.name}</h1>
          <div className="sub" style={{ marginBottom: 0 }}>{ship.manufacturer} · {ship.type_fr}</div>
        </div>
        <div style={{ display: 'flex', gap: 24, textAlign: 'right' }}>
          <div><div className="muted">Soute</div><div className="big" style={{ fontSize: 22 }}>{ship.scu} SCU</div></div>
          {ship.saddlebags ? <div><div className="muted">Avec sacoches</div><div className="big" style={{ fontSize: 22 }}>{totalScu(ship)} SCU</div></div> : null}
          {ship.basePower ? <div><div className="muted">Puissance laser</div><div className="big" style={{ fontSize: 22 }}>{ship.basePower.toLocaleString('fr-FR')}</div></div> : null}
          {ship.qfTank ? <div><div className="muted">Réservoir QF</div><div className="big" style={{ fontSize: 22 }}>{ship.qfTank.toLocaleString('fr-FR')}</div></div> : null}
        </div>
      </div>
      <h3 style={{ marginTop: 16 }}>Emplacements ({hp.length})</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {hp.map((h) => (
          <span key={h.name} className={`tag ${LABEL[h.category] ?? 't-b'}`} style={{ fontSize: 12, padding: '6px 12px' }}>
            {h.name}{h.size ? ` · S${h.size}` : ''}
          </span>
        ))}
        {hp.length === 0 && <span className="muted">Aucun emplacement configurable.</span>}
      </div>
      {ship.tractorBeam?.hasTractor && <div className="muted" style={{ marginTop: 10 }}>Rayon tracteur : {ship.tractorBeam.size} · {ship.tractorBeam.power}</div>}
    </div>
  );
}
