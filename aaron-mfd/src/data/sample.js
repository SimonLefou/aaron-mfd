// Données d'exemple pour le prototype. À remplacer par la base (Prisma) et les API communautaires.
export const items = [
  { id: 1, name: 'Laranite (raffinée)', unit: 'scu' },
  { id: 2, name: 'Alliage composite' },
  { id: 3, name: 'Circuit focalisant' },
  { id: 4, name: 'Quantanium (raffiné)', unit: 'scu' },
  { id: 5, name: 'Alliage' },
  { id: 6, name: 'Circuit' },
];

export const myStock = [
  { itemId: 1, quantity: 38 }, { itemId: 2, quantity: 14 }, { itemId: 3, quantity: 3 },
  { itemId: 4, quantity: 0 }, { itemId: 5, quantity: 1 }, { itemId: 6, quantity: 0 },
];

const acq = (type, title, extra = {}) => ({ type, title, ...extra });

export const blueprints = [
  { id: 1, name: 'Hofstede S1', category: 'Tête minage', size: 'S1', craftMinutes: 25, owned: true,
    ingredients: [{ itemId: 1, quantity: 4 }, { itemId: 2, quantity: 6 }, { itemId: 3, quantity: 1 }],
    acquisitions: [acq('Mission', 'Shubin Interstellar · rang 3 « Contractor »'), acq('Vendeur', 'Shubin · ARC-L1', { price: 42000 }), acq('Loot', 'Caisses minières', { dropRatePct: 4 })],
    status: 'Vérifié en 4.x · 3 confirmations', guild: { owners: 5, crafters: ['Vex', 'RockHound'] } },
  { id: 2, name: 'Attrition-3', category: 'Arme vaisseau', size: 'S3', craftMinutes: 40, owned: true,
    ingredients: [{ itemId: 2, quantity: 4 }], acquisitions: [acq('Loot', 'Épaves Pyro')], guild: { owners: 3, crafters: ['Vex'] } },
  { id: 3, name: 'FR-66', category: 'Bouclier', size: 'S2', craftMinutes: 30, owned: true,
    ingredients: [{ itemId: 5, quantity: 3 }, { itemId: 2, quantity: 2 }], acquisitions: [acq('Vendeur', 'Lorville')], guild: { owners: 2, crafters: [] } },
  { id: 4, name: 'Ballista Ammo', category: 'Munitions', size: '—', craftMinutes: 5, owned: true,
    ingredients: [{ itemId: 4, quantity: 1 }], acquisitions: [acq('Mission', 'Hurston Security')], guild: { owners: 8, crafters: ['HaulerJoe'] } },
  { id: 5, name: 'Surge', category: 'Module minage', size: '—', craftMinutes: 10, owned: true,
    ingredients: [{ itemId: 1, quantity: 2 }], acquisitions: [acq('Vendeur', 'Shubin Interstellar')], guild: { owners: 6, crafters: ['RockHound'] } },
  { id: 6, name: 'Helix II', category: 'Tête minage', size: 'S2', craftMinutes: 45, owned: false,
    ingredients: [{ itemId: 1, quantity: 8 }], acquisitions: [acq('Événement', 'Invasion XenoThreat')], guild: { owners: 1, crafters: [] } },
  { id: 7, name: 'Omnisky IX', category: 'Arme vaisseau', size: 'S3', craftMinutes: 40, owned: false,
    ingredients: [{ itemId: 2, quantity: 5 }], acquisitions: [acq('Loot', 'Bunkers niveau 3')], guild: { owners: 0, crafters: [] } },
  { id: 8, name: 'Bulwark', category: 'Bouclier', size: 'S1', craftMinutes: 20, owned: false,
    ingredients: [{ itemId: 5, quantity: 2 }], acquisitions: [acq('Mission', 'Crusader rang 2')], guild: { owners: 4, crafters: [] } },
  { id: 9, name: 'Lancet MH2', category: 'Tête minage', size: 'S2', craftMinutes: 35, owned: true,
    ingredients: [{ itemId: 1, quantity: 50 }, { itemId: 6, quantity: 2 }], acquisitions: [acq('Vendeur', 'New Babbage')], guild: { owners: 2, crafters: [] } },
  { id: 10, name: 'CF-337 Panther', category: 'Arme vaisseau', size: 'S3', craftMinutes: 40, owned: false,
    ingredients: [{ itemId: 2, quantity: 6 }], acquisitions: [acq('Loot', 'Contrats de prime')], guild: { owners: 1, crafters: [] } },
];
