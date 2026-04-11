import { io, type Socket } from 'socket.io-client';
import { useGameStore } from '@/stores/game';

let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (socket?.connected) return socket;

  const token = localStorage.getItem('token');
  socket = io({ auth: { token }, transports: ['websocket', 'polling'] });

  socket.on('connect', () => {
    console.log('[WS] connected', socket!.id);
  });

  socket.on('game_update', (payload: { type: string; game: unknown }) => {
    const gameStore = useGameStore();
    gameStore.handleGameUpdate(payload);
  });

  socket.on('disconnect', (reason) => {
    console.log('[WS] disconnected:', reason);
  });

  return socket;
}

export function joinGameRoom(gameId: string): void {
  socket?.emit('join_game', gameId);
}

export function spectateGame(gameId: string): void {
  socket?.emit('spectate', gameId);
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}
