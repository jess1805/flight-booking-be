import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { prisma } from './utils/prisma';

const app = createApp();

async function start() {
  try {
    await prisma.$connect();
    app.listen(config.PORT, () => {
      logger.info('Server started', {
        port: config.PORT,
        env: config.NODE_ENV,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    process.exit(1);
  }
}

start();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
