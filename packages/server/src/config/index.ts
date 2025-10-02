import { ServerConfig } from '@ttysim/shared-types';

export const defaultServerConfig: ServerConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  maxSessions: parseInt(process.env.MAX_SESSIONS || '100', 10),
  sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600', 10), // 1 hour
  enableCors: process.env.ENABLE_CORS !== 'false',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
};

export const serverConfig: ServerConfig = { ...defaultServerConfig };