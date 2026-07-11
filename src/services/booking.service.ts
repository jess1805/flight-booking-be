import { BookingStatus } from '@prisma/client';
import { bookingRepository } from '../repositories/booking.repository';
import { flightRepository } from '../repositories/flight.repository';
import { prisma } from '../utils/prisma';
import { buildPaginatedResult, parsePagination } from '../utils/pagination';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../utils/errors';

export interface BookFlightInput {
  passengerId: string;
  flightId: string;
  seatNumber: number;
}

export interface MyBookingsInput {
  passengerId: string;
  page?: number;
  limit?: number;
  status?: BookingStatus;
}

export const bookingService = {
  async bookFlight(input: BookFlightInput) {
    const flight = await flightRepository.findById(input.flightId);
    if (!flight) {
      throw new NotFoundError('Flight');
    }

    if (flight.departureTime <= new Date()) {
      throw new ConflictError('Cannot book a flight that has already departed');
    }

    if (input.seatNumber < 1 || input.seatNumber > flight.totalSeats) {
      throw new ValidationError(
        `Seat number must be between 1 and ${flight.totalSeats}`
      );
    }

    if (flight.availableSeats <= 0) {
      throw new ConflictError('No seats available on this flight');
    }

    const existingSeat = await bookingRepository.findConfirmedSeat(
      input.flightId,
      input.seatNumber
    );
    if (existingSeat) {
      throw new ConflictError('This seat is already booked');
    }

    const booking = await prisma.$transaction(async (tx) => {
      const currentFlight = await bookingRepository.getFlightForUpdate(input.flightId, tx);
      if (!currentFlight) {
        throw new NotFoundError('Flight');
      }

      if (currentFlight.availableSeats <= 0) {
        throw new ConflictError('No seats available on this flight');
      }

      const seatTaken = await bookingRepository.findConfirmedSeat(
        input.flightId,
        input.seatNumber,
        tx
      );
      
      if (seatTaken) {
        throw new ConflictError('This seat is already booked');
      }

      const created = await bookingRepository.create(
        {
          passengerId: input.passengerId,
          flightId: input.flightId,
          seatNumber: input.seatNumber,
        },
        tx
      );

      await bookingRepository.decrementAvailableSeats(input.flightId, tx);

      return created;
    });

    return booking;
  },

  async getMyBookings(input: MyBookingsInput) {
    const pagination = parsePagination(
      input.page?.toString(),
      input.limit?.toString()
    );

    const { data, total } = await bookingRepository.findByPassengerId(
      input.passengerId,
      pagination,
      input.status
    );

    return buildPaginatedResult(data, total, pagination.page, pagination.limit);
  },

  async cancelBooking(bookingId: string, passengerId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking');
    }

    if (booking.passengerId !== passengerId) {
      throw new ForbiddenError('You can only cancel your own bookings');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new ConflictError('Booking is already cancelled');
    }

    const cancelled = await prisma.$transaction(async (tx) => {
      const updated = await bookingRepository.cancelBooking(bookingId, tx);
      await bookingRepository.incrementAvailableSeats(booking.flightId, tx);
      return updated;
    });

    return cancelled;
  },
};
