import type { CardData, CityName } from './types';

const CARDS: Record<CityName, CardData> = {
  Milano: {
    name: 'Milano',
    recruitment: { cavalleria: 2, vescovi: 1, mercanti: 2 },
    recruitmentControlled: { cavalleria: 1, vescovi: 1, mercanti: 1 },
    power: 'capitale_lega',
    description: 'Capitale della Lega Lombarda. Bonus difesa +1.',
    connections: ['Asti', 'Lodi', 'Bergamo', 'Modena'],
  },
  Asti: {
    name: 'Asti',
    recruitment: { cavalleria: 1, vescovi: 2, mercanti: 1 },
    recruitmentControlled: { cavalleria: 1, vescovi: 1, mercanti: 1 },
    power: 'sede_vescovile',
    description: 'Importante sede vescovile del Piemonte. I vescovi costano -1.',
    connections: ['Lodi', 'Milano'],
  },
  Ferrara: {
    name: 'Ferrara',
    recruitment: { cavalleria: 1, vescovi: 1, mercanti: 2 },
    recruitmentControlled: { cavalleria: 1, vescovi: 1, mercanti: 1 },
    power: 'mercato',
    description: 'Grande mercato degli Estensi. Recluta mercanti gratis una volta per turno.',
    connections: ['Padova', 'Venezia', 'Ravenna'],
  },
  Firenze: {
    name: 'Firenze',
    recruitment: { cavalleria: 2, vescovi: 0, mercanti: 1 },
    recruitmentControlled: { cavalleria: 1, vescovi: 0, mercanti: 1 },
    power: 'fortezza',
    description: 'Città fortificata della Toscana. Difesa +2 contro assedi.',
    connections: ['Pisa', 'Bologna', 'Roma'],
  },
  Bergamo: {
    name: 'Bergamo',
    recruitment: { cavalleria: 1, vescovi: 1, mercanti: 1 },
    recruitmentControlled: { cavalleria: 1, vescovi: 0, mercanti: 1 },
    power: null,
    description: 'Città di montagna. Accesso difficile.',
    connections: ['Milano', 'Modena', 'Germania'],
  },
  Pisa: {
    name: 'Pisa',
    recruitment: { cavalleria: 1, vescovi: 1, mercanti: 1 },
    recruitmentControlled: { cavalleria: 0, vescovi: 1, mercanti: 1 },
    power: 'porto_navale',
    description: 'Repubblica marinara. Controlla le rotte tirreniche.',
    connections: ['Firenze'],
  },
  Lodi: {
    name: 'Lodi',
    recruitment: { cavalleria: 1, vescovi: 1, mercanti: 1 },
    recruitmentControlled: { cavalleria: 1, vescovi: 1, mercanti: 0 },
    power: null,
    description: 'Piccola città agricola.',
    connections: ['Milano', 'Modena'],
  },
  Verona: {
    name: 'Verona',
    recruitment: { cavalleria: 2, vescovi: 1, mercanti: 1 },
    recruitmentControlled: { cavalleria: 1, vescovi: 1, mercanti: 1 },
    power: 'crocevia',
    description: 'Importante crocevia commerciale.',
    connections: ['Modena', 'Trento', 'Bologna', 'Padova'],
  },
  Venezia: {
    name: 'Venezia',
    recruitment: { cavalleria: 1, vescovi: 1, mercanti: 1 },
    recruitmentControlled: { cavalleria: 1, vescovi: 1, mercanti: 0 },
    power: 'potenza_navale',
    description: 'La Serenissima. Potente repubblica marinara.',
    connections: ['Padova', 'Ferrara'],
  },
  Padova: {
    name: 'Padova',
    recruitment: { cavalleria: 1, vescovi: 2, mercanti: 1 },
    recruitmentControlled: { cavalleria: 1, vescovi: 1, mercanti: 1 },
    power: 'universita',
    description: "Sede dell'università. I vescovi hanno +1 in combattimento.",
    connections: ['Trento', 'Verona', 'Ferrara', 'Venezia'],
  },
  Ravenna: {
    name: 'Ravenna',
    recruitment: { cavalleria: 1, vescovi: 1, mercanti: 2 },
    recruitmentControlled: { cavalleria: 1, vescovi: 1, mercanti: 1 },
    power: 'via_commerciale',
    description: 'Antica capitale imperiale. Importante via commerciale adriatica.',
    connections: ['Ferrara', 'Bologna', 'Ancona'],
  },
  Bologna: {
    name: 'Bologna',
    recruitment: { cavalleria: 1, vescovi: 2, mercanti: 1 },
    recruitmentControlled: { cavalleria: 1, vescovi: 1, mercanti: 1 },
    power: 'diritto_canonico',
    description: 'Centro del diritto canonico. I vescovi non possono essere eliminati.',
    connections: ['Verona', 'Firenze', 'Ravenna'],
  },
  Modena: {
    name: 'Modena',
    recruitment: { cavalleria: 1, vescovi: 1, mercanti: 1 },
    recruitmentControlled: { cavalleria: 0, vescovi: 1, mercanti: 1 },
    power: null,
    description: "Città ducale dell'Emilia.",
    connections: ['Bergamo', 'Milano', 'Lodi', 'Verona'],
  },
  Ancona: {
    name: 'Ancona',
    recruitment: { cavalleria: 1, vescovi: 1, mercanti: 1 },
    recruitmentControlled: { cavalleria: 1, vescovi: 0, mercanti: 1 },
    power: null,
    description: 'Porto adriatico delle Marche.',
    connections: ['Ravenna', 'Roma'],
  },
  Trento: {
    name: 'Trento',
    recruitment: { cavalleria: 2, vescovi: 1, mercanti: 0 },
    recruitmentControlled: { cavalleria: 1, vescovi: 1, mercanti: 0 },
    power: 'controllo_imperiale',
    description: 'Sotto controllo imperiale diretto. Barbarossa parte con +1 cavalleria qui.',
    connections: ['Verona', 'Padova', 'Germania'],
  },
};

export function getCard(name: CityName): CardData {
  const card = CARDS[name];
  if (!card) throw new Error(`Card not found: ${name}`);
  return card;
}

export function getRecruitment(name: CityName, controlled: boolean) {
  const card = getCard(name);
  return controlled ? card.recruitmentControlled : card.recruitment;
}

export function getAllCardNames(): CityName[] {
  return Object.keys(CARDS) as CityName[];
}

export function buildDeck(): CityName[] {
  const deck = getAllCardNames();
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export { CARDS };
