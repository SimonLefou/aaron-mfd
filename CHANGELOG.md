# 🚀 AARON MFD - Journal des Versions & Notes de Patch / Release Notes

[🇫🇷 Version Française](#-journal-des-versions-français) | [🇬🇧 English Version](#-release-notes--changelog-english)

---

## 🇫🇷 Journal des Versions (Français)

Ce document répertorie l'ensemble des ajouts, améliorations ergonomiques et correctifs apportés à **AARON MFD** (Stanton Tactical Mining OS).

### [1.6.4] - 2026-10-15 - *Correctif Critique Calcul Réactif & Synthèse Vocale*

#### 🐛 Corrigé (Fixed)
- **Recalcul Automatique sur Sélection de Minerai** : Résolution d'une exception `TypeError: cockpitVoice.speakTarget is not a function` qui bloquait l'exécution du script lors du clic sur un minerai dans la grille. Les méthodes `speakTarget()` et `stop()` ont été intégrées dans `CockpitVoice` et sécurisées par `try/catch`.
- **Mise à Jour Instantanée de la Fracturation** : La résistance, l'instabilité et la faisabilité laser sont désormais recalculées de manière fluide et immédiate dès la sélection de n'importe quel minerai.

### [1.6.3] - 2026-10-15 - *Refonte du Manuel & Guide Prise en Main (Alpha 4.10)*

#### 📖 Documentation & Ergonomie (Manual & Guide Overhaul)
- **Manuel & Prise en Main Mis à Jour** : Réécriture complète des 3 étapes du démarrage rapide pour intégrer les vaisseaux lourds (Arrastra, Orion, ROC-DS), le gestionnaire de profils nommés et les archétypes géologiques réactifs.
- **Nouveaux Outils Tactiques Documentés** : Ajout de fiches explicatives détaillées pour le Décodeur Radar RS 2.0, la Coordination d'escouade & flotte multi-joueurs, et le détachement des sacoches amovibles (Saddlebags).
- **Astuces mobiGlas 4.0 & Cockpit** : Présentation du mode holographique avec dock d'applications rapide, de la synthèse vocale (TTS) et de la personnalisation de l'indicatif pilote.

### [1.6.2] - 2026-10-15 - *Recalcul Réactif Automatique Géologie & Minerais*

#### ⚡ Optimisé (Improved)
- **Recalcul Automatique dès la Sélection** : La sélection d'un archétype rocheux (par puces 3×3 ou liste déroulante), d'un minerai principal ou secondaire recalcule immédiatement la résistance, l'instabilité et la fracturation laser dynamique sans imposer de clic sur le bouton « Auto-calculer ».
- **Prise en Compte Élargie de l'Écosystème Minier 4.10** : Intégration fine des modificateurs physiques pour l'ensemble des minerais et gemmes (Hadanite, Dolivine, Aphorite, Borase, Hephaestanite, etc.).

### [1.6.1] - 2026-10-15 - *Épuration du Volet Données du Scan*

#### 🗑️ Supprimé (Removed)
- **Sélecteur Redondant de Laser dans le Volet Scan** : Retrait du sélecteur de tête laser (`#mainLaserSelect`) et du bouton d'accès rapide dans le panneau « Données du scan », la gestion des têtes laser et tourelles étant centralisée dans la modale d'équipement de bord.

#### 🛠️ Modifié (Changed)
- **Nettoyage du Code & Synchronisation d'État** : Allègement de `app.js`, suppression des sélecteurs et écouteurs obsolètes, et actualisation du cache Service Worker PWA (`aaron-mfd-v1.6.1`).

### [1.6.0] - 2026-10-15 - *Gestionnaire de Profils & Sauvegardes d'Équipement Personnalisées*

#### ✨ Ajouté (Added)
- **Gestionnaire Multi-Profils Nommés** : Enregistrez, nommez, chargez, mettez à jour et supprimez vos configurations d'équipement (vaisseau, tourelles, têtes laser, modules et gadgets) avec persistance locale `localStorage`.
- **5 Préréglages Recommandés (Défaut)** : Configurations d'usine prêtes à l'emploi pour le Prospector (Polyvalent & Puissance Brute), l'Argo MOLE (Trio), le RSI Arrastra (Lourd S3) et le Greycat ROC (Gemmes).

### [1.5.1] - 2026-10-15 - *Personnalisation de l'Indicatif Pilote & Épuration du Radar RS*

#### ✨ Ajouté (Added)
- **Personnalisation & Persistance de l'Indicatif de Pilote (Callsign)** : Modification et mémorisation automatique (`localStorage`) de l'indicatif opérationnel depuis le bandeau supérieur mobiGlas et depuis la carte Chef d'escadre avec boîte de dialogue dédiée.

#### 🗑️ Supprimé (Removed)
- **Préréglages Rapides du Radar RS** : Retrait des boutons superflus (Quant 1x à Bexalite) dans la modale du radar pour privilégier la saisie directe de la signature scannée sur le HUD.

### [1.5.0] - 2026-10-15 - *Refonte mobiGlas 4.0, Coordination de Flotte & Tourelles Unifiées*

#### ✨ Ajouté (Added)
- **Coordination de Flotte & Escouade Multi-Joueurs** : Gestion d'une escadre complète (Prospector, MOLE, ROC, C2 Hercules, etc.) avec cumul des tirs laser, réduction conjointe de la résistance et répartition automatique des gains nets par joueur.
- **Support Vaisseaux Lourds RSI Arrastra & RSI Orion** : Prise en charge des 3 tourelles Size 3 de l'Arrastra (576 SCU) et des 2 tourelles lourdes de l'Orion (2 880 SCU).
- **6 Nouvelles Têtes de Minage Size 3** : Ajout des lasers *Arbor MH3*, *Lancet MH3*, *Helix III*, *Impact III*, *Hofstede-S3*, *Klein-S3* avec leurs caractéristiques officielles.
- **Présentation Holographique mobiGlas 4.0** : Interface holographique inspirée du mobiGlas Star Citizen avec grille hexagonale, cornières néon, scanlines CRT et bandeau supérieur de statut système.
- **Dock Rapide d'Applications** : Barre de lancement inférieure avec accès instantané aux 9 outils tactiques.
- **Bouton de Soutien Communautaire** : Boutons dédiés « Soutenir » dans le bandeau supérieur, le dock et le pied de page (Ko-fi / Buy Me A Coffee).

#### 🛠️ Modifié (Changed)
- **Architecture Unifiée des Cartes de Tourelles** : Remplacement de l'ancien panneau fixe par une génération dynamique de cartes pliables avec badges visuels et gestionnaire de modules pour tous les vaisseaux.
- **Conformité SemVer** : Migration formelle du schéma de versionnement vers le standard Semantic Versioning (v1.5.0).
- **Invalidation Automatique du Cache PWA** : Actualisation du Service Worker vers `aaron-mfd-v1.5.0`.

#### 🐛 Corrigé (Fixed)
- **Doublon de la Tourelle 1** : Élimination définitive de l'affichage en double de la tourelle principale dans la modale d'équipement.
- **Gestionnaire de Modales Haut Débit** : Rétablissement de l'ouverture garantie de toutes les modales du dock et fermeture fluide par clic sur l'arrière-plan flouté.

#### 🗑️ Supprimé (Removed)
- **Boutons de Bascule Cockpit MFD** : Suppression des anciens boutons au profit du design holographique unifié et de l'accès direct aux fonctions de soutien.

### [1.4.0] - 2026-10-15 - *Star Citizen Alpha 4.10 Mining Overhaul*

#### ✨ Ajouté (Added)
- **9 Archétypes Géologiques Officiels** : Basalte, Granite, Obsidienne, Magmatique, Felsique, Gneiss, Quartzite, Schiste, Atacamite avec calibration en 1 clic.
- **Décodeur Radar Ping RS 2.0** : Outil d'identification longue portée pour scanner les astéroïdes distants.
- **Sacoches Amovibles (Saddlebags 4.10)** : Suivi des conteneurs détachés au rayon tracteur pour Prospector et MOLE.
- **Synthèse Vocale Cockpit (TTS)** : Annonces vocales de bord réalistes et 100% hors-ligne.
- **Support Greycat ROC-DS** : Véhicule minier terrestre biplace avec soute augmentée de 1.2 SCU.

### [1.2.0] - 2026-10-14 - *Tactical Overhaul & 6 Mining Tools*

#### 🌿 Simulateur d'Arbre de Fracturation (Break Tree / Sous-Roches)
- **Nouveau** : Modélisation physique de la fracture d'un rocher parent en 3 sous-blocs avec conservation exacte de la masse totale.
- **Nouveau** : Tri visuel automatique selon les règles de Star Citizen :
  - **Violet (Aspirable)** : Morceau enrichi (> 60% de pureté), aspirable directement dans la soute d'un simple clic (`Aspirer dans la soute`).
  - **Orange (À re-fracturer)** : Morceau à pureté intermédiaire, chargeable instantanément dans le scanner principal (`Re-fracturer`).
  - **Gris (Déchets inertes)** : Morceau stérile (< 5% minerai) à laisser sur place.
- **Nouveau** : Affichage en direct du volume cumulé extrait depuis l'arbre de fracture.

#### 🏭 Gestionnaire de Commandes de Raffinage en Direct
- **Nouveau** : File d'attente multi-stations pour suivre vos ordres de raffinage en temps réel dans Stanton.
- **Nouveau** : Calculateur de durée basé sur `durationHoursPerSCU` selon les 4 procédés industriels (*Dinyx Solventation*, *Ferris Carbide*, *Cormack*, *Pyro-Burst*).
- **Nouveau** : Minuteurs dynamiques `hh:mm:ss` avec barre de progression animée et statut `✅ PRÊT AU RAMASSAGE`.
- **Nouveau** : Bouton d'action rapide `Transférer la soute en raffinage` qui vide le vaisseau et planifie la commande.
- **Nouveau** : Bouton `Récupéré / Vendu` créditant automatiquement le gain net dans le Journal de Vol.
- **Nouveau** : Badge de notification dynamique sur l'en-tête du HUD indiquant le nombre de lots actifs.

#### 💡 Assistant Tactique de Gadgets & Modules
- **Nouveau** : Analyse en continu du déficit de pénétration laser.
- **Nouveau** : Recommandation intelligente du gadget idéal :
  - **Sabir 21** (-50% résistance) si suffisant pour saturer la fenêtre verte.
  - **BoreMax** (-75% résistance) pour les roches ultra-denses.
  - **Stalwart** (-70% instabilité) dès que l'instabilité dépasse 60%.
  - **Surge** (+35% charge instantanée) pour les roches proches du seuil optimal.
  - **Tourelles MOLE** : Recommandation du nombre de tourelles actives nécessaires avec calcul de la puissance combinée.
- **Nouveau** : Bouton `APPLIQUER CONSEIL` en 1 clic pour équiper le gadget ou module suggéré et recalculer immédiatement.

#### 🌸 Mode Cluster de Gemmes ROC (Surface)
- **Nouveau** : Interface dédiée apparaissant automatiquement lorsque le **Greycat ROC** (0.8 SCU) est sélectionné.
- **Nouveau** : Sélecteur tactile du nombre de cailloux par cluster (2, 4, 6, 9, 12).
- **Nouveau** : Curseur d'estimation des gemmes par caillou (80 à 220 gemmes).
- **Nouveau** : Calculateur instantané du remplissage de la soute ROC (0.8 SCU = 800 gemmes) et de la valeur marchande en aUEC.
- **Nouveau** : Bouton `CHARGER LE CLUSTER DANS LE ROC`.

#### 📊 Journal de Vol & Statistiques Financières (Flight Ledger)
- **Nouveau** : Tableau de bord de statistiques financières :
  - Total des gains cumulés (toutes sessions).
  - Gains de la session en cours.
  - Volume total extrait en SCU.
  - Compteur de roches / clusters récoltés.
  - Rentabilité horaire estimée en direct (`aUEC / heure`).
- **Nouveau** : Historique complet chronologique des extractions et des lots de raffinage vendus.
- **Nouveau** : Export des données en 1 clic au format **JSON** et au format **CSV (Tableur Excel / Google Sheets)**.
- **Nouveau** : Option de réinitialisation sécurisée de l'historique avec confirmation.

#### ⏱️ Télémètre de Coupe Quantum (Aaron Halo)
- **Nouveau** : Outil interactif intégré au guide du Halo pour calculer la distance restante avant la coupure QT vers les Bandes 4, 5 et 6.
- **Nouveau** : Jauge visuelle de proximité kilométrique.
- **Nouveau** : Alerte sonore et clignotante `🚨 COUPEZ LE QUANTUM DRIVE MAINTENANT !` à moins de 0.15 M km du point de largage.

#### 🔥 Expansion Multi-Systèmes (Pyro 4.0, Nyx & Stanton) & 6 Nouveaux Minerais
- **Nouveau** : Prise en charge intégrale du **Système Pyro** (Alpha 4.0) avec ses stations et minerais exclusifs.
- **Nouveau** : 6 Nouveaux minerais majeurs de Star Citizen 4.0 :
  - **Stileron (ST)** (Pyro Exclusif, Tier S) : Métal légendaire pour blindages militaires lourds (Terminus, Monox). Payout brut 135 aUEC / raffiné 275 aUEC. Signature RS de base : `3 185`.
  - **Riccite (RI)** (Pyro Exclusif, Tier S) : Alliage élastique auto-cicatrisant des mondes sismiques. Payout brut 110 aUEC / raffiné 220 aUEC. Signature RS de base : `3 385`.
  - **Lindinium (LI)** (Pyro & Espace profond, Tier A) : Minerai haute technologie pour composants de pointe. Payout brut 85 aUEC / raffiné 170 aUEC. Signature RS de base : `3 400`.
  - **Sadaryx (SD)** (Nyx Exclusif, Tier A) : Cristal ultra-résistant de la Ceinture Keeger et des stations QV Breaker, indispensable pour les lentilles laser industrielles. Payout brut 95 aUEC / raffiné 195 aUEC. Signature RS de base : `3 320`.
  - **Savrilium (SV)** (Nyx, Tier B) : Composé catalytique rare des astéroïdes profonds. Payout brut 78 aUEC / raffiné 156 aUEC. Signature RS de base : `3 200`.
  - **Carinite (CA)** (Stanton, Tier A) : Minerai rouge profond extrait dans les cratères de lasers orbitaux Hathor (Aberdeen & Daymar) pour les processeurs quantiques. Payout brut 90 aUEC / raffiné 180 aUEC. Signature RS de base : `3 450`.
- **Nouveau** : **Signatures Radar RS (Radar Cross-Section)** officielles intégrées pour chaque minerai : permet aux pilotes de déterminer la composition d'un astéroïde dès le ping radar sans s'approcher !
- **Nouveau** : Barre de filtres par système sur la grille des minerais : `[TOUS LES SYSTÈMES]`, `[STANTON]`, `[🔥 PYRO (4.0)]`, `[🚀 NYX]`.
- **Nouveau** : 4 Nouvelles plateformes et ponts de raffinage de Pyro :
  - **Checkmate Station** (+9% Stileron, +8% Riccite)
  - **Ruin Station • Terminus** (+8% Quantainium, +7% Stileron)
  - **Orbituary** (+7% Riccite, +7% Lindinium)
  - **Station Jump Point Stanton-Pyro** (+6% Lindinium, +5% Bexalite)
- **Nouveau** : 3 Stations de raffinage dans Nyx (Levski • Delamar, Poste Glaciem, Station Jump Point Stanton-Nyx).
- **Nouveau** : 4 Hotspots majeurs de Pyro dans l'Atlas Minier : Planète Terminus (Pyro VI), Planète Monox (Pyro II), Ceinture d'astéroïdes Akiro Cluster, Planète Bloom (Pyro III).
- **Nouveau** : Navigation à 3 onglets dans l'Atlas : `🌌 STANTON & AARON HALO`, `🔥 SYSTÈME PYRO (HAUT RISQUE)`, `🚀 SYSTÈME NYX (DELAMAR & GLACIEM)`.
- **Nouveau** : Sélecteur de commande de raffinage classé par groupes de systèmes (`Système Stanton`, `Système Pyro`, `Système Nyx`).

#### 🌐 Internationalisation & Optimisations
- **Nouveau** : Guide d'accueil et d'explications interactif (Walkthrough) avec sélection de langue directe et onglets thématiques (Démarrage Rapide, Outils, Astuces).
- **Nouveau** : Traduction intégrale bilingue **Français 🇫🇷 / Anglais 🇬🇧** sur 100% des clés de texte, infobulles, fenêtres modales et alertes.
- **Nouveau** : Fenêtre modale interactive de Notes de Version (Changelog) accessible depuis l'en-tête ou le pied de page.
- **Optimisation** : Persistance totale sans serveur via `localStorage` (sauvegarde de la soute, des commandes de raffinage et du journal).
- **Correctif** : Bumping du cache Service Worker vers `aaron-mfd-v7` pour éliminer tout risque de cache périmé sur mobile.

---

### [v1.1] - 2026-10-14 - *Argo MOLE Multi-Crew & Cockpit Themes*

#### 🚀 Support Argo MOLE Multi-Crew
- **Nouveau** : Prise en charge des 3 tourelles Size 2 de l'Argo MOLE (Centrale, Gauche, Droite).
- **Nouveau** : Sélecteur d'équipage : Solo (1 tourelle), Duo (2 tourelles), Trio (3 tourelles actives en simultané).
- **Nouveau** : Calcul de la puissance laser combinée et application cumulative des modificateurs de résistance et d'instabilité.
- **Nouveau** : Configuration individuelle des têtes de minage Size 2 (Lancet MH2, Helix II, Impact II, Hofstede-S2) et modules.

#### 👥 Calculateur de Partage d'Équipage (Multi-Crew Split)
- **Nouveau** : Répartition équitable des gains par membre d'équipage (1 à 5 joueurs).
- **Nouveau** : Curseur de déduction d'une réserve opérationnelle de bord (0 à 30%) pour carburant, réparations et consommables.

#### 🎨 Thèmes de Cockpit Constructeurs
- **Nouveau** : 4 ambiances chromatiques de HUD :
  - **MISC** : Cyan / Bleu canard haute lisibilité.
  - **Drake** : Ambre industriel Caterpillar / Vulture.
  - **Aegis** : Émeraude militaire Vanguard / Reclaimer.
  - **RSI** : Glace arctique Constellation / Scorpius.
- **Nouveau** : Mémorisation du thème dans le stockage local.

#### 📱 Ergonomie Mobile & PWA
- **Nouveau** : Garde d'écran active (`Screen Wake Lock API`) évitant la mise en veille pendant les phases de pilotage.
- **Nouveau** : Mode plein écran immersif en 1 clic.
- **Nouveau** : Cibles tactiles conformes aux standards ergonomiques (minimum 44px de hauteur).
- **Nouveau** : Effets de retour haptique vibrant sur appareils mobiles compatibles.
- **Nouveau** : Export formaté pour Discord en Markdown.
- **Nouveau** : Saisie vocale rapide via la Web Speech API.

---

### [v1.0] - 2026-10-14 - *Fondation AARON MFD*

- **Lancement** : Calculateur instantané de rentabilité du minage (valeur brute vs raffinée).
- **Moteur physique** : Évaluation de la faisabilité de fracturation selon la masse, la résistance et le laser équipé.
- **Base de données** : Fiches des minerais de Stanton (Quantainium, Bexalite, Taranite, Borase, Laranite, Hadanite, etc.).
- **Sécurité** : Minuteur d'instabilité du Quantainium (15 minutes) avec avertissements sonores.
- **Guide spatial** : Tableau des bonus de raffinage des stations L1/L2 et coordonnées de coupe du Halo d'Aaron.
- **Zéro coût** : Fonctionnement 100% côté client sans serveur ni abonnement, installable en PWA hors-ligne.

---

## 🇬🇧 Release Notes & Changelog (English)

This document details all new features, ergonomic enhancements, and fixes in **AARON MFD** (Stanton Tactical Mining OS).

### [1.6.4] - 2026-10-15 - *Critical Fix: Reactive Calculation & Voice Synthesis*

#### 🐛 Fixed
- **Instant Reactive Recalculation on Mineral Selection**: Fixed an unhandled `TypeError: cockpitVoice.speakTarget is not a function` exception that halted script execution whenever a mineral card was clicked. Implemented `speakTarget()` and `stop()` in `CockpitVoice` and safeguarded invocations with `try/catch`.
- **Live Laser & Rock Property Sync**: Dynamic rock resistance, instability, and laser wattage saturation now update smoothly and immediately upon selecting any mineral.

### [1.6.3] - 2026-10-15 - *Operating Manual & Walkthrough Guide Overhaul (Alpha 4.10)*

#### 📖 Documentation & Walkthrough
- **Full Guide Overhaul**: Completely updated Quickstart steps to cover heavy industrial mining ships (RSI Arrastra, RSI Orion, Greycat ROC-DS), named custom loadout profiles, and reactive rock archetypes.
- **Newly Added Tool Reference Cards**: Detailed operating guides for Radar Ping RS 2.0 Decoder, Multiplayer Fleet & Wing Coordination, and Tractor Beam Saddlebags management.
- **mobiGlas 4.0 & Flight Tips**: Step-by-step guidance on holographic mobiGlas layout with quick app dock, 100% offline Cockpit Voice TTS callouts, and pilot callsign customization.

### [1.6.2] - 2026-10-15 - *Automatic Reactive Recalculation for Geology & Minerals*

#### ⚡ Improved
- **Instant Reactive Recalculation on Selection**: Selecting a rock archetype (via 3×3 chips or dropdown), primary ore, or secondary mineral immediately recomputes dynamic resistance, instability, and laser fracture without requiring a manual click on "Auto-Calculate".
- **Expanded Physical Ore Modifiers (4.10)**: Fine-tuned physical modifiers for all SC minerals and ROC gemstones (Hadanite, Dolivine, Aphorite, Borase, Hephaestanite, etc.).

### [1.6.1] - 2026-10-15 - *Rock Scan Panel Clean-up*

#### 🗑️ Removed
- **Redundant Laser Selector in Scan Panel**: Removed redundant active laser dropdown (`#mainLaserSelect`) and shortcut button from the "Rock Scan Data" panel. Laser and turret configuration is centrally managed through the dedicated Ship Loadout modal and turret cards.

#### 🛠️ Changed
- **Code & DOM Streamlining**: Cleaned up legacy selectors and event listeners in `app.js`, bumped SemVer patch version, and updated PWA Service Worker cache (`aaron-mfd-v1.6.1`).

### [1.6.0] - 2026-10-15 - *Loadout Profiles Manager & Custom Saved Configurations*

#### ✨ Added
- **Multi-Profile Named Loadouts Manager**: Save, name, load, update, and delete custom named loadouts (ship, turrets, lasers, modules, and gadgets) with `localStorage` persistence.
- **5 Factory Default Presets**: Instant starter setups for Prospector (Balanced & Heavy), Argo MOLE (Trio), RSI Arrastra (Heavy S3), and Greycat ROC (Gems).

### [1.5.1] - 2026-10-15 - *Pilot Callsign Customization & RS Radar Clean-up*

#### ✨ Added
- **Pilot Callsign Customization & Offline Persistence**: Edit and persist operational radio callsign via top mobiGlas header and Fleet squad leader card with dedicated modal editor and `localStorage` syncing.

#### 🗑️ Removed
- **RS Radar Signature Quick Presets**: Removed redundant signature chips (Quant 1x to Bexalite) from the radar modal in favor of direct HUD scan input.

### [1.5.0] - 2026-10-15 - *mobiGlas 4.0 Layout, Fleet Coordination & Unified Turrets*

#### ✨ Added
- **Multiplayer Fleet & Squad Mining Coordination**: Complete wing management (Prospector, MOLE, ROC, C2 Hercules, etc.) with joint laser beam power stacking, shared rock resistance reduction, and net profit split per player.
- **RSI Arrastra & RSI Orion Heavy Ships**: Full support for Arrastra 3x Size 3 remote turrets (576 SCU) and Orion 2x heavy turrets (2,880 SCU).
- **6 Authentic Size 3 Mining Lasers**: Added *Arbor MH3*, *Lancet MH3*, *Helix III*, *Impact III*, *Hofstede-S3*, *Klein-S3* with official power and mod properties.
- **mobiGlas 4.0 Holographic Layout**: Star Citizen inspired holographic UI with hex mesh, glowing neon brackets, CRT scanlines, and top status bar.
- **Bottom App Launcher Dock**: Quick-access launcher bar with 9 apps.
- **Dedicated Community Support Buttons**: Quick support buttons in top header, dock, and footer (Ko-fi / Buy Me A Coffee).

#### 🛠️ Changed
- **Unified Dynamic Turrets Architecture**: Dynamically generated collapsible turret cards with visual badges and module slots for all ships.
- **SemVer Compliance**: Full migration to Semantic Versioning standard (v1.5.0).
- **PWA Cache Invalidation**: Updated Service Worker cache to `aaron-mfd-v1.5.0`.

#### 🐛 Fixed
- **Turret 1 Duplicate**: Fixed redundant primary turret display in loadout modal.
- **High-Speed Modal Triggering**: Direct guaranteed opening of all dock modals with backdrop click-to-close.

#### 🗑️ Removed
- **Legacy Cockpit Layout Switches**: Cleaned up in favor of unified mobiGlas design and direct support links.

### [1.4.0] - 2026-10-15 - *Star Citizen Alpha 4.10 Mining Overhaul*

#### ✨ Added
- **9 Official Geological Archetypes**: Basalt, Granite, Obsidian, Igneous, Felsic, Gneiss, Quartzite, Shale, Atacamite.
- **Radar Ping RS 2.0 Signature Decoder**: Long-range asteroid scanner tool.
- **Detachable Saddlebags (Alpha 4.10)**: Tractor-beamed container tracker for Prospector and MOLE.
- **Cockpit Voice Assistant (TTS)**: Offline synthesized voice alerts.
- **Greycat ROC-DS Support**: Dual-seat mining rover with 1.2 SCU hopper.

### [1.2.0] - 2026-10-14 - *Tactical Overhaul & 6 Mining Tools*

#### 🌿 Sub-Chunk Fracture Simulator (Break Tree)
- **New**: Real-time physical fracture simulation splitting parent rocks into 3 sub-chunks while strictly conserving total rock mass.
- **New**: Star Citizen color-coded visual triage:
  - **Purple (Extractable)**: High-purity chunk (> 60% ore), extractable directly into the cargo hold with a single click (`Extract to hold`).
  - **Orange (Re-fracture)**: Intermediate purity chunk, instantly loadable into the main scan display (`Re-fracture`).
  - **Gray (Inert Waste)**: Sterile debris (< 5% ore) to leave behind.
- **New**: Live tracker of cumulative volume extracted from the fracture tree.

#### 🏭 Live Refinery Order Manager
- **New**: Multi-station queue to monitor active refinery batches across Stanton in real time.
- **New**: Accurate duration calculation engine based on industrial methods (*Dinyx Solventation*, *Ferris Carbide*, *Cormack*, *Pyro-Burst*).
- **New**: Dynamic `hh:mm:ss` countdown timers with animated progress bars and `✅ READY TO COLLECT` status.
- **New**: Quick-action button `Transfer Hold to Refinery` that empties ship cargo and schedules the batch.
- **New**: `Collected / Sold` button automatically logging net profit into the Flight Ledger.
- **New**: Dynamic HUD header notification badge showing the number of active refinery batches.

#### 💡 Tactical Gadget & Mining Module Advisor
- **New**: Continuous laser penetration deficit analysis.
- **New**: Intelligent gadget recommendations:
  - **Sabir 21** (-50% resistance) when adequate to saturate the optimal green window.
  - **BoreMax** (-75% resistance) for ultra-dense high-mass rocks.
  - **Stalwart** (-70% instability) whenever instability exceeds 60%.
  - **Surge** (+35% instant charge) for rocks hovering near the optimal threshold.
  - **MOLE Turrets**: Automated recommendation of required active turrets with combined power rating.
- **New**: 1-Click `APPLY ADVICE` button to equip the recommended gadget or module and instantly recalculate.

#### 🌸 ROC Gem Cluster Mode (Surface Mining)
- **New**: Dedicated UI card appearing automatically when the **Greycat ROC** (0.8 SCU) is selected.
- **New**: Tactile node count selector for clusters (2, 4, 6, 9, 12 nodes).
- **New**: Interactive slider for estimated gems per node (80 to 220 gems).
- **New**: Instant calculation of ROC hold fill percentage (0.8 SCU = 800 gems) and projected market value in aUEC.
- **New**: Single-click button `LOAD CLUSTER INTO ROC`.

#### 📊 Flight Ledger & Financial Statistics
- **New**: Comprehensive financial dashboard:
  - Total cumulative earnings across all runs.
  - Current session earnings.
  - Total volume extracted in SCU.
  - Total rock / cluster counter.
  - Real-time estimated hourly profitability (`aUEC / hour`).
- **New**: Chronological extraction history tracking runs and collected refinery orders.
- **New**: 1-Click export to **JSON** and **CSV (Excel / Google Sheets)**.
- **New**: Secure ledger reset with confirmation dialog.

#### ⏱️ Aaron Halo Quantum Drive Cut-Off Rangefinder
- **New**: Interactive tool integrated into the Halo reference guide to calculate remaining distance before QT cut-off towards Bands 4, 5, and 6.
- **New**: Visual proximity gauge with distance tracking.
- **New**: Audio and flashing alert `🚨 CUT QUANTUM DRIVE NOW!` when within 0.15 M km of drop point.

#### 🔥 Multi-System Expansion (Pyro 4.0, Nyx & Stanton) & 6 New Ores
- **New**: Full support for the lawless **Pyro System** (Star Citizen Alpha 4.0) with exclusive ores and integrated refinery decks.
- **New**: 6 High-tier ores introduced in Star Citizen 4.0:
  - **Stileron (ST)** (Pyro Exclusive, Tier S): Legendary metal used in heavy military armor (Terminus, Monox). Raw 135 aUEC / Refined 275 aUEC. Base RS Signature: `3,185`.
  - **Riccite (RI)** (Pyro Exclusive, Tier S): Self-healing elastic alloy from seismic worlds. Raw 110 aUEC / Refined 220 aUEC. Base RS Signature: `3,385`.
  - **Lindinium (LI)** (Pyro & Deep space, Tier A): Cutting-edge component alloy. Raw 85 aUEC / Refined 170 aUEC. Base RS Signature: `3,400`.
  - **Sadaryx (SD)** (Nyx Exclusive, Tier A): Ultra-durable crystal from Keeger Belt and QV Breaker stations for high-power laser lenses. Raw 95 aUEC / Refined 195 aUEC. Base RS Signature: `3,320`.
  - **Savrilium (SV)** (Nyx, Tier B): Rare catalytic compound from deep asteroid hollows. Raw 78 aUEC / Refined 156 aUEC. Base RS Signature: `3,200`.
  - **Carinite (CA)** (Stanton, Tier A): Deep-red mineral mined from Hathor orbital laser craters (Aberdeen & Daymar) for quantum processors. Raw 90 aUEC / Refined 180 aUEC. Base RS Signature: `3,450`.
- **New**: Official **RS (Radar Cross-Section) Signatures** embedded into every mineral card, allowing pilots to identify rock contents directly from scanner ping pings!
- **New**: Interactive System Filter bar on the ore selector: `[ALL SYSTEMS]`, `[STANTON]`, `[🔥 PYRO (4.0)]`, `[🚀 NYX]`.
- **New**: 4 Major Pyro orbital refinery hubs:
  - **Checkmate Station** (+9% Stileron, +8% Riccite)
  - **Ruin Station • Terminus** (+8% Quantainium, +7% Stileron)
  - **Orbituary** (+7% Riccite, +7% Lindinium)
  - **Stanton-Pyro Jump Point Station** (+6% Lindinium, +5% Bexalite)
- **New**: 3 Refinery hubs in Nyx (Levski • Delamar, Poste Glaciem, Stanton-Nyx Gateway).
- **New**: 4 Prime Pyro mining hotspots in Geological Atlas: Planet Terminus (Pyro VI), Planet Monox (Pyro II), Akiro Cluster Belt, Planet Bloom (Pyro III).
- **New**: 3-Tabbed System Atlas: `🌌 STANTON & AARON HALO`, `🔥 PYRO SYSTEM (HIGH RISK)`, `🚀 NYX SYSTEM (DELAMAR & GLACIEM)`.
- **New**: Refinery order creation modal with system grouping (`Stanton System`, `Pyro System`, `Nyx System`).

#### 🌐 Internationalization & Core Optimizations
- **New**: Interactive User Walkthrough and Quick Start Guide modal with direct language switcher and tabbed breakdown (Quick Start, Mining Tools, Pro Tips).
- **New**: Complete bilingual **French 🇫🇷 / English 🇬🇧** localization across 100% of UI labels, modals, tooltips, and alerts.
- **New**: Interactive Release Notes modal (Changelog) accessible from header badge and footer.
- **Optimization**: Zero server cost with complete `localStorage` offline persistence (cargo hold, refinery jobs, ledger).
- **Fix**: Service Worker cache bumped to `aaron-mfd-v7` ensuring seamless mobile PWA updates.

---

### [v1.1] - 2026-10-14 - *Argo MOLE Multi-Crew & Cockpit Themes*

#### 🚀 Argo MOLE Multi-Crew Support
- **New**: Full support for all 3 Size 2 MOLE turrets (Center, Left, Right).
- **New**: Crew operational modes: Solo (1 turret), Duo (2 turrets), Trio (3 turrets active simultaneously).
- **New**: Combined laser wattage and cumulative resistance/instability modifiers.
- **New**: Individual Size 2 mining head loadout configuration (Lancet MH2, Helix II, Impact II, Hofstede-S2) and sub-modules.

#### 👥 Multi-Crew Profit Sharing (Crew Split)
- **New**: Fair payout distribution per crew member (1 to 5 players).
- **New**: Configurable ship operational reserve deduction (0 to 30%) for fuel, ammo, and repairs.

#### 🎨 Manufacturer Cockpit HUD Themes
- **New**: 4 authentic manufacturer color schemes:
  - **MISC**: High-readability Cyan / Teal.
  - **Drake**: Industrial Amber (Caterpillar / Vulture style).
  - **Aegis**: Military Emerald (Vanguard / Reclaimer style).
  - **RSI**: Arctic Ice (Constellation / Scorpius style).
- **New**: Theme persistence saved to local storage.

#### 📱 Mobile PWA & Cockpit Ergonomics
- **New**: Screen Wake Lock API keeping screens illuminated during flight.
- **New**: 1-Click immersive fullscreen mode.
- **New**: Ergonomic 44px+ touch targets for tablets and mobile devices.
- **New**: Haptic vibration feedback on compatible devices.
- **New**: Pre-formatted Markdown report export ready to paste into Discord org channels.
- **New**: Voice input via Web Speech API.

---

### [v1.0] - 2026-10-14 - *AARON MFD Foundation*

- **Launch**: Real-time mining profitability calculator (raw vs. refined yield).
- **Physics Engine**: Laser fracture feasibility based on rock mass, resistance, and equipped laser power.
- **Stanton Database**: Mineral database covering Quantainium, Bexalite, Taranite, Borase, Laranite, Hadanite, etc.
- **Hazard Safety**: 15-minute Quantainium volatility countdown timer with critical audio alerts.
- **Navigation Guide**: L1/L2 refinery station bonus matrix and Aaron Halo Quantum drop coordinates.
- **Zero Cost**: 100% client-side architecture with zero server costs, installable offline PWA.
