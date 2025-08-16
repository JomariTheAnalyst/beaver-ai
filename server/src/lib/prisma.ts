import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Test database connection
prisma.$connect()
  .then(() => {
    logger.info('Connected to database successfully');
  })
  .catch((error) => {
    logger.error('Failed to connect to database:', error);
  });

export default prisma;