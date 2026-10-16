# 🚀 AARON MFD - Journal des Versions & Notes de Patch / Release Notes

[🇫🇷 Version Française](#-journal-des-versions-français) | [🇬🇧 English Version](#-release-notes--changelog-english)

---

## 🇫🇷 Journal des Versions (Français)

Ce document répertorie l'ensemble des ajouts, améliorations ergonomiques et correctifs apportés à **AARON MFD** (Stanton Tactical Mining OS).

### [2.2.0] - 2026-10-16 - *Jalon 7 : Ordres de Raffinage, Inventaire de Guilde, Trésorerie & Trading Cargo*

#### 🚀 Jalon Majeur Implémenté (Milestone 7)
- **Inventaire Collaboratif & Stockpile Unifié de Guilde (*Guild Shared Stockpile*)** :
  - Prise en charge unifiée des **minerais bruts/raffinés** et des **marchandises générales de fret** (Medical Supplies, Laranite, Titane, Scrap, Distilled Spirits, Maze, Slam, WiDoW, etc.).
  - Centralisation et mutualisation en temps réel de tous les stocks dans l'ensemble des stations et avant-postes de Stanton et Pyro.
  - Paquets WebRTC DataChannel ultra-légers `CORPO_STOCK_SYNC` et `CORPO_TRADE_SYNC` assurant une synchronisation sub-150ms entre tous les membres de la corporation connectés à Fleet-Net.
  - Filtres multi-critères instantanés (par Station, par Minerai/Marchandise, par Statut logistique).
  - Badges distinctifs `⛏️ MINERAI` et `📦 COMMODITY` avec prix d'achat unitaire, valeur estimée de revente et marge brute.
  - Bouton 1-clic `📥 Déposer la soute actuelle en Stockpile` permettant de vider sa soute pour la mettre à disposition de la corporation, et bouton `➕ Nouveau Lot de Stockpile` avec sélection de catégorie et coût d'achat unitaire.
  - Action logistique directe `🚜 Assigner C2/MAX` transférant en 1 clic un lot raffiné ou marchandise vers la grille physique du transporteur actif (Cargo Grid Master Jalon 5).
- **Simulateur de Trading & Arbitrage Cargo (*Commodity Trade Run Simulator*)** :
  - Nouvel onglet dédié `📈 TRADING & ROUTES CARGO` dans l'interface de guilde.
  - Sélecteur de marchandises générales par famille (Médical, Métaux, Industriel, Consommables, Illicite / Vice).
  - Raccourcis de capacité de soute pour tous les cargos (Cutlass Black 46 SCU, Freelancer MAX 120 SCU, Taurus 174 SCU, RAFT 192 SCU, Caterpillar 576 SCU, C2 Hercules 696 SCU).
  - Préréglages de routes commerciales populaires de Stanton & Pyro (Deakins vers Orison, Arial vers Area18, Brio's Breaker Yard, Checkmate, etc.).
  - Calcul dynamique en direct du **Capital Requis** (aUEC), **Bénéfice Net du Run**, **Marge par SCU**, **Retour sur Investissement (ROI %)** et indice de risque pirate (*Sûr, Modéré, Extrême*).
  - **Financement direct sur la Trésorerie de Guilde** : Prélèvement automatique du capital requis comme avance de trésorerie avec enregistrement comptable au grand livre.
  - **Dépôt 1-clic en Stockpile de Guilde** : Intégration immédiate de la cargaison achetée dans l'inventaire partagé avec synchronisation de flotte `CORPO_TRADE_SYNC`.
- **Trésorerie de Guilde & Grand Livre des Coûts Partagés (*Corpo Treasury & Expense Ledger*)** :
  - Gestion du solde de trésorerie corporative avec dépôts, retraits et synchronisation de flotte `CORPO_TREASURY_SYNC`.
  - Centralisation collaborative de tous les frais opérationnels engagés par les membres de la flotte : frais de raffinage, carburant Quantum & Hydrogène, réparations & réarmement, modules & consommables, prime de risque escorte et avances de trading.
  - Synchronisation temps réel via le paquet télémétrique `CORPO_EXPENSE_SYNC`.
  - Calcul automatique du **Bénéfice Net Projeté de Guilde** (Recettes Brutes - Dépenses Totales).
  - Bouton `📋 Exporter le Grand Livre (Discord)` générant un rapport officiel formaté prêt à coller dans Discord.
- **Feuille de Répartition mo.Trader & Dividendes de Guilde (*Crew Split Sheet*)** :
  - Répartition automatisée des gains d'opération : part de trésorerie corporative retenue à la source (0 à 50%), prime d'escorte de combat, commission de transport lourd, et solde net versé aux équipages.
  - Ordres de virement direct `mo.Trader` copiables en 1 clic pour exécution immédiate dans l'application mobiGlas du jeu.
- **Ergonomie Cockpit & Désencombrement MFD (Discord Voice)** :
  - Retrait du widget Conseiller de Tir Conjoint (séquençage statique et boutons d'état radio) redondant avec les communications vocales naturelles sur Discord / TeamSpeak.
  - Libération de l'espace vertical du panneau central `#panelTacticalAnalysis` pour offrir une visibilité maximale et sans défilement au Solveur d'Équipement Optimal 4.0, à la Jauge d'Arc de Faisabilité et au Simulateur de Sous-roches.
- **Statuts Logistiques Allégés & Notifications Web Push Déportées** :
  - Conception ciblée évitant la duplication des consoles de jeu pour se focaliser sur l'alerte déportée et la logistique.
  - Minuteurs dynamiques pour chaque ordre avec calcul de progression et rendement.
  - **Notifications Web Push natives de bureau & mobile** alertant les pilotes même lorsque l'application ou le navigateur est en arrière-plan dès qu'un lot de raffinage est prêt au chargement (`🔔 Raffinerie [Station] : Votre commande de [X] SCU de [Minerai] est prête au chargement !`).
  - Annonce vocale par le cockpit TTS assistant et carillon sonore immersif.

### [2.1.0] - 2026-10-15 - *Jalon 6 : Bourse Commerciale, API UEX Corp & Intelligence de Guilde*

#### 🚀 Jalon Majeur Implémenté (Milestone 6)
- **Intégration API Live UEX Corp & Cache Hors-Ligne (`uexcorp.space`)** :
  - Synchronisation transparente avec l'API publique UEX Corp pour récupérer les cours réels d'achat et de vente des minerais dans tous les terminaux TDD et stations de Stanton, Pyro et Nyx.
  - Système de **cache local hors-ligne (`aaron_mfd_uex_cache_v2`)** garantissant un fonctionnement 100% hors-ligne avec badge d'état dynamique (🟢 `UEX LIVE`, 🟡 `UEX CACHE`, 🟣 `UEX GUILDE`) et bouton de rafraîchissement manuel `SYNC`.
- **Moteur d'Arbitrage Économique (Brut vs Raffiné)** :
  - Comparateur en temps réel dans `#panelMarketHold` entre la vente brute immédiate et l'ensemble des procédés de raffinage (*Dinyx Solventation*, *Ferris Carbide*, *Cormack Method*, *Pyro-Burst*).
  - Déduction des frais de procédé, application des bonus de rendement par station (ex: +10% Quantainium à ARC-L1), calcul du gain net en aUEC, du différentiel (+/- aUEC) et du retour sur investissement (ROI %).
  - Recommandation optimale dynamique mise en avant dans le bandeau `#mktArbitrageBanner`.
- **Calculateur de Tournée Commerciale Optimale (*Best Sales Locations Optimizer*)** :
  - Analyse globale des stocks (soute du mineur ou soute du transporteur Cargo Grid Master) pour identifier les meilleurs terminaux d'achat classés par profit maximum et niveau de demande (Forte / Moyenne / Faible).
  - Génération d'une **tournée commerciale optimisée** multi-arrêts avec total estimé et bouton 1-clic `📋 Copier la tournée` prêt à coller dans le chat en jeu ou Discord.
- **Éclaireurs de Guilde & Crowdsourcing P2P (`CORPO_PRICE_UPDATE`)** :
  - Formulaire rapide d'éclaireur dans l'onglet `📡 ÉCLAIREUR GUILDE` permettant de valider ou ajuster un cours constaté en direct à un terminal TDD.
  - Diffusion instantanée (< 150 ms) à toute la flotte via WebRTC DataChannel avec badge de confirmation *"Éclaireur [Callsign]"* et journal d'activité d'escadre.

### [2.0.0] - 2026-10-15 - *Jalon 5 : Transport Spécialisé & Logistique de Fret (Cargo Refactor 4.0)*

#### 🚀 Jalon Majeur Implémenté (Milestone 5)
- **Flotte de Transporteurs Dédiés Authentiques (Star Citizen 4.0)** :
  - Intégration de 10 vaisseaux cargos : Drake Cutlass Black (46 SCU), Crusader C1 Spirit (64 SCU), MISC Hull A (64 SCU), MISC Freelancer MAX (120 SCU), RSI Zeus Mk II CL (128 SCU), RSI Constellation Taurus (174 SCU), Argo RAFT (192 SCU), Drake Caterpillar (576 SCU), Crusader C2 Hercules (696 SCU), MISC Hull C (4 608 SCU).
  - Spécifications complètes des rayons tracteurs dédiés S1/S2/S3 (force de 6 000 à 45 000 N), topologies physiques de grilles (interne, externe, modulaire, spindle) et calcul en temps réel de la capacité max en sacoches Prospector (8 SCU) et MOLE (12 SCU).
- **Transbordement en Vol Ship-to-Ship via FLEET-NET** :
  - Action mineur 1-clic **`📡 APPELER TRANSPORT DE FRET`** dans l'encadré des sacoches (`#saddlebagsControlBox`) pour diffuser les sacoches pleines ou le chargement en attente.
  - Récupération en plein vol par les transporteurs au rayon tracteur (**`🧲 ARRIMAGE RAYON TRACTEUR`**), ce qui charge le fret sur la grille du transporteur et libère instantanément la soute du mineur sans retour à la station.
- **Gestionnaire Visuel de Grille de Fret Physicalisée (Cargo Grid Master)** :
  - Carte cockpit interactive `#cargoGridMasterCard` : sélecteur de transporteur, affichage visuel des blocs de conteneurs arrimés avec identification des minerais, badge d'avertissement d'instabilité du Quantainium brut, estimation de rentabilité brute et nette raffinée, et bouton de déchargement au terminal.
- **Commission Transporteur Dédiée** :
  - Curseur de commission de fret (0 à 35%) intégré dans la répartition des gains d'escouade (`#crewModal`), assurant une compensation équitable des pilotes de transport lourd au sein de l'opération.

### [1.9.0] - 2026-10-15 - *Jalon 4 : Coordination Tactique, Solveur Optimal 4.0 & Escorte de Combat*

#### 🚀 Jalon Majeur Implémenté (Milestone 4)
- **Solveur de Loadout Optimal Avancé 4.0** :
  - Algorithme d'optimisation prédictive simulant l'ensemble des têtes laser (Lancet, Helix, Arbor, Impact, Klein, têtes artisanales), sous-modules (Focus III, Surge, Brandt, Rieger-C3) et gadgets (Sabir 21, BoreMax, Stalwart) selon la masse, la résistance et l'instabilité de la roche cible.
  - Onglets de configuration **Recommandation Solo** et **Escouade / Multi-équipage Requise**.
  - Bouton **1-Clic `⚡ ÉQUIPER CE LOADOUT`** : assignation instantanée de la tête laser, des sous-modules et du gadget avec recalcule et diffusion synchrone `FLEET_SYNC` à l'escadre.
- **Conseiller de Tir Conjoint & Séquençage Tactique** :
  - Séquençage tactique en 3 phases synchronisées : Phase 1 (Affaiblissement résistance Lancet/Sabir < 20%), Phase 2 (Saturation thermique Helix), Phase 3 (Régulation zone verte 45-50%).
  - Jauge de risque de surchauffe / explosion collective en temps réel (`#overchargeRiskVal` & `#overchargeRiskFill`).
  - Signalement radio d'état de tir en direct (`VEILLE`, `CHARGE`, `ZONE VERTE`, `SURCHAUFFE`) synchronisé entre ailiers via Fleet-Net P2P.
- **Module Sentinelle & Escorte de Combat (`RED ALERT`)** :
  - Déclenchement d'**Alerte Rouge en 1 tap** depuis l'en-tête mobiGlas 4.0 ou classique.
  - Bandeau d'urgence stroboscopique avec sirène sonore, annonce vocale d'urgence (TTS), calcul dynamique du vecteur de saut Quantum d'évacuation (OM ou station la plus proche selon le système stellaire) et bouton `ALL CLEAR`.
  - Curseur de prime de risque d'escorte (0 à 35%) dans la modale d'équipage avec déduction automatique et transparence des gains pour les pilotes de chasseurs d'escorte.

### [1.8.0] - 2026-10-15 - *Jalons 1, 2 & 3 : Réseau Fleet-Net P2P, Atelier Crafting 4.0 & Scanner OCR Instantané*

#### 🚀 Jalons Majeurs Implémentés (Milestones 1, 2 & 3)
- **JALON 1 — Réseau Tactique Décentralisé FLEET-NET (P2P WebRTC & Star-Mesh Relay)** :
  - Connexion multijoueur chiffrée de bout en bout sans serveur central ni base de données externe.
  - Bascule transparente entre P2P WebRTC via Internet et BroadcastChannel local (LAN / double écran).
  - Télémétrie en temps réel de l'escadre : indicateur de latence (Ping RTT en millisecondes), compteur d'équipiers connectés et voyant de communication radio `COMMS` interactif dans l'en-tête mobiGlas 4.0.
- **JALON 2 — Synchronisation des Vaisseaux & Atelier Crafting 4.0** :
  - **Diffusion Automatique des Équipements (`FLEET_SYNC`)** : Toute modification de vaisseau (Prospector, MOLE, Arrastra, Orion, ROC, cargos), de tête laser ou de configuration de tourelles est répercutée instantanément sur les écrans de toute l'escadre.
  - **Atelier de Minage Artisanal (Crafting 4.0)** : Module complet de création et d'enregistrement de têtes laser sur-mesure (Watts bruts, bonus/malus de résistance et d'instabilité, fenêtre optimale, 1 à 3 emplacements de sous-modules) et de gadgets personnalisés, automatiquement diffusés aux coéquipiers.
  - **Calculateur de Flotte Dynamique** : Agrégation en temps réel de la puissance laser combinée en Watts et calcul de la réduction conjointe de résistance rocheuse.
- **JALON 3 — Télémétrie de Scan Partagée & Scanner OCR Instantané** :
  - **Transmission Instantanée du Scan Rocheux (`ROCK_BROADCAST`)** : Dès qu'un rocher est scanné (masse, minerais, résistance, instabilité, archétype géologique), les données sont transmises en `< 150 ms` à l'ensemble de la flotte.
  - **Bandeau d'Alerte & Auto-Sync** : Notification visuelle avec balise pulsante (`#rockBroadcastReceivedBanner`), bouton d'application 1-clic (`⚡ CHARGER`), bascule d'auto-synchronisation silencieuse et annonce vocale radio cockpit réaliste (TTS).
  - **Scanner OCR 100% Local (0.28s)** :
    - *Presse-papier & Fichier* : Glisser-déposer de captures Star Citizen (F12) ou collage direct via `Ctrl+V`.
    - *Caméra Direct* : Flux vidéo pour smartphones et webcams avec réticule de visée tactique.
    - *Échantillons SC 4.0* : 3 préréglages instantanés (Quantainium 32.4%, Bexalite 48%, Taranite 26.5% + Laranite 14.2%) pour démonstration immédiate.
    - *Injection 1-Clic* : Remplissage instantané du calculateur sans saisir aucune donnée manuellement, avec option de diffusion immédiate à la flotte.

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

### [2.2.0] - 2026-10-16 - *Milestone 7: Refining Orders, Guild Stockpile, Treasury & Commodity Cargo Trading*

#### 🚀 Major Milestone Delivered (Milestone 7)
- **Unified Guild Stockpile & Fleet Logistics (`CORPO_STOCK_SYNC`)**:
  - Unified support for both **minerals (raw/refined)** and **general commodities** (Medical Supplies, Laranite, Titanium, Scrap, Distilled Spirits, Maze, Slam, WiDoW, etc.).
  - Real-time collective visibility and synchronization of all stocks across Stanton and Pyro stations and planetary outposts.
  - Sub-150ms lightweight WebRTC DataChannel packet exchange (`CORPO_STOCK_SYNC` and `CORPO_TRADE_SYNC`) connecting all corporation wingmen seamlessly.
  - Multi-criteria instant filtering (by Station, by Mineral/Commodity, and by Logistics Status).
  - Distinctive visual badges (`⛏️ MINERAI` vs `📦 COMMODITY`) displaying unit purchase price, estimated resale value, and gross profit margin.
  - 1-click `📥 Deposit Current Ship Hold to Stockpile` allowing miners to deposit extracted ore for guild logistics, plus `➕ New Stockpile Batch` with category and unit purchase cost inputs.
  - Direct `🚜 Assign to C2/MAX` action transferring refined batches or commodities onto the physical cargo grid of the active hauler (Cargo Grid Master from Milestone 5).
- **Commodity Trade Run Simulator & Cargo Arbitrage (`CORPO_TRADE_SYNC`)**:
  - Dedicated sub-tab 5 **`📈 TRADING & ROUTES CARGO`** in the Guild Operations interface.
  - Commodity catalog organized by category (Medical, Metals, Industrial, Consumables, Illicit / Vice).
  - Quick cargo capacity buttons matching genuine ship holds (Cutlass Black 46 SCU, Freelancer MAX 120 SCU, Taurus 174 SCU, RAFT 192 SCU, Caterpillar 576 SCU, C2 Hercules 696 SCU).
  - High-yield route presets across Stanton & Pyro (e.g., Deakins to Orison, Arial to Area18, Brio's Breaker Yard, Checkmate, etc.).
  - Real-time dynamic calculations of **Capital Required** (aUEC), **Net Run Profit**, **Margin per SCU**, **Return on Investment (ROI %)**, and Piracy Risk Index (*Safe, Moderate, Extreme*).
  - **1-Click Financing from Guild Treasury**: Automatic deduction of the required trade capital as an advance with full audit logging in the expense ledger.
  - **1-Click Deposit to Guild Stockpile**: Direct transfer of the purchased cargo into the collective corporation inventory, broadcasted across Fleet-Net with `CORPO_TRADE_SYNC`.
- **Corporation Treasury & Shared Expense Ledger (*Corpo Treasury & Expense Ledger*)**:
  - Persistent guild treasury vault with deposit/withdrawal actions and real-time fleet synchronization via `CORPO_TREASURY_SYNC`.
  - Centralized tracking of fleet operating expenses: refinery process fees, Quantum & Hydrogen fuel, ship repairs & re-arm, mining modules & consumables, combat escort risk pay, and trading capital advances.
  - Real-time P2P synchronization with `CORPO_EXPENSE_SYNC` packets across Fleet-Net.
  - Automatic calculation of **Projected Guild Net Profit** (Gross Asset Value minus Total Incurred Expenses).
  - 1-click `📋 Export Ledger (Discord)` formatting a rich financial dispatch ready to post in corporation channels.
- **mo.Trader Crew Split Sheet & Corporate Dividend Withholding**:
  - Automated mission payout allocation: corporate guild dividend withholding (0 to 50%), combat escort security bonus, heavy hauler freight commission, and equal net distribution to crew members.
  - 1-click copyable in-game `mo.Trader` wire transfer commands for instant execution inside the mobiGlas app.
- **Cockpit Ergonomics & MFD Decluttering (Discord Voice)**:
  - Removed the Joint Fire Coordinator card (static phase text and radio state sync buttons) which created unnecessary clutter and duplication with real-time natural voice communications on Discord / TeamSpeak.
  - Reclaimed vertical space in the center tactical panel `#panelTacticalAnalysis` to provide uninterrupted, scroll-free visibility for the Optimal Loadout Solver 4.0, Curved Arc Feasibility Gauge, and Sub-chunks Simulator.
- **Streamlined Logistics Status & Native Web Push Notifications**:
  - Purposefully designed to eliminate in-game terminal duplication by focusing strictly on off-game desktop alerts and transport coordination.
  - Live order timers with progress percentage and yield calculations.
  - **Native Desktop & Mobile Web Push Notifications** alerting pilots even when the browser or app is running in the background as soon as a refinery work order is ready for loading (`🔔 Refinery [Station]: Your order of [X] SCU of [Mineral] is ready to load!`).
  - Immersive cockpit TTS audio voice announcement and sound effect.

### [2.1.0] - 2026-10-15 - *Milestone 6: Commodity Exchange, UEX Corp API & Guild Scouts*

#### 🚀 Major Milestone Delivered (Milestone 6)
- **Live UEX Corp API & Offline Cache (`uexcorp.space`)**:
  - Seamless synchronization with UEX Corp public API fetching live buy/sell commodity prices across all TDD terminals and stations in Stanton, Pyro, and Nyx.
  - Robust **offline local cache (`aaron_mfd_uex_cache_v2`)** guaranteeing 100% offline flight readiness with dynamic status badge (🟢 `UEX LIVE`, 🟡 `UEX CACHE`, 🟣 `UEX GUILDE`) and manual `SYNC` button.
- **Economic Arbitrage Engine (Raw vs Refined)**:
  - Real-time cockpit comparison in `#panelMarketHold` between immediate raw sale and all major refining processes (*Dinyx Solventation*, *Ferris Carbide*, *Cormack Method*, *Pyro-Burst*).
  - Accurate deduction of refining fees, station yield bonuses (e.g. +10% Quantainium at ARC-L1), net aUEC payout, delta profit (+/- aUEC), and Return on Investment (ROI %).
  - Dynamic optimal recommendation banner prominently highlighted in `#mktArbitrageBanner`.
- **Optimal Trade Tour Route Calculator (*Best Sales Locations Optimizer*)**:
  - Full-cargo analysis (miner hold or hauler hold) identifying top buying terminals ranked by profit margin and demand rating (High / Medium / Low).
  - Generation of a streamlined **multi-stop sales route** with estimated total aUEC payout and 1-click **`📋 Copy Tour Route`** ready to share in game chat or Discord.
- **Corpo Price Scouts & P2P Crowdsourcing (`CORPO_PRICE_UPDATE`)**:
  - 1-tap price reporting form in the `📡 GUILD SCOUT` tab allowing pilots to confirm spot prices on-site at any TDD terminal.
  - Sub-150ms real-time WebRTC broadcast to all wingmen with verified scout badges (*"Scout [Callsign]"*) and recent activity feed.

### [2.0.0] - 2026-10-15 - *Milestone 5: Specialized Haulers & Freight Logistics (Cargo Refactor 4.0)*

#### 🚀 Major Milestone Delivered (Milestone 5)
- **Authentic 4.0 Cargo Hauler Fleet (Star Citizen 4.0)**:
  - Full support for 10 freight haulers: Drake Cutlass Black (46 SCU), Crusader C1 Spirit (64 SCU), MISC Hull A (64 SCU), MISC Freelancer MAX (120 SCU), RSI Zeus Mk II CL (128 SCU), RSI Constellation Taurus (174 SCU), Argo RAFT (192 SCU), Drake Caterpillar (576 SCU), Crusader C2 Hercules (696 SCU), MISC Hull C (4,608 SCU).
  - Dedicated tractor beam ratings S1/S2/S3 (6,000 to 45,000 N), physicalized grid topologies (internal, external, modular, spindle), and live max saddlebag capacity calculations for Prospector (8 SCU) and MOLE (12 SCU) containers.
- **In-Space Ship-to-Ship Cargo Transfer via FLEET-NET**:
  - Miner 1-click action **`📡 REQUEST CARGO PICKUP`** within the saddlebag control card (`#saddlebagsControlBox`) broadcasting floating pods to wing haulers.
  - In-space retrieval via tractor beam (**`🧲 TRACTOR BEAM DOCK`**), instantly snapping containers to the hauler's physicalized grid and clearing miner hold capacity without returning to station.
- **Physicalized Cargo Grid Master**:
  - Interactive cockpit card `#cargoGridMasterCard`: hauler selector, visual box grid with ore badges, Quantainium instability warning, live raw and refined valuation, and station terminal cargo dump.
- **Dedicated Hauler Commission Cut**:
  - Freight hauler cut slider (0 to 35%) integrated into the crew split calculator (`#crewModal`), ensuring transparent compensation for heavy transport pilots.

### [1.9.0] - 2026-10-15 - *Milestone 4: Tactical Coordination, Optimal Loadout Solver 4.0 & Combat Escort*

#### 🚀 Major Milestone Delivered (Milestone 4)
- **Advanced Optimal Loadout Solver 4.0**:
  - Predictive algorithmic solver evaluating rock mass, resistance, and instability against all mining heads (Lancet, Helix, Arbor, Impact, Klein, crafted gear), sub-modules (Focus III, Surge, Brandt, Rieger-C3), and gadgets (Sabir 21, BoreMax, Stalwart).
  - Dual modes: **Solo Recommendation** and **Squad / Multi-Crew Requirement**.
  - **1-Click `⚡ EQUIP THIS LOADOUT`** button: instantaneously mounts optimal laser head, sub-modules, and gadget with automated recalculation and synchronous `FLEET_SYNC` wing broadcast.
- **Joint Fire Coordinator & Tactical Stepped Sequencing**:
  - 3-phase stepped beam protocols: Phase 1 (Lancet/Sabir resistance softening < 20%), Phase 2 (Helix thermal saturation), Phase 3 (Green zone regulation 45-50%).
  - Real-time cumulative overcharge and thermal explosion risk gauge (`#overchargeRiskVal` & `#overchargeRiskFill`).
  - Radio fire status sync buttons (`STANDBY`, `CHARGING`, `GREEN ZONE`, `OVERHEAT RISK`) broadcasted across Fleet-Net P2P.
- **Sentinel & Combat Escort Module (`RED ALERT`)**:
  - **1-Tap Red Alert** trigger located in mobiGlas 4.0 and classic cockpit headers.
  - Urgent strobing warning banner with acoustic alarm siren, emergency cockpit voice callout (TTS), calculated emergency quantum jump escape vector (closest OM beacon / station based on star system), and `ALL CLEAR` stand-down button.
  - Escort combat risk cut slider (0 to 35%) in the crew modal with net payout deductions clearly displayed for security fighter pilots.

### [1.8.0] - 2026-10-15 - *Milestones 1, 2 & 3: Fleet-Net P2P Network, Crafting 4.0 & Instant OCR Scanner*

#### 🚀 Major Milestones Delivered (Milestones 1, 2 & 3)
- **MILESTONE 1 — Decentralized Tactical Network FLEET-NET (P2P WebRTC & Star-Mesh Relay)**:
  - End-to-end encrypted multiplayer telemetry without any centralized database or external server.
  - Seamless dual-mode failover between Internet WebRTC P2P and local zero-latency BroadcastChannel (LAN / dual screen).
  - Live wing telemetry: round-trip latency indicator (Ping RTT in ms), online wingmen count, and interactive `COMMS` status indicator in the mobiGlas 4.0 system bar.
- **MILESTONE 2 — Ship & Turret Sync & Crafting Workshop 4.0**:
  - **Automatic Loadout Synchronization (`FLEET_SYNC`)**: Any modification to ship selection (Prospector, MOLE, Arrastra, Orion, ROC, cargo haulers), mining head, or active turrets is propagated instantly to all wingmen.
  - **Crafted & Custom Mining Head Workshop (Crafting 4.0)**: Dedicated builder for crafting custom mining heads (base Watts, resistance & instability multipliers, optimal window modifier, 1 to 3 sub-module slots) and custom gadgets with local storage and instant P2P wing synchronization.
  - **Dynamic Fleet Laser Aggregator**: Real-time aggregation of cumulative laser fracture wattage and joint rock resistance reduction.
- **MILESTONE 3 — Shared Scan Telemetry & Instant OCR Scanner**:
  - **Instant Rock Scan Broadcast (`ROCK_BROADCAST`)**: As soon as a rock is scanned (mass, composition, resistance, instability, archetype), telemetry is transmitted to all connected MFDs in `< 150 ms`.
  - **Alert Banner & Auto-Sync**: High-visibility incoming alert banner with pulsing beacon (`#rockBroadcastReceivedBanner`), 1-click apply button (`⚡ LOAD`), silent auto-sync toggle, and cockpit radio speech synthesis (TTS).
  - **100% Local Instant OCR Scanner (0.28s)**:
    - *Clipboard & File*: Drag & drop Star Citizen screenshots (F12) or paste directly via `Ctrl+V`.
    - *Live Camera*: Direct camera stream with tactical HUD reticle for smartphones and webcams.
    - *SC 4.0 Test Samples*: 3 one-click presets (Quantainium 32.4%, Bexalite 48%, Taranite 26.5% + Laranite 14.2%) for instant testing.
    - *One-Click Calculator Injection*: Injects all extracted data directly into the calculator without manual typing, with optional auto-broadcast to fleet.

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
