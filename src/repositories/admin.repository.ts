import { Role } from '@prisma/client';
import { prisma } from '../utils/prisma';

export interface CreateAdminData {
  email: string;
  passwordHash: string;
  role: Role;
}

export const adminRepository = {
  async create(data: CreateAdminData) {
    return prisma.admin.create({ data });
  },

  async findByEmail(email: string) {
    return prisma.admin.findUnique({ where: { email } });
  },

  async findById(id: string) {
    return prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },
};
