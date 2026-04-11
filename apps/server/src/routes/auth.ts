import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { UserModel } from '../models/UserModel.js';
import { signToken } from '../config/jwt.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

const RegisterSchema = z.object({
  username: z.string().min(2).max(30).trim(),
  password: z.string().min(4).max(100),
});

const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance): Promise<void> {
  /** POST /api/auth/register */
  app.post('/register', async (request, reply) => {
    const body = RegisterSchema.parse(request.body);

    const existing = await UserModel.findOne({ username: body.username });
    if (existing) return reply.status(409).send({ error: 'Username già in uso' });

    const user = new UserModel({ username: body.username, password: body.password });
    await user.save();

    const token = signToken({ userId: user.id, username: user.username });
    return { token, user: { id: user.id, username: user.username } };
  });

  /** POST /api/auth/login */
  app.post('/login', async (request, reply) => {
    const body = LoginSchema.parse(request.body);

    const user = await UserModel.findOne({ username: body.username });
    if (!user || !(await user.comparePassword(body.password))) {
      return reply.status(401).send({ error: 'Credenziali non valide' });
    }

    const token = signToken({ userId: user.id, username: user.username });
    return { token, user: { id: user.id, username: user.username } };
  });

  /** POST /api/auth/guest — login anonimo */
  app.post('/guest', async (_request, _reply) => {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const guestName = `Ospite_${Math.random().toString(36).slice(2, 6)}`;

    const user = new UserModel({ username: guestName, password: guestId, isGuest: true });
    await user.save();

    const token = signToken({ userId: user.id, username: guestName });
    return { token, user: { id: user.id, username: guestName } };
  });

  /** GET /api/auth/check — verifica token */
  app.get('/check', { preHandler: requireAuth }, async (request) => {
    const req = request as AuthenticatedRequest;
    return { authenticated: true, userId: req.userId, username: req.username };
  });
}
