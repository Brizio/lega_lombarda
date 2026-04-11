import mongoose, { Schema, Document } from 'mongoose';

export interface IGame extends Document {
  gameId: string;
  name: string;
  state: Record<string, unknown>;
  status: string;
  players: Array<{ id: string; username: string; faction: string }>;
  createdAt: Date;
  lastUpdate: Date;
}

const gameSchema = new Schema<IGame>({
  gameId: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  state: { type: Schema.Types.Mixed, required: true },
  status: { type: String, default: 'waiting', enum: ['waiting', 'draft', 'playing', 'finished'] },
  players: [
    {
      id: String,
      username: String,
      faction: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
  lastUpdate: { type: Date, default: Date.now },
});

gameSchema.index({ gameId: 1 }, { unique: true });
gameSchema.index({ status: 1 });
gameSchema.index({ 'players.id': 1 });

export const GameModel = mongoose.model<IGame>('Game', gameSchema);
