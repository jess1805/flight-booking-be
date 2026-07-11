import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { adminRepository } from '../repositories/admin.repository';
import { signAdminToken } from '../utils/jwt';
import { ConflictError, NotFoundError, UnauthorizedError } from '../utils/errors';

const SALT_ROUNDS = 12;

export interface AdminRegisterInput {
  email: string;
  password: string;
  role: Role;
}

export interface AdminLoginInput {
  email: string;
  password: string;
}

function sanitizeAdmin(admin: { id: string; email: string; role: Role; createdAt: Date; updatedAt: Date }) {
  return {
    id: admin.id,
    email: admin.email,
    role: admin.role,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };
}

export const adminService = {
  async register(input: AdminRegisterInput) {
    const existing = await adminRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('An admin with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const admin = await adminRepository.create({
      email: input.email,
      passwordHash,
      role: input.role,
    });

    const token = signAdminToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });

    return {
      token,
      admin: sanitizeAdmin(admin),
    };
  },

  async login(input: AdminLoginInput) {
    const admin = await adminRepository.findByEmail(input.email);
    if (!admin) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await bcrypt.compare(input.password, admin.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = signAdminToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });

    return {
      token,
      admin: sanitizeAdmin(admin),
    };
  },

  async getProfile(adminId: string) {
    const admin = await adminRepository.findById(adminId);
    if (!admin) {
      throw new NotFoundError('Admin');
    }
    return admin;
  },
};
