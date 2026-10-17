// Converti depuis le prototype · données d'exemple
export default function MinageScreen() {
  return (
    <>
<h1>Calculateur de rocher</h1><div className="sub">Saisie rapide ou import OCR du scanner · données d'exemple</div>
<div className="grid" style={{gridTemplateColumns: "380px 1fr"}}>
<div className="card"><h3>Scan</h3>
<table><tbody><tr><td>Masse</td><td style={{textAlign: "right"}}><b>18 420 kg</b></td></tr><tr><td>Instabilité</td><td style={{textAlign: "right"}}><b className="amber">42,6</b></td></tr><tr><td>Résistance</td><td style={{textAlign: "right"}}><b>31 %</b></td></tr></tbody></table>
<h3 style={{marginTop: "18px"}}>Composition</h3>
<table><tbody><tr><td>Quantanium</td><td style={{width: "120px"}}><div className="bar"><i style={{width: "24%", background: "#c86bff"}}></i></div></td><td style={{textAlign: "right"}}>24 %</td></tr>
<tr><td>Laranite</td><td><div className="bar"><i style={{width: "18%", background: "#4fd1ff"}}></i></div></td><td style={{textAlign: "right"}}>18 %</td></tr>
<tr><td>Copper</td><td><div className="bar"><i style={{width: "11%", background: "#ffb547"}}></i></div></td><td style={{textAlign: "right"}}>11 %</td></tr>
<tr><td>Inerte</td><td><div className="bar"><i style={{width: "47%", background: "#3a4c63"}}></i></div></td><td style={{textAlign: "right"}}>47 %</td></tr></tbody></table>
<div style={{marginTop: "18px", display: "flex", gap: "10px"}}><div className="btn ghost">📷 OCR scanner</div><div className="btn">Calculer</div></div></div>
<div style={{display: "flex", flexDirection: "column", gap: "18px"}}>
<div className="grid" style={{gridTemplateColumns: "repeat(3,1fr)"}}>
<div className="card"><h3>Faisabilité</h3><div className="big amber" style={{fontSize: "22px"}}>Fleet conseillée</div><div className="muted">Prospector seul : 61 % de chance · avec 1 MOLE : 97 %</div></div>
<div className="card"><h3>Valeur brute</h3><div className="big">187 600</div><div className="muted">aUEC · 9,8 SCU de minerai utile</div></div>
<div className="card"><h3>Risque Quantanium</h3><div className="big red" style={{fontSize: "22px"}}>Instable</div><div className="muted">à vendre ou raffiner sous ~15 min</div></div></div>
<div className="card"><h3>Vendre ou raffiner ?</h3><table><tbody><tr><th>Option</th><th>Lieu</th><th>Rendement</th><th>Durée</th><th>Coût</th><th>Gain net</th><th></th></tr>
<tr style={{background: "#0f2a1f"}}><td><b>Raffiner · Dinyx Solventation</b></td><td>CRU-L1</td><td>92 %</td><td>5 h 40</td><td>−12 400</td><td className="green"><b>+301 800</b></td><td><span className="tag t-g">Meilleur</span></td></tr>
<tr><td>Raffiner · Ferron Exchange</td><td>ARC-L1</td><td>85 %</td><td>2 h 10</td><td>−8 900</td><td className="green">+271 300</td><td><span className="tag t-b">Rapide</span></td></tr>
<tr><td>Raffiner · Cormack</td><td>HUR-L2</td><td>78 %</td><td>1 h 05</td><td>−6 100</td><td className="green">+243 500</td><td></td></tr>
<tr><td>Vendre brut</td><td>ARC-L1</td><td>—</td><td>immédiat</td><td>0</td><td>+187 600</td><td></td></tr></tbody></table>
<div style={{marginTop: "14px", display: "flex", gap: "10px"}}><div className="btn">Lancer le raffinage à CRU-L1</div><div className="btn ghost">Ajouter à la session de fleet</div></div></div>
</div></div>
    </>
  );
}
