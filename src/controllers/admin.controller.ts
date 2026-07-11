import { Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { AdminRequest } from '../middleware/auth.middleware';

export const adminController = {
  async register(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminService.register(req.body);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  },

  async login(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminService.login(req.body);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await adminService.getProfile(req.admin!.id);
      res.status(200).json({ data: profile });
    } catch (error) {
      next(error);
    }
  },
};
