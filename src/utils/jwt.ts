import jwt from 'jsonwebtoken';
import { config } from '../config';
import { Role } from '@prisma/client';
import { UnauthorizedError } from './errors';

export interface AdminJwtPayload {
  id: string;
  email: string;
  role: Role;
}

export interface PassengerJwtPayload {
  id: string;
  email: string;
  type: 'PASSENGER';
}

export function signAdminToken(payload: AdminJwtPayload): string {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function signPassengerToken(payload: PassengerJwtPayload): string {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAdminToken(token: string): AdminJwtPayload {
  const payload = jwt.verify(token, config.JWT_SECRET) as AdminJwtPayload & { type?: string };
  if (payload.type === 'PASSENGER') {
    throw new UnauthorizedError('Invalid admin token');
  }
  return { id: payload.id, email: payload.email, role: payload.role };
}

export function verifyPassengerToken(token: string): PassengerJwtPayload {
  const payload = jwt.verify(token, config.JWT_SECRET) as PassengerJwtPayload;
  if (payload.type !== 'PASSENGER') {
    throw new UnauthorizedError('Invalid passenger token');
  }
  return { id: payload.id, email: payload.email, type: payload.type };
}
