import { notFound } from 'next/navigation';
import ShipSlots from '@/screens/ShipSlots';
import { ALL_SHIPS, getShip } from '@/lib/ships';

// Fiche technique d'un modèle du catalogue (ships.js)
export function generateStaticParams() {
  return ALL_SHIPS.map((s) => ({ id: s.id }));
}

export default function Page({ params }) {
  const ship = getShip(params.id);
  if (!ship) notFound();
  return <ShipSlots ship={ship} />;
}
