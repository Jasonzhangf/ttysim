import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { logger } from './logger';
import {
  WebSocketMessage,
  MessageType,
  ClientInfo,
  TTYSimSession,
  Resolution,
} from '@ttysim/shared-types';

export class WebSocketManager {
  private io: SocketIOServer;
  private sessions: Map<string, TTYSimSession> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
        methods: ['GET', 'POST'],
      },
    });

    this.setupEventHandlers();
    logger.info('WebSocket manager initialized');
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on('client_join', (data: { sessionId: string; clientInfo: ClientInfo }) => {
        this.handleClientJoin(socket, data);
      });

      socket.on('client_input', (data: WebSocketMessage) => {
        this.handleClientInput(socket, data);
      });

      socket.on('disconnect', () => {
        this.handleClientDisconnect(socket);
      });
    });
  }

  private handleClientJoin(socket: any, data: { sessionId: string; clientInfo: ClientInfo }): void {
    const { sessionId, clientInfo } = data;
    logger.info(`Client ${clientInfo.id} joining session ${sessionId}`);

    // Get or create session
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = this.createSession(sessionId);
      this.sessions.set(sessionId, session);
    }

    // Add client to session
    session.clients.set(clientInfo.id, clientInfo);
    socket.join(sessionId);
    socket.data.sessionId = sessionId;
    socket.data.clientId = clientInfo.id;

    // Notify all clients in session
    this.broadcastToSession(sessionId, {
      type: 'client_join',
      sessionId,
      clientId: clientInfo.id,
      data: clientInfo,
      timestamp: new Date(),
    });

    // Send current session state to new client
    socket.emit('session_sync', {
      type: 'session_sync',
      sessionId,
      clientId: clientInfo.id,
      data: {
        resolution: session.currentResolution,
        clients: Array.from(session.clients.values()),
      },
      timestamp: new Date(),
    });
  }

  private handleClientInput(socket: any, message: WebSocketMessage): void {
    const { sessionId } = socket.data;
    if (!sessionId) {
      logger.warn(`Client ${socket.id} sent input without session`);
      return;
    }

    logger.debug(`Received input from client ${message.clientId} in session ${sessionId}`);

    // Broadcast input to all clients in session (including sender for consistency)
    this.broadcastToSession(sessionId, message);
  }

  private handleClientDisconnect(socket: any): void {
    const { sessionId, clientId } = socket.data;
    if (!sessionId || !clientId) {
      logger.info(`Anonymous client disconnected: ${socket.id}`);
      return;
    }

    logger.info(`Client ${clientId} disconnected from session ${sessionId}`);

    const session = this.sessions.get(sessionId);
    if (session) {
      session.clients.delete(clientId);

      // Notify remaining clients
      this.broadcastToSession(sessionId, {
        type: 'client_leave',
        sessionId,
        clientId,
        data: { clientId },
        timestamp: new Date(),
      });

      // Clean up empty sessions
      if (session.clients.size === 0) {
        this.sessions.delete(sessionId);
        logger.info(`Session ${sessionId} cleaned up (no clients)`);
      }
    }
  }

  private createSession(sessionId: string): TTYSimSession {
    return {
      id: sessionId,
      currentResolution: { cols: 80, rows: 24 },
      targetResolution: { cols: 80, rows: 24 },
      clients: new Map(),
      process: null, // TODO: Initialize PTY process
      createdAt: new Date(),
      lastActivity: new Date(),
    };
  }

  public broadcastToSession(sessionId: string, message: WebSocketMessage): void {
    this.io.to(sessionId).emit('message', message);
  }

  public broadcastTTYOutput(sessionId: string, output: string): void {
    this.broadcastToSession(sessionId, {
      type: 'tty_output',
      sessionId,
      clientId: 'server',
      data: { output },
      timestamp: new Date(),
    });
  }

  public broadcastResolutionChange(sessionId: string, newResolution: Resolution): void {
    this.broadcastToSession(sessionId, {
      type: 'resolution_change',
      sessionId,
      clientId: 'server',
      data: { resolution: newResolution },
      timestamp: new Date(),
    });
  }

  public getSessions(): Map<string, TTYSimSession> {
    return this.sessions;
  }

  public getSession(sessionId: string): TTYSimSession | undefined {
    return this.sessions.get(sessionId);
  }
}