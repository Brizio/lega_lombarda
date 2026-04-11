import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import type { GameManager } from '../services/GameManager.js';

const PlayCardSchema = z.object({
  cardName: z.string(),
  action: z.enum(['conflitto', 'recluta', 'potere']),
  target: z.string().optional(),
});

const DeploySchema = z.object({
  city: z.string(),
  unitType: z.string(),
  count: z.number().int().positive(),
});

const DraftSchema = z.object({
  kept: z.array(z.string()),
  passed: z.array(z.string()),
});

const SetupRound1Schema = z.object({ unitType: z.string() });
const BonusUnitsSchema = z.object({ units: z.record(z.string(), z.number()) });
const StartingCitySchema = z.object({ city: z.string() });

export function gameRoutes(gm: GameManager) {
  return async function (app: FastifyInstance): Promise<void> {
    // All game routes require auth
    app.addHook('preHandler', requireAuth);

    /** POST /api/game/create */
    app.post('/create', async (request) => {
      const req = request as AuthenticatedRequest;
      const body = z.object({ name: z.string().optional() }).parse(request.body);
      const gameId = gm.createNewGame(req.userId!, req.username!, body.name);
      return { gameId };
    });

    /** POST /api/game/join */
    app.post('/join', async (request) => {
      const req = request as AuthenticatedRequest;
      const { gameId } = z.object({ gameId: z.string() }).parse(request.body);
      gm.joinGame(gameId, req.userId!, req.username!);
      return { ok: true };
    });

    /** GET /api/game/available */
    app.get('/available', async () => {
      return gm.getAvailableGames();
    });

    /** GET /api/game/:gameId/state */
    app.get('/:gameId/state', async (request) => {
      const req = request as AuthenticatedRequest;
      const { gameId } = request.params as { gameId: string };
      const game = gm.getGame(gameId);
      if (!game) return { error: 'Partita non trovata' };
      return gm.getPlayerData(game, req.userId!);
    });

    /** POST /api/game/:gameId/swap-faction */
    app.post('/:gameId/swap-faction', async (request) => {
      const req = request as AuthenticatedRequest;
      const { gameId } = request.params as { gameId: string };
      gm.doSwapFactions(gameId, req.userId!);
      return { ok: true };
    });

    /** POST /api/game/:gameId/set-starting-city */
    app.post('/:gameId/set-starting-city', async (request) => {
      const req = request as AuthenticatedRequest;
      const { gameId } = request.params as { gameId: string };
      const { city } = StartingCitySchema.parse(request.body);
      gm.doSetStartingCity(gameId, req.userId!, city);
      return { ok: true };
    });

    /** POST /api/game/:gameId/start */
    app.post('/:gameId/start', async (request) => {
      const { gameId } = request.params as { gameId: string };
      gm.doStartGame(gameId);
      return { ok: true };
    });

    /** POST /api/game/:gameId/draft */
    app.post('/:gameId/draft', async (request) => {
      const req = request as AuthenticatedRequest;
      const { gameId } = request.params as { gameId: string };
      const { kept, passed } = DraftSchema.parse(request.body);
      gm.doDraft(gameId, req.userId!, kept, passed);
      return { ok: true };
    });

    /** POST /api/game/:gameId/setup-round1 */
    app.post('/:gameId/setup-round1', async (request) => {
      const req = request as AuthenticatedRequest;
      const { gameId } = request.params as { gameId: string };
      const { unitType } = SetupRound1Schema.parse(request.body);
      gm.doSetupRound1(gameId, req.userId!, unitType);
      return { ok: true };
    });

    /** POST /api/game/:gameId/choose-unit-bonus */
    app.post('/:gameId/choose-unit-bonus', async (request) => {
      const req = request as AuthenticatedRequest;
      const { gameId } = request.params as { gameId: string };
      const { units } = BonusUnitsSchema.parse(request.body);
      gm.doChooseBonusUnits(gameId, req.userId!, units);
      return { ok: true };
    });

    /** POST /api/game/:gameId/play-card */
    app.post('/:gameId/play-card', async (request) => {
      const req = request as AuthenticatedRequest;
      const { gameId } = request.params as { gameId: string };
      const { cardName, action, target } = PlayCardSchema.parse(request.body);
      gm.doPlayCard(gameId, req.userId!, cardName, action, target);
      return { ok: true };
    });

    /** POST /api/game/:gameId/deploy-units */
    app.post('/:gameId/deploy-units', async (request) => {
      const req = request as AuthenticatedRequest;
      const { gameId } = request.params as { gameId: string };
      const { city, unitType, count } = DeploySchema.parse(request.body);
      gm.doDeployUnits(gameId, req.userId!, city, unitType, count);
      return { ok: true };
    });

    /** POST /api/game/:gameId/end-turn */
    app.post('/:gameId/end-turn', async (request) => {
      const req = request as AuthenticatedRequest;
      const { gameId } = request.params as { gameId: string };
      gm.doEndTurn(gameId, req.userId!);
      return { ok: true };
    });

    /** POST /api/game/:gameId/pass-turn */
    app.post('/:gameId/pass-turn', async (request) => {
      const req = request as AuthenticatedRequest;
      const { gameId } = request.params as { gameId: string };
      gm.doPassTurn(gameId, req.userId!);
      return { ok: true };
    });

    /** POST /api/game/:gameId/resolve-conflicts */
    app.post('/:gameId/resolve-conflicts', async (request) => {
      const { gameId } = request.params as { gameId: string };
      gm.doResolveConflicts(gameId);
      return { ok: true };
    });

    /** POST /api/game/:gameId/end-round */
    app.post('/:gameId/end-round', async (request) => {
      const { gameId } = request.params as { gameId: string };
      gm.doEndRound(gameId);
      return { ok: true };
    });

    /** POST /api/game/:gameId/leave */
    app.post('/:gameId/leave', async (request) => {
      const req = request as AuthenticatedRequest;
      const { gameId } = request.params as { gameId: string };
      gm.leaveGame(gameId, req.userId!);
      return { ok: true };
    });

    /** GET /api/game/:gameId/spectate */
    app.get('/:gameId/spectate', async (request) => {
      const { gameId } = request.params as { gameId: string };
      const game = gm.getGame(gameId);
      if (!game) return { error: 'Partita non trovata' };
      return gm.getSpectatorData(game);
    });
  };
}
