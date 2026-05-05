import { LeaveType } from '../../models/LeaveType';
import { HttpError } from '../../utils/http-error';
import type {
  CreateLeaveTypeInput,
  UpdateLeaveTypeInput,
} from './leave-types.validation';

export const list = async () => {
  return LeaveType.findAll({ order: [['id', 'ASC']] });
};

export const create = async (input: CreateLeaveTypeInput) => {
  return LeaveType.create({ name: input.name, annualQuota: input.annualQuota });
};

export const update = async (id: number, input: UpdateLeaveTypeInput) => {
  const lt = await LeaveType.findByPk(id);
  if (!lt) {
    throw new HttpError(404, 'Leave type not found');
  }
  if (input.name !== undefined) lt.name = input.name;
  if (input.annualQuota !== undefined) lt.annualQuota = input.annualQuota;
  await lt.save();
  return lt;
};

export const remove = async (id: number) => {
  const lt = await LeaveType.findByPk(id);
  if (!lt) {
    throw new HttpError(404, 'Leave type not found');
  }
  await lt.destroy();
};
