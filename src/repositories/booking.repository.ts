import { BookingStatus, Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { PaginationParams } from '../utils/pagination';

export interface CreateBookingData {
  passengerId: string;
  flightId: string;
  seatNumber: number;
}

export const bookingRepository = {
  async findConfirmedSeat(
    flightId: string,
    seatNumber: number,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;

    return client.booking.findFirst({
      where: {
        flightId,
        seatNumber,
        status: BookingStatus.CONFIRMED,
      },
    });
  },

  async create(data: CreateBookingData, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;

    return client.booking.create({
      data: {
        passengerId: data.passengerId,
        flightId: data.flightId,
        seatNumber: data.seatNumber,
        status: BookingStatus.CONFIRMED,
      },
      include: {
        flight: true,
      },
    });
  },

  async findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        flight: true,
      },
    });
  },

  async findByPassengerId(
    passengerId: string,
    pagination: PaginationParams,
    status?: BookingStatus
  ) {
    const where: Prisma.BookingWhereInput = { passengerId };

    if (status) {
      where.status = status;
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          flight: {
            select: {
              id: true,
              flightNumber: true,
              airline: true,
              origin: true,
              destination: true,
              gate: true,
              departureTime: true,
              arrivalTime: true,
            },
          },
        },
        orderBy: {
          bookedAt: 'desc',
        },
        skip,
        take: pagination.limit,
      }),
      prisma.booking.count({
        where,
      }),
    ]);

    return { data, total };
  },

  async cancelBooking(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;

    return client.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
      },
      include: {
        flight: true,
      },
    });
  },

  async decrementAvailableSeats(
    flightId: string,
    tx: Prisma.TransactionClient
  ) {
    return tx.flight.update({
      where: { id: flightId },
      data: {
        availableSeats: {
          decrement: 1,
        },
      },
    });
  },

  async incrementAvailableSeats(
    flightId: string,
    tx: Prisma.TransactionClient
  ) {
    return tx.flight.update({
      where: { id: flightId },
      data: {
        availableSeats: {
          increment: 1,
        },
      },
    });
  },

  async getFlightForUpdate(
    flightId: string,
    tx: Prisma.TransactionClient
  ) {
    return tx.flight.findUnique({
      where: {
        id: flightId,
      },
    });
  },
};