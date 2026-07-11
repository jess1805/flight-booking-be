import { BookingStatus } from '@prisma/client';
import { flightRepository, flightBookingRepository } from '../repositories/flight.repository';
import { buildPaginatedResult, parsePagination } from '../utils/pagination';
import { NotFoundError } from '../utils/errors';

export interface FlightSearchInput {
  origin?: string;
  destination?: string;
  departureDate?: string;
  page?: number;
  limit?: number;
}

export interface FlightBookingsInput {
  flightId: string;
  page?: number;
  limit?: number;
  status?: BookingStatus;
}

export const flightService = {
  async searchFlights(input: FlightSearchInput) {
    const pagination = parsePagination(
      input.page?.toString(),
      input.limit?.toString()
    );

    const { data, total } = await flightRepository.findMany(
      {
        origin: input.origin,
        destination: input.destination,
        departureDate: input.departureDate,
      },
      pagination
    );

    return buildPaginatedResult(data, total, pagination.page, pagination.limit);
  },

  async getFlightDetails(flightId: string) {
    const flight = await flightRepository.findById(flightId);
    if (!flight) {
      throw new NotFoundError('Flight');
    }
    return flight;
  },

  async updateGate(flightId: string, gate: string) {
    const flight = await flightRepository.findById(flightId);
    if (!flight) {
      throw new NotFoundError('Flight');
    }

    return flightRepository.updateGate(flightId, gate);
  },

  async getFlightBookings(input: FlightBookingsInput) {
    const flight = await flightRepository.findById(input.flightId);
    if (!flight) {
      throw new NotFoundError('Flight');
    }

    const pagination = parsePagination(
      input.page?.toString(),
      input.limit?.toString()
    );

    const { data, total } = await flightBookingRepository.findByFlightId(
      input.flightId,
      pagination,
      input.status
    );

    return buildPaginatedResult(data, total, pagination.page, pagination.limit);
  },
};
