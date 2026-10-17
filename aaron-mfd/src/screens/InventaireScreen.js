// Converti depuis le prototype · données d'exemple
export default function InventaireScreen() {
  return (
    <>
<div style={{display: "flex", justifyContent: "space-between"}}><div><h1>Inventaire</h1><div className="sub">186 SCU · valeur estimée 2,41 M aUEC · données d'exemple</div></div><div style={{display: "flex", gap: "10px"}}><div className="btn ghost">Lieu : tous ▾</div><div className="btn ghost">Catégorie : toutes ▾</div><div className="btn">📷 Import OCR</div></div></div>
<div className="grid" style={{gridTemplateColumns: "1.25fr 1fr"}}>
<div className="card"><h3>Stock</h3><table><tbody><tr><th>Objet</th><th>Catégorie</th><th>Qté</th><th>Qualité</th><th>Lieu</th><th>Valeur</th></tr>
<tr><td>Quantanium (raffiné)</td><td><span className="tag t-b">Minerai</span></td><td>24 SCU</td><td>—</td><td>CRU-L1</td><td className="green">912 000</td></tr>
<tr><td>Laranite (raffinée)</td><td><span className="tag t-b">Minerai</span></td><td>38 SCU</td><td>—</td><td>ARC-L1</td><td className="green">418 000</td></tr>
<tr><td>Agricium</td><td><span className="tag t-b">Minerai</span></td><td>21 SCU</td><td>—</td><td>HUR-L2</td><td className="green">232 000</td></tr>
<tr><td>Titanium</td><td><span className="tag t-b">Minerai</span></td><td>60 SCU</td><td>—</td><td>Area18</td><td className="green">48 000</td></tr>
<tr><td>Hofstede S1</td><td><span className="tag t-a">Tête minage</span></td><td>1</td><td>A</td><td>Rockhound</td><td className="green">—</td></tr>
<tr><td>Attrition-3</td><td><span className="tag t-r">Arme S3</span></td><td>2</td><td>B</td><td>Orison</td><td className="green">—</td></tr>
<tr><td>Alliage composite</td><td><span className="tag t-g">Matériau</span></td><td>14</td><td>B</td><td>Orison</td><td className="green">—</td></tr></tbody></table></div>
<div className="card"><h3>Import OCR · vérification</h3>
<div style={{height: "170px", border: "1px dashed #2a5a8a", borderRadius: "8px", background: "repeating-linear-gradient(0deg,#0c1828,#0c1828 22px,#0e1d30 22px,#0e1d30 44px)", position: "relative", marginBottom: "14px"}}>
<div style={{position: "absolute", left: "14px", top: "12px", fontSize: "11px", color: "#6f88a3"}}>capture_terminal_ARC-L1.png</div>
<div style={{position: "absolute", left: "30px", top: "40px", width: "300px", height: "22px", border: "2px solid #3ddc97"}}></div><div style={{position: "absolute", left: "30px", top: "84px", width: "300px", height: "22px", border: "2px solid #3ddc97"}}></div><div style={{position: "absolute", left: "30px", top: "128px", width: "300px", height: "22px", border: "2px solid #ffb547"}}></div></div>
<table><tbody><tr><th>Détecté</th><th>Quantité</th><th>Confiance</th></tr>
<tr><td>Laranite</td><td>12,4 SCU</td><td className="green">98 %</td></tr>
<tr><td>Copper</td><td>8,0 SCU</td><td className="green">96 %</td></tr>
<tr style={{background: "#2a200b"}}><td>Bexalite ?</td><td><b className="amber">3,? SCU</b></td><td className="amber">61 % · à vérifier</td></tr></tbody></table>
<div style={{marginTop: "14px", display: "flex", gap: "10px"}}><div className="btn">Valider et ajouter</div><div className="btn ghost">Corriger</div></div></div></div>
    </>
  );
}
