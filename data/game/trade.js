// Star Citizen Commodity Trading, Terminals, UEXcorp Config & Trade Routes
// Données officielles 4.x enrichies depuis FleetYards.net & UEX Corp

export const TRADE_TERMINALS = [
  {
    "id": "stanton_area18_tdd",
    "name": "Area18 TDD (ArcCorp)",
    "system": "stanton",
    "sector": "ArcCorp",
    "location_fr": "Riker Memorial Spaceport / Place Centrale, ArcCorp",
    "location_en": "Riker Memorial Spaceport / Central Plaza, ArcCorp",
    "type": "tdd",
    "quantumJumps": 0,
    "demandRating": "high",
    "isTdd": true,
    "priceModifiers": {
      "quantainium": {
        "refinedPrice": 268,
        "rawPrice": 128,
        "demand": "high"
      },
      "bexalite": {
        "refinedPrice": 182,
        "rawPrice": 88,
        "demand": "high"
      },
      "laranite": {
        "refinedPrice": 132,
        "rawPrice": 65,
        "demand": "medium"
      },
      "taranite": {
        "refinedPrice": 160,
        "rawPrice": 80,
        "demand": "high"
      },
      "borase": {
        "refinedPrice": 118,
        "rawPrice": 58,
        "demand": "high"
      },
      "agricium": {
        "refinedPrice": 90,
        "rawPrice": 44,
        "demand": "medium"
      },
      "gold": {
        "refinedPrice": 82,
        "rawPrice": 39,
        "demand": "medium"
      },
      "stileron": {
        "refinedPrice": 320,
        "rawPrice": 155,
        "demand": "extreme"
      }
    }
  },
  {
    "id": "stanton_newbabbage_tdd",
    "name": "New Babbage TDD (microTech)",
    "system": "stanton",
    "sector": "microTech",
    "location_fr": "The Commons / Promenade Commerciale, microTech",
    "location_en": "The Commons / Commercial Promenade, microTech",
    "type": "tdd",
    "quantumJumps": 1,
    "demandRating": "high",
    "isTdd": true,
    "priceModifiers": {
      "quantainium": {
        "refinedPrice": 262,
        "rawPrice": 126,
        "demand": "high"
      },
      "taranite": {
        "refinedPrice": 168,
        "rawPrice": 84,
        "demand": "high"
      },
      "bexalite": {
        "refinedPrice": 178,
        "rawPrice": 86,
        "demand": "high"
      },
      "laranite": {
        "refinedPrice": 130,
        "rawPrice": 64,
        "demand": "medium"
      },
      "agricium": {
        "refinedPrice": 94,
        "rawPrice": 46,
        "demand": "high"
      },
      "gold": {
        "refinedPrice": 84,
        "rawPrice": 40,
        "demand": "medium"
      },
      "borase": {
        "refinedPrice": 115,
        "rawPrice": 56,
        "demand": "medium"
      },
      "stileron": {
        "refinedPrice": 310,
        "rawPrice": 150,
        "demand": "high"
      }
    }
  },
  {
    "id": "stanton_lorville_cbd",
    "name": "Lorville Central Business District (Hurston)",
    "system": "stanton",
    "sector": "Hurston",
    "location_fr": "Tour Centrale Hurston Dynamics / CBD, Hurston",
    "location_en": "Hurston Dynamics Central Tower / CBD, Hurston",
    "type": "cbd",
    "quantumJumps": 1,
    "demandRating": "high",
    "isTdd": true,
    "priceModifiers": {
      "laranite": {
        "refinedPrice": 138,
        "rawPrice": 68,
        "demand": "high"
      },
      "gold": {
        "refinedPrice": 88,
        "rawPrice": 42,
        "demand": "high"
      },
      "agricium": {
        "refinedPrice": 92,
        "rawPrice": 45,
        "demand": "high"
      },
      "quantainium": {
        "refinedPrice": 254,
        "rawPrice": 122,
        "demand": "medium"
      },
      "bexalite": {
        "refinedPrice": 172,
        "rawPrice": 83,
        "demand": "medium"
      },
      "taranite": {
        "refinedPrice": 158,
        "rawPrice": 77,
        "demand": "medium"
      },
      "titanium": {
        "refinedPrice": 12,
        "rawPrice": 6,
        "demand": "high"
      }
    }
  },
  {
    "id": "stanton_orison_tdd",
    "name": "Orison Cloudview TDD (Crusader)",
    "system": "stanton",
    "sector": "Crusader",
    "location_fr": "Cloudview Center / Plateforme Industrielle, Crusader",
    "location_en": "Cloudview Center / Industrial Platform, Crusader",
    "type": "tdd",
    "quantumJumps": 1,
    "demandRating": "medium",
    "isTdd": true,
    "priceModifiers": {
      "quantainium": {
        "refinedPrice": 260,
        "rawPrice": 125,
        "demand": "high"
      },
      "hephaestanite": {
        "refinedPrice": 42,
        "rawPrice": 21,
        "demand": "high"
      },
      "bexalite": {
        "refinedPrice": 175,
        "rawPrice": 84,
        "demand": "medium"
      },
      "laranite": {
        "refinedPrice": 130,
        "rawPrice": 64,
        "demand": "medium"
      },
      "taranite": {
        "refinedPrice": 160,
        "rawPrice": 79,
        "demand": "medium"
      },
      "beryl": {
        "refinedPrice": 32,
        "rawPrice": 16,
        "demand": "medium"
      }
    }
  },
  {
    "id": "stanton_arcl1_admin",
    "name": "ARC-L1 Wide Forest Admin & Hub",
    "system": "stanton",
    "sector": "ArcCorp",
    "location_fr": "Pont Cargo & Terminal Administratif ARC-L1",
    "location_en": "Cargo Deck & Admin Terminal ARC-L1",
    "type": "admin",
    "quantumJumps": 0,
    "demandRating": "medium",
    "isTdd": false,
    "priceModifiers": {
      "quantainium": {
        "refinedPrice": 245,
        "rawPrice": 125,
        "demand": "high"
      },
      "bexalite": {
        "refinedPrice": 168,
        "rawPrice": 84,
        "demand": "medium"
      },
      "laranite": {
        "refinedPrice": 122,
        "rawPrice": 60,
        "demand": "medium"
      }
    }
  },
  {
    "id": "stanton_crul1_admin",
    "name": "CRU-L1 Ambitious Dream Admin",
    "system": "stanton",
    "sector": "Crusader",
    "location_fr": "Pont de Raffinage & Comptoir Commercial CRU-L1",
    "location_en": "Refinery Deck & Trade Kiosk CRU-L1",
    "type": "admin",
    "quantumJumps": 1,
    "demandRating": "medium",
    "isTdd": false,
    "priceModifiers": {
      "quantainium": {
        "refinedPrice": 246,
        "rawPrice": 125,
        "demand": "medium"
      },
      "taranite": {
        "refinedPrice": 154,
        "rawPrice": 76,
        "demand": "medium"
      },
      "bexalite": {
        "refinedPrice": 169,
        "rawPrice": 84,
        "demand": "medium"
      }
    }
  },
  {
    "id": "pyro_checkmate_admin",
    "name": "Checkmate Station Trade Deck (Pyro)",
    "system": "pyro",
    "sector": "Pyro I-II",
    "location_fr": "Hangar Central & Bourse Franche Checkmate",
    "location_en": "Central Hangar & Free Market Exchange Checkmate",
    "type": "outlaw",
    "quantumJumps": 2,
    "demandRating": "high",
    "isTdd": false,
    "priceModifiers": {
      "stileron": {
        "refinedPrice": 295,
        "rawPrice": 145,
        "demand": "high"
      },
      "riccite": {
        "refinedPrice": 238,
        "rawPrice": 118,
        "demand": "high"
      },
      "quantainium": {
        "refinedPrice": 278,
        "rawPrice": 135,
        "demand": "high"
      },
      "lindinium": {
        "refinedPrice": 155,
        "rawPrice": 78,
        "demand": "high"
      },
      "bexalite": {
        "refinedPrice": 184,
        "rawPrice": 89,
        "demand": "medium"
      }
    }
  },
  {
    "id": "pyro_ruin_station",
    "name": "Ruin Station • Terminus (Pyro VI)",
    "system": "pyro",
    "sector": "Terminus",
    "location_fr": "Profondeurs de l'astéroïde Ruin Station",
    "location_en": "Asteroid Core Caverns, Ruin Station",
    "type": "outlaw",
    "quantumJumps": 3,
    "demandRating": "high",
    "isTdd": false,
    "priceModifiers": {
      "stileron": {
        "refinedPrice": 310,
        "rawPrice": 152,
        "demand": "extreme"
      },
      "quantainium": {
        "refinedPrice": 285,
        "rawPrice": 138,
        "demand": "high"
      },
      "riccite": {
        "refinedPrice": 245,
        "rawPrice": 122,
        "demand": "high"
      },
      "taranite": {
        "refinedPrice": 175,
        "rawPrice": 85,
        "demand": "medium"
      }
    }
  },
  {
    "id": "pyro_orbituary_trade",
    "name": "Orbituary Trade Platform (Pyro)",
    "system": "pyro",
    "sector": "Pyro IV",
    "location_fr": "Pont de Décharge & Comptoir Minier Orbituary",
    "location_en": "Unload Deck & Mining Exchange Orbituary",
    "type": "outlaw",
    "quantumJumps": 2,
    "demandRating": "medium",
    "isTdd": false,
    "priceModifiers": {
      "riccite": {
        "refinedPrice": 240,
        "rawPrice": 120,
        "demand": "high"
      },
      "lindinium": {
        "refinedPrice": 152,
        "rawPrice": 76,
        "demand": "medium"
      },
      "quantainium": {
        "refinedPrice": 270,
        "rawPrice": 130,
        "demand": "medium"
      }
    }
  },
  {
    "id": "nyx_levski_customs",
    "name": "Levski Customs & Free Trade (Delamar)",
    "system": "nyx",
    "sector": "Delamar",
    "location_fr": "Bourse de Commerce Indépendante de Levski",
    "location_en": "Levski Independent Commodity Exchange",
    "type": "admin",
    "quantumJumps": 2,
    "demandRating": "high",
    "isTdd": false,
    "priceModifiers": {
      "bexalite": {
        "refinedPrice": 185,
        "rawPrice": 90,
        "demand": "high"
      },
      "borase": {
        "refinedPrice": 122,
        "rawPrice": 61,
        "demand": "high"
      },
      "taranite": {
        "refinedPrice": 166,
        "rawPrice": 82,
        "demand": "high"
      },
      "quantainium": {
        "refinedPrice": 258,
        "rawPrice": 126,
        "demand": "medium"
      },
      "sadaryx": {
        "refinedPrice": 215,
        "rawPrice": 105,
        "demand": "high"
      }
    }
  }
];

export const UEX_CONFIG = {
  "publicEndpoint": "https://api.uexcorp.space/2.0/commodities_prices",
  "commoditiesListEndpoint": "https://api.uexcorp.space/2.0/commodities",
  "cacheStorageKey": "price_cache",
  "legacyCacheKey": "aaron_mfd_uex_cache_v2",
  "cacheExpiryMinutes": 30,
  "apiTimeoutMs": 3500
};

export const GENERAL_COMMODITIES = [
  {
    "id": "pitambu",
    "slug": "pitambu",
    "name_fr": "Pitambu",
    "name_en": "Pitambu",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 491.14,
    "baseSell": 780,
    "marginPerScu": 28886,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": true,
    "description": "NDR: 25\nHEI: 10\nEffects: Hydrating, Hypo-Metabolic, Immune Boosting\n\nThe skin of the pitambu is thin and waxy and easily peeled away using its green leaf-like growths. Inside is a is crisp and watery, bright red flesh which is filled with tiny white seeds that have a mild, nutty taste. The flesh and seeds are traditionally consumed together.",
    "bestBuy": {
      "location": "Shepherd's Rest",
      "system": "Pyro",
      "price": 491.14,
      "stock": "high"
    },
    "bestSell": {
      "location": "Sacren's Plot",
      "system": "Pyro",
      "price": 780,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Shepherd's Rest",
        "body": "Bloom",
        "system": "pyro",
        "price": 491.1,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Sacren's Plot",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 780,
        "demand": "high",
        "margin": 288.9
      },
      {
        "terminal": "Canard View",
        "body": "Terminus",
        "system": "pyro",
        "price": 630,
        "demand": "high",
        "margin": 138.9
      },
      {
        "terminal": "Admin - Seraphim",
        "body": "Crusader",
        "system": "stanton",
        "price": 630,
        "demand": "high",
        "margin": 138.9
      },
      {
        "terminal": "Jackson's Swap",
        "body": "Monox",
        "system": "pyro",
        "price": 620,
        "demand": "high",
        "margin": 128.9
      }
    ]
  },
  {
    "id": "gasping-weevil-eggs",
    "slug": "gasping-weevil-eggs",
    "name_fr": "Gasping Weevil Eggs",
    "name_en": "Gasping Weevil Eggs",
    "category": "consumables",
    "commodityType": "food",
    "baseBuy": 464.08,
    "baseSell": 710,
    "marginPerScu": 24592,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "The eggs of this small beetle are commonly held to be an aphrodisiac, but when allowed to hatch the weevils themselves will eat through sealants used in space station construction. Transport of the insect or its eggs is banned in the UEE.",
    "bestBuy": {
      "location": "Fallow Field",
      "system": "Pyro",
      "price": 464.08,
      "stock": "high"
    },
    "bestSell": {
      "location": "Devlin Scrap and Salvage",
      "system": "Stanton",
      "price": 710,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Fallow Field",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 464.1,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Devlin Scrap and Salvage",
        "body": "MicroTech",
        "system": "stanton",
        "price": 710,
        "demand": "high",
        "margin": 245.9
      },
      {
        "terminal": "Reclamation and Disposal Orinth",
        "body": "Hurston",
        "system": "stanton",
        "price": 680,
        "demand": "high",
        "margin": 215.9
      },
      {
        "terminal": "Samson & Son's Salvage Center",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 650,
        "demand": "high",
        "margin": 185.9
      },
      {
        "terminal": "Brio's Breaker Yard",
        "body": "Crusader",
        "system": "stanton",
        "price": 650,
        "demand": "high",
        "margin": 185.9
      }
    ]
  },
  {
    "id": "degnous-root",
    "slug": "degnous-root",
    "name_fr": "Degnous Root",
    "name_en": "Degnous Root",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 441.56,
    "baseSell": 680,
    "marginPerScu": 23844,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Degnous root is a macroalgae that was discovered in the shallow coastlines of Prime on Terra. Once harvested, degnous can be utilized as an ingredient in medical and health products thanks to its unique blend of amino acids.",
    "bestBuy": {
      "location": "Shepherd's Rest",
      "system": "Pyro",
      "price": 441.56,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - HUR-L5",
      "system": "Stanton",
      "price": 680,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Shepherd's Rest",
        "body": "Bloom",
        "system": "pyro",
        "price": 441.6,
        "stock": "high"
      },
      {
        "terminal": "Canard View",
        "body": "Terminus",
        "system": "pyro",
        "price": 441.6,
        "stock": "high"
      },
      {
        "terminal": "Admin - People's Service Station Theta",
        "body": "Nyx",
        "system": "nyx",
        "price": 447.4,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - HUR-L5",
        "body": "Hurston",
        "system": "stanton",
        "price": 680,
        "demand": "high",
        "margin": 238.4
      },
      {
        "terminal": "Admin - CRU-L4",
        "body": "Crusader",
        "system": "stanton",
        "price": 630,
        "demand": "high",
        "margin": 188.4
      },
      {
        "terminal": "Admin - ARC-L2",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 630,
        "demand": "high",
        "margin": 188.4
      },
      {
        "terminal": "Admin - HUR-L3",
        "body": "Hurston",
        "system": "stanton",
        "price": 630,
        "demand": "high",
        "margin": 188.4
      }
    ]
  },
  {
    "id": "audio-visual-equipment",
    "slug": "audio-visual-equipment",
    "name_fr": "Audio-Visual Equipment",
    "name_en": "Audio-Visual Equipment",
    "category": "industrial",
    "commodityType": "consumer_goods",
    "baseBuy": 250.04,
    "baseSell": 460,
    "marginPerScu": 20996,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8
    ],
    "consumable": false,
    "description": "Devices, cabling, and rigging used for multimedia presentations and events.",
    "bestBuy": {
      "location": "Fallow Field",
      "system": "Pyro",
      "price": 250.04,
      "stock": "high"
    },
    "bestSell": {
      "location": "HDMS-Lathan",
      "system": "Stanton",
      "price": 460,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Fallow Field",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 250,
        "stock": "high"
      },
      {
        "terminal": "Seer's Canyon",
        "body": "Pyro V",
        "system": "pyro",
        "price": 250,
        "stock": "high"
      },
      {
        "terminal": "Admin - People's Service Station Lambda",
        "body": "Nyx",
        "system": "nyx",
        "price": 279.7,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "HDMS-Lathan",
        "body": "Hurston",
        "system": "stanton",
        "price": 460,
        "demand": "high",
        "margin": 210
      },
      {
        "terminal": "HDMS-Bezdek",
        "body": "Hurston",
        "system": "stanton",
        "price": 400,
        "demand": "high",
        "margin": 150
      },
      {
        "terminal": "Shepherd's Rest",
        "body": "Bloom",
        "system": "pyro",
        "price": 390,
        "demand": "high",
        "margin": 140
      },
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 390,
        "demand": "high",
        "margin": 140
      }
    ]
  },
  {
    "id": "golden-medmon",
    "slug": "golden-medmon",
    "name_fr": "Golden Medmon",
    "name_en": "Golden Medmon",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 514.15,
    "baseSell": 710,
    "marginPerScu": 19585,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": true,
    "description": "NDR: 39\nHEI: 19\nEffects: Energizing, Hydrating\n\nGrown in temperate climates on the Maru Ebony Tree, Golden Medmons are left to fall off the tree when ripe and collected. The fruit at that stage is extremely firm and astringent. They only become edible after being 'bletted' or softened through ethylene ripening.",
    "bestBuy": {
      "location": "Shepherd's Rest",
      "system": "Pyro",
      "price": 514.15,
      "stock": "high"
    },
    "bestSell": {
      "location": "The Golden Riviera",
      "system": "Pyro",
      "price": 710,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Shepherd's Rest",
        "body": "Bloom",
        "system": "pyro",
        "price": 514.2,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "The Golden Riviera",
        "body": "Bloom",
        "system": "pyro",
        "price": 710,
        "demand": "high",
        "margin": 195.9
      },
      {
        "terminal": "Fallow Field",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 690,
        "demand": "high",
        "margin": 175.9
      },
      {
        "terminal": "Jackson's Swap",
        "body": "Monox",
        "system": "pyro",
        "price": 640,
        "demand": "high",
        "margin": 125.9
      },
      {
        "terminal": "Admin - Seraphim",
        "body": "Crusader",
        "system": "stanton",
        "price": 640,
        "demand": "high",
        "margin": 125.9
      }
    ]
  },
  {
    "id": "tritium",
    "slug": "tritium",
    "name_fr": "Tritium",
    "name_en": "Tritium",
    "category": "gases",
    "commodityType": "gas",
    "baseBuy": 157.69,
    "baseSell": 350,
    "marginPerScu": 19231,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Tritium description.",
    "bestBuy": {
      "location": "Hickes Research Outpost",
      "system": "Stanton",
      "price": 157.69,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Endgame",
      "system": "Pyro",
      "price": 350,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Hickes Research Outpost",
        "body": "Crusader",
        "system": "stanton",
        "price": 157.7,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Endgame",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 350,
        "demand": "high",
        "margin": 192.3
      },
      {
        "terminal": "Admin - Gaslight",
        "body": "Pyro V",
        "system": "pyro",
        "price": 350,
        "demand": "high",
        "margin": 192.3
      },
      {
        "terminal": "Admin - GrimHEX",
        "body": "Crusader",
        "system": "stanton",
        "price": 210,
        "demand": "high",
        "margin": 52.3
      }
    ]
  },
  {
    "id": "ranta-dung",
    "slug": "ranta-dung",
    "name_fr": "Ranta Dung",
    "name_en": "Ranta Dung",
    "category": "consumables",
    "commodityType": "agricultural_supply",
    "baseBuy": 332.06,
    "baseSell": 490,
    "marginPerScu": 15794,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A dry cube-shaped dung that comes from a large isopod-like crustacean known as a Ranta. It has recently been discovered that the dung contains a unique bacterial biome that helps the Ranta process and digest minerals and some researches are hopeful will lead to industrial or medical innovations.",
    "bestBuy": {
      "location": "HDMS-Norgaard",
      "system": "Stanton",
      "price": 332.06,
      "stock": "high"
    },
    "bestSell": {
      "location": "Shepherd's Rest",
      "system": "Pyro",
      "price": 490,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "HDMS-Norgaard",
        "body": "Hurston",
        "system": "stanton",
        "price": 332.1,
        "stock": "high"
      },
      {
        "terminal": "HDMS-Anderson",
        "body": "Hurston",
        "system": "stanton",
        "price": 332.1,
        "stock": "high"
      },
      {
        "terminal": "Bueno Ravine",
        "body": "Bloom",
        "system": "pyro",
        "price": 362.6,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Shepherd's Rest",
        "body": "Bloom",
        "system": "pyro",
        "price": 490,
        "demand": "high",
        "margin": 157.9
      },
      {
        "terminal": "Rayari Deltana Research Outpost",
        "body": "MicroTech",
        "system": "stanton",
        "price": 430,
        "demand": "high",
        "margin": 97.9
      },
      {
        "terminal": "Terra Mills Hydrofarm",
        "body": "Crusader",
        "system": "stanton",
        "price": 410,
        "demand": "high",
        "margin": 77.9
      },
      {
        "terminal": "Admin - Seraphim",
        "body": "Crusader",
        "system": "stanton",
        "price": 390,
        "demand": "high",
        "margin": 57.9
      }
    ]
  },
  {
    "id": "elespo",
    "slug": "elespo",
    "name_fr": "Elespo",
    "name_en": "Elespo",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 60,
    "baseSell": 180,
    "marginPerScu": 12000,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A brand name of a light sponge-like material that has exceptional electrical absorption properties.",
    "bestBuy": {
      "location": "Chawla's Beach",
      "system": "Pyro",
      "price": 60,
      "stock": "high"
    },
    "bestSell": {
      "location": "Ashland",
      "system": "Pyro",
      "price": 180,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Chawla's Beach",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 60,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Ashland",
        "body": "Pyro V",
        "system": "pyro",
        "price": 180,
        "demand": "high",
        "margin": 120
      }
    ]
  },
  {
    "id": "quantainium",
    "slug": "quantainium",
    "name_fr": "Quantainium Raffiné",
    "name_en": "Quantainium",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 145,
    "baseSell": 265,
    "marginPerScu": 12000,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A highly unstable mineral used in the production of quantum fuel.",
    "bestBuy": {
      "location": "Raffinerie ARC-L1 Wide Forest",
      "system": "Stanton",
      "price": 145,
      "stock": "high"
    },
    "bestSell": {
      "location": "Area18 TDD (ArcCorp)",
      "system": "Stanton",
      "price": 265,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "ARC-L1 Refinery Deck",
        "body": "ArcCorp L1",
        "system": "stanton",
        "price": 220,
        "stock": "high"
      },
      {
        "terminal": "CRU-L1 Refinery Deck",
        "body": "Crusader L1",
        "system": "stanton",
        "price": 222,
        "stock": "medium"
      },
      {
        "terminal": "MIC-L1 Refinery Deck",
        "body": "microTech L1",
        "system": "stanton",
        "price": 224,
        "stock": "medium"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Area18 TDD",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 265,
        "demand": "extreme",
        "margin": 45
      },
      {
        "terminal": "New Babbage TDD",
        "body": "microTech",
        "system": "stanton",
        "price": 262,
        "demand": "high",
        "margin": 42
      },
      {
        "terminal": "Lorville CBD",
        "body": "Hurston",
        "system": "stanton",
        "price": 254,
        "demand": "medium",
        "margin": 34
      },
      {
        "terminal": "Checkmate Station",
        "body": "Pyro I-II",
        "system": "pyro",
        "price": 278,
        "demand": "high",
        "margin": 58
      }
    ]
  },
  {
    "id": "compboard",
    "slug": "compboard",
    "name_fr": "Circuits Imprimés (CompBoard)",
    "name_en": "Compboard",
    "category": "industrial",
    "commodityType": "scrap",
    "baseBuy": 254.6,
    "baseSell": 370,
    "marginPerScu": 11540,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A main processing unit used inside various computers and electronics.",
    "bestBuy": {
      "location": "Rayari Anvik Research Outpost",
      "system": "Stanton",
      "price": 254.6,
      "stock": "high"
    },
    "bestSell": {
      "location": "Shubin Mining Facility SM0-18",
      "system": "Stanton",
      "price": 370,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Rayari Anvik Research Outpost",
        "body": "MicroTech",
        "system": "stanton",
        "price": 254.6,
        "stock": "high"
      },
      {
        "terminal": "Rayari Kaltag Research Outpost",
        "body": "MicroTech",
        "system": "stanton",
        "price": 264.6,
        "stock": "high"
      },
      {
        "terminal": "Admin - People's Service Station Alpha",
        "body": "Nyx",
        "system": "nyx",
        "price": 281.1,
        "stock": "high"
      },
      {
        "terminal": "Admin - People's Service Station Delta",
        "body": "Nyx",
        "system": "nyx",
        "price": 281.1,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Shubin Mining Facility SM0-18",
        "body": "MicroTech",
        "system": "stanton",
        "price": 370,
        "demand": "high",
        "margin": 115.4
      },
      {
        "terminal": "HDMS-Hahn",
        "body": "Hurston",
        "system": "stanton",
        "price": 370,
        "demand": "high",
        "margin": 115.4
      },
      {
        "terminal": "HDMS-Perlman",
        "body": "Hurston",
        "system": "stanton",
        "price": 370,
        "demand": "high",
        "margin": 115.4
      },
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 370,
        "demand": "high",
        "margin": 115.4
      }
    ]
  },
  {
    "id": "e-tam",
    "slug": "e-tam",
    "name_fr": "E'tam",
    "name_en": "E'tam",
    "category": "illicit",
    "commodityType": "vice",
    "baseBuy": 162.95,
    "baseSell": 270,
    "marginPerScu": 10705,
    "isIllegal": true,
    "unitWeightKg": 100,
    "containerSizes": [
      0.00075,
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Created from the leaves of indigenous plants, E'tam is an organic hallucinogenic drug used by the Xi'an to slow body function and focus in order to achieve a deeper meditative state. For Humans, the effects are much more severe. E'tam causes hyper awareness, cognitive enhancement and improved focus. Users can be so engrossed in tasks that they neglect to eat, sleep or take care of other body functions.",
    "bestBuy": {
      "location": "Ashland",
      "system": "Pyro",
      "price": 162.95,
      "stock": "high"
    },
    "bestSell": {
      "location": "Samson & Son's Salvage Center",
      "system": "Stanton",
      "price": 270,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Ashland",
        "body": "Pyro V",
        "system": "pyro",
        "price": 163,
        "stock": "high"
      },
      {
        "terminal": "The Golden Riviera",
        "body": "Bloom",
        "system": "pyro",
        "price": 177.2,
        "stock": "high"
      },
      {
        "terminal": "Fallow Field",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 193.5,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Samson & Son's Salvage Center",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 270,
        "demand": "high",
        "margin": 107.1
      },
      {
        "terminal": "Reclamation and Disposal Orinth",
        "body": "Hurston",
        "system": "stanton",
        "price": 260,
        "demand": "high",
        "margin": 97.1
      },
      {
        "terminal": "Brio's Breaker Yard",
        "body": "Crusader",
        "system": "stanton",
        "price": 240,
        "demand": "high",
        "margin": 77.1
      },
      {
        "terminal": "Admin - Patch City",
        "body": "Bloom",
        "system": "pyro",
        "price": 230,
        "demand": "high",
        "margin": 67.1
      }
    ]
  },
  {
    "id": "taranite",
    "slug": "taranite",
    "name_fr": "Taranite Raffinée",
    "name_en": "Taranite",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 187.92,
    "baseSell": 280,
    "marginPerScu": 9208,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Extremely conductive, this mineral was first discovered when a researcher noticed a breed of electrosensitive hermit crab using pieces of it to form its shell.",
    "bestBuy": {
      "location": "Samson & Son's Salvage Center",
      "system": "Stanton",
      "price": 187.92,
      "stock": "high"
    },
    "bestSell": {
      "location": "TDD - Trade and Development Division - Cloudview Center - Orison",
      "system": "Stanton",
      "price": 280,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Samson & Son's Salvage Center",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 187.9,
        "stock": "high"
      },
      {
        "terminal": "Scarper's Turn",
        "body": "Terminus",
        "system": "pyro",
        "price": 193.8,
        "stock": "high"
      },
      {
        "terminal": "HDMS-Woodruff",
        "body": "Hurston",
        "system": "stanton",
        "price": 219.2,
        "stock": "high"
      },
      {
        "terminal": "HDMS-Ryder",
        "body": "Hurston",
        "system": "stanton",
        "price": 219.2,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "TDD - Trade and Development Division - Cloudview Center - Orison",
        "body": "Crusader",
        "system": "stanton",
        "price": 280,
        "demand": "high",
        "margin": 92.1
      },
      {
        "terminal": "TDD - Trade and Development Division - Commons - New Babbage",
        "body": "MicroTech",
        "system": "stanton",
        "price": 280,
        "demand": "high",
        "margin": 92.1
      },
      {
        "terminal": "Fallow Field",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 280,
        "demand": "high",
        "margin": 92.1
      },
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 280,
        "demand": "high",
        "margin": 92.1
      }
    ]
  },
  {
    "id": "carbon-silk",
    "slug": "carbon-silk",
    "name_fr": "Carbon-Silk",
    "name_en": "Carbon-Silk",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 172.84,
    "baseSell": 260,
    "marginPerScu": 8716,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "This light, flexible and incredibly strong material is woven from carbon strands collected from the secretions of specially bioengineered worms.",
    "bestBuy": {
      "location": "Shepherd's Rest",
      "system": "Pyro",
      "price": 172.84,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Rat's Nest",
      "system": "Pyro",
      "price": 260,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Shepherd's Rest",
        "body": "Bloom",
        "system": "pyro",
        "price": 172.8,
        "stock": "high"
      },
      {
        "terminal": "Sacren's Plot",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 172.8,
        "stock": "high"
      },
      {
        "terminal": "Terra Mills Hydrofarm",
        "body": "Crusader",
        "system": "stanton",
        "price": 179.4,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Rat's Nest",
        "body": "Pyro V",
        "system": "pyro",
        "price": 260,
        "demand": "high",
        "margin": 87.2
      },
      {
        "terminal": "Admin - Gaslight",
        "body": "Pyro V",
        "system": "pyro",
        "price": 220,
        "demand": "high",
        "margin": 47.2
      },
      {
        "terminal": "Admin - Starlight Service",
        "body": "Bloom",
        "system": "pyro",
        "price": 210,
        "demand": "high",
        "margin": 37.2
      },
      {
        "terminal": "Admin - Patch City",
        "body": "Bloom",
        "system": "pyro",
        "price": 210,
        "demand": "high",
        "margin": 37.2
      }
    ]
  },
  {
    "id": "amioshi-plague",
    "slug": "amioshi-plague",
    "name_fr": "Amioshi Plague",
    "name_en": "Amioshi Plague",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 173.89,
    "baseSell": 260,
    "marginPerScu": 8611,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Not nearly as ominous as its name, the Amioshi Plague is an invasive lichen that grows in the cracks of rocks. While the core of the lichen burrows out of sight to try and absorb as much moisture as it can find, the part near the surface sprouts hooded scales that eject spores to spread to other rocks. It's relatively short maturation period is the origin of its name.",
    "bestBuy": {
      "location": "Ashland",
      "system": "Pyro",
      "price": 173.89,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Seraphim",
      "system": "Stanton",
      "price": 260,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Ashland",
        "body": "Pyro V",
        "system": "pyro",
        "price": 173.9,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Seraphim",
        "body": "Crusader",
        "system": "stanton",
        "price": 260,
        "demand": "high",
        "margin": 86.1
      },
      {
        "terminal": "Fallow Field",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 240,
        "demand": "high",
        "margin": 66.1
      },
      {
        "terminal": "The Golden Riviera",
        "body": "Bloom",
        "system": "pyro",
        "price": 240,
        "demand": "high",
        "margin": 66.1
      },
      {
        "terminal": "Deakins Research Outpost",
        "body": "Crusader",
        "system": "stanton",
        "price": 240,
        "demand": "high",
        "margin": 66.1
      }
    ]
  },
  {
    "id": "beryl",
    "slug": "beryl",
    "name_fr": "Béryl Brut & Taillé (Beryl)",
    "name_en": "Beryl",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 153.9,
    "baseSell": 240,
    "marginPerScu": 8610,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A mineral that creates natural hexagonal crystals. Colorless in its pure form, its impure forms include the gems emerald and aquamarine.",
    "bestBuy": {
      "location": "Levski (Delamar)",
      "system": "Stanton",
      "price": 153.9,
      "stock": "high"
    },
    "bestSell": {
      "location": "Lorville CBD (Hurston)",
      "system": "Stanton",
      "price": 240,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 153.9,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Rod's Fuel 'N Supplies",
        "body": "Pyro V",
        "system": "pyro",
        "price": 240,
        "demand": "high",
        "margin": 86.1
      },
      {
        "terminal": "Admin - HUR-L3",
        "body": "Hurston",
        "system": "stanton",
        "price": 230,
        "demand": "high",
        "margin": 76.1
      },
      {
        "terminal": "Admin - HUR-L4",
        "body": "Hurston",
        "system": "stanton",
        "price": 220,
        "demand": "high",
        "margin": 66.1
      },
      {
        "terminal": "Admin - HUR-L5",
        "body": "Hurston",
        "system": "stanton",
        "price": 220,
        "demand": "high",
        "margin": 66.1
      }
    ]
  },
  {
    "id": "borase-ore",
    "slug": "borase-ore",
    "name_fr": "Borase (Ore)",
    "name_en": "Borase (Ore)",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 55.2,
    "baseSell": 140,
    "marginPerScu": 8480,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "This highly thermally conductive material is often formed from cosmic ray spallation and is most typically found in younger star systems.",
    "bestBuy": {
      "location": "ArcCorp Mining Area 061",
      "system": "Stanton",
      "price": 55.2,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - People's Service Station Theta",
      "system": "Nyx",
      "price": 140,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "ArcCorp Mining Area 061",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 55.2,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - People's Service Station Theta",
        "body": "Nyx",
        "system": "nyx",
        "price": 140,
        "demand": "high",
        "margin": 84.8
      }
    ]
  },
  {
    "id": "dymantium",
    "slug": "dymantium",
    "name_fr": "Dymantium",
    "name_en": "Dymantium",
    "category": "metals",
    "commodityType": "alloy",
    "baseBuy": 174.8,
    "baseSell": 250,
    "marginPerScu": 7520,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "One of the toughest known metal alloys that can be forged. It is extremely difficult to manufacture and must be used with care in order to avoid accidentally weakening the material during application.",
    "bestBuy": {
      "location": "Rustville",
      "system": "Pyro",
      "price": 174.8,
      "stock": "high"
    },
    "bestSell": {
      "location": "Levski",
      "system": "Nyx",
      "price": 250,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Rustville",
        "body": "Pyro I",
        "system": "pyro",
        "price": 174.8,
        "stock": "high"
      },
      {
        "terminal": "Admin - People's Service Station Alpha",
        "body": "Nyx",
        "system": "nyx",
        "price": 205.3,
        "stock": "high"
      },
      {
        "terminal": "Admin - People's Service Station Delta",
        "body": "Nyx",
        "system": "nyx",
        "price": 205.3,
        "stock": "high"
      },
      {
        "terminal": "Admin - People's Service Station Theta",
        "body": "Nyx",
        "system": "nyx",
        "price": 205.3,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 250,
        "demand": "high",
        "margin": 75.2
      },
      {
        "terminal": "The Golden Riviera",
        "body": "Bloom",
        "system": "pyro",
        "price": 240,
        "demand": "high",
        "margin": 65.2
      },
      {
        "terminal": "Bueno Ravine",
        "body": "Bloom",
        "system": "pyro",
        "price": 230,
        "demand": "high",
        "margin": 55.2
      },
      {
        "terminal": "TDD - Trade and Development Division - Area 18",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 230,
        "demand": "high",
        "margin": 55.2
      }
    ]
  },
  {
    "id": "bexalite",
    "slug": "bexalite",
    "name_fr": "Bexalite Raffinée",
    "name_en": "Bexalite",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 235.56,
    "baseSell": 310,
    "marginPerScu": 7444,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "This mineral harvested from worlds with no natural magnetic core, has found widespread use in electrical systems.",
    "bestBuy": {
      "location": "Bueno Ravine",
      "system": "Pyro",
      "price": 235.56,
      "stock": "high"
    },
    "bestSell": {
      "location": "The Golden Riviera",
      "system": "Pyro",
      "price": 310,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Bueno Ravine",
        "body": "Bloom",
        "system": "pyro",
        "price": 235.6,
        "stock": "high"
      },
      {
        "terminal": "Fallow Field",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 235.6,
        "stock": "high"
      },
      {
        "terminal": "HDMS-Thedus",
        "body": "Hurston",
        "system": "stanton",
        "price": 239.4,
        "stock": "high"
      },
      {
        "terminal": "HDMS-Stanhope",
        "body": "Hurston",
        "system": "stanton",
        "price": 239.4,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "The Golden Riviera",
        "body": "Bloom",
        "system": "pyro",
        "price": 310,
        "demand": "high",
        "margin": 74.4
      },
      {
        "terminal": "Jackson's Swap",
        "body": "Monox",
        "system": "pyro",
        "price": 300,
        "demand": "high",
        "margin": 64.4
      },
      {
        "terminal": "Admin - Patch City",
        "body": "Bloom",
        "system": "pyro",
        "price": 300,
        "demand": "high",
        "margin": 64.4
      },
      {
        "terminal": "Canard View",
        "body": "Terminus",
        "system": "pyro",
        "price": 300,
        "demand": "high",
        "margin": 64.4
      }
    ]
  },
  {
    "id": "gold",
    "slug": "gold",
    "name_fr": "Or Métallique (Gold)",
    "name_en": "Gold",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 243.6,
    "baseSell": 310,
    "marginPerScu": 6640,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A commonly found ductile metal favored for its conductivity. Though it falls in and out of fashion, it is often used for decorative purposes as well.",
    "bestBuy": {
      "location": "HDMS-Norgaard (Ita)",
      "system": "Stanton",
      "price": 243.6,
      "stock": "high"
    },
    "bestSell": {
      "location": "Area18 TDD (ArcCorp)",
      "system": "Stanton",
      "price": 310,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "HDMS-Norgaard",
        "body": "Hurston",
        "system": "stanton",
        "price": 243.6,
        "stock": "high"
      },
      {
        "terminal": "HDMS-Anderson",
        "body": "Hurston",
        "system": "stanton",
        "price": 243.6,
        "stock": "high"
      },
      {
        "terminal": "Admin - CRU-L5",
        "body": "Crusader",
        "system": "stanton",
        "price": 264.9,
        "stock": "high"
      },
      {
        "terminal": "Shubin Mining Facility SCD-1",
        "body": "Crusader",
        "system": "stanton",
        "price": 275.5,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "TDD - Trade and Development Division - Area 18",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 310,
        "demand": "high",
        "margin": 66.4
      },
      {
        "terminal": "Admin - Pyro Gateway (Nyx)",
        "body": "Nyx",
        "system": "nyx",
        "price": 310,
        "demand": "high",
        "margin": 66.4
      },
      {
        "terminal": "CBD - Central Business District - Lorville",
        "body": "Hurston",
        "system": "stanton",
        "price": 300,
        "demand": "high",
        "margin": 56.4
      },
      {
        "terminal": "Admin - ARC-L1",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 300,
        "demand": "high",
        "margin": 56.4
      }
    ]
  },
  {
    "id": "fresh-food",
    "slug": "fresh-food",
    "name_fr": "Fresh Food",
    "name_en": "Fresh Food",
    "category": "consumables",
    "commodityType": "food",
    "baseBuy": 208.21,
    "baseSell": 270,
    "marginPerScu": 6179,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Various meats, grains and produce that have not yet been cooked, dried, salted, frozen, pickled, or otherwise preserved.",
    "bestBuy": {
      "location": "Shepherd's Rest",
      "system": "Pyro",
      "price": 208.21,
      "stock": "high"
    },
    "bestSell": {
      "location": "HDMS-Hadley",
      "system": "Stanton",
      "price": 270,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Shepherd's Rest",
        "body": "Bloom",
        "system": "pyro",
        "price": 208.2,
        "stock": "high"
      },
      {
        "terminal": "Terra Mills Hydrofarm",
        "body": "Crusader",
        "system": "stanton",
        "price": 216.1,
        "stock": "high"
      },
      {
        "terminal": "Rayari Anvik Research Outpost",
        "body": "MicroTech",
        "system": "stanton",
        "price": 216.1,
        "stock": "high"
      },
      {
        "terminal": "Rayari Kaltag Research Outpost",
        "body": "MicroTech",
        "system": "stanton",
        "price": 216.1,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "HDMS-Hadley",
        "body": "Hurston",
        "system": "stanton",
        "price": 270,
        "demand": "high",
        "margin": 61.8
      },
      {
        "terminal": "HDMS-Pinewood",
        "body": "Hurston",
        "system": "stanton",
        "price": 270,
        "demand": "high",
        "margin": 61.8
      },
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 260,
        "demand": "high",
        "margin": 51.8
      },
      {
        "terminal": "HDMS-Thedus",
        "body": "Hurston",
        "system": "stanton",
        "price": 260,
        "demand": "high",
        "margin": 51.8
      }
    ]
  },
  {
    "id": "osoian-hides",
    "slug": "osoian-hides",
    "name_fr": "Osoian Hides",
    "name_en": "Osoian Hides",
    "category": "industrial",
    "commodityType": "consumer_goods",
    "baseBuy": 28.35,
    "baseSell": 87,
    "marginPerScu": 5865,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "The Golden Riviera (Bloom)",
      "system": "Pyro",
      "price": 28.35,
      "stock": "high"
    },
    "bestSell": {
      "location": "Devlin Scrap and Salvage (microTech)",
      "system": "Stanton",
      "price": 87,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "The Golden Riviera",
        "body": "Bloom",
        "system": "pyro",
        "price": 28.4,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Devlin Scrap and Salvage",
        "body": "MicroTech",
        "system": "stanton",
        "price": 87,
        "demand": "high",
        "margin": 58.7
      }
    ]
  },
  {
    "id": "ck13-gid-seed-blend",
    "slug": "ck13-gid-seed-blend",
    "name_fr": "CK13-GID Seed Blend",
    "name_en": "CK13-GID Seed Blend",
    "category": "consumables",
    "commodityType": "agricultural_supply",
    "baseBuy": 25,
    "baseSell": 81,
    "marginPerScu": 5600,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "These genetically-modified barley seeds were banned because of their aggressive growth and high-levels of cross-pollination that has frequently ravaged any neighboring plant life. However, the plant's high yield and ease of growth have continued to make it a sought-after commodity.",
    "bestBuy": {
      "location": "Ashland",
      "system": "Pyro",
      "price": 25,
      "stock": "high"
    },
    "bestSell": {
      "location": "Chawla's Beach",
      "system": "Pyro",
      "price": 81,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Ashland",
        "body": "Pyro V",
        "system": "pyro",
        "price": 25,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Chawla's Beach",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 81,
        "demand": "high",
        "margin": 56
      }
    ]
  },
  {
    "id": "cobalt",
    "slug": "cobalt",
    "name_fr": "Cobalt",
    "name_en": "Cobalt",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 176,
    "baseSell": 230,
    "marginPerScu": 5400,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Cobalt description.",
    "bestBuy": {
      "location": "Bueno Ravine",
      "system": "Pyro",
      "price": 176,
      "stock": "high"
    },
    "bestSell": {
      "location": "Levski",
      "system": "Nyx",
      "price": 230,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Bueno Ravine",
        "body": "Bloom",
        "system": "pyro",
        "price": 176,
        "stock": "high"
      },
      {
        "terminal": "Admin - Starlight Service",
        "body": "Bloom",
        "system": "pyro",
        "price": 180.5,
        "stock": "high"
      },
      {
        "terminal": "HDMS-Oparei",
        "body": "Hurston",
        "system": "stanton",
        "price": 182.7,
        "stock": "high"
      },
      {
        "terminal": "HDMS-Edmond",
        "body": "Hurston",
        "system": "stanton",
        "price": 182.7,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 230,
        "demand": "high",
        "margin": 54
      },
      {
        "terminal": "Canard View",
        "body": "Terminus",
        "system": "pyro",
        "price": 210,
        "demand": "high",
        "margin": 34
      },
      {
        "terminal": "Ashland",
        "body": "Pyro V",
        "system": "pyro",
        "price": 200,
        "demand": "high",
        "margin": 24
      },
      {
        "terminal": "Admin - Rod's Fuel 'N Supplies",
        "body": "Pyro V",
        "system": "pyro",
        "price": 200,
        "demand": "high",
        "margin": 24
      }
    ]
  },
  {
    "id": "riccite",
    "slug": "riccite",
    "name_fr": "Riccite Haute Température",
    "name_en": "Riccite",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 190,
    "baseSell": 242,
    "marginPerScu": 5200,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Orbituary Platform (Pyro IV)",
      "system": "Pyro",
      "price": 190,
      "stock": "medium"
    },
    "bestSell": {
      "location": "Area18 TDD (ArcCorp)",
      "system": "Stanton",
      "price": 242,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Orbituary Platform",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 190,
        "stock": "medium"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Area18 TDD",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 242,
        "demand": "high",
        "margin": 52
      },
      {
        "terminal": "Ruin Station",
        "body": "Terminus",
        "system": "pyro",
        "price": 238,
        "demand": "high",
        "margin": 48
      }
    ]
  },
  {
    "id": "dopple",
    "slug": "dopple",
    "name_fr": "Dopple",
    "name_en": "Dopple",
    "category": "illicit",
    "commodityType": "vice",
    "baseBuy": 95,
    "baseSell": 145,
    "marginPerScu": 5000,
    "isIllegal": true,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A dissociative drug that creates a strong feeling of separation. People, places, and objects familiar to the user take on a distorted and unreal quality. Some users report a detachment from emotions. Doplencyethorphine is used in small dosages medically to help with extreme emotion issues and rage management problems. Recreational users take it for the effect of resetting the mundane and everyday into something new and different. Side effects include memory loss, panic attacks, paranoia, and psychotic episodes.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 95,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 145,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "freeze",
    "slug": "freeze",
    "name_fr": "Freeze",
    "name_en": "Freeze",
    "category": "illicit",
    "commodityType": "vice",
    "baseBuy": 95,
    "baseSell": 145,
    "marginPerScu": 5000,
    "isIllegal": true,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A synthetic tranquilizer used for muscle therapy that causes very heavy sedation in the user while also activating the nerve endings in their muscles. Originally created as a way to rebuild damaged/rebuilt muscle tissue, it found another use as a sedative weight-loss supplement, and when in a concentrated form, as a party drug.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 95,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 145,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "glow",
    "slug": "glow",
    "name_fr": "Glow",
    "name_en": "Glow",
    "category": "illicit",
    "commodityType": "vice",
    "baseBuy": 95,
    "baseSell": 145,
    "marginPerScu": 5000,
    "isIllegal": true,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A variant of the street drug known as \"Neon,\" Glow is formulated to create more euphoric feelings and less hallucinations than are normally associated with other members of its chemical family. The telltale sign of a user is that swallowing the capsule often leaves glowing residue on the tongue. Some people microdose Glow to help them maintain a more positive attitude (being careful to drip the dose directly onto the back of their throat). The main risk is that once the effect wears off people can become suicidally depressed for a short while before their brain chemistry normalizes.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 95,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 145,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "mala",
    "slug": "mala",
    "name_fr": "Mala",
    "name_en": "Mala",
    "category": "illicit",
    "commodityType": "vice",
    "baseBuy": 95,
    "baseSell": 145,
    "marginPerScu": 5000,
    "isIllegal": true,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Digestion of the unique toxins found in the Mala fly causes confusion of the congnitive pathways of the brain and results in synesthesia where different sensory experiences cross and mix. Effects described by users range widely; from being able to see music to tasting colors. Since pain does not register the same way while under the influence of the toxin, many people of have been severely injured while \"sense swapping.\" For example, one user lost their arm after perceiving the heat from a thruster engine as pleasurable.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 95,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 145,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "thrust",
    "slug": "thrust",
    "name_fr": "Thrust",
    "name_en": "Thrust",
    "category": "illicit",
    "commodityType": "vice",
    "baseBuy": 95,
    "baseSell": 145,
    "marginPerScu": 5000,
    "isIllegal": true,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      32
    ],
    "consumable": false,
    "description": "This cocktail of chemicals provides the user with a massive boost of energy, increased sociability, euphoria, and heightened tactile sensitivity. Rumored to have been developed as an energy drink base, this drug has proven popular among those wishing for extra energy or to \"party longer.\" However, owing to the risk of heart attack, deadly dehydration, and seizures, the mix has been banned in most areas. Users can be identified by their stuttering, rambling speech, flushed skin, and sweating.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 95,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 145,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "uncut-slam",
    "slug": "uncut-slam",
    "name_fr": "Uncut SLAM",
    "name_en": "Uncut SLAM",
    "category": "illicit",
    "commodityType": "vice",
    "baseBuy": 95,
    "baseSell": 145,
    "marginPerScu": 5000,
    "isIllegal": true,
    "unitWeightKg": 100,
    "containerSizes": [
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Initially developed for athletes before being outlawed, SLAM acts as a combat performance enhancer, targeting the user's nervous system as a fear-inhibitor and painkiller. Uncut SLAM is the concentrated form of the drug, and must be diluted to non-lethal dosages before it can be packaged into dispersal vials and consumed.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 95,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 145,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "zip",
    "slug": "zip",
    "name_fr": "Zip",
    "name_en": "Zip",
    "category": "illicit",
    "commodityType": "vice",
    "baseBuy": 95,
    "baseSell": 145,
    "marginPerScu": 5000,
    "isIllegal": true,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Zip is a hyper-accelerant that when added directly to the bloodstream, \"supercharges\" the user's nervous system causing sensory hallucinations such as colors become more vivid and hearing sounds that aren't there. These effects tend to make users seem to be in constant motion and easily distracted.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 95,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 145,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "neon",
    "slug": "neon",
    "name_fr": "Néon Gaz",
    "name_en": "Neon",
    "category": "illicit",
    "commodityType": "vice",
    "baseBuy": 142.06,
    "baseSell": 190,
    "marginPerScu": 4794,
    "isIllegal": true,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A psychoactive designer drug known for increased energy, euphoria, and mild hallucinations (particularly how the body processes light). Due to its chemical complexity, it's much more expensive than other street drugs, but is very popular in club culture.",
    "bestBuy": {
      "location": "Rustville",
      "system": "Pyro",
      "price": 142.06,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Starlight Service",
      "system": "Pyro",
      "price": 190,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Rustville",
        "body": "Pyro I",
        "system": "pyro",
        "price": 142.1,
        "stock": "high"
      },
      {
        "terminal": "Last Landings",
        "body": "Terminus",
        "system": "pyro",
        "price": 142.1,
        "stock": "high"
      },
      {
        "terminal": "Ashland",
        "body": "Pyro V",
        "system": "pyro",
        "price": 154.5,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Starlight Service",
        "body": "Bloom",
        "system": "pyro",
        "price": 190,
        "demand": "high",
        "margin": 47.9
      },
      {
        "terminal": "The Golden Riviera",
        "body": "Bloom",
        "system": "pyro",
        "price": 190,
        "demand": "high",
        "margin": 47.9
      },
      {
        "terminal": "Admin - Patch City",
        "body": "Bloom",
        "system": "pyro",
        "price": 190,
        "demand": "high",
        "margin": 47.9
      },
      {
        "terminal": "Admin - Rat's Nest",
        "body": "Pyro V",
        "system": "pyro",
        "price": 190,
        "demand": "high",
        "margin": 47.9
      }
    ]
  },
  {
    "id": "organics",
    "slug": "organics",
    "name_fr": "Organics",
    "name_en": "Organics",
    "category": "consumables",
    "commodityType": "food",
    "baseBuy": 92.57,
    "baseSell": 140,
    "marginPerScu": 4743,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "PH - Organics are formerly living organisms that have been prepared for other purposes. This includes meat, plant and animal parts, biofuel, and other such items.",
    "bestBuy": {
      "location": "Rustville",
      "system": "Pyro",
      "price": 92.57,
      "stock": "high"
    },
    "bestSell": {
      "location": "Shepherd's Rest",
      "system": "Pyro",
      "price": 140,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Rustville",
        "body": "Pyro I",
        "system": "pyro",
        "price": 92.6,
        "stock": "high"
      },
      {
        "terminal": "TDD - Trade and Development Division - Cloudview Center - Orison",
        "body": "Crusader",
        "system": "stanton",
        "price": 102.3,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Shepherd's Rest",
        "body": "Bloom",
        "system": "pyro",
        "price": 140,
        "demand": "high",
        "margin": 47.4
      },
      {
        "terminal": "Admin - People's Service Station Alpha",
        "body": "Nyx",
        "system": "nyx",
        "price": 140,
        "demand": "high",
        "margin": 47.4
      },
      {
        "terminal": "Admin - People's Service Station Lambda",
        "body": "Nyx",
        "system": "nyx",
        "price": 140,
        "demand": "high",
        "margin": 47.4
      },
      {
        "terminal": "CBD - Central Business District - Lorville",
        "body": "Hurston",
        "system": "stanton",
        "price": 120,
        "demand": "high",
        "margin": 27.4
      }
    ]
  },
  {
    "id": "stileron",
    "slug": "stileron",
    "name_fr": "Stileron (Exclusif Pyro)",
    "name_en": "Stileron",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 122.85,
    "baseSell": 170,
    "marginPerScu": 4715,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Bueno Ravine",
      "system": "Pyro",
      "price": 12.29,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Nyx Gateway (Pyro)",
      "system": "Pyro",
      "price": 17,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Bueno Ravine",
        "body": "Bloom",
        "system": "pyro",
        "price": 12.3,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Nyx Gateway (Pyro)",
        "body": "Pyro",
        "system": "pyro",
        "price": 17,
        "demand": "high",
        "margin": 471.5
      },
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 15,
        "demand": "high",
        "margin": 271.5
      },
      {
        "terminal": "Deakins Research Outpost",
        "body": "Crusader",
        "system": "stanton",
        "price": 15,
        "demand": "high",
        "margin": 271.5
      },
      {
        "terminal": "TDD - Trade and Development Division - Area 18",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 14,
        "demand": "high",
        "margin": 171.5
      }
    ]
  },
  {
    "id": "sadaryx",
    "slug": "sadaryx",
    "name_fr": "Sadaryx Cristallin",
    "name_en": "Sadaryx",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 165,
    "baseSell": 212,
    "marginPerScu": 4700,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A durable crystal, sadaryx is commonly used in the production of industrial focal lenses in laser applications.",
    "bestBuy": {
      "location": "Checkmate Station (Pyro)",
      "system": "Pyro",
      "price": 165,
      "stock": "medium"
    },
    "bestSell": {
      "location": "Levski Customs (Delamar)",
      "system": "Nyx",
      "price": 212,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Checkmate Station",
        "body": "Pyro I-II",
        "system": "pyro",
        "price": 165,
        "stock": "medium"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Levski Customs",
        "body": "Delamar",
        "system": "nyx",
        "price": 212,
        "demand": "high",
        "margin": 47
      }
    ]
  },
  {
    "id": "sunset-berries",
    "slug": "sunset-berries",
    "name_fr": "Sunset Berries",
    "name_en": "Sunset Berries",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 65.63,
    "baseSell": 110,
    "marginPerScu": 4437,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": true,
    "description": "NDR: 08\nHEI: 06\nEffect: Toxic\n\nThese sunset-hued berries grow best in cold climates. They are toxic and not suitable for Human consumption. Eating them can result in symptoms such as vomiting and extreme cramping. Higher dosages have been known to be fatal. While the raw unprocessed berries are very bitter and tannic, once fermented, the resulting poisonous brew has a very sweet taste and is more commonly known as \"Death Wine.\" Recently, medical researchers are investigating if the toxin in sunset berries could be used to help treat nerve damage or neurological diseases.",
    "bestBuy": {
      "location": "Shepherd's Rest",
      "system": "Pyro",
      "price": 656.26,
      "stock": "high"
    },
    "bestSell": {
      "location": "Rayari Deltana Research Outpost",
      "system": "Stanton",
      "price": 1100,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Shepherd's Rest",
        "body": "Bloom",
        "system": "pyro",
        "price": 656.3,
        "stock": "high"
      },
      {
        "terminal": "Admin - People's Service Station Theta",
        "body": "Nyx",
        "system": "nyx",
        "price": 664.9,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Rayari Deltana Research Outpost",
        "body": "MicroTech",
        "system": "stanton",
        "price": 11,
        "demand": "high",
        "margin": 443.7
      },
      {
        "terminal": "Sacren's Plot",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 9.8,
        "demand": "high",
        "margin": 323.7
      },
      {
        "terminal": "Admin - People's Service Station Lambda",
        "body": "Nyx",
        "system": "nyx",
        "price": 9.4,
        "demand": "high",
        "margin": 283.7
      },
      {
        "terminal": "Fallow Field",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 8.8,
        "demand": "high",
        "margin": 223.7
      }
    ]
  },
  {
    "id": "agricium",
    "slug": "agricium",
    "name_fr": "Agricium Raffiné",
    "name_en": "Agricium",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 68.4,
    "baseSell": 110,
    "marginPerScu": 4160,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A rare and valuable silvery metal with a blue-green sheen. Malleable, ductile, and largely non-reactive.",
    "bestBuy": {
      "location": "Admin - Endgame",
      "system": "Pyro",
      "price": 68.4,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - ARC-L4",
      "system": "Stanton",
      "price": 110,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Endgame",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 68.4,
        "stock": "high"
      },
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 83.8,
        "stock": "high"
      },
      {
        "terminal": "Shubin Mining Facility SMCa-6",
        "body": "MicroTech",
        "system": "stanton",
        "price": 87.2,
        "stock": "high"
      },
      {
        "terminal": "Shubin Mining Facility SMCa-8",
        "body": "MicroTech",
        "system": "stanton",
        "price": 87.2,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - ARC-L4",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 110,
        "demand": "high",
        "margin": 41.6
      },
      {
        "terminal": "Admin - Rod's Fuel 'N Supplies",
        "body": "Pyro V",
        "system": "pyro",
        "price": 100,
        "demand": "high",
        "margin": 31.6
      },
      {
        "terminal": "Admin - CRU-L4",
        "body": "Crusader",
        "system": "stanton",
        "price": 100,
        "demand": "high",
        "margin": 31.6
      },
      {
        "terminal": "TDD - Trade and Development Division - Area 18",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 100,
        "demand": "high",
        "margin": 31.6
      }
    ]
  },
  {
    "id": "slam",
    "slug": "slam",
    "name_fr": "Slam (Narcotique)",
    "name_en": "SLAM",
    "category": "illicit",
    "commodityType": "vice",
    "baseBuy": 140,
    "baseSell": 178,
    "marginPerScu": 3800,
    "isIllegal": true,
    "unitWeightKg": 100,
    "containerSizes": [
      0.00075,
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": true,
    "description": "Most commonly ingested as a gas. Vials of SLAM are cracked and inhaled. Initially developed as a performance enhancer for athletes, SLAM targets the user's nervous system acting as a fear-inhibitor and painkiller. Once the severe physical side effects were discovered, the drug went underground and found popularity among mercs and outlaws who relied on it to provide that slight edge in combat. Unfortunately, SLAM is also heavily addictive, so many of these mercs ended up getting burned out on the drug. Heavy-duty SLAM junkies are easily identifiable in public; they have ‘the shakes’ -- involuntary muscle twitches. Important to note that this is not a sign of withdrawal, simply a side effect.",
    "bestBuy": {
      "location": "NT-986 Outpost (microTech)",
      "system": "Stanton",
      "price": 140,
      "stock": "medium"
    },
    "bestSell": {
      "location": "Ruin Station (Pyro)",
      "system": "Pyro",
      "price": 178,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "NT-986 Outpost",
        "body": "microTech",
        "system": "stanton",
        "price": 140,
        "stock": "medium"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Ruin Station",
        "body": "Terminus",
        "system": "pyro",
        "price": 178,
        "demand": "high",
        "margin": 38
      }
    ]
  },
  {
    "id": "tungsten",
    "slug": "tungsten",
    "name_fr": "Tungstène",
    "name_en": "Tungsten",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 82.65,
    "baseSell": 120,
    "marginPerScu": 3735,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Used in many different alloys, tungsten in its pure form becomes malleable while maintaining its hardness.",
    "bestBuy": {
      "location": "ArcCorp Mining Area 061",
      "system": "Stanton",
      "price": 82.65,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Megumi Refueling",
      "system": "Pyro",
      "price": 120,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "ArcCorp Mining Area 061",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 82.7,
        "stock": "high"
      },
      {
        "terminal": "ArcCorp Mining Area 056",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 82.7,
        "stock": "high"
      },
      {
        "terminal": "ArcCorp Mining Area 045",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 82.7,
        "stock": "high"
      },
      {
        "terminal": "Shubin Mining Facility SCD-1",
        "body": "Crusader",
        "system": "stanton",
        "price": 82.7,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Megumi Refueling",
        "body": "Terminus",
        "system": "pyro",
        "price": 120,
        "demand": "high",
        "margin": 37.4
      },
      {
        "terminal": "Admin - Pyro Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 110,
        "demand": "high",
        "margin": 27.4
      },
      {
        "terminal": "Admin - Stanton Gateway (Pyro)",
        "body": "Pyro",
        "system": "pyro",
        "price": 110,
        "demand": "high",
        "margin": 27.4
      },
      {
        "terminal": "Admin - Terra Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 110,
        "demand": "high",
        "margin": 27.4
      }
    ]
  },
  {
    "id": "recycled-material-composite",
    "slug": "recycled-material-composite",
    "name_fr": "Matériau Composite Recyclé (RMC)",
    "name_en": "Recycled Material Composite",
    "category": "industrial",
    "commodityType": "processed_goods",
    "baseBuy": 105,
    "baseSell": 142,
    "marginPerScu": 3700,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Recycled Material Composite, commonly referred to as RMC, is the end result of low-tier salvaging where a myriad of alloys and polymers are mixed together during the collection process.",
    "bestBuy": {
      "location": "Rappel / Postes de ferraillage (Pyro)",
      "system": "Pyro",
      "price": 105,
      "stock": "high"
    },
    "bestSell": {
      "location": "Area18 TDD (ArcCorp)",
      "system": "Stanton",
      "price": 142,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Jackson's Swap",
        "body": "Monox",
        "system": "pyro",
        "price": 60,
        "stock": "high"
      },
      {
        "terminal": "Canard View",
        "body": "Terminus",
        "system": "pyro",
        "price": 62.1,
        "stock": "high"
      },
      {
        "terminal": "Rust - Pickers Field",
        "body": "Hurston",
        "system": "stanton",
        "price": 71.4,
        "stock": "high"
      },
      {
        "terminal": "Scrap - Rappel",
        "body": "Hurston",
        "system": "stanton",
        "price": 71.4,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Terra Mills Hydrofarm",
        "body": "Crusader",
        "system": "stanton",
        "price": 89,
        "demand": "high",
        "margin": 29
      },
      {
        "terminal": "Seer's Canyon",
        "body": "Pyro V",
        "system": "pyro",
        "price": 85,
        "demand": "high",
        "margin": 25
      },
      {
        "terminal": "Admin - Patch City",
        "body": "Bloom",
        "system": "pyro",
        "price": 77,
        "demand": "high",
        "margin": 17
      },
      {
        "terminal": "Rustville",
        "body": "Pyro I",
        "system": "pyro",
        "price": 77,
        "demand": "high",
        "margin": 17
      }
    ]
  },
  {
    "id": "iodine",
    "slug": "iodine",
    "name_fr": "Iode Purifiée",
    "name_en": "Iodine",
    "category": "gases",
    "commodityType": "gas",
    "baseBuy": 93.34,
    "baseSell": 130,
    "marginPerScu": 3666,
    "isIllegal": false,
    "unitWeightKg": 90,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "The heaviest stable halogen. Sublimes from a purple-black metallic solid into a violet gas.",
    "bestBuy": {
      "location": "Hickes Research Outpost",
      "system": "Stanton",
      "price": 93.34,
      "stock": "high"
    },
    "bestSell": {
      "location": "Levski",
      "system": "Nyx",
      "price": 130,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Hickes Research Outpost",
        "body": "Crusader",
        "system": "stanton",
        "price": 93.3,
        "stock": "high"
      },
      {
        "terminal": "Deakins Research Outpost",
        "body": "Crusader",
        "system": "stanton",
        "price": 93.3,
        "stock": "high"
      },
      {
        "terminal": "ArcCorp Mining Area 056",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 96.7,
        "stock": "high"
      },
      {
        "terminal": "ArcCorp Mining Area 061",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 96.7,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 130,
        "demand": "high",
        "margin": 36.7
      },
      {
        "terminal": "Rayari Cantwell Research Outpost",
        "body": "MicroTech",
        "system": "stanton",
        "price": 120,
        "demand": "high",
        "margin": 26.7
      },
      {
        "terminal": "Rayari McGrath Research Outpost",
        "body": "MicroTech",
        "system": "stanton",
        "price": 120,
        "demand": "high",
        "margin": 26.7
      },
      {
        "terminal": "Admin - People's Service Station Delta",
        "body": "Nyx",
        "system": "nyx",
        "price": 120,
        "demand": "high",
        "margin": 26.7
      }
    ]
  },
  {
    "id": "lindinium",
    "slug": "lindinium",
    "name_fr": "Lindinium Conducteur",
    "name_en": "Lindinium",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 120,
    "baseSell": 156,
    "marginPerScu": 3600,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Checkmate Station (Pyro)",
      "system": "Pyro",
      "price": 120,
      "stock": "high"
    },
    "bestSell": {
      "location": "Lorville CBD (Hurston)",
      "system": "Stanton",
      "price": 156,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Checkmate Station",
        "body": "Pyro I-II",
        "system": "pyro",
        "price": 120,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Lorville CBD",
        "body": "Hurston",
        "system": "stanton",
        "price": 156,
        "demand": "high",
        "margin": 36
      }
    ]
  },
  {
    "id": "diamond-laminate",
    "slug": "diamond-laminate",
    "name_fr": "Diamond Laminate",
    "name_en": "Diamond Laminate",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 66.88,
    "baseSell": 100,
    "marginPerScu": 3312,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "One of the hardest manufactured materials today, this glass-like substance is frequently used in the construction of cockpit windows.",
    "bestBuy": {
      "location": "Canard View",
      "system": "Pyro",
      "price": 668.8,
      "stock": "high"
    },
    "bestSell": {
      "location": "Jackson's Swap",
      "system": "Pyro",
      "price": 1000,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Canard View",
        "body": "Terminus",
        "system": "pyro",
        "price": 668.8,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Jackson's Swap",
        "body": "Monox",
        "system": "pyro",
        "price": 10,
        "demand": "high",
        "margin": 331.2
      },
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 9.9,
        "demand": "high",
        "margin": 321.2
      },
      {
        "terminal": "Ashland",
        "body": "Pyro V",
        "system": "pyro",
        "price": 9.5,
        "demand": "high",
        "margin": 281.2
      },
      {
        "terminal": "Sacren's Plot",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 9.5,
        "demand": "high",
        "margin": 281.2
      }
    ]
  },
  {
    "id": "widow",
    "slug": "widow",
    "name_fr": "WiDoW (Substance Illicite)",
    "name_en": "WiDoW",
    "category": "illicit",
    "commodityType": "vice",
    "baseBuy": 59.29,
    "baseSell": 88,
    "marginPerScu": 2871,
    "isIllegal": true,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Thick, ink-black synthetic opioid commonly used as a recreational drug. WiDoW has spread like wildfire throughout the Empire thanks to the fact that it's relatively easy to produce. This also creates a wide variety of quality between batches of the drug. Designed to be injected as a liquid directly into the bloodstream, the name derived from one of the main side effects from extensive use, the drug stains the veins black, creating web-like subcutaneous patterns through the body. Illegal inside the UEE.",
    "bestBuy": {
      "location": "Admin - Megumi Refueling",
      "system": "Pyro",
      "price": 59.29,
      "stock": "high"
    },
    "bestSell": {
      "location": "Devlin Scrap and Salvage",
      "system": "Stanton",
      "price": 88,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Megumi Refueling",
        "body": "Terminus",
        "system": "pyro",
        "price": 59.3,
        "stock": "high"
      },
      {
        "terminal": "Admin - Rat's Nest",
        "body": "Pyro V",
        "system": "pyro",
        "price": 59.3,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Devlin Scrap and Salvage",
        "body": "MicroTech",
        "system": "stanton",
        "price": 88,
        "demand": "high",
        "margin": 28.7
      },
      {
        "terminal": "The Golden Riviera",
        "body": "Bloom",
        "system": "pyro",
        "price": 80,
        "demand": "high",
        "margin": 20.7
      },
      {
        "terminal": "Reclamation and Disposal Orinth",
        "body": "Hurston",
        "system": "stanton",
        "price": 80,
        "demand": "high",
        "margin": 20.7
      },
      {
        "terminal": "Samson & Son's Salvage Center",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 76,
        "demand": "high",
        "margin": 16.7
      }
    ]
  },
  {
    "id": "maze",
    "slug": "maze",
    "name_fr": "Maze (Substance Contrôlée)",
    "name_en": "Maze",
    "category": "illicit",
    "commodityType": "vice",
    "baseBuy": 90,
    "baseSell": 118,
    "marginPerScu": 2800,
    "isIllegal": true,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Street name for a tranquilizer and knock-out hallucinogen that's Tevarin in origin. Dosing up is like taking a massive journey into your own mind. To the outside world, you’re nearly comatose, but to you, it’s a wild trip. A handful of religions have been started after a user took a trip into the maze. Aside from the toxic element, there’s a chance you won’t come down from the high. They call this ‘getting disconnected.’ Users stay locked in their own head until their brain decays. Maze was originally used as a near religious experience for Tevarin warriors to find their path in life. Since the fall of the Tevarin empire, it's become corrupted into a purely recreational drug. The Tevarin who once treated this drug with reverence and ritual, now make boatloads of credits selling it to anyone who wants to risk a potentially dangerous trip.",
    "bestBuy": {
      "location": "Laboratoire Jumptown (Yela)",
      "system": "Stanton",
      "price": 90,
      "stock": "medium"
    },
    "bestSell": {
      "location": "Ruin Station (Pyro)",
      "system": "Pyro",
      "price": 118,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Laboratoire Jumptown",
        "body": "Yela",
        "system": "stanton",
        "price": 90,
        "stock": "medium"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Ruin Station",
        "body": "Terminus",
        "system": "pyro",
        "price": 118,
        "demand": "high",
        "margin": 28
      },
      {
        "terminal": "Checkmate Station",
        "body": "Pyro I-II",
        "system": "pyro",
        "price": 116,
        "demand": "high",
        "margin": 26
      }
    ]
  },
  {
    "id": "diamond",
    "slug": "diamond",
    "name_fr": "Diamant Industriel",
    "name_en": "Diamond",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 54.84,
    "baseSell": 82,
    "marginPerScu": 2716,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "An allotrope of the element carbon, diamonds form over billions of years under high heat and pressure. Extremely hard and thermally conductive.",
    "bestBuy": {
      "location": "Admin - Rat's Nest",
      "system": "Pyro",
      "price": 54.84,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Rod's Fuel 'N Supplies",
      "system": "Pyro",
      "price": 82,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Rat's Nest",
        "body": "Pyro V",
        "system": "pyro",
        "price": 54.8,
        "stock": "high"
      },
      {
        "terminal": "Admin - MIC-L2",
        "body": "MicroTech",
        "system": "stanton",
        "price": 57.6,
        "stock": "high"
      },
      {
        "terminal": "Admin - HUR-L4",
        "body": "Hurston",
        "system": "stanton",
        "price": 62.7,
        "stock": "high"
      },
      {
        "terminal": "Bueno Ravine",
        "body": "Bloom",
        "system": "pyro",
        "price": 65.6,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Rod's Fuel 'N Supplies",
        "body": "Pyro V",
        "system": "pyro",
        "price": 82,
        "demand": "high",
        "margin": 27.2
      },
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 77,
        "demand": "high",
        "margin": 22.2
      },
      {
        "terminal": "CBD - Central Business District - Lorville",
        "body": "Hurston",
        "system": "stanton",
        "price": 77,
        "demand": "high",
        "margin": 22.2
      },
      {
        "terminal": "Scrap - Rappel",
        "body": "Hurston",
        "system": "stanton",
        "price": 77,
        "demand": "high",
        "margin": 22.2
      }
    ]
  },
  {
    "id": "hephaestanite",
    "slug": "hephaestanite",
    "name_fr": "Héphaestanite Raffinée",
    "name_en": "Hephaestanite",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 33.03,
    "baseSell": 60,
    "marginPerScu": 2697,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Found often near volcanic outcroppings, this mineral is commonly used for a thermal insulator.",
    "bestBuy": {
      "location": "Admin - Rod's Fuel 'N Supplies",
      "system": "Pyro",
      "price": 33.03,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - MIC-L4",
      "system": "Stanton",
      "price": 60,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Rod's Fuel 'N Supplies",
        "body": "Pyro V",
        "system": "pyro",
        "price": 33,
        "stock": "high"
      },
      {
        "terminal": "Admin - HUR-L2",
        "body": "Hurston",
        "system": "stanton",
        "price": 39.3,
        "stock": "high"
      },
      {
        "terminal": "Shubin Mining Facility SAL-5",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 39.3,
        "stock": "high"
      },
      {
        "terminal": "Shubin Mining Facility SAL-2",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 39.3,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - MIC-L4",
        "body": "MicroTech",
        "system": "stanton",
        "price": 60,
        "demand": "high",
        "margin": 27
      },
      {
        "terminal": "TDD - Trade and Development Division - Commons - New Babbage",
        "body": "MicroTech",
        "system": "stanton",
        "price": 49,
        "demand": "high",
        "margin": 16
      },
      {
        "terminal": "Admin - ARC-L5",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 48,
        "demand": "high",
        "margin": 15
      },
      {
        "terminal": "TDD - Trade and Development Division - Area 18",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 48,
        "demand": "high",
        "margin": 15
      }
    ]
  },
  {
    "id": "laranite",
    "slug": "laranite",
    "name_fr": "Laranite (Fret Cargo)",
    "name_en": "Laranite",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 70.47,
    "baseSell": 97,
    "marginPerScu": 2653,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A somewhat radioactive, crystalline gemstone. Black with streaks of dark red, it can only be used as jewelry if shielded.",
    "bestBuy": {
      "location": "ArcCorp Mining Area 056 (Wala)",
      "system": "Stanton",
      "price": 70.47,
      "stock": "high"
    },
    "bestSell": {
      "location": "Area18 TDD (ArcCorp)",
      "system": "Stanton",
      "price": 97,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "ArcCorp Mining Area 056",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 70.5,
        "stock": "high"
      },
      {
        "terminal": "Admin - CRU-L4",
        "body": "Crusader",
        "system": "stanton",
        "price": 74,
        "stock": "high"
      },
      {
        "terminal": "Admin - ARC-L1",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 74,
        "stock": "high"
      },
      {
        "terminal": "ArcCorp Mining Area 045",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 74,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Rod's Fuel 'N Supplies",
        "body": "Pyro V",
        "system": "pyro",
        "price": 97,
        "demand": "high",
        "margin": 26.5
      },
      {
        "terminal": "Admin - Dudley & Daughters",
        "body": "Terminus",
        "system": "pyro",
        "price": 97,
        "demand": "high",
        "margin": 26.5
      },
      {
        "terminal": "CBD - Central Business District - Lorville",
        "body": "Hurston",
        "system": "stanton",
        "price": 91,
        "demand": "high",
        "margin": 20.5
      },
      {
        "terminal": "TDD - Trade and Development Division - Area 18",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 89,
        "demand": "high",
        "margin": 18.5
      }
    ]
  },
  {
    "id": "quartz",
    "slug": "quartz",
    "name_fr": "Quartz Purifié",
    "name_en": "Quartz",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 29.64,
    "baseSell": 55,
    "marginPerScu": 2536,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A chiral crystal composed of silicon and oxygen that can be found in a wide variety of forms and colors.",
    "bestBuy": {
      "location": "Shubin Mining Facility SM0-18",
      "system": "Stanton",
      "price": 29.64,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Stanton Gateway (Pyro)",
      "system": "Pyro",
      "price": 55,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Shubin Mining Facility SM0-18",
        "body": "MicroTech",
        "system": "stanton",
        "price": 29.6,
        "stock": "high"
      },
      {
        "terminal": "Shubin Mining Facility SM0-13",
        "body": "MicroTech",
        "system": "stanton",
        "price": 29.6,
        "stock": "high"
      },
      {
        "terminal": "Shubin Mining Facility SM0-10",
        "body": "MicroTech",
        "system": "stanton",
        "price": 29.6,
        "stock": "high"
      },
      {
        "terminal": "Shubin Mining Facility SM0-22",
        "body": "MicroTech",
        "system": "stanton",
        "price": 29.6,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Stanton Gateway (Pyro)",
        "body": "Pyro",
        "system": "pyro",
        "price": 55,
        "demand": "high",
        "margin": 25.4
      },
      {
        "terminal": "Admin - Nyx Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 53,
        "demand": "high",
        "margin": 23.4
      },
      {
        "terminal": "Admin - Seraphim",
        "body": "Crusader",
        "system": "stanton",
        "price": 47,
        "demand": "high",
        "margin": 17.4
      },
      {
        "terminal": "Admin - Pyro Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 47,
        "demand": "high",
        "margin": 17.4
      }
    ]
  },
  {
    "id": "borase",
    "slug": "borase",
    "name_fr": "Borase Pure",
    "name_en": "Borase",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 95,
    "baseSell": 120,
    "marginPerScu": 2500,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "This highly thermally conductive material is often formed from cosmic ray spallation and is most typically found in younger star systems.",
    "bestBuy": {
      "location": "MIC-L1 Shallow Frontier",
      "system": "Stanton",
      "price": 95,
      "stock": "high"
    },
    "bestSell": {
      "location": "Area18 TDD (ArcCorp)",
      "system": "Stanton",
      "price": 120,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "MIC-L1 Refinery",
        "body": "microTech L1",
        "system": "stanton",
        "price": 95,
        "stock": "high"
      },
      {
        "terminal": "ARC-L1 Refinery",
        "body": "ArcCorp L1",
        "system": "stanton",
        "price": 98,
        "stock": "medium"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Area18 TDD",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 120,
        "demand": "high",
        "margin": 25
      },
      {
        "terminal": "Levski Customs",
        "body": "Delamar",
        "system": "nyx",
        "price": 122,
        "demand": "high",
        "margin": 27
      }
    ]
  },
  {
    "id": "medical-supplies",
    "slug": "medical-supplies",
    "name_fr": "Fournitures Médicales (Med Supplies)",
    "name_en": "Medical Supplies",
    "category": "medical",
    "commodityType": "medical_supply",
    "baseBuy": 33.43,
    "baseSell": 58,
    "marginPerScu": 2457,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A variety of items produced primarily to treat injury or illness.",
    "bestBuy": {
      "location": "Rayari Kaltag Research Outpost",
      "system": "Stanton",
      "price": 33.43,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Nyx Gateway (Pyro)",
      "system": "Pyro",
      "price": 58,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Rayari Kaltag Research Outpost",
        "body": "MicroTech",
        "system": "stanton",
        "price": 33.4,
        "stock": "high"
      },
      {
        "terminal": "Rayari Anvik Research Outpost",
        "body": "MicroTech",
        "system": "stanton",
        "price": 33.4,
        "stock": "high"
      },
      {
        "terminal": "Deakins Research Outpost",
        "body": "Crusader",
        "system": "stanton",
        "price": 33.8,
        "stock": "high"
      },
      {
        "terminal": "Hickes Research Outpost",
        "body": "Crusader",
        "system": "stanton",
        "price": 34.1,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Nyx Gateway (Pyro)",
        "body": "Pyro",
        "system": "pyro",
        "price": 58,
        "demand": "high",
        "margin": 24.6
      },
      {
        "terminal": "Admin - HUR-L2",
        "body": "Hurston",
        "system": "stanton",
        "price": 57,
        "demand": "high",
        "margin": 23.6
      },
      {
        "terminal": "Rayari Deltana Research Outpost",
        "body": "MicroTech",
        "system": "stanton",
        "price": 55,
        "demand": "high",
        "margin": 21.6
      },
      {
        "terminal": "Rayari McGrath Research Outpost",
        "body": "MicroTech",
        "system": "stanton",
        "price": 55,
        "demand": "high",
        "margin": 21.6
      }
    ]
  },
  {
    "id": "construction-materials",
    "slug": "construction-materials",
    "name_fr": "Matériaux de Construction Structurels (CM)",
    "name_en": "Construction Materials",
    "category": "industrial",
    "commodityType": "consumer_goods",
    "baseBuy": 48,
    "baseSell": 72,
    "marginPerScu": 2400,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Various supplies used to build, repair, and maintain buildings and structures.",
    "bestBuy": {
      "location": "Broyeurs industriels & Stations",
      "system": "Stanton",
      "price": 48,
      "stock": "high"
    },
    "bestSell": {
      "location": "Lorville CBD (Hurston)",
      "system": "Stanton",
      "price": 72,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 86.4,
        "stock": "high"
      },
      {
        "terminal": "Sunset Mesa",
        "body": "Monox",
        "system": "pyro",
        "price": 100.2,
        "stock": "high"
      },
      {
        "terminal": "Rustville",
        "body": "Pyro I",
        "system": "pyro",
        "price": 100.2,
        "stock": "high"
      },
      {
        "terminal": "Last Landings",
        "body": "Terminus",
        "system": "pyro",
        "price": 100.2,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - MIC-L4",
        "body": "MicroTech",
        "system": "stanton",
        "price": 130,
        "demand": "high",
        "margin": 43.6
      },
      {
        "terminal": "Admin - HUR-L3",
        "body": "Hurston",
        "system": "stanton",
        "price": 130,
        "demand": "high",
        "margin": 43.6
      },
      {
        "terminal": "Admin - CRU-L4",
        "body": "Crusader",
        "system": "stanton",
        "price": 130,
        "demand": "high",
        "margin": 43.6
      },
      {
        "terminal": "Admin - Everus Harbor",
        "body": "Hurston",
        "system": "stanton",
        "price": 130,
        "demand": "high",
        "margin": 43.6
      }
    ]
  },
  {
    "id": "bioplastic",
    "slug": "bioplastic",
    "name_fr": "Bioplastic",
    "name_en": "Bioplastic",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 62.99,
    "baseSell": 86,
    "marginPerScu": 2301,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A plastic replacement material created when fossil fuels began running low in Sol. It is derived from renewable biomass sources, often from vat grown bacteria but can be derived from industrial byproducts as well.",
    "bestBuy": {
      "location": "Rayari Anvik Research Outpost",
      "system": "Stanton",
      "price": 62.99,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Checkmate",
      "system": "Pyro",
      "price": 86,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Rayari Anvik Research Outpost",
        "body": "MicroTech",
        "system": "stanton",
        "price": 63,
        "stock": "high"
      },
      {
        "terminal": "Rayari Kaltag Research Outpost",
        "body": "MicroTech",
        "system": "stanton",
        "price": 63,
        "stock": "high"
      },
      {
        "terminal": "The Golden Riviera",
        "body": "Bloom",
        "system": "pyro",
        "price": 65.4,
        "stock": "high"
      },
      {
        "terminal": "Deakins Research Outpost",
        "body": "Crusader",
        "system": "stanton",
        "price": 65.4,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Checkmate",
        "body": "Monox",
        "system": "pyro",
        "price": 86,
        "demand": "high",
        "margin": 23
      },
      {
        "terminal": "Admin - Orbituary",
        "body": "Bloom",
        "system": "pyro",
        "price": 86,
        "demand": "high",
        "margin": 23
      },
      {
        "terminal": "Rayari McGrath Research Outpost",
        "body": "MicroTech",
        "system": "stanton",
        "price": 85,
        "demand": "high",
        "margin": 22
      },
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 85,
        "demand": "high",
        "margin": 22
      }
    ]
  },
  {
    "id": "agricium-ore",
    "slug": "agricium-ore",
    "name_fr": "Agricium (Ore)",
    "name_en": "Agricium (Ore)",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A rare and valuable silvery metal with a blue-green sheen. Malleable, ductile, and largely non-reactive.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "aluminum-ore",
    "slug": "aluminum-ore",
    "name_fr": "Aluminum (Ore)",
    "name_en": "Aluminum (Ore)",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A chemically reactive, gray metal that is malleable, lightweight, ductile, strong, and resistant to corrosion. Capable of superconductivity.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "aphorite",
    "slug": "aphorite",
    "name_fr": "Aphorite",
    "name_en": "Aphorite",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Decorative jewel crystal prized for its multi-hued tones.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "aslarite",
    "slug": "aslarite",
    "name_fr": "Aslarite",
    "name_en": "Aslarite",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Aslarite is a naturally-occurring mineral that is most commonly found on asteroids. Sought for its natural thermal insulation properties, it can be processed and used in the construction of personal armor to help the wearer withstand extreme temperatures.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "aslarite-raw",
    "slug": "aslarite-raw",
    "name_fr": "Aslarite (Raw)",
    "name_en": "Aslarite (Raw)",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Aslarite is a naturally-occurring mineral that is most commonly found on asteroids. Sought for its natural thermal insulation properties, it can be processed and used in the construction of personal armor to help the wearer withstand extreme temperatures.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "atlasium",
    "slug": "atlasium",
    "name_fr": "Atlasium",
    "name_en": "Atlasium",
    "category": "metals",
    "commodityType": "alloy",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "This very strong metal alloy is often one of the few materials salvageable from severe wreck sites.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "beradom",
    "slug": "beradom",
    "name_fr": "Beradom",
    "name_en": "Beradom",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Formed when sap from the Beraber Fir is crystalized during forest fires, this transparent deep blue \"gemstone\" is often polished smooth and used in jewelry. While it can be manufactured by growing trees and then doing a controlled burn, the time investment for the trees to reach the proper maturity still make this a rare commodity.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "beryl-raw",
    "slug": "beryl-raw",
    "name_fr": "Béryl Brut",
    "name_en": "Beryl (Raw)",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A mineral that creates natural hexagonal crystals. Colorless in its pure form, its impure forms include the gems emerald and aquamarine.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "bexalite-raw",
    "slug": "bexalite-raw",
    "name_fr": "Bexalite Brute",
    "name_en": "Bexalite (Raw)",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "This mineral harvested from worlds with no natural magnetic core, has found widespread use in electrical systems.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "carinite",
    "slug": "carinite",
    "name_fr": "Carinite",
    "name_en": "Carinite",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A rare mineral because the extreme pressure needed for its formation is very uncommon, it is in high demand thanks to its use in advanced computer processors and other cutting-edge electronics.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "carinite-pure",
    "slug": "carinite-pure",
    "name_fr": "Carinite (Pure)",
    "name_en": "Carinite (Pure)",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Typical carinite sources feature various impurities. However, under certain extremely rare conditions, carinite veins that are more than 90% pure can form. Computing hardware that demands exacting precision will usually seek out pure carinite.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "copper-ore",
    "slug": "copper-ore",
    "name_fr": "Copper (Ore)",
    "name_en": "Copper (Ore)",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A soft red-orange colored metal with high conductivity. Prone to oxidation unless properly treated.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "corundum-raw",
    "slug": "corundum-raw",
    "name_fr": "Corindon Brut",
    "name_en": "Corundum (Raw)",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "The crystalline form of aluminum oxide. Used as a gem. Varieties include ruby, sapphire, and padparadscha.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "diamond-raw",
    "slug": "diamond-raw",
    "name_fr": "Diamant Brut",
    "name_en": "Diamond (Raw)",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "An allotrope of the element carbon, diamonds form over billions of years under high heat and pressure. Extremely hard and thermally conductive.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "dolivine",
    "slug": "dolivine",
    "name_fr": "Dolivine",
    "name_en": "Dolivine",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A dull green gemstone that is used decoratively but also can be used for industrial purposes thanks to its resistance to weathering and high density.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "feynmaline",
    "slug": "feynmaline",
    "name_fr": "Feynmaline",
    "name_en": "Feynmaline",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "The paramorphic crystalline structure of this mineral is extremely volatile. When extra energy is introduced, as is typical with modern mining, the ore will often explosively degrade into the more stably structured Janalite. This instability makes Feynamline very dangerous to acquire but also extremely valuable as an industrial anti-matter precursor if it can be properly harvested.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "glacosite",
    "slug": "glacosite",
    "name_fr": "Glacosite",
    "name_en": "Glacosite",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "As glaciers form, heavier mineral contents sink over time and are then crushed by the weight above as the ice deforms and flows. When the glacier recedes, Glacosite deposits are left behind. White and blue in color, the crystals form in long shiny strands that almost are cotton-like in appearance. Glacosite has found specialized commercial use since it is an extremely light and durable insulator.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "gold-ore",
    "slug": "gold-ore",
    "name_fr": "Gold (Ore)",
    "name_en": "Gold (Ore)",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A commonly found ductile metal favored for its conductivity. Though it falls in and out of fashion, it is often used for decorative purposes as well.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "hadanite",
    "slug": "hadanite",
    "name_fr": "Hadanite",
    "name_en": "Hadanite",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A crystal oscillator sought out for its extremely high frequency of vibration which makes it useful in various applications.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "hephaestanite-r",
    "slug": "hephaestanite-r",
    "name_fr": "Hephaestanite (R)",
    "name_en": "Hephaestanite (R)",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Found often near volcanic outcroppings, this mineral is commonly used for a thermal insulator.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "inert-materials",
    "slug": "inert-materials",
    "name_fr": "Inert Materials",
    "name_en": "Inert Materials",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Non-valuable materials collected during the mining process.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "iron-ore",
    "slug": "iron-ore",
    "name_fr": "Iron (Ore)",
    "name_en": "Iron (Ore)",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Element Fe, strong, malleable, highly susceptible to rust and found in large volume across most star systems.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "jaclium-ore",
    "slug": "jaclium-ore",
    "name_fr": "Jaclium (Ore)",
    "name_en": "Jaclium (Ore)",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "janalite",
    "slug": "janalite",
    "name_fr": "Janalite",
    "name_en": "Janalite",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "This rare mineral is valued as an industrial anti-matter precursor. While more stable than other precursors like Feynmaline, it's tougher structure and energy resistance makes it much more difficult to utilize as well as collect.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "laranite-raw",
    "slug": "laranite-raw",
    "name_fr": "Laranite Brute",
    "name_en": "Laranite (Raw)",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A somewhat radioactive, crystalline gemstone. Black with streaks of dark red, it can only be used as jewelry if shielded.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "lindinium-ore",
    "slug": "lindinium-ore",
    "name_fr": "Lindinium (Ore)",
    "name_en": "Lindinium (Ore)",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "mixed-mining",
    "slug": "mixed-mining",
    "name_fr": "Mixed Mining",
    "name_en": "Mixed Mining",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A mixed collection of commodities obtained by mining",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "quantainium-raw",
    "slug": "quantainium-raw",
    "name_fr": "Quantainium Brut",
    "name_en": "Quantainium (Raw)",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A highly unstable mineral used in the production of quantum fuel.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "quartz-raw",
    "slug": "quartz-raw",
    "name_fr": "Quartz Brut",
    "name_en": "Quartz (Raw)",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A chiral crystal composed of silicon and oxygen that can be found in a wide variety of forms and colors.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "riccite-ore",
    "slug": "riccite-ore",
    "name_fr": "Riccite (Ore)",
    "name_en": "Riccite (Ore)",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "saldynium-ore",
    "slug": "saldynium-ore",
    "name_fr": "Saldynium (Ore)",
    "name_en": "Saldynium (Ore)",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "savrilium",
    "slug": "savrilium",
    "name_fr": "Savrilium",
    "name_en": "Savrilium",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "savrilium-ore",
    "slug": "savrilium-ore",
    "name_fr": "Savrilium (Ore)",
    "name_en": "Savrilium (Ore)",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "stileron-ore",
    "slug": "stileron-ore",
    "name_fr": "Stileron (Ore)",
    "name_en": "Stileron (Ore)",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "taranite-raw",
    "slug": "taranite-raw",
    "name_fr": "Taranite Brute",
    "name_en": "Taranite (Raw)",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Extremely conductive, this mineral was first discovered when a researcher noticed a breed of electrosensitive hermit crab using pieces of it to form its shell.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "tin-ore",
    "slug": "tin-ore",
    "name_fr": "Tin (Ore)",
    "name_en": "Tin (Ore)",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "Tin is a pliable, soft metal, with a silvery white-blue tint. It is conductive and resistance to corrosion.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "titanium-ore",
    "slug": "titanium-ore",
    "name_fr": "Titanium (Ore)",
    "name_en": "Titanium (Ore)",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "This silver-colored chemical element is excellent at producing strong, lightweight alloys.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "torite",
    "slug": "torite",
    "name_fr": "Torite",
    "name_en": "Torite",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "torite-ore",
    "slug": "torite-ore",
    "name_fr": "Torite (Ore)",
    "name_en": "Torite (Ore)",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "tungsten-ore",
    "slug": "tungsten-ore",
    "name_fr": "Tungsten (Ore)",
    "name_en": "Tungsten (Ore)",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 65,
    "baseSell": 88,
    "marginPerScu": 2300,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24
    ],
    "consumable": false,
    "description": "Used in many different alloys, tungsten in its pure form becomes malleable while maintaining its hardness.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 65,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 88,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "altruciatoxin",
    "slug": "altruciatoxin",
    "name_fr": "Altruciatoxine",
    "name_en": "Altruciatoxin",
    "category": "illicit",
    "commodityType": "vice",
    "baseBuy": 48.14,
    "baseSell": 69,
    "marginPerScu": 2086,
    "isIllegal": true,
    "unitWeightKg": 100,
    "containerSizes": [
      0.00075,
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Created by chemically processing the pollen of Revenant Tree (altrucia lacus), common effects of ingesting or smoking altruciatoxin include relaxing of the muscles, sensory enhancement, and lethargy. Heavy usage can cause staining of the tongue.",
    "bestBuy": {
      "location": "Admin - Rat's Nest",
      "system": "Pyro",
      "price": 48.14,
      "stock": "high"
    },
    "bestSell": {
      "location": "Samson & Son's Salvage Center",
      "system": "Stanton",
      "price": 69,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Rat's Nest",
        "body": "Pyro V",
        "system": "pyro",
        "price": 48.1,
        "stock": "high"
      },
      {
        "terminal": "The Golden Riviera",
        "body": "Bloom",
        "system": "pyro",
        "price": 56.6,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Samson & Son's Salvage Center",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 69,
        "demand": "high",
        "margin": 20.9
      },
      {
        "terminal": "Reclamation and Disposal Orinth",
        "body": "Hurston",
        "system": "stanton",
        "price": 69,
        "demand": "high",
        "margin": 20.9
      },
      {
        "terminal": "Brio's Breaker Yard",
        "body": "Crusader",
        "system": "stanton",
        "price": 69,
        "demand": "high",
        "margin": 20.9
      },
      {
        "terminal": "Devlin Scrap and Salvage",
        "body": "MicroTech",
        "system": "stanton",
        "price": 69,
        "demand": "high",
        "margin": 20.9
      }
    ]
  },
  {
    "id": "aluminum",
    "slug": "aluminum",
    "name_fr": "Aluminium Électrolytique",
    "name_en": "Aluminum",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 25.84,
    "baseSell": 46,
    "marginPerScu": 2016,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A chemically reactive, gray metal that is malleable, lightweight, ductile, strong, and resistant to corrosion. Capable of superconductivity.",
    "bestBuy": {
      "location": "Admin - Megumi Refueling",
      "system": "Pyro",
      "price": 25.84,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Terra Gateway (Stanton)",
      "system": "Stanton",
      "price": 46,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Megumi Refueling",
        "body": "Terminus",
        "system": "pyro",
        "price": 25.8,
        "stock": "high"
      },
      {
        "terminal": "Admin - Rod's Fuel 'N Supplies",
        "body": "Pyro V",
        "system": "pyro",
        "price": 25.8,
        "stock": "high"
      },
      {
        "terminal": "Shubin Mining Facility SM0-10",
        "body": "MicroTech",
        "system": "stanton",
        "price": 29.6,
        "stock": "high"
      },
      {
        "terminal": "Shubin Mining Facility SM0-22",
        "body": "MicroTech",
        "system": "stanton",
        "price": 29.6,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Terra Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 46,
        "demand": "high",
        "margin": 20.2
      },
      {
        "terminal": "Admin - Everus Harbor",
        "body": "Hurston",
        "system": "stanton",
        "price": 42,
        "demand": "high",
        "margin": 16.2
      },
      {
        "terminal": "TDD - Trade and Development Division - Area 18",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 38,
        "demand": "high",
        "margin": 12.2
      },
      {
        "terminal": "CBD - Central Business District - Lorville",
        "body": "Hurston",
        "system": "stanton",
        "price": 38,
        "demand": "high",
        "margin": 12.2
      }
    ]
  },
  {
    "id": "stims",
    "slug": "stims",
    "name_fr": "Stimulants Médicaux",
    "name_en": "Stims",
    "category": "illicit",
    "commodityType": "vice",
    "baseBuy": 38.86,
    "baseSell": 59,
    "marginPerScu": 2014,
    "isIllegal": true,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Composed of various combinations of tobacco, caffeine, and mood-enhancer, stims are smoked as a cigarette.",
    "bestBuy": {
      "location": "Admin - Gaslight",
      "system": "Pyro",
      "price": 38.86,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - People's Service Station Alpha",
      "system": "Nyx",
      "price": 59,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Gaslight",
        "body": "Pyro V",
        "system": "pyro",
        "price": 38.9,
        "stock": "high"
      },
      {
        "terminal": "Admin - Starlight Service",
        "body": "Bloom",
        "system": "pyro",
        "price": 38.9,
        "stock": "high"
      },
      {
        "terminal": "Deakins Research Outpost",
        "body": "Crusader",
        "system": "stanton",
        "price": 43,
        "stock": "high"
      },
      {
        "terminal": "Hickes Research Outpost",
        "body": "Crusader",
        "system": "stanton",
        "price": 43,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - People's Service Station Alpha",
        "body": "Nyx",
        "system": "nyx",
        "price": 59,
        "demand": "high",
        "margin": 20.1
      },
      {
        "terminal": "Admin - People's Service Station Lambda",
        "body": "Nyx",
        "system": "nyx",
        "price": 59,
        "demand": "high",
        "margin": 20.1
      },
      {
        "terminal": "Admin - HUR-L3",
        "body": "Hurston",
        "system": "stanton",
        "price": 59,
        "demand": "high",
        "margin": 20.1
      },
      {
        "terminal": "Admin - People's Service Station Delta",
        "body": "Nyx",
        "system": "nyx",
        "price": 59,
        "demand": "high",
        "margin": 20.1
      }
    ]
  },
  {
    "id": "corundum",
    "slug": "corundum",
    "name_fr": "Corindon Industriel",
    "name_en": "Corundum",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 25.08,
    "baseSell": 44,
    "marginPerScu": 1892,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "The crystalline form of aluminum oxide. Used as a gem. Varieties include ruby, sapphire, and padparadscha.",
    "bestBuy": {
      "location": "Shubin Mining Facility SAL-2",
      "system": "Stanton",
      "price": 25.08,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Rod's Fuel 'N Supplies",
      "system": "Pyro",
      "price": 44,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Shubin Mining Facility SAL-2",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 25.1,
        "stock": "high"
      },
      {
        "terminal": "Shubin Mining Facility SAL-5",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 25.1,
        "stock": "high"
      },
      {
        "terminal": "Shubin Mining Facility SCD-1",
        "body": "Crusader",
        "system": "stanton",
        "price": 26.4,
        "stock": "high"
      },
      {
        "terminal": "Shubin Mining Facility SMCa-6",
        "body": "MicroTech",
        "system": "stanton",
        "price": 26.4,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Rod's Fuel 'N Supplies",
        "body": "Pyro V",
        "system": "pyro",
        "price": 44,
        "demand": "high",
        "margin": 18.9
      },
      {
        "terminal": "Admin - Orbituary",
        "body": "Bloom",
        "system": "pyro",
        "price": 44,
        "demand": "high",
        "margin": 18.9
      },
      {
        "terminal": "Admin - Terra Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 39,
        "demand": "high",
        "margin": 13.9
      },
      {
        "terminal": "TDD - Trade and Development Division - Area 18",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 37,
        "demand": "high",
        "margin": 11.9
      }
    ]
  },
  {
    "id": "omnapoxy",
    "slug": "omnapoxy",
    "name_fr": "Omnapoxy",
    "name_en": "Omnapoxy",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 32.37,
    "baseSell": 50,
    "marginPerScu": 1763,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Durable and resistant, this resin quickly sets when applied to form a hardened polymer.",
    "bestBuy": {
      "location": "Admin - Patch City",
      "system": "Pyro",
      "price": 32.37,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - ARC-L1",
      "system": "Stanton",
      "price": 50,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Patch City",
        "body": "Bloom",
        "system": "pyro",
        "price": 32.4,
        "stock": "high"
      },
      {
        "terminal": "Admin - Dudley & Daughters",
        "body": "Terminus",
        "system": "pyro",
        "price": 35.2,
        "stock": "high"
      },
      {
        "terminal": "Deakins Research Outpost",
        "body": "Crusader",
        "system": "stanton",
        "price": 40.4,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - ARC-L1",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 50,
        "demand": "high",
        "margin": 17.6
      },
      {
        "terminal": "Admin - HUR-L1",
        "body": "Hurston",
        "system": "stanton",
        "price": 50,
        "demand": "high",
        "margin": 17.6
      },
      {
        "terminal": "Admin - HUR-L3",
        "body": "Hurston",
        "system": "stanton",
        "price": 50,
        "demand": "high",
        "margin": 17.6
      },
      {
        "terminal": "Admin - Seraphim",
        "body": "Crusader",
        "system": "stanton",
        "price": 50,
        "demand": "high",
        "margin": 17.6
      }
    ]
  },
  {
    "id": "xa-pyen",
    "slug": "xa-pyen",
    "name_fr": "Xa'Pyen",
    "name_en": "Xa'Pyen",
    "category": "metals",
    "commodityType": "alloy",
    "baseBuy": 31.49,
    "baseSell": 49,
    "marginPerScu": 1751,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Only recently used in Human manufacturing, this complex alloy of Xi'an origin is a jack of all trades that is extremely useful in numerous applications.",
    "bestBuy": {
      "location": "Admin - Gaslight",
      "system": "Pyro",
      "price": 31.49,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - MIC-L3",
      "system": "Stanton",
      "price": 49,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Gaslight",
        "body": "Pyro V",
        "system": "pyro",
        "price": 31.5,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - MIC-L3",
        "body": "MicroTech",
        "system": "stanton",
        "price": 49,
        "demand": "high",
        "margin": 17.5
      },
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 48,
        "demand": "high",
        "margin": 16.5
      },
      {
        "terminal": "TDD - Trade and Development Division - Area 18",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 48,
        "demand": "high",
        "margin": 16.5
      },
      {
        "terminal": "CBD - Central Business District - Lorville",
        "body": "Hurston",
        "system": "stanton",
        "price": 48,
        "demand": "high",
        "margin": 16.5
      }
    ]
  },
  {
    "id": "copper",
    "slug": "copper",
    "name_fr": "Cuivre Raffiné",
    "name_en": "Copper",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 26.6,
    "baseSell": 44,
    "marginPerScu": 1740,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A soft red-orange colored metal with high conductivity. Prone to oxidation unless properly treated.",
    "bestBuy": {
      "location": "Admin - Megumi Refueling",
      "system": "Pyro",
      "price": 26.6,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Stanton Gateway (Pyro)",
      "system": "Pyro",
      "price": 44,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Megumi Refueling",
        "body": "Terminus",
        "system": "pyro",
        "price": 26.6,
        "stock": "high"
      },
      {
        "terminal": "Admin - Orbituary",
        "body": "Bloom",
        "system": "pyro",
        "price": 28.9,
        "stock": "high"
      },
      {
        "terminal": "Admin - Seraphim",
        "body": "Crusader",
        "system": "stanton",
        "price": 32,
        "stock": "high"
      },
      {
        "terminal": "Admin - Port Tressler",
        "body": "MicroTech",
        "system": "stanton",
        "price": 32,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Stanton Gateway (Pyro)",
        "body": "Pyro",
        "system": "pyro",
        "price": 44,
        "demand": "high",
        "margin": 17.4
      },
      {
        "terminal": "Admin - Rod's Fuel 'N Supplies",
        "body": "Pyro V",
        "system": "pyro",
        "price": 43,
        "demand": "high",
        "margin": 16.4
      },
      {
        "terminal": "Admin - Terra Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 43,
        "demand": "high",
        "margin": 16.4
      },
      {
        "terminal": "Admin - Rat's Nest",
        "body": "Pyro V",
        "system": "pyro",
        "price": 42,
        "demand": "high",
        "margin": 15.4
      }
    ]
  },
  {
    "id": "nitrogen",
    "slug": "nitrogen",
    "name_fr": "Azote Liquide",
    "name_en": "Nitrogen",
    "category": "gases",
    "commodityType": "gas",
    "baseBuy": 22.42,
    "baseSell": 39,
    "marginPerScu": 1658,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A low-density, diatomic gas with no color or odor in its natural state. A necessary element in human respiration.",
    "bestBuy": {
      "location": "Admin - Endgame",
      "system": "Pyro",
      "price": 22.42,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - ARC-L4",
      "system": "Stanton",
      "price": 39,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Endgame",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 22.4,
        "stock": "high"
      },
      {
        "terminal": "Admin - Gaslight",
        "body": "Pyro V",
        "system": "pyro",
        "price": 22.4,
        "stock": "high"
      },
      {
        "terminal": "Rayari Anvik Research Outpost",
        "body": "MicroTech",
        "system": "stanton",
        "price": 24.4,
        "stock": "high"
      },
      {
        "terminal": "Rayari Kaltag Research Outpost",
        "body": "MicroTech",
        "system": "stanton",
        "price": 24.4,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - ARC-L4",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 39,
        "demand": "high",
        "margin": 16.6
      },
      {
        "terminal": "Admin - MIC-L1",
        "body": "MicroTech",
        "system": "stanton",
        "price": 36,
        "demand": "high",
        "margin": 13.6
      },
      {
        "terminal": "Admin - ARC-L1",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 35,
        "demand": "high",
        "margin": 12.6
      },
      {
        "terminal": "Admin - HUR-L2",
        "body": "Hurston",
        "system": "stanton",
        "price": 35,
        "demand": "high",
        "margin": 12.6
      }
    ]
  },
  {
    "id": "methane",
    "slug": "methane",
    "name_fr": "Methane",
    "name_en": "Methane",
    "category": "gases",
    "commodityType": "gas",
    "baseBuy": 27.45,
    "baseSell": 44,
    "marginPerScu": 1655,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A highly flammable gas composed of carbon and hydrogen. It is colorless and odorless in its natural state.",
    "bestBuy": {
      "location": "Admin - Gaslight",
      "system": "Pyro",
      "price": 27.45,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Starlight Service",
      "system": "Pyro",
      "price": 44,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Gaslight",
        "body": "Pyro V",
        "system": "pyro",
        "price": 27.5,
        "stock": "high"
      },
      {
        "terminal": "Admin - Dudley & Daughters",
        "body": "Terminus",
        "system": "pyro",
        "price": 27.5,
        "stock": "high"
      },
      {
        "terminal": "Admin - HUR-L5",
        "body": "Hurston",
        "system": "stanton",
        "price": 27.9,
        "stock": "high"
      },
      {
        "terminal": "Admin - CRU-L1",
        "body": "Crusader",
        "system": "stanton",
        "price": 30.3,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Starlight Service",
        "body": "Bloom",
        "system": "pyro",
        "price": 44,
        "demand": "high",
        "margin": 16.6
      },
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 37,
        "demand": "high",
        "margin": 9.6
      },
      {
        "terminal": "TDD - Trade and Development Division - Area 18",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 37,
        "demand": "high",
        "margin": 9.6
      },
      {
        "terminal": "CBD - Central Business District - Lorville",
        "body": "Hurston",
        "system": "stanton",
        "price": 37,
        "demand": "high",
        "margin": 9.6
      }
    ]
  },
  {
    "id": "titanium",
    "slug": "titanium",
    "name_fr": "Titane Industriel (Titanium)",
    "name_en": "Titanium",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 66.99,
    "baseSell": 83,
    "marginPerScu": 1601,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "This silver-colored chemical element is excellent at producing strong, lightweight alloys.",
    "bestBuy": {
      "location": "Shubin Mining Facility SAL-5",
      "system": "Stanton",
      "price": 66.99,
      "stock": "high"
    },
    "bestSell": {
      "location": "TDD - Trade and Development Division - Area 18",
      "system": "Stanton",
      "price": 83,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Shubin Mining Facility SAL-5",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 67,
        "stock": "high"
      },
      {
        "terminal": "Shubin Mining Facility SAL-2",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 67,
        "stock": "high"
      },
      {
        "terminal": "HDMS-Bezdek",
        "body": "Hurston",
        "system": "stanton",
        "price": 70.3,
        "stock": "high"
      },
      {
        "terminal": "HDMS-Lathan",
        "body": "Hurston",
        "system": "stanton",
        "price": 70.3,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "TDD - Trade and Development Division - Area 18",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 83,
        "demand": "high",
        "margin": 16
      },
      {
        "terminal": "CBD - Central Business District - Lorville",
        "body": "Hurston",
        "system": "stanton",
        "price": 83,
        "demand": "high",
        "margin": 16
      },
      {
        "terminal": "TDD - Trade and Development Division - Cloudview Center - Orison",
        "body": "Crusader",
        "system": "stanton",
        "price": 83,
        "demand": "high",
        "margin": 16
      },
      {
        "terminal": "TDD - Trade and Development Division - Commons - New Babbage",
        "body": "MicroTech",
        "system": "stanton",
        "price": 83,
        "demand": "high",
        "margin": 16
      }
    ]
  },
  {
    "id": "thermalfoam",
    "slug": "thermalfoam",
    "name_fr": "ThermalFoam",
    "name_en": "ThermalFoam",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 50.88,
    "baseSell": 66,
    "marginPerScu": 1512,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A light and flexible heat insulating foam. Must be stored under very high pressure to avoid it setting before application.",
    "bestBuy": {
      "location": "Deakins Research Outpost",
      "system": "Stanton",
      "price": 50.88,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - CRU-L1",
      "system": "Stanton",
      "price": 66,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Deakins Research Outpost",
        "body": "Crusader",
        "system": "stanton",
        "price": 50.9,
        "stock": "high"
      },
      {
        "terminal": "Hickes Research Outpost",
        "body": "Crusader",
        "system": "stanton",
        "price": 50.9,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - CRU-L1",
        "body": "Crusader",
        "system": "stanton",
        "price": 66,
        "demand": "high",
        "margin": 15.1
      },
      {
        "terminal": "Admin - MIC-L4",
        "body": "MicroTech",
        "system": "stanton",
        "price": 64,
        "demand": "high",
        "margin": 13.1
      },
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 64,
        "demand": "high",
        "margin": 13.1
      },
      {
        "terminal": "Admin - ARC-L3",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 63,
        "demand": "high",
        "margin": 12.1
      }
    ]
  },
  {
    "id": "medpens",
    "slug": "medpens",
    "name_fr": "MedPens",
    "name_en": "MedPens",
    "category": "medical",
    "commodityType": "medical_supply",
    "baseBuy": 34,
    "baseSell": 49,
    "marginPerScu": 1500,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.00055
    ],
    "consumable": false,
    "description": "The MedPen from CureLife is a complete multi-function individual first-aid system designed and constructed for the rigors of field use.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 34,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 49,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "oxypens",
    "slug": "oxypens",
    "name_fr": "OxyPens",
    "name_en": "OxyPens",
    "category": "medical",
    "commodityType": "medical_supply",
    "baseBuy": 34,
    "baseSell": 49,
    "marginPerScu": 1500,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.00055
    ],
    "consumable": false,
    "description": "The OxyPen is an easy-to-carry disposable first-aid system designed by CureLife to refill pressure suit oxygen reserves in emergency situations.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 34,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 49,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "astatine",
    "slug": "astatine",
    "name_fr": "Astatine",
    "name_en": "Astatine",
    "category": "gases",
    "commodityType": "gas",
    "baseBuy": 24.69,
    "baseSell": 39,
    "marginPerScu": 1431,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A dangerously radioactive, highly unstable halogen. Some of its isotopes have half-lives of one second or less.",
    "bestBuy": {
      "location": "Admin - ARC-L3",
      "system": "Stanton",
      "price": 24.69,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - ARC-L1",
      "system": "Stanton",
      "price": 39,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - ARC-L3",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 24.7,
        "stock": "high"
      },
      {
        "terminal": "Admin - MIC-L2",
        "body": "MicroTech",
        "system": "stanton",
        "price": 26.5,
        "stock": "high"
      },
      {
        "terminal": "ArcCorp Mining Area 061",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 27.6,
        "stock": "high"
      },
      {
        "terminal": "ArcCorp Mining Area 056",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 27.6,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - ARC-L1",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 39,
        "demand": "high",
        "margin": 14.3
      },
      {
        "terminal": "Admin - Pyro Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 37,
        "demand": "high",
        "margin": 12.3
      },
      {
        "terminal": "Admin - Stanton Gateway (Pyro)",
        "body": "Pyro",
        "system": "pyro",
        "price": 37,
        "demand": "high",
        "margin": 12.3
      },
      {
        "terminal": "Deakins Research Outpost",
        "body": "Crusader",
        "system": "stanton",
        "price": 36,
        "demand": "high",
        "margin": 11.3
      }
    ]
  },
  {
    "id": "iron",
    "slug": "iron",
    "name_fr": "Fer Purifié",
    "name_en": "Iron",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 26.4,
    "baseSell": 40,
    "marginPerScu": 1360,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.125,
      4,
      8
    ],
    "consumable": false,
    "description": "Element Fe, strong, malleable, highly susceptible to rust and found in large volume across most star systems.",
    "bestBuy": {
      "location": "Bueno Ravine",
      "system": "Pyro",
      "price": 26.4,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Terra Gateway (Stanton)",
      "system": "Stanton",
      "price": 40,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Bueno Ravine",
        "body": "Bloom",
        "system": "pyro",
        "price": 26.4,
        "stock": "high"
      },
      {
        "terminal": "HDMS-Norgaard",
        "body": "Hurston",
        "system": "stanton",
        "price": 27.1,
        "stock": "high"
      },
      {
        "terminal": "HDMS-Stanhope",
        "body": "Hurston",
        "system": "stanton",
        "price": 27.1,
        "stock": "high"
      },
      {
        "terminal": "HDMS-Oparei",
        "body": "Hurston",
        "system": "stanton",
        "price": 27.1,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Terra Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 40,
        "demand": "high",
        "margin": 13.6
      },
      {
        "terminal": "Admin - Gaslight",
        "body": "Pyro V",
        "system": "pyro",
        "price": 39,
        "demand": "high",
        "margin": 12.6
      },
      {
        "terminal": "Admin - Endgame",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 39,
        "demand": "high",
        "margin": 12.6
      },
      {
        "terminal": "Admin - Dudley & Daughters",
        "body": "Terminus",
        "system": "pyro",
        "price": 36,
        "demand": "high",
        "margin": 9.6
      }
    ]
  },
  {
    "id": "silicon",
    "slug": "silicon",
    "name_fr": "Silicon",
    "name_en": "Silicon",
    "category": "industrial",
    "commodityType": "nonmetals",
    "baseBuy": 17.77,
    "baseSell": 31,
    "marginPerScu": 1323,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A strong and brittle element with good thermal conductivity. Crystalizes in a diamond form.",
    "bestBuy": {
      "location": "Admin - Megumi Refueling",
      "system": "Pyro",
      "price": 17.77,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Terra Gateway (Stanton)",
      "system": "Stanton",
      "price": 31,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Megumi Refueling",
        "body": "Terminus",
        "system": "pyro",
        "price": 17.8,
        "stock": "high"
      },
      {
        "terminal": "Admin - Ruin Station",
        "body": "Terminus",
        "system": "pyro",
        "price": 18.8,
        "stock": "high"
      },
      {
        "terminal": "Admin - Baijini Point",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 19.6,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Terra Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 31,
        "demand": "high",
        "margin": 13.2
      },
      {
        "terminal": "Admin - Patch City",
        "body": "Bloom",
        "system": "pyro",
        "price": 29,
        "demand": "high",
        "margin": 11.2
      },
      {
        "terminal": "Admin - Rat's Nest",
        "body": "Pyro V",
        "system": "pyro",
        "price": 26,
        "demand": "high",
        "margin": 8.2
      },
      {
        "terminal": "Admin - Gaslight",
        "body": "Pyro V",
        "system": "pyro",
        "price": 26,
        "demand": "high",
        "margin": 8.2
      }
    ]
  },
  {
    "id": "tin",
    "slug": "tin",
    "name_fr": "Étain",
    "name_en": "Tin",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 32.89,
    "baseSell": 46,
    "marginPerScu": 1311,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Tin is a pliable, soft metal, with a silvery white-blue tint. It is conductive and resistance to corrosion.",
    "bestBuy": {
      "location": "Admin - Nyx Gateway (Stanton)",
      "system": "Stanton",
      "price": 32.89,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Dudley & Daughters",
      "system": "Pyro",
      "price": 46,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Nyx Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 32.9,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Dudley & Daughters",
        "body": "Terminus",
        "system": "pyro",
        "price": 46,
        "demand": "high",
        "margin": 13.1
      },
      {
        "terminal": "Admin - Baijini Point",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 45,
        "demand": "high",
        "margin": 12.1
      },
      {
        "terminal": "Admin - Port Tressler",
        "body": "MicroTech",
        "system": "stanton",
        "price": 44,
        "demand": "high",
        "margin": 11.1
      },
      {
        "terminal": "Admin - Gaslight",
        "body": "Pyro V",
        "system": "pyro",
        "price": 43,
        "demand": "high",
        "margin": 10.1
      }
    ]
  },
  {
    "id": "pressurized-ice",
    "slug": "pressurized-ice",
    "name_fr": "Pressurized Ice",
    "name_en": "Pressurized Ice",
    "category": "metals",
    "commodityType": "mineral",
    "baseBuy": 45.36,
    "baseSell": 57,
    "marginPerScu": 1164,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Ice that has been purified and compressed to transparent by restricting natural expansion. This allows for more efficient transport in bulk.",
    "bestBuy": {
      "location": "Terra Mills Hydrofarm",
      "system": "Stanton",
      "price": 45.36,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Endgame",
      "system": "Pyro",
      "price": 57,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Terra Mills Hydrofarm",
        "body": "Crusader",
        "system": "stanton",
        "price": 45.4,
        "stock": "high"
      },
      {
        "terminal": "Admin - Ruin Station",
        "body": "Terminus",
        "system": "pyro",
        "price": 45.4,
        "stock": "high"
      },
      {
        "terminal": "Admin - Port Tressler",
        "body": "MicroTech",
        "system": "stanton",
        "price": 45.4,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Endgame",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 57,
        "demand": "high",
        "margin": 11.6
      },
      {
        "terminal": "Last Landings",
        "body": "Terminus",
        "system": "pyro",
        "price": 55,
        "demand": "high",
        "margin": 9.6
      },
      {
        "terminal": "Canard View",
        "body": "Terminus",
        "system": "pyro",
        "price": 55,
        "demand": "high",
        "margin": 9.6
      },
      {
        "terminal": "The Golden Riviera",
        "body": "Bloom",
        "system": "pyro",
        "price": 55,
        "demand": "high",
        "margin": 9.6
      }
    ]
  },
  {
    "id": "dynaflex",
    "slug": "dynaflex",
    "name_fr": "DynaFlex",
    "name_en": "DynaFlex",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 13.5,
    "baseSell": 25,
    "marginPerScu": 1150,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Developed for use by the military, this absorptive material can withstand severe stress owing to its flexibility.",
    "bestBuy": {
      "location": "Admin - Starlight Service",
      "system": "Pyro",
      "price": 13.5,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Seraphim",
      "system": "Stanton",
      "price": 25,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Starlight Service",
        "body": "Bloom",
        "system": "pyro",
        "price": 13.5,
        "stock": "high"
      },
      {
        "terminal": "Admin - Patch City",
        "body": "Bloom",
        "system": "pyro",
        "price": 14.7,
        "stock": "high"
      },
      {
        "terminal": "Admin - Checkmate",
        "body": "Monox",
        "system": "pyro",
        "price": 16,
        "stock": "high"
      },
      {
        "terminal": "Admin - Port Tressler",
        "body": "MicroTech",
        "system": "stanton",
        "price": 17.2,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Seraphim",
        "body": "Crusader",
        "system": "stanton",
        "price": 25,
        "demand": "high",
        "margin": 11.5
      },
      {
        "terminal": "Admin - Endgame",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 21,
        "demand": "high",
        "margin": 7.5
      },
      {
        "terminal": "Admin - Ruin Station",
        "body": "Terminus",
        "system": "pyro",
        "price": 19,
        "demand": "high",
        "margin": 5.5
      },
      {
        "terminal": "Admin - Megumi Refueling",
        "body": "Terminus",
        "system": "pyro",
        "price": 19,
        "demand": "high",
        "margin": 5.5
      }
    ]
  },
  {
    "id": "scrap",
    "slug": "scrap",
    "name_fr": "Ferraille & Déchets Métalliques (Scrap)",
    "name_en": "Scrap",
    "category": "industrial",
    "commodityType": "scrap",
    "baseBuy": 27.49,
    "baseSell": 38,
    "marginPerScu": 1051,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Waste that is ready to be converted into new materials for reuse.",
    "bestBuy": {
      "location": "Admin - HUR-L5",
      "system": "Stanton",
      "price": 27.49,
      "stock": "high"
    },
    "bestSell": {
      "location": "HDMS-Hahn",
      "system": "Stanton",
      "price": 38,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - HUR-L5",
        "body": "Hurston",
        "system": "stanton",
        "price": 27.5,
        "stock": "high"
      },
      {
        "terminal": "Admin - CRU-L5",
        "body": "Crusader",
        "system": "stanton",
        "price": 27.5,
        "stock": "high"
      },
      {
        "terminal": "Admin - Everus Harbor",
        "body": "Hurston",
        "system": "stanton",
        "price": 29.5,
        "stock": "high"
      },
      {
        "terminal": "Admin - MIC-L4",
        "body": "MicroTech",
        "system": "stanton",
        "price": 29.6,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "HDMS-Hahn",
        "body": "Hurston",
        "system": "stanton",
        "price": 38,
        "demand": "high",
        "margin": 10.5
      },
      {
        "terminal": "Scrap - Rappel",
        "body": "Hurston",
        "system": "stanton",
        "price": 37,
        "demand": "high",
        "margin": 9.5
      },
      {
        "terminal": "Rust - Pickers Field",
        "body": "Hurston",
        "system": "stanton",
        "price": 37,
        "demand": "high",
        "margin": 9.5
      },
      {
        "terminal": "Rust - Dunboro",
        "body": "MicroTech",
        "system": "stanton",
        "price": 37,
        "demand": "high",
        "margin": 9.5
      }
    ]
  },
  {
    "id": "steel",
    "slug": "steel",
    "name_fr": "Steel",
    "name_en": "Steel",
    "category": "metals",
    "commodityType": "alloy",
    "baseBuy": 13.76,
    "baseSell": 24,
    "marginPerScu": 1024,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "An alloy of iron and carbon, this ancient material is still in uses thanks to its affordable price and high tensile strength.",
    "bestBuy": {
      "location": "Admin - Everus Harbor",
      "system": "Stanton",
      "price": 13.76,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Endgame",
      "system": "Pyro",
      "price": 24,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Everus Harbor",
        "body": "Hurston",
        "system": "stanton",
        "price": 13.8,
        "stock": "high"
      },
      {
        "terminal": "Admin - Nyx Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 17.3,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Endgame",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 24,
        "demand": "high",
        "margin": 10.2
      },
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 22,
        "demand": "high",
        "margin": 8.2
      },
      {
        "terminal": "Admin - Seraphim",
        "body": "Crusader",
        "system": "stanton",
        "price": 20,
        "demand": "high",
        "margin": 6.2
      },
      {
        "terminal": "Admin - Checkmate",
        "body": "Monox",
        "system": "pyro",
        "price": 20,
        "demand": "high",
        "margin": 6.2
      }
    ]
  },
  {
    "id": "lifecure-medsticks",
    "slug": "lifecure-medsticks",
    "name_fr": "LifeCure Medsticks",
    "name_en": "LifeCure Medsticks",
    "category": "industrial",
    "commodityType": "processed_goods",
    "baseBuy": 5.74,
    "baseSell": 14,
    "marginPerScu": 826,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "The use of these imitation CureLife Medpens has resulted in numerous deaths.",
    "bestBuy": {
      "location": "Ashland",
      "system": "Pyro",
      "price": 5.74,
      "stock": "high"
    },
    "bestSell": {
      "location": "Chawla's Beach",
      "system": "Pyro",
      "price": 14,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Ashland",
        "body": "Pyro V",
        "system": "pyro",
        "price": 5.7,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Chawla's Beach",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 14,
        "demand": "high",
        "margin": 8.3
      }
    ]
  },
  {
    "id": "distilled-spirits",
    "slug": "distilled-spirits",
    "name_fr": "Spiritueux Distillés",
    "name_en": "Distilled Spirits",
    "category": "illicit",
    "commodityType": "vice",
    "baseBuy": 13.12,
    "baseSell": 21,
    "marginPerScu": 788,
    "isIllegal": true,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A purified beverage produced through the distillation of fermented substances. Possesses at least 20 percent of alcohol by volume.",
    "bestBuy": {
      "location": "Admin - Gaslight",
      "system": "Pyro",
      "price": 13.12,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Pyro Gateway (Stanton)",
      "system": "Stanton",
      "price": 21,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Gaslight",
        "body": "Pyro V",
        "system": "pyro",
        "price": 13.1,
        "stock": "high"
      },
      {
        "terminal": "Admin - Checkmate",
        "body": "Monox",
        "system": "pyro",
        "price": 14.3,
        "stock": "high"
      },
      {
        "terminal": "Hickes Research Outpost",
        "body": "Crusader",
        "system": "stanton",
        "price": 15.7,
        "stock": "high"
      },
      {
        "terminal": "Deakins Research Outpost",
        "body": "Crusader",
        "system": "stanton",
        "price": 15.7,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Pyro Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 21,
        "demand": "high",
        "margin": 7.9
      },
      {
        "terminal": "Admin - MIC-L5",
        "body": "MicroTech",
        "system": "stanton",
        "price": 21,
        "demand": "high",
        "margin": 7.9
      },
      {
        "terminal": "Admin - Stanton Gateway (Pyro)",
        "body": "Pyro",
        "system": "pyro",
        "price": 20,
        "demand": "high",
        "margin": 6.9
      },
      {
        "terminal": "Admin - Pyro Gateway (Nyx)",
        "body": "Nyx",
        "system": "nyx",
        "price": 19,
        "demand": "high",
        "margin": 5.9
      }
    ]
  },
  {
    "id": "acryliplex-composite",
    "slug": "acryliplex-composite",
    "name_fr": "AcryliPlex Composite",
    "name_en": "AcryliPlex Composite",
    "category": "industrial",
    "commodityType": "consumer_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      32
    ],
    "consumable": false,
    "description": "This composite is a moldable material used in the construction of explosives. In addition to being commonly used in demolition applications for heavy industry and mining, it is also used to create small potent warheads. Care must be taken while transporting larger quantities of the composite as it is impact and heat sensitive.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "amiant-pod",
    "slug": "amiant-pod",
    "name_fr": "Amiant Pod",
    "name_en": "Amiant Pod",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "Harvested from the amiant tree, the fibrous husks of these seed pods are used to make heat resistant textiles. Once removed, the husks must first be soaked in a chemical solution before the fibers can be separated out.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "ammo-crate",
    "slug": "ammo-crate",
    "name_fr": "Ammo Crate",
    "name_en": "Ammo Crate",
    "category": "industrial",
    "commodityType": "processed_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "biological-samples",
    "slug": "biological-samples",
    "name_fr": "Biological Samples",
    "name_en": "Biological Samples",
    "category": "industrial",
    "commodityType": "processed_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "blue-bilva",
    "slug": "blue-bilva",
    "name_fr": "Blue Bilva",
    "name_en": "Blue Bilva",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": true,
    "description": "NDR: 23\nHEI: 10\nEffects: Hydrating, Energizing\n\nThe Blue Bilva is known for its distinctive rich flavor; which is highly astringent, aromatic and very high in fructose. The fruit can also be identified by its slightly pointed, ovoid shape, and dark blue to indigo skin. The fibrous flesh of the bilva clings firmly to its large stone which is so hard that it can only be cracked through mechanical means. It takes about 11 months to ripen on the tree. It is commonly eaten dried or turned into brandy.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "boreal-quasi-grazer-egg",
    "slug": "boreal-quasi-grazer-egg",
    "name_fr": "Boreal Quasi Grazer Egg",
    "name_en": "Boreal Quasi Grazer Egg",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "cadmium-allinide",
    "slug": "cadmium-allinide",
    "name_fr": "Cadmium Allinide",
    "name_en": "Cadmium Allinide",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "This refined form of cadmium has great energy potential and is used frequently in reactors and batteries.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "cave-kopion-horn",
    "slug": "cave-kopion-horn",
    "name_fr": "Cave Kopion Horn",
    "name_en": "Cave Kopion Horn",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "combat-supplies",
    "slug": "combat-supplies",
    "name_fr": "Combat Supplies",
    "name_en": "Combat Supplies",
    "category": "industrial",
    "commodityType": "processed_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A variety of items assembled to support combat forces, such as ammunition, structural repair tools and clothing.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "construction-pieces",
    "slug": "construction-pieces",
    "name_fr": "Construction Pieces",
    "name_en": "Construction Pieces",
    "category": "industrial",
    "commodityType": "processed_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "construction-rubble",
    "slug": "construction-rubble",
    "name_fr": "Construction Rubble",
    "name_en": "Construction Rubble",
    "category": "industrial",
    "commodityType": "processed_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "construction-salvage",
    "slug": "construction-salvage",
    "name_fr": "Construction Salvage",
    "name_en": "Construction Salvage",
    "category": "industrial",
    "commodityType": "processed_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "decari-pod",
    "slug": "decari-pod",
    "name_fr": "Decari Pod",
    "name_en": "Decari Pod",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.00035,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A large spore pod harvested from the decari that can be collected and used as a food source. However, the decari pod cannot be consumed directly. It must have its thick out layer and spiny filaments removed, and the fibrous hymenium cooked for a long time before it can be safely digested by Humans.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "desert-quasi-grazer-egg",
    "slug": "desert-quasi-grazer-egg",
    "name_fr": "Desert Quasi Grazer Egg",
    "name_en": "Desert Quasi Grazer Egg",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "A gourmet egg that is renowned for its complex flavor, it is always in demand from restauranteurs and gourmands alike. The flavor of the egg can vary depending on diet and environment. After the eggs are laid, their shells chemically bond to specialized pouches located on the Quasi grazer's belly, where they are carried until they hatch.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "detatrine",
    "slug": "detatrine",
    "name_fr": "Detatrine",
    "name_en": "Detatrine",
    "category": "industrial",
    "commodityType": "processed_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Refined from the natural toxin found within the rare detatium fruit, this chemical has numerous medical applications.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "diluthermex",
    "slug": "diluthermex",
    "name_fr": "Diluthermex",
    "name_en": "Diluthermex",
    "category": "industrial",
    "commodityType": "consumer_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      32
    ],
    "consumable": false,
    "description": "An extremely heat resistant epoxy often used in the mounting and repair of ship thrusters. It is considered very difficult to transport in its uncured state as it becomes explosively unstable when exposed to Chan-Eisen fields during quantum travel. Specialized containers must be used to safely transport the epoxy long distances. Once set and cured, the Diluthermex is no longer reactive.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "eva-fuel",
    "slug": "eva-fuel",
    "name_fr": "EVA Fuel",
    "name_en": "EVA Fuel",
    "category": "industrial",
    "commodityType": "processed_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "fireworks",
    "slug": "fireworks",
    "name_fr": "Fireworks",
    "name_en": "Fireworks",
    "category": "industrial",
    "commodityType": "consumer_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01
    ],
    "consumable": false,
    "description": "Colorful pyrotechnic devices used at celebrations and special events.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "flareweed-stalk",
    "slug": "flareweed-stalk",
    "name_fr": "Flareweed Stalk",
    "name_en": "Flareweed Stalk",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "Flareweed is a hearty plant that can survive in harsh environments. With a natural ability to filter out harmful elements from its water supply, flareweed stalks are frequently harvested to be used in filtration systems.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "fotia-seedpod",
    "slug": "fotia-seedpod",
    "name_fr": "Fotia Seedpod",
    "name_en": "Fotia Seedpod",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "The fotia scrub relies on solar flares for its reproduction. Rather than having traditional stamen and pollen, it allows radiation from flares to mutate its genetics before releasing its seedpod. Some enterprising individuals seek out and collect the seedpods because of their natural radiological properties that can be utilized in various ways.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "grassland-quasi-grazer-egg",
    "slug": "grassland-quasi-grazer-egg",
    "name_fr": "Grassland Quasi Grazer Egg",
    "name_en": "Grassland Quasi Grazer Egg",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "heart-of-the-woods",
    "slug": "heart-of-the-woods",
    "name_fr": "Heart of the Woods",
    "name_en": "Heart of the Woods",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": true,
    "description": "NDR: 31\nEffects: Toxic\n\nThis fungus produces fleshy deep-red caps that grow in a pattern resembling a internal structure of a heart. Found in cold climates, it typically grows on trees and decaying logs. Not yet successfully cultivated commercially, this deep flavored mushroom is prized by epicureans across the 'verse and can fetch a high price in the right markets. It does contain a mild toxin that is destroyed when cooked, so consuming raw should be avoided.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "hexapolymesh-coating",
    "slug": "hexapolymesh-coating",
    "name_fr": "HexaPolyMesh Coating",
    "name_en": "HexaPolyMesh Coating",
    "category": "industrial",
    "commodityType": "processed_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "This liquid hexagonal lattice bonds readily to surfaces when electrically charged, solidifying almost instantaneously to create an incredibly strong and durable polymer mesh that maintains integrity at a range of temperatures and pressures.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "hlx99-hyperprocessors",
    "slug": "hlx99-hyperprocessors",
    "name_fr": "HLX99 Hyperprocessors",
    "name_en": "HLX99 Hyperprocessors",
    "category": "industrial",
    "commodityType": "consumer_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Commonly known as \"Helixes\" these Banu manufactured processing chips were designed for fullcore crypto-cracking and are used in the manufacture of computer system infiltration devices.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "hydrogen-fuel",
    "slug": "hydrogen-fuel",
    "name_fr": "Hydrogen Fuel",
    "name_en": "Hydrogen Fuel",
    "category": "industrial",
    "commodityType": "processed_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Hydrogen that is energized and then used by thrusters to propel vehicles.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "irradiated-kopion-horn",
    "slug": "irradiated-kopion-horn",
    "name_fr": "Irradiated Kopion Horn",
    "name_en": "Irradiated Kopion Horn",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "The horn of the kopion is made of a unique combination of bone and naturally-occurring carbon nanomaterials. This horn was exposed to radiation over a long period of time and has developed unusual coloration.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "irradiated-valakkar-egg",
    "slug": "irradiated-valakkar-egg",
    "name_fr": "Irradiated Valakkar Egg",
    "name_en": "Irradiated Valakkar Egg",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "irradiated-valakkar-fang-adult",
    "slug": "irradiated-valakkar-fang-adult",
    "name_fr": "Irradiated Valakkar Fang (Adult)",
    "name_en": "Irradiated Valakkar Fang (Adult)",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "irradiated-valakkar-fang-apex",
    "slug": "irradiated-valakkar-fang-apex",
    "name_fr": "Irradiated Valakkar Fang (Apex)",
    "name_en": "Irradiated Valakkar Fang (Apex)",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "irradiated-valakkar-fang-juvenile",
    "slug": "irradiated-valakkar-fang-juvenile",
    "name_fr": "Irradiated Valakkar Fang (Juvenile)",
    "name_en": "Irradiated Valakkar Fang (Juvenile)",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "irradiated-valakkar-pearl-grade-a",
    "slug": "irradiated-valakkar-pearl-grade-a",
    "name_fr": "Irradiated Valakkar Pearl (Grade A)",
    "name_en": "Irradiated Valakkar Pearl (Grade A)",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "irradiated-valakkar-pearl-grade-aa",
    "slug": "irradiated-valakkar-pearl-grade-aa",
    "name_fr": "Irradiated Valakkar Pearl (Grade AA)",
    "name_en": "Irradiated Valakkar Pearl (Grade AA)",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "irradiated-valakkar-pearl-grade-aaa",
    "slug": "irradiated-valakkar-pearl-grade-aaa",
    "name_fr": "Irradiated Valakkar Pearl (Grade AAA)",
    "name_en": "Irradiated Valakkar Pearl (Grade AAA)",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "irradiated-valakkar-pearl-grade-b",
    "slug": "irradiated-valakkar-pearl-grade-b",
    "name_fr": "Irradiated Valakkar Pearl (Grade B)",
    "name_en": "Irradiated Valakkar Pearl (Grade B)",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "irradiated-valakkar-pearl-grade-c",
    "slug": "irradiated-valakkar-pearl-grade-c",
    "name_fr": "Irradiated Valakkar Pearl (Grade C)",
    "name_en": "Irradiated Valakkar Pearl (Grade C)",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "jumping-limes",
    "slug": "jumping-limes",
    "name_fr": "Jumping Limes",
    "name_en": "Jumping Limes",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": true,
    "description": "NDR: 09\nHEI: 06\nEffects: Dehydrating\n\nGrows on a cactus in the deserts of Yar (Centauri II). A local variant that developed naturally after terraformation was complete, the spiny fruit start off purple and turn green when they are ripe.\n\nThey acquired their name because of the ease in which they fall off the cactus and attach themselves to clothing and skin, as if they \"jumped\" there.\n\nThe leathery, barbed skin must be peeled back to reveal the juicy flesh of the interior. The taste is sweet, extremely tart and astringent.\n\nLocals warn that if you become lost in the dessert you should be careful using jumping limes for hydration as they can make you feel even more thirsty.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "jungle-quasi-grazer-egg",
    "slug": "jungle-quasi-grazer-egg",
    "name_fr": "Jungle Quasi Grazer Egg",
    "name_en": "Jungle Quasi Grazer Egg",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "kopion-horn",
    "slug": "kopion-horn",
    "name_fr": "Kopion Horn",
    "name_en": "Kopion Horn",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "The horn of the kopion is made of a unique combination of bone and naturally-occurring carbon nanomaterials. When properly processed, it can be used to aid in bone regeneration with a far greater rate of success than lab-grown materials. This application has made it a valuable commodity.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "lastaprene",
    "slug": "lastaprene",
    "name_fr": "Lastaprene",
    "name_en": "Lastaprene",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "An advanced synthetic polymer designed with optimal properties for several commercial applications. It has greater viscoelasticity than most commonly produced rubbers.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "luminalia-gift",
    "slug": "luminalia-gift",
    "name_fr": "Luminalia Gift",
    "name_en": "Luminalia Gift",
    "category": "industrial",
    "commodityType": "consumer_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.001,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A small, wrapped package meant to get you in the Luminalia spirit. Banu merchants celebrating the holiday used to hide small gifts aboard their ship to encourage revelers to explore all their wares. As the holiday grew in popularity within the UEE, Human merchants modified this tradition by hiding empty gift-wrapped packages around a space station or landing zone that could be exchanged for credits if returned unopened. The increased foot traffic into their stores spurned holiday sales and became a tradition in its own right. \n\nStow this gift for sentimental value, or sell it at a commodities terminal and spend the credits on a holiday gift for yourself.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "lunes-spiral-fruit",
    "slug": "lunes-spiral-fruit",
    "name_fr": "Lunes (Spiral Fruit)",
    "name_en": "Lunes (Spiral Fruit)",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.0007,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": true,
    "description": "NDR: 23\nHEI: 10\nEffects: Hydrating\n\nThe Lunes is a deciduous tree native to the warmer areas of Osha in Kilian system. It bears an edible fruit known as a Lunes fruit or a Spiral Fruit based on the circular ridges that can form once the fruit begins to ripen. The fruit’s skin is covered with a short fuzz that is generally removed before consumption. When ripe, the Lunes is a very sweet and juicy flavor and have become a very popular summer delicacy, commonly found in ice cream and other desserts.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "lycara",
    "slug": "lycara",
    "name_fr": "Lycara",
    "name_en": "Lycara",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A extremely light and strong carbon composite material first developed for racing ship rudders.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "marok-gem",
    "slug": "marok-gem",
    "name_fr": "Marok Gem",
    "name_en": "Marok Gem",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      8,
      32
    ],
    "consumable": false,
    "description": "The marok has a gizzard, which takes food that has been previously swallowed from the stomach and \"chews\" it before passing it back into the stomach to be digested. To help this process, the marok's body secretes a substance that hardens into a large crystalline stone that stays in the gizzard and helps food get pulverized more efficiently. The stone has unique conductive properties that make it sought-after for use in computer chips.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "medgel",
    "slug": "medgel",
    "name_fr": "MedGel",
    "name_en": "MedGel",
    "category": "industrial",
    "commodityType": "processed_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Consumed by medical beds, MedGel provides the key resources needed for cloning and healing.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "mobyglass-personal-computers",
    "slug": "mobyglass-personal-computers",
    "name_fr": "mobyGlass Personal Computers",
    "name_en": "mobyGlass Personal Computers",
    "category": "industrial",
    "commodityType": "consumer_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "These knock-off mobiGlas use pirated software and are often infected with spyware and malicious programming.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "molina-ventilation-filters",
    "slug": "molina-ventilation-filters",
    "name_fr": "Molina Ventilation Filters",
    "name_en": "Molina Ventilation Filters",
    "category": "industrial",
    "commodityType": "processed_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Special filters developed by Gyson to replace faulty units and purify the air of Molina Mold spores.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "neograph",
    "slug": "neograph",
    "name_fr": "Neograph",
    "name_en": "Neograph",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A recently discovered form of graphene, this complicated lattice structure of carbon molecules produces an extremely light and strong material.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "organs",
    "slug": "organs",
    "name_fr": "Organs",
    "name_en": "Organs",
    "category": "industrial",
    "commodityType": "processed_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "ouratite",
    "slug": "ouratite",
    "name_fr": "Ouratite",
    "name_en": "Ouratite",
    "category": "industrial",
    "commodityType": "nonmetals",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Notable for its ability to withstand kinetic impacts, ouratite is a solid hydrocarbon that is found only in the Stanton system. Once refined, this rare material can be used as combat armor plating.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "oza",
    "slug": "oza",
    "name_fr": "Oza",
    "name_en": "Oza",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": true,
    "description": "NDR: 09\nHEI: 07\nEffects: Hydrating\n\nA hybrid citrus first grown in Croshaw, it's hardiness, ease of transport, and juice yield has seen it rapidly spread across the Empire. It features thick, bumpy dark green skin, bright orange flesh ribbed with heavy pithing, and no seeds. \n\nTart, sweet and bitter, the taste of Oza often described as being a combination of all the other citrus types rolled into one fruit. Difficult to peel and fibrous, its pulp is not often eaten. Typically it is split open and sucked on, its flesh being discarded. It is also popularly used in many cocktail recipes.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "party-favors",
    "slug": "party-favors",
    "name_fr": "Party Favors",
    "name_en": "Party Favors",
    "category": "industrial",
    "commodityType": "processed_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Small items used to help encourage a festive mood. Typically given or sold to celebrants in attendance at an event or party.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "pingala-seeds",
    "slug": "pingala-seeds",
    "name_fr": "Pingala Seeds",
    "name_en": "Pingala Seeds",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.00035,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Every aspect of the pingala follows the golden ratio resulting a visually arresting plant. This include its seeds which are highly sought after by plant collectors. Especially since attempts to cultivate the pingala in greenhouse environments has proven extremely difficult.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "prota",
    "slug": "prota",
    "name_fr": "Prota",
    "name_en": "Prota",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A resilient slime mold that can form in extremely corrosive environments and pressure, Prota secretes a strong adhesive that can be distilled into a commercial-grade glue.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "quasi-grazer-tongue",
    "slug": "quasi-grazer-tongue",
    "name_fr": "Quasi Grazer Tongue",
    "name_en": "Quasi Grazer Tongue",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "The tundra Quasi grazer has evolved a long coat and insulating fat reserves that allow it to stay warm at arctic-level temperatures. The animal's tongue is especially renowned for the fat it contains, which can be rendered into a lubricant that remains fluid in extreme cold.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "raw-ice",
    "slug": "raw-ice",
    "name_fr": "Raw Ice",
    "name_en": "Raw Ice",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "Raw Ice can be refined into Hydrogen and Oxygen",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "raw-ouratite",
    "slug": "raw-ouratite",
    "name_fr": "Raw Ouratite",
    "name_en": "Raw Ouratite",
    "category": "industrial",
    "commodityType": "nonmetals",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Notable for its ability to withstand kinetic impacts, ouratite is a solid hydrocarbon that is found only in the Stanton system. Once refined, this rare material can be used as combat armor plating.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "raw-silicon",
    "slug": "raw-silicon",
    "name_fr": "Raw Silicon",
    "name_en": "Raw Silicon",
    "category": "industrial",
    "commodityType": "nonmetals",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A strong and brittle element with good thermal conductivity. Crystalizes in a diamond form.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "redfin-energy-modulators",
    "slug": "redfin-energy-modulators",
    "name_fr": "Redfin Energy Modulators",
    "name_en": "Redfin Energy Modulators",
    "category": "industrial",
    "commodityType": "consumer_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Made by various Banu manufacturers, this energy modulator is distinct for its red-hued heatsinks. Though it can be installed into most Human component subsystems to reduce power draw, its extremely dangerous fail rate has caused it to be banned for import into the UEE.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "revenant-pod",
    "slug": "revenant-pod",
    "name_fr": "Revenant Pod",
    "name_en": "Revenant Pod",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Contrary to its ominous name, the Revenant is actually a variety of the Altrucia Tree, an indigenous plant of Terra known for its thick and colorful leaves. Geoengineers introduced fields of Altrucias to Hyperion in an effort to break up the dust storms. Although the project failed, the Altrucia trees adapted to the perpetual wind patterns, shedding its leaves and thickening the wood in the trunk. Botanists initially believed that the Altrucias had died, but on closer inspection, discovered that they were quite alive and thus, the name was born.The pods are collected because the pollen is processed and turned into Altruciatoxin.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "rs1-odysey-spacesuits",
    "slug": "rs1-odysey-spacesuits",
    "name_fr": "RS1 Odysey Spacesuits",
    "name_en": "RS1 Odysey Spacesuits",
    "category": "industrial",
    "commodityType": "consumer_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "These imitation RSI Odyssey undersuits are cheaply made counterfeits that are hazardous to use.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "sarilus",
    "slug": "sarilus",
    "name_fr": "Sarilus",
    "name_en": "Sarilus",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A material first introduced into Human manufacturing after trade with the Banu. It is extremely distortion resistant. Though Human made Sarilus does a good job, many hold that the Banu manufactured product is superior.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "savannah-kopion-horn",
    "slug": "savannah-kopion-horn",
    "name_fr": "Savannah Kopion Horn",
    "name_en": "Savannah Kopion Horn",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "ship-ammunition",
    "slug": "ship-ammunition",
    "name_fr": "Ship Ammunition",
    "name_en": "Ship Ammunition",
    "category": "industrial",
    "commodityType": "processed_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1
    ],
    "consumable": false,
    "description": "Refill your ship's ballistic ammunition.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "ship-ammunition-size-1",
    "slug": "ship-ammunition-size-1",
    "name_fr": "Ship Ammunition - Size 1",
    "name_en": "Ship Ammunition - Size 1",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "Bulk ammunition servicing size 1 ship weaponry, based on volume.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "ship-ammunition-size-2",
    "slug": "ship-ammunition-size-2",
    "name_fr": "Ship Ammunition - Size 2",
    "name_en": "Ship Ammunition - Size 2",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "Bulk ammunition servicing size 2 ship weaponry, based on volume.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "ship-ammunition-size-3",
    "slug": "ship-ammunition-size-3",
    "name_fr": "Ship Ammunition - Size 3",
    "name_en": "Ship Ammunition - Size 3",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "Bulk ammunition servicing size 3 ship weaponry, based on volume.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "ship-ammunition-size-4",
    "slug": "ship-ammunition-size-4",
    "name_fr": "Ship Ammunition - Size 4",
    "name_en": "Ship Ammunition - Size 4",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "Bulk ammunition servicing size 4 ship weaponry, based on volume.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "ship-ammunition-size-5",
    "slug": "ship-ammunition-size-5",
    "name_fr": "Ship Ammunition - Size 5",
    "name_en": "Ship Ammunition - Size 5",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "Bulk ammunition servicing size 5 ship weaponry, based on volume.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "ship-ammunition-size-6",
    "slug": "ship-ammunition-size-6",
    "name_fr": "Ship Ammunition - Size 6",
    "name_en": "Ship Ammunition - Size 6",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "Bulk ammunition servicing size 6 ship weaponry, based on volume.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "ship-ammunition-size-7",
    "slug": "ship-ammunition-size-7",
    "name_fr": "Ship Ammunition - Size 7",
    "name_en": "Ship Ammunition - Size 7",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "Bulk ammunition servicing size 7 ship weaponry, based on volume.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "ship-ammunition-size-8",
    "slug": "ship-ammunition-size-8",
    "name_fr": "Ship Ammunition - Size 8",
    "name_en": "Ship Ammunition - Size 8",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "Bulk ammunition servicing size 8 ship weaponry, based on volume.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "ship-ammunition-size-9",
    "slug": "ship-ammunition-size-9",
    "name_fr": "Ship Ammunition - Size 9",
    "name_en": "Ship Ammunition - Size 9",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "Bulk ammunition servicing size 9 ship weaponry, based on volume.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "ship-decoy-countermeasures",
    "slug": "ship-decoy-countermeasures",
    "name_fr": "Ship Decoy Countermeasures",
    "name_en": "Ship Decoy Countermeasures",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "Flares, decoys and other countermeasure supplies for ships of any size",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "ship-noise-countermeasures",
    "slug": "ship-noise-countermeasures",
    "name_fr": "Ship Noise Countermeasures",
    "name_en": "Ship Noise Countermeasures",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "Noise, chaff and other countermeasure supplies for ships of any size",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "silnex",
    "slug": "silnex",
    "name_fr": "Silnex",
    "name_en": "Silnex",
    "category": "industrial",
    "commodityType": "manmade",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "An advanced silica ceramic developed by early RSI researchers to allow ships to better withstand atmospheric reentry.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "souvenirs",
    "slug": "souvenirs",
    "name_fr": "Souvenirs",
    "name_en": "Souvenirs",
    "category": "industrial",
    "commodityType": "consumer_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Mementos purchased to commemorate visiting a location or attending an special event.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "stone-bug-shell",
    "slug": "stone-bug-shell",
    "name_fr": "Stone Bug Shell",
    "name_en": "Stone Bug Shell",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "Known to curl into a tight ball when threatened, the stone bug is sought after for its tough shell, which can be removed and used as a durable material that has even been utilized in certain armor composites.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "tundra-kopion-horn",
    "slug": "tundra-kopion-horn",
    "name_fr": "Tundra Kopion Horn",
    "name_en": "Tundra Kopion Horn",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "tundra-quasi-grazer-egg",
    "slug": "tundra-quasi-grazer-egg",
    "name_fr": "Tundra Quasi Grazer Egg",
    "name_en": "Tundra Quasi Grazer Egg",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "valakkar-fang",
    "slug": "valakkar-fang",
    "name_fr": "Valakkar Fang",
    "name_en": "Valakkar Fang",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "The valakkar continually sheds its teeth throughout its lifetime. As the animal burrows through the sand and catches prey, its teeth are frequently damaged. Once a new tooth finishes forming, it severs the connective tissue that was holding the old tooth in place, causing it to break off and fall to the ground. The fangs of the valakkar can also be extracted from the animal's mouth after its death. Collectors seek out the valakkar fangs for use in crafting various luxury items.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "valakkar-fang-adult",
    "slug": "valakkar-fang-adult",
    "name_fr": "Valakkar Fang (Adult)",
    "name_en": "Valakkar Fang (Adult)",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "valakkar-fang-apex",
    "slug": "valakkar-fang-apex",
    "name_fr": "Valakkar Fang (Apex)",
    "name_en": "Valakkar Fang (Apex)",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "valakkar-fang-juvenile",
    "slug": "valakkar-fang-juvenile",
    "name_fr": "Valakkar Fang (Juvenile)",
    "name_en": "Valakkar Fang (Juvenile)",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "virus-cultures",
    "slug": "virus-cultures",
    "name_fr": "Virus Cultures",
    "name_en": "Virus Cultures",
    "category": "industrial",
    "commodityType": "processed_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "wuotan-seed",
    "slug": "wuotan-seed",
    "name_fr": "Wuotan Seed",
    "name_en": "Wuotan Seed",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "Harvested from the wuotan plant, these seed pods become bioluminescent when ripe to draw attention and encourage their spread. They are often collected to utilize as a natural light source.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "year-of-the-dog-envelope",
    "slug": "year-of-the-dog-envelope",
    "name_fr": "Year of the Dog Envelope",
    "name_en": "Year of the Dog Envelope",
    "category": "industrial",
    "commodityType": "consumer_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.001,
      0.01
    ],
    "consumable": false,
    "description": "A gilded red envelope celebrating the Year of the Dog. Exchanging these envelopes is one of the most popular ways of celebrating Red Festival. Often the envelope may include a small amount of credits inside to help those you care about have a strong start in the upcoming cycle. Growing in popularity is the newer tradition of hiding the envelopes as a way of spreading good fortune and prosperity to those that fate has deemed in need.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "year-of-the-horse-envelope",
    "slug": "year-of-the-horse-envelope",
    "name_fr": "Year of the Horse Envelope",
    "name_en": "Year of the Horse Envelope",
    "category": "industrial",
    "commodityType": "consumer_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01
    ],
    "consumable": false,
    "description": "A gilded red envelope celebrating the Year of the Horse. Exchanging gilded red envelopes is one of the most popular ways of celebrating Red Festival. Often the envelope may include a small amount of credits inside to help those you care about have a strong start in the upcoming cycle. Growing in popularity is the newer tradition of hiding the envelopes as a way of spreading good fortune and prosperity to those that fate has deemed in need. ",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "year-of-the-monkey-envelope",
    "slug": "year-of-the-monkey-envelope",
    "name_fr": "Year of the Monkey Envelope",
    "name_en": "Year of the Monkey Envelope",
    "category": "industrial",
    "commodityType": "consumer_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01
    ],
    "consumable": false,
    "description": "A gilded red envelope celebrating the Year of the Monkey. Exchanging these envelopes is one of the most popular ways of celebrating Red Festival. Often the envelope may include a small amount of credits inside to help those you care about have a strong start in the upcoming cycle. Growing in popularity is the newer tradition of hiding the envelopes as a way of spreading good fortune and prosperity to those that fate has deemed in need.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "year-of-the-pig-envelope",
    "slug": "year-of-the-pig-envelope",
    "name_fr": "Year of the Pig Envelope",
    "name_en": "Year of the Pig Envelope",
    "category": "industrial",
    "commodityType": "consumer_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01
    ],
    "consumable": false,
    "description": "A gilded red envelope celebrating the Year of the Pig. Exchanging these envelopes is one of the most popular ways of celebrating Red Festival. Often the envelope may include a small amount of credits inside to help those you care about have a strong start in the upcoming cycle. Growing in popularity is the newer tradition of hiding the envelopes as a way of spreading good fortune and prosperity to those that fate has deemed in need.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "year-of-the-ram-envelope",
    "slug": "year-of-the-ram-envelope",
    "name_fr": "Year of the Ram Envelope",
    "name_en": "Year of the Ram Envelope",
    "category": "industrial",
    "commodityType": "consumer_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01
    ],
    "consumable": false,
    "description": "A gilded red envelope celebrating the Year of the Ram. Exchanging these envelopes is one of the most popular ways of celebrating Red Festival. Often the envelope may include a small amount of credits inside to help those you care about have a strong start in the upcoming cycle. Growing in popularity is the newer tradition of hiding the envelopes as a way of spreading good fortune and prosperity to those that fate has deemed in need.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "year-of-the-rat-envelope",
    "slug": "year-of-the-rat-envelope",
    "name_fr": "Year of the Rat Envelope",
    "name_en": "Year of the Rat Envelope",
    "category": "industrial",
    "commodityType": "consumer_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01
    ],
    "consumable": false,
    "description": "A gilded red envelope celebrating the Year of the Rat. Exchanging these envelopes is one of the most popular ways of celebrating Red Festival. Often the envelope may include a small amount of credits inside to help those you care about have a strong start in the upcoming cycle. Growing in popularity is the newer tradition of hiding the envelopes as a way of spreading good fortune and prosperity to those that fate has deemed in need.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "year-of-the-rooster-envelope",
    "slug": "year-of-the-rooster-envelope",
    "name_fr": "Year of the Rooster Envelope",
    "name_en": "Year of the Rooster Envelope",
    "category": "industrial",
    "commodityType": "consumer_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8
    ],
    "consumable": false,
    "description": "A gilded red envelope celebrating the Year of the Rooster. Exchanging these envelopes is one of the most popular ways of celebrating Red Festival. Often the envelope may include a small amount of credits inside to help those you care about have a strong start in the upcoming cycle. Growing in popularity is the newer tradition of hiding the envelopes as a way of spreading good fortune and prosperity to those that fate has deemed in need. \n\nStow the envelope as a token of luck, share it with a friend or loved one to spread good fortune, or exchange it at a commodities terminal and use the credits for a prosperous beginning to a new cycle.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "yormandi-eye",
    "slug": "yormandi-eye",
    "name_fr": "Yormandi Eye",
    "name_en": "Yormandi Eye",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": false,
    "description": "Able to thrive in a wide variety of environments, the yormandi has a robust immune system that responds to unknown pathogens at incredible speed. Its eyes contain antibodies that are much sought-after by medical researchers.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "yormandi-tongue",
    "slug": "yormandi-tongue",
    "name_fr": "Yormandi Tongue",
    "name_en": "Yormandi Tongue",
    "category": "industrial",
    "commodityType": "natural",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1
    ],
    "consumable": false,
    "description": "The yormandi uses its sensitive tongue to taste its surroundings and detect prey from great distances. Renowned for its complex, subtle flavor, the tip of this organ is sought after by culinary enthusiasts throughout the Empire.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "zeta-prolanide",
    "slug": "zeta-prolanide",
    "name_fr": "Zeta-Prolanide",
    "name_en": "Zeta-Prolanide",
    "category": "industrial",
    "commodityType": "consumer_goods",
    "baseBuy": 12,
    "baseSell": 19.5,
    "marginPerScu": 750,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1
    ],
    "consumable": false,
    "description": "This chemical is an industrial reactant that has found widespread use neutralizing irradiated materials. Because of how volatile it is, it must be kept in an electrically charged state or else a rapid exothermic reaction may occur before desired.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 12,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 19.5,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "agricultural-supplies",
    "slug": "agricultural-supplies",
    "name_fr": "Agricultural Supplies",
    "name_en": "Agricultural Supplies",
    "category": "consumables",
    "commodityType": "agricultural_supply",
    "baseBuy": 10.15,
    "baseSell": 16,
    "marginPerScu": 585,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Items required for agricultural production. Includes fertilizers, feed, and pesticides.",
    "bestBuy": {
      "location": "Admin - Dudley & Daughters",
      "system": "Pyro",
      "price": 10.15,
      "stock": "high"
    },
    "bestSell": {
      "location": "Levski",
      "system": "Nyx",
      "price": 16,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Dudley & Daughters",
        "body": "Terminus",
        "system": "pyro",
        "price": 10.2,
        "stock": "high"
      },
      {
        "terminal": "Admin - Terra Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 10.3,
        "stock": "high"
      },
      {
        "terminal": "Admin - Checkmate",
        "body": "Monox",
        "system": "pyro",
        "price": 11.1,
        "stock": "high"
      },
      {
        "terminal": "Hickes Research Outpost",
        "body": "Crusader",
        "system": "stanton",
        "price": 11.2,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 16,
        "demand": "high",
        "margin": 5.9
      },
      {
        "terminal": "Shepherd's Rest",
        "body": "Bloom",
        "system": "pyro",
        "price": 15,
        "demand": "high",
        "margin": 4.9
      },
      {
        "terminal": "Admin - Stanton Gateway (Pyro)",
        "body": "Pyro",
        "system": "pyro",
        "price": 15,
        "demand": "high",
        "margin": 4.9
      },
      {
        "terminal": "Admin - Seraphim",
        "body": "Crusader",
        "system": "stanton",
        "price": 15,
        "demand": "high",
        "margin": 4.9
      }
    ]
  },
  {
    "id": "fluorine",
    "slug": "fluorine",
    "name_fr": "Fluor Industriel",
    "name_en": "Fluorine",
    "category": "gases",
    "commodityType": "gas",
    "baseBuy": 9.19,
    "baseSell": 15,
    "marginPerScu": 581,
    "isIllegal": false,
    "unitWeightKg": 95,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A toxic and highly reactive gas that appears pale yellow in its natural state. Very easily forms compounds with almost all other elements.",
    "bestBuy": {
      "location": "Admin - Gaslight",
      "system": "Pyro",
      "price": 9.19,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Stanton Gateway (Pyro)",
      "system": "Pyro",
      "price": 15,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Gaslight",
        "body": "Pyro V",
        "system": "pyro",
        "price": 9.2,
        "stock": "high"
      },
      {
        "terminal": "Admin - Patch City",
        "body": "Bloom",
        "system": "pyro",
        "price": 9.9,
        "stock": "high"
      },
      {
        "terminal": "Admin - Starlight Service",
        "body": "Bloom",
        "system": "pyro",
        "price": 9.9,
        "stock": "high"
      },
      {
        "terminal": "Admin - Rat's Nest",
        "body": "Pyro V",
        "system": "pyro",
        "price": 9.9,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Stanton Gateway (Pyro)",
        "body": "Pyro",
        "system": "pyro",
        "price": 15,
        "demand": "high",
        "margin": 5.8
      },
      {
        "terminal": "Admin - Port Tressler",
        "body": "MicroTech",
        "system": "stanton",
        "price": 15,
        "demand": "high",
        "margin": 5.8
      },
      {
        "terminal": "Admin - Pyro Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 14,
        "demand": "high",
        "margin": 4.8
      },
      {
        "terminal": "Admin - Terra Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 14,
        "demand": "high",
        "margin": 4.8
      }
    ]
  },
  {
    "id": "chlorine",
    "slug": "chlorine",
    "name_fr": "Chlore Liquéfié",
    "name_en": "Chlorine",
    "category": "gases",
    "commodityType": "gas",
    "baseBuy": 11.62,
    "baseSell": 17,
    "marginPerScu": 538,
    "isIllegal": false,
    "unitWeightKg": 95,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A light gas with a high electron affinity and a yellow-green tone at room temperature. One of the halogens.",
    "bestBuy": {
      "location": "Admin - Seraphim",
      "system": "Stanton",
      "price": 11.62,
      "stock": "high"
    },
    "bestSell": {
      "location": "Rayari McGrath Research Outpost",
      "system": "Stanton",
      "price": 17,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Seraphim",
        "body": "Crusader",
        "system": "stanton",
        "price": 11.6,
        "stock": "high"
      },
      {
        "terminal": "HDMS-Hahn",
        "body": "Hurston",
        "system": "stanton",
        "price": 12,
        "stock": "high"
      },
      {
        "terminal": "HDMS-Perlman",
        "body": "Hurston",
        "system": "stanton",
        "price": 12,
        "stock": "high"
      },
      {
        "terminal": "Shubin Mining Facility SAL-5",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 12,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Rayari McGrath Research Outpost",
        "body": "MicroTech",
        "system": "stanton",
        "price": 17,
        "demand": "high",
        "margin": 5.4
      },
      {
        "terminal": "Rayari Cantwell Research Outpost",
        "body": "MicroTech",
        "system": "stanton",
        "price": 17,
        "demand": "high",
        "margin": 5.4
      },
      {
        "terminal": "TDD - Trade and Development Division - Cloudview Center - Orison",
        "body": "Crusader",
        "system": "stanton",
        "price": 15,
        "demand": "high",
        "margin": 3.4
      },
      {
        "terminal": "CBD - Central Business District - Lorville",
        "body": "Hurston",
        "system": "stanton",
        "price": 15,
        "demand": "high",
        "margin": 3.4
      }
    ]
  },
  {
    "id": "hydrogen",
    "slug": "hydrogen",
    "name_fr": "Hydrogène Purifié",
    "name_en": "Hydrogen",
    "category": "gases",
    "commodityType": "gas",
    "baseBuy": 7.08,
    "baseSell": 12,
    "marginPerScu": 492,
    "isIllegal": false,
    "unitWeightKg": 80,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "The most abundant element in the universe. The building block of stars. Highly flammable in its pure form.",
    "bestBuy": {
      "location": "Admin - Gaslight",
      "system": "Pyro",
      "price": 7.08,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Port Tressler",
      "system": "Stanton",
      "price": 12,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Gaslight",
        "body": "Pyro V",
        "system": "pyro",
        "price": 7.1,
        "stock": "high"
      },
      {
        "terminal": "Admin - Endgame",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 7.5,
        "stock": "high"
      },
      {
        "terminal": "Admin - Dudley & Daughters",
        "body": "Terminus",
        "system": "pyro",
        "price": 7.5,
        "stock": "high"
      },
      {
        "terminal": "Admin - Terra Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 7.8,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Port Tressler",
        "body": "MicroTech",
        "system": "stanton",
        "price": 12,
        "demand": "high",
        "margin": 4.9
      },
      {
        "terminal": "Admin - Checkmate",
        "body": "Monox",
        "system": "pyro",
        "price": 11,
        "demand": "high",
        "margin": 3.9
      },
      {
        "terminal": "Admin - Orbituary",
        "body": "Bloom",
        "system": "pyro",
        "price": 11,
        "demand": "high",
        "margin": 3.9
      },
      {
        "terminal": "Admin - Nyx Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 11,
        "demand": "high",
        "margin": 3.9
      }
    ]
  },
  {
    "id": "helium",
    "slug": "helium",
    "name_fr": "Hélium",
    "name_en": "Helium",
    "category": "gases",
    "commodityType": "gas",
    "baseBuy": 7.27,
    "baseSell": 12,
    "marginPerScu": 473,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "An inert noble gas that is colorless, tasteless, and non-toxic. The second most abundant element in the universe. Produced within stars during the nuclear fusion of hydrogen.",
    "bestBuy": {
      "location": "Admin - Checkmate",
      "system": "Pyro",
      "price": 7.27,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Dudley & Daughters",
      "system": "Pyro",
      "price": 12,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Checkmate",
        "body": "Monox",
        "system": "pyro",
        "price": 7.3,
        "stock": "high"
      },
      {
        "terminal": "Admin - Ruin Station",
        "body": "Terminus",
        "system": "pyro",
        "price": 7.3,
        "stock": "high"
      },
      {
        "terminal": "Admin - Seraphim",
        "body": "Crusader",
        "system": "stanton",
        "price": 7.7,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Dudley & Daughters",
        "body": "Terminus",
        "system": "pyro",
        "price": 12,
        "demand": "high",
        "margin": 4.7
      },
      {
        "terminal": "Admin - Nyx Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 12,
        "demand": "high",
        "margin": 4.7
      },
      {
        "terminal": "TDD - Trade and Development Division - Area 18",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 11,
        "demand": "high",
        "margin": 3.7
      },
      {
        "terminal": "CBD - Central Business District - Lorville",
        "body": "Hurston",
        "system": "stanton",
        "price": 11,
        "demand": "high",
        "margin": 3.7
      }
    ]
  },
  {
    "id": "revenant-tree-pollen",
    "slug": "revenant-tree-pollen",
    "name_fr": "Revenant Tree Pollen",
    "name_en": "Revenant Tree Pollen",
    "category": "illicit",
    "commodityType": "vice",
    "baseBuy": 9.67,
    "baseSell": 14,
    "marginPerScu": 433,
    "isIllegal": true,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "The pollen of Revenant Tree (altrucia lacus).",
    "bestBuy": {
      "location": "Admin - Ruin Station",
      "system": "Pyro",
      "price": 9.67,
      "stock": "high"
    },
    "bestSell": {
      "location": "Levski",
      "system": "Nyx",
      "price": 14,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Ruin Station",
        "body": "Terminus",
        "system": "pyro",
        "price": 9.7,
        "stock": "high"
      },
      {
        "terminal": "Terra Mills Hydrofarm",
        "body": "Crusader",
        "system": "stanton",
        "price": 10.1,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 14,
        "demand": "high",
        "margin": 4.3
      },
      {
        "terminal": "TDD - Trade and Development Division - Commons - New Babbage",
        "body": "MicroTech",
        "system": "stanton",
        "price": 14,
        "demand": "high",
        "margin": 4.3
      },
      {
        "terminal": "TDD - Trade and Development Division - Area 18",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 13,
        "demand": "high",
        "margin": 3.3
      },
      {
        "terminal": "CBD - Central Business District - Lorville",
        "body": "Hurston",
        "system": "stanton",
        "price": 13,
        "demand": "high",
        "margin": 3.3
      }
    ]
  },
  {
    "id": "mercury",
    "slug": "mercury",
    "name_fr": "Mercury",
    "name_en": "Mercury",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 7.15,
    "baseSell": 11,
    "marginPerScu": 385,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Mercury description.",
    "bestBuy": {
      "location": "Admin - Checkmate",
      "system": "Pyro",
      "price": 7.15,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Ruin Station",
      "system": "Pyro",
      "price": 11,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Checkmate",
        "body": "Monox",
        "system": "pyro",
        "price": 7.2,
        "stock": "high"
      },
      {
        "terminal": "Admin - Nyx Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 7.4,
        "stock": "high"
      },
      {
        "terminal": "Admin - HUR-L4",
        "body": "Hurston",
        "system": "stanton",
        "price": 7.9,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Ruin Station",
        "body": "Terminus",
        "system": "pyro",
        "price": 11,
        "demand": "high",
        "margin": 3.9
      },
      {
        "terminal": "TDD - Trade and Development Division - Area 18",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 10,
        "demand": "high",
        "margin": 2.9
      },
      {
        "terminal": "Admin - Baijini Point",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 10,
        "demand": "high",
        "margin": 2.9
      },
      {
        "terminal": "Admin - Everus Harbor",
        "body": "Hurston",
        "system": "stanton",
        "price": 10,
        "demand": "high",
        "margin": 2.9
      }
    ]
  },
  {
    "id": "ammonia",
    "slug": "ammonia",
    "name_fr": "Ammonia",
    "name_en": "Ammonia",
    "category": "gases",
    "commodityType": "gas",
    "baseBuy": 7.47,
    "baseSell": 11,
    "marginPerScu": 353,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Ammonia description.",
    "bestBuy": {
      "location": "Admin - Megumi Refueling",
      "system": "Pyro",
      "price": 7.47,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Baijini Point",
      "system": "Stanton",
      "price": 11,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Megumi Refueling",
        "body": "Terminus",
        "system": "pyro",
        "price": 7.5,
        "stock": "high"
      },
      {
        "terminal": "Admin - Seraphim",
        "body": "Crusader",
        "system": "stanton",
        "price": 7.8,
        "stock": "high"
      },
      {
        "terminal": "Admin - Port Tressler",
        "body": "MicroTech",
        "system": "stanton",
        "price": 7.8,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Baijini Point",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 11,
        "demand": "high",
        "margin": 3.5
      },
      {
        "terminal": "TDD - Trade and Development Division - Area 18",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 10,
        "demand": "high",
        "margin": 2.5
      },
      {
        "terminal": "Admin - Everus Harbor",
        "body": "Hurston",
        "system": "stanton",
        "price": 10,
        "demand": "high",
        "margin": 2.5
      },
      {
        "terminal": "CBD - Central Business District - Lorville",
        "body": "Hurston",
        "system": "stanton",
        "price": 10,
        "demand": "high",
        "margin": 2.5
      }
    ]
  },
  {
    "id": "waste",
    "slug": "waste",
    "name_fr": "Déchets Toxiques",
    "name_en": "Waste",
    "category": "industrial",
    "commodityType": "waste",
    "baseBuy": 1.15,
    "baseSell": 4.5,
    "marginPerScu": 335,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Unwanted and unusable materials that are designated to be discarded.",
    "bestBuy": {
      "location": "Admin - MIC-L5",
      "system": "Stanton",
      "price": 1.15,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Everus Harbor",
      "system": "Stanton",
      "price": 4.5,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - MIC-L5",
        "body": "MicroTech",
        "system": "stanton",
        "price": 1.2,
        "stock": "high"
      },
      {
        "terminal": "Admin - MIC-L2",
        "body": "MicroTech",
        "system": "stanton",
        "price": 1.2,
        "stock": "high"
      },
      {
        "terminal": "ArcCorp Mining Area 141",
        "body": "Crusader",
        "system": "stanton",
        "price": 1.9,
        "stock": "high"
      },
      {
        "terminal": "Admin - Seraphim",
        "body": "Crusader",
        "system": "stanton",
        "price": 2,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Everus Harbor",
        "body": "Hurston",
        "system": "stanton",
        "price": 4.5,
        "demand": "high",
        "margin": 3.4
      },
      {
        "terminal": "Admin - Orbituary",
        "body": "Bloom",
        "system": "pyro",
        "price": 4.5,
        "demand": "high",
        "margin": 3.4
      },
      {
        "terminal": "Admin - Ruin Station",
        "body": "Terminus",
        "system": "pyro",
        "price": 4.5,
        "demand": "high",
        "margin": 3.4
      },
      {
        "terminal": "Admin - Stanton Gateway (Nyx)",
        "body": "Nyx",
        "system": "nyx",
        "price": 3.8,
        "demand": "high",
        "margin": 2.7
      }
    ]
  },
  {
    "id": "potassium",
    "slug": "potassium",
    "name_fr": "Potassium",
    "name_en": "Potassium",
    "category": "metals",
    "commodityType": "metal",
    "baseBuy": 3.96,
    "baseSell": 7,
    "marginPerScu": 304,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Potassium description.",
    "bestBuy": {
      "location": "Admin - Orbituary",
      "system": "Pyro",
      "price": 3.96,
      "stock": "high"
    },
    "bestSell": {
      "location": "Levski",
      "system": "Nyx",
      "price": 7,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Orbituary",
        "body": "Bloom",
        "system": "pyro",
        "price": 4,
        "stock": "high"
      },
      {
        "terminal": "Admin - Ruin Station",
        "body": "Terminus",
        "system": "pyro",
        "price": 4.3,
        "stock": "high"
      },
      {
        "terminal": "Admin - Seraphim",
        "body": "Crusader",
        "system": "stanton",
        "price": 4.5,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 7,
        "demand": "high",
        "margin": 3
      },
      {
        "terminal": "Admin - Port Tressler",
        "body": "MicroTech",
        "system": "stanton",
        "price": 6.2,
        "demand": "high",
        "margin": 2.2
      },
      {
        "terminal": "Admin - Pyro Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 5.6,
        "demand": "high",
        "margin": 1.6
      },
      {
        "terminal": "Admin - Stanton Gateway (Pyro)",
        "body": "Pyro",
        "system": "pyro",
        "price": 5.6,
        "demand": "high",
        "margin": 1.6
      }
    ]
  },
  {
    "id": "processed-food",
    "slug": "processed-food",
    "name_fr": "Aliments Transformés",
    "name_en": "Processed Food",
    "category": "consumables",
    "commodityType": "food",
    "baseBuy": 12.02,
    "baseSell": 15,
    "marginPerScu": 298,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A nutritional substance that has been transformed trough physical or chemical means into food.",
    "bestBuy": {
      "location": "TDD - Trade and Development Division - Area 18",
      "system": "Stanton",
      "price": 12.02,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - ARC-L2",
      "system": "Stanton",
      "price": 15,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "TDD - Trade and Development Division - Area 18",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 12,
        "stock": "high"
      },
      {
        "terminal": "Admin - Nyx Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 12,
        "stock": "high"
      },
      {
        "terminal": "Admin - Ruin Station",
        "body": "Terminus",
        "system": "pyro",
        "price": 12,
        "stock": "high"
      },
      {
        "terminal": "Canard View",
        "body": "Terminus",
        "system": "pyro",
        "price": 12,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - ARC-L2",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 15,
        "demand": "high",
        "margin": 3
      },
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 15,
        "demand": "high",
        "margin": 3
      },
      {
        "terminal": "Admin - HUR-L5",
        "body": "Hurston",
        "system": "stanton",
        "price": 15,
        "demand": "high",
        "margin": 3
      },
      {
        "terminal": "Admin - HUR-L2",
        "body": "Hurston",
        "system": "stanton",
        "price": 15,
        "demand": "high",
        "margin": 3
      }
    ]
  },
  {
    "id": "human-food-bars",
    "slug": "human-food-bars",
    "name_fr": "Human Food Bars",
    "name_en": "Human Food Bars",
    "category": "consumables",
    "commodityType": "food",
    "baseBuy": 3.24,
    "baseSell": 5.8,
    "marginPerScu": 256,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Despite what the label on the packaging declares, the Banu manufactured \"Human Food Bars\" have been shown to contain multiple additives deemed unsafe for Human consumption.",
    "bestBuy": {
      "location": "Admin - GrimHEX",
      "system": "Stanton",
      "price": 3.24,
      "stock": "high"
    },
    "bestSell": {
      "location": "Fallow Field",
      "system": "Pyro",
      "price": 5.8,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - GrimHEX",
        "body": "Crusader",
        "system": "stanton",
        "price": 3.2,
        "stock": "high"
      },
      {
        "terminal": "Admin - Rat's Nest",
        "body": "Pyro V",
        "system": "pyro",
        "price": 4,
        "stock": "high"
      },
      {
        "terminal": "Admin - Gaslight",
        "body": "Pyro V",
        "system": "pyro",
        "price": 4.2,
        "stock": "high"
      },
      {
        "terminal": "Admin - Patch City",
        "body": "Bloom",
        "system": "pyro",
        "price": 4.2,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Fallow Field",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 5.8,
        "demand": "high",
        "margin": 2.6
      },
      {
        "terminal": "The Golden Riviera",
        "body": "Bloom",
        "system": "pyro",
        "price": 5.2,
        "demand": "high",
        "margin": 2
      },
      {
        "terminal": "Ashland",
        "body": "Pyro V",
        "system": "pyro",
        "price": 5.2,
        "demand": "high",
        "margin": 2
      },
      {
        "terminal": "Admin - Seraphim",
        "body": "Crusader",
        "system": "stanton",
        "price": 4.9,
        "demand": "high",
        "margin": 1.7
      }
    ]
  },
  {
    "id": "argon",
    "slug": "argon",
    "name_fr": "Argon",
    "name_en": "Argon",
    "category": "gases",
    "commodityType": "gas",
    "baseBuy": 3,
    "baseSell": 5.1,
    "marginPerScu": 210,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Chemically inert under most conditions, argon is an odorless, colorless gas that is as soluble in water as oxygen. Appears lilac in a discharge tube.",
    "bestBuy": {
      "location": "Admin - Megumi Refueling",
      "system": "Pyro",
      "price": 3,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Seraphim",
      "system": "Stanton",
      "price": 5.1,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Megumi Refueling",
        "body": "Terminus",
        "system": "pyro",
        "price": 3,
        "stock": "high"
      },
      {
        "terminal": "Admin - Stanton Gateway (Pyro)",
        "body": "Pyro",
        "system": "pyro",
        "price": 3.2,
        "stock": "high"
      },
      {
        "terminal": "Admin - Pyro Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 3.2,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Seraphim",
        "body": "Crusader",
        "system": "stanton",
        "price": 5.1,
        "demand": "high",
        "margin": 2.1
      },
      {
        "terminal": "Admin - Everus Harbor",
        "body": "Hurston",
        "system": "stanton",
        "price": 4.9,
        "demand": "high",
        "margin": 1.9
      },
      {
        "terminal": "Levski",
        "body": "Nyx",
        "system": "nyx",
        "price": 4.9,
        "demand": "high",
        "margin": 1.9
      },
      {
        "terminal": "TDD - Trade and Development Division - Area 18",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 4.4,
        "demand": "high",
        "margin": 1.4
      }
    ]
  },
  {
    "id": "carbon",
    "slug": "carbon",
    "name_fr": "Carbon",
    "name_en": "Carbon",
    "category": "industrial",
    "commodityType": "nonmetals",
    "baseBuy": 2.35,
    "baseSell": 4.3,
    "marginPerScu": 195,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Owing to carbon's ability to form a variety of allotropes with vastly different properties and its sheer abundance in the universe, this element is used in a wide variety of applications.",
    "bestBuy": {
      "location": "Admin - Checkmate",
      "system": "Pyro",
      "price": 2.35,
      "stock": "high"
    },
    "bestSell": {
      "location": "Admin - Terra Gateway (Stanton)",
      "system": "Stanton",
      "price": 4.3,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Admin - Checkmate",
        "body": "Monox",
        "system": "pyro",
        "price": 2.4,
        "stock": "high"
      },
      {
        "terminal": "Admin - Orbituary",
        "body": "Bloom",
        "system": "pyro",
        "price": 2.4,
        "stock": "high"
      },
      {
        "terminal": "Admin - Everus Harbor",
        "body": "Hurston",
        "system": "stanton",
        "price": 2.7,
        "stock": "high"
      },
      {
        "terminal": "Admin - Baijini Point",
        "body": "ArcCorp",
        "system": "stanton",
        "price": 2.8,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Admin - Terra Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 4.3,
        "demand": "high",
        "margin": 2
      },
      {
        "terminal": "Admin - Seraphim",
        "body": "Crusader",
        "system": "stanton",
        "price": 3.8,
        "demand": "high",
        "margin": 1.5
      },
      {
        "terminal": "Admin - Nyx Gateway (Stanton)",
        "body": "Stanton",
        "system": "stanton",
        "price": 3.8,
        "demand": "high",
        "margin": 1.5
      },
      {
        "terminal": "Admin - Port Tressler",
        "body": "MicroTech",
        "system": "stanton",
        "price": 3.8,
        "demand": "high",
        "margin": 1.5
      }
    ]
  },
  {
    "id": "partillium",
    "slug": "partillium",
    "name_fr": "Partillium",
    "name_en": "Partillium",
    "category": "gases",
    "commodityType": "gas",
    "baseBuy": 8.22,
    "baseSell": 10,
    "marginPerScu": 178,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Partillium description.",
    "bestBuy": {
      "location": "Sacren's Plot",
      "system": "Pyro",
      "price": 8.22,
      "stock": "high"
    },
    "bestSell": {
      "location": "Bueno Ravine",
      "system": "Pyro",
      "price": 10,
      "demand": "high"
    },
    "buyLocations": [
      {
        "terminal": "Sacren's Plot",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 8.2,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Bueno Ravine",
        "body": "Bloom",
        "system": "pyro",
        "price": 10,
        "demand": "high",
        "margin": 178.1
      },
      {
        "terminal": "Admin - People's Service Station Delta",
        "body": "Nyx",
        "system": "nyx",
        "price": 9.8,
        "demand": "high",
        "margin": 158.1
      },
      {
        "terminal": "Canard View",
        "body": "Terminus",
        "system": "pyro",
        "price": 9.8,
        "demand": "high",
        "margin": 158.1
      },
      {
        "terminal": "Admin - Gaslight",
        "body": "Pyro V",
        "system": "pyro",
        "price": 9,
        "demand": "high",
        "margin": 78.1
      }
    ]
  },
  {
    "id": "dcsr2",
    "slug": "dcsr2",
    "name_fr": "DCSR2",
    "name_en": "DCSR2",
    "category": "consumables",
    "commodityType": "agricultural_supply",
    "baseBuy": 1.5,
    "baseSell": 3.2,
    "marginPerScu": 170,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      0.01,
      0.125,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "An organically derived terpenoid lipid, dicylasterone (commonly known as DCSR2), has been banned from use in biomedical applications. Currently, it is most typically used in the manufacture of illegal narcotic 'SLAM.'",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 1.5,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 3.2,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "genmod-seeds",
    "slug": "genmod-seeds",
    "name_fr": "Genmod Seeds",
    "name_en": "Genmod Seeds",
    "category": "consumables",
    "commodityType": "food",
    "baseBuy": 1.5,
    "baseSell": 3.2,
    "marginPerScu": 170,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1
    ],
    "consumable": false,
    "description": "",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 1.5,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 3.2,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "molina-mold-samples",
    "slug": "molina-mold-samples",
    "name_fr": "Molina Mold Samples",
    "name_en": "Molina Mold Samples",
    "category": "consumables",
    "commodityType": "food",
    "baseBuy": 1.5,
    "baseSell": 3.2,
    "marginPerScu": 170,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Samples of the deadly Molina Mold securely sealed in biohazard containers to ensure its toxic fungal spores can't get airborne.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 1.5,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 3.2,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "molina-mold-treatment",
    "slug": "molina-mold-treatment",
    "name_fr": "Molina Mold Treatment",
    "name_en": "Molina Mold Treatment",
    "category": "consumables",
    "commodityType": "food",
    "baseBuy": 1.5,
    "baseSell": 3.2,
    "marginPerScu": 170,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "A lifesaving treatment for those suffering from exposure to Molina Mold.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 1.5,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 3.2,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "vent-slug",
    "slug": "vent-slug",
    "name_fr": "Vent Slug",
    "name_en": "Vent Slug",
    "category": "consumables",
    "commodityType": "food",
    "baseBuy": 1.5,
    "baseSell": 3.2,
    "marginPerScu": 170,
    "isIllegal": false,
    "unitWeightKg": 100,
    "containerSizes": [],
    "consumable": true,
    "description": "NDR: 19\nHEI: 05\nEffects: Toxic, Cognitive Impairing\n\nThese slugs live in moist environments and eat mold that grows there. They can frequently be found inside and near life support vents where condensation can accumulate and are often brought aboard stations to help keep systems clean. Can be consumed, but they often can be mildly toxic to Humans owing to their diet.",
    "bestBuy": {
      "location": "Comptoir de commerce spatial",
      "system": "Stanton",
      "price": 1.5,
      "stock": "medium"
    },
    "bestSell": {
      "location": "TDD Place Commerciale",
      "system": "Stanton",
      "price": 3.2,
      "demand": "medium"
    },
    "buyLocations": [],
    "sellLocations": []
  },
  {
    "id": "quantum-fuel",
    "slug": "quantum-fuel",
    "name_fr": "Carburant Quantique Raffiné (Quantum Fuel)",
    "name_en": "Quantum Fuel",
    "category": "industrial",
    "commodityType": "processed_goods",
    "baseBuy": 2.8,
    "baseSell": 4.2,
    "marginPerScu": 140,
    "isIllegal": false,
    "unitWeightKg": 90,
    "containerSizes": [
      0.01,
      1,
      2,
      4,
      8,
      16,
      24,
      32
    ],
    "consumable": false,
    "description": "Fuel used by quantum drives to propel ships at high speeds or, if equipped with a jump module, through jump tunnels to other systems.",
    "bestBuy": {
      "location": "ARC-L1 Refinery Deck",
      "system": "Stanton",
      "price": 2.8,
      "stock": "high"
    },
    "bestSell": {
      "location": "Orbituary Platform (Pyro)",
      "system": "Pyro",
      "price": 4.2,
      "demand": "extreme"
    },
    "buyLocations": [
      {
        "terminal": "ARC-L1 Refinery Deck",
        "body": "ArcCorp L1",
        "system": "stanton",
        "price": 2.8,
        "stock": "high"
      }
    ],
    "sellLocations": [
      {
        "terminal": "Orbituary Platform",
        "body": "Pyro IV",
        "system": "pyro",
        "price": 4.2,
        "demand": "extreme",
        "margin": 1.4
      }
    ]
  }
];

export const POPULAR_TRADE_ROUTES = [
  {
    "id": "r_curated_1",
    "rank": 1,
    "name": "Laranite (Fret Cargo) • ArcCorp Mining Area 056 (Wala) ➔ Area18 TDD (ArcCorp)",
    "item": "Laranite (Fret Cargo)",
    "commodityId": "laranite",
    "from": "ArcCorp Mining Area 056 (Wala)",
    "to": "Area18 TDD (ArcCorp)",
    "origin": "ArcCorp Mining Area 056 (Wala)",
    "destination": "Area18 TDD (ArcCorp)",
    "system": "stanton",
    "distanceGm": 21.2,
    "distance": "Wala ➔ ArcCorp · 21.2 GM",
    "quantumJumps": 1,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 7047,
    "sellPricePerScu": 9700,
    "buyPrice": 70.47,
    "sellPrice": 97,
    "marginPerScu": 2653,
    "durationMinutes": 31,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Faible",
    "riskKey": "safe",
    "riskClass": "green",
    "riskTier": "t-g",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_2",
    "rank": 2,
    "name": "Laranite (Fret Cargo) • HDMS-Lathan (Arial) ➔ Lorville Central Business District (Hurston)",
    "item": "Laranite (Fret Cargo)",
    "commodityId": "laranite",
    "from": "HDMS-Lathan (Arial)",
    "to": "Lorville Central Business District (Hurston)",
    "origin": "HDMS-Lathan (Arial)",
    "destination": "Lorville Central Business District (Hurston)",
    "system": "stanton",
    "distanceGm": 14.5,
    "distance": "Arial ➔ Hurston · 14.5 GM",
    "quantumJumps": 1,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 7120,
    "sellPricePerScu": 9650,
    "buyPrice": 71.2,
    "sellPrice": 96.5,
    "marginPerScu": 2530,
    "durationMinutes": 26,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Faible",
    "riskKey": "safe",
    "riskClass": "green",
    "riskTier": "t-g",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_3",
    "rank": 3,
    "name": "Or Métallique (Gold) • HDMS-Norgaard (Ita) ➔ Area18 TDD (ArcCorp)",
    "item": "Or Métallique (Gold)",
    "commodityId": "gold",
    "from": "HDMS-Norgaard (Ita)",
    "to": "Area18 TDD (ArcCorp)",
    "origin": "HDMS-Norgaard (Ita)",
    "destination": "Area18 TDD (ArcCorp)",
    "system": "stanton",
    "distanceGm": 22.8,
    "distance": "Ita ➔ ArcCorp · 22.8 GM",
    "quantumJumps": 1,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 24360,
    "sellPricePerScu": 31000,
    "buyPrice": 243.6,
    "sellPrice": 310,
    "marginPerScu": 6640,
    "durationMinutes": 32,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Faible",
    "riskKey": "safe",
    "riskClass": "green",
    "riskTier": "t-g",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_4",
    "rank": 4,
    "name": "Or Métallique (Gold) • Brio's Breaker Yard (Daymar) ➔ Lorville Central Business District (Hurston)",
    "item": "Or Métallique (Gold)",
    "commodityId": "gold",
    "from": "Brio's Breaker Yard (Daymar)",
    "to": "Lorville Central Business District (Hurston)",
    "origin": "Brio's Breaker Yard (Daymar)",
    "destination": "Lorville Central Business District (Hurston)",
    "system": "stanton",
    "distanceGm": 18.4,
    "distance": "Daymar ➔ Hurston · 18.4 GM",
    "quantumJumps": 1,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 24500,
    "sellPricePerScu": 30800,
    "buyPrice": 245,
    "sellPrice": 308,
    "marginPerScu": 6300,
    "durationMinutes": 29,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Moyen",
    "riskKey": "medium",
    "riskClass": "amber",
    "riskTier": "t-y",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_5",
    "rank": 5,
    "name": "Béryl Brut & Taillé (Beryl) • Levski (Delamar) ➔ Lorville Central Business District (Hurston)",
    "item": "Béryl Brut & Taillé (Beryl)",
    "commodityId": "beryl",
    "from": "Levski (Delamar)",
    "to": "Lorville Central Business District (Hurston)",
    "origin": "Levski (Delamar)",
    "destination": "Lorville Central Business District (Hurston)",
    "system": "stanton",
    "distanceGm": 19.1,
    "distance": "Delamar ➔ Hurston · 19.1 GM",
    "quantumJumps": 1,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 15390,
    "sellPricePerScu": 24000,
    "buyPrice": 153.9,
    "sellPrice": 240,
    "marginPerScu": 8610,
    "durationMinutes": 29,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Faible",
    "riskKey": "safe",
    "riskClass": "green",
    "riskTier": "t-g",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_6",
    "rank": 6,
    "name": "Quantainium Raffiné • Raffinerie ARC-L1 Wide Forest ➔ Area18 TDD (ArcCorp)",
    "item": "Quantainium Raffiné",
    "commodityId": "quantainium",
    "from": "Raffinerie ARC-L1 Wide Forest",
    "to": "Area18 TDD (ArcCorp)",
    "origin": "Raffinerie ARC-L1 Wide Forest",
    "destination": "Area18 TDD (ArcCorp)",
    "system": "stanton",
    "distanceGm": 11.2,
    "distance": "Stanton ➔ ArcCorp · 11.2 GM",
    "quantumJumps": 1,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 14500,
    "sellPricePerScu": 26800,
    "buyPrice": 145,
    "sellPrice": 268,
    "marginPerScu": 12300,
    "durationMinutes": 23,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Faible",
    "riskKey": "safe",
    "riskClass": "green",
    "riskTier": "t-g",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_7",
    "rank": 7,
    "name": "Quantainium Raffiné • Raffinerie CRU-L1 Ambitious Dream ➔ New Babbage TDD (microTech)",
    "item": "Quantainium Raffiné",
    "commodityId": "quantainium",
    "from": "Raffinerie CRU-L1 Ambitious Dream",
    "to": "New Babbage TDD (microTech)",
    "origin": "Raffinerie CRU-L1 Ambitious Dream",
    "destination": "New Babbage TDD (microTech)",
    "system": "stanton",
    "distanceGm": 26.4,
    "distance": "Stanton ➔ microTech · 26.4 GM",
    "quantumJumps": 1,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 14500,
    "sellPricePerScu": 26200,
    "buyPrice": 145,
    "sellPrice": 262,
    "marginPerScu": 11700,
    "durationMinutes": 35,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Faible",
    "riskKey": "safe",
    "riskClass": "green",
    "riskTier": "t-g",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_8",
    "rank": 8,
    "name": "Matériau Composite Recyclé (RMC) • Rappel Scrap & Salvage (Pyro) ➔ Area18 TDD (ArcCorp)",
    "item": "Matériau Composite Recyclé (RMC)",
    "commodityId": "recycled-material-composite",
    "from": "Rappel Scrap & Salvage (Pyro)",
    "to": "Area18 TDD (ArcCorp)",
    "origin": "Rappel Scrap & Salvage (Pyro)",
    "destination": "Area18 TDD (ArcCorp)",
    "system": "stanton",
    "distanceGm": 45,
    "distance": "Pyro ➔ ArcCorp · 45 GM",
    "quantumJumps": 2,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 10500,
    "sellPricePerScu": 14800,
    "buyPrice": 105,
    "sellPrice": 148,
    "marginPerScu": 4300,
    "durationMinutes": 50,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Élevé",
    "riskKey": "high",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_9",
    "rank": 9,
    "name": "Matériau Composite Recyclé (RMC) • Terra Mills Hydrofarm (Cellin) ➔ Orison Cloudview TDD (Crusader)",
    "item": "Matériau Composite Recyclé (RMC)",
    "commodityId": "recycled-material-composite",
    "from": "Terra Mills Hydrofarm (Cellin)",
    "to": "Orison Cloudview TDD (Crusader)",
    "origin": "Terra Mills Hydrofarm (Cellin)",
    "destination": "Orison Cloudview TDD (Crusader)",
    "system": "stanton",
    "distanceGm": 8.5,
    "distance": "Cellin ➔ Crusader · 8.5 GM",
    "quantumJumps": 1,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 10500,
    "sellPricePerScu": 14400,
    "buyPrice": 105,
    "sellPrice": 144,
    "marginPerScu": 3900,
    "durationMinutes": 21,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Faible",
    "riskKey": "safe",
    "riskClass": "green",
    "riskTier": "t-g",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_10",
    "rank": 10,
    "name": "Matériaux de Construction Structurels (CM) • Levski Broyeurs (Delamar) ➔ Lorville Central Business District (Hurston)",
    "item": "Matériaux de Construction Structurels (CM)",
    "commodityId": "construction-materials",
    "from": "Levski Broyeurs (Delamar)",
    "to": "Lorville Central Business District (Hurston)",
    "origin": "Levski Broyeurs (Delamar)",
    "destination": "Lorville Central Business District (Hurston)",
    "system": "stanton",
    "distanceGm": 19.1,
    "distance": "Delamar ➔ Hurston · 19.1 GM",
    "quantumJumps": 1,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 4800,
    "sellPricePerScu": 7500,
    "buyPrice": 48,
    "sellPrice": 75,
    "marginPerScu": 2700,
    "durationMinutes": 29,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Faible",
    "riskKey": "safe",
    "riskClass": "green",
    "riskTier": "t-g",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_11",
    "rank": 11,
    "name": "Matériaux de Construction Structurels (CM) • Stations Broyeuses Orbitales ➔ Admin - MIC-L4 (microTech)",
    "item": "Matériaux de Construction Structurels (CM)",
    "commodityId": "construction-materials",
    "from": "Stations Broyeuses Orbitales",
    "to": "Admin - MIC-L4 (microTech)",
    "origin": "Stations Broyeuses Orbitales",
    "destination": "Admin - MIC-L4 (microTech)",
    "system": "stanton",
    "distanceGm": 22,
    "distance": "Stanton ➔ microTech · 22 GM",
    "quantumJumps": 1,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 4800,
    "sellPricePerScu": 7200,
    "buyPrice": 48,
    "sellPrice": 72,
    "marginPerScu": 2400,
    "durationMinutes": 32,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Faible",
    "riskKey": "safe",
    "riskClass": "green",
    "riskTier": "t-g",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_12",
    "rank": 12,
    "name": "Fournitures Médicales (Med Supplies) • Rayari Kaltag Research (Calliope) ➔ Admin - Nyx Gateway (Pyro)",
    "item": "Fournitures Médicales (Med Supplies)",
    "commodityId": "medical-supplies",
    "from": "Rayari Kaltag Research (Calliope)",
    "to": "Admin - Nyx Gateway (Pyro)",
    "origin": "Rayari Kaltag Research (Calliope)",
    "destination": "Admin - Nyx Gateway (Pyro)",
    "system": "stanton",
    "distanceGm": 52,
    "distance": "Calliope ➔ Pyro · 52 GM",
    "quantumJumps": 2,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 3343,
    "sellPricePerScu": 5800,
    "buyPrice": 33.43,
    "sellPrice": 58,
    "marginPerScu": 2457,
    "durationMinutes": 56,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Élevé",
    "riskKey": "high",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_13",
    "rank": 13,
    "name": "Fournitures Médicales (Med Supplies) • Deakins Research Outpost (Yela) ➔ GrimHEX (Yela)",
    "item": "Fournitures Médicales (Med Supplies)",
    "commodityId": "medical-supplies",
    "from": "Deakins Research Outpost (Yela)",
    "to": "GrimHEX (Yela)",
    "origin": "Deakins Research Outpost (Yela)",
    "destination": "GrimHEX (Yela)",
    "system": "stanton",
    "distanceGm": 3.2,
    "distance": "Yela ➔ Yela · 3.2 GM",
    "quantumJumps": 1,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 3350,
    "sellPricePerScu": 5650,
    "buyPrice": 33.5,
    "sellPrice": 56.5,
    "marginPerScu": 2300,
    "durationMinutes": 17,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Moyen",
    "riskKey": "medium",
    "riskClass": "amber",
    "riskTier": "t-y",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_14",
    "rank": 14,
    "name": "Titane Industriel (Titanium) • Shubin Mining Facility SAL-5 (Lyria) ➔ Area18 TDD (ArcCorp)",
    "item": "Titane Industriel (Titanium)",
    "commodityId": "titanium",
    "from": "Shubin Mining Facility SAL-5 (Lyria)",
    "to": "Area18 TDD (ArcCorp)",
    "origin": "Shubin Mining Facility SAL-5 (Lyria)",
    "destination": "Area18 TDD (ArcCorp)",
    "system": "stanton",
    "distanceGm": 14.8,
    "distance": "Lyria ➔ ArcCorp · 14.8 GM",
    "quantumJumps": 1,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 6699,
    "sellPricePerScu": 8300,
    "buyPrice": 66.99,
    "sellPrice": 83,
    "marginPerScu": 1601,
    "durationMinutes": 26,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Faible",
    "riskKey": "safe",
    "riskClass": "green",
    "riskTier": "t-g",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_15",
    "rank": 15,
    "name": "Agricium Raffiné • ArcCorp Mining 141 (Cellin) ➔ Area18 TDD (ArcCorp)",
    "item": "Agricium Raffiné",
    "commodityId": "agricium",
    "from": "ArcCorp Mining 141 (Cellin)",
    "to": "Area18 TDD (ArcCorp)",
    "origin": "ArcCorp Mining 141 (Cellin)",
    "destination": "Area18 TDD (ArcCorp)",
    "system": "stanton",
    "distanceGm": 21,
    "distance": "Cellin ➔ ArcCorp · 21 GM",
    "quantumJumps": 1,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 27500,
    "sellPricePerScu": 34500,
    "buyPrice": 275,
    "sellPrice": 345,
    "marginPerScu": 7000,
    "durationMinutes": 31,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Faible",
    "riskKey": "safe",
    "riskClass": "green",
    "riskTier": "t-g",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_16",
    "rank": 16,
    "name": "Diamant Industriel • Tram & Myers Mining (Cellin) ➔ Lorville Central Business District (Hurston)",
    "item": "Diamant Industriel",
    "commodityId": "diamond",
    "from": "Tram & Myers Mining (Cellin)",
    "to": "Lorville Central Business District (Hurston)",
    "origin": "Tram & Myers Mining (Cellin)",
    "destination": "Lorville Central Business District (Hurston)",
    "system": "stanton",
    "distanceGm": 16.5,
    "distance": "Cellin ➔ Hurston · 16.5 GM",
    "quantumJumps": 1,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 6200,
    "sellPricePerScu": 7400,
    "buyPrice": 62,
    "sellPrice": 74,
    "marginPerScu": 1200,
    "durationMinutes": 27,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Faible",
    "riskKey": "safe",
    "riskClass": "green",
    "riskTier": "t-g",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_17",
    "rank": 17,
    "name": "Bexalite Raffinée • Shubin Mining SCD-1 (Daymar) ➔ New Babbage TDD (microTech)",
    "item": "Bexalite Raffinée",
    "commodityId": "bexalite",
    "from": "Shubin Mining SCD-1 (Daymar)",
    "to": "New Babbage TDD (microTech)",
    "origin": "Shubin Mining SCD-1 (Daymar)",
    "destination": "New Babbage TDD (microTech)",
    "system": "stanton",
    "distanceGm": 28.5,
    "distance": "Daymar ➔ microTech · 28.5 GM",
    "quantumJumps": 1,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 23556,
    "sellPricePerScu": 31000,
    "buyPrice": 235.56,
    "sellPrice": 310,
    "marginPerScu": 7444,
    "durationMinutes": 37,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Faible",
    "riskKey": "safe",
    "riskClass": "green",
    "riskTier": "t-g",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_18",
    "rank": 18,
    "name": "Taranite Raffinée • Samson & Son Salvage (Daymar) ➔ Orison Cloudview TDD (Crusader)",
    "item": "Taranite Raffinée",
    "commodityId": "taranite",
    "from": "Samson & Son Salvage (Daymar)",
    "to": "Orison Cloudview TDD (Crusader)",
    "origin": "Samson & Son Salvage (Daymar)",
    "destination": "Orison Cloudview TDD (Crusader)",
    "system": "stanton",
    "distanceGm": 9.2,
    "distance": "Daymar ➔ Crusader · 9.2 GM",
    "quantumJumps": 1,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 21792,
    "sellPricePerScu": 31000,
    "buyPrice": 217.92,
    "sellPrice": 310,
    "marginPerScu": 9208,
    "durationMinutes": 21,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Moyen",
    "riskKey": "medium",
    "riskClass": "amber",
    "riskTier": "t-y",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_19",
    "rank": 19,
    "name": "Stileron (Exclusif Pyro) • Bueno Ravine (Bloom, Pyro) ➔ Admin - Nyx Gateway (Pyro)",
    "item": "Stileron (Exclusif Pyro)",
    "commodityId": "stileron",
    "from": "Bueno Ravine (Bloom, Pyro)",
    "to": "Admin - Nyx Gateway (Pyro)",
    "origin": "Bueno Ravine (Bloom, Pyro)",
    "destination": "Admin - Nyx Gateway (Pyro)",
    "system": "pyro",
    "distanceGm": 62,
    "distance": "Bloom, Pyro ➔ Pyro · 62 GM",
    "quantumJumps": 2,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 12285,
    "sellPricePerScu": 17000,
    "buyPrice": 122.85,
    "sellPrice": 170,
    "marginPerScu": 4715,
    "durationMinutes": 64,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Élevé",
    "riskKey": "high",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_20",
    "rank": 20,
    "name": "Sunset Berries • Shepherd's Rest (Pyro) ➔ Rayari Deltana Research Outpost (microTech)",
    "item": "Sunset Berries",
    "commodityId": "sunset-berries",
    "from": "Shepherd's Rest (Pyro)",
    "to": "Rayari Deltana Research Outpost (microTech)",
    "origin": "Shepherd's Rest (Pyro)",
    "destination": "Rayari Deltana Research Outpost (microTech)",
    "system": "pyro",
    "distanceGm": 68,
    "distance": "Pyro ➔ microTech · 68 GM",
    "quantumJumps": 2,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 6563,
    "sellPricePerScu": 11000,
    "buyPrice": 65.63,
    "sellPrice": 110,
    "marginPerScu": 4437,
    "durationMinutes": 68,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Élevé",
    "riskKey": "high",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_21",
    "rank": 21,
    "name": "Diamond Laminate • Canard View (Pyro) ➔ Jackson's Swap (Pyro)",
    "item": "Diamond Laminate",
    "commodityId": "diamond-laminate",
    "from": "Canard View (Pyro)",
    "to": "Jackson's Swap (Pyro)",
    "origin": "Canard View (Pyro)",
    "destination": "Jackson's Swap (Pyro)",
    "system": "pyro",
    "distanceGm": 42,
    "distance": "Pyro ➔ Pyro · 42 GM",
    "quantumJumps": 2,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 6688,
    "sellPricePerScu": 10000,
    "buyPrice": 66.88,
    "sellPrice": 100,
    "marginPerScu": 3312,
    "durationMinutes": 48,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Élevé",
    "riskKey": "high",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_22",
    "rank": 22,
    "name": "Osoian Hides • The Golden Riviera (Bloom, Pyro) ➔ Devlin Scrap and Salvage (microTech)",
    "item": "Osoian Hides",
    "commodityId": "osoian-hides",
    "from": "The Golden Riviera (Bloom, Pyro)",
    "to": "Devlin Scrap and Salvage (microTech)",
    "origin": "The Golden Riviera (Bloom, Pyro)",
    "destination": "Devlin Scrap and Salvage (microTech)",
    "system": "pyro",
    "distanceGm": 85,
    "distance": "Bloom, Pyro ➔ microTech · 85 GM",
    "quantumJumps": 2,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 2835,
    "sellPricePerScu": 8700,
    "buyPrice": 28.35,
    "sellPrice": 87,
    "marginPerScu": 5865,
    "durationMinutes": 82,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Élevé",
    "riskKey": "high",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_23",
    "rank": 23,
    "name": "Degnous Root • Shepherd's Rest (Pyro) ➔ Admin - HUR-L5 (Hurston)",
    "item": "Degnous Root",
    "commodityId": "degnous-root",
    "from": "Shepherd's Rest (Pyro)",
    "to": "Admin - HUR-L5 (Hurston)",
    "origin": "Shepherd's Rest (Pyro)",
    "destination": "Admin - HUR-L5 (Hurston)",
    "system": "pyro",
    "distanceGm": 74,
    "distance": "Pyro ➔ Hurston · 74 GM",
    "quantumJumps": 2,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 3800,
    "sellPricePerScu": 5900,
    "buyPrice": 38,
    "sellPrice": 59,
    "marginPerScu": 2100,
    "durationMinutes": 73,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Élevé",
    "riskKey": "high",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_24",
    "rank": 24,
    "name": "Ferraille & Déchets Métalliques (Scrap) • Admin - HUR-L5 (Hurston) ➔ HDMS-Hahn (Hurston)",
    "item": "Ferraille & Déchets Métalliques (Scrap)",
    "commodityId": "scrap",
    "from": "Admin - HUR-L5 (Hurston)",
    "to": "HDMS-Hahn (Hurston)",
    "origin": "Admin - HUR-L5 (Hurston)",
    "destination": "HDMS-Hahn (Hurston)",
    "system": "stanton",
    "distanceGm": 12,
    "distance": "Hurston ➔ Hurston · 12 GM",
    "quantumJumps": 1,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 2749,
    "sellPricePerScu": 3800,
    "buyPrice": 27.49,
    "sellPrice": 38,
    "marginPerScu": 1051,
    "durationMinutes": 24,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Faible",
    "riskKey": "safe",
    "riskClass": "green",
    "riskTier": "t-g",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_25",
    "rank": 25,
    "name": "Fournitures Agricoles (Agri-Supplies) • Hickes Research Outpost (Cellin) ➔ Bountiful Harvest Hydroponics (Daymar)",
    "item": "Fournitures Agricoles (Agri-Supplies)",
    "commodityId": "agri-supplies",
    "from": "Hickes Research Outpost (Cellin)",
    "to": "Bountiful Harvest Hydroponics (Daymar)",
    "origin": "Hickes Research Outpost (Cellin)",
    "destination": "Bountiful Harvest Hydroponics (Daymar)",
    "system": "stanton",
    "distanceGm": 6.8,
    "distance": "Cellin ➔ Daymar · 6.8 GM",
    "quantumJumps": 1,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 1100,
    "sellPricePerScu": 1550,
    "buyPrice": 11,
    "sellPrice": 15.5,
    "marginPerScu": 450,
    "durationMinutes": 19,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Faible",
    "riskKey": "safe",
    "riskClass": "green",
    "riskTier": "t-g",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_26",
    "rank": 26,
    "name": "Spiritueux Distillés • Bountiful Harvest (Daymar) ➔ GrimHEX (Yela)",
    "item": "Spiritueux Distillés",
    "commodityId": "distilled-spirits",
    "from": "Bountiful Harvest (Daymar)",
    "to": "GrimHEX (Yela)",
    "origin": "Bountiful Harvest (Daymar)",
    "destination": "GrimHEX (Yela)",
    "system": "stanton",
    "distanceGm": 8.4,
    "distance": "Daymar ➔ Yela · 8.4 GM",
    "quantumJumps": 1,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 1312,
    "sellPricePerScu": 2100,
    "buyPrice": 13.12,
    "sellPrice": 21,
    "marginPerScu": 788,
    "durationMinutes": 21,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Moyen",
    "riskKey": "medium",
    "riskClass": "amber",
    "riskTier": "t-y",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_27",
    "rank": 27,
    "name": "Gasping Weevil Eggs • Fallow Field (Pyro) ➔ Devlin Scrap and Salvage (microTech)",
    "item": "Gasping Weevil Eggs",
    "commodityId": "gasping-weevil-eggs",
    "from": "Fallow Field (Pyro)",
    "to": "Devlin Scrap and Salvage (microTech)",
    "origin": "Fallow Field (Pyro)",
    "destination": "Devlin Scrap and Salvage (microTech)",
    "system": "pyro",
    "distanceGm": 78,
    "distance": "Pyro ➔ microTech · 78 GM",
    "quantumJumps": 2,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 14500,
    "sellPricePerScu": 24592,
    "buyPrice": 145,
    "sellPrice": 245.92,
    "marginPerScu": 10092,
    "durationMinutes": 76,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Extrême",
    "riskKey": "extreme",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_28",
    "rank": 28,
    "name": "Maze (Substance Contrôlée) • Jumptown (Yela) ➔ GrimHEX (Yela)",
    "item": "Maze (Substance Contrôlée)",
    "commodityId": "maze",
    "from": "Jumptown (Yela)",
    "to": "GrimHEX (Yela)",
    "origin": "Jumptown (Yela)",
    "destination": "GrimHEX (Yela)",
    "system": "stanton",
    "distanceGm": 4.5,
    "distance": "Yela ➔ Yela · 4.5 GM",
    "quantumJumps": 1,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 9500,
    "sellPricePerScu": 14500,
    "buyPrice": 95,
    "sellPrice": 145,
    "marginPerScu": 5000,
    "durationMinutes": 18,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Extrême",
    "riskKey": "extreme",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_29",
    "rank": 29,
    "name": "Slam (Narcotique) • Raven's Roost (Calliope) ➔ Brio's Breaker Yard (Daymar)",
    "item": "Slam (Narcotique)",
    "commodityId": "slam",
    "from": "Raven's Roost (Calliope)",
    "to": "Brio's Breaker Yard (Daymar)",
    "origin": "Raven's Roost (Calliope)",
    "destination": "Brio's Breaker Yard (Daymar)",
    "system": "stanton",
    "distanceGm": 31,
    "distance": "Calliope ➔ Daymar · 31 GM",
    "quantumJumps": 1,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 14200,
    "sellPricePerScu": 21500,
    "buyPrice": 142,
    "sellPrice": 215,
    "marginPerScu": 7300,
    "durationMinutes": 39,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Élevé",
    "riskKey": "high",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_30",
    "rank": 30,
    "name": "WiDoW (Substance Illicite) • Ashland (Pyro) ➔ Samson & Son Salvage (Daymar)",
    "item": "WiDoW (Substance Illicite)",
    "commodityId": "widow",
    "from": "Ashland (Pyro)",
    "to": "Samson & Son Salvage (Daymar)",
    "origin": "Ashland (Pyro)",
    "destination": "Samson & Son Salvage (Daymar)",
    "system": "pyro",
    "distanceGm": 65,
    "distance": "Pyro ➔ Daymar · 65 GM",
    "quantumJumps": 2,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 11500,
    "sellPricePerScu": 17000,
    "buyPrice": 115,
    "sellPrice": 170,
    "marginPerScu": 5500,
    "durationMinutes": 66,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Extrême",
    "riskKey": "extreme",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_curated_31",
    "rank": 31,
    "name": "Néon Gaz • Rustville (Pyro) ➔ Admin - Starlight Service (Pyro)",
    "item": "Néon Gaz",
    "commodityId": "neon",
    "from": "Rustville (Pyro)",
    "to": "Admin - Starlight Service (Pyro)",
    "origin": "Rustville (Pyro)",
    "destination": "Admin - Starlight Service (Pyro)",
    "system": "pyro",
    "distanceGm": 44,
    "distance": "Pyro ➔ Pyro · 44 GM",
    "quantumJumps": 2,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 7206,
    "sellPricePerScu": 12000,
    "buyPrice": 72.06,
    "sellPrice": 120,
    "marginPerScu": 4794,
    "durationMinutes": 49,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Élevé",
    "riskKey": "high",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_fy_32",
    "rank": 32,
    "name": "Osoian Hides • The Golden Riviera ➔ Devlin Scrap and Salvage",
    "item": "Osoian Hides",
    "commodityId": "osoian-hides",
    "from": "The Golden Riviera",
    "to": "Devlin Scrap and Salvage",
    "origin": "The Golden Riviera (Pyro)",
    "destination": "Devlin Scrap and Salvage (Stanton)",
    "system": "pyro",
    "distanceGm": 128,
    "distance": "Pyro ➔ Stanton · 128 GM",
    "quantumJumps": 2,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 2835,
    "sellPricePerScu": 8700,
    "buyPrice": 28.35,
    "sellPrice": 87,
    "marginPerScu": 5865,
    "durationMinutes": 207,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Élevé",
    "riskKey": "high",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 24
  },
  {
    "id": "r_fy_33",
    "rank": 33,
    "name": "Stileron • Bueno Ravine ➔ Admin - Nyx Gateway (Pyro)",
    "item": "Stileron",
    "commodityId": "stileron",
    "from": "Bueno Ravine",
    "to": "Admin - Nyx Gateway (Pyro)",
    "origin": "Bueno Ravine (Pyro)",
    "destination": "Admin - Nyx Gateway (Pyro) (Pyro)",
    "system": "pyro",
    "distanceGm": 48,
    "distance": "Pyro ➔ Pyro · 48 GM",
    "quantumJumps": 2,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 1229,
    "sellPricePerScu": 1700,
    "buyPrice": 12.29,
    "sellPrice": 17,
    "marginPerScu": 471,
    "durationMinutes": 87,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Élevé",
    "riskKey": "high",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 16
  },
  {
    "id": "r_fy_34",
    "rank": 34,
    "name": "Sunset Berries • Shepherd's Rest ➔ Rayari Deltana Research Outpost",
    "item": "Sunset Berries",
    "commodityId": "sunset-berries",
    "from": "Shepherd's Rest",
    "to": "Rayari Deltana Research Outpost",
    "origin": "Shepherd's Rest (Pyro)",
    "destination": "Rayari Deltana Research Outpost (Stanton)",
    "system": "pyro",
    "distanceGm": 128,
    "distance": "Pyro ➔ Stanton · 128 GM",
    "quantumJumps": 2,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 65626,
    "sellPricePerScu": 110000,
    "buyPrice": 656.26,
    "sellPrice": 1100,
    "marginPerScu": 44374,
    "durationMinutes": 207,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Élevé",
    "riskKey": "high",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_fy_35",
    "rank": 35,
    "name": "Diamond Laminate • Canard View ➔ Jackson's Swap",
    "item": "Diamond Laminate",
    "commodityId": "diamond-laminate",
    "from": "Canard View",
    "to": "Jackson's Swap",
    "origin": "Canard View (Pyro)",
    "destination": "Jackson's Swap (Pyro)",
    "system": "pyro",
    "distanceGm": 79,
    "distance": "Pyro ➔ Pyro · 79 GM",
    "quantumJumps": 2,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 66880,
    "sellPricePerScu": 100000,
    "buyPrice": 668.8,
    "sellPrice": 1000,
    "marginPerScu": 33120,
    "durationMinutes": 134,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Élevé",
    "riskKey": "high",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 16
  },
  {
    "id": "r_fy_36",
    "rank": 36,
    "name": "Pitambu • Shepherd's Rest ➔ Sacren's Plot",
    "item": "Pitambu",
    "commodityId": "pitambu",
    "from": "Shepherd's Rest",
    "to": "Sacren's Plot",
    "origin": "Shepherd's Rest (Pyro)",
    "destination": "Sacren's Plot (Pyro)",
    "system": "pyro",
    "distanceGm": 52,
    "distance": "Pyro ➔ Pyro · 52 GM",
    "quantumJumps": 2,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 49114,
    "sellPricePerScu": 78000,
    "buyPrice": 491.14,
    "sellPrice": 780,
    "marginPerScu": 28886,
    "durationMinutes": 93,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Élevé",
    "riskKey": "high",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_fy_37",
    "rank": 37,
    "name": "Gasping Weevil Eggs • Fallow Field ➔ Devlin Scrap and Salvage",
    "item": "Gasping Weevil Eggs",
    "commodityId": "gasping-weevil-eggs",
    "from": "Fallow Field",
    "to": "Devlin Scrap and Salvage",
    "origin": "Fallow Field (Pyro)",
    "destination": "Devlin Scrap and Salvage (Stanton)",
    "system": "pyro",
    "distanceGm": 160,
    "distance": "Pyro ➔ Stanton · 160 GM",
    "quantumJumps": 2,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 46408,
    "sellPricePerScu": 71000,
    "buyPrice": 464.08,
    "sellPrice": 710,
    "marginPerScu": 24592,
    "durationMinutes": 255,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Élevé",
    "riskKey": "high",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 24
  },
  {
    "id": "r_fy_38",
    "rank": 38,
    "name": "Degnous Root • Shepherd's Rest ➔ Admin - HUR-L5",
    "item": "Degnous Root",
    "commodityId": "degnous-root",
    "from": "Shepherd's Rest",
    "to": "Admin - HUR-L5",
    "origin": "Shepherd's Rest (Pyro)",
    "destination": "Admin - HUR-L5 (Stanton)",
    "system": "pyro",
    "distanceGm": 77,
    "distance": "Pyro ➔ Stanton · 77 GM",
    "quantumJumps": 2,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 44156,
    "sellPricePerScu": 68000,
    "buyPrice": 441.56,
    "sellPrice": 680,
    "marginPerScu": 23844,
    "durationMinutes": 131,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Élevé",
    "riskKey": "high",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_fy_39",
    "rank": 39,
    "name": "Audio-Visual Equipment • Fallow Field ➔ HDMS-Lathan",
    "item": "Audio-Visual Equipment",
    "commodityId": "audio-visual-equipment",
    "from": "Fallow Field",
    "to": "HDMS-Lathan",
    "origin": "Fallow Field (Pyro)",
    "destination": "HDMS-Lathan (Stanton)",
    "system": "pyro",
    "distanceGm": 121,
    "distance": "Pyro ➔ Stanton · 121 GM",
    "quantumJumps": 2,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 25004,
    "sellPricePerScu": 46000,
    "buyPrice": 250.04,
    "sellPrice": 460,
    "marginPerScu": 20996,
    "durationMinutes": 197,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Élevé",
    "riskKey": "high",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 24
  },
  {
    "id": "r_fy_40",
    "rank": 40,
    "name": "Audio-Visual Equipment • Seer's Canyon ➔ HDMS-Lathan",
    "item": "Audio-Visual Equipment",
    "commodityId": "audio-visual-equipment",
    "from": "Seer's Canyon",
    "to": "HDMS-Lathan",
    "origin": "Seer's Canyon (Pyro)",
    "destination": "HDMS-Lathan (Stanton)",
    "system": "pyro",
    "distanceGm": 121,
    "distance": "Pyro ➔ Stanton · 121 GM",
    "quantumJumps": 2,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 25004,
    "sellPricePerScu": 46000,
    "buyPrice": 250.04,
    "sellPrice": 460,
    "marginPerScu": 20996,
    "durationMinutes": 197,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Élevé",
    "riskKey": "high",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 16
  },
  {
    "id": "r_fy_41",
    "rank": 41,
    "name": "Golden Medmon • Shepherd's Rest ➔ The Golden Riviera",
    "item": "Golden Medmon",
    "commodityId": "golden-medmon",
    "from": "Shepherd's Rest",
    "to": "The Golden Riviera",
    "origin": "Shepherd's Rest (Pyro)",
    "destination": "The Golden Riviera (Pyro)",
    "system": "pyro",
    "distanceGm": 65,
    "distance": "Pyro ➔ Pyro · 25 GM",
    "quantumJumps": 2,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 51415,
    "sellPricePerScu": 71000,
    "buyPrice": 514.15,
    "sellPrice": 710,
    "marginPerScu": 19585,
    "durationMinutes": 45,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Élevé",
    "riskKey": "high",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 32
  },
  {
    "id": "r_fy_42",
    "rank": 42,
    "name": "Tritium • Hickes Research Outpost ➔ Admin - Endgame",
    "item": "Tritium",
    "commodityId": "tritium",
    "from": "Hickes Research Outpost",
    "to": "Admin - Endgame",
    "origin": "Hickes Research Outpost (Stanton)",
    "destination": "Admin - Endgame (Pyro)",
    "system": "stanton",
    "distanceGm": 120,
    "distance": "Stanton ➔ Pyro · 120 GM",
    "quantumJumps": 2,
    "originAtmoMinutes": 1,
    "destAtmoMinutes": 1,
    "terminalMinutes": 3.5,
    "buyPricePerScu": 15769,
    "sellPricePerScu": 35000,
    "buyPrice": 157.69,
    "sellPrice": 350,
    "marginPerScu": 19231,
    "durationMinutes": 195,
    "freshness": "Direct Live",
    "freshnessClass": "green",
    "freshnessTier": "t-g",
    "risk": "Élevé",
    "riskKey": "high",
    "riskClass": "red",
    "riskTier": "t-r",
    "hasFreightElevator": true,
    "maxContainerSize": 24
  }
];
