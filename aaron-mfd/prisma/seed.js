// Remplit la base avec quelques données d'exemple : node prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const V = '4.x';

async function main() {
  const shubin = await prisma.manufacturer.upsert({ where: { code: 'SHIN' }, update: {}, create: { code: 'SHIN', name: 'Shubin Interstellar' } });
  const misc = await prisma.manufacturer.upsert({ where: { code: 'MISC' }, update: {}, create: { code: 'MISC', name: 'MISC' } });

  const stanton = await prisma.location.create({ data: { name: 'Stanton', type: 'SYSTEM' } });
  const arcL1 = await prisma.location.create({ data: { name: 'ARC-L1', type: 'LAGRANGE', parentId: stanton.id, hasRefinery: true } });

  const item = (name, category, extra = {}) => prisma.item.create({ data: { name, category, gameVersion: V, ...extra } });
  const laranite = await item('Laranite (raffinée)', 'REFINED', { unit: 'scu' });
  const alloy = await item('Alliage composite', 'MATERIAL');
  const circuit = await item('Circuit focalisant', 'COMPONENT');
  const hofstede = await item('Hofstede S1', 'MINING_HEAD', { size: 1, manufacturerId: shubin.id });

  const prospector = await prisma.shipModel.create({
    data: { name: 'Prospector', manufacturerId: misc.id, role: 'mining', cargoScu: 32, gameVersion: V,
      hardpoints: { create: [{ name: 'Tête de minage', category: 'MINING_HEAD', size: 1 }] } },
  });

  const bp = await prisma.blueprint.create({
    data: {
      name: 'Hofstede S1', outputItemId: hofstede.id, craftMinutes: 25, gameVersion: V,
      ingredients: { create: [{ itemId: laranite.id, quantity: 4 }, { itemId: alloy.id, quantity: 6 }, { itemId: circuit.id, quantity: 1 }] },
      acquisitions: { create: [
        { type: 'MISSION', title: 'Shubin Interstellar · rang 3', faction: 'Shubin', requiredRank: 'Contractor', gameVersion: V },
        { type: 'VENDOR', title: 'Shubin · ARC-L1', locationId: arcL1.id, price: 42000, gameVersion: V },
        { type: 'LOOT', title: 'Caisses minières', dropRatePct: 4, gameVersion: V },
      ] },
    },
  });

  const user = await prisma.user.create({ data: { discordId: 'exemple-0001', handle: 'Commandant', balanceAuec: 1284500 } });
  await prisma.userShip.create({ data: { userId: user.id, shipModelId: prospector.id, nickname: 'Rockhound', isActive: true } });
  await prisma.userBlueprint.create({ data: { userId: user.id, blueprintId: bp.id } });
  await prisma.inventoryItem.createMany({ data: [
    { userId: user.id, itemId: laranite.id, quantity: 38, locationId: arcL1.id },
    { userId: user.id, itemId: alloy.id, quantity: 14, locationId: arcL1.id },
    { userId: user.id, itemId: circuit.id, quantity: 3, locationId: arcL1.id },
  ] });

  const guild = await prisma.guild.create({ data: { name: 'Nova Mining Co.', tag: 'NOVA', treasury: 18600000 } });
  await prisma.guildMember.create({ data: { guildId: guild.id, userId: user.id, role: 'OWNER', status: 'ACTIVE' } });
  console.log('Base remplie avec les données d\'exemple.');
}

main().finally(() => prisma.$disconnect());
