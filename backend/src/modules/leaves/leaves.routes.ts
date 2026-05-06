import { Router } from 'express';
import * as leavesController from './leaves.controller';
import { validate } from '../../middleware/validate.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import { PERMISSIONS } from '../../auth/permissions';
import { applySchema, actionSchema } from './leaves.validation';

const router = Router();

router.use(requireAuth);

router.post(
  '/',
  requirePermission(PERMISSIONS.LEAVE_APPLY),
  validate(applySchema),
  leavesController.apply
);
router.get('/me', leavesController.listOwn);

// Both Manager and HR consume /pending — service scopes by parent_id.
router.get(
  '/pending',
  requirePermission(PERMISSIONS.LEAVE_READ_PENDING),
  leavesController.listPending
);
router.get(
  '/team',
  requirePermission(PERMISSIONS.LEAVE_READ_PENDING),
  leavesController.listTeam
);
router.get(
  '/all',
  requirePermission(PERMISSIONS.LEAVE_READ_ALL),
  leavesController.listAll
);

router.post(
  '/:id/approve',
  requirePermission(PERMISSIONS.LEAVE_APPROVE),
  validate(actionSchema),
  leavesController.approve
);
router.post(
  '/:id/reject',
  requirePermission(PERMISSIONS.LEAVE_APPROVE),
  validate(actionSchema),
  leavesController.reject
);

router.delete(
  '/:id',
  requirePermission(PERMISSIONS.LEAVE_CANCEL_OWN),
  leavesController.cancel
);

export default router;
