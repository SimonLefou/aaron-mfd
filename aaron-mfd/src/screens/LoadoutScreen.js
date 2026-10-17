// Converti depuis le prototype · données d'exemple
export default function LoadoutScreen() {
  return (
    <>
<h1>Éditeur de loadout · Rockhound <span className="muted" style={{fontSize: "14px"}}>MISC Prospector</span></h1><div className="sub">Clique sur un emplacement pour voir les objets compatibles · données d'exemple</div>
<div className="grid" style={{gridTemplateColumns: "1.1fr 1fr 0.8fr"}}>
<div className="card" style={{position: "relative", height: "640px"}}><h3>Schéma</h3>
<svg viewbox="0 0 400 520" style={{width: "100%", height: "560px"}}><path d="M200 30 L250 140 L330 200 L320 380 L250 460 L150 460 L80 380 L70 200 L150 140 Z" fill="#0e2338" stroke="#2a6aa0" strokeWidth="2" /><path d="M200 60 L230 150 L170 150 Z" fill="#14324f" />
<g fontSize="12" fill="#d6e2f0"><circle cx="200" cy="70" r="16" fill="#1679d4" stroke="#4fd1ff" strokeWidth="3" /><text x="222" y="62">Tête de minage S1</text>
<circle cx="110" cy="250" r="12" fill="#13314d" stroke="#4fd1ff" /><text x="20" y="232">Bouclier S1</text>
<circle cx="290" cy="250" r="12" fill="#13314d" stroke="#4fd1ff" /><text x="300" y="232">Centrale S1</text>
<circle cx="140" cy="380" r="12" fill="#13314d" stroke="#4fd1ff" /><text x="30" y="410">Refroid. S1 ×2</text>
<circle cx="260" cy="380" r="12" fill="#13314d" stroke="#4fd1ff" /><text x="270" y="410">Quantum S1</text>
<circle cx="200" cy="300" r="12" fill="#3d2c0c" stroke="#ffb547" /><text x="160" y="330">Modules ×2</text></g></svg></div>
<div className="card"><h3>Tête de minage S1 · compatibles</h3><table><tbody><tr><th>Objet</th><th>Puissance</th><th>Instab.</th><th>Statut</th></tr>
<tr style={{background: "#0f2a1f"}}><td><b>Helix II</b> <span className="muted">(équipé)</span></td><td>3 150</td><td className="green">−35 %</td><td><span className="tag t-g">Équipé</span></td></tr>
<tr><td>Lancet MH1</td><td>2 520</td><td className="green">−10 %</td><td><span className="tag t-b">En inventaire</span></td></tr>
<tr><td>Hofstede S1 <span className="tag t-a">Crafté</span></td><td>2 880</td><td className="green">−20 %</td><td><span className="tag t-b">En inventaire</span></td></tr>
<tr><td>Klein-S1</td><td>2 220</td><td className="red">+20 %</td><td><span className="tag t-r">Non possédé</span></td></tr>
<tr><td>Arbor MH1</td><td>1 890</td><td>0 %</td><td><span className="tag t-r">Non possédé</span></td></tr></tbody></table>
<h3 style={{marginTop: "20px"}}>Modules actifs</h3><table><tbody><tr><td>Surge</td><td className="muted">+ puissance, − fenêtre optimale</td></tr><tr><td><i className="muted">vide</i></td><td><span className="btn ghost" style={{padding: "5px 10px"}}>+ Ajouter</span></td></tr></tbody></table></div>
<div className="card"><h3>Comparaison</h3><table><tbody>
<tr><th></th><th>Actuel</th><th>Hofstede</th></tr>
<tr><td>Puissance</td><td>3 150</td><td className="red">2 880</td></tr>
<tr><td>Instabilité</td><td>−35 %</td><td className="red">−20 %</td></tr>
<tr><td>Résistance</td><td>−30 %</td><td className="green">−35 %</td></tr>
<tr><td>Fenêtre</td><td>+40 %</td><td className="green">+60 %</td></tr></tbody></table>
<div style={{marginTop: "22px", display: "flex", flexDirection: "column", gap: "10px"}}><div className="btn">Enregistrer le loadout</div><div className="btn ghost">Dupliquer comme « Quanta »</div><div className="btn ghost">Partager avec la guilde</div></div></div></div>
    </>
  );
}
