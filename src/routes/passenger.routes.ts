import { Router } from 'express';
import { passengerController } from '../controllers/passenger.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticatePassenger } from '../middleware/auth.middleware';
import {
  passengerRegisterSchema,
  passengerLoginSchema,
} from '../validators/passenger.validator';

const router = Router();

router.post('/register', validate(passengerRegisterSchema), passengerController.register);
router.post('/login', validate(passengerLoginSchema), passengerController.login);
router.get('/profile', authenticatePassenger, passengerController.getProfile);

export default router;
