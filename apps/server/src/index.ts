import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { Server as SocketIOServer } from 'socket.io';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { verifyToken } from './config/jwt.js';
import { authRoutes } from './routes/auth.js';
import { gameRoutes } from './routes/game.js';
import { GameManager } from './services/GameManager.js';

async function main() {
  /* ─── Fastify ─── */
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

  /* ─── Database ─── */
  await connectDatabase();

  /* ─── GameManager ─── */
  const gm = new GameManager();
  await gm.loadActiveGames();

  /* ─── Routes ─── */
  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(gameRoutes(gm), { prefix: '/api/game' });

  app.get('/health', async () => ({ status: 'ok' }));

  /* ─── Start HTTP ─── */
  await app.listen({ port: env.PORT, host: '0.0.0.0' });

  /* ─── Socket.IO ─── */
  const io = new SocketIOServer(app.server, {
    cors: { origin: env.CORS_ORIGIN, credentials: true },
  });

  gm.setSocketIO(io);

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) return next(new Error('Token mancante'));
    try {
      const payload = verifyToken(token);
      (socket as any).userId = payload.userId;
      (socket as any).username = payload.username;
      next();
    } catch {
      next(new Error('Token non valido'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId as string;

    // Join personal room for targeted updates
    socket.join(`player_${userId}`);

    socket.on('join_game', (gameId: string) => {
      socket.join(`game_${gameId}`);

      // Try reconnect if player was in this game
      const game = gm.getGame(gameId);
      if (game?.players.find((p) => p.id === userId)) {
        socket.emit('game_update', {
          type: 'reconnect',
          game: gm.getPlayerData(game, userId),
        });
      }
    });

    socket.on('spectate', (gameId: string) => {
      socket.join(`game_${gameId}`);
      gm.addSpectator(gameId, socket);

      const game = gm.getGame(gameId);
      if (game) {
        socket.emit('game_update', {
          type: 'spectate',
          game: gm.getSpectatorData(game),
        });
      }
    });

    socket.on('disconnect', () => {
      // Clean up spectator references
      for (const [gameId] of gm['spectators']) {
        gm.removeSpectator(gameId, socket);
      }
    });
  });

  console.log(`Server running on port ${env.PORT}`);
}

main().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
