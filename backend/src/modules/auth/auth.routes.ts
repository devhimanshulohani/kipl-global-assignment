import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { loginRateLimit } from '../../middleware/rate-limit.middleware';
import { loginSchema } from './auth.validation';

const router = Router();

router.post(
  '/login',
  loginRateLimit,
  validate(loginSchema),
  authController.login
);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.me);

export default router;
