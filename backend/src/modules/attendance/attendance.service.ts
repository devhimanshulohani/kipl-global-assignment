import { Attendance } from '../../models/Attendance';
import { User } from '../../models/User';
import { Role } from '../../models/Role';
import { HttpError } from '../../utils/http-error';

const todayDate = (): string => new Date().toISOString().slice(0, 10);

export const checkIn = async (userId: number) => {
  const today = todayDate();
  const existing = await Attendance.findOne({ where: { userId, date: today } });
  if (existing) {
    throw new HttpError(409, 'Already checked in for today');
  }
  return Attendance.create({
    userId,
    date: today,
    checkIn: new Date(),
    checkOut: null,
  });
};

export const checkOut = async (userId: number) => {
  const today = todayDate();
  const record = await Attendance.findOne({ where: { userId, date: today } });
  if (!record) {
    throw new HttpError(400, 'No check-in found for today');
  }
  if (record.checkOut) {
    throw new HttpError(409, 'Already checked out for today');
  }
  record.checkOut = new Date();
  await record.save();
  return record;
};

export const getToday = async (userId: number) => {
  return Attendance.findOne({ where: { userId, date: todayDate() } });
};

export const listOwn = async (userId: number) => {
  return Attendance.findAll({
    where: { userId },
    order: [['date', 'DESC']],
  });
};

export const listTeam = async (actorId: number) => {
  return Attendance.findAll({
    include: [
      {
        model: User,
        as: 'user',
        where: { parentId: actorId },
        attributes: ['id', 'username'],
      },
    ],
    order: [['date', 'DESC']],
  });
};

export const listAll = async () => {
  return Attendance.findAll({
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username'],
        include: [{ model: Role, as: 'role', attributes: ['name'] }],
      },
    ],
    order: [['date', 'DESC']],
  });
};
