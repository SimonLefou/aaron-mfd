export const CHANGELOG_DATA = [
  {
    version: 'v3.0.0',
    isCurrent: true,
    title_fr: 'Version 3.0.0 : Salvage & Recyclage Industriel 4.0 & Starmap Vectoriel Aaron Halo',
    title_en: 'Version 3.0.0: Industrial Salvage 4.0 & Aaron Halo Vectorial Starmap',
    date_fr: 'Version Actuelle (Star Citizen 4.0)',
    date_en: 'Current Version (Star Citizen 4.0)',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Nouveau Module Salvage & Recyclage (SC 4.0)</strong> : Prise en charge complète du Drake Vulture, de l\'Aegis Reclaimer et de l\'Argo SRV. Calculateur d\'extraction d\'épluchage de coque (RMC) et de fracturation structurelle (Construction Materials).',
        text_en: '<strong>New Salvage & Hull Recycling Module (SC 4.0)</strong>: Full support for Drake Vulture, Aegis Reclaimer and Argo SRV. Hull scraping (RMC) and structural disintegration (CM) yield calculators.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Simulateur de Buffer & Alertes Visuelles</strong> : Suivi en direct du remplissage du tampon interne de broyage (12 SCU Vulture / 180 SCU Reclaimer), bouton d\'éjection vers la soute et alertes visuelles clignotantes.',
        text_en: '<strong>Buffer Simulator & Visual Alerts</strong>: Live monitoring of the internal processing buffer (12 SCU Vulture / 180 SCU Reclaimer), hold eject button and flashing visual alert banners.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Arbitrage Stratégique Salvage</strong> : Actions directes [🛠️ Réserver RMC pour Craft] (plaques de blindage et réparations), [💰 Vendre RMC au TDD] et [🏗️ Vendre Matériaux de Construction].',
        text_en: '<strong>Strategic Salvage Arbitrage</strong>: Direct operational actions [🛠️ Reserve RMC for Craft] (armor plates & repairs), [💰 Sell RMC at TDD] and [🏗️ Sell Construction Materials].'
      },
      {
        tag: 'new',
        text_fr: '<strong>Nouveau Module Starmap & Dropper Aaron Halo</strong> : Radar orbital 2D interactif Canvas à 60 FPS des systèmes Stanton et Pyro (SC 4.0) avec anneau toroïdal d\'astéroïdes et modélisation de la Bande 5.',
        text_en: '<strong>New Starmap & Aaron Halo Dropper</strong>: Interactive 2D Canvas orbital radar at 60 FPS for Stanton and Pyro (SC 4.0) featuring toroidal asteroid ring and Band 5 visual model.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Compte à Rebours de Coupure QT 100% Visuel</strong> : Calcul des distances de coupure au kilomètre près, prise en compte des vitesses des moteurs Quantum Drive (Atlas, VK-00, XL-1...), progression dynamique et alerte flash [🛑 COUPEZ LE QUANTUM DRIVE].',
        text_en: '<strong>100% Silent Visual Quantum Drop Countdown</strong>: Kilometer-precise cutoff calculations across Quantum Drives (Atlas, VK-00, XL-1...), dynamic progress and screen flash cue [🛑 CUT QUANTUM DRIVE NOW].'
      },
      {
        tag: 'improved',
        text_fr: '<strong>Nettoyage Intégral des Données par Défaut</strong> : Suppression des lots de démo factices, inventaire vierge au démarrage, synchronisation dynamique du stock de craft et purge automatique des données de test résiduelles.',
        text_en: '<strong>Complete Default Data Cleanup</strong>: Removed all sample/mock lots, clean empty inventory on startup, dynamic crafting stock synchronization, and auto-purge of residual cached test data.'
      }
    ]
  },
  {
    version: 'v2.9.0',
    isCurrent: false,
    title_fr: 'Version 2.9.0 : Arbitrage Stratégique des Minerais (Qualité, Craft & Vente Brute / Raffinée)',
    title_en: 'Version 2.9.0: Strategic Ore Arbitrage (Material Quality, Craft Storage & Raw vs Refined Selling)',
    date_fr: 'Mise à jour précédente',
    date_en: 'Previous update',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Arbitrage Stratégique par Qualité (Q0 à Q1000)</strong> : Recommandation automatique selon le potentiel d’overclocking du gisement (Garder pour le Craft si Q ≥ 750 / Raffiner & Vendre si rentabilité optimale / Vendre Brut immédiatement si qualité courante).',
        text_en: '<strong>Quality-Based Strategic Arbitrage (Q0 to Q1000)</strong>: Automatic advisory based on rock overclock potential (Keep for Craft if Q ≥ 750, Refine & Sell if optimal profit, Sell Raw if low-grade ore).'
      },
      {
        tag: 'new',
        text_fr: '<strong>Actions Directes dans le Calculateur de Minage</strong> : 3 cartes de décision instantanées [🛠️ Garder pour Craft] (stocke en inventaire protégé), [💰 Vendre Brut] (crédite le solde immédiatement), [🏭 Raffiner & Vendre] (lance le traitement).',
        text_en: '<strong>Direct Actions in Mining Calculator</strong>: 3 instant action cards [🛠️ Keep for Craft] (stores in workshop stock), [💰 Sell Raw] (instant wallet credit), [🏭 Refine & Sell] (initiates refining order).'
      },
      {
        tag: 'new',
        text_fr: '<strong>Contrôle de Réservation en Inventaire</strong> : Badges d\'usage interactifs [🛠️ Réservé Craft] / [💰 Vente Brute] / [💎 Vente Raffinée] permettant de basculer la destination du lot d\'un simple clic et de protéger les minerais de haute qualité.',
        text_en: '<strong>Inventory Craft Reservation Toggle</strong>: Interactive intended-use badges [🛠️ Reserved for Craft] / [💰 Sell Raw] / [💎 Sell Refined] allowing one-click toggle to protect high-grade materials.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Vente & Raffinage Directs depuis l\'Inventaire</strong> : Boutons d\'action dédiés par ligne pour vendre le minerai brut au comptoir, convertir en raffiné via Dinyx/Ferron ou liquider les lingots raffinés.',
        text_en: '<strong>Direct Selling & Refining from Inventory</strong>: Row actions to sell raw ore directly at kiosks, submit batches to refinery, or liquidate refined SCU at market price.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Filtre d\'Inventaire par Usage & Qualité</strong> : Nouveau filtre multicritères (Usage : Tous / Réservé Craft / À Vendre Brut / À Vendre Raffiné / Haute Qualité Q750+).',
        text_en: '<strong>Inventory Purpose & Quality Filter</strong>: Multi-criteria filter (All / Reserved for Craft / Sell Raw / Sell Refined / High Quality Q750+).'
      }
    ]
  },
  {
    version: 'v2.8.0',
    isCurrent: false,
    title_fr: 'Version 2.8.0 : Coordination Fleets Multi-Crew & Réseau P2P WebRTC Temps Réel',
    title_en: 'Version 2.8.0: Multi-Crew Fleet Operations & Real-Time WebRTC P2P Network',
    date_fr: 'Archive (Star Citizen 4.0)',
    date_en: 'Archive (Star Citizen 4.0)',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Centre d’Opérations Fleets & Multi-Crew (#viewFleets)</strong> : Prise en charge intégrale des postes à bord d’un même vaisseau (MOLE : Pilote, Tourelles 1 Centre, 2 Gauche, 3 Droite, Scan, Fret) et coordination d’escadre mixte (Prospector, C2 Hercules, Gladius).',
        text_en: '<strong>Fleet & Multi-Crew Operations Center (#viewFleets)</strong>: Complete per-seat station assignments for single-ship multi-crew (MOLE Pilot, Center/Left/Right Turrets, Scanner, Cargo) and heterogeneous wing coordination (Prospector, C2 Hercules, Gladius).'
      },
      {
        tag: 'new',
        text_fr: '<strong>Liaison Réseau P2P Temps Réel (WebRTC & BroadcastChannel)</strong> : Connexion directe de pair à pair via serveurs STUN Google sans aucun serveur payant, avec codes de salon WING-XXXX et liens d\'invitation directs.',
        text_en: '<strong>Real-Time P2P Network Liaison (WebRTC & BroadcastChannel)</strong>: Direct peer-to-peer connection via Google STUN servers with zero server costs, supporting WING-XXXX room codes and instant shareable invite links.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Simulateur de Tir Synchronisé & Physique de Fracture</strong> : Sélection interactive des lasers pointés sur le rocher, calcul de la réduction Lancet cumulée et synchronisation temps réel entre ailiers connectés.',
        text_en: '<strong>Joint Fire & Synchronized Fracture Simulator</strong>: Interactive selection of active laser heads, cumulative Lancet resistance reduction model, and live sync across connected wingmen.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Répartition Financière mo.Trader</strong> : Calculateur automatique des parts nettes (pondéré par rôle ou parts égales) et génération des ordres de virement officiels /pay &lt;Callsign&gt; &lt;Montant&gt;.',
        text_en: '<strong>Automated mo.Trader Payout Calculator</strong>: Automatic net split calculation (role-weighted or equal shares) and one-click copy for official in-game /pay commands.'
      }
    ]
  },
  {
    version: 'v2.2.0',
    isCurrent: false,
    title_fr: 'Jalon 7 : Ordres de Raffinage & Inventaire Partagé de Guilde',
    title_en: 'Milestone 7: Refining Orders & Guild Shared Stockpile',
    date_fr: 'Version Actuelle (Alpha 4.10)',
    date_en: 'Current Version (Alpha 4.10)',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Inventaire Collaboratif & Stockpile de Guilde (Fleet-Net)</strong> : Mutualisation en temps réel des stocks de minerais bruts, en cours de raffinage et raffinés prêts à l\'enlèvement à travers toutes les stations de Stanton et Pyro. Synchronisation instantanée WebRTC via le paquet <code>CORPO_STOCK_SYNC</code>.',
        text_en: '<strong>Guild Shared Stockpile & Fleet Logistics (Fleet-Net)</strong>: Real-time pooling and visibility of raw, refining and ready-to-haul refined mineral batches across Stanton & Pyro stations. Instant sub-150ms WebRTC sync via <code>CORPO_STOCK_SYNC</code> packets.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Calculateur de Valeur Nette de Guilde (Guild Net Worth)</strong> : Évaluation financière en direct du patrimoine minier de la corporation en aUEC basée sur les cours de marché UEX Corp, déduite des dépenses engagées.',
        text_en: '<strong>Live Guild Net Worth Calculator</strong>: Real-time valuation of total corporation mineral assets in aUEC dynamically tracked against UEX Corp live market prices minus incurred fleet expenses.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Grand Livre des Dépenses Partagées (Corpo Expense Ledger)</strong> : Enregistrement centralisé et collaboratif des frais engagés (frais de raffinage, carburant Quantum, réparations, primes d\'escorte) pour un calcul transparent du bénéfice net réel de l\'opération et export 1-clic Discord.',
        text_en: '<strong>Shared Corpo Expense Ledger</strong>: Centralized tracking of fleet operating expenses (refinery fees, quantum fuel, ship repairs, escort pay) automatically deducted from gross revenue for transparent crew splits with 1-click Discord export.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Statuts Logistiques Allégés & Notifications Web Push Déportées</strong> : Évite tout doublon avec les kiosques de jeu en proposant un statut logistique clair ("En raffinage" / "Prêt au transport") couplé à des notifications Push système sur PC et mobile dès qu\'un lot est prêt à être chargé dans un transporteur C2/Caterpillar.',
        text_en: '<strong>Streamlined Refining Status & Desktop/Mobile Push Notifications</strong>: Avoids redundant in-game clutter by providing a clear logistics status ("In Refinery" / "Ready to Haul") paired with native Web Push notifications alerting pilots on PC & smartphone when batches are ready for C2/Caterpillar hauling.'
      }
    ]
  },
  {
    version: 'v2.1.0',
    isCurrent: false,
    title_fr: 'Jalon 6 : Bourse Commerciale, API UEX Corp & Intelligence de Guilde',
    title_en: 'Milestone 6: Commodity Exchange, UEX Corp API & Guild Scouts',
    date_fr: 'Version Précédente',
    date_en: 'Previous Version',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Intégration API Live UEX Corp & Cache Hors-Ligne</strong> : Connexion transparente à l\'API publique UEX Corp (<code>uexcorp.space</code>) pour récupérer les cours réels d\'achat et vente des minerais dans les terminaux TDD et stations de Stanton, Pyro et Nyx. Cache local persistant permettant un fonctionnement 100% hors-ligne avec badge d\'état dynamique (UEX LIVE / UEX CACHE / UEX GUILDE).',
        text_en: '<strong>Live UEX Corp API & Offline Cache</strong>: Seamless integration with UEX Corp public API (<code>uexcorp.space</code>) fetching spot commodity prices across TDD terminals in Stanton, Pyro and Nyx. Persistent local cache for 100% offline operations with dynamic status badge (UEX LIVE / UEX CACHE / UEX GUILDE).'
      },
      {
        tag: 'new',
        text_fr: '<strong>Moteur d\'Arbitrage Économique (Brut vs Raffiné)</strong> : Comparateur en temps réel entre la vente brute immédiate et l\'ensemble des procédés de raffinage (Dinyx, Ferris Carbide, Cormack, Pyro-Burst) avec déduction des frais, calcul du rendement bonus de station, gain net en aUEC et ROI (+%).',
        text_en: '<strong>Economic Arbitrage Engine (Raw vs Refined)</strong>: Real-time visual comparison between immediate raw sale and all refining methods (Dinyx, Ferris, Cormack, Pyro-Burst) accounting for refinery fees, station bonuses, net payout, and ROI percentage.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Calculateur de Tournée Commerciale Optimale</strong> : Analyse globale de la cargaison du mineur ou du transporteur et génération automatique d\'une tournée de vente multi-arrêts classée par profit maximum avec bouton 1-clic <code>📋 Copier la tournée</code> pour le chat ou Discord.',
        text_en: '<strong>Optimal Trade Tour Route Calculator</strong>: Whole-hold cargo analysis and automatic multi-stop sales route planning maximizing total revenue with 1-click <code>📋 Copy Tour Route</code> for game chat or Discord.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Éclaireurs de Guilde & Crowdsourcing P2P (Fleet-Net)</strong> : Mise à jour collaborative des cours en 1 tap lors de la visite d\'un terminal TDD. Diffusion instantanée du paquet <code>CORPO_PRICE_UPDATE</code> à toute la flotte via WebRTC (< 150 ms) avec badge d\'éclaireur vérifié.',
        text_en: '<strong>Corpo Price Scouts & P2P Crowdsourcing (Fleet-Net)</strong>: 1-tap collaborative spot price verification at TDD terminals. Instant sub-150ms broadcast of <code>CORPO_PRICE_UPDATE</code> packets across WebRTC to all wingmen with verified scout badges.'
      }
    ]
  },
  {
    version: 'v2.0.0',
    isCurrent: false,
    title_fr: 'Jalon 5 : Transport Spécialisé & Logistique de Fret (Cargo Refactor 4.0)',
    title_en: 'Milestone 5: Specialized Haulers & Freight Logistics (Cargo Refactor 4.0)',
    date_fr: 'Version Précédente',
    date_en: 'Previous Version',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Flotte de Transporteurs 4.0 Authentique</strong> : Intégration de 10 transporteurs de fret (Constellation Taurus 174 SCU, RAFT 192 SCU, Caterpillar 576 SCU, C2 Hercules 696 SCU, Freelancer MAX 120 SCU, Hull A 64 SCU, Zeus Mk II CL 128 SCU, Cutlass Black 46 SCU, Hull C 4 608 SCU) avec rayons tracteurs dédiés S1/S2/S3 (6 000 à 45 000 N), topologies de grille (interne, externe, modulaire, spindle) et calcul des limites de sacoches Prospector & MOLE.',
        text_en: '<strong>Authentic 4.0 Cargo Hauler Fleet</strong>: Comprehensive support for 10 freight haulers (Taurus 174 SCU, RAFT 192 SCU, Caterpillar 576 SCU, C2 696 SCU, Freelancer MAX 120 SCU, Hull A 64 SCU, Zeus CL 128 SCU, Cutlass Black 46 SCU, Hull C 4,608 SCU) with dedicated S1/S2/S3 tractor beams (6,000 to 45,000 N), physicalized grid topologies, and max saddlebag capacities.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Arrimage Ship-to-Ship en Plein Espace (Fleet-Net)</strong> : Bouton mineur <code>📡 APPELER TRANSPORT DE FRET</code> pour diffuser une demande d\'arrimage. Récupération instantanée par les transporteurs au rayon tracteur (<code>🧲 ARRIMAGE</code>), libérant automatiquement la soute et les sacoches du mineur sans retour en station.',
        text_en: '<strong>In-Space Ship-to-Ship Cargo Transfer (Fleet-Net)</strong>: Miner 1-click action <code>📡 REQUEST CARGO PICKUP</code> to broadcast floating saddlebags. Instant recovery by wing haulers via tractor beam (<code>🧲 DOCK</code>), liberating miner hold capacity on the fly.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Gestionnaire de Grille de Fret Physicalisée (Cargo Grid Master)</strong> : Visualisation temps réel des conteneurs et sacoches arrimés sur la grille, indicateur d\'instabilité critique pour le Quantainium, estimation financière brute/raffinée et déchargement station 1-clic.',
        text_en: '<strong>Physicalized Cargo Grid Master</strong>: Real-time visual display of physicalized cargo boxes & saddlebags, Quantainium instability alert badge, live raw/refined valuation, and station terminal cargo dump.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Commission Transporteur Dédiée</strong> : Curseur de répartition des gains (0 à 35%) pour rémunérer équitablement les pilotes de transport lourd au sein de l\'escadre.',
        text_en: '<strong>Dedicated Hauler Commission Cut</strong>: Squad profit split slider (0-35%) to fairly compensate heavy cargo transport pilots.'
      }
    ]
  },
  {
    version: 'v1.9.0',
    isCurrent: false,
    title_fr: 'Jalon 4 : Coordination Tactique, Solveur Optimal 4.0 & Escorte de Combat',
    title_en: 'Milestone 4: Tactical Coordination, Optimal Loadout Solver 4.0 & Combat Escort',
    date_fr: 'Version Actuelle (Alpha 4.10)',
    date_en: 'Current Version (Alpha 4.10)',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Solveur de Loadout Optimal 4.0</strong> : Calcul prédictif automatique du meilleur loadout (tête laser, sous-modules, gadgets de surface) selon la masse et la résistance de la roche. Recommandation Solo et Escadre avec bouton 1-clic <code>⚡ ÉQUIPER CE LOADOUT</code> synchronisé avec la flotte.',
        text_en: '<strong>Optimal Loadout Solver 4.0</strong>: Automated predictive calculation of optimal mining head, sub-modules, and surface gadget based on rock mass & resistance. Solo & Wing recommendations with 1-click <code>⚡ EQUIP THIS LOADOUT</code> synced with the fleet.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Conseiller de Tir Conjoint & Séquençage</strong> : Protocole en 3 phases tactiques (Affaiblissement Lancet < 20%, Saturation Helix, Régulation zone verte 45-50%). Jauge de risque de surchauffe collective en temps réel et boutons de signalement radio (VEILLE, CHARGE, ZONE VERTE, SURCHAUFFE).',
        text_en: '<strong>Joint Fire Coordinator & Stepped Sequencing</strong>: 3-phase tactical protocol (Lancet softening < 20%, Helix saturation, Green zone regulation 45-50%). Real-time cumulative overcharge risk gauge and live radio state sync buttons (STANDBY, CHARGING, GREEN ZONE, OVERHEAT).'
      },
      {
        tag: 'new',
        text_fr: '<strong>Module Sentinelle & Escorte (RED ALERT)</strong> : Déclenchement d\'alerte pirate en 1 tap avec sirène sonore d\'urgence, annonce vocale (TTS), calcul automatique du vecteur de repli Quantum (OM ou station la plus proche) et curseur de prime d\'escorte de combat (0-35%).',
        text_en: '<strong>Sentinel & Escort Module (RED ALERT)</strong>: 1-tap pirate red alert trigger with emergency audio siren, cockpit voice callout (TTS), automatic quantum jump vector escape calculation (closest OM / station), and escort risk cut slider (0-35%).'
      }
    ]
  },
  {
    version: 'v1.8.0',
    isCurrent: false,
    title_fr: 'Jalons 1, 2 & 3 : Réseau Fleet-Net P2P, Crafting 4.0 & Scanner OCR Instantané',
    title_en: 'Milestones 1, 2 & 3: Fleet-Net P2P Network, Crafting 4.0 & Instant OCR Scanner',
    date_fr: 'Version précédente (Alpha 4.10)',
    date_en: 'Previous Version (Alpha 4.10)',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Jalon 1 — Réseau Tactique P2P FLEET-NET</strong> : Interconnexion décentralisée WebRTC chiffrée & BroadcastChannel local (< 150ms). Indicateur de ping RTT en direct, statut de comms chiffrées et salon d\'escadre par code court (ex: <code>WING-4982</code>).',
        text_en: '<strong>Milestone 1 — Decentralized Tactical FLEET-NET</strong>: End-to-end encrypted WebRTC DataChannels & local BroadcastChannel (< 150ms). Real-time RTT ping indicator, encrypted comms badge, and short room codes (e.g. <code>WING-4982</code>).'
      },
      {
        tag: 'new',
        text_fr: '<strong>Jalon 2 — Sync Flotte & Atelier Crafting 4.0</strong> : Synchronisation automatique des loadouts, lasers et tourelles. Atelier de confection de têtes artisanales (Watts, résistance, instabilité, slots) et gadgets sur-mesure diffusés à l\'escadre.',
        text_en: '<strong>Milestone 2 — Ship Sync & Crafting Workshop 4.0</strong>: Instant loadout, laser, and turret sync. Workshop for crafting custom mining heads (Watts, resistance, instability, slots) and custom gadgets shared with the wing.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Jalon 3 — Télémétrie de Scan & Scanner OCR Instantané</strong> : Diffusion instantanée du scan rocheux (<code>ROCK_BROADCAST</code>), bandeau d\'alerte tactique, auto-sync silencieux, voix cockpit (TTS) et scanner OCR 100% local (F12, glisser-déposer, caméra smartphone en direct avec réticule et 3 échantillons de test).',
        text_en: '<strong>Milestone 3 — Shared Scan Telemetry & Instant OCR Scanner</strong>: Instant rock scan broadcast (<code>ROCK_BROADCAST</code>), incoming alert banner, silent auto-sync, cockpit voice (TTS), and 100% local OCR scanner (F12, drag & drop, live smartphone camera with reticle, and 3 test samples).'
      }
    ]
  },
  {
    version: 'v1.6.4',
    isCurrent: false,
    title_fr: 'Correctif Critique Calcul Réactif & Synthèse Vocale',
    title_en: 'Critical Fix: Reactive Calculation & Voice Synthesis',
    date_fr: 'Version précédente (Alpha 4.10)',
    date_en: 'Previous Version (Alpha 4.10)',
    items: [
      {
        tag: 'fixed',
        text_fr: '<strong>Mise à Jour Instantanée des Minerais</strong> : Correction d\'une méthode manquante dans le module vocal (speakTarget/stop) qui interrompait le script lors de la sélection d\'un minerai. Le calcul dynamique de résistance, instabilité et puissance s\'applique désormais instantanément.',
        text_en: '<strong>Instant Calculation on Mineral Selection</strong>: Fixed a missing method in voice synthesis module (speakTarget/stop) that threw an exception upon mineral selection. Dynamic rock properties and laser calculations now immediately apply.'
      }
    ]
  },
  {
    version: 'v1.6.3',
    isCurrent: false,
    title_fr: 'Refonte du Manuel & Guide Prise en Main (4.10)',
    title_en: 'Operating Manual & Walkthrough Guide Overhaul (4.10)',
    date_fr: 'Version précédente (Alpha 4.10)',
    date_en: 'Previous Version (Alpha 4.10)',
    items: [
      {
        tag: 'improved',
        text_fr: '<strong>Manuel Interactif Complètement Actualisé</strong> : Intégration des nouveaux vaisseaux (Arrastra, Orion, ROC-DS), des archétypes géologiques réactifs, du décodeur Radar RS 2.0, de la coordination d\'escouade et du mode mobiGlas 4.0.',
        text_en: '<strong>Operating Manual Fully Updated</strong>: Detailed walkthroughs for new mining ships (Arrastra, Orion, ROC-DS), reactive archetypes, Radar RS 2.0 decoder, wing multiplayer coordination, and holographic mobiGlas 4.0.'
      }
    ]
  },
  {
    version: 'v1.6.2',
    isCurrent: false,
    title_fr: 'Recalcul Réactif Automatique Géologie & Minerais',
    title_en: 'Automatic Reactive Recalculation for Geology & Minerals',
    date_fr: 'Version précédente (Alpha 4.10)',
    date_en: 'Previous Version (Alpha 4.10)',
    items: [
      {
        tag: 'improved',
        text_fr: '<strong>Calcul Immédiat sans Validation Manuelle</strong> : La sélection d\'un archétype rocheux, d\'un minerai primaire ou secondaire recalcule immédiatement la résistance, l\'instabilité et la fracturation sans avoir à cliquer sur « Auto-calculer ».',
        text_en: '<strong>Instant Calculation on Selection</strong>: Selecting a rock archetype, primary ore, or secondary mineral now immediately computes dynamic resistance, instability, and laser fracture without requiring a click on "Auto-Calculate".'
      }
    ]
  },
  {
    version: 'v1.6.1',
    isCurrent: false,
    title_fr: 'Épuration du Volet Données du Scan',
    title_en: 'Rock Scan Data Clean-up',
    date_fr: 'Version précédente (Alpha 4.10)',
    date_en: 'Previous Version (Alpha 4.10)',
    items: [
      {
        tag: 'improved',
        text_fr: '<strong>Nettoyage du Volet Données du Scan</strong> : Retrait du sélecteur rapide de tête laser redondant dans le panneau de roche, l\'équipement complet étant centralisé dans la modale Loadout et le gestionnaire de profils.',
        text_en: '<strong>Rock Scan Panel Clean-up</strong>: Removed redundant mining head selector from rock scan data panel, keeping equipment management centralized in Loadout modal and profiles manager.'
      }
    ]
  },
  {
    version: 'v1.6.0',
    isCurrent: false,
    title_fr: 'Gestionnaire de Profils & Sauvegardes d\'Équipement Personnalisées',
    title_en: 'Loadout Profiles Manager & Custom Saved Configurations',
    date_fr: 'Version précédente (Alpha 4.10)',
    date_en: 'Previous Version (Alpha 4.10)',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Gestionnaire Multi-Profils Nommés</strong> : Enregistrez, nommez, chargez, mettez à jour et supprimez vos configurations d\'équipement personnalisées avec persistance locale.',
        text_en: '<strong>Multi-Profile Loadout Manager</strong>: Save, name, load, update, and delete custom named loadouts with offline persistence.'
      },
      {
        tag: 'new',
        text_fr: '<strong>5 Préréglages Recommandés (Défaut)</strong> : Préréglages d\'usine prêts à l\'emploi pour Prospector (Équilibré & Puissance), MOLE (Trio), Arrastra (Lourd S3) et ROC.',
        text_en: '<strong>5 Recommended Factory Presets</strong>: Ready-to-use factory setups for Prospector (Balanced & Heavy), MOLE (Trio), Arrastra (Heavy S3), and ROC.'
      }
    ]
  },
  {
    version: 'v1.5.1',
    isCurrent: false,
    title_fr: 'Personnalisation Indicatif Pilote & Épuration Radar RS',
    title_en: 'Pilot Callsign Customization & RS Radar Clean-up',
    date_fr: 'Version précédente (Alpha 4.10)',
    date_en: 'Previous Version (Alpha 4.10)',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Personnalisation de l\'Indicatif (Callsign)</strong> : Modifiez et persistez votre indicatif de pilote depuis le bandeau supérieur mobiGlas ou depuis la carte Chef d\'escadre avec sauvegarde automatique locale.',
        text_en: '<strong>Pilot Callsign Customization</strong>: Edit and persist your operational radio callsign from the top mobiGlas status bar or the Fleet squad leader card with offline storage.'
      },
      {
        tag: 'improved',
        text_fr: '<strong>Épuration Radar RS</strong> : Retrait des préréglages rapides superflus pour optimiser la saisie directe de la signature scannée sur le HUD.',
        text_en: '<strong>RS Radar Clean-up</strong>: Removed cluttered signature presets in favor of direct input and HUD scan matching.'
      }
    ]
  },
  {
    version: 'v1.5.0',
    isCurrent: false,
    title_fr: 'Refonte mobiGlas 4.0, Coordination de Flotte & Tourelles Unifiées',
    title_en: 'mobiGlas 4.0 Layout, Fleet Coordination & Unified Turrets',
    date_fr: 'Version précédente (Alpha 4.10)',
    date_en: 'Previous Version (Alpha 4.10)',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Coordination d\'Escouade & Flotte Multi-Vaisseaux</strong> : Gérez une escadre complète (Prospector, MOLE, ROC, C2 Hercules, etc.) avec cumul automatique des tirs laser, réduction conjointe de la résistance et répartition équitable des profits.',
        text_en: '<strong>Multiplayer Fleet & Squad Mining</strong>: Coordinate a full wing (Prospector, MOLE, ROC, C2 Hercules, etc.) with joint laser beam power stacking, shared rock resistance reduction, and net profit split per player.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Intégration RSI Arrastra & RSI Orion</strong> : Support des 3 tourelles Size 3 de l\'Arrastra (576 SCU) et des 2 tourelles lourdes de l\'Orion (2 880 SCU) avec 6 têtes laser Size 3 authentiques.',
        text_en: '<strong>RSI Arrastra & RSI Orion Integration</strong>: Full support for Arrastra 3x Size 3 remote turrets (576 SCU) and Orion 2x heavy turrets (2,880 SCU) with 6 authentic Size 3 laser heads.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Présentation Holographique mobiGlas 4.0 & Dock</strong> : Interface holographique inspirée du mobiGlas Star Citizen et dock d\'applications rapide avec accès instantané aux 9 outils.',
        text_en: '<strong>mobiGlas 4.0 Holographic Layout & Dock</strong>: Complete visual redesign inspired by authentic Star Citizen mobiGlas holography and 9-app quick launcher dock.'
      },
      {
        tag: 'improved',
        text_fr: '<strong>Architecture Unifiée des Tourelles</strong> : Élimination du doublon de la première tourelle et bloc de configuration pliable unifié (1 à 3 tourelles) avec slots de modules dynamiques pour tous les vaisseaux.',
        text_en: '<strong>Unified Dynamic Turrets Architecture</strong>: Removed Turret 1 duplicate and established unified collapsible turret card blocks (1 to 3 turrets) with dynamic module slots for all ships.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Bouton Soutenir Dédié</strong> : Remplacement des boutons de bascule en faveur du bouton « Soutenir » dans le bandeau supérieur, le dock et le pied de page.',
        text_en: '<strong>Dedicated Support Buttons</strong>: Replaced legacy layout switches with direct Community Support triggers in top header, dock, and footer.'
      }
    ]
  },
  {
    version: 'v1.4',
    isCurrent: false,
    title_fr: 'Star Citizen Alpha 4.10 Mining Overhaul (Archétypes, Multi-Minerais, Sacoches & Radar 2.0)',
    title_en: 'Star Citizen Alpha 4.10 Mining Overhaul (Archetypes, Multi-Ore, Saddlebags & Radar 2.0)',
    date_fr: 'Version précédente (Alpha 4.10)',
    date_en: 'Previous Version (Alpha 4.10)',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Archétypes Géologiques (9 Familles)</strong> : Intégration des roches officielles (Basalte, Granite, Obsidienne, Magmatique, Felsique, Gneiss, Quartzite, Schiste, Atacamite) avec résistance et densité de base.',
        text_en: '<strong>Geological Archetypes (9 Families)</strong>: Integration of official rock archetypes (Basalt, Granite, Obsidian, Igneous, Felsic, Gneiss, Quartzite, Shale, Atacamite) with baseline resistance and density.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Scan Multi-Minerais & Gravier Inerte</strong> : Saisie simultanée de 2 minerais avec calcul automatique du pourcentage de matériaux inertes stériles.',
        text_en: '<strong>Multi-Ore Scan & Inert Waste Gauge</strong>: Simultaneous primary and secondary ore inputs with automatic inert waste calculation.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Décodeur Radar Ping RS 2.0</strong> : Identificateur longue portée pour scanner les astéroïdes (TAB) avant même de s\'approcher à 500 mètres.',
        text_en: '<strong>Radar Ping RS 2.0 Decoder</strong>: Long-range ping signature identifier to detect distant asteroid content without flying close.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Sacoches Amovibles (Saddlebags 4.10)</strong> : Suivi des sacs détachés au rayon tracteur pour Prospector (4x 8 SCU) et MOLE (8x 12 SCU) pour les transporteurs alliés.',
        text_en: '<strong>Detachable Saddlebags (4.10)</strong>: Track tractor-beamed pods for Prospector (4x 8 SCU) and MOLE (8x 12 SCU) to coordinate with allied cargo ships.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Voix Cockpit Synthétisée (TTS)</strong> : Annonces vocales immersives (alertes laser, Quantainium chargé, fin de raffinage) 100% hors-ligne.',
        text_en: '<strong>Cockpit Voice Assistant (TTS)</strong>: Immersive offline cockpit audio announcements (laser alerts, Quantainium countdown, refinery completions).'
      },
      {
        tag: 'new',
        text_fr: '<strong>Greycat ROC-DS</strong> : Support du véhicule minier biplace avec soute augmentée de 1.2 SCU (1 200 gemmes).',
        text_en: '<strong>Greycat ROC-DS</strong>: Support for the dual-seat ground vehicle with expanded 1.2 SCU (1,200 gems) hopper.'
      },
      {
        tag: 'improved',
        text_fr: '<strong>Calcul Dynamique Résistance / Instabilité</strong> : Les propriétés physiques de la roche sont déduites automatiquement de la composition minérale et de l\'archétype.',
        text_en: '<strong>Dynamic Resistance & Instability Engine</strong>: Physical rock properties scale dynamically from the ore composition and geological archetype.'
      }
    ]
  },
  {
    version: 'v1.3',
    isCurrent: false,
    title_fr: 'Expansion Multi-Systèmes (Pyro 4.0, Nyx & Stanton) & 6 Nouveaux Minerais',
    title_en: 'Multi-System Expansion (Pyro 4.0, Nyx & Stanton) & 6 New Ores',
    date_fr: 'Dernière version (14 Oct 2026)',
    date_en: 'Latest Version (Oct 14, 2026)',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Système Pyro (Alpha 4.0)</strong> : Prise en charge intégrale du secteur hors-la-loi Pyro avec 4 ponts de raffinage intégrés (Checkmate, Ruin Station Terminus, Orbituary, Gateway) et 4 hotspots géologiques.',
        text_en: '<strong>Pyro System (Alpha 4.0)</strong>: Full integration of the lawless Pyro frontier with 4 integrated refinery decks (Checkmate, Ruin Station Terminus, Orbituary, Gateway) and 4 geological hotspots.'
      },
      {
        tag: 'new',
        text_fr: '<strong>6 Nouveaux Minerais 4.0</strong> : Stileron (blindage militaire, RS 3185), Riccite (alliage élastique, RS 3385), Lindinium (RS 3400), Sadaryx (cristal de Nyx, RS 3320), Savrilium (RS 3200) et Carinite (RS 3450).',
        text_en: '<strong>6 New 4.0 Minerals</strong>: Stileron (heavy military armor, RS 3185), Riccite (elastic alloy, RS 3385), Lindinium (RS 3400), Sadaryx (Nyx crystal, RS 3320), Savrilium (RS 3200), and Carinite (RS 3450).'
      },
      {
        tag: 'new',
        text_fr: '<strong>Signatures Radar RS (Radar Cross-Section)</strong> : Signatures officielles 1x intégrées sur chaque fiche minerai pour identifier le contenu des roches dès le ping radar sans s\'approcher.',
        text_en: '<strong>Radar Scan Signatures (RS)</strong>: Official 1x base signatures embedded into each ore card to determine rock compositions directly from ping scans.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Filtres par Système</strong> : Barre de filtrage instantané sur la grille des minerais [TOUS], [STANTON], [PYRO (4.0)], [NYX].',
        text_en: '<strong>System Filters</strong>: Instant filtering pills on the ore grid [ALL], [STANTON], [PYRO (4.0)], [NYX].'
      },
      {
        tag: 'new',
        text_fr: '<strong>Atlas Minier à 3 Systèmes</strong> : Navigation par onglets entre Stanton & Aaron Halo, Système Pyro (haut risque), et Système Nyx (Delamar & Levski).',
        text_en: '<strong>3-System Mining Atlas</strong>: Tabbed navigation between Stanton & Aaron Halo, Pyro System (high risk), and Nyx System (Delamar & Levski).'
      },
      {
        tag: 'improved',
        text_fr: '<strong>Cache PWA v9 & Network-First</strong> : Stratégie de cache réseau prioritaire garantissant que vous recevez immédiatement les nouvelles versions sans rester bloqué sur un cache obsolète.',
        text_en: '<strong>PWA Cache v9 & Network-First</strong>: Network-first cache strategy guaranteeing you receive updates immediately without getting trapped on stale cache.'
      }
    ]
  },
  {
    version: 'v1.2',
    isCurrent: false,
    title_fr: 'Tactical Overhaul & 6 Nouveaux Outils Miniers',
    title_en: 'Tactical Overhaul & 6 Mining Tools',
    date_fr: 'Mise à jour v1.2',
    date_en: 'v1.2 Update',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Simulateur de Sous-Roches (Break Tree)</strong> : Modélisation physique des 3 sous-blocs avec codes couleurs Star Citizen (Violet aspirable, Orange à re-fracturer, Gris inerte) et extraction 1-clic.',
        text_en: '<strong>Sub-Chunk Fracture Simulator (Break Tree)</strong>: Physical modeling of 3 sub-chunks with official Star Citizen color codes (Purple extractable, Orange to re-fracture, Gray inert) and 1-click hold extraction.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Gestionnaire de Raffinage en direct</strong> : Suivi des commandes en cours avec décompte temps réel hh:mm:ss, calcul de rentabilité selon les 4 procédés industriels et alertes de ramassage.',
        text_en: '<strong>Live Refinery Job Tracker</strong>: Multi-station queue with real-time hh:mm:ss countdowns, process duration calculations across 4 industrial methods, and ready-to-collect notifications.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Assistant Tactique de Gadgets & Modules</strong> : Recommandation dynamique de Sabir 21, BoreMax, Stalwart ou Surge selon le déficit laser, avec bouton 1-clic pour appliquer.',
        text_en: '<strong>Tactical Gadget & Module Advisor</strong>: Dynamic recommendations for Sabir 21, BoreMax, Stalwart, or Surge based on laser deficit, with a 1-click apply button.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Mode Cluster ROC Terrestre</strong> : Calculateur dédié aux filons de gemmes de surface (Hadanite, Dolivine, Aphorite) avec contrôleur de cailloux et jauge de remplissage 0.8 SCU.',
        text_en: '<strong>ROC Gem Cluster Mode</strong>: Specialized calculator for surface gem clusters (Hadanite, Dolivine, Aphorite) with node count selector and 0.8 SCU capacity meter.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Journal de Vol & Statistiques</strong> : Suivi des gains totaux, rentabilité horaire (aUEC/h), volume extrait et exports complets en formats <strong>JSON</strong> et <strong>CSV (Excel)</strong>.',
        text_en: '<strong>Flight Ledger & Statistics</strong>: Track total cumulative earnings, hourly profitability (aUEC/h), extracted volume, and 1-click exports to <strong>JSON</strong> and <strong>CSV (Excel)</strong>.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Télémètre Aaron Halo</strong> : Calculateur interactif de distance de coupe Quantum vers les Bandes 4, 5 et 6 avec jauge de proximité et alerte sonore d\'arrêt immédiat.',
        text_en: '<strong>Aaron Halo QT Rangefinder</strong>: Interactive calculator for Quantum Drive drop distance to Bands 4, 5, and 6 with proximity gauge and emergency cut alert.'
      },
      {
        tag: 'improved',
        text_fr: '<strong>Support Bilingue Intégral</strong> : Bascule instantanée Français 🇫🇷 / Anglais 🇬🇧 sur 100% des textes, boutons, badges, notes de version et infobulles.',
        text_en: '<strong>Full Bilingual Support</strong>: Instant French 🇫🇷 / English 🇬🇧 toggle across 100% of UI text, buttons, badges, changelog, and tooltips.'
      },
      {
        tag: 'fix',
        text_fr: '<strong>Optimisation Offline & Cache PWA</strong> : Persistance locale via localStorage et mise en cache Service Worker v5 pour un fonctionnement 100% autonome sans connexion.',
        text_en: '<strong>Offline Optimization & PWA Cache</strong>: Client-side persistence via localStorage and Service Worker v5 cache update for 100% offline, serverless operation.'
      }
    ]
  },
  {
    version: 'v1.1',
    isCurrent: false,
    title_fr: 'Argo MOLE Multi-Crew & Thèmes de Cockpit',
    title_en: 'Argo MOLE Multi-Crew & Cockpit Themes',
    date_fr: 'Mise à jour majeure',
    date_en: 'Major Update',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Gestion des 3 tourelles du MOLE</strong> : Sélecteur Solo (1 tourelle), Duo (2 tourelles) ou Trio (3 tourelles actives) avec calcul de puissance combinée et configuration laser par tourelle.',
        text_en: '<strong>Argo MOLE 3-Turret Management</strong>: Solo (1 turret), Duo (2 turrets), and Trio (3 active turrets) mode with combined laser power calculation and individual turret loadout.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Partage d\'équipage Multi-crew</strong> : Calculateur de répartition des gains avec déduction configurable de la réserve de bord (carburant, réparations).',
        text_en: '<strong>Multi-Crew Profit Splitter</strong>: Fair earnings distribution per crew member with configurable ship operational reserve (fuel, maintenance, consumables).'
      },
      {
        tag: 'new',
        text_fr: '<strong>4 Thèmes Cockpit</strong> : MISC Cyan, Drake Ambre, Aegis Émeraude et RSI Glace avec adaptation chromatique complète du HUD.',
        text_en: '<strong>4 Cockpit HUD Themes</strong>: MISC Cyan, Drake Amber, Aegis Emerald, and RSI Arctic Ice with complete color palette adaptation.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Garde d\'écran active (Wake Lock)</strong> : Empêche la mise en veille automatique de la tablette ou smartphone en vol.',
        text_en: '<strong>Screen Wake Lock</strong>: Keeps phone/tablet display awake during long mining runs and quantum travel.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Export Rapport Discord</strong> : Synthèse visuelle formatée prête à coller dans les salons Discord de corporation.',
        text_en: '<strong>Discord Mining Report</strong>: Pre-formatted operational summary ready to paste into organization Discord channels.'
      },
      {
        tag: 'improved',
        text_fr: '<strong>Refonte ergonomique tactile</strong> : Cibles tactiles minimales 44px, retour haptique vibrant sur appareils mobiles.',
        text_en: '<strong>Tactile & Mobile Ergonomics</strong>: 44px minimum touch targets and vibration haptic feedback on compatible devices.'
      }
    ]
  },
  {
    version: 'v1.0',
    isCurrent: false,
    title_fr: 'Lancement Initial',
    title_en: 'Initial Launch',
    date_fr: 'Fondation AARON MFD',
    date_en: 'AARON MFD Foundation',
    items: [
      {
        tag: 'new',
        text_fr: 'Calculateur immédiat de faisabilité laser et rentabilité brute/raffinée.',
        text_en: 'Instant laser fracture feasibility evaluation and raw vs. refined profit calculation.'
      },
      {
        tag: 'new',
        text_fr: 'Minuteur d\'instabilité Quantainium de 15 minutes avec alertes critiques.',
        text_en: '15-minute Quantainium volatility countdown timer with critical audio/visual alerts.'
      },
      {
        tag: 'new',
        text_fr: 'Base de données des minerais de Stanton (Quantainium, Bexalite, Taranite, Hadanite, etc.).',
        text_en: 'Stanton mineral database (Quantainium, Bexalite, Taranite, Hadanite, etc.) with up-to-date market values.'
      },
      {
        tag: 'new',
        text_fr: 'Guide des bonus des stations de raffinage et coordonnées de l\'Aaron Halo.',
        text_en: 'Refinery station bonus reference guide and Aaron Halo Quantum drop coordinates.'
      },
      {
        tag: 'new',
        text_fr: 'PWA installable hors-ligne avec synthèse audio Web Audio API.',
        text_en: 'Installable offline PWA with synthesized audio feedback via Web Audio API.'
      }
    ]
  }
];
