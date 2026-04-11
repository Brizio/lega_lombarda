import type { Server as SocketIOServer, Socket } from 'socket.io';
import { randomUUID } from 'crypto';
import {
  createGame,
  addPlayer,
  swapFactions,
  setStartingCity,
  startGame,
  chooseDraftCards,
  executeSetupRound1,
  chooseBonusUnits,
  playCard,
  deployUnits,
  endTurn,
  passTurn,
  resolveConflicts,
  endRound,
  toSpectatorData,
  toPlayerData,
  toJSON,
  type GameState,
  type Faction,
  type CityName,
  type UnitType,
  type UnitCounts,
  type CardAction,
} from '@barbarossa/game-engine';
import { GameRepository } from '../repositories/GameRepository.js';

export class GameManager {
  private games = new Map<string, GameState>();
  private playerGameMap = new Map<string, string>();
  private spectators = new Map<string, Set<Socket>>();
  private io: SocketIOServer | null = null;
  private repo = new GameRepository();

  setSocketIO(io: SocketIOServer): void {
    this.io = io;
  }

  /** Load active games from DB into memory cache on startup */
  async loadActiveGames(): Promise<void> {
    const docs = await this.repo.findByStatus('waiting');
    const playing = await this.repo.findByStatus('playing');
    const drafting = await this.repo.findByStatus('draft');
    for (const doc of [...docs, ...playing, ...drafting]) {
      const state = doc.state as unknown as GameState;
      this.games.set(doc.gameId, state);
      for (const p of doc.players) {
        this.playerGameMap.set(p.id, doc.gameId);
      }
    }
  }

  /* ─── Create / Join ─── */

  createNewGame(creatorId: string, creatorName: string, gameName?: string): string {
    const id = randomUUID();
    const state = createGame(id, gameName ?? `Partita di ${creatorName}`);
    addPlayer(state, creatorId, creatorName, 'Barbarossa');
    this.games.set(state.id, state);
    this.playerGameMap.set(creatorId, state.id);

    this.repo
      .create(state.id, gameName ?? `Partita di ${creatorName}`, toJSON(state) as Record<string, unknown>)
      .catch(() => {});

    return state.id;
  }

  joinGame(gameId: string, playerId: string, playerName: string): void {
    const game = this.getGame(gameId);
    if (!game) throw new Error('Partita non trovata');
    if (game.players.length >= 2) throw new Error('Partita già completa');
    if (game.players.find((p) => p.id === playerId)) return;

    this.removePlayerFromAllGames(playerId);
    const faction: Faction = game.players[0]?.faction === 'Barbarossa' ? 'Lega' : 'Barbarossa';
    addPlayer(game, playerId, playerName, faction);
    this.playerGameMap.set(playerId, gameId);
    this.persist(game);
    this.notifyAll(game);
  }

  /* ─── Queries ─── */

  getGame(gameId: string): GameState | undefined {
    return this.games.get(gameId);
  }

  getGameByPlayerId(playerId: string): GameState | undefined {
    const gid = this.playerGameMap.get(playerId);
    return gid ? this.games.get(gid) : undefined;
  }

  getAvailableGames(): Array<{ id: string; players: Array<{ id: string; name: string; faction: Faction }>; status: string }> {
    return [...this.games.values()]
      .filter((g) => g.status === 'waiting' && g.players.length < 2)
      .map((g) => ({
        id: g.id,
        players: g.players.map((p) => ({ id: p.id, name: p.name, faction: p.faction })),
        status: g.status,
      }));
  }

  /* ─── Game Actions ─── */

  doSwapFactions(gameId: string, playerId: string): void {
    const game = this.requireGame(gameId, playerId);
    swapFactions(game);
    this.persist(game);
    this.notifyAll(game);
  }

  doSetStartingCity(gameId: string, playerId: string, city: string): void {
    const game = this.requireGame(gameId, playerId);
    setStartingCity(game, playerId, city as CityName);
    this.persist(game);
    this.notifyAll(game);
  }

  doStartGame(gameId: string): void {
    const game = this.requireGameById(gameId);
    startGame(game);
    this.persist(game);
    this.notifyAll(game);
  }

  doDraft(gameId: string, playerId: string, kept: string[], passed: string[]): void {
    const game = this.requireGame(gameId, playerId);
    chooseDraftCards(game, playerId, kept as CityName[], passed as CityName[]);
    this.persist(game);
    this.notifyAll(game);
  }

  doSetupRound1(gameId: string, playerId: string, unitType: string): void {
    const game = this.requireGame(gameId, playerId);
    executeSetupRound1(game, playerId, unitType as UnitType);
    this.persist(game);
    this.notifyAll(game);
  }

  doChooseBonusUnits(gameId: string, playerId: string, units: Partial<UnitCounts>): void {
    const game = this.requireGame(gameId, playerId);
    chooseBonusUnits(game, playerId, units);
    this.persist(game);
    this.notifyAll(game);
  }

  doPlayCard(gameId: string, playerId: string, cardName: string, action: string, target?: string): void {
    const game = this.requireGame(gameId, playerId);
    playCard(game, playerId, cardName as CityName, action as CardAction, target ? { target } : {});
    this.persist(game);
    this.notifyAll(game);
  }

  doDeployUnits(gameId: string, playerId: string, city: string, unitType: string, count: number): void {
    const game = this.requireGame(gameId, playerId);
    deployUnits(game, playerId, city as CityName, unitType as UnitType, count);
    this.persist(game);
    this.notifyAll(game);
  }

  doEndTurn(gameId: string, playerId: string): void {
    const game = this.requireGame(gameId, playerId);
    endTurn(game, playerId);
    this.persist(game);
    this.notifyAll(game);
  }

  doPassTurn(gameId: string, playerId: string): void {
    const game = this.requireGame(gameId, playerId);
    passTurn(game);
    this.persist(game);
    this.notifyAll(game);
  }

  doResolveConflicts(gameId: string): void {
    const game = this.requireGameById(gameId);
    resolveConflicts(game);
    this.persist(game);
    this.notifyAll(game);
  }

  doEndRound(gameId: string): void {
    const game = this.requireGameById(gameId);
    endRound(game);
    this.persist(game);
    this.notifyAll(game);
  }

  /* ─── Leave / Delete ─── */

  leaveGame(gameId: string, playerId: string): void {
    const game = this.getGame(gameId);
    if (!game) return;
    game.players = game.players.filter((p) => p.id !== playerId);
    this.playerGameMap.delete(playerId);
    if (game.players.length === 0) {
      this.deleteGame(gameId);
    } else {
      this.persist(game);
      this.notifyAll(game);
    }
  }

  deleteGame(gameId: string): void {
    const game = this.games.get(gameId);
    if (game) {
      for (const p of game.players) this.playerGameMap.delete(p.id);
    }
    this.games.delete(gameId);
    this.spectators.delete(gameId);
    this.repo.delete(gameId).catch(() => {});
  }

  /* ─── Spectators ─── */

  addSpectator(gameId: string, socket: Socket): void {
    if (!this.spectators.has(gameId)) this.spectators.set(gameId, new Set());
    this.spectators.get(gameId)!.add(socket);
  }

  removeSpectator(gameId: string, socket: Socket): void {
    this.spectators.get(gameId)?.delete(socket);
  }

  /* ─── Serialization ─── */

  getSpectatorData(game: GameState) {
    return toSpectatorData(game);
  }

  getPlayerData(game: GameState, playerId: string) {
    return toPlayerData(game, playerId);
  }

  /* ─── Internals ─── */

  private requireGame(gameId: string, playerId: string): GameState {
    const game = this.games.get(gameId);
    if (!game) throw new Error('Partita non trovata');
    if (!game.players.find((p) => p.id === playerId)) throw new Error('Non sei in questa partita');
    return game;
  }

  private requireGameById(gameId: string): GameState {
    const game = this.games.get(gameId);
    if (!game) throw new Error('Partita non trovata');
    return game;
  }

  private removePlayerFromAllGames(playerId: string): void {
    const gid = this.playerGameMap.get(playerId);
    if (gid) this.leaveGame(gid, playerId);
  }

  private persist(game: GameState): void {
    this.repo
      .updateState(game.id, toJSON(game) as Record<string, unknown>, game.status)
      .catch(() => {});
  }

  private notifyAll(game: GameState): void {
    if (!this.io) return;

    // Per-player personalized data
    for (const player of game.players) {
      this.io.to(`player_${player.id}`).emit('game_update', {
        type: 'game_update',
        game: toPlayerData(game, player.id),
      });
    }

    // Spectator broadcast
    const spectatorSockets = this.spectators.get(game.id);
    if (spectatorSockets?.size) {
      const data = { type: 'game_update', game: toSpectatorData(game) };
      for (const s of spectatorSockets) s.emit('game_update', data);
    }
  }
}
