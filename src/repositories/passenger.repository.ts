import { prisma } from '../utils/prisma';

export interface CreatePassengerData {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
}

export const passengerRepository = {
  async create(data: CreatePassengerData) {
    return prisma.passenger.create({ data });
  },

  async findByEmail(email: string) {
    return prisma.passenger.findUnique({ where: { email } });
  },

  async findById(id: string) {
    return prisma.passenger.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },
};
