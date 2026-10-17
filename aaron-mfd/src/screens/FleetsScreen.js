// Converti depuis le prototype · données d'exemple
export default function FleetsScreen() {
  return (
    <>
<h1>Opération Quanta · Session live <span className="tag t-g" style={{verticalAlign: "middle"}}>EN COURS 01:47:12</span></h1><div className="sub">Fleet de minage · Nova Mining Co. · Aaron Halo · données d'exemple</div>
<div className="grid" style={{gridTemplateColumns: "1fr 1fr 1fr 1fr"}}>
<div className="card"><h3>Rochers cassés</h3><div className="big">14</div><div className="muted">sur 17 scannés</div></div>
<div className="card"><h3>Minerai total</h3><div className="big">142 SCU</div><div className="muted">soute fleet 68 % pleine</div></div>
<div className="card"><h3>Valeur estimée</h3><div className="big green">2,18 M</div><div className="muted">aUEC après raffinage</div></div>
<div className="card"><h3>Escorte</h3><div className="big blue" style={{fontSize: "22px"}}>2 chasseurs</div><div className="muted">aucun contact hostile</div></div></div>
<div className="grid" style={{gridTemplateColumns: "1.25fr 1fr", marginTop: "18px"}}>
<div className="card"><h3>Membres & répartition</h3><table><tbody><tr><th>Joueur</th><th>Vaisseau</th><th>Rôle</th><th>Part</th><th>Gain prévu</th></tr>
<tr><td><span className="dot" style={{display: "inline-block"}}></span> Nico_Claey</td><td>MOLE</td><td><span className="tag t-b">Foreuse</span></td><td>25 %</td><td className="green">545 000</td></tr>
<tr><td><span className="dot" style={{display: "inline-block"}}></span> RockHound</td><td>Prospector</td><td><span className="tag t-b">Foreuse</span></td><td>20 %</td><td className="green">436 000</td></tr>
<tr><td><span className="dot" style={{display: "inline-block"}}></span> Vex</td><td>Prospector</td><td><span className="tag t-b">Foreuse</span></td><td>20 %</td><td className="green">436 000</td></tr>
<tr><td><span className="dot" style={{display: "inline-block"}}></span> CargoKing</td><td>C2 Hercules</td><td><span className="tag t-g">Transport</span></td><td>15 %</td><td className="green">327 000</td></tr>
<tr><td><span className="dot" style={{display: "inline-block"}}></span> Talon</td><td>Gladius</td><td><span className="tag t-a">Escorte</span></td><td>10 %</td><td className="green">218 000</td></tr>
<tr><td><span className="dot" style={{display: "inline-block", background: "#ffb547", boxShadow: "0 0 8px #ffb547"}}></span> Mirage</td><td>Arrow</td><td><span className="tag t-a">Escorte</span></td><td>10 %</td><td className="green">218 000</td></tr></tbody></table></div>
<div className="card"><h3>Journal de session</h3><div style={{fontSize: "13px", lineHeight: "2.1"}}>
<span className="muted">01:44</span> Vex a cassé un rocher · <b>Laranite 31 %</b><br />
<span className="muted">01:38</span> CargoKing : transfert 32 SCU → Hercules<br />
<span className="muted">01:31</span> Nico_Claey a scanné · <b className="amber">Quantanium 28 %</b><br />
<span className="muted">01:22</span> Raffinage lancé à CRU-L1 · 48 SCU<br />
<span className="muted">01:15</span> Talon : zone sécurisée<br />
<span className="muted">01:02</span> RockHound a cassé un rocher · <b>Agricium 19 %</b></div>
<div style={{marginTop: "14px", display: "flex", gap: "10px"}}><div className="btn">+ Scanner</div><div className="btn ghost">Clôturer & payer</div></div></div>
</div>
    </>
  );
}
