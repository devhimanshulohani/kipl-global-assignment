import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';
import { Session } from '../models/Session';
import { defineAbilitiesFor } from '../auth/abilities';
import { SESSION_COOKIE_NAME, SESSION_TTL_MS } from '../constants/auth';

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const session = await Session.findByPk(token);
  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  const inactiveMs =
    Date.now() - new Date(session.lastActivityAt).getTime();
  if (inactiveMs > SESSION_TTL_MS) {
    await session.destroy();
    return res
      .status(401)
      .json({ message: 'Session expired due to inactivity' });
  }

  const user = await User.findByPk(session.userId, {
    include: [
      {
        model: Role,
        as: 'role',
        include: [{ model: Permission, as: 'permissions' }],
      },
    ],
  });
  if (!user || !user.isActive) {
    await session.destroy();
    return res.status(401).json({ message: 'User not found or inactive' });
  }

  session.lastActivityAt = new Date();
  await session.save();

  req.user = user;
  req.ability = defineAbilitiesFor(user);
  next();
};
