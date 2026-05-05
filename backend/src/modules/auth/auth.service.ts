import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { User } from '../../models/User';
import { Role } from '../../models/Role';
import { Permission } from '../../models/Permission';
import { Session } from '../../models/Session';
import { HttpError } from '../../utils/http-error';
import type { LoginInput } from './auth.validation';

export const login = async (input: LoginInput) => {
  const user = await User.scope('withPassword').findOne({
    where: { username: input.username },
    include: [
      {
        model: Role,
        as: 'role',
        include: [{ model: Permission, as: 'permissions' }],
      },
    ],
  });
  if (!user) {
    throw new HttpError(401, 'Invalid credentials');
  }
  if (!user.isActive) {
    throw new HttpError(403, 'Account is deactivated');
  }
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const session = await Session.create({
    id: randomUUID(),
    userId: user.id,
    lastActivityAt: new Date(),
  });

  return {
    user: serializeAuthUser(user),
    token: session.id,
  };
};

export const logout = async (token: string) => {
  await Session.destroy({ where: { id: token } });
};

export const serializeAuthUser = (user: User) => ({
  id: user.id,
  username: user.username,
  role: user.role
    ? { id: user.role.id, name: user.role.name }
    : null,
  permissions: user.role?.permissions?.map((p) => p.name) ?? [],
});
