// Calcul de craftabilité, récursif (un ingrédient peut lui-même être craftable).
// Toutes les fonctions sont pures : elles marchent avec les données d'exemple ou avec Prisma.

/**
 * @param {object} blueprint  { id, ingredients: [{ itemId, quantity }] }
 * @param {Map<number, number>} stock  itemId → quantité disponible
 * @param {Map<number, object>} recipesByOutput  itemId → blueprint possédé qui le produit (optionnel)
 * @returns {{ maxQty:number, missing:Array<{itemId:number, needed:number, have:number}> }}
 */
export function craftability(blueprint, stock, recipesByOutput = new Map(), depth = 0) {
  let maxQty = Infinity;
  const missing = [];
  for (const ing of blueprint.ingredients) {
    const have = stock.get(ing.itemId) ?? 0;
    let possible = Math.floor(have / ing.quantity);
    // Si on manque de cet ingrédient mais qu'on sait le crafter, on regarde un niveau plus bas
    if (possible < 1 && depth < 3 && recipesByOutput.has(ing.itemId)) {
      const sub = craftability(recipesByOutput.get(ing.itemId), stock, recipesByOutput, depth + 1);
      if (sub.maxQty * (recipesByOutput.get(ing.itemId).outputQty ?? 1) >= ing.quantity - have) possible = 1;
    }
    if (possible < 1) missing.push({ itemId: ing.itemId, needed: ing.quantity, have });
    maxQty = Math.min(maxQty, possible);
  }
  return { maxQty: maxQty === Infinity ? 0 : maxQty, missing };
}

/** Statut affiché : craftable / manque N / non possédé */
export function craftStatus({ owned, maxQty, missing }) {
  if (!owned) return { key: 'r', label: '—' };
  if (maxQty > 0) return { key: 'g', label: 'Craftable' };
  return { key: 'a', label: `Manque ${missing.length}` };
}

/** Tri « proche du craft » : craftables, puis peu d'ingrédients manquants, puis non possédés */
export function closeness(bp) {
  if (!bp.owned) return 1000;
  if (bp.maxQty > 0) return 0;
  return bp.missing.length;
}

/** Stock combiné de plusieurs inventaires (vue guilde) */
export function mergeStock(...inventories) {
  const m = new Map();
  for (const inv of inventories) for (const { itemId, quantity } of inv) m.set(itemId, (m.get(itemId) ?? 0) + quantity);
  return m;
}
