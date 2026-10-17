# SPÉCIFICATION TECHNIQUE & MODÈLE DU SYSTÈME DE RAFFINAGE (STAR CITIZEN 4.x)
> **Document de référence pour implémentation ultérieure dans Aaron MFD**  
> *Dernière mise à jour : Version 4.x Live & Pyro — Architecture industrielle*

---

## 1. Origine des Écarts entre Calculs Théoriques et le Jeu Réel

Les différences constatées entre les calculs sommaires et les chiffres réels des bornes de raffinage en jeu s'expliquent par 5 facteurs fondamentaux :

1. **Unité de compte native en jeu : le `cSCU` (centi-SCU)**
   - Dans Star Citizen, $1\text{ SCU} = 100\text{ cSCU}$.
   - Les sacs de minage (Prospector : 32 SCU = 3 200 cSCU, MOLE : 96 SCU = 9 600 cSCU) et les bornes enregistrent les quantités brutes en `cSCU` entiers.
   - Les arrondis et conversions doivent s'opérer au niveau du cSCU, puis être reconvertis en conteneurs SCU normalisés.

2. **Purge des Matériaux Inertes**
   - Lorsque la cargaison contient des matériaux inertes (ex. 45 % d'inertes sur 32 SCU), ceux-ci sont **rejetés sans frais et sans rendement** à la validation de la commande.
   - Seuls les cSCU de minerais nobles utiles entrent dans les calculs de rendement et de facturation.

3. **Coût de base unitaire par minerai (`BaseRefiningCostPerUnit`)**
   - Le jeu n'applique **pas** un coût forfaitaire moyen par SCU.
   - Chaque minerai possède un coût de raffinage de base par cSCU qui reflète sa rareté et sa complexité de traitement.
   - *Exemple :* Traiter 1 cSCU de Quantainium ou de Bexalite coûte 10 à 25 fois plus cher en frais de station que traiter 1 cSCU d'Aluminium ou de Quartz.

4. **Les 9 Méthodes Officielles CIG**
   - Le jeu dispose de 9 procédés exclusifs avec des profils très marqués de rendement, coût et durée.

5. **Affinités et Bonus de Station (Rendement > 100 %)**
   - Certaines raffineries spécialisées offrent des bonus (+5 % à +10 %) sur certains minerais (ex: ARC-L1 pour le Quantainium).
   - En combinant un procédé à haut rendement (Dinyx à 93 %) avec le bonus d'ARC-L1 (+10 %), le rendement effectif atteint **103 %**, produisant plus de SCU raffinés que le minerai pur extrait.

---

## 2. Matrice Complète des 9 Méthodes Officielles de Raffinage

| Méthode | Rendement de Base (`YieldRate`) | Multiplicateur Coût (`CostFactor`) | Vitesse / Durée (`SpeedFactor`) | Cas d'usage recommandé |
| :--- | :---: | :---: | :---: | :--- |
| **Dinyx Solventation** | **93 %** (0.93) | **0.15×** (Très faible) | **Très lente** (~24h - 36h) | **Rendement maximal & coût minime.** Idéal pour Quantainium, Bexalite, Laranite quand le joueur se déconnecte pour la nuit ou le weekend. |
| **Ferron Exchange** | **90 %** (0.90) | **0.50×** (Modéré) | **Moyenne / Lente** (~12h) | **Le meilleur compromis.** 90 % de rendement avec un délai 2× plus court que Dinyx. |
| **Pyrometric Chromalysis** | **90 %** (0.90) | **1.00×** (Très élevé) | **Lente** (~14h) | Rendement équivalent à Ferron mais frais très onéreux. Déconseillé sauf besoin spécifique. |
| **Electrostarolysis** | **84 %** (0.84) | **0.45×** (Modéré) | **Moyenne** (~8h) | Bon procédé pour métaux conducteurs (Cuivre, Or, Titane). |
| **Gaskin Process** | **83 %** (0.83) | **0.75×** (Élevé) | **Rapide** (~4h) | Rotation rapide pour minerais de valeur moyenne. |
| **Thermonatic Deposition**| **82 %** (0.82) | **0.30×** (Faible) | **Lente** (~10h) | Procédé économique mais vitesse pénalisante. |
| **Cormack Method** | **78 %** (0.78) | **0.40×** (Modéré) | **Rapide** (~3h) | Déchargement accéléré avec perte de 22 % de minerai. |
| **Kazen Winnowing** | **72 %** (0.72) | **0.35×** (Modéré) | **Moyenne** (~6h) | Faible rendement, peu utilisé en pratique. |
| **XCR Reaction** | **68 %** (0.68) | **1.20×** (Très élevé) | **Ultra-rapide** (~1h) | Traitement d'urgence pour vente immédiate. Forte perte de matière et coût maximal. |

---

## 3. Coûts de Base et Délais Indicatifs par Minerai (au cSCU)

| Minerai | Id | Coût Base Raffinage (`aUEC / cSCU`) | Temps Base (`sec / cSCU`) | Densité (`SCU / cSCU`) |
| :--- | :--- | :---: | :---: | :---: |
| **Quantainium** | `quantainium` | 2.40 | 18.0 | 0.01 |
| **Bexalite** | `bexalite` | 1.80 | 14.0 | 0.01 |
| **Taranite** | `taranite` | 1.50 | 12.0 | 0.01 |
| **Laranite** | `laranite` | 1.20 | 10.0 | 0.01 |
| **Agricium** | `agricium` | 0.95 | 8.5 | 0.01 |
| **Hephaestanite** | `hephaestanite` | 0.70 | 7.0 | 0.01 |
| **Boron** | `boron` | 0.65 | 6.5 | 0.01 |
| **Gold (Or)** | `gold` | 0.60 | 6.0 | 0.01 |
| **Diamond (Diamant)**| `diamond` | 0.50 | 5.0 | 0.01 |
| **Béryl** | `beryl` | 0.40 | 4.5 | 0.01 |
| **Copper (Cuivre)** | `copper` | 0.35 | 4.0 | 0.01 |
| **Titanium (Titane)** | `titanium` | 0.30 | 3.5 | 0.01 |
| **Corindon** | `corundum` | 0.20 | 3.0 | 0.01 |
| **Tungstène** | `tungsten` | 0.20 | 3.0 | 0.01 |
| **Aluminium** | `aluminum` | 0.12 | 2.0 | 0.01 |
| **Quartz** | `quartz` | 0.10 | 1.5 | 0.01 |
| **Inerte** | `inert` | 0.00 | 0.0 | 0.00 |

---

## 4. Affinités et Modificateurs des Raffineries

### A. Système Stanton
- **ARC-L1 Wide Forest :** Quantainium (+10 %), Bexalite (+3 %), Laranite (0 %), Béryl (-5 %). Frais station : 1.00×.
- **ARC-L2 Lonely Forest :** Laranite (+5 %), Titane (+4 %), Corindon (+3 %). Frais station : 0.98×.
- **ARC-L4 Faint Glen :** Béryl (+6 %), Quartz (+5 %). Frais station : 0.95×.
- **CRU-L1 Ambitious Dream :** Or (+5 %), Diamant (+4 %), Quantainium (-3 %). Frais station : 1.02×.
- **HUR-L1 Green Glade :** Taranite (+5 %), Cuivre (+4 %), Hephaestanite (+3 %). Frais station : 1.00×.
- **HUR-L2 Faithful Dream :** Tungstène (+5 %), Titane (+5 %). Frais station : 0.96×.
- **MIC-L1 Shallow Frontier :** Quantainium (+5 %), Bexalite (+5 %), Agricium (+4 %). Frais station : 1.04×.

### B. Système Pyro (4.0+)
- **Ruin Station :** Minerais illicites & Stileron (+8 %), Riccite (+7 %), Lindinium (+6 %). Frais station : 1.15× (risque élevé).
- **Checkmate Station :** Matériaux exotiques Pyro (+5 %). Frais station : 1.10×.

---

## 5. Formules Mathématiques du Moteur de Raffinage

### 1. Rendement Effectif par Minerai
$$\text{Yield \%}_{(m)} = \text{Clamp}\left(0, 120, \text{MethodYieldRate}_{(proc)} + \text{StationBonus}_{(st, m)}\right)$$
$$\text{Refined cSCU}_{(m)} = \text{Raw cSCU}_{(m)} \times \frac{\text{Yield \%}_{(m)}}{100}$$
$$\text{Refined SCU}_{(m)} = \frac{\text{Refined cSCU}_{(m)}}{100}$$

### 2. Coût Facturé de la Commande
$$\text{Ligne Coût}_{(m)} = \text{Raw cSCU}_{(m)} \times \text{BaseRefiningCostPerUnit}_{(m)} \times \text{MethodCostFactor}_{(proc)} \times \text{StationCostFactor}_{(st)}$$
$$\text{Coût Total de l'Ordre (aUEC)} = \sum_{m \in \text{Minerais Utiles}} \text{Ligne Coût}_{(m)}$$

### 3. Durée Réelle du Traitement
$$\text{Secondes Totales} = \left( \sum_{m \in \text{Minerais Utiles}} \text{Raw cSCU}_{(m)} \times \text{OreBaseProcessTimeSeconds}_{(m)} \right) \times \text{MethodSpeedFactor}_{(proc)}$$
$$\text{Affichage} = \text{FormatDurée}(\text{Secondes Totales}) \quad (\text{ex: 18 h 42 min})$$

### 4. Conditionnement des Boîtes de Fret (SC 3.24+ / 4.0)
Dans le système de fret moderne, les conteneurs physiques sont discrétisés en tailles standard :
$$\text{Boîtes autorisées} \in \{32, 24, 16, 8, 4, 2, 1\}\text{ SCU}$$
- La part fractionnaire restante ($< 1\text{ SCU}$) est conservée dans l'inventaire de la raffinerie jusqu'à consolidation ou empaquetage ultérieur.

### 5. Arbitrage Vente Brute vs Vente Raffinée
$$\text{Gain Vente Brute} = \sum_{m} \left( \text{Raw SCU}_{(m)} \times \text{RawPricePerSCU}_{(m)} \right)$$
$$\text{Gain Vente Raffinée} = \sum_{m} \left( \text{Refined SCU}_{(m)} \times \text{RefinedPricePerSCU}_{(m)} \right) - \text{Coût Total Ordre}$$
$$\Delta_{\text{Net}} = \text{Gain Vente Raffinée} - \text{Gain Vente Brute}$$
$$\text{Rentabilité \%} = \frac{\Delta_{\text{Net}}}{\text{Gain Vente Brute}} \times 100$$

---

## 6. Plan d'Implémentation dans Aaron MFD

1. **Fichier `data/game/refining.js` :**
   - Mettre à jour `REFINING_METHODS` avec les 9 vraies méthodes CIG (`dinyx`, `ferron`, `pyrometric`, `electrostarolysis`, `gaskin`, `thermonatic`, `cormack`, `kazen`, `xcr`).
   - Remplir la table `MINERAL_REFINING_COSTS` avec `baseCostPerUnit` et `baseTimeSeconds`.
   - Compléter `REFINERY_STATIONS` avec le dictionnaire exhaustif des bonus par minerai.

2. **Fichier `modules/mining/mining-calc.js` :**
   - Mettre à jour `compareAllRefineryMethods(scan)` pour utiliser la somme exacte pondérée par `cSCU` au lieu d'une moyenne forfaitaire.
   - Ajouter la fonction `calculateRefineryOrderWorkQuote({ rawCargoHold, stationId, methodId })`.
   - Ajouter le calcul de grille de conteneurs fret SCU (32, 16, 8, 4, 2, 1 SCU).

3. **Interface Utilisateur (`index.html` & `app.js`) :**
   - Remplacer le sélecteur simplifié à 3 méthodes par la comparaison interactive des 9 méthodes officielles.
   - Ajouter l'affichage côte-à-côte : **Vente Brute Immédiate vs Dinyx (Max Profit) vs Ferron (Équilibré) vs Cormack (Express)**.
   - Indicateur du minuteur persistant avec heure estimée de disponibilité de la cargaison.
