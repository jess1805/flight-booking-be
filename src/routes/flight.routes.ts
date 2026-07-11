import { Router } from 'express';
import { flightController } from '../controllers/flight.controller';
import { validate } from '../middleware/validate.middleware';
import {
  authenticateAdmin,
  requireRole,
} from '../middleware/auth.middleware';
import {
  flightSearchQuerySchema,
  flightIdParamSchema,
  updateGateSchema,
  flightBookingsQuerySchema,
} from '../validators/flight.validator';
import { Role } from '@prisma/client';

const router = Router();

router.get(
  '/',
  validate({ query: flightSearchQuerySchema }),
  flightController.searchFlights
);

router.get(
  '/:id',
  validate({ params: flightIdParamSchema }),
  flightController.getFlightDetails
);

router.patch(
  '/:id/gate',
  authenticateAdmin,
  requireRole(Role.MANAGER),
  validate({ params: flightIdParamSchema, body: updateGateSchema }),
  flightController.updateGate
);

router.get(
  '/:id/bookings',
  authenticateAdmin,
  requireRole(Role.MANAGER, Role.STAFF),
  validate({ params: flightIdParamSchema, query: flightBookingsQuerySchema }),
  flightController.getFlightBookings
);

export default router;
