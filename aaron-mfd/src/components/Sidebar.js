'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  ['◈', 'Tableau de bord', '/'],
  ['✈', 'Flotte', '/flotte'],
  ['▤', 'Inventaire', '/inventaire'],
  ['⛏', 'Minage', '/minage'],
  ['⚒', 'Craft', '/craft'],
  ['⇄', 'Commerce', '/commerce'],
  ['⬡', 'Fleets', '/fleets'],
  ['♜', 'Guilde', '/guilde'],
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <nav className="side">
      {NAV.map(([icon, label, href]) => {
        const on = href === '/' ? path === '/' : path.startsWith(href);
        return (
          <Link key={href} href={href} className={`nav${on ? ' on' : ''}`}>
            <span className="ic">{icon}</span>{label}
          </Link>
        );
      })}
    </nav>
  );
}
