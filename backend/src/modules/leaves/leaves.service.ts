import { Op } from 'sequelize';
import { LeaveRequest } from '../../models/LeaveRequest';
import { LeaveType } from '../../models/LeaveType';
import { User } from '../../models/User';
import { Role } from '../../models/Role';
import { HttpError } from '../../utils/http-error';
import { LeaveStatus } from '../../enums/LeaveStatus';
import type { ApplyInput } from './leaves.validation';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const daysInclusive = (startISO: string, endISO: string) => {
  const start = Date.UTC(
    Number(startISO.slice(0, 4)),
    Number(startISO.slice(5, 7)) - 1,
    Number(startISO.slice(8, 10))
  );
  const end = Date.UTC(
    Number(endISO.slice(0, 4)),
    Number(endISO.slice(5, 7)) - 1,
    Number(endISO.slice(8, 10))
  );
  return Math.floor((end - start) / MS_PER_DAY) + 1;
};

export const apply = async (userId: number, input: ApplyInput) => {
  if (input.startDate > input.endDate) {
    throw new HttpError(400, 'startDate must be on or before endDate');
  }
  const lt = await LeaveType.findByPk(input.leaveTypeId);
  if (!lt) {
    throw new HttpError(400, 'Invalid leaveTypeId');
  }

  const requestedDays = daysInclusive(input.startDate, input.endDate);
  const year = input.startDate.slice(0, 4);
  const existing = await LeaveRequest.findAll({
    where: {
      userId,
      leaveTypeId: input.leaveTypeId,
      status: { [Op.in]: [LeaveStatus.Pending, LeaveStatus.Approved] },
      startDate: { [Op.between]: [`${year}-01-01`, `${year}-12-31`] },
    },
  });
  const usedDays = existing.reduce(
    (sum, r) => sum + daysInclusive(r.startDate, r.endDate),
    0
  );
  if (usedDays + requestedDays > lt.annualQuota) {
    throw new HttpError(
      400,
      `Exceeds annual quota for ${lt.name}: ${usedDays} day(s) already used (incl. pending) + ${requestedDays} requested > ${lt.annualQuota} allowed`
    );
  }

  return LeaveRequest.create({
    userId,
    leaveTypeId: input.leaveTypeId,
    startDate: input.startDate,
    endDate: input.endDate,
    reason: input.reason,
  });
};

export const listOwn = async (userId: number) => {
  return LeaveRequest.findAll({
    where: { userId },
    include: [{ model: LeaveType, as: 'leaveType' }],
    order: [['createdAt', 'DESC']],
  });
};

// Pending requests submitted by anyone whose parent is the caller — works for both Manager and HR.
export const listPending = async (actorId: number) => {
  return LeaveRequest.findAll({
    where: { status: LeaveStatus.Pending },
    include: [
      {
        model: User,
        as: 'requester',
        where: { parentId: actorId },
        attributes: ['id', 'username'],
        include: [{ model: Role, as: 'role', attributes: ['name'] }],
      },
      { model: LeaveType, as: 'leaveType' },
    ],
    order: [['createdAt', 'ASC']],
  });
};

export const listAll = async () => {
  return LeaveRequest.findAll({
    include: [
      {
        model: User,
        as: 'requester',
        attributes: ['id', 'username'],
        include: [{ model: Role, as: 'role', attributes: ['name'] }],
      },
      { model: LeaveType, as: 'leaveType' },
    ],
    order: [['createdAt', 'DESC']],
  });
};

const act = async (
  status: LeaveStatus,
  leaveId: number,
  actor: User,
  remark: string
) => {
  const leave = await LeaveRequest.findByPk(leaveId, {
    include: [{ model: User, as: 'requester' }],
  });
  if (!leave) {
    throw new HttpError(404, 'Leave request not found');
  }
  if (leave.status !== LeaveStatus.Pending) {
    throw new HttpError(409, `Already ${leave.status}`);
  }
  const requester = leave.requester;
  if (!requester) {
    throw new HttpError(500, 'Requester not loaded');
  }

  // leave:approve is gated at the route; the structural rule below routes employee→manager and manager→HR via parent_id.
  if (requester.id === actor.id) {
    throw new HttpError(403, 'Cannot act on own leave request');
  }
  if (requester.parentId !== actor.id) {
    throw new HttpError(
      403,
      'You are not the assigned approver for this request'
    );
  }

  leave.status = status;
  leave.remark = remark;
  leave.actedBy = actor.id;
  leave.actedAt = new Date();
  await leave.save();
  return leave;
};

export const approve = (leaveId: number, actor: User, remark: string) =>
  act(LeaveStatus.Approved, leaveId, actor, remark);

export const reject = (leaveId: number, actor: User, remark: string) =>
  act(LeaveStatus.Rejected, leaveId, actor, remark);

export const cancel = async (leaveId: number, userId: number) => {
  const leave = await LeaveRequest.findByPk(leaveId);
  if (!leave) {
    throw new HttpError(404, 'Leave request not found');
  }
  if (leave.userId !== userId) {
    throw new HttpError(403, 'Not your leave request');
  }
  if (leave.status !== LeaveStatus.Pending) {
    throw new HttpError(409, 'Cannot cancel after manager has acted');
  }
  await leave.destroy();
};
