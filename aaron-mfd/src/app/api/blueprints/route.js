import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { craftability, craftStatus, closeness } from '@/lib/craftability';

export const dynamic = 'force-dynamic';

// GET /api/blueprints?userId=1&q=hofstede&category=MINING_HEAD&acquisition=VENDOR
// Renvoie le catalogue avec, pour chaque blueprint : possession, quantité craftable, ingrédients manquants.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get('userId'));
  const q = searchParams.get('q') ?? '';
  const category = searchParams.get('category');
  const acquisition = searchParams.get('acquisition');

  const [bps, owned, inv] = await Promise.all([
    prisma.blueprint.findMany({
      where: {
        name: q ? { contains: q, mode: 'insensitive' } : undefined,
        output: category ? { category } : undefined,
        acquisitions: acquisition ? { some: { type: acquisition } } : undefined,
      },
      include: { ingredients: true, acquisitions: { include: { location: true } }, output: true },
      take: 200,
    }),
    userId ? prisma.userBlueprint.findMany({ where: { userId } }) : [],
    userId ? prisma.inventoryItem.findMany({ where: { userId } }) : [],
  ]);

  const ownedIds = new Set(owned.filter((o) => !o.wishlist).map((o) => o.blueprintId));
  const stock = new Map();
  for (const i of inv) stock.set(i.itemId, (stock.get(i.itemId) ?? 0) + i.quantity);

  const result = bps
    .map((bp) => {
      const c = craftability(bp, stock);
      const isOwned = ownedIds.has(bp.id);
      return { ...bp, owned: isOwned, ...c, status: craftStatus({ owned: isOwned, ...c }) };
    })
    .sort((a, b) => closeness(a) - closeness(b));

  return NextResponse.json(result);
}
