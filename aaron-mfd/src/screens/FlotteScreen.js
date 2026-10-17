import Link from 'next/link';
// Converti depuis le prototype · données d'exemple
export default function FlotteScreen() {
  return (
    <>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}><div><h1>Ma flotte</h1><div className="sub">8 vaisseaux · 3 loadouts personnalisés · données d'exemple</div></div><div style={{display: "flex", gap: "10px"}}><div className="btn ghost">Filtrer : tous les rôles ▾</div><div className="btn">+ Ajouter un vaisseau</div></div></div>
<div className="grid" style={{gridTemplateColumns: "repeat(4,1fr)"}}><div className="card" style={{borderColor: "#4fd1ff", boxShadow: "0 0 0 1px #4fd1ff inset"}}>
<div style={{height: "110px", borderRadius: "8px", background: "radial-gradient(circle at 60% 40%,#ffb54733,#0a1220 70%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px", color: "#ffb547", marginBottom: "12px"}}>✈</div>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}><b style={{fontSize: "15px"}}>Rockhound</b><span className="tag t-g">ACTIF</span></div>
<div className="muted" style={{margin: "4px 0 10px"}}>MISC Prospector</div>
<div style={{display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px"}}><span className="tag t-b">Minage</span><span className="tag t-a">32 SCU</span></div>
<Link href="/flotte/prospector" className="btn ghost" style={{padding: "5px 10px", marginBottom: "8px", display: "inline-block", textDecoration: "none"}}>Configurer le loadout →</Link><div className="muted">Loadout : <span style={{color: "#d6e2f0"}}>Helix II + Surge</span></div></div><div className="card" style={{}}>
<div style={{height: "110px", borderRadius: "8px", background: "radial-gradient(circle at 60% 40%,#ffb54733,#0a1220 70%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px", color: "#ffb547", marginBottom: "12px"}}>✈</div>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}><b style={{fontSize: "15px"}}>Big Mole</b></div>
<div className="muted" style={{margin: "4px 0 10px"}}>Argo MOLE</div>
<div style={{display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px"}}><span className="tag t-b">Minage</span><span className="tag t-a">96 SCU</span></div>
<Link href="/flotte/prospector" className="btn ghost" style={{padding: "5px 10px", marginBottom: "8px", display: "inline-block", textDecoration: "none"}}>Configurer le loadout →</Link><div className="muted">Loadout : <span style={{color: "#d6e2f0"}}>Lancet MH2 ×3</span></div></div><div className="card" style={{}}>
<div style={{height: "110px", borderRadius: "8px", background: "radial-gradient(circle at 60% 40%,#3ddc9733,#0a1220 70%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px", color: "#3ddc97", marginBottom: "12px"}}>✈</div>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}><b style={{fontSize: "15px"}}>Mule</b></div>
<div className="muted" style={{margin: "4px 0 10px"}}>Crusader C2 Hercules</div>
<div style={{display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px"}}><span className="tag t-b">Transport</span><span className="tag t-a">696 SCU</span></div>
<Link href="/flotte/prospector" className="btn ghost" style={{padding: "5px 10px", marginBottom: "8px", display: "inline-block", textDecoration: "none"}}>Configurer le loadout →</Link><div className="muted">Loadout : <span style={{color: "#d6e2f0"}}>Standard</span></div></div><div className="card" style={{}}>
<div style={{height: "110px", borderRadius: "8px", background: "radial-gradient(circle at 60% 40%,#3ddc9733,#0a1220 70%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px", color: "#3ddc97", marginBottom: "12px"}}>✈</div>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}><b style={{fontSize: "15px"}}>Chenille</b></div>
<div className="muted" style={{margin: "4px 0 10px"}}>Drake Caterpillar</div>
<div style={{display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px"}}><span className="tag t-b">Transport</span><span className="tag t-a">576 SCU</span></div>
<Link href="/flotte/prospector" className="btn ghost" style={{padding: "5px 10px", marginBottom: "8px", display: "inline-block", textDecoration: "none"}}>Configurer le loadout →</Link><div className="muted">Loadout : <span style={{color: "#d6e2f0"}}>Standard</span></div></div><div className="card" style={{}}>
<div style={{height: "110px", borderRadius: "8px", background: "radial-gradient(circle at 60% 40%,#ff5d6c33,#0a1220 70%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px", color: "#ff5d6c", marginBottom: "12px"}}>✈</div>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}><b style={{fontSize: "15px"}}>Talon</b></div>
<div className="muted" style={{margin: "4px 0 10px"}}>Aegis Gladius</div>
<div style={{display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px"}}><span className="tag t-b">Chasseur</span><span className="tag t-a">0 SCU</span></div>
<Link href="/flotte/prospector" className="btn ghost" style={{padding: "5px 10px", marginBottom: "8px", display: "inline-block", textDecoration: "none"}}>Configurer le loadout →</Link><div className="muted">Loadout : <span style={{color: "#d6e2f0"}}>Attrition-3 ×3</span></div></div><div className="card" style={{}}>
<div style={{height: "110px", borderRadius: "8px", background: "radial-gradient(circle at 60% 40%,#ff5d6c33,#0a1220 70%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px", color: "#ff5d6c", marginBottom: "12px"}}>✈</div>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}><b style={{fontSize: "15px"}}>Coyote</b></div>
<div className="muted" style={{margin: "4px 0 10px"}}>Anvil Arrow</div>
<div style={{display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px"}}><span className="tag t-b">Chasseur</span><span className="tag t-a">0 SCU</span></div>
<Link href="/flotte/prospector" className="btn ghost" style={{padding: "5px 10px", marginBottom: "8px", display: "inline-block", textDecoration: "none"}}>Configurer le loadout →</Link><div className="muted">Loadout : <span style={{color: "#d6e2f0"}}>Standard</span></div></div><div className="card" style={{}}>
<div style={{height: "110px", borderRadius: "8px", background: "radial-gradient(circle at 60% 40%,#c86bff33,#0a1220 70%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px", color: "#c86bff", marginBottom: "12px"}}>✈</div>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}><b style={{fontSize: "15px"}}>Navette</b></div>
<div className="muted" style={{margin: "4px 0 10px"}}>Origin 315p</div>
<div style={{display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px"}}><span className="tag t-b">Exploration</span><span className="tag t-a">12 SCU</span></div>
<Link href="/flotte/prospector" className="btn ghost" style={{padding: "5px 10px", marginBottom: "8px", display: "inline-block", textDecoration: "none"}}>Configurer le loadout →</Link><div className="muted">Loadout : <span style={{color: "#d6e2f0"}}>Standard</span></div></div><div className="card" style={{}}>
<div style={{height: "110px", borderRadius: "8px", background: "radial-gradient(circle at 60% 40%,#ffb54733,#0a1220 70%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px", color: "#ffb547", marginBottom: "12px"}}>✈</div>
<div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}><b style={{fontSize: "15px"}}>Prospect 2</b></div>
<div className="muted" style={{margin: "4px 0 10px"}}>MISC Prospector</div>
<div style={{display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px"}}><span className="tag t-b">Minage</span><span className="tag t-a">32 SCU</span></div>
<Link href="/flotte/prospector" className="btn ghost" style={{padding: "5px 10px", marginBottom: "8px", display: "inline-block", textDecoration: "none"}}>Configurer le loadout →</Link><div className="muted">Loadout : <span style={{color: "#d6e2f0"}}>Standard</span></div></div></div>
    </>
  );
}
