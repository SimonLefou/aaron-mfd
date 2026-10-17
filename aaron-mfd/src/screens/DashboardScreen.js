import Link from 'next/link';
// Converti depuis le prototype · données d'exemple
export default function DashboardScreen() {
  return (
    <>
<h1>Bonsoir, Commandant</h1><div className="sub">Résumé de ton activité · données d'exemple</div>
<div className="grid" style={{gridTemplateColumns: "repeat(4,1fr)"}}>
<div className="card"><h3>Gains 7 jours</h3><div className="big green">+842 300</div><div className="muted">aUEC · +18 % vs semaine passée</div></div>
<div className="card"><h3>Raffinage en cours</h3><div className="big">3</div><div className="muted">prochain terminé dans 1 h 12</div></div>
<div className="card"><h3>Valeur inventaire</h3><div className="big">2,41 M</div><div className="muted">aUEC · 186 SCU stockés</div></div>
<div className="card"><h3>Guilde</h3><div className="big blue">Nova Mining Co.</div><div className="muted">24 membres · 7 en ligne</div></div>
</div>
<div className="grid" style={{gridTemplateColumns: "1.4fr 1fr", marginTop: "18px"}}>
<div className="card"><h3>Raffineries</h3><table><tbody><tr><th>Station</th><th>Minerai</th><th>Méthode</th><th>Progression</th><th>Gain net</th></tr>
<tr><td>CRU-L1</td><td>Quantanium</td><td>Dinyx Solventation</td><td><div className="bar"><i style={{width: "82%"}}></i></div></td><td className="green">+214 000</td></tr>
<tr><td>ARC-L1</td><td>Laranite</td><td>Ferron Exchange</td><td><div className="bar"><i style={{width: "46%"}}></i></div></td><td className="green">+96 400</td></tr>
<tr><td>HUR-L2</td><td>Agricium</td><td>Cormack</td><td><div className="bar"><i style={{width: "15%"}}></i></div></td><td className="green">+58 900</td></tr></tbody></table></div>
<div className="card"><h3>Prochaines opérations</h3><table><tbody>
<tr><td><b>Sam. 21:00</b><br /><span className="muted">Minage Aaron Halo</span></td><td><span className="tag t-b">Minage</span></td><td>6/8</td></tr>
<tr><td><b>Dim. 15:00</b><br /><span className="muted">Escorte convoi Hercules</span></td><td><span className="tag t-a">Escorte</span></td><td>4/6</td></tr>
<tr><td><b>Mar. 20:30</b><br /><span className="muted">Transfert matériaux → Orison</span></td><td><span className="tag t-g">Logistique</span></td><td>2/3</td></tr></tbody></table></div>
</div>
<div className="grid" style={{gridTemplateColumns: "1fr 1fr 1fr", marginTop: "18px"}}>
<div className="card"><h3>Alertes prix</h3><div style={{fontSize: "14px", lineHeight: "2"}}>▲ <b>Laranite</b> <span className="green">+9 %</span> à Area18<br />▼ <b>Titanium</b> <span className="red">−6 %</span> à Lorville<br />▲ <b>Quantanium</b> <span className="green">+4 %</span> à Orison</div></div>
<div className="card"><h3>Meilleure route (Prospector)</h3><div style={{fontSize: "15px", marginBottom: "6px"}}><b>ARC-L1 → Area18</b></div><div className="muted">Minerai raffiné · 32 SCU</div><div className="big green" style={{fontSize: "24px", marginTop: "8px"}}>+61 200 /h</div></div>
<div className="card" style={{display: "flex", flexDirection: "column", gap: "12px", justifyContent: "center"}}><div className="btn"><Link href="/minage" style={{color: "inherit", textDecoration: "none"}}>⛏ Scanner un rocher</Link></div><div className="btn ghost"><Link href="/commerce" style={{color: "inherit", textDecoration: "none"}}>⇄ Trouver une route</Link></div><div className="btn ghost">▤ Importer inventaire (OCR)</div></div>
</div>
    </>
  );
}
