import { Router } from 'express';
import adminRoutes from './admin.routes';
import passengerRoutes from './passenger.routes';
import flightRoutes from './flight.routes';
import bookingRoutes from './booking.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.use('/admin', adminRoutes);
router.use('/passengers', passengerRoutes);
router.use('/flights', flightRoutes);
router.use('/bookings', bookingRoutes);

export default router;
