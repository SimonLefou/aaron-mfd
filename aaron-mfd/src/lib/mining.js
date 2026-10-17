// Rentabilité minage : vendre brut ou raffiner, et où.

/**
 * @param {object} p
 * @param {number} p.scu            quantité de minerai brut
 * @param {Array}  p.rawPrices      [{ location, sellPrice }]  prix du brut
 * @param {Array}  p.refinedPrices  [{ location, sellPrice }]  prix du raffiné
 * @param {Array}  p.methods        [{ name, yieldPct, costPerScu, hours }]
 */
export function sellVsRefine({ scu, rawPrices, refinedPrices, methods }) {
  const bestRaw = [...rawPrices].sort((a, b) => b.sellPrice - a.sellPrice)[0];
  const bestRefined = [...refinedPrices].sort((a, b) => b.sellPrice - a.sellPrice)[0];
  const options = methods.map((m) => {
    const out = scu * (m.yieldPct / 100);
    const net = out * bestRefined.sellPrice - scu * m.costPerScu;
    return { method: m.name, outputScu: out, net, hours: m.hours, perHour: m.hours ? net / m.hours : net };
  }).sort((a, b) => b.net - a.net);
  return {
    sellRaw: { location: bestRaw.location, net: scu * bestRaw.sellPrice },
    refine: { location: bestRefined.location, options },
    recommendation: options[0] && options[0].net > scu * bestRaw.sellPrice ? 'refine' : 'sell',
  };
}

/** Répartition des gains d'une fleet selon les parts */
export function splitPayout(total, members) {
  const sum = members.reduce((s, m) => s + m.sharePct, 0) || 1;
  return members.map((m) => ({ ...m, amount: Math.round((total * m.sharePct) / sum) }));
}
