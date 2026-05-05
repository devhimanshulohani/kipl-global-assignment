import { Router } from 'express';
import * as attendanceController from './attendance.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import { PERMISSIONS } from '../../auth/permissions';

const router = Router();

router.use(requireAuth);

router.get('/today', attendanceController.today);

router.post(
  '/check-in',
  requirePermission(PERMISSIONS.ATTENDANCE_WRITE),
  attendanceController.checkIn
);
router.post(
  '/check-out',
  requirePermission(PERMISSIONS.ATTENDANCE_WRITE),
  attendanceController.checkOut
);

router.get('/me', attendanceController.listOwn);
router.get(
  '/team',
  requirePermission(PERMISSIONS.ATTENDANCE_READ_TEAM),
  attendanceController.listTeam
);
router.get(
  '/all',
  requirePermission(PERMISSIONS.ATTENDANCE_READ_ALL),
  attendanceController.listAll
);

export default router;
