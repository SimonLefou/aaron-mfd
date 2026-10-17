import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// PATCH /api/guild/members  { guildId, userId, accept: true|false }
export async function PATCH(req) {
  const { guildId, userId, accept } = await req.json();
  const member = await prisma.guildMember.update({
    where: { guildId_userId: { guildId, userId } },
    data: accept ? { status: 'ACTIVE', role: 'MEMBER' } : { status: 'REJECTED' },
  });
  return NextResponse.json(member);
}
