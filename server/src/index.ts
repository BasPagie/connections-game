import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { registerSocketHandlers } from './socketHandlers.js';
import type { ClientToServerEvents, ServerToClientEvents } from '../../shared/types.js';

const app = express();
const server = http.createServer(app);

const CORS_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'];

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST'],
  },
});

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

io.on('connection', (socket) => {
  console.log(`[Socket] Verbonden: ${socket.id}`);
  registerSocketHandlers(io, socket);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🎮 Server draait op http://localhost:${PORT}`);
});
