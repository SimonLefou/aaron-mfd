// Converti depuis le prototype · données d'exemple
export default function GuildeScreen() {
  return (
    <>
<div style={{display: "flex", justifyContent: "space-between"}}><div><h1>Nova Mining Co. <span className="tag t-b" style={{verticalAlign: "middle"}}>Tu es Propriétaire</span></h1><div className="sub">24 membres · 7 en ligne · données d'exemple</div></div><div style={{display: "flex", gap: "8px"}}><span className="btn">Vue d'ensemble</span><span className="btn ghost">Membres</span><span className="btn ghost">Opérations</span><span className="btn ghost">Logistique</span></div></div>
<div className="grid" style={{gridTemplateColumns: "repeat(4,1fr)"}}>
<div className="card"><h3>Trésorerie</h3><div className="big green">18,6 M</div><div className="muted">aUEC · +2,1 M cette semaine</div></div>
<div className="card"><h3>Ressources</h3><div className="big">1 240 SCU</div><div className="muted">valeur ~14,2 M aUEC</div></div>
<div className="card"><h3>Blueprints cumulés</h3><div className="big blue">63</div><div className="muted">dont 9 uniques à un seul membre</div></div>
<div className="card"><h3>Candidatures</h3><div className="big amber">3</div><div className="muted">en attente de validation</div></div></div>
<div className="grid" style={{gridTemplateColumns: "1fr 1fr 1.1fr", marginTop: "18px"}}>
<div className="card"><h3>Candidatures</h3><table><tbody>
<tr><td><b>StarDust_42</b><br /><span className="muted">Mineur · MOLE, Prospector</span></td><td><span className="btn" style={{padding: "5px 10px"}}>✓</span> <span className="btn ghost" style={{padding: "5px 10px"}}>✕</span></td></tr>
<tr><td><b>Kestrel</b><br /><span className="muted">Escorte · Hornet F7C</span></td><td><span className="btn" style={{padding: "5px 10px"}}>✓</span> <span className="btn ghost" style={{padding: "5px 10px"}}>✕</span></td></tr>
<tr><td><b>HaulerJoe</b><br /><span className="muted">Transport · C2</span></td><td><span className="btn" style={{padding: "5px 10px"}}>✓</span> <span className="btn ghost" style={{padding: "5px 10px"}}>✕</span></td></tr></tbody></table></div>
<div className="card"><h3>Ressources par lieu</h3><table><tbody>
<tr><td>Orison</td><td><div className="bar" style={{width: "110px"}}><i style={{width: "80%"}}></i></div></td><td>520 SCU</td></tr>
<tr><td>CRU-L1</td><td><div className="bar" style={{width: "110px"}}><i style={{width: "45%"}}></i></div></td><td>290 SCU</td></tr>
<tr><td>ARC-L1</td><td><div className="bar" style={{width: "110px"}}><i style={{width: "35%"}}></i></div></td><td>230 SCU</td></tr>
<tr><td>Lorville</td><td><div className="bar" style={{width: "110px"}}><i style={{width: "25%"}}></i></div></td><td>200 SCU</td></tr></tbody></table>
<div className="btn ghost" style={{marginTop: "14px"}}>+ Créer une opération</div></div>
<div className="card"><h3>Logistique · ordres de transfert</h3>
<div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", fontSize: "12px"}}>
<div><div className="muted" style={{marginBottom: "6px"}}>À FAIRE</div><div className="card" style={{padding: "10px"}}>120 SCU Laranite<br /><span className="muted">ARC-L1 → Orison</span></div><div className="card" style={{padding: "10px", marginTop: "8px"}}>40 Alliages<br /><span className="muted">Lorville → CRU-L1</span></div></div>
<div><div className="muted" style={{marginBottom: "6px"}}>EN COURS</div><div className="card" style={{padding: "10px", borderColor: "#ffb547"}}>200 SCU Titanium<br /><span className="muted">→ Area18 · HaulerJoe</span></div></div>
<div><div className="muted" style={{marginBottom: "6px"}}>LIVRÉ</div><div className="card" style={{padding: "10px", borderColor: "#3ddc97"}}>96 SCU Quanta<br /><span className="muted">→ CRU-L1 · CargoKing</span></div></div></div></div></div>
    </>
  );
}
