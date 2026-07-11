import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticatePassenger } from '../middleware/auth.middleware';
import {
  bookFlightSchema,
  bookingIdParamSchema,
  bookingListQuerySchema,
} from '../validators/booking.validator';

const router = Router();

router.use(authenticatePassenger);

router.post('/', validate(bookFlightSchema), bookingController.bookFlight);
router.get('/', validate({ query: bookingListQuerySchema }), bookingController.getMyBookings);
router.patch(
  '/:id/cancel',
  validate({ params: bookingIdParamSchema }),
  bookingController.cancelBooking
);

export default router;
