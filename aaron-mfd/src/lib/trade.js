// Meilleures routes commerciales pour une soute et un capital donnés.
// prices : [{ item, location, buyPrice, sellPrice, stockScu }]
export function bestRoutes(prices, { cargoScu, capital }, limit = 10) {
  const buys = prices.filter((p) => p.buyPrice);
  const sells = prices.filter((p) => p.sellPrice);
  const routes = [];
  for (const b of buys) for (const s of sells) {
    if (b.item !== s.item || b.location === s.location || s.sellPrice <= b.buyPrice) continue;
    const scu = Math.min(cargoScu, Math.floor(capital / b.buyPrice), b.stockScu ?? Infinity);
    if (scu <= 0) continue;
    routes.push({ item: b.item, from: b.location, to: s.location, scu, profit: scu * (s.sellPrice - b.buyPrice) });
  }
  return routes.sort((a, b) => b.profit - a.profit).slice(0, limit);
}

/** Meilleur vaisseau (parmi ceux possédés) pour une route donnée */
export function bestShipForRoute(route, ships, capital) {
  return ships
    .map((s) => ({ ship: s, scu: Math.min(s.cargoScu, Math.floor(capital / route.buyPrice)) }))
    .map((x) => ({ ...x, profit: x.scu * (route.sellPrice - route.buyPrice) }))
    .sort((a, b) => b.profit - a.profit)[0];
}
