// Converti depuis le prototype · données d'exemple
export default function CommerceScreen() {
  return (
    <>
<h1>Commerce</h1><div className="sub">Routes classées par profit / heure · prix datés · données d'exemple</div>
<div style={{display: "flex", gap: "8px", marginBottom: "16px"}}><span className="btn">Avec mon vaisseau : C2 Hercules (696 SCU)</span><span className="btn ghost">Pour cette route…</span><span className="btn ghost">Capital : 1 284 500 aUEC</span><span className="btn ghost">Éviter zones à risque ✓</span></div>
<div className="grid" style={{gridTemplateColumns: "1.4fr 1fr"}}>
<div className="card"><h3>Meilleures routes</h3><table><tbody><tr><th>#</th><th>Achat</th><th>Vente</th><th>Marchandise</th><th>Profit</th><th>/heure</th><th>Prix</th></tr>
<tr style={{background: "#123a5c"}}><td>1</td><td>Lorville</td><td>Area18</td><td>Agricium</td><td className="green">+412 000</td><td className="green"><b>+318 000</b></td><td><span className="tag t-g">2 h</span></td></tr>
<tr><td>2</td><td>ARC-L1</td><td>Orison</td><td>Laranite</td><td className="green">+356 000</td><td className="green">+274 000</td><td><span className="tag t-g">4 h</span></td></tr>
<tr><td>3</td><td>New Babbage</td><td>Lorville</td><td>Medical supplies</td><td className="green">+298 000</td><td className="green">+221 000</td><td><span className="tag t-a">19 h</span></td></tr>
<tr><td>4</td><td>Orison</td><td>CRU-L1</td><td>Processed food</td><td className="green">+143 000</td><td className="green">+168 000</td><td><span className="tag t-g">1 h</span></td></tr>
<tr><td>5</td><td>HUR-L2</td><td>Area18</td><td>Titanium</td><td className="green">+98 000</td><td className="green">+102 000</td><td><span className="tag t-r">3 j</span></td></tr></tbody></table></div>
<div style={{display: "flex", flexDirection: "column", gap: "18px"}}>
<div className="card"><h3>Route #1 · détail</h3><table><tbody>
<tr><td>Achat</td><td style={{textAlign: "right"}}>696 SCU × 2 210 = 1 538 160</td></tr><tr><td>Vente</td><td style={{textAlign: "right"}}>696 SCU × 2 802 = 1 950 190</td></tr>
<tr><td>Distance</td><td style={{textAlign: "right"}}>Hurston → MicroTech · 2 sauts</td></tr><tr><td>Risque</td><td style={{textAlign: "right"}}><span className="tag t-g">Faible</span></td></tr></tbody></table>
<div className="muted" style={{marginTop: "8px"}}>⚠ Capital insuffisant pour une soute pleine : 581 SCU max</div></div>
<div className="card"><h3>Meilleurs vaisseaux pour cette route</h3><table><tbody>
<tr><td><b>Drake Caterpillar</b></td><td>576 SCU</td><td className="green">+301 000/h</td><td><span className="tag t-g">Possédé</span></td></tr>
<tr><td><b>C2 Hercules</b></td><td>696 SCU</td><td className="green">+318 000/h</td><td><span className="tag t-g">Possédé</span></td></tr>
<tr><td><b>Hull C</b></td><td>4 608 SCU</td><td className="green">+890 000/h</td><td><span className="tag t-r">Non possédé</span></td></tr></tbody></table></div></div></div>
    </>
  );
}
