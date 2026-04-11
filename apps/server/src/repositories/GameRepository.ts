import { GameModel, type IGame } from '../models/GameModel.js';

export class GameRepository {
  async create(gameId: string, name: string, state: Record<string, unknown>): Promise<IGame> {
    const game = new GameModel({ gameId, name, state, status: 'waiting' });
    return game.save();
  }

  async findByGameId(gameId: string): Promise<IGame | null> {
    return GameModel.findOne({ gameId }).exec();
  }

  async findByStatus(status: string): Promise<IGame[]> {
    return GameModel.find({ status }).sort({ createdAt: -1 }).exec();
  }

  async findByPlayerId(playerId: string): Promise<IGame[]> {
    return GameModel.find({ 'players.id': playerId }).sort({ lastUpdate: -1 }).exec();
  }

  async updateState(gameId: string, state: Record<string, unknown>, status?: string): Promise<IGame | null> {
    const update: Record<string, unknown> = { state, lastUpdate: new Date() };
    if (status) update.status = status;
    return GameModel.findOneAndUpdate({ gameId }, update, { new: true }).exec();
  }

  async addPlayer(gameId: string, player: { id: string; username: string; faction: string }): Promise<IGame | null> {
    return GameModel.findOneAndUpdate(
      { gameId },
      { $push: { players: player }, $set: { lastUpdate: new Date() } },
      { new: true },
    ).exec();
  }

  async delete(gameId: string): Promise<boolean> {
    const result = await GameModel.deleteOne({ gameId }).exec();
    return result.deletedCount > 0;
  }

  async listOpen(): Promise<IGame[]> {
    return GameModel.find({ status: 'waiting' }).sort({ createdAt: -1 }).exec();
  }
}
