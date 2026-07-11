import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticateAdmin } from '../middleware/auth.middleware';
import { adminRegisterSchema, adminLoginSchema } from '../validators/admin.validator';

const router = Router();

router.post('/register', validate(adminRegisterSchema), adminController.register);
router.post('/login', validate(adminLoginSchema), adminController.login);
router.get('/profile', authenticateAdmin, adminController.getProfile);

export default router;
