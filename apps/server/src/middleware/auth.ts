import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../config/jwt.js';

export interface AuthenticatedRequest extends FastifyRequest {
  userId?: string;
  username?: string;
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    reply.status(401).send({ error: 'Token mancante' });
    return;
  }

  try {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    (request as AuthenticatedRequest).userId = payload.userId;
    (request as AuthenticatedRequest).username = payload.username;
  } catch {
    reply.status(401).send({ error: 'Token non valido' });
  }
}
