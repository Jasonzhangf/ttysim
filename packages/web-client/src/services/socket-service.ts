import { io, Socket } from 'socket.io-client';
import {
  WebSocketMessage,
  ClientInfo,
  ClientType,
  Resolution,
  TTYSimSession,
} from '@ttysim/shared-types';

export class SocketService {
  private socket: Socket | null = null;
  private sessionId: string | null = null;
  private clientId: string | null = null;

  connect(serverUrl: string = 'http://localhost:3000'): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(serverUrl, {
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Connected to TTYSim server');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from TTYSim server');
      });

      this.socket.on('message', (message: WebSocketMessage) => {
        this.handleMessage(message);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.sessionId = null;
    this.clientId = null;
  }

  joinSession(
    sessionId: string,
    clientType: ClientType,
    preferredResolution: Resolution
  ): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    this.sessionId = sessionId;
    this.clientId = this.generateClientId();

    const clientInfo: ClientInfo = {
      id: this.clientId,
      type: clientType,
      preferredResolution,
      currentResolution: preferredResolution,
      userAgent: navigator.userAgent,
      connectedAt: new Date(),
    };

    this.socket.emit('client_join', {
      sessionId,
      clientInfo,
    });
  }

  sendInput(input: string): void {
    if (!this.socket || !this.sessionId || !this.clientId) {
      throw new Error('Not connected to session');
    }

    const message: WebSocketMessage = {
      type: 'client_input',
      sessionId: this.sessionId,
      clientId: this.clientId,
      data: { input },
      timestamp: new Date(),
    };

    this.socket.emit('client_input', message);
  }

  private handleMessage(message: WebSocketMessage): void {
    // Emit events for different message types
    const event = new CustomEvent(`ttysim:${message.type}`, {
      detail: message,
    });
    window.dispatchEvent(event);
  }

  private generateClientId(): string {
    return `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getCurrentSession(): { sessionId: string | null; clientId: string | null } {
    return { sessionId: this.sessionId, clientId: this.clientId };
  }
}

// Singleton instance
export const socketService = new SocketService();