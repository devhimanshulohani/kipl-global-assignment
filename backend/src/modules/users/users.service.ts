import bcrypt from 'bcrypt';
import { User } from '../../models/User';
import { Role } from '../../models/Role';
import { HttpError } from '../../utils/http-error';
import { SALT_ROUNDS } from '../../constants/auth';
import { UserRole } from '../../enums/UserRole';
import type { CreateUserInput, UpdateUserInput } from './users.validation';

export const list = async () => {
  // defaultScope on User excludes passwordHash automatically
  return User.findAll({
    order: [['id', 'ASC']],
    include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
  });
};

const roleByNameCache = new Map<string, number>();
const getRoleIdByName = async (name: UserRole): Promise<number> => {
  const cached = roleByNameCache.get(name);
  if (cached) return cached;
  const role = await Role.findOne({ where: { name } });
  if (!role) {
    throw new HttpError(500, `Role '${name}' is not seeded`);
  }
  roleByNameCache.set(name, role.id);
  return role.id;
};

// Parent-role rule: employee→manager, manager→hr, hr→null, no self.
const validateParent = async (
  childId: number | null,
  childRoleName: UserRole,
  parentId: number | null | undefined
) => {
  if (parentId == null) return;
  if (childRoleName === UserRole.HR) {
    throw new HttpError(400, 'HR users cannot have a parent');
  }
  if (childId !== null && parentId === childId) {
    throw new HttpError(400, 'A user cannot be their own parent');
  }
  const parent = await User.findByPk(parentId, {
    include: [{ model: Role, as: 'role', attributes: ['name'] }],
  });
  if (!parent) {
    throw new HttpError(400, `Parent user ${parentId} not found`);
  }
  const parentRole = parent.role?.name;
  if (childRoleName === UserRole.Employee && parentRole !== UserRole.Manager) {
    throw new HttpError(
      400,
      `Employee parent must be a manager (got ${parentRole})`
    );
  }
  if (childRoleName === UserRole.Manager && parentRole !== UserRole.HR) {
    throw new HttpError(
      400,
      `Manager parent must be HR (got ${parentRole})`
    );
  }
};

export const create = async (input: CreateUserInput) => {
  await validateParent(null, input.role, input.parentId);
  const roleId = await getRoleIdByName(input.role);
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const created = await User.create({
    username: input.username,
    passwordHash,
    roleId,
    parentId: input.parentId ?? null,
    isActive: true,
  });
  return User.findByPk(created.id, {
    include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
  });
};

export const update = async (id: number, input: UpdateUserInput) => {
  const user = await User.findByPk(id, {
    include: [{ model: Role, as: 'role', attributes: ['name'] }],
  });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  if (input.role !== undefined || input.parentId !== undefined) {
    const nextRoleName = (input.role ?? user.role?.name) as UserRole;
    const nextParentId =
      input.parentId !== undefined ? input.parentId : user.parentId;
    await validateParent(user.id, nextRoleName, nextParentId);
  }
  if (input.role !== undefined) {
    user.roleId = await getRoleIdByName(input.role);
  }
  if (input.parentId !== undefined) user.parentId = input.parentId;
  if (input.isActive !== undefined) user.isActive = input.isActive;
  await user.save();
  return User.findByPk(user.id, {
    include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
  });
};
