import { createServer } from 'http';
import fastify from 'fastify';
import { WebSocketManager } from './core/websocket-manager';
import { logger } from './core/logger';
import { serverConfig } from './config';

async function startServer(): Promise<void> {
  // Create Fastify app
  const app = fastify({
    logger: false, // Use our custom logger
  });

  // Health check endpoint
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Info endpoint
  app.get('/info', async () => {
    return {
      name: 'TTYSim Server',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  });

  // Create HTTP server
  const server = createServer(app.server);

  // Initialize WebSocket manager
  const wsManager = new WebSocketManager(server);

  try {
    // Start server
    await app.listen({
      port: serverConfig.port,
      host: serverConfig.host,
    });

    logger.info(`TTYSim server started on ${serverConfig.host}:${serverConfig.port}`);
    logger.info(`WebSocket server ready for connections`);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down server...');
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

// Start the server
startServer().catch((error) => {
  logger.error('Server startup failed:', error);
  process.exit(1);
});