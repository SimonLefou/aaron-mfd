# AARON MFD

Application web de gestion Star Citizen : flotte et loadouts, inventaire (OCR), minage, craft et blueprints, commerce, fleets et guilde.
Tout le projet est en JavaScript : Next.js 14 (React), Prisma et PostgreSQL.

> Les écrans utilisent pour l'instant des **données d'exemple**. Les branchements à la base passent par les routes `src/app/api/`.

## Démarrer

```bash
npm install            # installe et génère le client Prisma
cp .env.example .env   # puis mets ton DATABASE_URL PostgreSQL
npm run db:push        # crée les tables à partir de prisma/schema.prisma
npm run db:seed        # (optionnel) quelques données d'exemple
npm run dev            # http://localhost:3000
```

## Arborescence

```
prisma/schema.prisma     modèle de données complet (catalogue, blueprints, joueurs, minage, guildes)
prisma/seed.js           données d'exemple
src/app/                 une route par écran : / flotte flotte/[id] inventaire minage craft commerce fleets guilde
src/app/api/             blueprints (catalogue + craftabilité), inventory (ajout OCR), guild/members (accepter/refuser)
src/components/          Sidebar, TopBar, Toast
src/screens/             les écrans React (CraftScreen est entièrement interactif)
src/lib/craftability.js  craftable ? quantité max, ingrédients manquants, tri « proche du craft », stock de guilde
src/lib/mining.js        vendre brut ou raffiner, répartition des gains de fleet
src/lib/trade.js         meilleures routes, meilleur vaisseau pour une route
src/data/sample.js       données d'exemple
```

## Prochaines étapes

1. Connexion Discord (NextAuth) et utilisateur courant dans la TopBar.
2. Remplacer `src/data/sample.js` par des appels aux routes API.
3. Import du catalogue depuis les API communautaires (UEX, Star Citizen Wiki), versionné par `gameVersion`.
4. OCR de l'inventaire avec Tesseract.js, et fleets en temps réel avec Socket.io.

## Vaisseaux (ships.js)

- `src/data/ships.js` : ta base de vaisseaux (`SHIPS` pour le minage, `SUPPORT_SHIPS` pour le support).
- `src/lib/ships.js` : fusionne les deux listes avec les mêmes champs, et déduit les emplacements (lasers, modules, boucliers, centrale, refroidisseurs, moteur quantique).
- `/flotte` affiche le catalogue (recherche, filtre minage ou support), et `/flotte/<id>` les emplacements de chaque vaisseau.
- `npm run db:seed-ships` importe les vaisseaux dans la base (table ShipModel avec `slug` et `specs`, plus la table Hardpoint).

## Onglet Flotte

- `/flotte` : tes vaisseaux (vaisseau actif, état de configuration, résumé des tourelles et opérateurs) et le bouton « Composer ma flotte », qui ouvre le catalogue ships.js pour ajouter des vaisseaux.
- `/flotte/<id>` : configuration d'un vaisseau de TA flotte. Surnom, une tête laser par tourelle filtrée selon la taille, des modules, un opérateur par tourelle, la copie d'une configuration sur toutes les tourelles, les composants et l'assurance.
- `/vaisseaux/<id>` : fiche technique d'un modèle du catalogue.
- Pour le prototype, la flotte est enregistrée dans le navigateur (`src/lib/useFleet.js`). Elle passera ensuite par la base, dans les tables UserShip, Loadout et LoadoutSlot.
- `src/data/mining-gear.js` : têtes laser et modules. Les noms sont fournis, mais les stats et le nombre de slots de modules par tête restent à compléter.
