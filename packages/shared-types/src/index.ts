// Core type definitions for TTYSim system

export interface Resolution {
  cols: number;
  rows: number;
}

export interface ClientInfo {
  id: string;
  type: ClientType;
  preferredResolution: Resolution;
  currentResolution: Resolution;
  userAgent?: string;
  connectedAt: Date;
}

export type ClientType = 'web' | 'mobile' | 'desktop' | 'cli';

export interface TTYSimSession {
  id: string;
  currentResolution: Resolution;
  targetResolution: Resolution;
  clients: Map<string, ClientInfo>;
  process: any; // TODO: Replace with proper PTY process type
  createdAt: Date;
  lastActivity: Date;
}

export interface ClientInput {
  type: 'key' | 'mouse' | 'gesture' | 'virtualKeyboard' | 'button';
  data: any;
  timestamp: Date;
  clientId: string;
}

export interface TTYInput {
  type: 'key' | 'mouse';
  value: string;
  modifiers?: string[];
  position?: { x: number; y: number };
}

export interface DisplayContent {
  content: string;
  cursor?: { x: number; y: number };
  timestamp: Date;
  sessionId: string;
}

export interface WebSocketMessage {
  type: MessageType;
  sessionId: string;
  clientId: string;
  data: any;
  timestamp: Date;
}

export type MessageType =
  | 'client_join'
  | 'client_leave'
  | 'tty_output'
  | 'client_input'
  | 'resolution_change'
  | 'session_sync'
  | 'error';

export interface ResolutionNegotiationEvent {
  type: 'negotiation_start' | 'negotiation_complete' | 'reflow_start' | 'reflow_complete';
  sessionId: string;
  oldResolution?: Resolution;
  newResolution: Resolution;
  affectedClients: string[];
  timestamp: Date;
}

export interface SessionConfig {
  shell?: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  initialResolution?: Resolution;
}

export interface ServerConfig {
  port: number;
  host: string;
  maxSessions: number;
  sessionTimeout: number;
  enableCors: boolean;
  corsOrigins: string[];
}