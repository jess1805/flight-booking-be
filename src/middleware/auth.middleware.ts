import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { verifyAdminToken, AdminJwtPayload } from '../utils/jwt';
import { verifyPassengerToken, PassengerJwtPayload } from '../utils/jwt';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

export interface AdminRequest extends Request {
  admin?: AdminJwtPayload;
}

export interface PassengerRequest extends Request {
  passenger?: PassengerJwtPayload;
}

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return null;
  }
  return header.slice(7);
}

export function authenticateAdmin(req: AdminRequest, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (!token) {
    next(new UnauthorizedError('Missing or invalid authorization header'));
    return;
  }

  try {
    req.admin = verifyAdminToken(token);
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

export function authenticatePassenger(req: PassengerRequest, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (!token) {
    next(new UnauthorizedError('Missing or invalid authorization header'));
    return;
  }

  try {
    req.passenger = verifyPassengerToken(token);
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AdminRequest, _res: Response, next: NextFunction): void => {
    if (!req.admin) {
      next(new UnauthorizedError());
      return;
    }
    if (!roles.includes(req.admin.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }
    next();
  };
}
