import { z } from 'zod';
import { UNIT_TYPES, CITY_NAMES, FACTIONS } from './types';

const unitTypeEnum = z.enum([UNIT_TYPES.CAVALLERIA, UNIT_TYPES.VESCOVI, UNIT_TYPES.MERCANTI]);
const cityNameEnum = z.enum(CITY_NAMES as unknown as [string, ...string[]]);
const factionEnum = z.enum([FACTIONS.BARBAROSSA, FACTIONS.LEGA]);
const cardActionEnum = z.enum(['conflitto', 'recluta', 'potere']);

export const AddPlayerSchema = z.object({
  playerId: z.string().min(1),
  playerName: z.string().min(1).max(30),
  faction: factionEnum,
});

export const SetStartingCitySchema = z.object({
  playerId: z.string().min(1),
  city: cityNameEnum,
});

export const DraftChoiceSchema = z.object({
  playerId: z.string().min(1),
  kept: z.array(cityNameEnum).min(1).max(1),
  passed: z.array(cityNameEnum).min(1).max(2),
});

export const SetupRound1Schema = z.object({
  playerId: z.string().min(1),
  unitType: unitTypeEnum,
});

export const BonusUnitsSchema = z.object({
  playerId: z.string().min(1),
  units: z.object({
    cavalleria: z.number().int().min(0).default(0),
    vescovi: z.number().int().min(0).default(0),
    mercanti: z.number().int().min(0).default(0),
  }),
});

export const PlayCardSchema = z.object({
  playerId: z.string().min(1),
  cardName: cityNameEnum,
  action: cardActionEnum,
  details: z.record(z.unknown()).optional().default({}),
});

export const DeployUnitsSchema = z.object({
  playerId: z.string().min(1),
  conflictCity: cityNameEnum,
  unitType: unitTypeEnum,
  quantity: z.number().int().min(1),
});

export const EndTurnSchema = z.object({
  playerId: z.string().min(1),
});
