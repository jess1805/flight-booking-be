import { Response, NextFunction } from 'express';
import { bookingService } from '../services/booking.service';
import { PassengerRequest } from '../middleware/auth.middleware';
import { BookingStatus } from '@prisma/client';

export const bookingController = {
  async bookFlight(req: PassengerRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await bookingService.bookFlight({
        passengerId: req.passenger!.id,
        flightId: req.body.flightId,
        seatNumber: req.body.seatNumber,
      });
      res.status(201).json({ data: booking });
    } catch (error) {
      next(error);
    }
  },

  async getMyBookings(req: PassengerRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await bookingService.getMyBookings({
        passengerId: req.passenger!.id,
        page: req.query.page as number | undefined,
        limit: req.query.limit as number | undefined,
        status: req.query.status as BookingStatus | undefined,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async cancelBooking(req: PassengerRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await bookingService.cancelBooking(req.params.id as string, req.passenger!.id);
      res.status(200).json({ data: booking });
    } catch (error) {
      next(error);
    }
  },
};
