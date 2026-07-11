import { Response, NextFunction } from 'express';
import { passengerService } from '../services/passenger.service';
import { PassengerRequest } from '../middleware/auth.middleware';

export const passengerController = {
  async register(req: PassengerRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await passengerService.register(req.body);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  },

  async login(req: PassengerRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await passengerService.login(req.body);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req: PassengerRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await passengerService.getProfile(req.passenger!.id);
      res.status(200).json({ data: profile });
    } catch (error) {
      next(error);
    }
  },
};
