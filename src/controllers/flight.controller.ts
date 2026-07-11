import { Response, NextFunction } from 'express';
import { flightService } from '../services/flight.service';
import { AdminRequest } from '../middleware/auth.middleware';
import { BookingStatus } from '@prisma/client';

export const flightController = {
  async searchFlights(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await flightService.searchFlights({
        origin: req.query.origin as string | undefined,
        destination: req.query.destination as string | undefined,
        departureDate: req.query.departureDate as string | undefined,
        page: req.query.page as number | undefined,
        limit: req.query.limit as number | undefined,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getFlightDetails(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const flight = await flightService.getFlightDetails(req.params.id as string);
      res.status(200).json({ data: flight });
    } catch (error) {
      next(error);
    }
  },

  async updateGate(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const flight = await flightService.updateGate(req.params.id as string, req.body.gate);
      res.status(200).json({ data: flight });
    } catch (error) {
      next(error);
    }
  },

  async getFlightBookings(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await flightService.getFlightBookings({
        flightId: req.params.id as string,
        page: req.query.page as number | undefined,
        limit: req.query.limit as number | undefined,
        status: req.query.status as BookingStatus | undefined,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
