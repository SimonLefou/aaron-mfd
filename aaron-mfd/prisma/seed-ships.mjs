// Importe ships.js dans la base : node prisma/seed-ships.mjs
// Crée les constructeurs, les modèles de vaisseaux et leurs emplacements (Hardpoint).
import { PrismaClient } from '@prisma/client';
import { SHIPS, SUPPORT_SHIPS } from '../src/data/ships.js';

const prisma = new PrismaClient();
const GAME_VERSION = process.env.GAME_VERSION ?? '4.x';

function hardpoints(s) {
  const hp = [];
  const add = (count, category, label, size) => {
    for (let i = 1; i <= (count ?? 0); i++) hp.push({ category, name: count > 1 ? `${label} ${i}` : label, size: size ?? 0, turretIndex: category === 'MINING_HEAD' ? i : null });
  };
  add(s.laserSlots, 'MINING_HEAD', s.laserSlots > 1 ? 'Tourelle' : 'Tête de minage', s.laserSize);
  // les modules ne sont pas des emplacements du vaisseau : ils dépendent de la tête laser (LoadoutSlot.parentId)
  add(s.shieldCount, 'SHIELD', 'Bouclier', s.shieldSize);
  add(s.powerSize ? 1 : 0, 'POWER_PLANT', 'Centrale', s.powerSize);
  add(s.coolerCount, 'COOLER', 'Refroidisseur', s.coolerSize);
  add(s.qdSize ? 1 : 0, 'QUANTUM_DRIVE', 'Moteur quantique', s.qdSize);
  return hp;
}

const code = (name) => name.replace(/[^A-Za-z]/g, '').slice(0, 6).toUpperCase();

for (const s of [...SHIPS, ...SUPPORT_SHIPS]) {
  if (s._incomplete) { console.warn(`Ignoré (incomplet) : ${s.name}`); continue; }
  const man = await prisma.manufacturer.upsert({
    where: { code: code(s.manufacturer) }, update: {}, create: { code: code(s.manufacturer), name: s.manufacturer },
  });
  const data = {
    manufacturerId: man.id, slug: s.id, role: s.role, cargoScu: Math.round(s.scu), gameVersion: GAME_VERSION,
    specs: s, // toutes les stats d'origine (sacoches, tracteur, QF…) gardées telles quelles
  };
  const ship = await prisma.shipModel.upsert({
    where: { name_gameVersion: { name: s.name, gameVersion: GAME_VERSION } },
    update: data, create: { name: s.name, ...data },
  });
  await prisma.hardpoint.deleteMany({ where: { shipModelId: ship.id, slots: { none: {} } } });
  await prisma.hardpoint.createMany({ data: hardpoints(s).map((h) => ({ ...h, shipModelId: ship.id })) });
  console.log(`✓ ${s.name}`);
}
await prisma.$disconnect();
