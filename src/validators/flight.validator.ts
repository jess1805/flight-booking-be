import { z } from 'zod';

export const flightSearchQuerySchema = z.object({
  origin: z.string().min(3).max(3).optional(),
  destination: z.string().min(3).max(3).optional(),
  departureDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'departureDate must be in YYYY-MM-DD format')
    .optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const flightIdParamSchema = z.object({
  id: z.string().uuid('Invalid flight ID'),
});

export const updateGateSchema = z.object({
  gate: z.string().min(1, 'Gate is required').max(10),
});

export const flightBookingsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(['CONFIRMED', 'CANCELLED']).optional(),
});
