import { Router } from 'express';
import * as leaveTypesController from './leave-types.controller';
import { validate } from '../../middleware/validate.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import { PERMISSIONS } from '../../auth/permissions';
import {
  createLeaveTypeSchema,
  updateLeaveTypeSchema,
} from './leave-types.validation';

const router = Router();

router.use(requireAuth);

router.get('/', leaveTypesController.list);

router.post(
  '/',
  requirePermission(PERMISSIONS.LEAVE_TYPE_MANAGE),
  validate(createLeaveTypeSchema),
  leaveTypesController.create
);
router.patch(
  '/:id',
  requirePermission(PERMISSIONS.LEAVE_TYPE_MANAGE),
  validate(updateLeaveTypeSchema),
  leaveTypesController.update
);
router.delete(
  '/:id',
  requirePermission(PERMISSIONS.LEAVE_TYPE_MANAGE),
  leaveTypesController.remove
);

export default router;
