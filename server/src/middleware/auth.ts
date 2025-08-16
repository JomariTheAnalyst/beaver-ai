import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  clerkId?: string;
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // For development, we'll use a simple approach
    // In production, you'd verify the Clerk JWT token properly
    if (token === 'dev-token') {
      req.userId = 'dev-user-id';
      req.clerkId = 'dev-clerk-id';
      return next();
    }

    // Basic JWT verification for now
    // Replace this with Clerk JWT verification in production
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      req.userId = decoded.userId || decoded.sub;
      req.clerkId = decoded.clerkId || decoded.sub;
      next();
    } catch (jwtError) {
      // For development, create a mock user
      req.userId = `user_${Date.now()}`;
      req.clerkId = `clerk_${Date.now()}`;
      logger.info('Using development authentication');
      next();
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(403).json({ error: 'Invalid token' });
  }
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    authenticateToken(req, res, next);
  } else {
    next();
  }
};