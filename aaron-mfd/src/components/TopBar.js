import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

// Données d'exemple : à remplacer par l'utilisateur connecté (session + base)
const session = {
  ship: 'MISC Prospector « Rockhound »',
  location: 'Stanton · ARC-L1',
  balance: 1284500,
  fleet: 'Opération Quanta',
  gameVersion: '4.x',
};

export default function TopBar() {
  return (
    <header className="top">
      <Link href="/" className="logo" style={{ textDecoration: 'none' }}>AARON MFD</Link>
      <div className="chip">Vaisseau actif <b>{session.ship}</b></div>
      <div className="chip">Position <b>{session.location}</b></div>
      <div className="chip">Solde <b className="blue">{session.balance.toLocaleString('fr-FR')} aUEC</b></div>
      <div className="chip"><span className="dot" />Fleet <b>{session.fleet}</b></div>
      <div style={{ marginLeft: 'auto' }} />
      <ThemeToggle />
      <div className="chip">Version <b>{session.gameVersion}</b></div>
    </header>
  );
}
