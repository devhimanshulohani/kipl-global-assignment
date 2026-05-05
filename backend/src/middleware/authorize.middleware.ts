import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '@casl/ability';
import type { Actions, Subjects } from '../auth/abilities';
import type { Permission } from '../auth/permissions';

export const requireAbility =
  (action: Actions, subject: Subjects) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.ability) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    try {
      ForbiddenError.from(req.ability).throwUnlessCan(action, subject);
      next();
    } catch (err: any) {
      return res.status(403).json({ message: err.message || 'Forbidden' });
    }
  };

// Action gate. Permission strings are typed against PERMISSIONS so typos are compile errors.
export const requirePermission =
  (...required: Permission[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const granted = new Set<string>(
      req.user.role?.permissions?.map((p) => p.name) ?? []
    );
    const missing = required.filter((p) => !granted.has(p));
    if (missing.length > 0) {
      return res.status(403).json({
        message: `Missing required permission: ${missing.join(', ')}`,
      });
    }
    next();
  };
