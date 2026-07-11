import { z } from 'zod';

export const bookFlightSchema = z.object({
  flightId: z.string().uuid('Invalid flight ID'),
  seatNumber: z.coerce.number().int().positive('Seat number must be a positive integer'),
});

export const bookingIdParamSchema = z.object({
  id: z.string().uuid('Invalid booking ID'),
});

export const bookingListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(['CONFIRMED', 'CANCELLED']).optional(),
});
