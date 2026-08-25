// Signaux officiels de l'annexe I du règlement IIHF 2026/27 (pp. 163-169).
// Généré depuis le rulebook — ne pas éditer à la main sans reporter la source.

export type Family = 'hit' | 'stick' | 'cond' | 'play'

export interface Signal {
  id: string
  rule: string
  fr: string
  en: string
  desc: string
  memo: string
  page: number
  family: Family
  imgs: string[]
}

export const FAMILIES: { key: Family | 'all'; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'hit', label: 'Charges & coups' },
  { key: 'stick', label: 'Crosse & obstruction' },
  { key: 'cond', label: 'Conduite & jeu' },
  { key: 'play', label: 'Jeu & lignes' },
]

export const SIGNALS: Signal[] = [
  {
    id: "24",
    rule: "24",
    fr: "Tir de pénalité",
    en: "Penalty shot",
    desc: "Les deux bras croisés au-dessus de la tête.",
    memo: "",
    page: 163,
    family: "cond",
    imgs: [
      "24_1.jpg"
    ]
  },
  {
    id: "41",
    rule: "41",
    fr: "Charge contre la bande",
    en: "Boarding",
    desc: "Frapper le poing fermé d'une main dans la paume ouverte de l'autre main, devant la poitrine.",
    memo: "",
    page: 163,
    family: "hit",
    imgs: [
      "41_1.jpg"
    ]
  },
  {
    id: "42",
    rule: "42",
    fr: "Charge incorrecte",
    en: "Charging",
    desc: "Poings fermés tournant l'un autour de l'autre devant la poitrine.",
    memo: "",
    page: 163,
    family: "hit",
    imgs: [
      "42_1.jpg"
    ]
  },
  {
    id: "43",
    rule: "43",
    fr: "Charge par derrière",
    en: "Checking from behind",
    desc: "Mouvement des deux bras vers l'avant, paumes ouvertes tournées vers l'extérieur, bras complètement tendus depuis la poitrine, à hauteur d'épaule.",
    memo: "",
    page: 163,
    family: "hit",
    imgs: [
      "43_1.jpg"
    ]
  },
  {
    id: "44",
    rule: "44",
    fr: "Charge contre le genou",
    en: "Clipping",
    desc: "Frapper la jambe d'une main derrière le genou, les deux patins restant sur la glace.",
    memo: "Derrière le genou = 44. Sous le genou = 57 (trébucher).",
    page: 163,
    family: "hit",
    imgs: [
      "44_1.jpg"
    ]
  },
  {
    id: "45",
    rule: "45",
    fr: "Coup de coude",
    en: "Elbowing",
    desc: "Tapoter un coude avec la main opposée.",
    memo: "",
    page: 163,
    family: "hit",
    imgs: [
      "45_1.jpg"
    ]
  },
  {
    id: "48",
    rule: "48",
    fr: "Charge contre la tête ou le cou",
    en: "Illegal check to the head or neck",
    desc: "Tapoter le côté de la tête avec la paume à plat de la main sans sifflet.",
    memo: "",
    page: 164,
    family: "hit",
    imgs: [
      "48_1.jpg"
    ]
  },
  {
    id: "50",
    rule: "50",
    fr: "Coup de genou",
    en: "Kneeing",
    desc: "Frapper un genou avec la paume de la main, les deux patins restant sur la glace.",
    memo: "",
    page: 164,
    family: "hit",
    imgs: [
      "50_1.jpg"
    ]
  },
  {
    id: "51",
    rule: "51",
    fr: "Dureté excessive / bagarre",
    en: "Roughing / Fighting",
    desc: "Poing fermé, bras tendu sur le côté du corps.",
    memo: "",
    page: 164,
    family: "hit",
    imgs: [
      "51_1.jpg"
    ]
  },
  {
    id: "54",
    rule: "54",
    fr: "Retenir",
    en: "Holding",
    desc: "Saisir un poignet avec l'autre main devant la poitrine.",
    memo: "",
    page: 164,
    family: "stick",
    imgs: [
      "54_1.jpg"
    ]
  },
  {
    id: "54s",
    rule: "54",
    fr: "Retenir la crosse (2 temps)",
    en: "Holding the stick (two stage)",
    desc: "Signal en deux temps : le signal de « retenir », suivi d'un signal montrant que l'on tient une crosse à deux mains, de manière normale.",
    memo: "1 = retenir · 2 = tenir la crosse.",
    page: 164,
    family: "stick",
    imgs: [
      "54s_1.jpg",
      "54s_2.jpg"
    ]
  },
  {
    id: "55",
    rule: "55",
    fr: "Accrocher",
    en: "Hooking",
    desc: "Mouvement de traction des deux bras, comme pour tirer quelque chose de l'avant vers le ventre.",
    memo: "",
    page: 165,
    family: "stick",
    imgs: [
      "55_1.jpg"
    ]
  },
  {
    id: "56",
    rule: "56",
    fr: "Obstruction",
    en: "Interference",
    desc: "Bras croisés immobiles devant la poitrine, en « X ».",
    memo: "",
    page: 165,
    family: "stick",
    imgs: [
      "56_1.jpg"
    ]
  },
  {
    id: "57",
    rule: "57",
    fr: "Faire trébucher",
    en: "Tripping",
    desc: "Frapper la jambe d'une main sous le genou, les deux patins restant sur la glace.",
    memo: "Sous le genou = 57. Derrière le genou = 44 (clipping).",
    page: 165,
    family: "stick",
    imgs: [
      "57_1.jpg"
    ]
  },
  {
    id: "58",
    rule: "58",
    fr: "Harponner avec le manche",
    en: "Butt-ending",
    desc: "Passer l'avant-bras, poing fermé, sous l'autre avant-bras tenu paume vers le bas.",
    memo: "",
    page: 165,
    family: "stick",
    imgs: [
      "58_1.jpg"
    ]
  },
  {
    id: "59",
    rule: "59",
    fr: "Charge avec la crosse",
    en: "Cross-checking",
    desc: "Mouvement d'avant en arrière des bras, les deux poings fermés, s'écartant de la poitrine d'environ 30 cm.",
    memo: "",
    page: 165,
    family: "stick",
    imgs: [
      "59_1.jpg"
    ]
  },
  {
    id: "60",
    rule: "60",
    fr: "Crosse haute",
    en: "High-sticking",
    desc: "Les deux poings fermés, l'un légèrement au-dessus de l'autre (comme si l'on tenait une crosse), à hauteur du front.",
    memo: "Même geste que 80. Ici : pénalité (crosse haute sur un joueur).",
    page: 166,
    family: "stick",
    imgs: [
      "60_1.jpg"
    ]
  },
  {
    id: "61",
    rule: "61",
    fr: "Coup de crosse",
    en: "Slashing",
    desc: "Mouvement de hache avec le tranchant d'une main sur l'avant-bras opposé.",
    memo: "",
    page: 166,
    family: "stick",
    imgs: [
      "61_1.jpg"
    ]
  },
  {
    id: "62",
    rule: "62",
    fr: "Piquer avec la lame (2 temps)",
    en: "Spearing (two stage)",
    desc: "Mouvement de piqué des deux mains projetées juste devant le corps, puis mains ramenées le long du corps.",
    memo: "L'inverse d'accrocher : loin du corps, pas vers le corps.",
    page: 166,
    family: "stick",
    imgs: [
      "62_1.jpg",
      "62_2.jpg"
    ]
  },
  {
    id: "63",
    rule: "63",
    fr: "Retarder le jeu",
    en: "Delaying the game",
    desc: "Mouvement dans lequel la main à plat glisse vers le haut depuis l'autre main, au centre du corps.",
    memo: "",
    page: 166,
    family: "cond",
    imgs: [
      "63_1.jpg",
      "63_2.jpg"
    ]
  },
  {
    id: "64",
    rule: "64",
    fr: "Plongeon / simulation",
    en: "Diving / Embellishment",
    desc: "Les deux mains sur les hanches, puis pointer deux (2) doigts selon le cas.",
    memo: "Même geste que 75 (antisportif).",
    page: 166,
    family: "cond",
    imgs: [
      "64_1.jpg"
    ]
  },
  {
    id: "74",
    rule: "74",
    fr: "Trop de joueurs sur la glace",
    en: "Too many players on the ice",
    desc: "Montrer six (6) doigts, une main ouverte, devant la poitrine.",
    memo: "",
    page: 167,
    family: "cond",
    imgs: [
      "74_1.jpg"
    ]
  },
  {
    id: "75",
    rule: "75",
    fr: "Conduite antisportive",
    en: "Unsportsmanlike conduct",
    desc: "Les deux mains sur les hanches, puis pointer deux (2) doigts selon le cas.",
    memo: "Même geste que 64 (plongeon).",
    page: 167,
    family: "cond",
    imgs: [
      "75_1.jpg"
    ]
  },
  {
    id: "76",
    rule: "76",
    fr: "Avertissement faute d'engagement",
    en: "Face-off violation warning",
    desc: "Un bras plié, paume ouverte vers le haut, du côté de l'équipe qui a commis la faute d'engagement.",
    memo: "",
    page: 167,
    family: "cond",
    imgs: [
      "76_1.jpg"
    ]
  },
  {
    id: "78",
    rule: "78",
    fr: "Puck dans le but",
    en: "Puck in the net",
    desc: "Bras tendu dirigé vers le but dans lequel le puck est entré légalement.",
    memo: "",
    page: 167,
    family: "play",
    imgs: [
      "78_1.jpg"
    ]
  },
  {
    id: "79",
    rule: "79",
    fr: "Passe de la main",
    en: "Handpass",
    desc: "Paume ouverte tournée vers l'avant, mouvement de poussée vers l'avant du corps, une ou deux fois, pour indiquer que le puck a été avancé avec la main.",
    memo: "",
    page: 167,
    family: "play",
    imgs: [
      "79_1.jpg"
    ]
  },
  {
    id: "80",
    rule: "80",
    fr: "Crosse haute sur le puck",
    en: "High-sticking the puck",
    desc: "Les deux poings fermés, l'un légèrement au-dessus de l'autre (comme si l'on tenait une crosse), à hauteur du front.",
    memo: "Même geste que 60. Ici : arrêt de jeu, pas de pénalité.",
    page: 167,
    family: "play",
    imgs: [
      "80_1.jpg"
    ]
  },
  {
    id: "81a",
    rule: "81",
    fr: "Icing signalé",
    en: "Icing signaled",
    desc: "Le juge de ligne arrière signale un icing possible en tendant complètement un bras au-dessus de la tête. Le bras reste levé jusqu'à ce que le juge de ligne avant siffle l'icing ou que celui-ci soit annulé.",
    memo: "",
    page: 168,
    family: "play",
    imgs: [
      "81a_1.jpg"
    ]
  },
  {
    id: "81b",
    rule: "81",
    fr: "Icing sifflé",
    en: "Icing called",
    desc: "Une fois l'icing acquis, le juge de ligne arrière pointe le point d'engagement approprié et patine vers celui-ci, se retournant en marche arrière vers la ligne bleue et croisant les bras sur la poitrine.",
    memo: "",
    page: 168,
    family: "play",
    imgs: [
      "81b_1.jpg"
    ]
  },
  {
    id: "83a",
    rule: "83",
    fr: "Hors-jeu retardé",
    en: "Off-side delayed",
    desc: "Bras sans sifflet complètement tendu vers le haut, main à plat.",
    memo: "Annulation : baisser le bras sur le côté.",
    page: 168,
    family: "play",
    imgs: [
      "83a_1.jpg"
    ]
  },
  {
    id: "83b",
    rule: "83",
    fr: "Hors-jeu sifflé",
    en: "Off-side called",
    desc: "Arrêter le jeu au sifflet, puis tendre le bras horizontalement en direction de la ligne bleue, avec la main sans sifflet.",
    memo: "",
    page: 168,
    family: "play",
    imgs: [
      "83b_1.jpg"
    ]
  },
  {
    id: "87",
    rule: "87",
    fr: "Temps mort",
    en: "Time-out",
    desc: "Former un « T » avec les deux mains devant la poitrine.",
    memo: "",
    page: 168,
    family: "play",
    imgs: [
      "87_1.jpg"
    ]
  },
  {
    id: "101",
    rule: "101.1",
    fr: "Charge illégale (hockey féminin)",
    en: "Women's hockey – illegal hit",
    desc: "La paume de la main sans sifflet est amenée en travers du corps et posée sur l'épaule opposée.",
    memo: "Hockey féminin uniquement.",
    page: 168,
    family: "hit",
    imgs: [
      "101_1.jpg"
    ]
  },
  {
    id: "wo_ls",
    rule: "—",
    fr: "Wash-out — juge de ligne",
    en: "Wash-out signal linesperson",
    desc: "Mouvement de balayage latéral. Tendre les deux bras vers l'extérieur, à hauteur d'épaule, paumes vers le bas.",
    memo: "Pas de hors-jeu, pas d'icing.",
    page: 169,
    family: "play",
    imgs: [
      "wo_ls_1.jpg"
    ]
  },
  {
    id: "wo_ref",
    rule: "—",
    fr: "Wash-out — arbitre",
    en: "Wash-out signal referee",
    desc: "Mouvement de balayage latéral. Tendre les deux bras vers l'extérieur, à hauteur d'épaule, paumes vers le bas.",
    memo: "Pas de but, pas de passe de la main, pas de crosse haute sur le puck.",
    page: 169,
    family: "play",
    imgs: [
      "wo_ref_1.jpg"
    ]
  }
] as Signal[]
