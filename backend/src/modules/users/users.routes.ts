import { Router } from 'express';
import * as usersController from './users.controller';
import { validate } from '../../middleware/validate.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/authorize.middleware';
import { PERMISSIONS } from '../../auth/permissions';
import { createUserSchema, updateUserSchema } from './users.validation';

const router = Router();

router.use(requireAuth, requirePermission(PERMISSIONS.USER_MANAGE));

router.get('/', usersController.list);
router.post('/', validate(createUserSchema), usersController.create);
router.patch('/:id', validate(updateUserSchema), usersController.update);

export default router;
