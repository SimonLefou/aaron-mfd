# 🚀 AARON MFD - Journal des Versions & Notes de Patch / Release Notes

[🇫🇷 Version Française](#-journal-des-versions-français) | [🇬🇧 English Version](#-release-notes--changelog-english)

---

## 🇫🇷 Journal des Versions (Français)

Ce document répertorie l'ensemble des ajouts, améliorations ergonomiques et correctifs apportés à **AARON MFD** (Stanton Tactical Mining OS).
### [3.0.0] - 2026-10-17 - *Salvage & Recyclage Industriel 4.0 & Starmap Vectoriel Aaron Halo*

#### 🔨 Module Salvage & Recyclage de Coques (`data/game/salvage.js`, `modules/salvage/`, `#viewSalvage`)
- **Prise en charge officielle des vaisseaux de recyclage** : Intégration du **Drake Vulture** (solo, 12 SCU tampon de broyage, 13 SCU grille physique), de l'**Aegis Reclaimer** (plateforme industrielle lourde 240+ SCU avec griffe colossale de démantèlement) et de l'**Argo SRV** (remorqueur utilitaire à rayon tracteur lourd S3).
- **Catalogue complet des épaves & rentabilité** : Profils réalistes SC 4.0 pour MISC Prospector, Drake Cutlass Black, Crusader C1 Spirit, RSI Constellation Andromeda, Crusader C2 Hercules et Aegis Hammerhead (rendements RMC et Construction Materials, durées estimées et loot de composants).
- **Simulateur de Tampon de Broyage (Buffer)** : Suivi en direct du remplissage du broyeur avec seuils d'alerte visuelle (alerte à 90%, blocage critique à 100%) et bouton d'éjection physique vers la grille de soute.
- **Arbitrage Stratégique Salvage** :
  - `[ 🛠️ Réserver pour Craft ]` : Injection du RMC dans l'inventaire joueur avec tag de réservation craft pour la forge de plaques de blindage et réparations de coque.
  - `[ 💰 Vendre RMC (TDD) ]` : Revente directe instantanée au comptoir TDD (Area18, New Babbage, Orison, Lorville) au cours du marché avec crédit immédiat au solde aUEC.
  - `[ 🏗️ Vendre Matériaux de Construction ]` : Liquidation des volumes de fracturation structurelle (CM).

#### 🗺️ Cartographie Spatiale & Dropper Aaron Halo (`modules/starmap/`, `#viewStarmap`)
- **Radar Orbital 2D Vectoriel Canvas à 60 FPS** :
  - Modélisation graphique des systèmes **Stanton** et **Pyro** (SC 4.0) avec Soleil, planètes majeures, orbites concentriques et points de saut inter-systèmes.
  - **Visualisation de l'anneau de l'Aaron Halo** : Représentation d'une ceinture toroïdale de plus de 200 particules d'astéroïdes en rotation orbitale, avec mise en surbrillance dorée de la **Bande 5** ultra-dense.
  - Commandes interactives de zoom (+, -, réinitialisation) et panoramique tactile/souris fluide.
- **Calculateur de Coupure Quantum Drive (100% Visuel & Silencieux)** :
  - Prise en charge des 10 sous-bandes géométriques d'Aaron Halo et des routes majeures (ArcCorp ➔ HUR-L3, HUR-L3 ➔ ArcCorp, CRU-L1 ➔ ArcCorp, etc.).
  - Calcul de la distance kilométrique exacte de coupure ($13\,600\,000\text{ km}$ pour la Bande 5) tenant compte de la vitesse de croisière du Quantum Drive équipé (Atlas S1, VK-00, XL-1, Crossfield, TS-2...).
  - **Guidage 100% visuel sans son** : Jauge de progression dynamique, alertes visuelles d'approche progressive et bandeau holographique flash à fort contraste `[ 🛑 COUPEZ LE QUANTUM DRIVE MAINTENANT ! (TOUCHE B) ]`.
#### 🧹 Nettoyage Intégral des Données par Défaut & Démos (Clean Slate)
- **Démarrage vierge sans escadre par défaut (`#viewFleets`)** : Un nouveau joueur ne commence plus rattaché à une escadre pré-générée (`coopService.hasActiveSession() === false`). Affichage d'un état d'accueil vierge (`#fleetEmptyStateContainer`) avec choix immédiat entre créer sa propre escadre, rejoindre un salon P2P ou charger un modèle d'entraînement.
- **Suppression intégrale des joueurs et pseudos démo** : Retrait définitif de `Nico_Claey`, `RockHound`, `Vex`, `Aura-7`, `CargoKing` et `Talon` au profit du profil réel du joueur connecté et de désignations opérationnelles neutres (*Pilote Leader*, *Ailier Foreur*, *Tourelle Centre*...).
- **Clôture et Dissolution Instantanée d'Escadre (`btnCloseLiveSession`)** :
  - Cliquer sur « Clôturer & Virement mo.Trader » dissout immédiatement l'escadre (`coopService.closeSession()`), stoppe le chronomètre et réinitialise l'affichage vers l'état d'accueil vierge sans laisser d'escadre fantôme.
  - Ouverture automatique du volet récapitulatif mo.Trader détaillant la recette brute, les déductions/taxes et l'ensemble des commandes `/pay <Callsign> <Montant>` prêtes à coller en jeu avec copie en un clic.
  - Sécurisation contre les valeurs nulles sur toutes les fonctions de calcul financier, de tirs synchronisés et de gestion d'équipage.
- **Correction Critique Création & Persistance d'Escadre** :
  - Exposition complète des méthodes déléguées sur la façade `coopService` (`createSession()`, `hasActiveSession()`, `closeSession()`), éliminant l'erreur bloquante de création.
  - Correction de l'erreur d'horodatage dans le journal d'activité (`addLog`).
  - Persistance dans `localStorage` (`aaron_fleet_session_v1`) pour conserver l'escadre active entre les rechargements, tout en maintenant le démarrage vierge pour les nouveaux pilotes.
  - Ajout du bouton d'en-tête « 🚀 Nouvelle escadre » (`#btnHeaderCreateFleet`) et synchronisation instantanée des lasers de fracture synchronisée.
- **Suppression du jeu de données démo automatique** : Suppression définitive de la liste de 300 lignes `sampleItems` (16 articles injectés) et désactivation des appels automatiques `seedInitialInventory()`.
- **Inventaire vierge par défaut** : L'inventaire unifié démarre désormais à 0 SCU / 0 article, permettant aux utilisateurs d'alimenter leur stock via le minage réel, le recyclage, le commerce ou l'import OCR.
- **Remise à zéro des stocks et dépenses de guilde** : `DEFAULT_GUILD_STOCKPILE` et `DEFAULT_GUILD_EXPENSES` initialisés à des tableaux vides `[]`.
- **Blueprints & Crafting dynamiques** : Suppression du déblocage forcé des 6 premiers schémas ; la possession dépend désormais uniquement des schémas réellement débloqués par le joueur, et le stock de craft est synchronisé en temps réel avec l'inventaire effectif.
- **Tableau de bord & Vues nettoyées** : Suppression des libellés *"données d'exemple"*, réinitialisation des métriques KPI à zéro et affichage d'états vides professionnels avec invitations à l'action.
- **Purge automatique du stockage local** : Nettoyage proactif au démarrage (`initApp`) des éventuels éléments d'exemples mis en cache lors des sessions antérieures.

### [2.9.0] - 2026-10-17 - *Arbitrage Stratégique des Minerais : Qualité des Matériaux, Craft & Vente Brute / Raffinée (Star Citizen 4.0)*

#### 💎 Arbitrage Économique par Qualité des Matériaux (`modules/mining/`, `modules/inventory/`, `index.html`)
- **Évaluation Stratégique Automatique selon la Qualité (Q0 à Q1000)** :
  - **Matériaux Exceptionnels (Q ≥ 750 / Q900+ Maître-Ouvrier)** : Recommandation prioritaire de **GARDER POUR LE CRAFT** (`intendedUse: 'craft'`). Explication détaillée du potentiel d'overclocking (+15% à +45% de bonus aux statistiques des têtes laser, boucliers et modules de minage forgés en atelier).
  - **Matériaux Standards (Q400 à Q749)** : Recommandation d'arbitrage **RAFFINER & VENDRE** pour maximiser le gain net en aUEC, ou **GARDER** si besoin de pièces de grade militaire.
  - **Matériaux Dégradés / Rebut (Q < 400)** : Recommandation de **VENTE BRUTE IMMÉDIATE** au comptoir sans frais ni délai de raffinage.
- **Actions Directes dans le Calculateur de Minage (`#viewMining`)** :
  - Nouveau bloc d'action stratégique avec 3 cartes interactives :
    - `[ 🛠️ Garder pour Craft ]` : Extrait et stocke immédiatement le lot dans l'inventaire personnel (verrouillé pour l'atelier de craft).
    - `[ 💰 Vendre Brut ]` : Vente directe instantanée sans raffinage créditant le solde aUEC du joueur en temps réel.
    - `[ 🏭 Raffiner & Vendre ]` : Crée l'ordre de raffinage optimal (Dinyx Solvent à CRU-L1) et incrémente le suivi du tableau de bord.
  - Nouveau sélecteur et curseur de **Qualité du Gisement** (Q0-Q1000) dans le scanner avec presets rapides (Q350 Rebut, Q500 Standard, Q780 Haute, Q950 Maître) et dé aléatoire réaliste SC 4.0.
- **Gestion Avancée des Minerais dans l'Inventaire (`#viewInventory`)** :
  - **Badges de Qualité Dédiés** : Affichage systématique du grade (`⭐ Q880 Haute Qualité`, `⭐ Q920 Maître`, etc.) sur chaque lot de minerai brut et raffiné.
  - **Bouton d'Usage Stratégique Interactif** : Pastille cliquable `[ 🛠️ Réservé Craft ]` / `[ 💰 Vente Brute ]` / `[ 💎 Vente Raffinée ]` permettant de basculer la destination du lot en un clic.
  - **Actions Opérationnelles par Ligne** :
    - Bouton `[ 🛠️ Craft / 🔓 Vente ]` : Verrouille le lot contre la vente accidentelle.
    - Bouton `[ 💰 Vendre ]` : Vente brute immédiate au cours de commodité avec multiplicateur de qualité.
    - Bouton `[ 🏭 Raffiner ]` : Envoi en raffinerie Dinyx avec calcul automatique du rendement et déduction des frais.
    - Bouton `[ 💎 Vendre ]` : Vente au cours raffiné officiel.
  - **Filtre Multicritères par Destination** : Sélecteur d'usage (Tous / Réservé Craft / À Vendre Brut / À Vendre Raffiné / Haute Qualité Q750+).

### [2.8.0] - 2026-10-17 - *Intégration Complète des Fleets & Opérations Multi-Crew (Star Citizen 4.0)*

#### 🚀 Centre d'Opérations d'Escadre & Coordination Multi-Joueurs (`#viewFleets`, `modules/coop/`)
- **Prise en Charge Intégrale des Deux Modes de Jeu Coopératifs** :
  - **1. Multi-Crew à Bord d'un Même Vaisseau (ARGO MOLE, Orion, Arrastra)** :
    - Découpage par postes opérationnels individuels : *Pilote / Chef de bord*, *Tourelle Laser Centre*, *Tourelles Lasers Latérales Bâbord/Tribord*, *Opérateur Scanner & Gadgets*, *Opérateur Rayon Tracteur & Pods*.
    - Visualisation des callsigns de chaque joueur, statut en ligne, laser minier équipé (Watts S1/S2, réduction de résistance Lancet) et pourcentage de rémunération assigné.
    - Ajout rapide et réassignation interactive des postes d'équipage à la volée.
  - **2. Escadre Mixte Multi-Vaisseaux (Wing Operations)** :
    - Coordination de flottes hétérogènes : vaisseaux de minage lourds multi-crew (MOLE), mineurs solos agiles (MISC Prospector), transporteurs de fret et ramasseurs de sacs/saddlebags 32 SCU (Crusader C2 Hercules, Constellation Taurus) et chasseurs d'escorte armée / patrouille (Aegis Gladius).
    - Métriques d'escadre consolidées en temps réel : capacité totale de soute (SCU), puissance laser combinée (MW), effectif global et niveau de sécurité.
- **Simulateur de Tir Synchronisé & Physique de Fracture Conjointe (`#fleetSubViewJointFire`)** :
  - Sélection individuelle des têtes laser actives pointées simultanément sur le rocher.
  - Calcul physique de la réduction de résistance cumulée (modèle non-linéaire Star Citizen 4.0 pour lasers Lancet & Hofstede).
  - Évaluation dynamique du franchissement du seuil d'énergie en Watts par rapport à la masse et à la résistance effective de l'astéroïde.
  - Jauge HUD temps réel de transfert d'énergie avec alerte de surchauffe/surcharge (>180% de puissance) et verdict immédiat avec estimation du temps jusqu'à rupture.
- **Répartition Financière & Générateur Automatique mo.Trader (`#fleetSubViewPayouts`)** :
  - Calculateur financier complet déduisant automatiquement les frais de carburant/réparation, la caisse de réserve de flotte et la taxe de guilde.
  - Modes de rémunération commutables : **Pondéré par Rôle / Poste** ou **Parts Égales** entre tous les participants.
  - Générateur automatique de commandes officielles in-game pour le mobiGlas : `/pay <Callsign> <Montant>` avec bouton de copie en un clic pour payer tout l'équipage en quelques secondes sans erreur.
- **Liaison Multijoueur P2P Temps Réel (WebRTC & BroadcastChannel)** :
  - Intégration complète du moteur hybride [`AaronFleetNet`](file:///g:/Star%20Citizen%20Mining/fleet-net.js) avec [peerjs.min.js](file:///g:/Star%20Citizen%20Mining/peerjs.min.js) et serveurs STUN Google (`stun:stun.l.google.com:19302`).
  - **Barre d'état réseau en direct** (`#fleetNetBar`) dans `#viewFleets` et pastille cliquable dans la topbar (`#topbarFleetBadge`) affichant le statut en ligne (`HÔTE`, `AILIER`, `SOLO`), le code de salon, le nombre d'ailiers et le ping en ms.
  - **Modal de liaison d'escadre** (`#modalWingNet`) pour créer ou rejoindre une escadre avec un code (ex: `WING-4982`) ou lien d'invitation URL direct (`?fleet=WING-XXXX`).
  - **Synchronisation en direct du tir des lasers** : l'activation d'une tourelle sur l'écran d'un joueur allume instantanément sa jauge chez tous les autres coéquipiers connectés et recalcule le verdict de fracture.
  - **Synchronisation bidirectionnelle du journal de bord et des scans** : les alertes, détections de minerais et événements sont propagés en temps réel entre tous les postes.

### [2.7.0] - 2026-10-17 - *Taxonomie Complète des Catégories de Craft & Blueprints (1 660 Schémas Industriels)*

#### 🛠️ Classification Industrielle Star Citizen 4.0 & Ergonomie de l'Atelier (`#viewCrafting`)
- **16 Catégories Industrielles Normalisées (Couverture 100% des 1 660 schémas)** :
  - `⛏️ Tête de minage` (19) : lasers S1 & S2 (Lancet, Helix, Hofstede, Klein, Arbor, Impact).
  - `⚡ Module de minage` (18) : modules passifs et actifs (Surge, Stampede, Focus, Brandt, Torpid, Lifeline, Rieger-C3).
  - `🧲 Gadget de minage` (4) : dispositifs déployables sur rocher (Sabir, Waverider, Optimax, Boreas).
  - `🎒 Sacs & Conteneurs SCU` (10) : sacs miniers détachables Prospector (32 SCU), MOLE (96 SCU) et pods cargo.
  - `♻️ Tête de recyclage` (4) : outils de raclage de coque et désossage (Abrade 1, Trawler).
  - `🛡️ Bouclier vaisseau` (13) : générateurs de bouclier (FR-66, FR-76, FR-86, Sukoran, Rampart, Palisade, 5SA/6SA/7SA).
  - `🌌 Moteur quantique` (14) : propulseurs de saut (Atlas, Crossfield, Voyage, Siren, Beacon, Colossus, Pontes).
  - `🔋 Générateur d’énergie` (12) : centrales électriques (JS-300, JS-400, Quadracell, DayBreak, SuperNova).
  - `❄️ Refroidisseur vaisseau` (7) : dissipateurs thermiques (UltraFlow, Glacier, IceFlush, Zero-G, Avalanche).
  - `🚀 Arme vaisseau` (90) : canons laser, répéteurs balistiques et tourelles de bord (Omnisky, CF-series, Mantis, Deadbolt, Rhino).
  - `🔫 Arme FPS` (175) : fusils d’assaut, snipers, SMG et pistolets (Gemini C54, Behring P6-LR, FS-9 LMG, P4-AR, Custodian, Karna).
  - `🔧 Outil & Rayon tracteur` (14) : Multi-Tool Pyro RYT, fusils tracteurs MaxLift S2 et embouts de découpe.
  - `🦺 Armure & Combinaison` (902) : combinaisons environnementales (Novikov, Morozov) et armures lourdes/moyennes/légères ADP.
  - `💊 Munitions & Consommables` (27) : chargeurs balistiques, cartouches énergétiques, MedPens et filtres de survie.
  - `⚙️ Composant vaisseau` (310) : pièces détachées, servomoteurs et modules aéronavals divers.
  - `📦 Équipement & Accessoire` (41) : optiques, scanners et modules utilitaires.
- **Sélecteur de Catégories Ergonomique (`<select id="craftCategorySelect">`)** :
  - Menu déroulant structuré en 4 optgroups clairs (*Minage & Recyclage*, *Composants Vaisseau*, *Armement & Combat*, *Équipement Personnel*) avec emojis et décomptes précis.
  - Interface compacte et épurée sans barre de défilement redondante, maintenant une visibilité maximale sur le tableau de résultats.
- **Moteur d'Auto-Résolution `resolveBlueprintCategory()` & `BLUEPRINT_CATEGORIES`** :
  - Heuristiques de catégorisation robustes dans [`modules/crafting/crafting-service.js`](file:///g:/Star%20Citizen%20Mining/modules/crafting/crafting-service.js) et export centralisé dans [`modules/index.js`](file:///g:/Star%20Citizen%20Mining/modules/index.js).
  - Sous-titre dynamique du catalogue affichant en temps réel le décompte filtré et le libellé de catégorie actif.

### [2.6.0] - 2026-10-17 - *Qualité des Matériaux & Surcadençage des Équipements Craftés (Star Citizen 4.0+)*

#### 🧪 Qualité des Matériaux & Moteur de Surcadençage (`modules/crafting/`, `modules/inventory/`)
- **Échelle Officielle de Qualité des Matériaux (0 à 1 000)** :
  - Implémentation du système complet de craft de Star Citizen 4.0 avec 5 paliers officiels :
    - `0 – 399` : **Rebut / Basse Qualité** (`quality-low`, malus stats jusqu'à -25%, décote commerciale).
    - `400 – 599` : **Standard Usine** (`quality-standard`, spécifications de base du commerce retail, ±5%).
    - `600 – 749` : **Supérieur / Militaire** (`quality-enhanced`, bonus +5% à +15%).
    - `750 – 899` : **Haute Qualité Industrielle** (`quality-high`, bonus +15% à +28%, surcote ×1.95).
    - `900 – 1 000` : **⭐ Maître-Ouvrier / Prototype** (`quality-masterwork`, surcadençage +28% à +45%, surcote ×3.2 à ×4.0).
- **Moteur de Qualité Composite Pondérée (`calculateCompositeQuality`)** :
  - Calcul dynamique de la qualité résultante de l'objet en fonction du volume (SCU/unités) et de la note de qualité de chaque ingrédient injecté :
    $$Q_{\text{composite}} = \frac{\sum (Q_i \times W_i)}{\sum W_i}$$
- **Scaling Statistique Dynamique (`calculateCraftedStats`)** :
  - *Têtes de Minage (Mining Lasers)* : Scaling proportionnel de la puissance effective (Watts, jusqu'à +28%), de l'annulation de résistance rocheuse (jusqu'à +35%) et de la fenêtre optimale de zone verte (jusqu'à +40%).
  - *Modules & Gadgets de Minage* : Renforcement de l'atténuation d'instabilité, boost d'extraction SCU/s et charges supplémentaires à Q900+.
  - *Armes & Équipements de Vaisseau* : Augmentation du DPS alpha, dissipation thermique accélérée et portée effective accrue.
- **Atelier de Craft Interactif & Prévisualisation Temps Réel (`#viewCrafting`)** :
  - Curseurs (sliders) de qualité individuels pour chaque matériau avec 4 presets instantanés : `[Rebut Q250]`, `[Standard Q500]`, `[Militaire Q750]`, `[⭐ Maître Q950]`.
  - Jauge HUD de qualité composite avec barre de progression néon colorée selon le palier.
  - Grille comparative dynamique des performances : *Spécifications usine de base vs Équipement artisanal surcadencé* avec pastilles de deltas verts (`+XX%`).
  - Déduction automatique des ressources et persistance dans l'inventaire avec badges de qualité et stats détaillées.
- **Valorisation Marchande & Marché de Guilde (`modules/inventory/`, `#viewGuild`)** :
  - Facteur d'évaluation économique basé sur la qualité : les équipements *Maître-Ouvrier (Q900+)* voient leur valeur marchande démultipliée (jusqu'à 3.5× la cotation catalogue).
  - Affichage des badges de qualité et des bonus statistiques sur les cartes d'inventaire et les offres de vente de la Bourse Inter-Guilde.

### [2.5.0] - 2026-10-17 - *Inventaire d'Équipements, Traçabilité de Provenance (Acheté / Looté / Crafté), Cotation & Bourse de Commerce Inter-Guilde*

#### 📦 Inventaire d'Équipements & Provenance (`modules/inventory/`)
- **Modèle de Données Enrichi (`createInventoryItem`)** :
  - Support natif des 3 origines : **🛒 Acheté** (boutiques/terminaux in-game), **🏴‍☠️ Trouvé / Looté** (épaves spatiales, caisses de bunker, Ruin Station), et **🛠 Crafté** (fabricator et ateliers spécialisés).
  - Traçabilité de l'état/santé de l'objet (`conditionPct`), n° de série et callsign du propriétaire.
- **Autocomplétion Connectée FleetYards (7 966 Références)** :
  - Modal moderne d'inventorisation (`#equipmentInventoryModal`) avec recherche instantanée client-side sur 3 310 composants de vaisseaux et 4 656 équipements FPS (armures, armes, combinaisons, gadgets de minage).
  - Remplissage automatique du type, de la taille, du grade et du cours catalogue officiel FleetYards.
- **Cotation & Vente Personnalisée** :
  - Prix de vente fixé librement par le joueur en **aUEC**.
  - Champ de **proposition de troc** (ex: *« Échange contre 8 SCU Quantainium raffiné ou RMC »*).
  - Portée de diffusion paramétrable : **🌐 Commerce Inter-Guilde** vs **🏛 Interne Guilde uniquement**.
  - Filtres d'inventaire dynamiques : par lieu spatial, par provenance et bascule rapide *« Tous / 🏷️ En vente uniquement »*.

#### 🏪 Bourse de Guilde & Manifeste de Commerce Inter-Guilde (`modules/guild/`)
- **Nouveau Sous-Onglet Dédié dans la Vue Guilde** :
  - Ajout de l'onglet **`🏪 Bourse & Marché`** consolidant toutes les offres de vente des membres de l'organisation.
  - Deck KPI du marché : Nombre de lots en vente, valeur cotée totale, lots exportables et propositions avec troc.
  - Fiches d'offres complètes : prix en aUEC, provenance, lieu physique, indicatif vendeur (`@Callsign`), encart de troc et bouton direct **« Réserver »**.
- **Générateur de Manifeste Inter-Guilde 1-Clic** :
  - Bouton `📋 Exporter le Manifeste Inter-Guilde` produisant un catalogue formaté en Markdown prêt à l'emploi.
  - Regroupement automatique par catégories (Composants vaisseaux, Lasers minage, Armes FPS, Armures) avec mention des prix, du troc et des contacts.
  - Bouton de copie directe dans le presse-papier avec notification toast pour diffusion sur **Discord** ou **Spectrum**.
- **Passerelle Commerce (`viewTrade`)** :
  - Raccourci d'accès direct vers la bourse corporative depuis l'écran Commerce.

### [2.4.2] - 2026-10-16 - *Architecture Modulaire & Découplage Complet des Données (Modular Data Layer)*

#### 📊 Découplage Architectural des Données (`/data/`)
- **Création du Répertoire Dédié `/data/`** :
  - Séparation stricte et élégante entre le code logique/applicatif (`app.js`, `fleet-net.js`, `i18n.js`) et les données de référence du jeu Star Citizen ainsi que les configurations d'usine.
  - **Sous-dossier `data/game/` (Données de Référence Star Citizen)** :
    - `ships.js` : Spécifications des vaisseaux de minage et de transport/support (soutes SCU, hardpoints, fabricant).
    - `lasers.js` : Têtes laser de minage S0, S1, S2 (Watts, résistance, instabilité, portée).
    - `modules.js` : Sous-modules passifs et actifs.
    - `gadgets.js` : Gadgets de surface déployables.
    - `components.js` : Composants internes (Quantum Drives, Boucliers, Générateurs, Refroidisseurs).
    - `minerals.js` : Minerais bruts et raffinés, densités, volatilités et cours de base.
    - `refining.js` : Procédés de raffinage (Dinyx, Cormack...) et stations avec bonus/malus.
    - `locations.js` : Coordonnées des bandes de l'Aaron Halo, hotspots planétaires et archétypes de roches.
    - `trade.js` : Terminaux marchands, configuration UEXcorp, commodités générales et routes types.
  - **Sous-dossier `data/defaults/` (Configurations & Presets d'Usine)** :
    - `factory-loadouts.js` : Presets d'usine d'armement minier (`FACTORY_LOADOUT_PRESETS`).
    - `guild-defaults.js` : Stocks types (`DEFAULT_GUILD_STOCKPILE`), dépenses types (`DEFAULT_GUILD_EXPENSES`) et matrice de sécurité RBAC (`GUILD_ROLE_PERMISSIONS`).
    - `changelog.js` : Historique complet bilingue des versions (`CHANGELOG_DATA`).
- **Allègement Majeur de `app.js` (-638 lignes de données brutes)** :
  - `app.js` est nettoyé de toutes ses constantes de données statiques en dur, se concentrant exclusivement sur l'état dynamique, la réactivité DOM et la télémétrie réseau.
- **Façade Unifiée & Rétrocompatibilité Totale (`data/index.js` & `mining-data.js`)** :
  - `data/index.js` centralise et ré-assemble l'exact même objet `MINING_DATA` pour garantir 100% de rétrocompatibilité.
  - `mining-data.js` agit comme passerelle transparente (`export * from './data/index.js'`), préservant tous les imports et tests existants sans aucune régression.
- **Support PWA Hors-Ligne (`sw.js`)** :
  - Tous les fichiers du dossier `/data/` sont automatiquement intégrés au cache du Service Worker pour une autonomie complète sans connexion réseau.

### [2.4.1] - 2026-10-16 - *Gestion de "Ma Flotte" (Hangar Personnel Multi-Vaisseaux, Sélecteur ASOP & Configuration par Vaisseau)*

#### 🚀 Hangar Personnel & Gestion de "Ma Flotte" (`#paneMyFleetHangar`)
- **Gestion Multi-Vaisseaux Complète pour le Joueur** :
  - L'onglet principal devient **MA FLOTTE** (`#btnWorkflowShip`), regroupant la gestion de tous les vaisseaux possédés par le joueur dans son Hangar Personnel.
  - **Sous-Navigation Intuitive à Deux Volets** :
    - 🚀 **Hangar Personnel (Ma Flotte)** : Vue d'ensemble de la flotte avec métriques KPI, filtres rapides par métier, recherche instantanée et grille de fiches ASOP.
    - ⚙️ **Systèmes & Fit du Vaisseau (Mon Vaisseau)** : Fenêtre détaillée de configuration (laser, sous-modules, composants internes QD/Boucliers/Énergie/Refroidisseurs, télémétrie) s'ouvrant automatiquement dès la sélection d'un vaisseau.
- **Grille de Cartes ASOP Interactives (`#myFleetCardsGrid`)** :
  - Affichage de chaque vaisseau possédé avec son avatar métier, nom personnalisé, modèle, fabricant, port d'attache, capacité de soute SCU, spécifications du Quantum Drive et des boucliers.
  - Badge distinctif lumineux `★ COMMANDES ACTIVES` identifiant immédiatement le vaisseau actuellement aux commandes.
  - **Prise de Commandes 1-Clic (`🚀 Prendre les commandes`)** : Permet de désigner n'importe quel vaisseau de son hangar comme vaisseau actif, synchronisant instantanément l'ensemble des solveurs de bord (minage, soute cargo, trading, diffusion P2P).
  - **Bouton Configurer (`⚙️ Configurer Systèmes`)** : Ouvre instantanément la fenêtre détaillée des systèmes de bord pour ce vaisseau.
  - **Retirer du Hangar (`🗑️`)** : Permet de retirer un vaisseau de sa flotte avec confirmation de sécurité (protection conservant au moins un vaisseau).
- **Deck de Télémétrie KPI & Filtres Rapides** :
  - KPI dynamiques calculant le nombre total de vaisseaux, la capacité de fret cumulée en SCU et le vaisseau actuellement en service.
  - Puces de filtrage 1-clic : *Tous*, *Minage*, *Fret*, *Salvage*, *Combat*.
  - Barre de recherche textuelle temps réel filtrant par nom de baptême, châssis ou station.
- **Ajout de Vaisseau au Hangar (`#addPersonalShipModal`)** :
  - Modal d'enregistrement permettant d'ajouter n'importe quel vaisseau jouable parmi le catalogue Star Citizen (Prospector, MOLE, C2, Taurus, Vulture, Scorpius, etc.), avec attribution d'un nom de baptême et sélection du port d'attache (Stanton & Pyro).
- **Barre d'Outils Ergonomique dans la Fenêtre de Configuration** :
  - Bouton retour `◀ Retour au Hangar (Ma Flotte)`.
  - Sélecteur déroulant rapide de changement de vaisseau (`#myFleetQuickSwitchSelect`).
  - Bouton dynamique `🚀 PRENDRE LES COMMANDES (ACTIF)` / `✅ VAISSEAU ACTIF (EN SERVICE)`.
- **Édition Directe du Nom de Baptême In-Place** :
  - Suppression du champ de saisie déporté dans les paramètres.
  - Le joueur clique directement sur le nom du vaisseau dans l'en-tête de la fiche de bord pour le renommer (avec icône crayon ✎, validation touche Entrée, désélection auto-save et synchronisation immédiate), en conservant fidèlement le style typographique HUD CIG (`.ship-hero-name`).

### [2.4.0] - 2026-10-16 - *Onglet Clé de Voûte "Mon Vaisseau" (Source Unique de Vérité, Composants Internes & Télémétrie Flotte P2P)*

#### 🚀 Onglet Clé de Voûte "Mon Vaisseau" (`#viewMyShipHub`)
- **Single Source of Truth (Source Unique de Vérité)** :
  - Ajout d'un nouvel onglet de premier niveau dans la barre maîtresse (`#btnWorkflowShip` : **🚀 MON VAISSEAU**).
  - Définition centrale du vaisseau actif, de son équipement de rôle et de ses **composants internes authentiques** (Quantum Drive, Boucliers, Génératrice, Refroidisseurs).
  - **Répercussion Automatique et Bidirectionnelle** :
    - Dans la boucle d'extraction : synchronise la puissance du laser de minage, les sous-modules, le gadget et la capacité des poches (32 SCU standard vs 48 SCU poches MOLE).
    - Dans la boucle de raffinage : synchronise la soute de transport pour l'évacuation des commandes finies.
    - Dans la boucle de commerce : synchronise automatiquement la capacité d'emport en SCU pour le calcul de rentabilité d'achat/revente.
    - Dans la Flotte & Roster de Guilde : répercute instantanément le modèle, l'indicatif personnalisé, la localisation et le statut du joueur.
- **Bibliothèque Authentique de Composants Internes Star Citizen** :
  - **Moteurs Quantiques (QD)** : S1 (Atlas, VK-00, Voyage, Spectre, Beacon), S2 (Crossfield, XL-1, Hemera, Yeager), S3 (TS-2, Pontes, Agni) avec vitesse c, temps de transit et consommation de carburant quantique par Gm.
  - **Génératrices de Boucliers** : S1 (FR-66, Palisade, Mirage, AllStop), S2 (FR-76, Rampart, Umbra), S3 (FR-86, Stronghold) avec points de structure totaux et taux de régénération par seconde.
  - **Génératrices d'Énergie** : S1 (JS-300, QuadraCell, SonicLite), S2 (JS-400, Durango), S3 (Daybreak) avec puissance en Watts et charge nominale.
  - **Refroidisseurs** : S1 (Ultra-Flow, CoolCore, Glacier), S2 (Avalanche, IceFlush), S3 (Thermal-4) avec dissipation en kK/s.
- **Grille de 6 Cartes de Télémétrie Temps Réel** :
  - Soute SCU & Type de grille (sécurisée, double pont roulier, poches d'extraction).
  - Moteur Quantique (vitesse en fraction de *c*, km/s et autonomie calculée en Gm selon le réservoir).
  - Boucliers (HP combinés et taux de régénération en HP/s).
  - Génératrice d'Énergie (Puissance en kW et charge nominale en %).
  - Refroidisseurs (Capacité de dissipation thermique totale en kK/s et stabilité).
  - Équipement Spécialisé de Rôle (Laser de minage, Rayon tracteur de soute 32 SCU, Tête de grattage RMC ou DPS d'armement de combat).
- **Presets Rapides 1-Clic** :
  - *Prospector All-Rounder* (Lancet S1 + Atlas S1 + FR-66 + JS-300 + Ultra-Flow).
  - *MOLE Trio Forage* (3x Lancet S2 + Crossfield S2 + 2x FR-76 + JS-400 + 2x Avalanche).
  - *C2 Hercules Cargo* (TS-2 S3 + 2x FR-86 + Daybreak S3 + 2x Thermal-4).
  - *Constellation Taurus Fret* (Crossfield S2 + FR-76 + JS-400 + Avalanche).
  - *Drake Vulture Recyclage* (Atlas S1 + FR-66 + JS-300 + Ultra-Flow).
  - *Scorpius Escorte & Chasse* (VK-00 S1 + FR-66 + JS-300 + Ultra-Flow).
- **Outils d'Équipage & Diffusion** :
  - 📋 **Copier le Fit** : Formatage textuel complet du loadout prêt à coller dans Discord ou un chat de guilde.
  - 📡 **Diffuser à l'Escadre P2P** : Émission instantanée via Fleet-Net WebRTC vers tous les ailiers connectés.

#### 🏛️ Gestion de Flotte de Guilde & Ordres de Mission
- **Présence en Direct des Pilotes Connectés** :
  - Dès qu'un membre rejoint l'organisation ou l'escadre en ligne, son vaisseau actif apparaît automatiquement dans la feuille ASOP du Hangar corporatif avec le badge `🟢 EN VOL : [Callsign]`.
- **Attribution d'Ordres de Mission par les Officiers** :
  - Bouton `📡 Assigner Ordre` permettant au responsable de flotte ou chef d'opérations d'émettre des ordres de mission opérationnels (extraction prioritaire, escorte convoi, fret express) transmis en temps réel via Fleet-Net.

### [2.3.3] - 2026-10-16 - *Hub Dédié Trading & Négociation Cargo 4.0 (Achat/Revente Planétaire, Marge par Ressource & Tournée Minage)*

#### 📦 Séparation Nette Minage / Trading & Négociation Cargo Pure
- **Relocalisation de la Tournée Commerciale (`#mktTourCard`) au sein du Minage / Raffinage** :
  - Comme demandé, les informations relatives à la vente du minerai extrait (vendre brut directement vs raffiner, itinéraire de tournée commerciale recommandée avec arrêts et gains cumulés) se trouvent désormais exclusivement dans le workflow **Minage / Raffinage** (`#viewRefiningHub`).
  - L'onglet Minage & Raffinage répond ainsi directement à la question du mineur : où vendre sa cargaison extraite pour maximiser ses aUEC.
- **Refonte Complète de l'Onglet Commerce (`#viewTradingHub`) en Terminal de Trading Cargo Dédié** :
  - Dédié aux pilotes voulant faire du profit en achetant des marchandises sur un avant-poste ou une station pour aller les revendre ailleurs avec marge.
  - **Explorateur par Ressource ("Choisir à partir d'une ressource")** :
    - Menu sélecteur dynamique (`#tradeCommoditySelect`) et filtres par catégories (Métaux, Médical, Industriel, Consommables, Marché Noir).
    - **Meilleur Point d'Achat** : Avant-poste/station où le prix d'achat est le plus bas (avec niveau de stock et système).
    - **Vente la plus Rentable** : Terminal TDD/ville où le prix de revente est le plus élevé (avec niveau de demande et système).
    - **Spread & Marge Unitaire** : Marge nette par SCU et ROI en pourcentage.
    - **Classement Détaillé des Terminaux de Revente** : Tableau interactif ordonnant tous les terminaux acheteurs du plus rentable au moins cher, avec marge unitaire et gain total calculé selon le vaisseau.
  - **Calculateur de Rentabilité par Vaisseau & Capacité Soute** :
    - Boutons d'accès rapide aux gabarits cargo authentiques : Cutlass (46 SCU), Hull-A (64 SCU), Freelancer MAX / RAFT (120 SCU), Constellation Taurus (174 SCU), Caterpillar (576 SCU), C2 Hercules (696 SCU) ou saisie manuelle libre.
    - Calcul en temps réel du Capital d'achat requis, de la Recette brute, du Bénéfice net et du ROI.
  - **Top Routes Commerciales Recommandées** :
    - Grille de routes rentables vérifiées dans Stanton et Pyro (Laranite, Med Supplies, Titane, Béryl, Or, Alcools, Ferraille, Maze...).
    - Filtre par système stellaire (Tous, Stanton, Pyro, Nyx) et chargement en 1 clic dans l'explorateur.
  - **Outils de Flotte & Partage** :
    - Bouton 📋 "Copier la Route" vers le presse-papiers avec détails d'achat, de revente et gains projetés.
    - Financement d'achat direct depuis la Trésorerie de Guilde (`#btnFinanceTradeTreasury`) et dépôt du lot au Stockpile (`#btnAddTradeToStockpile`).

### [2.3.2] - 2026-10-16 - *Architecture Métier : Boucles Industrielles Dédiées (Minage, Raffinage, Commerce, QG Guilde)*

#### 🎯 Restructuration Ergonomique du Workflow Opérationnel
- **Barre Maîtresse des Boucles Industrielles (`#masterWorkflowBar`)** :
  - Fin du fractionnement et de la dispersion cognitive : l'application adopte une navigation métier guidée calquée sur le cycle de vie industriel authentique de Star Citizen.
  - 4 onglets opérationnels lumineux avec micro-indicateurs et typographie Rajdhani :
    - ⛏️ **MINAGE & EXTRACTION** (`#btnWorkflowMining`) : Scan tactile, Télémétrie laser, Solveur 4.0 et Remplissage soute direct.
    - 🚚 **TRANSPORT & RAFFINAGE** (`#btnWorkflowRefining`) : Arbitrage des méthodes (Dinyx/Cormack...), Bonus de stations, Grille cargo physicalisée 4.0, Guide Aaron Halo et Ordres en cours.
    - 💰 **COMMERCE, BOURSE & VENTE** (`#btnWorkflowTrading`) : Cours UEX Corp en direct, Terminaux TDD classés, Tournée commerciale optimisée, Éclaireurs de prix et Dividendes d'équipage.
    - 🏛️ **QG GUILDE & FLOTTE** (`#btnWorkflowGuild`) : Passerelle de commandement, Roster RBAC, ASOP Hangar et Trésorerie.
- **Boucle de Minage Complète & Zéro Allers-Retours** :
  - Migration de la section Soute (`#btnAddToCargo`, barre de chargement `#cargoHoldBox`, sacoches détachables `#saddlebagsControlBox`, journal de session `#sessionLogList`) directement au bas de l'Analyse Tactique (`#panelTacticalAnalysis`).
  - Le pilote de Prospector ou de MOLE peut scanner, fracturer, évaluer son volume utile et charger sa cargaison sans jamais quitter l'onglet de minage ni manipuler de menus secondaires.
- **Hub Dédié Transport & Raffinage (`#viewRefiningHub`)** :
  - Agencement en 2 colonnes spacieuses (sur écran large) :
    - Colonne 1 : Carte d'arbitrage brut vs raffiné (`#stationPriceComparatorCard`), tableau comparatif des stations (`#spcTableContainer`), station recommandée et suivi des ordres actifs (`#refiningOrdersCard`).
    - Colonne 2 : Grille de fret physicalisé 4.0 (`#cargoGridMasterCard` - transporteurs Hercules C2, Taurus, Hull-A...), carte de navigation express Aaron Halo (`#refiningHaloCard`) et raccourci Stockpile.
- **Hub Dédié Commerce & Bourse (`#viewTradingHub`)** :
  - Colonne 1 : Télémétrie UEX Corp en temps réel, terminaux TDD classés avec filtres de systèmes (`#mktPaneTerminals`) et calcul de tournée optimale (`#mktTourCard`).
  - Colonne 2 : Réseau des éclaireurs de prix de guilde (`#mktPaneScout`), calculateur de partage de bénéfices multi-équipage et escorte (`#squadProfitSplitCard`) et raccourci Grand Livre comptable (`#tradingLedgerCard`).
- **Synchronisation Birectionnelle Universelle** :
  - Le dock mobiGlas 4.0 (`#dockBtnScanner`, `#dockBtnRefinery`, `#dockBtnLedger`, `#dockBtnGuild`) et la barre maîtresse d'en-tête sont synchronisés en temps réel avec mémorisation de l'onglet actif dans `localStorage`.

### [2.3.1] - 2026-10-16 - *Refonte Ergonomique & Esthétique Globale (CIG Building Blocks 4.0 Standard)*

#### 🎨 Design System, Ergonomie & Expérience Utilisateur (UX)
- **Élimination de la Pollution Visuelle & Surcharge Néon ("Anti-Christmas-Tree")** :
  - Suppression de l'effet scanlines CRT dégradant (opacité 0.6 avec lignes noires) au profit d'un vignettage feutré d'habitacle et de fonds ardoise mate (`#070a12`, `#0b111e`, `#10192b`), rendant tous les textes et chiffres 100% nets, lisses et lisibles sans fatigue oculaire.
  - Remplacement des bordures néon épaisses saturées par des bordures ultra-fines de 1px avec transparence contrôlée (`rgba(56, 189, 248, 0.18)` et `rgba(255, 255, 255, 0.08)`), conformes aux interfaces CIG Building Blocks 4.0 de Star Citizen.
  - Éclairage d'accentuation sélectif : les couleurs vives (cyan, émeraude, ambre, rose, or) sont désormais réservées aux états actifs, jauges de danger et alertes critiques.
- **Hiérarchie Typographique & Échelle de Lisibilité** :
  - Migration de la typographie système vers `Rajdhani` (condensé technique sans-serif haute lisibilité) et `Chakra Petch` (titrage HUD aérospatial), avec `JetBrains Mono` dédié aux mesures télémétriques et coordonnées brutes.
  - Remplacement des micro-textes illisibles (< 11px) par une échelle ergonomique standardisée (12px à 15px pour les libellés, 1.45 de hauteur de ligne, chiffres tabulaires anti-saccades).
- **Loi de Fitts & Cibles Tactiles Confortables** :
  - Standardisation de toutes les cibles interactives (boutons d'en-tête, filtres, sélecteurs, déclencheurs) à une hauteur minimale de 36px à 42px avec un espacement respirant de 6px à 8px.
  - Micro-interactions fluides : élévation subtile au survol (`translateY(-1px)`), transition `cubic-bezier(0.16, 1, 0.3, 1)` et retours d'appui tactiles (`scale(0.97)`).
- **Structure Aérée des En-têtes mobiGlas & Cockpit HUD** :
  - Réorganisation logique en 3 pôles équilibrés : Identité & Réseau de bord (Gauche), Horloge stellaire 2954 & Vaisseau actif (Centre), Solde aUEC, Actions rapides et Outils de vol (Droite).
- **Cartes Tactiques & Jauges Volumétriques** :
  - Redesign du bandeau de diagnostic (`.verdict-box`) : carte feutrée avec dégradé d'ambiance et typographie statutaire nette, remplaçant les bordures néon agressives.
  - Jauges de puissance laser et barres de progression de coque/soute recalibrées avec séparateurs et repères discrets.
- **Acoustique Avionique Haute Définition (`SoundFX`)** :
  - Remplacement des oscillateurs agressifs à onde carrée et en dents de scie par un synthétiseur acoustique à ondes sinusoïdales/triangulaires avec filtre passe-bas résonant (carillon avionique harmonieux inspiré des calculateurs de bord modernes).

### [2.3.0] - 2026-10-16 - *Jalon 8 : Gouvernance, Sécurité (RBAC) & Configuration de Guilde*

#### 🚀 Jalon Majeur Implémenté (Milestone 8)
- **Architecture Décentralisée Souveraine & Sécurité Locale (Phase 1 — 0€ de Serveur)** :
  - Authentification cryptographique locale sans aucun serveur externe obligatoire : hachage et dérivation de clés par **PBKDF2 SHA-256** (100 000 itérations avec sel cryptographique aléatoire unique via l'API standard `WebCrypto`).
  - Persistance locale résiliente dans le navigateur (`IndexedDB` / `localStorage`) et synchronisation de flotte P2P sub-100ms via le paquet WebRTC DataChannel `CORPO_GUILD_CONFIG_SYNC`.
- **Système de Permissions & Rôles Hiérarchiques (RBAC - Role-Based Access Control)** :
  - Gestion stricte de 5 rangs opérationnels :
    - 👑 **Amirauté / Commandement** : Contrôle absolu sur la guilde, configuration des clés maîtres, gestion de la trésorerie, retraits financiers, politique de taxation et révocation de membres.
    - 📋 **Chefs d'Opérations (Flight Leads)** : Planification des missions, assignation des postes de vol, supervision de la flotte et des lots de fret (retraits trésorerie verrouillés).
    - 💰 **Trésoriers & Logisticiens Fret** : Approbation des avances de trading, retraits et dépôts sur la trésorerie corporative, gestion du stockpile (mots de passe système verrouillés).
    - 🚀 **Membres Actifs (Pilotes Industriels & Escorte)** : Inscription aux opérations, déclaration de vaisseau, prise en charge de lots de fret et participation aux dividendes.
    - 🔰 **Recrues & Invités** : Accès en lecture seule sur les métriques publiques et le MoTD.
  - Verrouillage dynamique des contrôles sensibles dans l'ensemble de l'application : les boutons de retrait de trésorerie (`#btnWithdrawTreasury`) et la modification des taxes corporatives (`#treasuryTaxSelect`) sont protégés et désactivés pour les rôles non autorisés.
  - Déverrouillage sécurisé de rôle par mot de passe avec badge néon dynamique (`role-badge-pill`) dans l'en-tête bureau et mobiGlas.
- **Interface de Commandement CIG Spectrum Org 4.0 & mobiGlas Building Blocks** :
  - **Insigne Héraldique & Niveaux de Préparation Opérationnelle (DEFCON)** : Blason hexagonal doré animé (`.cig-crest-badge`), ticker corporatif, sélecteur de modèle d'organisation (Syndicat Minier, Corporation Industrielle, Confrérie, PMC) et d'alignement galactique (UEE, Neutre, Outlaw), et pilule interactive DEFCON 1 (Ops Normale) / DEFCON 2 (Vigilance Minage) / DEFCON 3 (Alerte Hostile) avec pulsation rougeoyante et signal d'alerte sonore/haptique.
  - **Pont Télémétrique KPI Holographique à 5 Cartes** : Affichage en direct du Patrimoine Global en aUEC, de la Trésorerie Disponible, du Tonnage Fret Global de Flotte (SCU), du Nombre de Pilotes en Service et de l'Accréditation RBAC active.
  - **Hangar Corporatif & Gestionnaire de Flotte ASOP (`#guildPaneFleet`)** : Cartes de vaisseaux stylisées Building Blocks (Arrastra, MOLE, C2 Hercules, Caterpillar, Taurus, Scorpius...) avec jauge d'intégrité de coque bicolore, capacité SCU, station d'attache, système de prêt / restitution en 1 tap (`borrowGuildShip` / `returnGuildShip`), décommissionnement pour l'Amirauté et formulaire d'enregistrement de nouveaux vaisseaux.
  - **Synthèse Logistique Stockpile & Raffinerie (`#guildPaneStockpile`)** : Décompte consolidé des cargaisons brutes, des ordres en cours de raffinage et des lots prêts au fret avec valorisation financière marchande instantanée et passerelle directe vers le kiosque de raffinage.
  - **Registre & Enrôlement Dynamique de Pilotes (`#guildPaneRoster`)** : Filtrage de recherche instantané (par indicatif, rôle, vaisseau ou station spatiale), formulaire d'enrôlement rapide de pilotes et révocation administrative.
  - **Mode Plein Écran mobiGlas Authentique** : Bascule 1-clic en plein écran 100vw/100vh avec coins biseautés et reticules holographiques pour un usage optimal en second écran ou tablette.
- **Panneau de Configuration & Administration de Guilde (*Guild HQ Deck*)** :
  - **Profil & Identité de Corporation** : Nom officiel, Ticker court (ex: `[SMS]`), système stellaire d'attache (Stanton, Pyro, Nyx), Station QG de ralliement et Message du Jour (MoTD) affiché en bannière dorée d'escadre avec directives tactiques et déploiements d'escadre (Alpha Minage, Bêta Fret, Gamma Escorte).
  - **Passerelle Discord & Widget de Présence Live** : Configuration du lien d'invitation Discord et intégration automatique du widget officiel Discord (`discord.com/widget`) pour afficher les membres en ligne et les canaux vocaux actifs.
  - **Politique Financière par Défaut** : Définition des taux de retenue corporative (10% à 50%), prime d'escorte horaire par défaut, commission transporteur par SCU et seuil d'alerte de réserve minimale.
  - **Souveraineté des Données & Sauvegardes JSON 1-Clic** : Exportation intégrale de la base de guilde (profil, rôles, grand livre, trésorerie, flotte, registre des membres, stocks et ordres de raffinage) et import / restauration instantanée avec validation d'intégrité.
- **Passe Ergonomique Professionnelle sur le Tableau de Bord de Guilde** :
  - **Tableau des Membres & Roster Haute-Densité** :
    - *Tri Interactif Multi-Colonnes* : En-têtes de colonnes cliquables (`Indicatif`, `Hiérarchie / Rôle`, `Statut`, `Vaisseau & Tonnage`) avec bascule instantanée croissante/décroissante et indicateurs visuels (▲ / ▼).
    - *Filtres Rapides par Segments (Chips)* : Filtrage en 1 clic : `Tous [N]`, `🟢 En Ligne [N]`, `⛏️ En Mission [N]`, `👑 Amirauté & Officiers [N]`.
    - *Avatar Tactique de Pilote & Pulse Dot d'État* : Badges d'initiales holographiques avec pastille de statut en direct (vert en ligne, ambre en forage, cyan en fret, rouge en patrouille).
    - *Sélecteur de Rôle Inline pour Administrateurs* : Menu déroulant direct permettant la promotion/rétrogradation instantanée d'un membre sans rechargement.
    - *Action Rapide Copie Callsign* : Bouton de copie en 1 clic dans le presse-papier avec confirmation toast et son CIG.
    - *Export Officiel Discord en 1 Clic* : Bouton `📋 Discord` générant un rapport formaté en Markdown Spectrum pour diffusion dans les canaux d'annonces de guilde.
    - *Barre Télémétrique de Pied de Tableau* : Compteur dynamique `Affichage de X sur Y pilotes • Z en opération` et calcul en temps réel du tonnage actif mobilisé en SCU.
  - **Hangar de Flotte & Borne ASOP Réactive** :
    - *Barre d'Outils de Flotte Complète* : Champ de recherche avec bouton d'effacement rapide `✕`, tri par Tonnage SCU (Max/Min), Santé de Coque et Nom A-Z.
    - *Filtres par Catégorie de Vaisseau* : Filtres rapides `Tous`, `🟢 Disponibles`, `⚠️ Empruntés`, `⛏️ Mineurs (Prospector/MOLE/Arrastra/Orion)`, `🚜 Transporteurs (C2/Caterpillar/Taurus)`, `🛡️ Escorte (Scorpius)`.
    - *Module de Maintenance & Révision de Coque* : Bouton direct `🛠️ Réviser Coque (100%)` pour réparer au hangar les vaisseaux endommagés en mission.
  - **Stockpile & Logistique Minérale Améliorée** :
    - *Jauge Tri-Phasée de Répartition Volumétrique* : Barre de progression segmentée calculée dynamiquement (Minerais bruts en ambre / En cours de raffinage en cyan / Prêts au fret en émeraude).
    - *Tableau Exhaustif & Filtrable des Lots* : Vue tabulaire complète avec filtres par statut de lot et sélecteur de station de stockage (`ARC-L1`, `HUR-L1`, `MIC-L1`, `CRU-L1`, `Grim HEX`, `Pyro Gateway`...).
  - **Navigation & Ergonomie Clavier Globale** :
    - *Badges Notificateurs sur les Onglets* : Décompte en direct affiché sur chaque sous-onglet (`👥 REGISTRE [5]`, `🚀 FLOTTE [8]`, `📦 STOCKS [3]`).
    - *Raccourcis Clavier Intégrés* : Touches numériques <kbd>1</kbd> à <kbd>7</kbd> pour basculer instantanément d'onglet, touche <kbd>/</kbd> pour focaliser immédiatement le champ de recherche actif, avec retours audio CIG authentiques (`sfx.playBeep`).

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

### [3.0.0] - 2026-10-17 - *Industrial Salvage 4.0 & Aaron Halo Vectorial Starmap*

#### 🔨 Salvage & Hull Recycling Module (`data/game/salvage.js`, `modules/salvage/`, `#viewSalvage`)
- **Official Salvage Vessels Support**: Full integration of the **Drake Vulture** (solo, 12 SCU internal processing buffer, 13 SCU cargo grid), **Aegis Reclaimer** (heavy industrial 240+ SCU platform with massive structural disintegration claw) and **Argo SRV** (heavy S3 tractor beam recovery tug).
- **Comprehensive Wrecks & Derelicts Catalog**: Realistic SC 4.0 targets for MISC Prospector, Drake Cutlass Black, Crusader C1 Spirit, RSI Constellation Andromeda, Crusader C2 Hercules and Aegis Hammerhead (RMC and Construction Materials yields, estimated scraping durations and component loot).
- **Processing Buffer Simulator**: Real-time monitoring of internal buffer levels with visual threshold cues (90% warning, 100% critical alert) and physical cargo grid eject button.
- **Strategic Salvage Arbitrage**:
  - `[ 🛠️ Reserve for Craft ]`: Injects RMC directly into workshop inventory tagged for armor plating and hull repairs.
  - `[ 💰 Sell RMC (TDD) ]`: Instant sale at trade commodity terminals (Area18, New Babbage, Orison, Lorville) with immediate wallet credit.
  - `[ 🏗️ Sell Construction Materials ]`: Direct liquidation of structural disintegration volumes (CM).

#### 🗺️ Spatial Starmap & Aaron Halo Dropper (`modules/starmap/`, `#viewStarmap`)
- **Interactive 60 FPS 2D Vectorial Radar Canvas**:
  - Graphical solar system models for **Stanton** and **Pyro** (SC 4.0) featuring Sun, major planets, orbits and inter-system jump points.
  - **Aaron Halo Asteroid Belt Visualization**: Dynamic 200+ particle toroidal orbital belt, highlighting ultra-dense **Band 5** in glowing gold.
  - Smooth pan, zoom (+, -, reset) controls tailored for desktop and cockpit tablets.
- **Kilometer-Precise Quantum Drop Calculator (100% Silent & Visual Guidance)**:
  - Supports all 10 Aaron Halo sub-bands and major vectors (ArcCorp ➔ HUR-L3, HUR-L3 ➔ ArcCorp, CRU-L1 ➔ ArcCorp, etc.).
  - Calculates exact cutoff distance ($13,600,000\text{ km}$ for Band 5) adjusted for equipped Quantum Drive speed (Atlas S1, VK-00, XL-1, Crossfield, TS-2...).
  - **100% Silent Guidance with Zero Audio**: Dynamic progress bar, approach threshold warnings, and high-contrast flashing banner `[ 🛑 CUT QUANTUM DRIVE NOW ! (KEY B) ]`.

### [2.9.0] - 2026-10-17 - *Strategic Ore Arbitrage: Material Quality, Craft Storage & Raw vs Refined Selling (Star Citizen 4.0)*

#### 💎 Quality-Based Economic Arbitrage & Ore Management (`modules/mining/`, `modules/inventory/`, `index.html`)
- **Automated Strategic Advisory by Material Quality (Q0 to Q1000)**:
  - **High-Grade Materials (Q ≥ 750 / Q900+ Masterwork)**: High-priority recommendation to **KEEP FOR CRAFTING** (`intendedUse: 'craft'`). Contextual explanation of overclocking stat scaling (+15% to +45% boosts to lasers, shields, and passive modules).
  - **Standard Materials (Q400 to Q749)**: Strategic advisory to **REFINE & SELL** for peak aUEC profit margins, or store if military components are planned.
  - **Scrap / Low-Grade (Q < 400)**: Recommendation for **INSTANT RAW SALE** at commodity terminals without refinery waiting times or processing fees.
- **Direct Operational Actions in Mining Calculator (`#viewMining`)**:
  - Interactive 3-card decision grid:
    - `[ 🛠️ Keep for Craft ]`: Extracts and reserves the batch into personal inventory (protected for workshop assembly).
    - `[ 💰 Sell Raw ]`: Instant sale at local commodity price with immediate wallet credit.
    - `[ 🏭 Refine & Sell ]`: Submits refining batch (Dinyx Solvent at CRU-L1) and increments dashboard active orders.
  - Rock scan **Material Quality** slider & input (0-1000) with quick presets (Q350 Scrap, Q500 Standard, Q780 High, Q950 Masterwork, and realistic 4.0 RNG roll).
- **Interactive Inventory Management & Reservation (`#viewInventory`)**:
  - **Ore Quality Badges**: Visual badges (`⭐ Q880 High Grade`, `⭐ Q920 Masterwork`) on both raw and refined ore lots.
  - **Interactive Intended-Use Pills**: One-click toggling between `[ 🛠️ Reserved Craft ]`, `[ 💰 Sell Raw ]`, and `[ 💎 Sell Refined ]`.
  - **Direct Row Actions**: Buttons to toggle craft reservation, sell raw ore immediately, submit to Dinyx refinery, or liquidate refined ingots.
  - **Purpose & Quality Filter**: Multi-criteria dropdown (All / Reserved Craft / Sell Raw / Sell Refined / High Quality Q750+).

### [2.8.0] - 2026-10-17 - *Complete Fleets Operations & Real-Time Multi-Crew P2P Network (Star Citizen 4.0)*

#### 🚀 Fleet Operations Center & Multi-Crew Station Coordination (`#viewFleets`, `modules/coop/`)
- **Dual Cooperative Game Modes Support**:
  - **1. Multi-Crew Station Assignments (Single Ship: ARGO MOLE, Orion, Arrastra)**:
    - Detailed per-seat stations: *Pilot / Wing Commander*, *Center Turret (S2)*, *Port & Starboard Lateral Turrets (S2)*, *Scanner & Gadget Operator*, *Tractor Beam & Cargo Pod Operator*.
    - Real-time crew callsigns, online/offline status, equipped mining lasers (Watts, Lancet resistance reduction), and assigned profit share percentage.
    - Interactive re-assignment of seats and instant addition of new crew members on the fly.
  - **2. Heterogeneous Multi-Ship Wing Operations**:
    - Complete support for combined wings: heavy multi-crew miners (MOLE), agile solo prospectors (MISC Prospector), cargo haulers and 32 SCU saddlebag runners (Crusader C2 Hercules, Constellation Taurus), and armed security escorts (Aegis Gladius).
    - Consolidated fleet telemetry KPIs: total cargo capacity (SCU), combined laser power (MW), net estimated valuation (aUEC), and global crew/security status.
- **Joint Fire Physics & Synchronized Fracture Simulator (`#fleetSubViewJointFire`)**:
  - Interactive selection of firing laser heads pointed simultaneously at the target asteroid.
  - Non-linear resistance reduction model stacking Lancet MH1/MH2 and Hofstede lasers:
    $$\text{Effective Resistance} = \text{Target Resistance} \times \left(1 - \frac{\text{Combined Reduction}}{100}\right)$$
  - Dynamic energy threshold calculation vs cumulative delivered Watts.
  - Real-time HUD energy gauge with overload warning (>180% power) and fracture feasibility verdict with estimated time to break.
- **Automated Profit Sharing & Star Citizen mo.Trader Command Generator (`#fleetSubViewPayouts`)**:
  - Full operational payout calculator automatically deducting fuel, repairs, fleet reserve fund, and guild taxes.
  - Switchable payout modes: **Role-Weighted Shares** or **Equal Shares** across all participants.
  - One-click copy for official in-game chat commands: `/pay <Callsign> <Amount>`.
- **Real-Time P2P WebRTC & BroadcastChannel Multiplayer Liaison (`fleet-net.js`, `peerjs.min.js`)**:
  - Direct peer-to-peer connectivity via WebRTC DataChannels using Google STUN (`stun:stun.l.google.com:19302`) with zero server costs, plus 0ms local synchronization via BroadcastChannel.
  - **Live P2P Network Toolbar** (`#fleetNetBar`) and clickable topbar fleet badge (`#topbarFleetBadge`) displaying online status (`HOST`, `WINGMAN`, `SOLO`), room code, peer count, and latency in ms.
  - **Wing Network Modal** (`#modalWingNet`) to create or join wings using NATO/SC codes (e.g., `WING-4982`) or direct shareable URL invite links (`?fleet=WING-XXXX`).
  - **Synchronized Laser Firing**: toggling a laser turret instantly lights up the energy meter across all connected wingmen in real time.
  - **Shared Live Operations Log & Rock Scans**: instant bi-directional broadcast of scanned asteroids, mineral clusters, cargo bag drops, and security alerts.

### [2.7.0] - 2026-10-17 - *Comprehensive Crafting & Blueprint Categories Taxonomy (1,660 Schematics)*

#### 🛠️ Star Citizen 4.0 Industrial Classification & Workshop Ergonomics (`#viewCrafting`)
- **16 Standardized Industrial Categories (100% Coverage of 1,660 Schematics)**:
  - *Mining Lasers (S1/S2)*, *Mining Modules*, *Mining Gadgets*, *Saddlebags & SCU Pods*, *Salvage Heads*, *Ship Shields*, *Quantum Drives*, *Power Plants*, *Coolers*, *Ship Weapons*, *FPS Weapons*, *Tractor & Multi-Tools*, *Suits & Armors*, *Ammunition & Consumables*, *Ship Components*, and *Utility Attachments*.
- **Ergonomic Category Selector**:
  - Structured dropdown with 4 clear optgroups (*Mining & Salvage*, *Ship Components*, *Weapons & Combat*, *Personal Gear*) with schematic counters and icons.
- **Dynamic Category Auto-Resolution (`resolveBlueprintCategory`)**:
  - Centralized categorization heuristics exported in `modules/crafting/crafting-service.js`.

### [2.6.0] - 2026-10-17 - *Material Quality & Overclocked Crafted Equipment Stats (Star Citizen 4.0+)*

#### 🧪 Material Quality Engine & Spec Scaling (`modules/crafting/`, `modules/inventory/`)
- **Official 0 to 1,000 Material Quality Scale**:
  - 5 tiers: Scrap (0-399), Standard (400-599), Military Enhanced (600-749), High Grade (750-899), and Masterwork Prototype (900-1,000).
- **Weighted Composite Quality Calculation**:
  - Accurate calculation based on volume and individual ingredient ratings.
- **Stat Scaling Engine (`calculateCraftedStats`)**:
  - Mining lasers: up to +28% Watts power, +35% resistance reduction, and +40% optimal green zone window.
  - Modules & gadgets: enhanced instability dampening, SCU/s extraction boost, and bonus charges.
- **Interactive Workshop Previews (`#viewCrafting`)**:
  - Material quality sliders with instant tier presets and real-time comparative specs grid.

### [2.5.0] - 2026-10-17 - *Equipment Inventory, Provenance Tracking (Bought / Looted / Crafted) & Guild Marketplace*

#### 📦 Inventory & Inter-Guild Trade (`modules/inventory/`, `#viewInventory`, `#viewGuild`)
- **Item Provenance Tracking**:
  - Distinct tracking for factory-bought, looted/salvaged, and player-crafted items.
- **Guild Market Listings**:
  - Players can list personal inventory items for sale or barter on the inter-guild marketplace with customized prices in aUEC.

### [2.4.2] - 2026-10-16 - *Modular Architecture & Complete Data Layer Decoupling (Modular Data Layer)*

#### 📊 Architectural Data Decoupling (`/data/`)
- **Creation of Dedicated `/data/` Directory**:
  - Clean and robust separation between application/runtime logic (`app.js`, `fleet-net.js`, `i18n.js`) and Star Citizen game reference data and factory configurations.
  - **Subdirectory `data/game/` (Star Citizen Game Balance)**:
    - `ships.js`: Mining and cargo/support ship specifications (SCU cargo, hardpoints, manufacturer).
    - `lasers.js`: Mining laser heads S0, S1, S2 (Watts, resistance, instability, range).
    - `modules.js`: Passive and active sub-modules.
    - `gadgets.js`: Deployable surface mining gadgets.
    - `components.js`: Ship internal components (Quantum Drives, Shields, Power Plants, Coolers).
    - `minerals.js`: Raw and refined minerals, densities, volatilities, and base spot prices.
    - `refining.js`: Refining methods (Dinyx, Cormack...) and refinery station bonuses/penalties.
    - `locations.js`: Aaron Halo band boundaries, planetary hotspots, and asteroid archetypes.
    - `trade.js`: Trade terminals, UEXcorp config, general commodities, and popular routes.
  - **Subdirectory `data/defaults/` (Configurations & Factory Presets)**:
    - `factory-loadouts.js`: Factory weapon & mining loadout presets (`FACTORY_LOADOUT_PRESETS`).
    - `guild-defaults.js`: Initial stockpile (`DEFAULT_GUILD_STOCKPILE`), expenses (`DEFAULT_GUILD_EXPENSES`), and RBAC matrix (`GUILD_ROLE_PERMISSIONS`).
    - `changelog.js`: Full bilingual release history (`CHANGELOG_DATA`).
- **Major Codebase Diet in `app.js` (-638 Lines of Raw Data)**:
  - `app.js` is stripped of hardcoded static data tables, focusing solely on dynamic state, DOM reactivity, and network telemetry.
- **Unified Facade & 100% Backward Compatibility (`data/index.js` & `mining-data.js`)**:
  - `data/index.js` reassembles and exports the identical `MINING_DATA` object with zero API divergence.
  - `mining-data.js` acts as a transparent proxy (`export * from './data/index.js'`), guaranteeing zero regression across existing imports and automated tests.
- **PWA Offline Pre-Caching (`sw.js`)**:
  - All modular `/data/` files are registered in the Service Worker asset cache for seamless offline operation.

### [2.4.1] - 2026-10-16 - *Personal Fleet Management ("My Fleet" Hangar Deck, ASOP Selector & Per-Ship Configuration)*

#### 🚀 Personal Fleet Hangar Deck (`#paneMyFleetHangar`)
- **Full Multi-Ship Ownership for Players**:
  - The keystone workflow tab is elevated to **MY FLEET** (`#btnWorkflowShip`), offering comprehensive personal hangar management for all vessels owned by the pilot.
  - **Dual-Pane Navigation Workflow**:
    - 🚀 **Personal Hangar (My Fleet)**: Fleet overview with KPI telemetry, quick role filters, live search, and interactive ASOP terminal cards.
    - ⚙️ **Ship Systems & Loadout (My Ship)**: Opens the complete engineering deck (lasers, submodules, internal components QD/Shields/Power/Coolers, telemetry) for whichever ship is selected from the fleet list.
- **Interactive ASOP Fleet Cards (`#myFleetCardsGrid`)**:
  - Each vessel card displays operational role icon, custom nickname, hull model, manufacturer badge, home station, cargo capacity in SCU, QD drive rating, and shield HP.
  - Prominent glowing `★ COMMANDES ACTIVES` badge highlights the vessel currently commanded by the pilot.
  - **1-Click Take Command (`🚀 Prendre les commandes`)**: Instantly designates any owned ship as active, synchronizing all mining extraction solvers, cargo capacity, trading inputs, and P2P fleet broadcasts.
  - **Configure Button (`⚙️ Configurer`)**: Directly launches the detailed systems & loadout configuration pane for that ship.
  - **Decommission Ship (`🗑️`)**: Secure removal from personal fleet with deletion safeguards.
- **Hangar Telemetry KPI Deck & Quick Filters**:
  - Real-time KPIs for Total Hulls, Combined Fleet Cargo SCU, and Active Ship on duty.
  - 1-click filter chips: *All*, *Mining*, *Cargo*, *Salvage*, *Combat*.
  - Live search input matching custom names, chassis models, and home stations.
- **Add Ship to Hangar Modal (`#addPersonalShipModal`)**:
  - Registration dialog allowing pilots to add any playable ship from the catalog, assign a custom christening name, and choose their home station across Stanton and Pyro.
- **Config Pane Ergonomic Toolbar**:
  - Return button `◀ Retour au Hangar (Ma Flotte)`.
  - Quick-switch dropdown (`#myFleetQuickSwitchSelect`) to seamlessly jump between owned ships.
  - Dynamic `🚀 PRENDRE LES COMMANDES (ACTIF)` / `✅ VAISSEAU ACTIF (EN SERVICE)` toggle button.
- **Direct In-Place Ship Renaming**:
  - Removed the detached input field from parameters.
  - Pilots can now rename their ship directly by clicking on its title in the hero card header (featuring an edit pencil ✎, Enter key confirmation, auto-save on blur, and instant sync), faithfully preserving HUD CIG typography (`.ship-hero-name`).

### [2.4.0] - 2026-10-16 - *Keystone Tab "My Ship & Board Systems" (Single Source of Truth, Internal Components & P2P Fleet Telemetry)*

#### 🚀 Keystone Tab "My Ship & Board Systems" (`#viewMyShipHub`)
- **Single Source of Truth**:
  - Introduced a primary, top-level workflow hub in the master bar (`#btnWorkflowShip`: **🚀 MON VAISSEAU / MY SHIP**).
  - Centralized specification of the active player ship, operational role, and **authentic Star Citizen internal components** (Quantum Drive, Shields, Power Plant, Coolers).
  - **Bidirectional Automatic Synchronization**:
    - Extraction Loop: synchronizes laser head, active/passive submodules, gadgets, and saddlebag capacity (standard 32 SCU vs MOLE 48 SCU).
    - Refining Loop: synchronizes cargo hold capacity for finished job evacuation.
    - Commodity Trading Loop: auto-populates cargo capacity input for instant profit calculations.
    - Guild Fleet & Roster: instantaneously updates the player's active ship model, custom callsign, location, and presence.
- **Authentic Star Citizen Internal Component Catalog**:
  - **Quantum Drives (QD)**: S1 (Atlas, VK-00, Voyage, Spectre, Beacon), S2 (Crossfield, XL-1, Hemera, Yeager), S3 (TS-2, Pontes, Agni) with *c* speed, transit velocity, and quantum fuel consumption rate per Gm.
  - **Shield Generators**: S1 (FR-66, Palisade, Mirage, AllStop), S2 (FR-76, Rampart, Umbra), S3 (FR-86, Stronghold) with total HP and HP/s regeneration rate.
  - **Power Plants**: S1 (JS-300, QuadraCell, SonicLite), S2 (JS-400, Durango), S3 (Daybreak) with Watts power output and nominal load telemetry.
  - **Coolers**: S1 (Ultra-Flow, CoolCore, Glacier), S2 (Avalanche, IceFlush), S3 (Thermal-4) with cooling dissipation rate in kK/s.
- **6 Real-time Telemetry Cards**:
  - Cargo Hold SCU & grid layout.
  - Quantum Drive speed (*c* fraction, km/s, and calculated range in Gm).
  - Shield health (total HP and regen rate).
  - Power Plant draw (Watts output and load %).
  - Coolers capacity (total cooling rate in kK/s and thermal safety).
  - Role Specialty (Mining laser power, 32 SCU tractor beam rating, RMC scraping rate, or combat DPS).
- **1-Click Quick Presets**:
  - *Prospector All-Rounder* (Lancet S1 + Atlas S1 + FR-66 + JS-300 + Ultra-Flow).
  - *MOLE Trio Mining* (3x Lancet S2 + Crossfield S2 + 2x FR-76 + JS-400 + 2x Avalanche).
  - *C2 Hercules Heavy Hauler* (TS-2 S3 + 2x FR-86 + Daybreak S3 + 2x Thermal-4).
  - *Constellation Taurus Cargo* (Crossfield S2 + FR-76 + JS-400 + Avalanche).
  - *Drake Vulture Salvage* (Atlas S1 + FR-66 + JS-300 + Ultra-Flow).
  - *Scorpius Combat Escort* (VK-00 S1 + FR-66 + JS-300 + Ultra-Flow).
- **Crew Collaboration & Export Tools**:
  - 📋 **Copy Fit**: Clean formatted loadout ready to paste into Discord or guild chats.
  - 📡 **Broadcast to Wing**: Real-time transmission to all connected P2P wingmen via Fleet-Net.

#### 🏛️ Guild Fleet Management & Mission Orders
- **Real-Time Online Pilot Presence**:
  - As soon as a player connects to their guild or P2P wing, their active ship immediately surfaces in the ASOP Hangar fleet sheet marked with `🟢 EN VOL : [Callsign]`.
- **Officer Mission Order Dispatching**:
  - Fleet leads and guild managers can click `📡 Assigner Ordre` to transmit mission directives (priority mineral extraction, convoy escort, urgent cargo haul) to online pilots over P2P Fleet-Net.

### [2.3.3] - 2026-10-16 - *Dedicated Cargo Commodity Trading Hub 4.0 (Outpost Buying/Selling, Spread Analyzer & Mining Tour Relocation)*

#### 📦 Strict Separation of Mining Extraction vs Pure Cargo Trading
- **Relocation of Recommended Sales Tour (`#mktTourCard`) into Mining & Refining**:
  - As requested, all information pertaining to selling mined mineral yields (selling raw immediately vs refining for optimal profit, multi-stop commercial tour with waypoint stops and accumulated payouts) is now exclusively located in the **Mining & Refining** loop (`#viewRefiningHub`).
  - Miners now get their direct operational answer where it belongs: where to unload their mined cargo hold for maximum aUEC returns.
- **Complete Rebuild of Trading Tab (`#viewTradingHub`) into a Dedicated Cargo Trading OS**:
  - Engineered for traders seeking profit by purchasing bulk commodities at planetary outposts/stations and reselling them elsewhere with a healthy margin.
  - **Commodity Explorer ("Select by Commodity & Find Maximum Profit")**:
    - Dynamic resource selector (`#tradeCommoditySelect`) with category quick-filter pills (Metals, Medical, Industrial, Consumables, Vice/Black Market).
    - **Best Buy Point**: Lowest purchase price terminal/outpost with real-time stock availability and star system indicator.
    - **Most Profitable Sell Terminal**: Highest resale payout location (TDD/city/station) with demand tier and star system indicator.
    - **Unit Spread & Margin Telemetry**: Clear gross margin per SCU and return on investment (ROI %).
    - **Ranked Resale Terminals Breakdown**: Interactive table sorting all purchasing terminals by payout descending, highlighting the #1 top pick with gross margin per SCU and total run profit calculated for your specific ship hold.
  - **Ship Hold Capacity Scaler & Trade Finance Calculator**:
    - 1-click cargo preset pills for authentic haulers: Cutlass (46 SCU), Hull-A (64 SCU), Freelancer MAX / RAFT (120 SCU), Constellation Taurus (174 SCU), Caterpillar (576 SCU), C2 Hercules (696 SCU), or custom SCU input.
    - Live financial projection cards: Required Buy Capital, Gross Resale Revenue, Net Profit, Unit Spread, and Trade Risk tier.
  - **Top High-Yield Trade Routes Grid**:
    - Pre-computed verified trade routes in Stanton and Pyro (Laranite, Medical Supplies, Titanium, Beryl, Gold, Spirits, Scrap, Maze...).
    - Star system filters (All, Stanton, Pyro, Nyx) and instant 1-click loading into the simulator and Commodity Explorer.
  - **Fleet & Clipboard Integration**:
    - 📋 "Copy Trade Route" button to generate a clean flight brief ready for Discord or mobiGlas chat.
    - Direct guild treasury trade advance funding (`#btnFinanceTradeTreasury`) and stockpile cargo deposit (`#btnAddTradeToStockpile`).

### [2.3.2] - 2026-10-16 - *Workflow Architecture: Dedicated Industrial Loops (Mining, Refining, Trading, Guild HQ)*

#### 🎯 Ergonomic Workflow Reorganization
- **Master Industrial Workflow Bar (`#masterWorkflowBar`)**:
  - Eliminates context-switching and mental fatigue: the entire application is streamlined around Star Citizen's authentic industrial life cycle.
  - 4 luminous cockpit-grade tabs with micro-indicators and Rajdhani typography:
    - ⛏️ **MINING & EXTRACTION** (`#btnWorkflowMining`): Tactile scan, laser telemetry, Solver 4.0, and direct cargo hold loading.
    - 🚚 **HAULING & REFINING** (`#btnWorkflowRefining`): Refining methods arbitrage (Dinyx/Cormack...), station bonuses, physicalized cargo grid 4.0, Aaron Halo transit guide, and active batch orders.
    - 💰 **COMMODITIES & TRADING** (`#btnWorkflowTrading`): Live UEX Corp price ticker, ranked TDD terminals, optimal multi-stop sales tour, scout reports, and crew dividend splits.
    - 🏛️ **GUILD HQ & FLEET** (`#btnWorkflowGuild`): Operations Command Deck, RBAC Roster, ASOP Fleet Hangar, and Corporate Treasury.
- **Unified Mining Loop (Zero Context Switching)**:
  - Moved Cargo Hold controls (`#btnAddToCargo`, progress bar `#cargoHoldBox`, detachable saddlebags `#saddlebagsControlBox`, extraction log `#sessionLogList`) directly below Tactical Analysis (`#panelTacticalAnalysis`).
  - Prospector and MOLE operators can scan, fracture, assess useful SCU volume, and scoop cargo into the hold without ever leaving the mining cockpit view.
- **Dedicated Hauling & Refining Hub (`#viewRefiningHub`)**:
  - Arranged into 2 spacious desktop columns:
    - Column 1: Raw vs Refined methods comparison card (`#stationPriceComparatorCard`), refinery station bonuses comparator (`#spcTableContainer`), recommended station, and active batch tracker (`#refiningOrdersCard`).
    - Column 2: Physicalized Cargo Grid Master 4.0 (`#cargoGridMasterCard` - Hercules C2, Taurus, Hull-A...), express Aaron Halo navigation card (`#refiningHaloCard`), and Guild Stockpile shortcut.
- **Dedicated Commodities & Trading Hub (`#viewTradingHub`)**:
  - Column 1: Live UEX Corp telemetry, ranked TDD terminals table with star system filters (`#mktPaneTerminals`), and optimal route calculator (`#mktTourCard`).
  - Column 2: Guild price scouts network (`#mktPaneScout`), multi-crew dividend split calculator (`#squadProfitSplitCard`), and accounting ledger shortcut (`#tradingLedgerCard`).
- **Universal Bidirectional Synchronization**:
  - The bottom mobiGlas dock (`#dockBtnScanner`, `#dockBtnRefinery`, `#dockBtnLedger`, `#dockBtnGuild`) and top Master Workflow Bar stay in sync with active loop persistence in `localStorage`.

### [2.3.1] - 2026-10-16 - *Global Ergonomic & Aesthetic Overhaul (CIG Building Blocks 4.0 Standard)*

#### 🎨 Design System, Ergonomics & User Experience (UX)
- **Elimination of Visual Noise & Neon Glare ("Anti-Christmas-Tree")**:
  - Replaced aggressive CRT scanlines with an ultra-delicate cockpit vignette and matte slate backgrounds (`#070a12`, `#0b111e`, `#10192b`), rendering all labels and numbers 100% crisp, smooth, and glare-free.
  - Replaced heavy saturated borders with ultra-fine 1px borders with controlled transparency (`rgba(56, 189, 248, 0.18)` and `rgba(255, 255, 255, 0.08)`), matching Star Citizen's CIG Building Blocks 4.0 cockpit standard.
- **Typography Scale & Readability**:
  - Migrated core fonts to `Rajdhani` and `Chakra Petch` with tabular numerals in `JetBrains Mono` for jitter-free live numbers.
- **Fitts's Law & Touch Targets**:
  - Standardized interactive buttons and steppers to comfortable 38px–42px hit targets with subtle micro-interactions (`translateY(-1px)`, `scale(0.97)`).
- **Harmonic Avionics Synthesizer (`SoundFX`)**:
  - Replaced harsh square/sawtooth tones with smooth sine/triangle chimes filtered through a 2400Hz low-pass filter.

### [2.3.0] - 2026-10-16 - *Milestone 8: Guild Governance, Security (RBAC) & Configuration Deck*

#### 🚀 Major Milestone Delivered (Milestone 8)
- **Sovereign Decentralized Architecture & Local Security (Phase 1 — Zero Server Cost)**:
  - Client-side cryptographic authentication with zero external servers required: passphrase hashing and key derivation via **PBKDF2 SHA-256** (100,000 iterations with unique cryptographic salt via standard `WebCrypto` API).
  - Resilient local browser persistence (`IndexedDB` / `localStorage`) and instant sub-100ms P2P fleet synchronization via WebRTC DataChannel packet `CORPO_GUILD_CONFIG_SYNC`.
- **Role-Based Access Control (RBAC) & Hierarchical Permissions**:
  - Fine-grained governance across 5 operational ranks:
    - 👑 **Admiralty / Command**: Complete control over corporation identity, master passphrases, treasury access, financial withdrawals, tax policy, and member revocations.
    - 📋 **Flight Leads**: Operation planning, wing assignments, fleet supervision, and stockpile cargo distribution (treasury withdrawals locked).
    - 💰 **Treasurers & Freight Logisticians**: Trade advance approvals, treasury deposits and withdrawals, stockpile management (master security settings locked).
    - 🚀 **Active Members (Pilots & Escorts)**: Operation participation, active ship declaration, cargo assignment, and dividend claims.
    - 🔰 **Recruits & Guests**: Read-only observation of corporation metrics, fleet status, and Admiralty MoTD.
  - Dynamic lockdown of sensitive controls across the entire MFD interface: treasury withdrawal button (`#btnWithdrawTreasury`) and tax policy selector (`#treasuryTaxSelect`) automatically disable with visual lockout tooltips for unauthorized roles.
  - Instant role unlock with passphrase verification and luminous neon role badges displayed across desktop HUD and mobiGlas headers.
- **CIG Spectrum Org 4.0 & Authentic mobiGlas Building Blocks Interface**:
  - **Heraldic Insignia & DEFCON Operational Readiness**: Animated gold hexagonal crest (`.cig-crest-badge`), corporation ticker, charter model selector (Mining Syndicate, Industrial Corporation, Faith Brotherhood, PMC), galactic alignment (UEE Registered, Neutral, Outlaw), and interactive DEFCON pill button (DEFCON 1 Normal / DEFCON 2 Mining Vigilance / DEFCON 3 Hostile Alert) featuring glowing crimson pulse and audio/haptic tone alerts.
  - **5-Card Holographic Telemetry KPI Deck**: Live tracking of Net Worth in aUEC, Available Treasury in aUEC, Fleet Cargo Capacity in SCU, Active Pilots on duty, and active RBAC Clearance tier.
  - **Corporate Fleet Hangar ASOP Deck (`#guildPaneFleet`)**: Authentic Building Blocks terminal cards for corporate vessels (Arrastra, MOLE, C2 Hercules, Caterpillar, Taurus, Scorpius...) with two-tone hull integrity meters, SCU capacity, home station, 1-tap ship check-out / return (`borrowGuildShip` / `returnGuildShip`), Admiralty decommissioning, and inline vessel registration.
  - **Integrated Stockpile & Refining Deck (`#guildPaneStockpile`)**: Consolidated overview of raw ore holds, refining batches, and ready-to-haul refined lots across Stanton and Pyro with real-time market valuation and quick shortcut to the full refinery kiosk.
  - **Dynamic Member Registry & Enlistment (`#guildPaneRoster`)**: Instant multi-attribute search filtering (by callsign, role, ship, or station), quick enlistment form (`addGuildMember`), and role revocation.
  - **Authentic Fullscreen mobiGlas Mode**: 1-click toggle expanding the deck into an immersive 100vw/100vh HUD layout with corner reticles for second-screen or tablet use.
- **Guild Configuration & Administration Deck (*Guild HQ Modal*)**:
  - **Corporation Profile & Identity**: Official guild name, short ticker (e.g. `[SMS]`), home star system (Stanton, Pyro, Nyx), primary HQ rally station, and Admiralty Message of the Day (MoTD) featured in a gold wing banner with tactical directives and active wing deployments (Alpha Mining, Beta Freight, Gamma Escort).
  - **Discord Gateway & Live Presence Widget**: Discord invite link setup and automatic live Discord Presence Widget integration (`discord.com/widget`) displaying online members and active voice channels.
  - **Default Financial Policy**: Configurable default corporate cut (10% to 50%), combat escort hourly risk pay, heavy hauler rate per SCU, and minimal treasury reserve alert threshold.
  - **Data Sovereignty & 1-Click JSON Backups**: Complete export of all guild databases (profile, RBAC credentials, ledger, treasury, fleet hangar, roster, stockpile, and refining orders) and 1-click restoration with JSON schema integrity validation.
- **Installable Native Desktop Runner & Star Citizen Telemetry (`npm run desktop`)**:
  - **Standalone Window & Borderless Frame**: Dedicated desktop client powered by Electron (`desktop-main.cjs` + `desktop-preload.cjs`) with zero browser clutter.
  - **Live Star Citizen `Game.log` Real-Time Watcher**: Automatic discovery of `LIVE` and `PTU` installs, real-time arrival station detection (*ARC-L1, HUR-L1, MIC-L1, Grim HEX, Area18, Ruin Station...*), instant ship destruction alerts (*DEFCON 3 auto-trigger*), and quantum jumps.
  - **Always-on-Top In-Game Overlay (`Ctrl+Shift+T` & 📌 Button)** : Pins the MFD window above Star Citizen during full-screen borderless spaceflight.
  - **Global Cockpit Hotkey (`Ctrl+Shift+M`) & System Tray Icon**: Instant 1-tap recall of the MFD window to front without `Alt+Tab`.
- **Professional Ergonomic & Usability Pass on the Guild Command Deck**:
  - **High-Density Pilot Registry & Roster UX**:
    - *Interactive Multi-Column Sorting*: Clickable headers (`Callsign`, `Rank / Role`, `Status & Location`, `Ship & Tonnage`) with ascending/descending toggle and visual arrows (▲ / ▼).
    - *Segmented Quick-Filter Chips*: 1-click filtering: `All [N]`, `🟢 Online [N]`, `⛏️ On Mission [N]`, `👑 Command & Officers [N]`.
    - *Tactical Pilot Avatars & Live Pulse Dots*: Holographic initial badges with live pulse status indicators (green online, amber mining, cyan hauling, red patrol).
    - *Inline Role Selector for Officers*: Rapid promotion/demotion dropdown right in the table without opening submenus.
    - *1-Click Callsign Clipboard Copy*: Discrete copy action button with toast confirmation and CIG audio feedback.
    - *Official Discord Markdown Roster Export*: 1-click `📋 Discord` button generating a structured markdown squad manifest ready to post in Discord channels.
    - *Telemetry Table Footer*: Real-time summary showing `Displaying X of Y pilots • Z on active deployment` and live total cargo capacity mobilized across all active pilots.
  - **Fleet Hangar & ASOP Terminal Ergonomics**:
    - *Complete Fleet Toolbar*: Search input with instant clear `✕`, sort select by Cargo SCU (Max/Min), Hull Health, and Name A-Z.
    - *Ship Category Filter Chips*: 1-click filters for `All`, `🟢 Available`, `⚠️ Borrowed`, `⛏️ Miners`, `🚜 Transporters`, `🛡️ Combat Escort`.
    - *Hull Maintenance & Overhaul Module*: Quick `🛠️ Overhaul Hull (100%)` action button for fleet commanders to restore ship integrity in hangar.
  - **Refining Stockpile & Logistics Deck**:
    - *3-Stage Visual Volume Breakdown Gauge*: Dynamically computed segmented progress bar (Raw ore in amber / Refining orders in cyan / Ready-to-haul cargo in emerald).
    - *Exhaustive Filterable Lots Ledger*: Detailed tabular view with status filters and warehouse station selector (`ARC-L1`, `HUR-L1`, `MIC-L1`, `CRU-L1`, `Grim HEX`, `Pyro Gateway`...).
  - **Global Navigation & Keyboard Shortcuts**:
    - *Live Badge Counters on Sub-tabs*: Real-time lot, ship, and pilot count badges on tabs (`👥 ROSTER [5]`, `🚀 FLEET [8]`, `📦 STOCKS [3]`).
    - *Integrated Keyboard Hotkeys*: Number keys <kbd>1</kbd> to <kbd>7</kbd> to instantly switch tabs, <kbd>/</kbd> key to focus active search input, with authentic CIG audio chimes (`sfx.playBeep`).

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
