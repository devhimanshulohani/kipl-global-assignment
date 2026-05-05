import { Request, Response } from 'express';
import * as attendanceService from './attendance.service';

export const checkIn = async (req: Request, res: Response) => {
  const record = await attendanceService.checkIn(req.user!.id);
  res.status(201).json(record);
};

export const checkOut = async (req: Request, res: Response) => {
  const record = await attendanceService.checkOut(req.user!.id);
  res.json(record);
};

export const today = async (req: Request, res: Response) => {
  const record = await attendanceService.getToday(req.user!.id);
  res.json(record);
};

export const listOwn = async (req: Request, res: Response) => {
  const records = await attendanceService.listOwn(req.user!.id);
  res.json(records);
};

export const listTeam = async (req: Request, res: Response) => {
  const records = await attendanceService.listTeam(req.user!.id);
  res.json(records);
};

export const listAll = async (_req: Request, res: Response) => {
  const records = await attendanceService.listAll();
  res.json(records);
};
