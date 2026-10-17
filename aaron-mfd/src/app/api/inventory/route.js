import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/inventory?userId=1
export async function GET(req) {
  const userId = Number(new URL(req.url).searchParams.get('userId'));
  const rows = await prisma.inventoryItem.findMany({ where: { userId }, include: { item: true, location: true } });
  return NextResponse.json(rows);
}

// POST /api/inventory  { userId, lines: [{ itemId, quantity, quality?, locationId? }], source: "OCR" }
// Utilisé après validation des lignes lues par OCR (Tesseract.js côté navigateur).
export async function POST(req) {
  const { userId, lines, source = 'MANUAL' } = await req.json();
  const created = await prisma.$transaction(
    lines.map((l) => prisma.inventoryItem.create({ data: { ...l, userId, source } })),
  );
  return NextResponse.json(created, { status: 201 });
}
