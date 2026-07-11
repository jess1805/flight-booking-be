import { BookingStatus, Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { PaginationParams } from '../utils/pagination';

export interface FlightSearchFilters {
  origin?: string;
  destination?: string;
  departureDate?: string;
}

export const flightRepository = {
  async findMany(filters: FlightSearchFilters, pagination: PaginationParams) {
    const where: Prisma.FlightWhereInput = {};

    if (filters.origin) {
      where.origin = { equals: filters.origin.toUpperCase(), mode: 'insensitive' };
    }
    if (filters.destination) {
      where.destination = { equals: filters.destination.toUpperCase(), mode: 'insensitive' };
    }
    if (filters.departureDate) {
      const start = new Date(`${filters.departureDate}T00:00:00.000Z`);
      const end = new Date(`${filters.departureDate}T23:59:59.999Z`);
      where.departureTime = { gte: start, lte: end };
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [data, total] = await Promise.all([
      prisma.flight.findMany({
        where,
        orderBy: { departureTime: 'asc' },
        skip,
        take: pagination.limit,
      }),
      prisma.flight.count({ where }),
    ]);

    return { data, total };
  },

  async findById(id: string) {
    return prisma.flight.findUnique({ where: { id } });
  },

  async updateGate(id: string, gate: string) {
    return prisma.flight.update({
      where: { id },
      data: { gate },
    });
  },
};

export const flightBookingRepository = {
  async findByFlightId(
    flightId: string,
    pagination: PaginationParams,
    status?: BookingStatus
  ) {
    const where: Prisma.BookingWhereInput = { flightId };
    if (status) {
      where.status = status;
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          passenger: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: { bookedAt: 'desc' },
        skip,
        take: pagination.limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return { data, total };
  },
};
