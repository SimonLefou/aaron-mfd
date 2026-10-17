import { PrismaClient } from '@prisma/client';

// Une seule instance en développement (évite d'ouvrir trop de connexions au rechargement)
const g = globalThis;
export const prisma = g.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') g.__prisma = prisma;
